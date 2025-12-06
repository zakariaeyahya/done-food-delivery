// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const disputeController = require("../controllers/disputeController");

// Importer les middlewares
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");

/**
 * Routes API pour l'Arbitrage (Sprint 6 - DoneArbitration)
 * @notice Gère le système d'arbitrage décentralisé avec vote communautaire
 * @dev Applique les middlewares d'authentification et de validation
 */

// Route POST /api/disputes/:id/vote - Voter sur un litige (arbitrage décentralisé)
router.post(
  "/:id/vote",
  auth.verifySignature,                    // Vérifier signature
  validation.validateOrderId,              // Valider disputeId (utilise orderId)
  disputeController.voteDispute
);

// Route GET /api/disputes/:id/votes - Récupérer tous les votes d'un litige
router.get(
  "/:id/votes",
  validation.validateOrderId,              // Valider disputeId
  disputeController.getDisputeVotes
);

// Route POST /api/disputes/:id/resolve - Résoudre automatiquement un litige après vote
router.post(
  "/:id/resolve",
  auth.verifySignature,                    // Vérifier signature (admin ou automatique)
  validation.validateOrderId,              // Valider disputeId
  disputeController.resolveDispute
);

// Exporter le router
module.exports = router;

