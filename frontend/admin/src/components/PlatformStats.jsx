/**
 * Composant PlatformStats - Statistiques Globales Plateforme
 * @notice Affiche les KPIs principaux de la plateforme avec cards et variations
 * @dev Auto-refresh toutes les 30 secondes
 */

import React, { useState, useEffect } from 'react';
import * as apiService from '../services/api';

// icônes lucide-react
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  Star
} from 'lucide-react';

function PlatformStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Charger les statistiques
   */
  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.getPlatformStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      setError(err.message);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchStats();
  }, []);

  /**
   * Auto-refresh toutes les 30s
   */
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Helpers
   */
  function calculateVariation(current, previous) {
    if (!previous || previous === 0) return null;
    const variation = ((current - previous) / previous) * 100;
    return variation.toFixed(1);
  }

  function formatCurrency(value) {
    if (typeof value === 'string') return value;
    return `${parseFloat(value).toFixed(2)} ETH`;
  }

  function formatTime(minutes) {
    if (typeof minutes === 'string') return minutes;
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function formatPercentage(value) {
    if (typeof value === 'string') return value;
    return `${value.toFixed(1)}%`;
  }

  /**
   * Variations calculées
   */
  const ordersVariation = stats
    ? calculateVariation(stats.ordersToday, stats.ordersYesterday)
    : null;

  const revenueVariation = stats
    ? calculateVariation(
        parseFloat(stats.revenueToday?.replace(' ETH', '') || 0),
        parseFloat(stats.revenueYesterday?.replace(' ETH', '') || 0)
      )
    : null;

  const usersVariation = stats
    ? calculateVariation(
        stats.activeUsers?.total || 0,
        stats.activeUsersLastWeek?.total || 0
      )
    : null;

  /**
   * Card KPI
   */
  function StatCard({ title, value, variation, icon }) {
    const isPositive = variation !== null && parseFloat(variation) > 0;
    const isNegative = variation !== null && parseFloat(variation) < 0;

    return (
      <div className="stat-card p-4 rounded-lg shadow bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="stat-label font-medium">{title}</span>
          {icon && <div className="text-primary-600">{icon}</div>}
        </div>

        <div className="stat-value text-2xl font-bold">{value}</div>

        {variation !== null && (
          <div
            className={`flex items-center mt-2 ${
              isPositive
                ? 'text-green-600'
                : isNegative
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            {isPositive && <TrendingUp className="w-4 h-4 mr-1" />}
            {isNegative && <TrendingDown className="w-4 h-4 mr-1" />}
            <span>{Math.abs(parseFloat(variation))}%</span>
          </div>
        )}
      </div>
    );
  }

  /**
   * Skeleton loader
   */
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="stat-card animate-pulse p-4 rounded-lg bg-gray-100">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  /**
   * Erreur
   */
  if (error) {
    return (
      <div className="error-message text-center">
        <p className="text-red-600 mb-4">
          Erreur lors du chargement des statistiques : {error}
        </p>
        <button onClick={fetchStats} className="btn btn-primary">
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) return null;

  /**
   * Rendu principal
   */
  return (
    <div className="platform-stats">
      <h2 className="text-2xl font-bold mb-4">Statistiques Globales</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

        <StatCard
          title="Commandes Aujourd'hui"
          value={stats.ordersToday}
          variation={ordersVariation}
          icon={<ShoppingCart className="w-6 h-6" />}
        />

        <StatCard
          title="GMV Total"
          value={formatCurrency(stats.totalGMV)}
          variation={revenueVariation}
          icon={<DollarSign className="w-6 h-6" />}
        />

        <StatCard
          title="Utilisateurs Actifs"
          value={`${stats.activeUsers?.clients || 0} clients, ${stats.activeUsers?.restaurants || 0} restaurants, ${stats.activeUsers?.deliverers || 0} livreurs`}
          variation={usersVariation}
          icon={<Users className="w-6 h-6" />}
        />

        <StatCard
          title="Revenue Plateforme"
          value={formatCurrency(stats.platformRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
        />

        <StatCard
          title="Temps Moyen Livraison"
          value={formatTime(stats.avgDeliveryTime)}
          icon={<Clock className="w-6 h-6" />}
        />

        <StatCard
          title="Taux Satisfaction"
          value={formatPercentage(stats.satisfactionRate)}
          icon={<Star className="w-6 h-6" />}
        />

      </div>
    </div>
  );
}

export default PlatformStats;
