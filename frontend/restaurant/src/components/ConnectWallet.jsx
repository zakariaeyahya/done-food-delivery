/**
 * Composant ConnectWallet - Restaurant
 * @notice Gère la connexion au wallet MetaMask pour le restaurant
 * @dev Détecte MetaMask, connecte le wallet, vérifie le rôle RESTAURANT_ROLE, fetch restaurant profile
 */

import { useState, useEffect } from 'react';
import * as blockchain from '../services/blockchain';
import { useWallet } from '../contexts/WalletContext';
import { formatAddress } from '../utils/web3';
import { ethers } from 'ethers';

/**
 * Composant ConnectWallet
 * @returns {JSX.Element} Composant de connexion wallet restaurant
 */
function ConnectWallet() {
  const { address, restaurant, isConnected, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // useEffect pour vérifier MetaMask au montage
  useEffect(() => {
    if (window.ethereum) {
      setIsMetaMaskInstalled(true);
      if (address) {
        fetchBalance(address);
        checkNetwork();
      }
    } else {
      setIsMetaMaskInstalled(false);
    }
  }, [address]);
  
  // Fonction pour récupérer le solde MATIC
  async function fetchBalance(addr) {
    try {
      if (!addr) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(addr);
      const balanceEther = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEther).toFixed(4));
    } catch (error) {
      console.info('Balance non disponible (RPC):', error.message?.slice(0, 50) || 'Erreur reseau');
      setBalance('--');
    }
  }

  // Fonction pour vérifier le réseau
  async function checkNetwork() {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const net = await provider.getNetwork();
      if (net.chainId === BigInt(80002)) {
        setNetwork('Polygon Amoy');
      } else if (net.chainId === BigInt(80001)) {
        setNetwork('Polygon Mumbai');
      } else {
        setNetwork(`Réseau incorrect (${net.chainId})`);
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  }

  // Fonction pour connecter le wallet (utilise le context)
  async function handleConnect() {
    try {
      setIsConnecting(true);
      setError(null);
      if (!window.ethereum) {
        setError('MetaMask n\'est pas installé');
        setIsMetaMaskInstalled(false);
        return;
      }
      await connect(); // Utilise la fonction connect du WalletContext
    } catch (error) {
      if (error.message && (error.message.includes('rejected') || error.message.includes('User rejected'))) {
        setError('Connexion refusée par l\'utilisateur');
      } else {
        setError('Erreur lors de la connexion: ' + (error.message || error));
      }
    } finally {
      setIsConnecting(false);
    }
  }

  // Fonction pour déconnecter (utilise le context)
  function handleDisconnect() {
    setBalance('0');
    setNetwork(null);
    disconnect(); // Utilise la fonction disconnect du WalletContext
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
            className="text-sm text-orange-600 hover:underline"
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
            {restaurant ? (
              <span className="role text-xs text-success-600">✓ {restaurant.name}</span>
            ) : (
              <span className="role text-xs text-warning-600">⚠ Non enregistré</span>
            )}
            <span className="network text-xs text-gray-500">{network || 'Vérification...'}</span>
            <span className="balance text-xs text-gray-600">{balance} POL</span>
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
