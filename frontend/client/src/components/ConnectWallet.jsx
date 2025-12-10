import React, { useState, useEffect } from 'react';
import { connectWallet } from '../services/blockchain';

const ConnectWallet = () => {
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      setConnected(true);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      setConnected(true);
    }
  }, []);

  return (
    <div className="p-6 max-w-sm mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl text-white text-center font-bold text-xl">
      {!connected ? (
        <button
          onClick={handleConnect}
          className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all"
        >
          Connect Wallet
        </button>
      ) : (
        <p>Wallet Connected</p>
      )}
    </div>
  );
};

export default ConnectWallet;
