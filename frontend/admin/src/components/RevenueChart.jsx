import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import * as api from "../services/api";
import * as blockchain from "../services/blockchain";

import {
  formatCrypto,
  formatCompactNumber,
  formatDateShort,
  weiToPol,
} from "../services/formatters";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function RevenueChart() {
  const [timeframe, setTimeframe] = useState("week");
  const [chartData, setChartData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ============================================================
     FETCH DATA
     ============================================================ */
  async function loadRevenue() {
    try {
      setLoading(true);

      // Off-chain analytics depuis l'API
      const response = await api.getAnalytics("revenue", { timeframe });
      console.log("💰 Revenue API response:", response);

      // Vérifier si les données sont valides
      // Backend retourne: { success, data: [{date, platform, restaurant, deliverer, total}], totals }
      if (!response || !response.data || response.data.length === 0) {
        console.log("❌ Pas de données revenue");
        setChartData(null);
        setBreakdown(null);
        setComparison(null);
        return;
      }

      // Extraire les données et convertir wei → POL
      const labels = response.data.map((item) => formatDateShort(item.date));
      const datasetPlatform = response.data.map((item) => weiToPol(item.platform));
      const datasetRestaurants = response.data.map((item) => weiToPol(item.restaurant));
      const datasetDeliverers = response.data.map((item) => weiToPol(item.deliverer));

      console.log("📈 Revenue Labels:", labels);
      console.log("📈 Platform:", datasetPlatform);

      const formatted = {
        labels,
        datasets: [
          {
            label: "Plateforme (10%)",
            data: datasetPlatform,
            borderColor: "#10B981",
            backgroundColor: "rgba(16,185,129,0.25)",
            tension: 0.3,
            fill: true,
          },
          {
            label: "Restaurants (70%)",
            data: datasetRestaurants,
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59,130,246,0.25)",
            tension: 0.3,
            fill: true,
          },
          {
            label: "Livreurs (20%)",
            data: datasetDeliverers,
            borderColor: "#F59E0B",
            backgroundColor: "rgba(245,158,11,0.25)",
            tension: 0.3,
            fill: true,
          },
        ],
      };

      console.log("✅ Revenue chart data formatted:", formatted);
      setChartData(formatted);

      // Totaux pour la répartition
      setBreakdown({
        platform: 10,
        restaurant: 70,
        deliverer: 20,
      });

      setComparison(null);
    } catch (err) {
      console.error("Erreur revenue chart:", err);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRevenue();
  }, [timeframe]);

  /* ============================================================
     CHART OPTIONS
     ============================================================ */
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${formatCrypto(context.raw, "POL", 6)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => formatCrypto(v, "POL", 6),
        },
      },
    },
  };

  /* ============================================================
     RENDER
     ============================================================ */
  console.log("🔄 RevenueChart render - loading:", loading, "chartData:", !!chartData);

  return (
    <div className="bg-white border shadow rounded-xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Évolution des Revenus</h3>

        <div className="flex gap-2">
          {["day", "week", "month"].map((p) => (
            <button
              key={p}
              onClick={() => setTimeframe(p)}
              className={`px-3 py-1 rounded-lg border transition ${
                timeframe === p
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {p === "day" ? "Jour" : p === "week" ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chargement...
        </div>
      ) : chartData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart */}
          <div className="lg:col-span-2" style={{ height: "300px", width: "100%" }}>
            <Line data={chartData} options={options} />
          </div>

          {/* Breakdown */}
          <div className="p-4 border rounded-lg bg-gray-50">

            <h4 className="font-semibold mb-3">Répartition</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Restaurants</span>
                <strong>{breakdown?.restaurant || 70}%</strong>
              </div>

              <div className="flex justify-between">
                <span>Livreurs</span>
                <strong>{breakdown?.deliverer || 20}%</strong>
              </div>

              <div className="flex justify-between">
                <span>Plateforme</span>
                <strong>{breakdown?.platform || 10}%</strong>
              </div>
            </div>

            {comparison && (
              <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
                <h5 className="font-medium mb-1">Comparatif</h5>
                <div className="text-sm text-gray-700">
                  Variation :{" "}
                  <span
                    className={
                      comparison.change >= 0
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {comparison.change > 0 ? "+" : ""}
                    {comparison.change}%
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          Aucune donnée disponible
        </div>
      )}
    </div>
  );
}
