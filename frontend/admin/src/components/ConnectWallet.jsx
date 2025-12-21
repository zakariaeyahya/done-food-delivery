import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';

function ConnectWallet() {
  const { connect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  async function handleConnect() {
    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      await connect();
    } catch (err) {
      setError(err.message || 'Erreur lors de la connexion du wallet');
    }

    setIsConnecting(false);
  }

  if (!window.ethereum) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">MetaMask requis</h2>
          <p className="text-gray-600 mb-4">MetaMask n'est pas installé.</p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Installer MetaMask
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Connexion Admin</h2>
        <p className="text-gray-600 mb-6">
          Connectez votre wallet MetaMask pour accéder au dashboard admin.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isConnecting ? 'Connexion...' : 'Connecter MetaMask'}
        </button>
      </div>
    </div>
  );
}

export default ConnectWallet;
