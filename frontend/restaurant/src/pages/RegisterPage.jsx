/**
 * Page RegisterPage - Inscription Restaurant
 * @notice Formulaire d'inscription pour créer un nouveau restaurant
 * @dev Vérifie d'abord si le wallet est déjà enregistré, sinon affiche le formulaire
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import ConnectWallet from '../components/ConnectWallet';
import * as api from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function RegisterPage() {
  const navigate = useNavigate();
  const { address, restaurant, onRegistrationSuccess } = useWallet();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    description: '',
    email: '',
    phone: '',
    locationAddress: '',
    locationLat: '',
    locationLng: '',
  });

  // Images du restaurant
  const [restaurantImages, setRestaurantImages] = useState([]);

  // Vérifier si le restaurant existe déjà quand l'adresse change
  useEffect(() => {
    async function checkExistingRestaurant() {
      if (!address) return;

      // Si on a déjà un restaurant dans le context, rediriger
      if (restaurant && restaurant._id) {
        navigate('/');
        return;
      }

      setIsCheckingExisting(true);
      try {
        // Vérifier dans la BDD si ce wallet a déjà un restaurant
        const existingRestaurant = await api.getRestaurantByAddress(address);

        if (existingRestaurant && existingRestaurant._id) {
          // Restaurant trouvé ! Sauvegarder et rediriger
          onRegistrationSuccess(existingRestaurant);
          navigate('/');
        }
      } catch (err) {
        // Pas de restaurant trouvé (404) - c'est normal, afficher le formulaire
        console.log('Aucun restaurant existant pour cette adresse');
      } finally {
        setIsCheckingExisting(false);
      }
    }

    checkExistingRestaurant();
  }, [address, restaurant, navigate, onRegistrationSuccess]);

  // Gestion changement formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestion images restaurant
  const handleRestaurantImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setRestaurantImages(files);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.name || !formData.cuisine || !formData.email || !formData.phone) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Créer FormData pour multipart/form-data
      const submitData = new FormData();

      // Ajouter l'adresse wallet
      submitData.append('address', address);

      // Ajouter les champs de base
      submitData.append('name', formData.name);
      submitData.append('cuisine', formData.cuisine);
      submitData.append('description', formData.description);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);

      // Ajouter location
      const location = {
        address: formData.locationAddress,
        lat: parseFloat(formData.locationLat) || 0,
        lng: parseFloat(formData.locationLng) || 0
      };
      submitData.append('location', JSON.stringify(location));

      // Ajouter images restaurant
      restaurantImages.forEach((file) => {
        submitData.append('images', file);
      });

      // Menu vide par défaut (sera ajouté depuis le dashboard)
      submitData.append('menu', JSON.stringify([]));

      // Envoyer la requête
      const response = await fetch(`${API_BASE_URL}/restaurants/register`, {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Mettre à jour le context avec le nouveau restaurant
      onRegistrationSuccess(data.restaurant || data);

      setSuccess(true);

      // Rediriger vers dashboard après 2 secondes
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error('Error registering restaurant:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher loading pendant la vérification
  if (isCheckingExisting) {
    return (
      <div className="register-page">
        <div className="register-container" style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem' }}></div>
          <h2>Vérification en cours...</h2>
          <p>Nous vérifions si votre wallet est déjà enregistré</p>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="register-page">
        <div className="register-container">
          <h1>Espace Restaurant</h1>
          <p className="subtitle">Connectez votre wallet MetaMask pour continuer</p>
          <div className="connect-wallet-section" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <ConnectWallet />
          </div>
          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>
            Si vous avez déjà un restaurant, vous serez redirigé automatiquement vers le dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="register-page">
        <div className="success-message">
          <h2>Restaurant enregistré avec succès !</h2>
          <p>Redirection vers le dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Inscription Restaurant</h1>
        <p className="subtitle">Créez votre profil restaurant sur DONE</p>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Informations de base */}
          <section className="form-section">
            <h2>Informations du restaurant</h2>

            <div className="form-group">
              <label htmlFor="name">Nom du restaurant *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ex: Chez Mario"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cuisine">Type de cuisine *</label>
              <input
                type="text"
                id="cuisine"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleInputChange}
                required
                placeholder="Ex: Italienne, Française, Marocaine..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Décrivez votre restaurant..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="restaurant@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Téléphone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+212 6 12 34 56 78"
                />
              </div>
            </div>
          </section>

          {/* Localisation */}
          <section className="form-section">
            <h2>Localisation</h2>

            <div className="form-group">
              <label htmlFor="locationAddress">Adresse</label>
              <input
                type="text"
                id="locationAddress"
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleInputChange}
                placeholder="123 Rue Example, Casablanca"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="locationLat">Latitude</label>
                <input
                  type="number"
                  step="any"
                  id="locationLat"
                  name="locationLat"
                  value={formData.locationLat}
                  onChange={handleInputChange}
                  placeholder="33.5731"
                />
              </div>

              <div className="form-group">
                <label htmlFor="locationLng">Longitude</label>
                <input
                  type="number"
                  step="any"
                  id="locationLng"
                  name="locationLng"
                  value={formData.locationLng}
                  onChange={handleInputChange}
                  placeholder="-7.5898"
                />
              </div>
            </div>
          </section>

          {/* Images du restaurant */}
          <section className="form-section">
            <h2>Photos du restaurant</h2>
            <div className="form-group">
              <label htmlFor="restaurantImages">
                Ajoutez des photos de votre restaurant (max 10)
              </label>
              <input
                type="file"
                id="restaurantImages"
                accept="image/*"
                multiple
                onChange={handleRestaurantImagesChange}
              />
              {restaurantImages.length > 0 && (
                <p className="file-count">{restaurantImages.length} image(s) sélectionnée(s)</p>
              )}
            </div>
            <p className="section-description" style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
              Vous pourrez ajouter votre menu depuis le Dashboard après l'inscription.
            </p>
          </section>

          {/* Wallet address (read-only) */}
          <section className="form-section">
            <div className="form-group">
              <label>Adresse Wallet (automatique)</label>
              <input
                type="text"
                value={address}
                disabled
                className="input-disabled"
              />
            </div>
          </section>

          {/* Erreur */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-submit"
          >
            {isSubmitting ? 'Inscription en cours...' : 'Créer mon restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
