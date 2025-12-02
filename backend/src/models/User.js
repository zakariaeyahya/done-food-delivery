// TODO: Importer mongoose pour créer le schéma
// const mongoose = require("mongoose");

/**
 * Modèle Mongoose pour les utilisateurs (clients)
 * @notice Gère les données off-chain des clients de la plateforme
 * @dev Schema pour stocker les informations des utilisateurs dans MongoDB
 */
// TODO: Définir le schéma User
// const userSchema = new mongoose.Schema({
//   // TODO: address - Adresse blockchain du client (unique, required)
//   address: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true, // Normaliser en minuscules
//     trim: true,
//     validate: {
//       validator: function(v) {
//         // TODO: Valider que c'est une adresse Ethereum valide (42 caractères, commence par 0x)
//         return /^0x[a-fA-F0-9]{40}$/.test(v);
//       },
//       message: 'Invalid Ethereum address'
//     }
//   },
//
//   // TODO: name - Nom complet du client (required)
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 2,
//     maxlength: 100
//   },
//
//   // TODO: email - Email du client (unique, optionnel)
//   email: {
//     type: String,
//     unique: true,
//     sparse: true, // Permet plusieurs null sans violation d'unicité
//     lowercase: true,
//     trim: true,
//     validate: {
//       validator: function(v) {
//         // TODO: Valider format email si fourni
//         return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
//       },
//       message: 'Invalid email format'
//     }
//   },
//
//   // TODO: phone - Numéro de téléphone (optionnel)
//   phone: {
//     type: String,
//     trim: true,
//     validate: {
//       validator: function(v) {
//         // TODO: Valider format téléphone si fourni
//         return !v || /^\+?[1-9]\d{1,14}$/.test(v);
//       },
//       message: 'Invalid phone number format'
//     }
//   },
//
//   // TODO: deliveryAddresses - Tableau d'adresses de livraison
//   deliveryAddresses: [{
//     label: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 50 // Ex: "Domicile", "Travail"
//     },
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
//   }],
//
//   // TODO: createdAt - Date de création (auto-généré)
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//
//   // TODO: updatedAt - Date de mise à jour (auto-généré)
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   // TODO: Options du schéma
//   timestamps: true, // Active automatiquement createdAt et updatedAt
//   collection: 'users' // Nom de la collection MongoDB
// });

// TODO: Créer un index sur address pour performance
// userSchema.index({ address: 1 });

// TODO: Créer un index sur email pour performance (si fourni)
// userSchema.index({ email: 1 }, { sparse: true });

// === MÉTHODES STATIQUES ===

/**
 * Trouve un utilisateur par son adresse blockchain
 * @dev TODO: Implémenter la méthode statique findByAddress
 * 
 * @param {string} address - Adresse blockchain du client
 * @returns {Promise<Object>} Document User ou null
 */
// userSchema.statics.findByAddress = async function(address) {
//   // TODO: Normaliser l'adresse en minuscules
//   // const normalizedAddress = address.toLowerCase();
//   
//   // TODO: Rechercher l'utilisateur par adresse
//   // return await this.findOne({ address: normalizedAddress });
// };

/**
 * Met à jour le profil d'un utilisateur
 * @dev TODO: Implémenter la méthode statique updateProfile
 * 
 * @param {string} address - Adresse blockchain du client
 * @param {Object} updates - Objet contenant les champs à mettre à jour
 * @returns {Promise<Object>} Document User mis à jour
 */
// userSchema.statics.updateProfile = async function(address, updates) {
//   // TODO: Normaliser l'adresse
//   // const normalizedAddress = address.toLowerCase();
//   
//   // TODO: Mettre à jour le document avec new: true pour retourner le document mis à jour
//   // return await this.findOneAndUpdate(
//   //   { address: normalizedAddress },
//   //   { $set: updates },
//   //   { new: true, runValidators: true }
//   // );
// };

/**
 * Ajoute une nouvelle adresse de livraison à un utilisateur
 * @dev TODO: Implémenter la méthode statique addDeliveryAddress
 * 
 * @param {string} address - Adresse blockchain du client
 * @param {Object} addressData - Objet contenant { label, address, lat, lng }
 * @returns {Promise<Object>} Document User mis à jour
 */
// userSchema.statics.addDeliveryAddress = async function(address, addressData) {
//   // TODO: Normaliser l'adresse
//   // const normalizedAddress = address.toLowerCase();
//   
//   // TODO: Ajouter la nouvelle adresse au tableau deliveryAddresses
//   // return await this.findOneAndUpdate(
//   //   { address: normalizedAddress },
//   //   { $push: { deliveryAddresses: addressData } },
//   //   { new: true, runValidators: true }
//   // );
// };

// === MÉTHODES D'INSTANCE ===

/**
 * Vérifie si l'utilisateur a une adresse de livraison avec un label spécifique
 * @dev TODO: Implémenter la méthode d'instance hasDeliveryAddress
 * 
 * @param {string} label - Label de l'adresse à vérifier
 * @returns {boolean} True si l'adresse existe
 */
// userSchema.methods.hasDeliveryAddress = function(label) {
//   // TODO: Vérifier si une adresse avec ce label existe
//   // return this.deliveryAddresses.some(addr => addr.label === label);
// };

// TODO: Créer et exporter le modèle
// const User = mongoose.model("User", userSchema);
// module.exports = User;

