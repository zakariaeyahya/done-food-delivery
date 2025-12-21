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

  async function loadData() {
    try {
      const dashboard = await blockchainMetrics.getDashboard();
      setData(dashboard);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Erreur de connexion au reseau');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const isHealthy = data?.health?.overall === 'healthy';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-6 py-4">
          <div className="flex justify-between items-center">

            {/* Title Section */}
            <div className="flex items-center gap-4">
              {/* Animated Logo */}
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isHealthy
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    : 'bg-gradient-to-br from-red-500 to-orange-600'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                {/* Pulse Animation */}
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                  isHealthy ? 'bg-emerald-400' : 'bg-red-400'
                }`}>
                  <span className={`absolute inset-0 rounded-full animate-ping ${
                    isHealthy ? 'bg-emerald-400' : 'bg-red-400'
                  } opacity-75`}></span>
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  Blockchain Analytics
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isHealthy
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {isHealthy ? 'LIVE' : 'OFFLINE'}
                  </span>
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  Monitoring temps reel du reseau Polygon Amoy
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Auto-refresh indicator */}
              <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span>Auto-refresh</span>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value={10000} className="bg-slate-800">10s</option>
                  <option value={30000} className="bg-slate-800">30s</option>
                  <option value={60000} className="bg-slate-800">60s</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg border border-slate-700/50 transition-all duration-200"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Chargement...' : 'Actualiser'}
              </button>

              {/* Last Update */}
              {lastUpdate && (
                <div className="text-slate-500 text-sm">
                  <span className="text-slate-600">MAJ:</span> {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-8">

        {/* Error Banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button onClick={loadData} className="ml-auto text-red-300 hover:text-white transition-colors">
              Reessayer
            </button>
          </div>
        )}

        {/* Network Status Card */}
        <NetworkStatsCard network={data?.network} health={data?.health} />

        {/* Metrics Grid */}
        <div className="mt-8">
          <MetricsGrid data={data} />
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex justify-between items-center text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Donnees en temps reel depuis Polygon Amoy (Chain ID: 80002)</span>
            </div>
            {data?.generatedAt && (
              <span>
                Genere le {new Date(data.generatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockchainPage;
