/**
 * Composant ConnectWallet pour livreur
 * @fileoverview Gère la connexion MetaMask, rôle DELIVERER, staking et profil
 */

import { useState, useEffect } from "react";
import blockchain, { DELIVERER_ROLE } from "../services/blockchain";
import api from "../services/api";
import { Link } from "react-router-dom";

function ConnectWallet() {
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasRole, setHasRole] = useState(false);
  const [isStaked, setIsStaked] = useState(false);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [deliverer, setDeliverer] = useState(null);
  const [error, setError] = useState(null);

  /** Vérifier si un wallet est déjà connecté */
  useEffect(() => {
    checkWalletConnection();
  }, []);

  async function checkWalletConnection() {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        await handleConnect(accounts[0]);
      }
    } catch (err) {
      console.error("Erreur détection wallet :", err);
    }
  }

  /** Connexion MetaMask */
  async function handleConnect(existingAccount = null) {
    setIsConnecting(true);
    setError(null);

    try {
      let account = existingAccount;

      // 1. Connexion MetaMask si pas de compte déjà fourni
      if (!account) {
        const { address: connectedAddress } = await blockchain.connectWallet();
        setAddress(connectedAddress);
        account = connectedAddress;
      } else {
        setAddress(account);
      }

      // 2. Vérifier rôle DELIVERER_ROLE
      const hasDelivererRole = await blockchain.hasRole(
        DELIVERER_ROLE,
        account
      );
      setHasRole(hasDelivererRole);

      if (!hasDelivererRole) {
        setError("Vous n'avez pas le rôle DELIVERER. Veuillez vous inscrire.");
        return;
      }

      // 3. Vérifier staking
      const staked = await blockchain.isStaked(account);
      setIsStaked(staked);

      if (staked) {
        const stakeInfo = await blockchain.getStakeInfo(account);
        setStakedAmount(stakeInfo.amount);
      }

      // 4. Récupérer profil livreur via backend
      try {
        const profile = await api.getDeliverer(account);
        setDeliverer(profile.deliverer);
      } catch (err) {
        console.log("Livreur non enregistré dans la base backend.");
      }
    } catch (err) {
      setError(`Erreur de connexion : ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  }

  /** Déconnexion locale */
  function handleDisconnect() {
    setAddress(null);
    setHasRole(false);
    setIsStaked(false);
    setStakedAmount(0);
    setDeliverer(null);
    setError(null);
  }

  return (
    <div className="connect-wallet">
      {/* Bouton connexion */}
      {!address && (
        <button onClick={() => handleConnect()} disabled={isConnecting}>
          {isConnecting ? "Connexion..." : "Connecter MetaMask"}
        </button>
      )}

      {/* Wallet connecté */}
      {address && (
        <div className="wallet-info">
          <div className="address">
            Adresse : {address.slice(0, 6)}...{address.slice(-4)}
          </div>

          {/* Vérification rôle */}
          {!hasRole && (
            <div className="error">
              ⚠️ Vous n'avez pas le rôle DELIVERER
            </div>
          )}

          {/* Vérification staking */}
          {hasRole && !isStaked && (
            <div className="warning">
              ⚠️ Vous devez staker minimum 0.1 MATIC pour accepter des commandes.<br />
              <Link to="/profile">→ Aller au StakingPanel</Link>
            </div>
          )}

          {/* Staking OK */}
          {hasRole && isStaked && (
            <div className="success">
              ✅ Staké : {stakedAmount} MATIC
            </div>
          )}

          {/* Profil livreur backend */}
          {deliverer && (
            <div className="profile-info">
              <p>Profil livreur chargé : {deliverer.name}</p>
            </div>
          )}

          <button className="btn-secondary" onClick={handleDisconnect}>
            Déconnexion
          </button>
        </div>
      )}

      {/* Messages d'erreur */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default ConnectWallet;
