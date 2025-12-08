/**
 * Page HomePage - Accueil livreur
 */

import { useState, useEffect } from "react";
import api from "../services/api";
import blockchain from "../services/blockchain";

import ConnectWallet from "../components/ConnectWallet";
import AvailableOrders from "../components/AvailableOrders";
import ActiveDelivery from "../components/ActiveDelivery";

function HomePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState(null);

  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    rating: 0,
    stakedAmount: 0,
  });

  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  /** Charger wallet au démarrage */
  useEffect(() => {
    loadWalletAddress();
  }, []);

  /** Charger livraison active + stats si wallet connecté */
  useEffect(() => {
    if (address) {
      loadActiveDelivery();
      loadStats();
    }
  }, [address]);

  /** Charger adresse MetaMask */
  async function loadWalletAddress() {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    } catch (err) {
      console.error("Erreur chargement wallet :", err);
    }
  }

  /** Charger livraison active */
  async function loadActiveDelivery() {
    try {
      const active = await api.getActiveDelivery(address);
      setActiveDelivery(active);
    } catch (err) {
      console.error("Erreur livraison active :", err);
    }
  }

  /** Charger statistiques du jour */
  async function loadStats() {
    try {
      const earnings = await api.getEarnings(address, "today");
      const rating = await api.getRating(address);
      const stakeInfo = await blockchain.getStakeInfo(address);

      setStats({
        todayDeliveries: earnings.completedDeliveries || 0,
        todayEarnings: earnings.totalEarnings || 0,
        rating: rating.rating || 0,
        stakedAmount: stakeInfo.amount || 0,
      });
    } catch (err) {
      console.error("Erreur chargement stats :", err);
    }
  }

  /** Changer statut en ligne/hors ligne */
  async function handleToggleStatus() {
    const newStatus = !isOnline;
    setLoading(true);

    try {
      await api.updateStatus(address, newStatus);
      setIsOnline(newStatus);
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-page">
      <h1>Bienvenue, Livreur !</h1>

      {/* Si wallet non connecté → montrer ConnectWallet */}
      {!address ? (
        <ConnectWallet />
      ) : (
        <>
          {/* Toggle statut */}
          <div className="status-toggle">
            <label>
              <input
                type="checkbox"
                checked={isOnline}
                onChange={handleToggleStatus}
                disabled={loading}
              />
              <span>{isOnline ? "🟢 En ligne" : "🔴 Hors ligne"}</span>
            </label>
          </div>

          {/* Livraison active */}
          {activeDelivery ? (
            <ActiveDelivery order={activeDelivery} />
          ) : (
            <>
              {/* Statistiques rapides */}
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Livraisons aujourd'hui</h3>
                  <p className="stat-value">{stats.todayDeliveries}</p>
                </div>

                <div className="stat-card">
                  <h3>Gains aujourd'hui</h3>
                  <p className="stat-value">{stats.todayEarnings} MATIC</p>
                </div>

                <div className="stat-card">
                  <h3>Rating</h3>
                  <p className="stat-value">{stats.rating.toFixed(1)}/5</p>
                </div>

                <div className="stat-card">
                  <h3>Staké</h3>
                  <p className="stat-value">{stats.stakedAmount} MATIC</p>
                </div>
              </div>

              {/* Commandes disponibles */}
              {isOnline ? (
                <>
                  <AvailableOrders limit={5} />
                  <button
                    onClick={() => (window.location.href = "/deliveries")}
                    className="btn-secondary"
                  >
                    Voir toutes les commandes
                  </button>
                </>
              ) : (
                <div className="offline-message">
                  Passez en ligne pour voir les commandes disponibles.
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
