const mongoose = require("mongoose");

/**
 * Modèle Mongoose pour les livreurs
 * @notice Gère les données off-chain des livreurs (localisation, disponibilité, staking)
 * @dev Schema pour stocker les informations des livreurs dans MongoDB
 */
// Définir le schéma Deliverer
const delivererSchema = new mongoose.Schema({
  // address - Adresse blockchain du livreur (unique, required)
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

  // name - Nom du livreur (required)
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },

  // phone - Numéro de téléphone (required)
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Valider format téléphone - accepte les espaces, tirets, parenthèses
        // Nettoyer et vérifier qu'il y a au moins 8 chiffres
        const digitsOnly = v.replace(/[\s\-\(\)\.]/g, '');
        return /^\+?[0-9]{8,15}$/.test(digitsOnly);
      },
      message: 'Invalid phone number format (minimum 8 digits required)'
    }
  },

  // vehicleType - Type de véhicule (enum)
  vehicleType: {
    type: String,
    required: true,
    enum: ['bike', 'scooter', 'car'],
    default: 'bike'
  },

  // currentLocation - Position GPS actuelle du livreur
  currentLocation: {
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
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // isAvailable - Indique si le livreur est disponible pour une livraison
  isAvailable: {
    type: Boolean,
    default: false
  },

  // isStaked - Indique si le livreur a staké (synchronisé avec blockchain)
  isStaked: {
    type: Boolean,
    default: false
  },

  // stakedAmount - Montant staké en wei (synchronisé avec blockchain)
  stakedAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  // rating - Note moyenne du livreur (0-5)
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  // totalDeliveries - Nombre total de livraisons effectuées
  totalDeliveries: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  // Options du schéma
  timestamps: true,
  collection: 'deliverers'
});

// Créer des index pour performance
delivererSchema.index({ address: 1 });
delivererSchema.index({ isAvailable: 1 });
delivererSchema.index({ isStaked: 1 });
delivererSchema.index({ "currentLocation.lat": 1, "currentLocation.lng": 1 }); // Index géospatial

// === MÉTHODES STATIQUES ===

/**
 * Trouve un livreur par son adresse blockchain
 * @dev Implémenté
 * 
 * @param {string} address - Adresse blockchain du livreur
 * @returns {Promise<Object>} Document Deliverer ou null
 */
delivererSchema.statics.findByAddress = async function(address) {
  // Normaliser l'adresse en minuscules
  const normalizedAddress = address.toLowerCase();
  
  // Rechercher le livreur par adresse
  return await this.findOne({ address: normalizedAddress });
};

/**
 * Met à jour la position GPS actuelle d'un livreur
 * @dev Implémenté
 * 
 * @param {string} address - Adresse blockchain du livreur
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Document Deliverer mis à jour
 */
delivererSchema.statics.updateLocation = async function(address, lat, lng) {
  // Normaliser l'adresse
  const normalizedAddress = address.toLowerCase();
  
  // Mettre à jour currentLocation avec timestamp
  return await this.findOneAndUpdate(
    { address: normalizedAddress },
    { 
      $set: { 
        currentLocation: { 
          lat: lat, 
          lng: lng, 
          lastUpdated: new Date() 
        } 
      } 
    },
    { new: true, runValidators: true }
  );
};

/**
 * Met à jour la disponibilité d'un livreur
 * @dev Implémenté
 * 
 * @param {string} address - Adresse blockchain du livreur
 * @param {boolean} isAvailable - Nouvelle disponibilité
 * @returns {Promise<Object>} Document Deliverer mis à jour
 */
delivererSchema.statics.setAvailability = async function(address, isAvailable) {
  // Normaliser l'adresse
  const normalizedAddress = address.toLowerCase();
  
  // Mettre à jour isAvailable
  return await this.findOneAndUpdate(
    { address: normalizedAddress },
    { $set: { isAvailable: isAvailable } },
    { new: true }
  );
};

/**
 * Incrémente le compteur de livraisons d'un livreur
 * @dev Implémenté
 * 
 * @param {string} address - Adresse blockchain du livreur
 * @returns {Promise<Object>} Document Deliverer mis à jour
 */
delivererSchema.statics.incrementDeliveryCount = async function(address) {
  // Normaliser l'adresse
  const normalizedAddress = address.toLowerCase();
  
  // Incrémenter totalDeliveries de 1
  return await this.findOneAndUpdate(
    { address: normalizedAddress },
    { $inc: { totalDeliveries: 1 } },
    { new: true }
  );
};

/**
 * Récupère tous les livreurs disponibles et stakés
 * @dev Implémenté
 * 
 * @param {Object} options - Options de requête (location pour filtrage par distance)
 * @returns {Promise<Array>} Tableau de documents Deliverer disponibles
 */
delivererSchema.statics.getAvailableDeliverers = async function(options = {}) {
  // Construire la requête de base
  const query = { 
    isAvailable: true, 
    isStaked: true 
  };
  
  // Note: Pour un filtrage géospatial avancé, on pourrait utiliser $near
  // mais cela nécessite un index géospatial 2dsphere et des coordonnées en format GeoJSON
  // Pour l'instant, on retourne tous les livreurs disponibles et stakés
  
  // Exécuter la requête
  return await this.find(query).sort({ rating: -1 }); // Trier par note décroissante
};

// === MÉTHODES D'INSTANCE ===

/**
 * Vérifie si le livreur peut accepter une nouvelle livraison
 * @dev Implémenté
 * 
 * @returns {boolean} True si le livreur peut accepter une livraison
 */
delivererSchema.methods.canAcceptDelivery = function() {
  // Vérifier que le livreur est disponible et staké
  return this.isAvailable && this.isStaked;
};

// Créer et exporter le modèle
const Deliverer = mongoose.model("Deliverer", delivererSchema);
module.exports = Deliverer;
