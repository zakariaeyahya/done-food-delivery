/**
 * Page ProfilePage - Profil et paramètres livreur
 */

import { useState, useEffect } from "react";
import api from "../services/api";
import StakingPanel from "../components/StakingPanel";
import RatingDisplay from "../components/RatingDisplay";

function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [settings, setSettings] = useState({
    language: "fr",
    notifications: true,
    theme: "light",
    sounds: true,
  });

  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  /** Charger MetaMask au montage */
  useEffect(() => {
    loadWalletAddress();
  }, []);

  /** Charger profil lorsque wallet OK */
  useEffect(() => {
    if (address) {
      loadProfile();
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

  /** Charger profil du livreur */
  async function loadProfile() {
    try {
      const data = await api.getDeliverer(address);

      setProfile({
        name: data.deliverer.name || "",
        phone: data.deliverer.phone || "",
        address: address,
      });
    } catch (err) {
      console.error("Erreur chargement profil :", err);
    }
  }

  /** Sauvegarder profil */
  async function handleSaveProfile() {
    setLoading(true);

    try {
      // Tu peux remplacer ceci par api.updateDelivererProfile(address, payload)
      alert("Profil sauvegardé !");
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  }

  /** Déconnexion */
  function handleDisconnect() {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      // Ici tu peux vider ton contexte global si tu en utilises un
      window.location.href = "/";
    }
  }

  return (
    <div className="profile-page">
      <h1>Mon Profil</h1>

      {/* Informations personnelles */}
      <div className="profile-info card">
        <h2>Informations personnelles</h2>

        <input
          type="text"
          placeholder="Nom"
          value={profile.name}
          onChange={(e) =>
            setProfile({ ...profile, name: e.target.value })
          }
        />

        <input
          type="tel"
          placeholder="Téléphone"
          value={profile.phone}
          onChange={(e) =>
            setProfile({ ...profile, phone: e.target.value })
          }
        />

        <p>Wallet : {address}</p>

        <button onClick={handleSaveProfile} disabled={loading}>
          {loading ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      {/* Staking */}
      {address && <StakingPanel address={address} />}

      {/* Rating & avis */}
      {address && <RatingDisplay address={address} />}

      {/* Paramètres */}
      <div className="settings card">
        <h2>Paramètres</h2>

        <label>
          Langue :
          <select
            value={settings.language}
            onChange={(e) =>
              setSettings({ ...settings, language: e.target.value })
            }
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) =>
              setSettings({
                ...settings,
                notifications: e.target.checked,
              })
            }
          />
          Notifications
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.sounds}
            onChange={(e) =>
              setSettings({
                ...settings,
                sounds: e.target.checked,
              })
            }
          />
          Sons
        </label>
      </div>

      {/* Déconnexion */}
      <button onClick={handleDisconnect} className="btn-danger">
        Déconnexion
      </button>
    </div>
  );
}

export default ProfilePage;
