// TODO: Importer Express Router
// const express = require("express");
// const router = express.Router();

// TODO: Importer les controllers
// const orderController = require("../controllers/orderController");

// TODO: Importer les middlewares
// const auth = require("../middleware/auth");
// const validation = require("../middleware/validation");

/**
 * Routes API pour les commandes
 * @notice Gère toutes les routes liées au cycle de vie des commandes
 * @dev Applique les middlewares d'authentification et de validation
 */

// TODO: Route POST /api/orders/create - Créer une nouvelle commande
// router.post(
//   "/create",
//   auth.verifySignature,                    // Vérifier signature wallet Web3
//   validation.validateOrderCreation,        // Valider body de création
//   orderController.createOrder
// );

// TODO: Route GET /api/orders/:id - Récupérer les détails d'une commande
// router.get(
//   "/:id",
//   validation.validateOrderId,              // Valider orderId dans params
//   orderController.getOrder
// );

// TODO: Route GET /api/orders/client/:address - Récupérer les commandes d'un client
// router.get(
//   "/client/:address",
//   validation.validateAddress,              // Valider address dans params
//   orderController.getOrdersByClient
// );

// TODO: Route POST /api/orders/:id/confirm-preparation - Confirmer la préparation (restaurant)
// router.post(
//   "/:id/confirm-preparation",
//   auth.verifySignature,                    // Vérifier signature
//   auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
//   validation.validateOrderId,              // Valider orderId
//   orderController.confirmPreparation
// );

// TODO: Route POST /api/orders/:id/assign-deliverer - Assigner un livreur
// router.post(
//   "/:id/assign-deliverer",
//   auth.verifySignature,                    // Vérifier signature
//   auth.requireRole("PLATFORM_ROLE"),       // Seulement plateforme peut assigner
//   validation.validateOrderId,              // Valider orderId
//   orderController.assignDeliverer
// );

// TODO: Route POST /api/orders/:id/confirm-pickup - Confirmer la récupération (livreur)
// router.post(
//   "/:id/confirm-pickup",
//   auth.verifySignature,                    // Vérifier signature
//   auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
//   validation.validateOrderId,              // Valider orderId
//   orderController.confirmPickup
// );

// TODO: Route POST /api/orders/:id/update-gps - Mettre à jour la position GPS
// router.post(
//   "/:id/update-gps",
//   auth.verifySignature,                    // Vérifier signature
//   auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
//   validation.validateOrderId,              // Valider orderId
//   validation.validateGPS,                  // Valider coordonnées GPS
//   orderController.updateGPSLocation
// );

// TODO: Route POST /api/orders/:id/confirm-delivery - Confirmer la livraison (client)
// router.post(
//   "/:id/confirm-delivery",
//   auth.verifySignature,                    // Vérifier signature
//   auth.requireRole("CLIENT_ROLE"),         // Vérifier rôle client
//   validation.validateOrderId,              // Valider orderId
//   orderController.confirmDelivery
// );

// TODO: Route POST /api/orders/:id/dispute - Ouvrir un litige
// router.post(
//   "/:id/dispute",
//   auth.verifySignature,                    // Vérifier signature
//   validation.validateOrderId,              // Valider orderId
//   orderController.openDispute
// );

// TODO: Route GET /api/orders/history/:address - Récupérer l'historique des commandes
// router.get(
//   "/history/:address",
//   validation.validateAddress,              // Valider address dans params
//   orderController.getOrderHistory
// );

// TODO: Exporter le router
// module.exports = router;

