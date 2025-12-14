import React, { useState, useEffect } from 'react';
import blockchainMetrics from '../services/blockchainMetrics';
import NetworkStatsCard from '../components/blockchain/NetworkStatsCard';
import MetricsGrid from '../components/blockchain/MetricsGrid';

function BlockchainPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000);

  // Charger les donnees
  async function loadData() {
    try {
      setLoading(true);
      const dashboard = await blockchainMetrics.getDashboard();
      setData(dashboard);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Erreur de chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Chargement initial + auto-refresh
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Blockchain Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            Monitoring du reseau Polygon Amoy
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Refresh Interval */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="bg-gray-800 text-white rounded px-3 py-2 text-sm"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1min</option>
          </select>

          {/* Manual Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            {loading ? '...' : 'Actualiser'}
          </button>

          {/* Last Update */}
          {lastUpdate && (
            <span className="text-gray-500 text-sm">
              MAJ: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">

        {/* Network Status */}
        <NetworkStatsCard
          network={data?.network}
          health={data?.health}
        />

        {/* Metrics */}
        <MetricsGrid data={data} />

      </div>

      {/* Footer Info */}
      {data?.generatedAt && (
        <p className="text-gray-600 text-xs mt-8 text-center">
          Donnees generees le {new Date(data.generatedAt).toLocaleString()}
        </p>
      )}

    </div>
  );
}

export default BlockchainPage;
