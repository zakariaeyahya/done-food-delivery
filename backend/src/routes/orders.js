// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const orderController = require("../controllers/orderController");

// Importer les middlewares
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");

/**
 * Routes API pour les commandes
 * @notice Gère toutes les routes liées au cycle de vie des commandes
 * @dev Applique les middlewares d'authentification et de validation
 */

// Route POST /api/orders/create - Créer une nouvelle commande
router.post(
  "/create",
  auth.verifySignature,                    // Vérifier signature wallet Web3
  validation.validateOrderCreation,        // Valider body de création
  orderController.createOrder
);

// Route GET /api/orders/:id - Récupérer les détails d'une commande
router.get(
  "/:id",
  validation.validateOrderId,              // Valider orderId dans params
  orderController.getOrder
);

// Route GET /api/orders/client/:address - Récupérer les commandes d'un client
router.get(
  "/client/:address",
  validation.validateAddress,              // Valider address dans params
  orderController.getOrdersByClient
);

// Route POST /api/orders/:id/confirm-preparation - Confirmer la préparation (restaurant)
router.post(
  "/:id/confirm-preparation",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
  validation.validateOrderId,              // Valider orderId
  orderController.confirmPreparation
);

// Route POST /api/orders/:id/assign-deliverer - Assigner un livreur
router.post(
  "/:id/assign-deliverer",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("PLATFORM_ROLE"),       // Seulement plateforme peut assigner
  validation.validateOrderId,              // Valider orderId
  orderController.assignDeliverer
);

// Route POST /api/orders/:id/confirm-pickup - Confirmer la récupération (livreur)
router.post(
  "/:id/confirm-pickup",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
  validation.validateOrderId,              // Valider orderId
  orderController.confirmPickup
);

// Route POST /api/orders/:id/update-gps - Mettre à jour la position GPS
router.post(
  "/:id/update-gps",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
  validation.validateOrderId,              // Valider orderId
  validation.validateGPS,                  // Valider coordonnées GPS
  orderController.updateGPSLocation
);

// Route POST /api/orders/:id/confirm-delivery - Confirmer la livraison (client)
router.post(
  "/:id/confirm-delivery",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("CLIENT_ROLE"),         // Vérifier rôle client
  validation.validateOrderId,              // Valider orderId
  orderController.confirmDelivery
);

// Route POST /api/orders/:id/dispute - Ouvrir un litige
router.post(
  "/:id/dispute",
  auth.verifySignature,                    // Vérifier signature
  validation.validateOrderId,              // Valider orderId
  orderController.openDispute
);

// Route POST /api/orders/:id/review - Soumettre un avis sur une commande
router.post(
  "/:id/review",
  auth.verifySignature,                    // Vérifier signature wallet Web3
  auth.requireRole("CLIENT_ROLE"),         // Vérifier rôle client
  validation.validateOrderId,              // Valider orderId
  validation.validateReview,               // Valider body { rating (1-5), comment, clientAddress }
  orderController.submitReview
);

// Route GET /api/orders/history/:address - Récupérer l'historique des commandes
router.get(
  "/history/:address",
  validation.validateAddress,              // Valider address dans params
  orderController.getOrderHistory
);

// Exporter le router
module.exports = router;

