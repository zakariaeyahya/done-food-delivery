import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { registerUser, getUserProfile } from '../services/api';
import { formatAddress } from '../utils/web3';

const ConnectWallet = () => {
  const { address, balance, isConnected, isConnecting, connect, disconnect } = useWallet();

  const handleConnect = async () => {
  try {
    await connect();
    
    const walletAddress = window.ethereum?.selectedAddress;
    if (walletAddress) {
      try {
        await getUserProfile(walletAddress);
      } catch (err) {
        if (err.response?.status === 404) {
          await registerUser({ 
            address: walletAddress,
            name: 'User',
            email: `${walletAddress.slice(0, 8)}@temp.com`
          });
        }
      }
    }
  } catch (err) {
  }

  };

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500">Address</p>
            <p className="font-mono text-sm">{formatAddress(address)}</p>
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500">Balance</p>
            <p className="font-mono text-sm">{parseFloat(balance).toFixed(6)} POL</p>
          </div>
          <button
            onClick={disconnect}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;