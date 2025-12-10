/**
 * Composant ConnectWallet - Restaurant
 * @notice Gère la connexion au wallet MetaMask pour le restaurant
 * @dev Détecte MetaMask, connecte le wallet, vérifie le rôle RESTAURANT_ROLE, fetch restaurant profile
 */

<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
=======
import { useState, useEffect } from 'react';
import * as blockchain from '../services/blockchain';
import * as api from '../services/api';
import { formatAddress } from '../utils/web3';
import { ethers } from 'ethers';
>>>>>>> main

// Définir le rôle RESTAURANT_ROLE (bytes32)
const RESTAURANT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RESTAURANT_ROLE"));

/**
 * Composant ConnectWallet
 * @param {Function} onConnect - Callback appelé après connexion réussie avec { address, restaurant }
 * @returns {JSX.Element} Composant de connexion wallet restaurant
 */
function ConnectWallet({ onConnect }) {
  const navigate = useNavigate();
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasRole, setHasRole] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
<<<<<<< HEAD
  const [needsRegistration, setNeedsRegistration] = useState(false);

  const RESTAURANT_ROLE = useMemo(
    () => ethers.keccak256(ethers.toUtf8Bytes("RESTAURANT_ROLE")),
    []
  );

  // Vérifier MetaMask au montage + auto-reconnect si address sauvée
=======
  
  // useEffect pour vérifier MetaMask au montage
