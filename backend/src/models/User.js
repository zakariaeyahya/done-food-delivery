const mongoose = require("mongoose");

/**
 * Modèle Mongoose pour les utilisateurs (clients)
 * @notice Gère les données off-chain des clients de la plateforme
 * @dev Schema pour stocker les informations des utilisateurs dans MongoDB
 */
// Définir le schéma User
const userSchema = new mongoose.Schema({
  // address - Adresse blockchain du client (unique, required)
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Normaliser en minuscules
    trim: true,
    validate: {
      validator: function(v) {
        // Valider que c'est une adresse Ethereum valide (42 caractères, commence par 0x)
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address'
    }
  },

  // name - Nom complet du client (required)
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },

  // email - Email du client (unique, optionnel)
  email: {
    type: String,
    unique: true,
    sparse: true, // Permet plusieurs null sans violation d'unicité
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Valider format email si fourni
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
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
        // Valider format téléphone si fourni
        return !v || /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },

  // cart - Panier de l'utilisateur
  cart: {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null
    },
    restaurantAddress: {
      type: String,
      default: null
    },
    items: [{
      menuItemId: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      },
      image: {
        type: String
      }
    }],
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },

  // deliveryAddresses - Tableau d'adresses de livraison
  deliveryAddresses: [{
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50 // Ex: "Domicile", "Travail"
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  }],

  // createdAt et updatedAt sont gérés automatiquement par timestamps: true
}, {
  // Options du schéma
  timestamps: true, // Active automatiquement createdAt et updatedAt
  collection: 'users' // Nom de la collection MongoDB
});

// Créer un index sur address pour performance
userSchema.index({ address: 1 });

// Créer un index sur email pour performance (si fourni)
userSchema.index({ email: 1 }, { sparse: true });

// === MÉTHODES STATIQUES ===

/**
 * Trouve un utilisateur par son adresse blockchain
 * @dev Méthode statique pour rechercher un utilisateur par adresse
 * 
 * @param {string} address - Adresse blockchain du client
 * @returns {Promise<Object>} Document User ou null
 */
userSchema.statics.findByAddress = async function(address) {
  // Normaliser l'adresse en minuscules
  const normalizedAddress = address.toLowerCase();
  
  // Rechercher l'utilisateur par adresse
  return await this.findOne({ address: normalizedAddress });
};

/**
 * Met à jour le profil d'un utilisateur
 * @dev Méthode statique pour mettre à jour les informations d'un utilisateur
 * 
 * @param {string} address - Adresse blockchain du client
 * @param {Object} updates - Objet contenant les champs à mettre à jour
 * @returns {Promise<Object>} Document User mis à jour
 */
userSchema.statics.updateProfile = async function(address, updates) {
  // Normaliser l'adresse
  const normalizedAddress = address.toLowerCase();
  
  // Mettre à jour le document avec new: true pour retourner le document mis à jour
  return await this.findOneAndUpdate(
    { address: normalizedAddress },
    { $set: updates },
    { new: true, runValidators: true }
  );
};

/**
 * Ajoute une nouvelle adresse de livraison à un utilisateur
 * @dev Méthode statique pour ajouter une adresse de livraison
 * 
 * @param {string} address - Adresse blockchain du client
 * @param {Object} addressData - Objet contenant { label, address, lat, lng }
 * @returns {Promise<Object>} Document User mis à jour
 */
userSchema.statics.addDeliveryAddress = async function(address, addressData) {
  // Normaliser l'adresse
  const normalizedAddress = address.toLowerCase();
  
  // Ajouter la nouvelle adresse au tableau deliveryAddresses
  return await this.findOneAndUpdate(
    { address: normalizedAddress },
    { $push: { deliveryAddresses: addressData } },
    { new: true, runValidators: true }
  );
};

// === MÉTHODES D'INSTANCE ===

/**
 * Vérifie si l'utilisateur a une adresse de livraison avec un label spécifique
 * @dev Méthode d'instance pour vérifier l'existence d'une adresse par label
 * 
 * @param {string} label - Label de l'adresse à vérifier
 * @returns {boolean} True si l'adresse existe
 */
userSchema.methods.hasDeliveryAddress = function(label) {
  // Vérifier si une adresse avec ce label existe
  return this.deliveryAddresses.some(addr => addr.label === label);
};

// Créer et exporter le modèle
const User = mongoose.model("User", userSchema);
module.exports = User;

