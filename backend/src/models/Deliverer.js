// TODO: Importer mongoose pour créer le schéma
// const mongoose = require("mongoose");

/**
 * Modèle Mongoose pour les livreurs
 * @notice Gère les données off-chain des livreurs (localisation, disponibilité, staking)
 * @dev Schema pour stocker les informations des livreurs dans MongoDB
 */
// TODO: Définir le schéma Deliverer
// const delivererSchema = new mongoose.Schema({
//   // TODO: address - Adresse blockchain du livreur (unique, required)
//   address: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//     validate: {
//       validator: function(v) {
//         // TODO: Valider que c'est une adresse Ethereum valide
//         return /^0x[a-fA-F0-9]{40}$/.test(v);
//       },
//       message: 'Invalid Ethereum address'
//     }
//   },
//
//   // TODO: name - Nom du livreur (required)
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 2,
//     maxlength: 100
//   },
//
//   // TODO: phone - Numéro de téléphone (required)
//   phone: {
//     type: String,
//     required: true,
//     trim: true,
//     validate: {
//       validator: function(v) {
//         // TODO: Valider format téléphone
//         return /^\+?[1-9]\d{1,14}$/.test(v);
//       },
//       message: 'Invalid phone number format'
//     }
//   },
//
//   // TODO: vehicleType - Type de véhicule (enum)
//   vehicleType: {
//     type: String,
//     required: true,
//     enum: ['bike', 'scooter', 'car'],
//     default: 'bike'
//   },
//
//   // TODO: currentLocation - Position GPS actuelle du livreur
//   currentLocation: {
//     lat: {
//       type: Number,
//       required: true,
//       min: -90,
//       max: 90
//     },
//     lng: {
//       type: Number,
//       required: true,
//       min: -180,
//       max: 180
//     },
//     lastUpdated: {
//       type: Date,
//       default: Date.now
//     }
//   },
//
//   // TODO: isAvailable - Indique si le livreur est disponible pour une livraison
//   isAvailable: {
//     type: Boolean,
//     default: false
//   },
//
//   // TODO: isStaked - Indique si le livreur a staké (synchronisé avec blockchain)
//   isStaked: {
//     type: Boolean,
//     default: false
//   },
//
//   // TODO: stakedAmount - Montant staké en wei (synchronisé avec blockchain)
//   stakedAmount: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//
//   // TODO: rating - Note moyenne du livreur (0-5)
//   rating: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 5
//   },
//
//   // TODO: totalDeliveries - Nombre total de livraisons effectuées
//   totalDeliveries: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//
//   // TODO: createdAt - Date de création
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//
//   // TODO: updatedAt - Date de mise à jour
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   // TODO: Options du schéma
//   timestamps: true,
//   collection: 'deliverers'
// });

// TODO: Créer des index pour performance
// delivererSchema.index({ address: 1 });
// delivererSchema.index({ isAvailable: 1 });
// delivererSchema.index({ isStaked: 1 });
// delivererSchema.index({ "currentLocation.lat": 1, "currentLocation.lng": 1 }); // Index géospatial

// === MÉTHODES STATIQUES ===

/**
 * Trouve un livreur par son adresse blockchain
 * @dev TODO: Implémenter la méthode statique findByAddress
 * 
 * @param {string} address - Adresse blockchain du livreur
 * @returns {Promise<Object>} Document Deliverer ou null
 */
// delivererSchema.statics.findByAddress = async function(address) {
//   // TODO: Normaliser l'adresse en minuscules
//   // const normalizedAddress = address.toLowerCase();
//   
//   // TODO: Rechercher le livreur par adresse
//   // return await this.findOne({ address: normalizedAddress });
// };

/**
 * Met à jour la position GPS actuelle d'un livreur
 * @dev TODO: Implémenter la méthode statique updateLocation
 * 
 * @param {string} address - Adresse blockchain du livreur
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Document Deliverer mis à jour
 */
// delivererSchema.statics.updateLocation = async function(address, lat, lng) {
//   // TODO: Normaliser l'adresse
//   // const normalizedAddress = address.toLowerCase();
//   
//   // TODO: Mettre à jour currentLocation avec timestamp
//   // return await this.findOneAndUpdate(
//   //   { address: normalizedAddress },
//   //   { 
//   //     $set: { 
//   //       currentLocation: { 
//   //         lat: lat, 
//   //         lng: lng, 
//   //         lastUpdated: new Date() 
//   //       } 
//   //     } 
//   //   },
//   //   { new: true, runValidators: true }
//   // );
// };

