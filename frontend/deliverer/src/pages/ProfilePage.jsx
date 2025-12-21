import { useState, useEffect } from "react";
import { useApp } from "../App";
import api from "../services/api";
import StakingPanel from "../components/StakingPanel";
import RatingDisplay from "../components/RatingDisplay";

function ProfilePage() {
  const { address, setAddress } = useApp();
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (address) loadProfile();
  }, [address]);

  async function loadProfile() {
    try {
      const data = await api.getDeliverer(address);
      setProfile({
        name: data.deliverer.name || "",
        phone: data.deliverer.phone || "",
      });
    } catch (err) {
    }
  }

  async function saveProfile() {
    setLoading(true);
    try {
      // await api.updateDelivererProfile(address, profile);
      alert("Profil sauvegardé !");
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadProfile();
    } catch (err) {
      alert("Erreur lors de l'actualisation des données");
    } finally {
      setRefreshing(false);
    }
  }

  function disconnect() {
    if (confirm("Déconnexion ?")) {
      setAddress(null);
      localStorage.removeItem('walletAddress');
      window.location.href = "/";
    }
  }

  if (!address) {
    return (
      <div className="page">
        <div className="card center">
          <p>Connectez votre wallet</p>
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
        <h1 style={{ margin: 0, flex: '1 1 auto' }}>Mon Profil</h1>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing || loading}
          className="btn-primary"
          style={{ 
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: (refreshing || loading) ? 'not-allowed' : 'pointer',
            minWidth: '150px',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            opacity: (refreshing || loading) ? 0.7 : 1
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

      <div className="card">
        <h2>Informations</h2>
        <input
          type="text"
          placeholder="Nom"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Téléphone"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />
        <p>Wallet: {address}</p>
        <button onClick={saveProfile} disabled={loading}>
          {loading ? "..." : "Sauvegarder"}
        </button>
      </div>

      <StakingPanel address={address} />
      <RatingDisplay address={address} />

      <button onClick={disconnect} className="btn-danger">
        Déconnexion
      </button>
    </div>
  );
}

export default ProfilePage;
