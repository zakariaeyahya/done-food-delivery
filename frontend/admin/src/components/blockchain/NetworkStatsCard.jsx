import React from 'react';

function NetworkStatsCard({ network, health }) {
  if (!network) return <div className="animate-pulse bg-gray-700 h-32 rounded-xl"></div>;

  const isConnected = network.isConnected;
  const gasLevel = network.gasPrice?.gwei < 30 ? 'low' : network.gasPrice?.gwei < 100 ? 'medium' : 'high';

  return (
    <div className={`rounded-xl p-6 ${
      health?.overall === 'healthy'
        ? 'bg-green-900/20 border border-green-500/30'
        : 'bg-red-900/20 border border-red-500/30'
    }`}>

      {/* Status Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{isConnected ? '🟢' : '🔴'}</span>
          <div>
            <h3 className="text-xl font-bold text-white">Polygon Amoy</h3>
            <p className="text-gray-400 text-sm">
              {isConnected ? 'Connecte' : 'Deconnecte'}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
          health?.overall === 'healthy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {health?.overall === 'healthy' ? 'OK' : 'ERREUR'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Block Number */}
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-xs uppercase">Block</p>
          <p className="text-2xl font-bold text-white">
            {network.blockNumber?.toLocaleString() || '-'}
          </p>
        </div>

        {/* Gas Price */}
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-xs uppercase">Gas Price</p>
          <p className={`text-2xl font-bold ${
            gasLevel === 'low' ? 'text-green-400' :
            gasLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {network.gasPrice?.gwei?.toFixed(1) || '-'} <span className="text-sm">Gwei</span>
          </p>
        </div>

        {/* Chain ID */}
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-xs uppercase">Chain ID</p>
          <p className="text-2xl font-bold text-white">
            {network.chainId || '-'}
          </p>
        </div>

        {/* Last Block */}
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-xs uppercase">Dernier Bloc</p>
          <p className="text-2xl font-bold text-white">
            {network.timeSinceLastBlock?.toFixed(0) || '-'}s
          </p>
        </div>

      </div>

      {/* Contracts Status */}
      {health?.contracts && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-xs uppercase mb-2">Contrats</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(health.contracts).map(([name, info]) => (
              <span key={name} className={`px-2 py-1 rounded text-xs ${
                info.status === 'deployed' ? 'bg-green-500/20 text-green-400' :
                info.status === 'not_configured' ? 'bg-gray-500/20 text-gray-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {name}: {info.status === 'deployed' ? '✓' : info.status === 'not_configured' ? '?' : '✗'}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default NetworkStatsCard;