>>>>>>> main
  useEffect(() => {
    if (window.ethereum) {
      setIsMetaMaskInstalled(true);
      
      // Vérifier si wallet déjà connecté (localStorage)
      const savedAddress = localStorage.getItem('restaurantWalletAddress');
      if (savedAddress) {
        setAddress(savedAddress);
        checkRoleAndFetchRestaurant(savedAddress);
      }
    } else {
      setIsMetaMaskInstalled(false);
    }
  }, []);
  
  // Fonction pour vérifier le rôle RESTAURANT_ROLE
  async function checkRole(address) {
    try {
      // Mode développement - skip la vérification du rôle
      const devMode = import.meta.env.VITE_DEV_MODE === 'true';
      if (devMode) {
        console.info('🔧 Mode développement: Vérification du rôle ignorée.');
        setHasRole(true);
        return true;
      }

      // Vérifier si les contrats sont configurés
      const orderManagerAddress = import.meta.env.VITE_ORDER_MANAGER_ADDRESS;
      if (!orderManagerAddress || orderManagerAddress === '') {
        console.warn('Mode développement: VITE_ORDER_MANAGER_ADDRESS non configuré. Vérification du rôle ignorée.');
        setHasRole(true);
        return true;
      }

      const hasRestaurantRole = await blockchain.hasRole(RESTAURANT_ROLE, address);
      setHasRole(hasRestaurantRole);

      if (!hasRestaurantRole) {
        setError('Cette adresse n\'a pas le rôle RESTAURANT_ROLE. Veuillez contacter l\'administrateur.');
      }

      return hasRestaurantRole;
    } catch (error) {
      console.error('Error checking role:', error);
      // En cas d'erreur de connexion au contrat, continuer en mode dev
      if (error.message && (error.message.includes('not configured') || error.message.includes('fallback'))) {
        console.warn('Mode développement: Erreur RPC. Vérification du rôle ignorée.');
        setHasRole(true);
        return true;
      }
      setError(`Erreur lors de la vérification du rôle: ${error.message}`);
      return false;
    }
  }
  
  // Fonction pour récupérer le profil restaurant depuis l'API
  async function fetchRestaurantProfile(address) {
    try {
      if (!address) return null;

      // L'API backend supporte la récupération par adresse via getRestaurantByAddress
      const response = await api.getRestaurantByAddress(address);

      // L'API retourne { success: true, restaurant: {...} }
      let restaurantData = null;
      if (response.success && response.restaurant) {
        restaurantData = response.restaurant;
      } else if (response.restaurant) {
        // Format alternatif si l'API retourne directement le restaurant
        restaurantData = response.restaurant;
      }

      if (restaurantData) {
        setRestaurant(restaurantData);
      }

      // Appeler callback onConnect si fourni
      if (onConnect) {
        onConnect({ address, restaurant: restaurantData });
      }

      return restaurantData;
    } catch (error) {
      // 404 = restaurant non enregistré, c'est normal pour les nouveaux utilisateurs
      if (error.message && error.message.includes('404')) {
        console.info('Restaurant non enregistré pour cette adresse - formulaire d\'inscription requis');
        // Ne pas afficher d'erreur, le formulaire d'inscription sera affiché
        if (onConnect) {
          onConnect({ address, restaurant: null });
        }
        return null;
      }
      // Autres erreurs
      console.error('Error fetching restaurant profile:', error);
      setError(`Erreur lors de la récupération du profil: ${error.message}`);
      return null;
    }
  }
  
  // Fonction pour récupérer le solde MATIC
  async function fetchBalance(address) {
    try {
      if (!address) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(address);
      const balanceEther = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEther).toFixed(4));
    } catch (error) {
      // Erreur RPC silencieuse - ne pas bloquer l'utilisateur
      console.info('Balance non disponible (RPC):', error.message?.slice(0, 50) || 'Erreur reseau');
      setBalance('--');
    }
  }
  
  // Fonction pour vérifier le réseau
  async function checkNetwork() {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      // Polygon Amoy = 80002, Mumbai = 80001
      if (network.chainId === BigInt(80002)) {
        setNetwork('Polygon Amoy');
      } else if (network.chainId === BigInt(80001)) {
        setNetwork('Polygon Mumbai');
      } else {
        setNetwork(`Réseau incorrect (${network.chainId})`);
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  }
  
  // Fonction pour vérifier rôle et fetch restaurant
  async function checkRoleAndFetchRestaurant(address) {
    const hasRestaurantRole = await checkRole(address);
    if (hasRestaurantRole) {
      await fetchRestaurantProfile(address);
      await fetchBalance(address);
      await checkNetwork();
    }
  }
  
  // Fonction pour connecter le wallet
  async function handleConnect() {
    try {
      setIsConnecting(true);
      setError(null);
      
      if (!window.ethereum) {
        setError('MetaMask n\'est pas installé');
        setIsMetaMaskInstalled(false);
        return;
      }
      
      // Connecter wallet
      const { address: connectedAddress } = await blockchain.connectWallet();
      setAddress(connectedAddress);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('restaurantWalletAddress', connectedAddress);
      
      // Vérifier rôle et fetch restaurant
      await checkRoleAndFetchRestaurant(connectedAddress);
      
    } catch (error) {
      if (error.message && (error.message.includes('rejected') || error.message.includes('User rejected'))) {
        setError('Connexion refusée par l\'utilisateur');
      } else if (error.message && error.message.includes('Contract addresses not configured')) {
        setError('⚠️ Adresses des contrats non configurées. Vérifiez le fichier .env');
      } else {
        setError('Erreur lors de la connexion: ' + (error.message || error));
      }
    } finally {
      setIsConnecting(false);
    }
  }
  
  // Fonction pour déconnecter
  function handleDisconnect() {
    setAddress(null);
    setHasRole(false);
    setRestaurant(null);
    setBalance('0');
    setNetwork(null);
    localStorage.removeItem('restaurantWalletAddress');
    if (onConnect) {
      onConnect({ address: null, restaurant: null });
    }
  }
  
  // Rendu du composant
  return (
    <div className="connect-wallet flex items-center gap-2">
      {!isMetaMaskInstalled ? (
        <div className="metamask-not-installed p-2 bg-warning-100 rounded">
          <p className="text-sm text-warning-800">MetaMask n'est pas installé</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:underline"
          >
            Installer MetaMask
          </a>
        </div>
      ) : !address ? (
        <button 
          onClick={handleConnect} 
          disabled={isConnecting}
          className="btn btn-primary"
        >
          {isConnecting ? 'Connexion...' : 'Connecter le wallet'}
        </button>
      ) : (
        <div className="wallet-connected flex items-center gap-3">
          <div className="wallet-info flex flex-col items-end">
            <span className="address text-sm font-medium">{formatAddress(address)}</span>
            {hasRole ? (
              <span className="role text-xs text-success-600">✓ Restaurant vérifié</span>
            ) : (
              <span className="role text-xs text-error-600">✗ Rôle non vérifié</span>
            )}
            <span className="network text-xs text-gray-500">{network || 'Vérification...'}</span>
            <span className="balance text-xs text-gray-600">{balance} MATIC</span>
          </div>
          <button onClick={handleDisconnect} className="btn btn-secondary btn-sm">
            Déconnecter
          </button>
        </div>
      )}
      
      {error && (
        <div className="error-message text-xs text-error-600 bg-error-50 p-2 rounded">
          {error}
        </div>
      )}
      
      {network && network !== 'Polygon Amoy' && address && (
        <button onClick={() => blockchain.switchToAmoyNetwork()} className="btn btn-warning btn-sm">
          Switcher vers Polygon Amoy
        </button>
      )}
    </div>
  );
}

export default ConnectWallet;
