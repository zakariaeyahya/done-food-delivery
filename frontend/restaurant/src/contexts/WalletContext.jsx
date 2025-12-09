/**
 * Context WalletContext - Restaurant
 * @notice Fournit wallet, address, balance, restaurant à toute l'application
 * @dev Gère l'état du wallet restaurant et fournit les méthodes de connexion
 */

import { useState, useEffect, createContext, useContext } from 'react';
import * as blockchain from '../services/blockchain';
import * as api from '../services/api';

/**
 * Context pour le Wallet Restaurant
 */
export const WalletContext = createContext(null);

/**
 * Provider pour WalletContext
 * @notice Gère l'état du wallet restaurant et fournit les méthodes de connexion
 */
export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState('0');
  const [restaurant, setRestaurant] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fonction pour charger restaurant profile
  async function fetchRestaurantProfile(address) {
    try {
      // Chercher restaurant par address
      const restaurantData = await api.getRestaurantByAddress(address);
      setRestaurant(restaurantData);
    } catch (error) {
      console.error('Error fetching restaurant profile:', error);
    }
  }

  // useEffect pour charger wallet depuis localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('restaurantWalletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
      // Charger restaurant profile
      fetchRestaurantProfile(savedAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fonction pour connecter wallet
  async function connect() {
    try {
      const { address: connectedAddress } = await blockchain.connectWallet();
      setAddress(connectedAddress);
      setIsConnected(true);
      localStorage.setItem('restaurantWalletAddress', connectedAddress);
      await fetchRestaurantProfile(connectedAddress);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  // Fonction pour déconnecter wallet
  function disconnect() {
    setAddress(null);
    setBalance('0');
    setRestaurant(null);
    setIsConnected(false);
    localStorage.removeItem('restaurantWalletAddress');
  }

  return (
    <WalletContext.Provider value={{ address, balance, restaurant, isConnected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook useWallet
 * @notice Hook personnalisé pour accéder au contexte Wallet
 * @returns {Object} { address, balance, restaurant, isConnected, connect, disconnect }
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}