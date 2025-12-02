const mongoose = require("mongoose");

/**
 * Modèle Mongoose pour les commandes (données off-chain)
 * @notice Gère les données off-chain des commandes (GPS tracking, détails, litiges)
 * @dev Schema pour stocker les informations des commandes dans MongoDB
 * @dev L'orderId correspond à l'ID on-chain du smart contract
 */
// Définir le schéma Order
const orderSchema = new mongoose.Schema({
  // orderId - ID unique de la commande depuis la blockchain (unique, required)
  orderId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },

  // txHash - Hash de la transaction blockchain de création (unique, required)
  txHash: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Valider format hash transaction (0x + 64 caractères hex)
        return /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Invalid transaction hash'
    }
  },

  // client - Référence au modèle User
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // restaurant - Référence au modèle Restaurant
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },

  // deliverer - Référence au modèle Deliverer (optionnel, assigné plus tard)
  deliverer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deliverer',
    default: null
  },

  // items - Tableau des items commandés
  items: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String, // IPFS hash
      trim: true
    }
  }],

  // deliveryAddress - Adresse de livraison
  deliveryAddress: {
    type: String,
    required: true,
    trim: true
  },

  // ipfsHash - Hash IPFS contenant les détails complets de la commande
  ipfsHash: {
    type: String,
    required: true,
    trim: true
  },

  // status - État de la commande (enum)
  status: {
    type: String,
    required: true,
    enum: ['CREATED', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'DISPUTED'],
    default: 'CREATED',
    index: true
  },

  // foodPrice - Prix des plats en wei (converti en nombre pour MongoDB)
  foodPrice: {
    type: Number,
    required: true,
    min: 0
  },

  // deliveryFee - Frais de livraison en wei
  deliveryFee: {
    type: Number,
    required: true,
    min: 0
  },

  // platformFee - Commission plateforme en wei
  platformFee: {
    type: Number,
    required: true,
    min: 0
  },

  // totalAmount - Montant total en wei
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  // gpsTracking - Tableau des positions GPS du livreur pendant la livraison
  gpsTracking: [{
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
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // disputeReason - Raison du litige (si status = DISPUTED)
  disputeReason: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // disputeEvidence - Hash IPFS des preuves du litige (images, etc.)
  disputeEvidence: {
    type: String, // IPFS hash
    trim: true
  },

  // completedAt - Date de livraison complète
  completedAt: {
    type: Date,
    default: null
  }
}, {
  // Options du schéma
  timestamps: true,
  collection: 'orders'
});

// Créer des index pour performance
orderSchema.index({ orderId: 1 }); // Index unique déjà créé
orderSchema.index({ txHash: 1 }); // Index unique déjà créé
orderSchema.index({ client: 1 });
orderSchema.index({ restaurant: 1 });
orderSchema.index({ deliverer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 }); // Index décroissant pour trier par date récente

// === MÉTHODES STATIQUES ===

/**
 * Trouve une commande par son ID blockchain
 * @dev Implémenté
 * 
 * @param {number} orderId - ID de la commande depuis la blockchain
 * @returns {Promise<Object>} Document Order ou null
 */
orderSchema.statics.findByOrderId = async function(orderId) {
  // Rechercher la commande par orderId
  return await this.findOne({ orderId: orderId }).populate('client restaurant deliverer');
};

/**
 * Met à jour le statut d'une commande
 * @dev Implémenté
 * 
 * @param {number} orderId - ID de la commande
 * @param {string} newStatus - Nouveau statut (CREATED, PREPARING, IN_DELIVERY, DELIVERED, DISPUTED)
 * @returns {Promise<Object>} Document Order mis à jour
 */
orderSchema.statics.updateStatus = async function(orderId, newStatus) {
  // Préparer l'objet de mise à jour
  const update = { status: newStatus };
  
  // Si status = DELIVERED, mettre à jour completedAt
  if (newStatus === 'DELIVERED') {
    update.completedAt = new Date();
  }
  
  // Mettre à jour la commande
  return await this.findOneAndUpdate(
    { orderId: orderId },
    { $set: update },
    { new: true, runValidators: true }
  );
};

