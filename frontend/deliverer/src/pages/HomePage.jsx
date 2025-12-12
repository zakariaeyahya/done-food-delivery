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
  const [isRegistered, setIsRegistered] = useState(null); // null = unknown, true = registered, false = not registered
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    rating: 0,
    stakedAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    vehicleType: "bike"
  });

  useEffect(() => {
    if (address) {
      loadData();
    } else {
      setCheckingRegistration(false);
      setIsRegistered(null);
    }
  }, [address]);

  async function loadData() {
    setCheckingRegistration(true);
    try {
      // Check if user is registered as deliverer
      const delivererData = await api.getDeliverer(address).catch((err) => {
        if (err.response?.status === 404) {
          setIsRegistered(false);
          setCheckingRegistration(false);
          return null;
        }
        return null;
      });

      if (!delivererData) {
        setIsRegistered(false);
        setCheckingRegistration(false);
        return;
      }

      setIsRegistered(true);
      setCheckingRegistration(false);

      // Set online status from deliverer data
      setIsOnline(delivererData.deliverer?.isAvailable || false);

      // Load active delivery (may not exist - that's ok)
      const active = await api.getActiveDelivery(address).catch(() => null);
      setActiveDelivery(active);

      // Load earnings (with auth - may fail)
      const earningsResponse = await api.getEarnings(address, "today").catch(() => ({
        earnings: { completedDeliveries: 0, totalEarnings: 0 }
      }));
      // Extraire les données depuis la réponse structurée du backend
      const earnings = earningsResponse.earnings || {
        completedDeliveries: 0,
        totalEarnings: 0
      };

      // Load rating from API
      const ratingData = await api.getRating(address).catch((err) => {
        console.warn("Rating data not available:", err.message);
        return { rating: 0, totalDeliveries: 0, reviews: [] };
      });

      // Load stake info from blockchain (may fail if contract not deployed)
      const stakeInfo = await blockchain.getStakeInfo(address).catch((err) => {
        console.warn("Blockchain stake info not available:", err.message);
        return { amount: 0, isStaked: false };
      });

      setStats({
        todayDeliveries: earnings.completedDeliveries || 0,
        todayEarnings: earnings.totalEarnings || 0,
        rating: ratingData.rating || 0,
        stakedAmount: stakeInfo.amount || 0,
      });
    } catch (err) {
      console.error("Erreur chargement:", err);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (!registerForm.name || !registerForm.phone) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setRegistering(true);
    try {
      await api.registerDeliverer({
        address: address,
        name: registerForm.name,
        phone: registerForm.phone,
        vehicleType: registerForm.vehicleType
      });
      alert("Inscription réussie !");
      await loadData();
    } catch (err) {
      // Si déjà inscrit, recharger les données pour afficher le dashboard
      if (err.alreadyRegistered) {
        alert("Ce wallet est déjà inscrit. Redirection vers le tableau de bord...");
        await loadData();
        return;
      }

      const errorMsg = err.response?.data?.details || err.response?.data?.message || err.message;
      alert("Erreur lors de l'inscription: " + errorMsg);
    } finally {
      setRegistering(false);
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

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadData();
    } catch (err) {
      console.error("Erreur lors de l'actualisation:", err);
      alert("Erreur lors de l'actualisation des données");
    } finally {
      setRefreshing(false);
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

  // Show loading while checking registration status
  if (checkingRegistration) {
    return (
      <div className="page">
        <div className="card center">
          <h2>Vérification en cours...</h2>
          <p>Vérification de votre statut d'inscription</p>
        </div>
      </div>
    );
  }

  if (isRegistered === false) {
    return (
      <div className="page">
        <div className="card">
          <h2>Inscription Livreur</h2>
          <p>Complétez votre profil pour commencer</p>
          <p className="mb-1"><strong>Adresse:</strong> {address}</p>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Nom complet"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              required
            />

            <input
              type="tel"
              placeholder="Téléphone (ex: +33612345678)"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
              required
            />

            <select
              value={registerForm.vehicleType}
              onChange={(e) => setRegisterForm({ ...registerForm, vehicleType: e.target.value })}
            >
              <option value="bike">Vélo</option>
              <option value="scooter">Scooter</option>
              <option value="car">Voiture</option>
            </select>

            <button type="submit" disabled={registering} className="btn-primary">
              {registering ? "Inscription..." : "S'inscrire"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
        width: '100%'
      }}>
        <h1 style={{ margin: 0, flex: '1 1 auto' }}>Tableau de bord</h1>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing || checkingRegistration}
          className="btn-primary"
          style={{ 
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: (refreshing || checkingRegistration) ? 'not-allowed' : 'pointer',
            minWidth: '150px',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            visibility: 'visible',
            opacity: (refreshing || checkingRegistration) ? 0.7 : 1
          }}
        >
          {refreshing ? (
            <>
              <span>🔄</span>
              <span>Actualisation...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Actualiser</span>
            </>
          )}
        </button>
      </div>

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
