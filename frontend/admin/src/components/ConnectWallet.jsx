/**
 * Composant ConnectWallet - Connexion MetaMask Admin
 * @notice Permet de connecter MetaMask et vérifier le rôle PLATFORM/ADMIN
 * @dev Vérifie le rôle via blockchain.hasRole() avant d'autoriser l'accès
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Services blockchain
import * as blockchainService from '../services/blockchain';

// Utils
import { formatAddress } from '../utils/web3';

function ConnectWallet({ onConnect, onDisconnect }) {
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState(null);
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Vérifier si MetaMask est installé lors du chargement
   */
  useEffect(() => {
    if (!window.ethereum) {
      setError(
        "MetaMask n'est pas installé. Veuillez installer l'extension MetaMask."
      );
    }
  }, []);

  /**
   * Fonction de connexion du wallet
   */
  async function handleConnect() {
    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      // Connexion MetaMask
      const { address: connectedAddress } = await blockchainService.connectWallet();
      setAddress(connectedAddress);

      // Sauvegarde locale
      localStorage.setItem('adminWalletAddress', connectedAddress);

      // Récupération solde
      const provider = blockchainService.getProvider();
      const balanceWei = await provider.getBalance(connectedAddress);
      const balanceEther = ethers.formatEther(balanceWei);
      setBalance(balanceEther);

      // Vérification du rôle PLATFORM
      const PLATFORM_ROLE = ethers.id("PLATFORM_ROLE");
      const hasRole = await blockchainService.hasRole(
        connectedAddress,
        PLATFORM_ROLE
      );

      if (!hasRole) {
        setError(
          "Vous n'avez pas les droits administrateur. Seuls les comptes avec le rôle PLATFORM peuvent accéder au dashboard admin."
        );
        setAddress(null);
        localStorage.removeItem('adminWalletAddress');
        setIsConnecting(false);
        return;
      }

      setHasAdminRole(true);

      if (onConnect) onConnect(connectedAddress);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Erreur lors de la connexion du wallet');
    }

    setIsConnecting(false);
  }

  /**
   * Déconnexion du wallet
   */
  function handleDisconnect() {
    setAddress(null);
    setBalance(null);
    setHasAdminRole(false);
    setError(null);
    localStorage.removeItem('adminWalletAddress');

    if (onDisconnect) onDisconnect();
  }

  /**
   * Reconnexion automatique si wallet déjà enregistré
   */
  useEffect(() => {
    const saved = localStorage.getItem('adminWalletAddress');
    if (saved) {
      handleConnect();
    }
  }, []);

  /**
   * Si MetaMask n'est pas installé
   */
  if (!window.ethereum) {
    return (
      <div className="connect-wallet-error">
        <p>MetaMask n'est pas installé.</p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Installer MetaMask
        </a>
      </div>
    );
  }

  /**
   * Si connecté + rôle valide
   */
  if (address && hasAdminRole) {
    return (
      <div className="connect-wallet-connected">
        <div className="wallet-info">
          <span className="address">{formatAddress(address)}</span>
          <span className="balance">
            {parseFloat(balance).toFixed(4)} MATIC
          </span>
        </div>

        <button onClick={handleDisconnect} className="btn btn-outline">
          Déconnecter
        </button>
      </div>
    );
  }

  /**
   * Formulaire de connexion
   */
  return (
    <div className="connect-wallet">
      <h2>Connexion Admin</h2>
      <p>
        Connectez votre wallet MetaMask avec le rôle PLATFORM pour accéder au
        dashboard admin.
      </p>

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="btn btn-primary"
      >
        {isConnecting ? 'Connexion...' : 'Connecter MetaMask'}
      </button>
    </div>
  );
}

export default ConnectWallet;