/**
 * Ajoute une position GPS au tracking d'une commande
 * @dev Implémenté
 * 
 * @param {number} orderId - ID de la commande
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Document Order mis à jour
 */
orderSchema.statics.addGPSLocation = async function(orderId, lat, lng) {
  // Ajouter la position GPS au tableau gpsTracking
  return await this.findOneAndUpdate(
    { orderId: orderId },
    { 
      $push: { 
        gpsTracking: { 
          lat: lat, 
          lng: lng, 
          timestamp: new Date() 
        } 
      } 
    },
    { new: true }
  );
};

/**
 * Récupère toutes les commandes d'un client
 * @dev Implémenté
 * 
 * @param {string} clientId - ID MongoDB du client
 * @param {Object} options - Options de requête (limit, skip, status)
 * @returns {Promise<Array>} Tableau de documents Order
 */
orderSchema.statics.getOrdersByClient = async function(clientId, options = {}) {
  // Construire la requête
  const query = { client: clientId };
  
  // Filtrer par status si fourni
  if (options.status) {
    query.status = options.status;
  }
  
  // Construire la requête avec populate et tri
  let queryBuilder = this.find(query)
    .populate('restaurant deliverer')
    .sort({ createdAt: -1 }); // Plus récentes en premier
  
  // Appliquer pagination si fournie
  if (options.limit) {
    queryBuilder = queryBuilder.limit(options.limit);
  }
  if (options.skip) {
    queryBuilder = queryBuilder.skip(options.skip);
  }
  
  // Exécuter la requête
  return await queryBuilder.exec();
};

/**
 * Récupère toutes les commandes d'un restaurant
 * @dev Implémenté
 * 
 * @param {string} restaurantId - ID MongoDB du restaurant
 * @param {Object} options - Options de requête (limit, skip, status)
 * @returns {Promise<Array>} Tableau de documents Order
 */
orderSchema.statics.getOrdersByRestaurant = async function(restaurantId, options = {}) {
  // Construire la requête
  const query = { restaurant: restaurantId };
  
  // Filtrer par status si fourni
  if (options.status) {
    query.status = options.status;
  }
  
  // Construire la requête avec populate et tri
  let queryBuilder = this.find(query)
    .populate('client deliverer')
    .sort({ createdAt: -1 });
  
  // Appliquer pagination si fournie
  if (options.limit) {
    queryBuilder = queryBuilder.limit(options.limit);
  }
  if (options.skip) {
    queryBuilder = queryBuilder.skip(options.skip);
  }
  
  // Exécuter la requête
  return await queryBuilder.exec();
};

/**
 * Récupère toutes les commandes d'un livreur
 * @dev Implémenté
 * 
 * @param {string} delivererId - ID MongoDB du livreur
 * @param {Object} options - Options de requête (limit, skip, status)
 * @returns {Promise<Array>} Tableau de documents Order
 */
orderSchema.statics.getOrdersByDeliverer = async function(delivererId, options = {}) {
  // Construire la requête
  const query = { deliverer: delivererId };
  
  // Filtrer par status si fourni
  if (options.status) {
    query.status = options.status;
  }
  
  // Construire la requête avec populate et tri
  let queryBuilder = this.find(query)
    .populate('client restaurant')
    .sort({ createdAt: -1 });
  
  // Appliquer pagination si fournie
  if (options.limit) {
    queryBuilder = queryBuilder.limit(options.limit);
  }
  if (options.skip) {
    queryBuilder = queryBuilder.skip(options.skip);
  }
  
  // Exécuter la requête
  return await queryBuilder.exec();
};

// === MÉTHODES D'INSTANCE ===

/**
 * Vérifie si la commande peut être mise à jour
 * @dev Implémenté
 * 
 * @returns {boolean} True si la commande peut être mise à jour
 */
orderSchema.methods.canBeUpdated = function() {
  // Vérifier que le status n'est pas DELIVERED ou DISPUTED
  return this.status !== 'DELIVERED' && this.status !== 'DISPUTED';
};

// Créer et exporter le modèle
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
