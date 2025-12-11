// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const delivererController = require("../controllers/delivererController");

// Importer les middlewares
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");

/**
 * Routes API pour les livreurs
 * @notice Gère toutes les routes liées aux livreurs
 * @dev Applique les middlewares d'authentification et de validation
 */

// Route POST /api/deliverers/register - Enregistrer un nouveau livreur
router.post(
  "/register",
  validation.validateAddress,              // Valider address dans body
  delivererController.registerDeliverer
);

// Route GET /api/deliverers/available - Récupérer les livreurs disponibles
// IMPORTANT: Cette route doit être AVANT /:address pour éviter que "available" soit interprété comme une adresse
router.get(
  "/available",
  delivererController.getAvailableDeliverers
);

// Route POST /api/deliverers/orders/:orderId/accept - Accepter une commande (livreur)
// IMPORTANT: Cette route doit être AVANT /:address pour éviter que "orders" soit interprété comme une adresse
router.post(
  "/orders/:orderId/accept",
  (req, res, next) => {
    console.log(`[Backend] 🔐 Middleware auth - Route accept order #${req.params.orderId}`);
    console.log(`[Backend]   - Headers:`, {
      authorization: req.headers.authorization ? 'present' : 'missing',
      'x-wallet-address': req.headers['x-wallet-address'],
      'x-message': req.headers['x-message']
    });
    next();
  },
  auth.verifySignature,                    // Vérifier signature
  (req, res, next) => {
    console.log(`[Backend] ✅ verifySignature passé, req.userAddress: ${req.userAddress}`);
    next();
  },
  auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
  (req, res, next) => {
    console.log(`[Backend] ✅ requireRole passé, req.userRole: ${req.userRole}`);
    next();
  },
  delivererController.acceptOrder
);

// Route GET /api/deliverers/:address - Récupérer les détails d'un livreur
router.get(
  "/:address",
  validation.validateAddress,              // Valider address dans params
  delivererController.getDeliverer
);

// Route PUT /api/deliverers/:address/status - Mettre à jour le statut de disponibilité
router.put(
  "/:address/status",
  auth.verifySignature,                    // Vérifier signature wallet Web3
  auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
  validation.validateAddress,              // Valider address dans params
  delivererController.updateDelivererStatus
);

// Route POST /api/deliverers/stake - Stake un livreur (dépôt de garantie)
router.post(
  "/stake",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
  delivererController.stakeAsDeliverer
);

// Route POST /api/deliverers/unstake - Retirer le stake d'un livreur
router.post(
  "/unstake",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
  delivererController.unstake
);

// Route GET /api/deliverers/:address/orders - Récupérer les commandes d'un livreur
router.get(
  "/:address/orders",
  validation.validateAddress,              // Valider address dans params
  delivererController.getDelivererOrders
);

// Route GET /api/deliverers/:address/earnings - Récupérer les earnings d'un livreur
router.get(
  "/:address/earnings",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("DELIVERER_ROLE"),      // Vérifier rôle livreur
  validation.validateAddress,              // Valider address dans params
  delivererController.getDelivererEarnings
);

// Exporter le router
module.exports = router;
