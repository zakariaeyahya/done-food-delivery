/**
 * Composant EarningsTracker - Suivi des gains livreur
 * @fileoverview Affiche les gains par période avec graphiques
 */

import { useState, useEffect } from "react";
import api from "../services/api";
import blockchain from "../services/blockchain";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

/**
 * Composant EarningsTracker
 * @param {string} address - Adresse wallet du livreur
 */
function EarningsTracker({ address }) {
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    pending: 0,
    total: 0,
  });

  const [period, setPeriod] = useState("week"); // période par défaut
  const [deliveriesCount, setDeliveriesCount] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  /** Charger les données earnings + events blockchain */
  useEffect(() => {
    if (!address) return;

    fetchEarnings();
    fetchEarningsEvents();
  }, [address, period]);

  /** Récupérer earnings backend */
  async function fetchEarnings() {
    setLoading(true);

    try {
      const todayResponse = await api.getEarnings(address, "today");
      const weekResponse = await api.getEarnings(address, "week");
      const monthResponse = await api.getEarnings(address, "month");

      // Extraire les données depuis la réponse structurée du backend
      const todayData = todayResponse?.earnings || {};
      const weekData = weekResponse?.earnings || {};
      const monthData = monthResponse?.earnings || {};

      setEarnings({
        today: Number(todayData?.totalEarnings || 0),
        week: Number(weekData?.totalEarnings || 0),
        month: Number(monthData?.totalEarnings || 0),
        pending: 0, // pattern PUSH → aucun retrait manuel
        total: Number(monthData?.totalEarnings || 0),
      });

      setDeliveriesCount(weekData?.completedDeliveries || 0);
      console.log("[EarningsTracker] 📊 Earnings chargés:", { today: todayData, week: weekData, month: monthData });
    } catch (err) {
      console.error("Erreur récupération earnings :", err);
    } finally {
      setLoading(false);
    }
  }

  /** Récupérer events de gains blockchain */
  async function fetchEarningsEvents() {
    try {
      const { events } = await blockchain.getEarningsEvents(address);

      const labels = events.map((e) =>
        new Date(e.timestamp * 1000).toLocaleDateString()
      );

      const values = events.map((e) => e.delivererAmount);

      setChartData({
        labels,
        datasets: [
          {
            label: "Gains (POL)",
            data: values,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            pointRadius: 4,
            tension: 0.3,
          },
        ],
      });
    } catch (err) {
      console.error("Erreur récupération events earnings :", err);
    }
  }

  /** Bouton Retirer (non utilisé dans pattern PUSH) */
  function handleWithdraw() {
    alert("Les paiements sont automatiques (pattern PUSH). Aucun retrait nécessaire.");
  }

  return (
    <div className="earnings-tracker card">
      <h2>Mes Gains</h2>

      {/* Tabs période */}
      <div className="period-tabs">
        <button
          onClick={() => setPeriod("today")}
          className={period === "today" ? "active" : ""}
        >
          Aujourd'hui
        </button>

        <button
          onClick={() => setPeriod("week")}
          className={period === "week" ? "active" : ""}
        >
          Semaine
        </button>

        <button
          onClick={() => setPeriod("month")}
          className={period === "month" ? "active" : ""}
        >
          Mois
        </button>
      </div>

      {/* Affichage gains */}
      <div className="earnings-display">
        <div className="earnings-value">
          {Number(earnings[period] || 0).toFixed(5)} POL
        </div>

        <p>Livraisons: {deliveriesCount}</p>
      </div>

      {/* Graphique */}
      {chartData && (
        <div className="chart">
          <Line data={chartData} />
        </div>
      )}

      {/* Paiements en attente */}
      {earnings.pending > 0 && (
        <div className="pending-payments">
          <p>En attente : {earnings.pending} POL</p>
          <button onClick={handleWithdraw}>Retirer</button>
        </div>
      )}
    </div>
  );
}

export default EarningsTracker;