/**
 * Met à jour la disponibilité d'un livreur
 * @dev TODO: Implémenter la méthode statique setAvailability
 * 
 * @param {string} address - Adresse blockchain du livreur
 * @param {boolean} isAvailable - Nouvelle disponibilité
 * @returns {Promise<Object>} Document Deliverer mis à jour
 */
// delivererSchema.statics.setAvailability = async function(address, isAvailable) {
//   // TODO: Normaliser l'adresse
//   // const normalizedAddress = address.toLowerCase();
//   
//   // TODO: Mettre à jour isAvailable
//   // return await this.findOneAndUpdate(
//   //   { address: normalizedAddress },
//   //   { $set: { isAvailable: isAvailable } },
//   //   { new: true }
//   // );
// };

/**
 * Incrémente le compteur de livraisons d'un livreur
 * @dev TODO: Implémenter la méthode statique incrementDeliveryCount
 * 
 * @param {string} address - Adresse blockchain du livreur
 * @returns {Promise<Object>} Document Deliverer mis à jour
 */
// delivererSchema.statics.incrementDeliveryCount = async function(address) {
//   // TODO: Normaliser l'adresse
//   // const normalizedAddress = address.toLowerCase();
//   
//   // TODO: Incrémenter totalDeliveries de 1
//   // return await this.findOneAndUpdate(
//   //   { address: normalizedAddress },
//   //   { $inc: { totalDeliveries: 1 } },
//   //   { new: true }
//   // );
// };

/**
 * Met à jour la note moyenne d'un livreur
 * @dev TODO: Implémenter la méthode statique updateRating
 * 
 * Logique:
 * - Récupérer toutes les livraisons DELIVERED du livreur
 * - Calculer la moyenne des ratings
 * - Mettre à jour le champ rating
 * 
 * @param {string} address - Adresse blockchain du livreur
 * @param {number} newRating - Nouvelle note (0-5)
 * @returns {Promise<Object>} Document Deliverer mis à jour
 */
// delivererSchema.statics.updateRating = async function(address, newRating) {
//   // TODO: Option 1: Mise à jour directe si on reçoit la nouvelle moyenne
//   // const normalizedAddress = address.toLowerCase();
//   // return await this.findOneAndUpdate(
//   //   { address: normalizedAddress },
//   //   { $set: { rating: newRating } },
//   //   { new: true }
//   // );
//   
//   // TODO: Option 2: Calculer la moyenne depuis les commandes
//   // const Order = mongoose.model('Order');
//   // const orders = await Order.find({ 
//   //   deliverer: delivererId, 
//   //   status: 'DELIVERED',
//   //   rating: { $exists: true }
//   // });
//   // const avgRating = orders.reduce((sum, order) => sum + order.rating, 0) / orders.length;
//   // return await this.findOneAndUpdate(
//   //   { address: normalizedAddress },
//   //   { $set: { rating: avgRating || 0 } },
//   //   { new: true }
//   // );
// };

/**
 * Récupère tous les livreurs disponibles et stakés
 * @dev TODO: Implémenter la méthode statique getAvailableDeliverers
 * 
 * @param {Object} options - Options de requête (location pour filtrage par distance)
 * @returns {Promise<Array>} Tableau de documents Deliverer disponibles
 */
// delivererSchema.statics.getAvailableDeliverers = async function(options = {}) {
//   // TODO: Construire la requête de base
//   // const query = { 
//   //   isAvailable: true, 
//   //   isStaked: true 
//   // };
//   
//   // TODO: Si location fournie, filtrer par distance (nécessite index géospatial)
//   // if (options.location && options.location.lat && options.location.lng) {
//   //   // Utiliser $near pour trouver les livreurs proches
//   //   query.currentLocation = {
//   //     $near: {
//   //       $geometry: {
//   //         type: "Point",
//   //         coordinates: [options.location.lng, options.location.lat]
//   //       },
//   //       $maxDistance: options.maxDistance || 10000 // 10km par défaut
//   //     }
//   //   };
//   // }
//   
//   // TODO: Exécuter la requête
//   // return await this.find(query).sort({ rating: -1 }); // Trier par note décroissante
// };

// === MÉTHODES D'INSTANCE ===

/**
 * Vérifie si le livreur peut accepter une nouvelle livraison
 * @dev TODO: Implémenter la méthode d'instance canAcceptDelivery
 * 
 * @returns {boolean} True si le livreur peut accepter une livraison
 */
// delivererSchema.methods.canAcceptDelivery = function() {
//   // TODO: Vérifier que le livreur est disponible et staké
//   // return this.isAvailable && this.isStaked;
// };

// TODO: Créer et exporter le modèle
// const Deliverer = mongoose.model("Deliverer", delivererSchema);
// module.exports = Deliverer;

