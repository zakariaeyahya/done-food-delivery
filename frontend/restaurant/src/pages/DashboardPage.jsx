/**
 * Page DashboardPage - Restaurant
 * @notice Tableau de bord principal du restaurant
 * @dev Vue d'ensemble commandes, statistiques KPIs, revenus
 */

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

import OrdersQueue from "../components/OrdersQueue";
import EarningsChart from "../components/EarningsChart";

import * as api from "../services/api";
import { useWallet } from "../contexts/WalletContext"; // adapte si besoin
import { formatPrice } from "../utils/formatters";     // adapte si besoin

// fallback si formatPrice pas dispo
const safeFormatPrice =
  formatPrice ||
  ((v) =>
    Number(v || 0).toFixed(5));

function DashboardPage({ showSuccess, showError, showNotification }) {
  const { restaurant: contextRestaurant, address } = useWallet();

  const [restaurant, setRestaurant] = useState(contextRestaurant || null);

  const [kpis, setKpis] = useState({
    pendingOrders: 0,
    preparingOrders: 0,
    deliveredToday: 0,
    todayRevenue: 0,
  });

  const [loadingKpis, setLoadingKpis] = useState(false);

  // Sync avec context + fallback localStorage
  useEffect(() => {
    if (contextRestaurant) {
      setRestaurant(contextRestaurant);
      return;
    }

    // fallback localStorage si tu sauvegardes le profil
    const saved = localStorage.getItem("restaurantProfile");
    if (saved) {
      try {
        setRestaurant(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [contextRestaurant]);

  // Charger KPIs dès que restaurant dispo
  useEffect(() => {
    if (restaurant?._id && (restaurant?.address || address)) {
      fetchKPIs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?._id, restaurant?.address, address]);

  async function fetchKPIs() {
    try {
      setLoadingKpis(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const orders = await api.getOrders(
        restaurant._id,
        { startDate: today }, // à adapter si backend attend autre chose
        restaurant.address || address
      );

      const pendingOrders = orders.filter((o) => o.status === "CREATED").length;
      const preparingOrders = orders.filter((o) => o.status === "PREPARING").length;
      const deliveredToday = orders.filter((o) => o.status === "DELIVERED").length;

      const todayRevenue = orders
        .filter((o) => o.status === "DELIVERED")
        .reduce((sum, o) => {
          // totalAmount est en wei, convertir en MATIC
          const totalAmountWei = o.totalAmount || 0;
          const totalAmountMATIC = parseFloat(ethers.formatEther(totalAmountWei.toString()));
          // Le restaurant reçoit 80% du montant total
          const restaurantRevenue = totalAmountMATIC * 0.8;
          return sum + restaurantRevenue;
        }, 0);

      setKpis({
        pendingOrders,
        preparingOrders,
        deliveredToday,
        todayRevenue,
      });
    } catch (e) {
      console.error("Error fetching KPIs:", e);
      showError?.("Erreur lors du chargement des KPIs");
    } finally {
      setLoadingKpis(false);
    }
  }

  const greeting = useMemo(() => {
    if (!restaurant?.name) return "Bienvenue";
    return `Bienvenue, ${restaurant.name}`;
  }, [restaurant?.name]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-neutral-900 dark:text-neutral-50">
            Tableau de bord
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {greeting}
          </p>
        </div>

        <button
          onClick={fetchKPIs}
          disabled={!restaurant?._id || loadingKpis}
          className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700 shadow-soft transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
        >
          {loadingKpis ? "Actualisation..." : "Actualiser KPIs"}
        </button>
      </div>

      {/* Empty state si pas de resto */}
      {!restaurant?._id && (
        <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4 text-warning-800 dark:border-warning-900 dark:bg-warning-900/20 dark:text-warning-200">
          Connecte ton wallet restaurant pour accéder au dashboard.
        </div>
      )}

      {/* KPIs */}
      {restaurant?._id && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Commandes en attente"
            value={kpis.pendingOrders}
            tone="warning"
            loading={loadingKpis}
          />
          <KpiCard
            title="En préparation"
            value={kpis.preparingOrders}
            tone="secondary"
            loading={loadingKpis}
          />
          <KpiCard
            title="Livrées aujourd'hui"
            value={kpis.deliveredToday}
            tone="success"
            loading={loadingKpis}
          />
          <KpiCard
            title="Revenus aujourd'hui"
            value={safeFormatPrice(kpis.todayRevenue, 'MATIC', 5)}
            tone="primary"
            loading={loadingKpis}
          />
        </div>
      )}

      {/* Content layout */}
      {restaurant?._id && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {/* Orders queue */}
          <div className="xl:col-span-7">
            <OrdersQueue
              restaurantId={restaurant._id}
              restaurantAddress={restaurant.address || address}
              filter="CREATED"
              showSuccess={showSuccess}
              showError={showError}
              showNotification={showNotification}
            />
          </div>

          {/* Earnings */}
          <div className="xl:col-span-5">
            <EarningsChart
              restaurantId={restaurant._id}
              restaurantAddress={restaurant.address || address}
              period="day"
              showSuccess={showSuccess}
              showError={showError}
              key={`${restaurant._id}-${kpis.deliveredToday}`} // Force re-render when KPIs change
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI bits ---------------- */

function KpiCard({ title, value, tone = "primary", loading }) {
  const tones = {
    primary:
      "bg-orange-50 text-orange-800 dark:bg-orange-900/25 dark:text-orange-200",
    secondary:
      "bg-red-50 text-red-800 dark:bg-red-900/25 dark:text-red-200",
    success:
      "bg-success-50 text-success-800 dark:bg-success-900/25 dark:text-success-200",
    warning:
      "bg-warning-50 text-warning-800 dark:bg-warning-900/25 dark:text-warning-200",
    neutral:
      "bg-neutral-50 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-neutral-800">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {title}
        </p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
          Aujourd’hui
        </span>
      </div>

      {loading ? (
        <div className="mt-3 h-8 w-20 animate-pulse rounded bg-neutral-100 dark:bg-neutral-700" />
      ) : (
        <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
          {value}
        </p>
      )}
    </div>
  );
}

export default DashboardPage;
