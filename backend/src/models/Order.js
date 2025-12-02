// TODO: Importer mongoose pour créer le schéma
// const mongoose = require("mongoose");

/**
 * Modèle Mongoose pour les commandes (données off-chain)
 * @notice Gère les données off-chain des commandes (GPS tracking, détails, litiges)
 * @dev Schema pour stocker les informations des commandes dans MongoDB
 * @dev L'orderId correspond à l'ID on-chain du smart contract
 */
// TODO: Définir le schéma Order
// const orderSchema = new mongoose.Schema({
//   // TODO: orderId - ID unique de la commande depuis la blockchain (unique, required)
//   orderId: {
//     type: Number,
//     required: true,
//     unique: true,
//     index: true
//   },
//
//   // TODO: txHash - Hash de la transaction blockchain de création (unique, required)
//   txHash: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     validate: {
//       validator: function(v) {
//         // TODO: Valider format hash transaction (0x + 64 caractères hex)
//         return /^0x[a-fA-F0-9]{64}$/.test(v);
//       },
//       message: 'Invalid transaction hash'
//     }
//   },
//
//   // TODO: client - Référence au modèle User
//   client: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//
//   // TODO: restaurant - Référence au modèle Restaurant
//   restaurant: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Restaurant',
//     required: true
//   },
//
//   // TODO: deliverer - Référence au modèle Deliverer (optionnel, assigné plus tard)
//   deliverer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Deliverer',
//     default: null
//   },
//
//   // TODO: items - Tableau des items commandés
//   items: [{
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       min: 1
//     },
//     price: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     image: {
//       type: String, // IPFS hash
//       trim: true
//     }
//   }],
//
//   // TODO: deliveryAddress - Adresse de livraison
//   deliveryAddress: {
//     type: String,
//     required: true,
//     trim: true
//   },
//
//   // TODO: ipfsHash - Hash IPFS contenant les détails complets de la commande
//   ipfsHash: {
//     type: String,
//     required: true,
//     trim: true
//   },
//
//   // TODO: status - État de la commande (enum)
//   status: {
//     type: String,
//     required: true,
//     enum: ['CREATED', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'DISPUTED'],
//     default: 'CREATED',
//     index: true
//   },
//
//   // TODO: foodPrice - Prix des plats en wei (converti en nombre pour MongoDB)
//   foodPrice: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//
//   // TODO: deliveryFee - Frais de livraison en wei
//   deliveryFee: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//
//   // TODO: platformFee - Commission plateforme en wei
//   platformFee: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//
//   // TODO: totalAmount - Montant total en wei
//   totalAmount: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//
//   // TODO: gpsTracking - Tableau des positions GPS du livreur pendant la livraison
//   gpsTracking: [{
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
//     timestamp: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//
//   // TODO: disputeReason - Raison du litige (si status = DISPUTED)
//   disputeReason: {
//     type: String,
//     trim: true,
//     maxlength: 500
//   },
//
//   // TODO: disputeEvidence - Hash IPFS des preuves du litige (images, etc.)
//   disputeEvidence: {
//     type: String, // IPFS hash
//     trim: true
//   },
//
//   // TODO: createdAt - Date de création
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//
//   // TODO: completedAt - Date de livraison complète
//   completedAt: {
//     type: Date,
//     default: null
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
//   collection: 'orders'
// });

// TODO: Créer des index pour performance
// orderSchema.index({ orderId: 1 }); // Index unique déjà créé
// orderSchema.index({ txHash: 1 }); // Index unique déjà créé
// orderSchema.index({ client: 1 });
// orderSchema.index({ restaurant: 1 });
// orderSchema.index({ deliverer: 1 });
// orderSchema.index({ status: 1 });
// orderSchema.index({ createdAt: -1 }); // Index décroissant pour trier par date récente

// === MÉTHODES STATIQUES ===

/**
 * Trouve une commande par son ID blockchain
 * @dev TODO: Implémenter la méthode statique findByOrderId
 * 
 * @param {number} orderId - ID de la commande depuis la blockchain
 * @returns {Promise<Object>} Document Order ou null
 */
// orderSchema.statics.findByOrderId = async function(orderId) {
//   // TODO: Rechercher la commande par orderId
//   // return await this.findOne({ orderId: orderId }).populate('client restaurant deliverer');
// };

/**
 * Met à jour le statut d'une commande
 * @dev TODO: Implémenter la méthode statique updateStatus
 * 
 * @param {number} orderId - ID de la commande
 * @param {string} newStatus - Nouveau statut (CREATED, PREPARING, IN_DELIVERY, DELIVERED, DISPUTED)
 * @returns {Promise<Object>} Document Order mis à jour
 */
// orderSchema.statics.updateStatus = async function(orderId, newStatus) {
//   // TODO: Préparer l'objet de mise à jour
//   // const update = { status: newStatus };
//   
//   // TODO: Si status = DELIVERED, mettre à jour completedAt
//   // if (newStatus === 'DELIVERED') {
//   //   update.completedAt = new Date();
//   // }
//   
//   // TODO: Mettre à jour la commande
//   // return await this.findOneAndUpdate(
//   //   { orderId: orderId },
//   //   { $set: update },
//   //   { new: true, runValidators: true }
//   // );
// };

