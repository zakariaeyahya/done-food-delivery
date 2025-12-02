// TODO: Importer Express Router
// const express = require("express");
// const router = express.Router();

// TODO: Importer les controllers
// const delivererController = require("../controllers/delivererController");

// TODO: Importer les middlewares
// const auth = require("../middleware/auth");
// const validation = require("../middleware/validation");

/**
 * Routes API pour les livreurs
 * @notice Gère toutes les routes liées aux livreurs
 * @dev Applique les middlewares d'authentification et de validation
 */

// TODO: Route POST /api/deliverers/register - Enregistrer un nouveau livreur
// router.post(
//   "/register",
//   validation.validateAddress,              // Valider address dans body
//   delivererController.registerDeliverer
// );

// TODO: Route GET /api/deliverers/:address - Récupérer les détails d'un livreur
// router.get(
//   "/:address",
//   validation.validateAddress,              // Valider address dans params
//   delivererController.getDeliverer
// );

// TODO: Route GET /api/deliverers/available - Récupérer les livreurs disponibles
// router.get(
//   "/available",
//   delivererController.getAvailableDeliverers
// );

// TODO: Route PUT /api/deliverers/:address/status - Mettre à jour le statut de disponibilité
// router.put(
//   "/:address/status",
//   auth.verifySignature,                    // Vérifier signature wallet Web3
//   auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
//   validation.validateAddress,              // Valider address dans params
//   delivererController.updateDelivererStatus
// );

// TODO: Route POST /api/deliverers/stake - Stake un livreur (dépôt de garantie)
// router.post(
//   "/stake",
//   auth.verifySignature,                    // Vérifier signature
//   auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
//   delivererController.stakeAsDeliverer
// );

// TODO: Route POST /api/deliverers/unstake - Retirer le stake d'un livreur
// router.post(
//   "/unstake",
//   auth.verifySignature,                    // Vérifier signature
//   auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
//   delivererController.unstake
// );

// TODO: Route GET /api/deliverers/:address/orders - Récupérer les commandes d'un livreur
// router.get(
//   "/:address/orders",
//   validation.validateAddress,              // Valider address dans params
//   delivererController.getDelivererOrders
// );

// TODO: Route GET /api/deliverers/:address/earnings - Récupérer les earnings d'un livreur
// router.get(
//   "/:address/earnings",
//   auth.verifySignature,                    // Vérifier signature
//   auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
//   validation.validateAddress,              // Valider address dans params
//   delivererController.getDelivererEarnings
// );

// TODO: Exporter le router
// module.exports = router;

