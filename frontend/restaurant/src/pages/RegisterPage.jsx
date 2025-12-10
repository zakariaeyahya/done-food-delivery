/**
 * Page RegisterPage - Inscription Restaurant
 * @notice Formulaire d'inscription pour créer un nouveau restaurant
 * @dev Gère l'upload d'images IPFS et l'enregistrement via API
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import ConnectWallet from '../components/ConnectWallet';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function RegisterPage() {
  const navigate = useNavigate();
  const { address, onRegistrationSuccess } = useWallet();

  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Menu items
  const [menuItems, setMenuItems] = useState([
    { name: '', description: '', price: '', category: '', image: null, available: true }
  ]);

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

  // Gestion menu items
  const handleMenuItemChange = (index, field, value) => {
    const newMenuItems = [...menuItems];
    newMenuItems[index][field] = value;
    setMenuItems(newMenuItems);
  };

  const handleMenuItemImageChange = (index, file) => {
    const newMenuItems = [...menuItems];
    newMenuItems[index].image = file;
    setMenuItems(newMenuItems);
  };

  const addMenuItem = () => {
    setMenuItems([...menuItems, {
      name: '',
      description: '',
      price: '',
      category: '',
      image: null,
      available: true
    }]);
  };

  const removeMenuItem = (index) => {
    if (menuItems.length > 1) {
      const newMenuItems = menuItems.filter((_, i) => i !== index);
      setMenuItems(newMenuItems);
    }
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

      // Préparer menu items (sans images d'abord)
      const menuData = menuItems.map(item => ({
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category: item.category,
        available: item.available
      }));
      submitData.append('menu', JSON.stringify(menuData));

      // Ajouter images menu items
      menuItems.forEach((item, index) => {
        if (item.image) {
          submitData.append(`menuItem_${index}`, item.image);
        }
      });

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
      await onRegistrationSuccess(data.restaurant || data);

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

  if (!address) {
    return (
      <div className="register-page">
        <div className="register-container">
          <h1>Inscription Restaurant</h1>
          <p className="subtitle">Connectez votre wallet pour commencer</p>
          <div className="connect-wallet-section">
            <ConnectWallet />
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="register-page">
        <div className="success-message">
          <h2>✅ Restaurant enregistré avec succès !</h2>
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
          </section>

          {/* Menu */}
          <section className="form-section">
            <h2>Menu</h2>
            <p className="section-description">Ajoutez les plats de votre menu</p>

            {menuItems.map((item, index) => (
              <div key={index} className="menu-item-form">
                <div className="menu-item-header">
                  <h3>Plat #{index + 1}</h3>
                  {menuItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      className="btn-remove"
                    >
                      ✕ Supprimer
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nom du plat *</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                      required
                      placeholder="Ex: Pizza Margherita"
                    />
                  </div>

                  <div className="form-group">
                    <label>Catégorie</label>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => handleMenuItemChange(index, 'category', e.target.value)}
                      placeholder="Ex: Pizzas, Desserts..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleMenuItemChange(index, 'description', e.target.value)}
                    rows="2"
                    placeholder="Décrivez ce plat..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prix (MAD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                      required
                      placeholder="50.00"
                    />
                  </div>

                  <div className="form-group">
                    <label>Photo du plat</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMenuItemImageChange(index, e.target.files[0])}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addMenuItem}
              className="btn-add-menu-item"
            >
              + Ajouter un plat
            </button>
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
