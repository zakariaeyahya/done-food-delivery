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
  const [error, setError] = useState(null);

  /* ============================================================
     FETCH ANALYTICS
     ============================================================ */
  async function loadAnalytics() {
    try {
      setLoading(true);
      setError(null);

      const response = await getAnalytics("orders", { timeframe });
      console.log("📊 Orders Analytics API response:", response);

      // Vérifier si les données sont valides
      // Le backend retourne: { success, data: [{date, orders, revenue}], summary }
      if (!response || !response.data || response.data.length === 0) {
        console.log("❌ Pas de données orders");
        setChartData(null);
        setSummary(null);
        setError("Aucune donnée disponible pour cette période");
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
      // Vérifier si totalRevenue est déjà en POL ou en wei
      const totalRevenueRaw = response.summary?.totalRevenue || 0;
      // Si c'est une string avec beaucoup de chiffres (>12), c'est probablement en wei
      const totalRevenueStr = totalRevenueRaw.toString();
      const isWei = totalRevenueStr.length > 12 && /^\d+$/.test(totalRevenueStr);
      const totalRevenuePOL = isWei ? weiToPol(totalRevenueRaw) : parseFloat(totalRevenueRaw) || 0;
      
      const totalOrders = response.summary?.totalOrders || ordersData.reduce((a, b) => a + b, 0);
      // Calculer le panier moyen en s'assurant qu'on ne divise pas par zéro
      const avgBasket = totalOrders > 0 && totalRevenuePOL > 0 ? totalRevenuePOL / totalOrders : 0;
      
      // Validation : si le panier moyen est anormalement élevé (> 1000 POL), c'est probablement une erreur
      const validatedAvgBasket = avgBasket > 1000 ? 0 : avgBasket;
      
      setSummary({
        growth: 0,
        avgBasket: validatedAvgBasket,
        disputesRate: 0,
        totalOrders: totalOrders,
      });
    } catch (err) {
      console.error("Orders analytics error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Erreur lors du chargement des statistiques de commandes"
      );
      setChartData(null);
      setSummary(null);
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
  
  // État de chargement avec skeleton
  if (loading) {
    return (
      <div className="bg-white border rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  // État avec erreur
  if (error && !loading) {
    return (
      <div className="bg-white border rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Commandes - Analytics</h3>
          <div className="flex gap-2">
            {["day", "week", "month"].map((p) => (
              <button
                key={p}
                onClick={() => setTimeframe(p)}
                className={`px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${
                  timeframe === p
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {p === "day" ? "Jour" : p === "week" ? "Semaine" : "Mois"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-red-500">
          <svg className="w-16 h-16 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium mb-2">Erreur de chargement</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // État sans données
  if (!chartData && !loading) {
    return (
      <div className="bg-white border rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Commandes - Analytics</h3>
          <div className="flex gap-2">
            {["day", "week", "month"].map((p) => (
              <button
                key={p}
                onClick={() => setTimeframe(p)}
                className={`px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${
                  timeframe === p
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {p === "day" ? "Jour" : p === "week" ? "Semaine" : "Mois"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">Aucune donnée disponible</p>
          <p className="text-sm mt-1">Aucune commande pour cette période</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl shadow p-6">
      {/* Header avec sélecteur de période */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Commandes - Analytics</h3>
        
        <div className="flex gap-2">
          {["day", "week", "month"].map((p) => (
            <button
              key={p}
              onClick={() => setTimeframe(p)}
              className={`px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${
                timeframe === p
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {p === "day" ? "Jour" : p === "week" ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-xs text-blue-700 font-medium mb-1">Total commandes</div>
          <div className="text-2xl font-bold text-blue-900">{summary?.totalOrders || 0}</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="text-xs text-green-700 font-medium mb-1">Jours</div>
          <div className="text-2xl font-bold text-green-900">{chartData.labels?.length || 0}</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
          <div className="text-xs text-yellow-700 font-medium mb-1">Panier moyen</div>
          <div className="text-lg font-bold text-yellow-900">
            {summary?.avgBasket && summary.avgBasket > 0 
              ? formatCrypto(summary.avgBasket, "POL", 4)
              : "N/A"}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <div className="text-xs text-purple-700 font-medium mb-1">Période</div>
          <div className="text-lg font-bold text-purple-900 capitalize">
            {timeframe === "day" ? "Jour" : timeframe === "week" ? "Semaine" : "Mois"}
          </div>
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
