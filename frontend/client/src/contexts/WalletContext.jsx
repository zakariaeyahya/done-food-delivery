/**
 * Context WalletContext
 * @notice Fournit wallet, address, balance à toute l'application
 * @dev Gère connexion/déconnexion wallet, récupération solde
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as blockchain from '../services/blockchain';

export const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  async function connect() {
    try {
      setIsConnecting(true);
      
      const connectedAddress = await blockchain.connectWallet();
      
      if (!connectedAddress) {
        throw new Error('No address returned from connectWallet');
      }

      setAddress(connectedAddress);
      setIsConnected(true);

      // Récupérer le solde MATIC
      const maticBalance = await blockchain.getMaticBalance(connectedAddress);
      setBalance(maticBalance);

      // Sauvegarder dans localStorage
      localStorage.setItem('walletAddress', connectedAddress);
      
    } catch (error) {
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnect() {
    setAddress(null);
    setBalance('0');
    setIsConnected(false);
    localStorage.removeItem('walletAddress');
  }

  async function refreshBalance() {
    try {
      if (!address) return;
      const maticBalance = await blockchain.getMaticBalance(address);
      setBalance(maticBalance);
    } catch (error) {
    }
  }

  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
      
      blockchain
        .getMaticBalance(savedAddress)
        .then(setBalance)
        .catch((err) => {});
    }
  }, []);

  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 30000);

    return () => clearInterval(interval);
  }, [address]);

  const value = {
    address,
    balance,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    refreshBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used inside <WalletProvider>');
  }
  return ctx;
}