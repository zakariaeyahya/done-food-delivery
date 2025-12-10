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
  Filler,
} from "chart.js";

import { getAnalytics } from "../services/api";
import {
  formatDateShort,
  formatPercentage,
  formatCurrency,
  formatNumber,
} from "../services/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function OrdersAnalyticsChart() {
  const [timeframe, setTimeframe] = useState("week");
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ============================================================
     FETCH ANALYTICS
     ============================================================ */
  async function loadAnalytics() {
    try {
      setLoading(true);

      const data = await getAnalytics("orders", { timeframe });

      // Labels → dates formatées
      const labels = data.dates.map((d) => formatDateShort(d));

      const formatted = {
        labels,
        datasets: [
          {
            label: "Commandes",
            data: data.orders,
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59,130,246,0.25)",
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          },
        ],
      };

      // Comparaison période précédente
      if (data.comparison?.previousPeriod) {
        formatted.datasets.push({
          label: "Période précédente",
          data: data.comparison.previousPeriod,
          borderColor: "#9CA3AF",
          backgroundColor: "rgba(156,163,175,0.15)",
          fill: false,
          borderDash: [5, 5],
          tension: 0.3,
          pointRadius: 0,
        });
      }

      setChartData(formatted);

      // Résumé KPI
      setSummary({
        growth: data.comparison?.change ?? 0,
        avgBasket: data.avgBasket ?? 0,
        disputesRate: data.disputesRate ?? 0,
        totalOrders: data.orders.reduce((a, b) => a + b, 0),
      });
    } catch (err) {
      console.error("Orders analytics error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
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
        mode: "index",
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatNumber(ctx.raw)} commandes`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="bg-white border rounded-xl shadow p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Commandes - Analytics</h3>

        <div className="flex gap-2">
          {["day", "week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setTimeframe(p)}
              className={`px-3 py-1 rounded-lg border transition ${
                timeframe === p
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white border-gray-300 hover:bg-gray-100"
              }`}
            >
              {p === "day"
                ? "Jour"
                : p === "week"
                ? "Semaine"
                : p === "month"
                ? "Mois"
                : "Année"}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chargement…
        </div>
      ) : !chartData ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          Aucune donnée
        </div>
      ) : (
        <>
          {/* KPI SUMMARY */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard label="Total commandes" value={formatNumber(summary.totalOrders)} />

              <KpiCard
                label="Croissance"
                value={formatPercentage(summary.growth)}
                positive={summary.growth >= 0}
              />

              <KpiCard
                label="Panier moyen"
                value={formatCurrency(summary.avgBasket, "EUR")}
              />

              <KpiCard
                label="Taux de litiges"
                value={formatPercentage(summary.disputesRate)}
                positive={summary.disputesRate <= 5}
              />
            </div>
          )}

          {/* Chart */}
          <div className="h-72">
            <Line data={chartData} options={options} />
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   KPI CARD COMPONENT
   ============================================================ */
function KpiCard({ label, value, positive = true }) {
  return (
    <div className="p-4 bg-gray-50 border rounded-lg">
      <div className="text-sm text-gray-600">{label}</div>

      <div
        className={`text-xl font-bold ${
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
