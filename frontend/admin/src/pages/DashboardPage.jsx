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

import React from "react";
import { Link } from "react-router-dom";

import StatsCards from "../components/StatsCards";
import OrdersAnalyticsChart from "../components/OrdersAnalyticsChart";
import RevenueChart from "../components/RevenueChart";
import RecentOrdersTable from "../components/RecentOrdersTable";
import RecentDisputesTable from "../components/RecentDisputesTable";

export default function DashboardPage() {
  return (
    <div className="space-y-10">

      {/* ===================== HEADER ===================== */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-gray-600 mt-1">
          Vue d’ensemble de l’activité de la plateforme DONE Delivery.
        </p>
      </div>

      {/* ===================== GLOBAL STATS ===================== */}
      <StatsCards />

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