/**
 * Ajoute une position GPS au tracking d'une commande
 * @dev TODO: Implémenter la méthode statique addGPSLocation
 * 
 * @param {number} orderId - ID de la commande
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Document Order mis à jour
 */
// orderSchema.statics.addGPSLocation = async function(orderId, lat, lng) {
//   // TODO: Ajouter la position GPS au tableau gpsTracking
//   // return await this.findOneAndUpdate(
//   //   { orderId: orderId },
//   //   { 
//   //     $push: { 
//   //       gpsTracking: { 
//   //         lat: lat, 
//   //         lng: lng, 
//   //         timestamp: new Date() 
//   //       } 
//   //     } 
//   //   },
//   //   { new: true }
//   // );
// };

/**
 * Récupère toutes les commandes d'un client
 * @dev TODO: Implémenter la méthode statique getOrdersByClient
 * 
 * @param {string} clientId - ID MongoDB du client
 * @param {Object} options - Options de requête (limit, skip, status)
 * @returns {Promise<Array>} Tableau de documents Order
 */
// orderSchema.statics.getOrdersByClient = async function(clientId, options = {}) {
//   // TODO: Construire la requête
//   // const query = { client: clientId };
//   
//   // TODO: Filtrer par status si fourni
//   // if (options.status) {
//   //   query.status = options.status;
//   // }
//   
//   // TODO: Construire la requête avec populate et tri
//   // let queryBuilder = this.find(query)
//   //   .populate('restaurant deliverer')
//   //   .sort({ createdAt: -1 }); // Plus récentes en premier
//   
//   // TODO: Appliquer pagination si fournie
//   // if (options.limit) {
//   //   queryBuilder = queryBuilder.limit(options.limit);
//   // }
//   // if (options.skip) {
//   //   queryBuilder = queryBuilder.skip(options.skip);
//   // }
//   
//   // TODO: Exécuter la requête
//   // return await queryBuilder.exec();
// };

/**
 * Récupère toutes les commandes d'un restaurant
 * @dev TODO: Implémenter la méthode statique getOrdersByRestaurant
 * 
 * @param {string} restaurantId - ID MongoDB du restaurant
 * @param {Object} options - Options de requête (limit, skip, status)
 * @returns {Promise<Array>} Tableau de documents Order
 */
// orderSchema.statics.getOrdersByRestaurant = async function(restaurantId, options = {}) {
//   // TODO: Construire la requête
//   // const query = { restaurant: restaurantId };
//   
//   // TODO: Filtrer par status si fourni
//   // if (options.status) {
//   //   query.status = options.status;
//   // }
//   
//   // TODO: Construire la requête avec populate et tri
//   // let queryBuilder = this.find(query)
//   //   .populate('client deliverer')
//   //   .sort({ createdAt: -1 });
//   
//   // TODO: Appliquer pagination si fournie
//   // if (options.limit) {
//   //   queryBuilder = queryBuilder.limit(options.limit);
//   // }
//   // if (options.skip) {
//   //   queryBuilder = queryBuilder.skip(options.skip);
//   // }
//   
//   // TODO: Exécuter la requête
//   // return await queryBuilder.exec();
// };

/**
 * Récupère toutes les commandes d'un livreur
 * @dev TODO: Implémenter la méthode statique getOrdersByDeliverer
 * 
 * @param {string} delivererId - ID MongoDB du livreur
 * @param {Object} options - Options de requête (limit, skip, status)
 * @returns {Promise<Array>} Tableau de documents Order
 */
// orderSchema.statics.getOrdersByDeliverer = async function(delivererId, options = {}) {
//   // TODO: Construire la requête
//   // const query = { deliverer: delivererId };
//   
//   // TODO: Filtrer par status si fourni
//   // if (options.status) {
//   //   query.status = options.status;
//   // }
//   
//   // TODO: Construire la requête avec populate et tri
//   // let queryBuilder = this.find(query)
//   //   .populate('client restaurant')
//   //   .sort({ createdAt: -1 });
//   
//   // TODO: Appliquer pagination si fournie
//   // if (options.limit) {
//   //   queryBuilder = queryBuilder.limit(options.limit);
//   // }
//   // if (options.skip) {
//   //   queryBuilder = queryBuilder.skip(options.skip);
//   // }
//   
//   // TODO: Exécuter la requête
//   // return await queryBuilder.exec();
// };

// === MÉTHODES D'INSTANCE ===

/**
 * Vérifie si la commande peut être mise à jour
 * @dev TODO: Implémenter la méthode d'instance canBeUpdated
 * 
 * @returns {boolean} True si la commande peut être mise à jour
 */
// orderSchema.methods.canBeUpdated = function() {
//   // TODO: Vérifier que le status n'est pas DELIVERED ou DISPUTED
//   // return this.status !== 'DELIVERED' && this.status !== 'DISPUTED';
// };

// TODO: Créer et exporter le modèle
// const Order = mongoose.model("Order", orderSchema);
// module.exports = Order;

