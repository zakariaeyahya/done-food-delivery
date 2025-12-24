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

      // Forcer MetaMask à ouvrir le sélecteur de compte
      const accounts = await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      }).then(() =>
        window.ethereum.request({ method: 'eth_accounts' })
      );

      if (!accounts || accounts.length === 0) {
        throw new Error('Aucun compte sélectionné');
      }

      const connectedAddress = accounts[0].toLowerCase();
      console.log('[WalletContext] Compte connecté:', connectedAddress);

      setAddress(connectedAddress);
      setIsConnected(true);

      // Récupérer le solde MATIC
      const maticBalance = await blockchain.getMaticBalance(connectedAddress);
      setBalance(maticBalance);

      // Sauvegarder dans localStorage
      localStorage.setItem('walletAddress', connectedAddress);

    } catch (error) {
      // Si l'utilisateur annule, essayer la méthode classique
      if (error.code === 4001) {
        throw new Error('Connexion annulée par l\'utilisateur');
      }

      // Fallback: méthode classique
      const connectedAddress = await blockchain.connectWallet();

      if (!connectedAddress) {
        throw new Error('No address returned from connectWallet');
      }

      setAddress(connectedAddress);
      setIsConnected(true);

      const maticBalance = await blockchain.getMaticBalance(connectedAddress);
      setBalance(maticBalance);
      localStorage.setItem('walletAddress', connectedAddress);

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

    // Écouter les changements de compte MetaMask
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // L'utilisateur a déconnecté tous les comptes
          disconnect();
        } else {
          const newAddress = accounts[0].toLowerCase();
          const currentAddress = address?.toLowerCase();

          if (newAddress !== currentAddress) {
            console.log('[WalletContext] Compte MetaMask changé:', newAddress);
            setAddress(newAddress);
            setIsConnected(true);
            localStorage.setItem('walletAddress', newAddress);

            // Mettre à jour le solde
            try {
              const maticBalance = await blockchain.getMaticBalance(newAddress);
              setBalance(maticBalance);
            } catch (err) {
              console.error('[WalletContext] Erreur récupération solde:', err);
            }
          }
        }
      };

      const handleChainChanged = () => {
        // Recharger la page si le réseau change
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Vérifier le compte actuel au chargement
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        if (accounts.length > 0) {
          const currentMetaMaskAddress = accounts[0].toLowerCase();
          const savedAddr = savedAddress?.toLowerCase();

          if (currentMetaMaskAddress !== savedAddr) {
            console.log('[WalletContext] Sync avec MetaMask:', currentMetaMaskAddress);
            setAddress(currentMetaMaskAddress);
            setIsConnected(true);
            localStorage.setItem('walletAddress', currentMetaMaskAddress);
            blockchain.getMaticBalance(currentMetaMaskAddress).then(setBalance).catch(() => {});
          }
        }
      });

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
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