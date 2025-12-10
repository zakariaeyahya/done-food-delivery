const mongoose = require("mongoose");

/**
 * Modèle Mongoose pour les restaurants
 * @notice Gère les données off-chain des restaurants (menus, images, localisation)
 * @dev Schema pour stocker les informations des restaurants dans MongoDB
 */
// Définir le schéma Restaurant
const restaurantSchema = new mongoose.Schema({
  // address - Adresse blockchain du restaurant (unique, required)
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Valider que c'est une adresse Ethereum valide
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address'
    }
  },

  // name - Nom du restaurant (required)
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },

  // cuisine - Type de cuisine (optionnel)
  cuisine: {
    type: String,
    trim: true,
    maxlength: 50 // Ex: "Italienne", "Japonaise", "Française"
  },

  // description - Description du restaurant (optionnel)
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // email - Email du restaurant (optionnel, pour notifications)
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optionnel
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },

  // phone - Numéro de téléphone (optionnel)
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optionnel
        // Accepte formats: +212612345678, 0612345678, +1234567890, etc.
        return /^(\+?\d{1,4}[\s-]?)?[\d\s-]{6,15}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Invalid phone number format'
    }
  },

  // location - Localisation géographique du restaurant (optionnel)
  location: {
    address: {
      type: String,
      required: false,
      default: '',
      trim: true
    },
    lat: {
      type: Number,
      required: false,
      default: 0,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: false,
      default: 0,
      min: -180,
      max: 180
    }
  },

  // images - Tableau de hash IPFS des images du restaurant
  images: [{
    type: String,
    trim: true
  }],

  // menu - Tableau des items du menu
  menu: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String, // IPFS hash
      trim: true
    },
    category: {
      type: String,
      trim: true,
      maxlength: 50 // Ex: "Pizzas", "Desserts", "Boissons"
    },
    available: {
      type: Boolean,
      default: true
    }
  }],

  // rating - Note moyenne du restaurant (0-5)
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  // totalOrders - Nombre total de commandes
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },

  // isActive - Indique si le restaurant est actif
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  // Options du schéma
  timestamps: true,
  collection: 'restaurants'
});

// Créer des index pour performance
restaurantSchema.index({ address: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ "location.lat": 1, "location.lng": 1 }); // Index géospatial
restaurantSchema.index({ isActive: 1 });

// === MÉTHODES STATIQUES ===

/**
 * Trouve un restaurant par son adresse blockchain
 * @dev Implémenté
 * 
 * @param {string} address - Adresse blockchain du restaurant
 * @returns {Promise<Object>} Document Restaurant ou null
 */
restaurantSchema.statics.findByAddress = async function(address) {
  // Normaliser l'adresse en minuscules
  const normalizedAddress = address.toLowerCase();
  
  // Rechercher le restaurant par adresse
  return await this.findOne({ address: normalizedAddress });
};

/**
 * Met à jour le menu complet d'un restaurant
 * @dev Implémenté
 * 
 * @param {string} restaurantId - ID MongoDB du restaurant
 * @param {Array} menu - Nouveau tableau de menu items
 * @returns {Promise<Object>} Document Restaurant mis à jour
 */
restaurantSchema.statics.updateMenu = async function(restaurantId, menu) {
  // Mettre à jour le menu complet
  return await this.findByIdAndUpdate(
    restaurantId,
    { $set: { menu: menu } },
    { new: true, runValidators: true }
  );
};

/**
 * Incrémente le compteur de commandes d'un restaurant
 * @dev Implémenté
 * 
 * @param {string} restaurantId - ID MongoDB du restaurant
 * @returns {Promise<Object>} Document Restaurant mis à jour
 */
restaurantSchema.statics.incrementOrderCount = async function(restaurantId) {
  // Incrémenter totalOrders de 1
  return await this.findByIdAndUpdate(
    restaurantId,
    { $inc: { totalOrders: 1 } },
    { new: true }
  );
};

// === MÉTHODES D'INSTANCE ===

/**
 * Vérifie si un item du menu est disponible
 * @dev Implémenté
 * 
 * @param {string} itemName - Nom de l'item
 * @returns {boolean} True si l'item est disponible
 */
restaurantSchema.methods.isMenuItemAvailable = function(itemName) {
  // Chercher l'item dans le menu
  const item = this.menu.find(item => item.name === itemName);
  return item && item.available;
};

// Créer et exporter le modèle
const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
