import React from 'react';

function NetworkStatsCard({ network, health }) {
  if (!network) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-slate-800/50 rounded-2xl"></div>
      </div>
    );
  }

  const isConnected = network.isConnected;
  const isHealthy = health?.overall === 'healthy';
  const gasLevel = network.gasPrice?.gwei < 30 ? 'low' : network.gasPrice?.gwei < 100 ? 'medium' : 'high';

  const contracts = health?.contracts ? Object.entries(health.contracts) : [];
  const deployedCount = contracts.filter(([_, info]) => info.status === 'deployed').length;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${
      isHealthy
        ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-emerald-500/20'
        : 'bg-gradient-to-br from-slate-800/80 to-red-900/20 border-red-500/20'
    }`}>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative p-6">

        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Network Icon with Status */}
            <div className="relative">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isConnected
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                  : 'bg-gradient-to-br from-slate-600 to-slate-700'
              }`}>
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              {/* Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-800 flex items-center justify-center ${
                isConnected ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                {isConnected ? (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>

            {/* Network Name & Status */}
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Polygon Amoy
                <span className="text-xs font-normal text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                  Testnet
                </span>
              </h2>
              <p className={`text-sm ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                {isConnected ? 'Connecte au reseau' : 'Deconnecte'}
              </p>
            </div>
          </div>

          {/* Health Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            isHealthy
              ? 'bg-emerald-500/10 border border-emerald-500/30'
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-red-400'}`}>
              <div className={`w-2.5 h-2.5 rounded-full animate-ping ${isHealthy ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            </div>
            <span className={`font-semibold ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
              {isHealthy ? 'Operationnel' : 'Probleme detecte'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* Block Number */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Block</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {network.blockNumber?.toLocaleString() || '—'}
            </p>
          </div>

          {/* Gas Price */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Gas Price</span>
            </div>
            <p className={`text-2xl font-bold font-mono ${
              gasLevel === 'low' ? 'text-emerald-400' :
              gasLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {network.gasPrice?.gwei?.toFixed(1) || '—'}
              <span className="text-sm font-normal text-slate-400 ml-1">Gwei</span>
            </p>
            {/* Gas Level Indicator */}
            <div className="mt-2 flex gap-1">
              <div className={`h-1 flex-1 rounded-full ${gasLevel === 'low' || gasLevel === 'medium' || gasLevel === 'high' ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${gasLevel === 'medium' || gasLevel === 'high' ? 'bg-yellow-500' : 'bg-slate-600'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${gasLevel === 'high' ? 'bg-red-500' : 'bg-slate-600'}`}></div>
            </div>
          </div>

          {/* Chain ID */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Chain ID</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {network.chainId || '—'}
            </p>
          </div>

          {/* Block Time */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Last Block</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {network.timeSinceLastBlock?.toFixed(0) || '—'}
              <span className="text-sm font-normal text-slate-400 ml-1">sec</span>
            </p>
          </div>
        </div>

        {/* Smart Contracts Status */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-slate-300 text-sm font-medium">Smart Contracts</span>
            </div>
            <span className="text-xs text-slate-400">
              {deployedCount}/{contracts.length} deployes
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {contracts.map(([name, info]) => (
              <div
                key={name}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  info.status === 'deployed'
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : info.status === 'not_configured'
                    ? 'bg-slate-700/30 border border-slate-600/30'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  info.status === 'deployed' ? 'bg-emerald-400' :
                  info.status === 'not_configured' ? 'bg-slate-500' : 'bg-red-400'
                }`}></div>
                <span className={`text-sm font-medium truncate ${
                  info.status === 'deployed' ? 'text-emerald-400' :
                  info.status === 'not_configured' ? 'text-slate-400' : 'text-red-400'
                }`}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default NetworkStatsCard;
