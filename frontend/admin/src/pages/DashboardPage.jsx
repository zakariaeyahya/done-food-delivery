/**
 * DashboardPage.jsx
 * Page centrale du backoffice
 * Affiche :
 * - Cards statistiques globales
 * - Graphique des commandes récentes
 * - Graphique des revenus
 * - Tableau des derniers litiges
 * - Tableau des commandes récentes
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import StatsCards from "../components/StatsCards";
import OrdersAnalyticsChart from "../components/OrdersAnalyticsChart";
import RevenueChart from "../components/RevenueChart";
import RecentOrdersTable from "../components/RecentOrdersTable";
import RecentDisputesTable from "../components/RecentDisputesTable";

import { getDashboardStats } from "../services/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalGMV: 0,
    platformRevenue: 0,
    avgDeliveryTime: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  /* ============================================================
     FETCH DASHBOARD STATS
     ============================================================ */
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getDashboardStats();

        if (data) {
          setStats({
            totalOrders: data.totalOrders || 0,
            totalGMV: data.gmv || data.totalGMV || 0,
            platformRevenue: data.platformRevenue || 0,
            avgDeliveryTime: data.avgDeliveryTime || 0,
            activeUsers: data.activeUsers?.total || data.activeUsers || 0,
          });
        }
      } catch (err) {
        console.error("Erreur chargement stats dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-10">

      {/* ===================== HEADER ===================== */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-gray-600 mt-1">
          Vue d'ensemble de l'activité de la plateforme DONE Delivery.
        </p>
      </div>

      {/* ===================== GLOBAL STATS ===================== */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement des statistiques...</div>
      ) : (
        <StatsCards
          totalOrders={stats.totalOrders}
          totalGMV={stats.totalGMV}
          platformRevenue={stats.platformRevenue}
          avgDeliveryTime={stats.avgDeliveryTime}
          activeUsers={stats.activeUsers}
        />
      )}

      {/* ===================== ROW : ORDERS + REVENUE ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graphique Commandes */}
        <div className="bg-white border rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Commandes récentes</h2>
          <OrdersAnalyticsChart />
        </div>

        {/* Graphique Revenus */}
        <div className="bg-white border rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenus</h2>
          <RevenueChart />
        </div>

      </div>

      {/* ===================== LAST ORDERS ===================== */}
      <div className="bg-white border rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Dernières commandes</h2>
          <Link
            to="/orders"
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            Voir tout →
          </Link>
        </div>

        <RecentOrdersTable limit={5} />
      </div>

      {/* ===================== LAST DISPUTES ===================== */}
      <div className="bg-white border rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Derniers litiges</h2>
          <Link
            to="/disputes"
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            Voir tout →
          </Link>
        </div>

        <RecentDisputesTable limit={5} />
      </div>

    </div>
  );
}
