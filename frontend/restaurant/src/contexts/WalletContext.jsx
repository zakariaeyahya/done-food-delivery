import { useState, useEffect, createContext, useContext } from 'react';
import * as blockchain from '../services/blockchain';
import * as api from '../services/api';
const STORAGE_KEYS = {
  ADDRESS: 'restaurantWalletAddress',
  RESTAURANT: 'restaurantData',
};

export const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState('0');
  const [restaurant, setRestaurant] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  function saveRestaurantToStorage(data) {
    if (data) {
      localStorage.setItem(STORAGE_KEYS.RESTAURANT, JSON.stringify(data));
    }
  }

  function loadRestaurantFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESTAURANT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
    }
    return null;
  }

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
      return null;
    }
  }

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

  async function connect() {
    try {
      const { address: connectedAddress } = await blockchain.connectWallet();
      setAddress(connectedAddress);
      setIsConnected(true);
      localStorage.setItem(STORAGE_KEYS.ADDRESS, connectedAddress);
      const savedRestaurant = loadRestaurantFromStorage();
      if (savedRestaurant && savedRestaurant.address?.toLowerCase() === connectedAddress.toLowerCase()) {
        setRestaurant(savedRestaurant);
      } else {
        await fetchRestaurantProfile(connectedAddress);
      }
    } catch (error) {
    }
  }

  function onRegistrationSuccess(restaurantData) {
    setRestaurant(restaurantData);
    saveRestaurantToStorage(restaurantData);
  }

  async function refreshRestaurant() {
    if (address) {
      const data = await fetchRestaurantProfile(address);
      return data;
    }
    return null;
  }

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

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
