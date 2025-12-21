import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import StatsCards from "../components/StatsCards";
import OrdersAnalyticsChart from "../components/OrdersAnalyticsChart";
import RevenueChart from "../components/RevenueChart";
import RecentOrdersTable from "../components/RecentOrdersTable";
import RecentDisputesTable from "../components/RecentDisputesTable";

import { getDashboardStats } from "../services/api";
import { weiToPol } from "../services/formatters";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalGMV: 0,
    platformRevenue: 0,
    avgDeliveryTime: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardStats();

      const data = response?.data || response;

      if (data) {
        const totalActiveUsers =
          (data.activeUsers?.clients || 0) +
          (data.activeUsers?.restaurants || 0) +
          (data.activeUsers?.deliverers || 0);

        setStats({
          totalOrders: data.totalOrders || 0,
          totalGMV: weiToPol(data.gmv || data.totalGMV || 0),
          platformRevenue: weiToPol(data.platformRevenue || 0),
          avgDeliveryTime: data.avgDeliveryTime || 0,
          activeUsers: totalActiveUsers || data.activeUsers || 0,
        });
      } else {
        setError("Aucune donnée disponible");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        "Erreur lors du chargement des statistiques"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadStats();
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">

      <div className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 rounded-xl p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Tableau de Bord</h1>
        <p className="text-orange-100 text-sm md:text-base">
          Vue d'ensemble de l'activité de la plateforme DONE Delivery
        </p>
      </div>

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold mb-1">Erreur de chargement</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={reloadStats}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border rounded-xl shadow p-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <StatsCards
          totalOrders={stats.totalOrders}
          totalGMV={stats.totalGMV}
          platformRevenue={stats.platformRevenue}
          avgDeliveryTime={stats.avgDeliveryTime}
          activeUsers={stats.activeUsers}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersAnalyticsChart />
        <RevenueChart />
      </div>

      <div className="bg-white border rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Dernières commandes</h2>
            <p className="text-sm text-gray-500 mt-1">Les 5 commandes les plus récentes</p>
          </div>
          <Link
            to="/orders"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
          >
            Voir tout
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <RecentOrdersTable limit={5} />
      </div>

      <div className="bg-white border rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Derniers litiges</h2>
            <p className="text-sm text-gray-500 mt-1">Les 5 litiges nécessitant une attention</p>
          </div>
          <Link
            to="/disputes"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
          >
            Voir tout
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <RecentDisputesTable limit={5} />
      </div>

    </div>
  );
}
