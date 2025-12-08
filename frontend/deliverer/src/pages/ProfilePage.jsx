import { useState, useEffect } from "react";
import { useApp } from "../App";
import api from "../services/api";
import StakingPanel from "../components/StakingPanel";
import RatingDisplay from "../components/RatingDisplay";

function ProfilePage() {
  const { address, setAddress } = useApp();
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);

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
      console.error(err);
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
      <h1>Mon Profil</h1>

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
