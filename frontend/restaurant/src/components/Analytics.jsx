/**
 * Composant Analytics - Restaurant
 * @notice Statistiques et analytics du restaurant
 * @dev Graphiques Chart.js, statistiques commandes, revenus, plats populaires
 */

import { useEffect, useMemo, useState } from "react";
import {
  Line,
  Bar,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import * as api from "../services/api";

// Enregistrer composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Composant Analytics
 * @param {string} restaurantId - ID du restaurant
 * @param {string} restaurantAddress - Adresse wallet du restaurant
 * @param {string} period - Période ('day', 'week', 'month')
 * @param {(p: string) => void} onPeriodChange - callback optionnel si parent veut contrôler la période
 * @returns {JSX.Element} Composant analytics
 */
function Analytics({
  restaurantId,
  restaurantAddress,
  period = "week",
  onPeriodChange,
}) {
  // Période interne (supporte mode contrôlé / non contrôlé)
  const [internalPeriod, setInternalPeriod] = useState(period);

  useEffect(() => {
    setInternalPeriod(period);
  }, [period]);

  const currentPeriod = onPeriodChange ? period : internalPeriod;

  // State pour analytics data
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    revenue: 0,
    averageRating: 0,
    popularDishes: [],
    averagePreparationTime: 0,
    revenueSeries: [], // [{ label, value }] ou [{ date, value }]
    ordersSeries: [],  // optionnel si ton backend le fournit
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Charger analytics à chaque changement restaurantId / période
  useEffect(() => {
    if (!restaurantId) return;
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, restaurantAddress, currentPeriod]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      setError("");

      const startDate = getStartDate(currentPeriod);
      const endDate = new Date();

      const data = await api.getAnalytics(
        restaurantId,
        { startDate, endDate },
        restaurantAddress
      );

      setAnalytics((prev) => ({
        ...prev,
        ...data,
        popularDishes: data?.popularDishes ?? prev.popularDishes,
        revenueSeries: data?.revenueSeries ?? prev.revenueSeries,
        ordersSeries: data?.ordersSeries ?? prev.ordersSeries,
      }));
    } catch (e) {
      console.error("Error fetching analytics:", e);
      setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }

  function getStartDate(p) {
    const now = new Date();
    if (p === "day") {
      return new Date(now.setHours(0, 0, 0, 0));
    }
    if (p === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d;
    }
    // month
    const m = new Date();
    m.setMonth(m.getMonth() - 1);
    return m;
  }

  function handlePeriodChange(next) {
    if (onPeriodChange) onPeriodChange(next);
    else setInternalPeriod(next);
  }

  function formatPrice(value) {
    if (value == null || Number.isNaN(Number(value))) return "0";
    return Number(value).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    });
  }

  // ---------- Données graphiques ----------
  const revenueChartData = useMemo(() => {
    // Si ton backend renvoie revenueSeries => on l’utilise
    if (analytics.revenueSeries?.length) {
      return {
        labels: analytics.revenueSeries.map((p) => p.label ?? p.date ?? ""),
        datasets: [
          {
            label: "Revenus (MATIC)",
            data: analytics.revenueSeries.map((p) => p.value ?? 0),
            tension: 0.35,
            fill: true,
            borderWidth: 2,
            borderColor: "rgb(249, 115, 22)", // orange-500
            backgroundColor: "rgba(34, 197, 94, 0.12)",
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      };
    }

    // fallback demo/sans données
    const labels =
      currentPeriod === "day"
        ? ["08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"]
        : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    return {
      labels,
      datasets: [
        {
          label: "Revenus (MATIC)",
          data: labels.map(() => 0),
          tension: 0.35,
          fill: true,
          borderWidth: 2,
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.12)",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [analytics.revenueSeries, currentPeriod]);

  const popularDishesChartData = useMemo(() => {
    const dishes = analytics.popularDishes ?? [];
    return {
      labels: dishes.map((d) => d.name),
      datasets: [
        {
          label: "Commandes",
          data: dishes.map((d) => d.orderCount ?? 0),
          backgroundColor: "rgba(236, 72, 153, 0.85)", // pink-500
          borderRadius: 8,
          barThickness: 22,
        },
      ],
    };
  }, [analytics.popularDishes]);

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" },
        title: { display: false },
        tooltip: { intersect: false, mode: "index" },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxRotation: 0 },
        },
        y: {
          grid: { color: "rgba(0,0,0,0.06)" },
          ticks: { callback: (v) => `${v}` },
        },
      },
    }),
    []
  );

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { intersect: true, mode: "nearest" },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { autoSkip: false },
        },
        y: {
          grid: { color: "rgba(0,0,0,0.06)" },
          beginAtZero: true,
        },
      },
    }),
    []
  );

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-neutral-900 dark:text-neutral-50">
            Statistiques
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Suivi des performances du restaurant
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600 dark:text-neutral-300">
            Période
          </label>
          <select
            value={currentPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm shadow-soft outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-orange-500 dark:focus:ring-orange-900"
          >
            <option value="day">Aujourd&apos;hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="grid place-items-center rounded-2xl bg-white p-10 shadow-soft dark:bg-neutral-800">
          <div className="animate-pulse text-neutral-500 dark:text-neutral-300">
            Chargement des statistiques...
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 p-4 text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-200">
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Stats cards */}
          <StatCard
            title="Commandes totales"
            value={analytics.totalOrders}
            className="lg:col-span-3"
          />
          <StatCard
            title="Revenus"
            value={formatPrice(analytics.revenue, 'MATIC', 5)}
            className="lg:col-span-3"
          />
          <StatCard
            title="Note moyenne"
            value={`${Number(analytics.averageRating || 0).toFixed(1)}/5`}
            className="lg:col-span-3"
          />
          <StatCard
            title="Préparation moyenne"
            value={`${analytics.averagePreparationTime || 0} min`}
            className="lg:col-span-3"
          />

          {/* Revenue Chart */}
          <div className="lg:col-span-7 rounded-2xl bg-white p-4 shadow-soft dark:bg-neutral-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg text-neutral-900 dark:text-neutral-50">
                Revenus dans le temps
              </h3>
              <Badge tone="primary">MATIC</Badge>
            </div>
            <div className="h-72">
              <Line data={revenueChartData} options={lineOptions} />
            </div>
          </div>

          {/* Popular dishes Chart */}
          <div className="lg:col-span-5 rounded-2xl bg-white p-4 shadow-soft dark:bg-neutral-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg text-neutral-900 dark:text-neutral-50">
                Plats les plus populaires
              </h3>
              <Badge tone="secondary">Top ventes</Badge>
            </div>

            {(!analytics.popularDishes ||
              analytics.popularDishes.length === 0) && (
              <div className="grid h-72 place-items-center text-sm text-neutral-500 dark:text-neutral-400">
                Aucun plat populaire sur la période.
              </div>
            )}

            {analytics.popularDishes?.length > 0 && (
              <div className="h-72">
                <Bar data={popularDishesChartData} options={barOptions} />
              </div>
            )}
          </div>

          {/* Table top dishes (bonus utile) */}
          {analytics.popularDishes?.length > 0 && (
            <div className="lg:col-span-12 rounded-2xl bg-white p-4 shadow-soft dark:bg-neutral-800">
              <h3 className="mb-3 font-display text-lg text-neutral-900 dark:text-neutral-50">
                Détail des plats populaires
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-neutral-500 dark:text-neutral-400">
                      <th className="py-2">Plat</th>
                      <th className="py-2">Commandes</th>
                      <th className="py-2">Revenu</th>
                      <th className="py-2">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.popularDishes.map((d) => (
                      <tr
                        key={d.id || d.name}
                        className="border-t border-neutral-100 dark:border-neutral-700"
                      >
                        <td className="py-2 font-medium text-neutral-900 dark:text-neutral-50">
                          {d.name}
                        </td>
                        <td className="py-2 text-neutral-700 dark:text-neutral-200">
                          {d.orderCount ?? 0}
                        </td>
                        <td className="py-2 text-neutral-700 dark:text-neutral-200">
                          {formatPrice(d.revenue ?? 0, 'MATIC', 5)}
                        </td>
                        <td className="py-2 text-neutral-700 dark:text-neutral-200">
                          {(d.rating ?? 0).toFixed?.(1) ?? d.rating ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------ UI Subcomponents ------------------ */

function StatCard({ title, value, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-soft dark:bg-neutral-800 ${className}`}
    >
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        {value}
      </p>
    </div>
  );
}

function Badge({ children, tone = "primary" }) {
  const styles =
    tone === "secondary"
      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
      : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>
      {children}
    </span>
  );
}

export default Analytics;
