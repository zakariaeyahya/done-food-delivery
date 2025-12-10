import React, { useState, useEffect } from 'react';
import {
  connectWallet,
  getMaticBalance,
  getDoneTokenBalance,
  verifyAmoyNetwork,
  switchToAmoyNetwork,
  isContractsConfigured,
} from '../services/blockchain';
import { formatAddress } from '../utils/web3';

const ConnectWallet = () => {
  const [address, setAddress] = useState(null);
  const [maticBalance, setMaticBalance] = useState('0');
  const [doneBalance, setDoneBalance] = useState('0');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [contractsReady, setContractsReady] = useState(false);

  useEffect(() => {
    setContractsReady(isContractsConfigured());
  }, []);

  const handleConnect = async () => {
    try {
      setError('');
      setIsConnecting(true);
      const walletAddress = await connectWallet();
      setAddress(walletAddress);
      await fetchWalletData(walletAddress);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet. Make sure MetaMask is installed and unlocked.');
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchWalletData = async (walletAddress) => {
    try {
      const onAmoy = await verifyAmoyNetwork();
      setIsCorrectNetwork(onAmoy);

      if (onAmoy) {
        const matic = await getMaticBalance(walletAddress);
        setMaticBalance(matic);
        
        if (contractsReady) {
          try {
            const done = await getDoneTokenBalance(walletAddress);
            setDoneBalance(done);
          } catch (tokenErr) {
            console.warn('Failed to fetch DONE balance:', tokenErr.message);
            setDoneBalance('0');
          }
        } else {
          setDoneBalance('N/A');
        }
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Error fetching wallet data.');
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      setError('');
      await switchToAmoyNetwork();
      if (address) {
        await fetchWalletData(address);
      }
    } catch (err) {
      console.error('Failed to switch network:', err);
      setError('Failed to switch to Polygon Amoy network.');
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum?.selectedAddress) {
        await handleConnect();
      }
    };
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          handleConnect();
        } else {
          setAddress(null);
          setMaticBalance('0');
          setDoneBalance('0');
        }
      };

      const handleChainChanged = () => {
        handleConnect();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      {!address ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      ) : (
        <div>
          <h3 className="text-lg font-semibold">Wallet Connected</h3>
          <p className="text-sm text-gray-600">Address: {formatAddress(address)}</p>
          
          {!isCorrectNetwork ? (
            <div className="p-2 mt-2 text-yellow-800 bg-yellow-200 rounded">
              <p className="mb-2">Switch to Polygon Amoy network</p>
              <button
                onClick={handleSwitchNetwork}
                className="px-3 py-1 text-sm font-bold text-white bg-yellow-600 rounded hover:bg-yellow-700"
              >
                Switch Network
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <p>MATIC Balance: {parseFloat(maticBalance).toFixed(4)}</p>
              <p>DONE Balance: {contractsReady ? parseFloat(doneBalance).toFixed(4) : 'N/A'}</p>
              {!contractsReady && (
                <p className="text-xs text-gray-500 mt-1">Contracts not configured</p>
              )}
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ConnectWallet;