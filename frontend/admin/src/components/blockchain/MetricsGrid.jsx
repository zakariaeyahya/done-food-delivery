import React from 'react';

function MetricsGrid({ data }) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse bg-slate-800/50 rounded-2xl h-48"></div>
        ))}
      </div>
    );
  }

  const { transactions, latency, gas, volume } = data;

  // Calculate success rate for progress bar
  const successRateValue = transactions?.successRate || 0;

  return (
    <div className="space-y-6">

      {/* Section Title */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Metriques de Performance</h3>
        <div className="h-px flex-1 bg-gradient-to-l from-slate-700 to-transparent"></div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Transactions Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Transactions</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">On-Chain</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white font-mono">{transactions?.total || 0}</p>
              <p className="text-slate-400 text-sm mt-1">Total</p>
            </div>
            <div className="text-center border-x border-slate-700/50">
              <p className="text-3xl font-bold text-emerald-400 font-mono">{transactions?.today || 0}</p>
              <p className="text-slate-400 text-sm mt-1">Aujourd'hui</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400 font-mono">{successRateValue}%</p>
              <p className="text-slate-400 text-sm mt-1">Succes</p>
            </div>
          </div>

          {/* Success Rate Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Taux de reussite</span>
              <span>{successRateValue}%</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${successRateValue}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Latency Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Latence Reseau</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">Secondes</span>
          </div>

          <div className="space-y-4">
            {/* Average - Featured */}
            <div className="bg-slate-700/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Latence Moyenne</p>
                <p className={`text-3xl font-bold font-mono ${
                  latency?.average < 3 ? 'text-emerald-400' :
                  latency?.average < 5 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {latency?.average || 0}
                  <span className="text-lg text-slate-400 ml-1">s</span>
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                latency?.average < 3 ? 'bg-emerald-500/20' :
                latency?.average < 5 ? 'bg-yellow-500/20' : 'bg-red-500/20'
              }`}>
                {latency?.average < 3 ? (
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : latency?.average < 5 ? (
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Min, Max, P95 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-700/20 rounded-lg p-3 text-center">
                <p className="text-emerald-400 text-xl font-bold font-mono">{latency?.min || 0}s</p>
                <p className="text-slate-500 text-xs mt-1">Min</p>
              </div>
              <div className="bg-slate-700/20 rounded-lg p-3 text-center">
                <p className="text-red-400 text-xl font-bold font-mono">{latency?.max || 0}s</p>
                <p className="text-slate-500 text-xs mt-1">Max</p>
              </div>
              <div className="bg-slate-700/20 rounded-lg p-3 text-center">
                <p className="text-yellow-400 text-xl font-bold font-mono">{latency?.p95 || 0}s</p>
                <p className="text-slate-500 text-xs mt-1">P95</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gas Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Gas Fees</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">POL</span>
          </div>

          <div className="space-y-4">
            {/* Gas Price Featured */}
            <div className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4">
              <div>
                <p className="text-slate-400 text-sm">Prix actuel</p>
                <p className="text-3xl font-bold text-orange-400 font-mono">
                  {gas?.priceGwei?.toFixed(1) || 0}
                  <span className="text-lg text-slate-400 ml-1">Gwei</span>
                </p>
              </div>
              {/* Gas Gauge */}
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="35" stroke="#334155" strokeWidth="6" fill="none" />
                  <circle
                    cx="40" cy="40" r="35"
                    stroke="url(#gasGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.min((gas?.priceGwei || 0) / 100 * 220, 220)} 220`}
                  />
                  <defs>
                    <linearGradient id="gasGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="50%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Gas Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/20 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Units par Tx</p>
                <p className="text-white text-lg font-bold font-mono">{gas?.averageUsed?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-slate-700/20 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Cout Total</p>
                <p className="text-purple-400 text-lg font-bold font-mono">{gas?.totalSpent || '0.00'} <span className="text-xs">POL</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Volume Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Volume Economique</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">Off-Chain</span>
          </div>

          {/* Total Volume */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 mb-4 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Volume Total</p>
                <p className="text-3xl font-bold text-emerald-400 font-mono">{volume?.totalPol || '0.00'} <span className="text-lg">POL</span></p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Commandes</p>
                <p className="text-2xl font-bold text-white font-mono">{volume?.ordersProcessed || 0}</p>
              </div>
            </div>
          </div>

          {/* Payment Split */}
          <div>
            <p className="text-slate-400 text-xs mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Repartition PaymentSplit
            </p>
            <div className="space-y-2">
              {/* Restaurants - 70% */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Restaurants</span>
                    <span className="text-blue-400 font-mono">{volume?.paymentsplit?.restaurants || '0.00'} POL</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <span className="text-slate-500 text-xs w-10 text-right">70%</span>
              </div>
              {/* Livreurs - 20% */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Livreurs</span>
                    <span className="text-emerald-400 font-mono">{volume?.paymentsplit?.deliverers || '0.00'} POL</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <span className="text-slate-500 text-xs w-10 text-right">20%</span>
              </div>
              {/* Plateforme - 10% */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Plateforme</span>
                    <span className="text-purple-400 font-mono">{volume?.paymentsplit?.platform || '0.00'} POL</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
                <span className="text-slate-500 text-xs w-10 text-right">10%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MetricsGrid;
