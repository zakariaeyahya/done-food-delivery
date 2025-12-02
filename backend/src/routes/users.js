// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const userController = require("../controllers/userController");

// Importer les middlewares
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");

/**
 * Routes API pour les utilisateurs (clients)
 * @notice Gère toutes les routes liées aux utilisateurs/clients
 * @dev Applique les middlewares d'authentification et de validation
 */

// Route POST /api/users/register - Enregistrer un nouvel utilisateur
router.post(
  "/register",
  validation.validateAddress,              // Valider address dans body
  userController.registerUser
);

// Route GET /api/users/:address - Récupérer le profil d'un utilisateur
router.get(
  "/:address",
  validation.validateAddress,              // Valider address dans params
  userController.getUserProfile
);

// Route PUT /api/users/:address - Mettre à jour le profil d'un utilisateur
router.put(
  "/:address",
  auth.verifySignature,                    // Vérifier signature wallet Web3
  auth.requireOwnership("user", "address"), // Vérifier que l'utilisateur modifie son propre profil
  validation.validateAddress,              // Valider address dans params
  userController.updateUserProfile
);

// Route GET /api/users/:address/orders - Récupérer les commandes d'un utilisateur
router.get(
  "/:address/orders",
  validation.validateAddress,              // Valider address dans params
  userController.getUserOrders
);

// Route GET /api/users/:address/tokens - Récupérer les tokens et transactions d'un utilisateur
router.get(
  "/:address/tokens",
  validation.validateAddress,              // Valider address dans params
  userController.getUserTokens
);

// Exporter le router
module.exports = router;
