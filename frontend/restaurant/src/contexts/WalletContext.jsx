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
  const [loading, setLoading] = useState(true);

  // Fonction pour charger restaurant profile
  async function fetchRestaurantProfile(addr) {
    try {
      // Chercher restaurant par address (retourne null si non trouvé)
      const restaurantData = await api.getRestaurantByAddress(addr);
      setRestaurant(restaurantData);
      return restaurantData;
    } catch (error) {
      console.error('Error fetching restaurant profile:', error);
      setRestaurant(null);
      return null;
    }
  }

  // useEffect pour charger wallet depuis localStorage
  useEffect(() => {
    async function init() {
      const savedAddress = localStorage.getItem('restaurantWalletAddress');
      const isRegistered = localStorage.getItem('restaurantIsRegistered');

      if (savedAddress) {
        setAddress(savedAddress);
        setIsConnected(true);

        // Seulement fetch si marqué comme enregistré
        if (isRegistered === 'true') {
          await fetchRestaurantProfile(savedAddress);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  // Fonction pour connecter wallet
  async function connect() {
    try {
      const { address: connectedAddress } = await blockchain.connectWallet();
      setAddress(connectedAddress);
      setIsConnected(true);
      localStorage.setItem('restaurantWalletAddress', connectedAddress);
      // Ne pas fetch ici - laisser RegisterPage gérer
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  // Fonction appelée après inscription réussie
  async function onRegistrationSuccess(restaurantData) {
    setRestaurant(restaurantData);
    localStorage.setItem('restaurantIsRegistered', 'true');
  }

  // Fonction pour rafraîchir le profil restaurant (appelée manuellement)
  async function refreshRestaurant() {
    if (address) {
      const data = await fetchRestaurantProfile(address);
      if (data) {
        localStorage.setItem('restaurantIsRegistered', 'true');
      }
      return data;
    }
    return null;
  }

  // Fonction pour déconnecter wallet
  function disconnect() {
    setAddress(null);
    setBalance('0');
    setRestaurant(null);
    setIsConnected(false);
    localStorage.removeItem('restaurantWalletAddress');
    localStorage.removeItem('restaurantIsRegistered');
  }

  return (
    <WalletContext.Provider value={{
      address,
      balance,
      restaurant,
      isConnected,
      loading,
      connect,
      disconnect,
      onRegistrationSuccess,
      refreshRestaurant
    }}>
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
