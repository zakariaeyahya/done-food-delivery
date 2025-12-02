// TODO: Importer mongoose pour créer le schéma
// const mongoose = require("mongoose");

/**
 * Modèle Mongoose pour les restaurants
 * @notice Gère les données off-chain des restaurants (menus, images, localisation)
 * @dev Schema pour stocker les informations des restaurants dans MongoDB
 */
// TODO: Définir le schéma Restaurant
// const restaurantSchema = new mongoose.Schema({
//   // TODO: address - Adresse blockchain du restaurant (unique, required)
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
//   // TODO: name - Nom du restaurant (required)
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 2,
//     maxlength: 100
//   },
//
//   // TODO: cuisine - Type de cuisine (optionnel)
//   cuisine: {
//     type: String,
//     trim: true,
//     maxlength: 50 // Ex: "Italienne", "Japonaise", "Française"
//   },
//
//   // TODO: description - Description du restaurant (optionnel)
//   description: {
//     type: String,
//     trim: true,
//     maxlength: 500
//   },
//
//   // TODO: location - Localisation géographique du restaurant
//   location: {
//     address: {
//       type: String,
//       required: true,
//       trim: true
//     },
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
//     }
//   },
//
//   // TODO: images - Tableau de hash IPFS des images du restaurant
//   images: [{
//     type: String,
//     trim: true
//   }],
//
//   // TODO: menu - Tableau des items du menu
//   menu: [{
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 100
//     },
//     description: {
//       type: String,
//       trim: true,
//       maxlength: 500
//     },
//     price: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     image: {
//       type: String, // IPFS hash
//       trim: true
//     },
//     category: {
//       type: String,
//       trim: true,
//       maxlength: 50 // Ex: "Pizzas", "Desserts", "Boissons"
//     },
//     available: {
//       type: Boolean,
//       default: true
//     }
//   }],
//
//   // TODO: rating - Note moyenne du restaurant (0-5)
//   rating: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 5
//   },
//
//   // TODO: totalOrders - Nombre total de commandes
//   totalOrders: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//
//   // TODO: isActive - Indique si le restaurant est actif
//   isActive: {
//     type: Boolean,
//     default: true
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
//   collection: 'restaurants'
// });

// TODO: Créer des index pour performance
// restaurantSchema.index({ address: 1 });
// restaurantSchema.index({ cuisine: 1 });
// restaurantSchema.index({ "location.lat": 1, "location.lng": 1 }); // Index géospatial
// restaurantSchema.index({ isActive: 1 });

// === MÉTHODES STATIQUES ===

/**
 * Trouve un restaurant par son adresse blockchain
 * @dev TODO: Implémenter la méthode statique findByAddress
 * 
 * @param {string} address - Adresse blockchain du restaurant
 * @returns {Promise<Object>} Document Restaurant ou null
 */
// restaurantSchema.statics.findByAddress = async function(address) {
//   // TODO: Normaliser l'adresse en minuscules
//   // const normalizedAddress = address.toLowerCase();
//   
//   // TODO: Rechercher le restaurant par adresse
//   // return await this.findOne({ address: normalizedAddress });
// };

/**
 * Met à jour le menu complet d'un restaurant
 * @dev TODO: Implémenter la méthode statique updateMenu
 * 
 * @param {string} restaurantId - ID MongoDB du restaurant
 * @param {Array} menu - Nouveau tableau de menu items
 * @returns {Promise<Object>} Document Restaurant mis à jour
 */
// restaurantSchema.statics.updateMenu = async function(restaurantId, menu) {
//   // TODO: Mettre à jour le menu complet
//   // return await this.findByIdAndUpdate(
//   //   restaurantId,
//   //   { $set: { menu: menu } },
//   //   { new: true, runValidators: true }
//   // );
// };

/**
 * Incrémente le compteur de commandes d'un restaurant
 * @dev TODO: Implémenter la méthode statique incrementOrderCount
 * 
 * @param {string} restaurantId - ID MongoDB du restaurant
 * @returns {Promise<Object>} Document Restaurant mis à jour
 */
// restaurantSchema.statics.incrementOrderCount = async function(restaurantId) {
//   // TODO: Incrémenter totalOrders de 1
//   // return await this.findByIdAndUpdate(
//   //   restaurantId,
//   //   { $inc: { totalOrders: 1 } },
//   //   { new: true }
//   // );
// };

/**
 * Met à jour la note moyenne d'un restaurant
 * @dev TODO: Implémenter la méthode statique updateRating
 * 
 * Logique:
 * - Récupérer toutes les commandes DELIVERED du restaurant
 * - Calculer la moyenne des ratings (si système de notation implémenté)
 * - Mettre à jour le champ rating
 * 
 * Note: Pour l'instant, on peut utiliser une moyenne simple ou un système de votes
 * 
 * @param {string} restaurantId - ID MongoDB du restaurant
 * @param {number} newRating - Nouvelle note (0-5)
 * @returns {Promise<Object>} Document Restaurant mis à jour
 */
// restaurantSchema.statics.updateRating = async function(restaurantId, newRating) {
//   // TODO: Option 1: Mise à jour directe si on reçoit la nouvelle moyenne
//   // return await this.findByIdAndUpdate(
//   //   restaurantId,
//   //   { $set: { rating: newRating } },
//   //   { new: true }
//   // );
//   
//   // TODO: Option 2: Calculer la moyenne depuis les commandes
//   // const Order = mongoose.model('Order');
//   // const orders = await Order.find({ 
//   //   restaurant: restaurantId, 
//   //   status: 'DELIVERED',
//   //   rating: { $exists: true }
//   // });
//   // const avgRating = orders.reduce((sum, order) => sum + order.rating, 0) / orders.length;
//   // return await this.findByIdAndUpdate(
//   //   restaurantId,
//   //   { $set: { rating: avgRating || 0 } },
//   //   { new: true }
//   // );
// };

// === MÉTHODES D'INSTANCE ===

/**
 * Vérifie si un item du menu est disponible
 * @dev TODO: Implémenter la méthode d'instance isMenuItemAvailable
 * 
 * @param {string} itemName - Nom de l'item
 * @returns {boolean} True si l'item est disponible
 */
// restaurantSchema.methods.isMenuItemAvailable = function(itemName) {
//   // TODO: Chercher l'item dans le menu
//   // const item = this.menu.find(item => item.name === itemName);
//   // return item && item.available;
// };

// TODO: Créer et exporter le modèle
// const Restaurant = mongoose.model("Restaurant", restaurantSchema);
// module.exports = Restaurant;

