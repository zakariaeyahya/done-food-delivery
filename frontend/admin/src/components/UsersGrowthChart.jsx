import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { getAnalytics } from "../services/api";
import {
  formatNumber,
  formatPercentage,
} from "../services/formatters";

// Register Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function UsersGrowthChart() {
  const [timeframe, setTimeframe] = useState("month"); // month or year
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ============================================================
     FETCH ANALYTICS
     ============================================================ */
  async function loadUsersAnalytics() {
    try {
      setLoading(true);

      const response = await getAnalytics("users", { timeframe });
      console.log("📊 Users Analytics API response:", response);

      // Backend retourne: { success, data: { growth, activeToday, topSpenders } }
      if (!response || !response.data) {
        console.log("❌ Pas de données users");
        setChartData(null);
        setSummary(null);
        return;
      }

      const { growth, activeToday } = response.data;

      // Générer les labels (4 derniers mois)
      const labels = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        labels.push(d.toLocaleDateString("fr-FR", { month: "short" }));
      }

      // Les données growth sont dans l'ordre inverse (du plus récent au plus ancien)
      const clientsData = growth?.clients ? [...growth.clients].reverse() : [0, 0, 0, 0];
      const restaurantsData = growth?.restaurants ? [...growth.restaurants].reverse() : [0, 0, 0, 0];
      const deliverersData = growth?.deliverers ? [...growth.deliverers].reverse() : [0, 0, 0, 0];

      const formatted = {
        labels,
        datasets: [
          {
            label: "Clients",
            data: clientsData,
            backgroundColor: "rgba(59,130,246,0.7)", // Blue
          },
          {
            label: "Restaurants",
            data: restaurantsData,
            backgroundColor: "rgba(16,185,129,0.7)", // Green
          },
          {
            label: "Livreurs",
            data: deliverersData,
            backgroundColor: "rgba(249,115,22,0.7)", // Orange
          },
        ],
      };

      setChartData(formatted);

      // KPIs basés sur activeToday
      const totalActiveToday = (activeToday?.clients || 0) + (activeToday?.restaurants || 0) + (activeToday?.deliverers || 0);
      setSummary({
        activeDaily: totalActiveToday,
        activeWeekly: totalActiveToday * 3, // Estimation
        activeMonthly: totalActiveToday * 10, // Estimation
        growth: 0, // Pas de calcul de croissance disponible
      });
    } catch (err) {
      console.error("Users analytics error:", err);
      setChartData(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsersAnalytics();
  }, [timeframe]);

  /* ============================================================
     CHART OPTIONS
     ============================================================ */
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => formatNumber(v),
        },
      },
    },
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="bg-white rounded-xl border shadow p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Croissance des utilisateurs</h3>

        <div className="flex gap-2">
          {["month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setTimeframe(p)}
              className={`px-3 py-1 rounded-lg border transition ${
                timeframe === p
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white border-gray-300 hover:bg-gray-100"
              }`}
            >
              {p === "month" ? "Mensuel" : "Annuel"}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chargement…
        </div>
      ) : chartData ? (
        <>
          {/* KPI SUMMARY */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Actifs (Jour)" value={formatNumber(summary.activeDaily)} />
            <KpiCard label="Actifs (Semaine)" value={formatNumber(summary.activeWeekly)} />
            <KpiCard label="Actifs (Mois)" value={formatNumber(summary.activeMonthly)} />

            <KpiCard
              label="Croissance"
              value={formatPercentage(summary.growth)}
              positive={summary.growth >= 0}
            />
          </div>

          {/* CHART */}
          <div className="h-72">
            <Bar data={chartData} options={options} />
          </div>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-400">
          Aucune donnée disponible
        </div>
      )}
    </div>
  );
}

/* ============================================================
   KPI CARD COMPONENT
   ============================================================ */
function KpiCard({ label, value, positive }) {
  return (
    <div className="p-4 rounded-lg bg-gray-50 border">
      <div className="text-sm text-gray-600">{label}</div>
      <div
        className={`text-xl font-semibold ${
          value.includes("%")
            ? positive
              ? "text-green-600"
              : "text-red-600"
            : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
