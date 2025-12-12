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
  formatCrypto,
  weiToPol,
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

      const response = await getAnalytics("orders", { timeframe });
      console.log("📊 Orders Analytics API response:", response);

      // Vérifier si les données sont valides
      // Le backend retourne: { success, data: [{date, orders, revenue}], summary }
      if (!response || !response.data || response.data.length === 0) {
        console.log("❌ Pas de données orders");
        setChartData(null);
        setSummary(null);
        return;
      }

      // Extraire les labels (dates) et les valeurs (orders) du tableau
      const labels = response.data.map((item) => formatDateShort(item.date));
      const ordersData = response.data.map((item) => item.orders);

      console.log("📈 Labels:", labels);
      console.log("📈 Orders:", ordersData);

      const formatted = {
        labels,
        datasets: [
          {
            label: "Commandes",
            data: ordersData,
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59,130,246,0.25)",
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          },
        ],
      };

      console.log("✅ Chart data formatted:", formatted);
      setChartData(formatted);

      // Résumé KPI
      setSummary({
        growth: 0,
        avgBasket: response.summary?.totalRevenue / response.summary?.totalOrders || 0,
        disputesRate: 0,
        totalOrders: response.summary?.totalOrders || ordersData.reduce((a, b) => a + b, 0),
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
  if (!chartData) {
    return (
      <div className="bg-white border rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Commandes - Analytics</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {loading ? "Chargement..." : "Aucune donnée"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Commandes - Analytics</h3>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded">
          <div className="text-sm text-gray-600">Total commandes</div>
          <div className="text-xl font-bold">{summary?.totalOrders || 0}</div>
        </div>
        <div className="p-3 bg-green-50 rounded">
          <div className="text-sm text-gray-600">Jours</div>
          <div className="text-xl font-bold">{chartData.labels?.length || 0}</div>
        </div>
        <div className="p-3 bg-yellow-50 rounded">
          <div className="text-sm text-gray-600">Panier moyen</div>
          <div className="text-xl font-bold">{formatCrypto(weiToPol(summary?.avgBasket || 0), "POL", 6)}</div>
        </div>
        <div className="p-3 bg-purple-50 rounded">
          <div className="text-sm text-gray-600">Période</div>
          <div className="text-xl font-bold">{timeframe}</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: "250px" }}>
        <Line data={chartData} options={options} />
      </div>
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
