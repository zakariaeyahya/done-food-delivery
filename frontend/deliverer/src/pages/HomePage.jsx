import { useState, useEffect } from "react";
import { useApp } from "../App";
import api from "../services/api";
import blockchain from "../services/blockchain";
import AvailableOrders from "../components/AvailableOrders";
import ActiveDelivery from "../components/ActiveDelivery";

function HomePage() {
  const { address, connectWallet } = useApp();
  const [isOnline, setIsOnline] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    rating: 0,
    stakedAmount: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]);

  async function loadData() {
    try {
      const [active, earnings, rating, stakeInfo] = await Promise.all([
        api.getActiveDelivery(address).catch(() => null),
        api.getEarnings(address, "today").catch(() => ({})),
        api.getRating(address).catch(() => ({ rating: 0 })),
        blockchain.getStakeInfo(address).catch(() => ({ amount: 0 })),
      ]);

      setActiveDelivery(active);
      setStats({
        todayDeliveries: earnings.completedDeliveries || 0,
        todayEarnings: earnings.totalEarnings || 0,
        rating: rating.rating || 0,
        stakedAmount: stakeInfo.amount || 0,
      });
    } catch (err) {
      console.error("Erreur chargement:", err);
    }
  }

  async function toggleStatus() {
    setLoading(true);
    try {
      await api.updateStatus(address, !isOnline);
      setIsOnline(!isOnline);
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!address) {
    return (
      <div className="page">
        <div className="card center">
          <h2>Bienvenue sur DONE Livreur 🚀</h2>
          <p>Connectez votre wallet pour commencer</p>
          <button onClick={connectWallet} className="btn-primary">
            Connecter MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Tableau de bord</h1>

      <label className="toggle">
        <input type="checkbox" checked={isOnline} onChange={toggleStatus} disabled={loading} />
        <span>{isOnline ? "🟢 En ligne" : "🔴 Hors ligne"}</span>
      </label>

      {activeDelivery ? (
        <ActiveDelivery order={activeDelivery} />
      ) : (
        <>
          <div className="stats-grid">
            <div className="card">
              <h3>Livraisons</h3>
              <p className="big">{stats.todayDeliveries}</p>
            </div>
            <div className="card">
              <h3>Gains</h3>
              <p className="big">{stats.todayEarnings} MATIC</p>
            </div>
            <div className="card">
              <h3>Rating</h3>
              <p className="big">{stats.rating.toFixed(1)}/5</p>
            </div>
            <div className="card">
              <h3>Staké</h3>
              <p className="big">{stats.stakedAmount} MATIC</p>
            </div>
          </div>

          {isOnline ? (
            <AvailableOrders limit={5} />
          ) : (
            <div className="card center">
              <p>Passez en ligne pour voir les commandes</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
