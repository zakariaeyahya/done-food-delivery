import React from 'react';

function MetricsGrid({ data }) {
  if (!data) return <div className="animate-pulse bg-gray-700 h-64 rounded-xl"></div>;

  const { transactions, latency, gas, volume } = data;

  return (
    <div className="space-y-6">

      {/* Transactions & Latency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Transactions Card */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Transactions
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{transactions.total}</p>
              <p className="text-gray-400 text-sm">Total</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{transactions.today}</p>
              <p className="text-gray-400 text-sm">Aujourd'hui</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{transactions.successRate}%</p>
              <p className="text-gray-400 text-sm">Succes</p>
            </div>
          </div>
        </div>

        {/* Latency Card */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>⏱️</span> Latence (secondes)
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className={`text-2xl font-bold ${
                latency.average < 3 ? 'text-green-400' :
                latency.average < 5 ? 'text-yellow-400' : 'text-red-400'
              }`}>{latency.average}s</p>
              <p className="text-gray-400 text-xs">Moyenne</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{latency.min}s</p>
              <p className="text-gray-400 text-xs">Min</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{latency.max}s</p>
              <p className="text-gray-400 text-xs">Max</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{latency.p95}s</p>
              <p className="text-gray-400 text-xs">P95</p>
            </div>
          </div>
        </div>

      </div>

      {/* Gas & Volume */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Gas Card */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>⛽</span> Gas
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">
                {gas.priceGwei?.toFixed(1)}
              </p>
              <p className="text-gray-400 text-xs">Prix Gwei</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {gas.averageUsed?.toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs">Units/Tx</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {gas.totalSpent} POL
              </p>
              <p className="text-gray-400 text-xs">Cout Total</p>
            </div>
          </div>
        </div>

        {/* Volume Card */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>💰</span> Volume
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total POL</span>
              <span className="text-2xl font-bold text-green-400">{volume.totalPol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Commandes</span>
              <span className="text-xl font-bold text-white">{volume.ordersProcessed}</span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <p className="text-gray-400 text-xs mb-2">Repartition PaymentSplit:</p>
              <div className="flex gap-2 text-xs">
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  Restaurants: {volume.paymentsplit.restaurants}
                </span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  Livreurs: {volume.paymentsplit.deliverers}
                </span>
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  Plateforme: {volume.paymentsplit.platform}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default MetricsGrid;
