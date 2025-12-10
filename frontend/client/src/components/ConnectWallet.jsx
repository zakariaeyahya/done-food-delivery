import React, { useState, useEffect } from 'react';
import {
  connectWallet,
  getMaticBalance,
  getDoneTokenBalance,
  verifyMumbaiNetwork,
} from '../services/blockchain';
import { formatAddress, formatMatic, formatUnits } from '../utils/web3';

const ConnectWallet = () => {
  const [address, setAddress] = useState(null);
  const [maticBalance, setMaticBalance] = useState('');
  const [doneBalance, setDoneBalance] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      setError('');
      const walletAddress = await connectWallet();
      setAddress(walletAddress);
      await fetchWalletData(walletAddress);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
    }
  };

  const fetchWalletData = async (walletAddress) => {
    try {
      const onMumbai = await verifyMumbaiNetwork();
      setIsCorrectNetwork(onMumbai);

      if (onMumbai) {
        const matic = await getMaticBalance(walletAddress);
        const done = await getDoneTokenBalance(walletAddress);
        setMaticBalance(matic);
        setDoneBalance(done);
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Error fetching wallet data. Is your DONE token contract address set correctly?');
    }
  };

  useEffect(() => {
    // Optional: Check if already connected on page load
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        handleConnect();
      }
    };
    checkConnection();

    // Listen for account changes in MetaMask
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                handleConnect();
            } else {
                setAddress(null);
                setMaticBalance('');
                setDoneBalance('');
            }
        });

        window.ethereum.on('chainChanged', () => {
            // Reload or re-verify network on chain change
            handleConnect();
        });
    }
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      {!address ? (
        <button
          onClick={handleConnect}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          Connect MetaMask
        </button>
      ) : (
        <div>
          <h3 className="text-lg font-semibold">Wallet Connected</h3>
          <p className="text-sm text-gray-600">Address: {formatAddress(address)}</p>
          
          {!isCorrectNetwork ? (
            <div className="p-2 mt-2 text-yellow-800 bg-yellow-200 rounded">
              Warning: Please switch to the Polygon Mumbai network.
            </div>
          ) : (
            <div className="mt-2">
              <p>MATIC Balance: {parseFloat(maticBalance).toFixed(4)}</p>
              <p>DONE Balance: {parseFloat(doneBalance).toFixed(4)}</p>
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ConnectWallet;