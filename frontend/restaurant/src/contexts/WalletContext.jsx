/**
 * Context WalletContext - Restaurant
 * @notice Fournit wallet, address, balance, restaurant à toute l'application
 * @dev Gère l'état du wallet restaurant et fournit les méthodes de connexion
 */

import { useState, useEffect, createContext, useContext } from 'react';
import * as blockchain from '../services/blockchain';
import * as api from '../services/api';

// Clés localStorage
const STORAGE_KEYS = {
  ADDRESS: 'restaurantWalletAddress',
  RESTAURANT: 'restaurantData',
};

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

  // Sauvegarder restaurant dans localStorage
  function saveRestaurantToStorage(data) {
    if (data) {
      localStorage.setItem(STORAGE_KEYS.RESTAURANT, JSON.stringify(data));
    }
  }

  // Charger restaurant depuis localStorage
  function loadRestaurantFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESTAURANT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error loading restaurant from localStorage:', e);
    }
    return null;
  }

  // Fonction pour charger restaurant profile depuis l'API
  async function fetchRestaurantProfile(addr) {
    try {
      const restaurantData = await api.getRestaurantByAddress(addr);
      if (restaurantData) {
        setRestaurant(restaurantData);
        saveRestaurantToStorage(restaurantData);
        return restaurantData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching restaurant profile:', error);
      return null;
    }
  }

  // useEffect pour charger wallet et restaurant depuis localStorage
  useEffect(() => {
    async function init() {
      const savedAddress = localStorage.getItem(STORAGE_KEYS.ADDRESS);
      const savedRestaurant = loadRestaurantFromStorage();

      if (savedAddress) {
        setAddress(savedAddress);
        setIsConnected(true);

        // Charger restaurant depuis localStorage d'abord (instantané)
        if (savedRestaurant && savedRestaurant.address?.toLowerCase() === savedAddress.toLowerCase()) {
          setRestaurant(savedRestaurant);
        }

        // Optionnel: rafraîchir depuis l'API en arrière-plan (silencieusement)
        // Décommenter si vous voulez toujours avoir les données à jour
        // fetchRestaurantProfile(savedAddress);
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
      localStorage.setItem(STORAGE_KEYS.ADDRESS, connectedAddress);

      // Vérifier si restaurant existe dans localStorage
      const savedRestaurant = loadRestaurantFromStorage();
      if (savedRestaurant && savedRestaurant.address?.toLowerCase() === connectedAddress.toLowerCase()) {
        setRestaurant(savedRestaurant);
      } else {
        // Essayer de fetch depuis l'API
        await fetchRestaurantProfile(connectedAddress);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  // Fonction appelée après inscription réussie
  function onRegistrationSuccess(restaurantData) {
    setRestaurant(restaurantData);
    saveRestaurantToStorage(restaurantData);
  }

  // Fonction pour rafraîchir le profil restaurant depuis l'API
  async function refreshRestaurant() {
    if (address) {
      const data = await fetchRestaurantProfile(address);
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
    localStorage.removeItem(STORAGE_KEYS.ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.RESTAURANT);
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
