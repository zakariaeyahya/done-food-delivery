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
  const [error, setError] = useState(null);

  /* ============================================================
     FETCH DATA
     ============================================================ */
  async function loadRevenue() {
    try {
      setLoading(true);
      setError(null);

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
        setError("Aucune donnée disponible pour cette période");
        return;
      }

      // Extraire les données et convertir wei → POL
      const labels = response.data.map((item) => formatDateShort(item.date));
      const datasetPlatform = response.data.map((item) => weiToPol(item.platform || 0));
      const datasetRestaurants = response.data.map((item) => weiToPol(item.restaurant || 0));
      const datasetDeliverers = response.data.map((item) => weiToPol(item.deliverer || 0));

      console.log("📈 Revenue Labels:", labels);
      console.log("📈 Platform:", datasetPlatform);

      // Calculer les totaux pour la répartition réelle
      const totalPlatform = datasetPlatform.reduce((a, b) => a + b, 0);
      const totalRestaurants = datasetRestaurants.reduce((a, b) => a + b, 0);
      const totalDeliverers = datasetDeliverers.reduce((a, b) => a + b, 0);
      const totalRevenue = totalPlatform + totalRestaurants + totalDeliverers;

      // Calculer les pourcentages réels
      const platformPercent = totalRevenue > 0 ? Math.round((totalPlatform / totalRevenue) * 100) : 10;
      const restaurantPercent = totalRevenue > 0 ? Math.round((totalRestaurants / totalRevenue) * 100) : 70;
      const delivererPercent = totalRevenue > 0 ? Math.round((totalDeliverers / totalRevenue) * 100) : 20;

      const formatted = {
        labels,
        datasets: [
          {
            label: `Plateforme (${platformPercent}%)`,
            data: datasetPlatform,
            borderColor: "#10B981",
            backgroundColor: "rgba(16,185,129,0.25)",
            tension: 0.3,
            fill: true,
          },
          {
            label: `Restaurants (${restaurantPercent}%)`,
            data: datasetRestaurants,
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59,130,246,0.25)",
            tension: 0.3,
            fill: true,
          },
          {
            label: `Livreurs (${delivererPercent}%)`,
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

      // Totaux pour la répartition (utiliser les pourcentages calculés)
      setBreakdown({
        platform: platformPercent,
        restaurant: restaurantPercent,
        deliverer: delivererPercent,
      });

      setComparison(null);
    } catch (err) {
      console.error("Erreur revenue chart:", err);
      setChartData(null);
      setBreakdown(null);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Erreur lors du chargement des revenus"
      );
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

      {/* Erreur */}
      {error && !loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-red-500">
          <svg className="w-16 h-16 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium mb-2">Erreur de chargement</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadRevenue}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Chargement des revenus...</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : chartData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart */}
          <div className="lg:col-span-2" style={{ height: "300px", width: "100%" }}>
            <Line data={chartData} options={options} />
          </div>

          {/* Breakdown */}
          <div className="p-5 border rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">

            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Répartition
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">Restaurants</span>
                </div>
                <strong className="text-blue-600 font-bold">{breakdown?.restaurant ?? 70}%</strong>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-gray-700">Livreurs</span>
                </div>
                <strong className="text-orange-600 font-bold">{breakdown?.deliverer ?? 20}%</strong>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">Plateforme</span>
                </div>
                <strong className="text-green-600 font-bold">{breakdown?.platform ?? 10}%</strong>
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
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">Aucune donnée disponible</p>
          <p className="text-sm mt-1">Aucun revenu pour cette période</p>
        </div>
      )}
    </div>
  );
}
