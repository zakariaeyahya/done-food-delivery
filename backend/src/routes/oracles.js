// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const oracleController = require("../controllers/oracleController");

// Importer les middlewares
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");

/**
 * Routes API pour les Oracles (Sprint 6 - Chainlink)
 * @notice Gère les interactions avec les oracles Chainlink (prix, GPS, météo)
 * @dev Applique les middlewares d'authentification et de validation
 */

// Route GET /api/oracles/price - Récupérer le prix MATIC/USD depuis Chainlink Oracle
router.get(
  "/price",
  oracleController.getPrice
);

// Route POST /api/oracles/convert - Convertir un montant fiat (EUR/USD) en crypto (MATIC)
router.post(
  "/convert",
  oracleController.convertCurrency
);

// Route POST /api/oracles/gps/verify - Vérifier que la livraison a été effectuée (GPS Oracle)
router.post(
  "/gps/verify",
  auth.verifySignature,                    // Vérifier signature
  validation.validateGPSDelivery,          // Valider coordonnées GPS de livraison (delivererLat, delivererLng, clientLat, clientLng)
  oracleController.verifyGPSDelivery
);

// Route GET /api/oracles/weather - Récupérer les données météo pour ajuster frais de livraison
router.get(
  "/weather",
  validation.validateGPS,                   // Valider lat/lng dans query
  oracleController.getWeather
);

// Route GET /api/oracles/price/latest - Récupérer le dernier prix enregistré
router.get(
  "/price/latest",
  oracleController.getLatestPrice
);

// Route GET /api/oracles/price/metrics - Récupérer les métriques de performance prix
router.get(
  "/price/metrics",
  oracleController.getPriceMetrics
);

// Route POST /api/oracles/gps/update - Mettre à jour la position GPS du livreur
router.post(
  "/gps/update",
  auth.verifySignature,                    // Vérifier signature
  validation.validateGPS,                   // Valider coordonnées GPS
  oracleController.updateGPSLocation
);

// Route GET /api/oracles/gps/track/:orderId - Suivre la livraison en temps réel
router.get(
  "/gps/track/:orderId",
  validation.validateOrderId,              // Valider orderId
  oracleController.trackDelivery
);

// Route GET /api/oracles/gps/metrics - Récupérer les métriques GPS
router.get(
  "/gps/metrics",
  oracleController.getGPSMetrics
);

// Routes Arbitration (Sprint 6 - sous /api/oracles/arbitration)
const disputeController = require("../controllers/disputeController");

// Route POST /api/oracles/arbitration/dispute - Créer un nouveau litige
router.post(
  "/arbitration/dispute",
  auth.verifySignature,                    // Vérifier signature
  disputeController.createDispute
);

// Route POST /api/oracles/arbitration/vote - Voter sur un litige
router.post(
  "/arbitration/vote/:id",
  auth.verifySignature,                    // Vérifier signature
  validation.validateOrderId,              // Valider disputeId
  disputeController.voteDispute
);

// Route POST /api/oracles/arbitration/resolve/:disputeId - Résoudre un litige
router.post(
  "/arbitration/resolve/:disputeId",
  auth.verifySignature,                    // Vérifier signature
  validation.validateOrderId,              // Valider disputeId
  disputeController.resolveDispute
);

// Route GET /api/oracles/arbitration/dispute/:disputeId - Récupérer les détails d'un litige
router.get(
  "/arbitration/dispute/:disputeId",
  validation.validateOrderId,              // Valider disputeId
  disputeController.getDispute
);

// Route GET /api/oracles/arbitration/metrics - Récupérer les métriques d'arbitrage
router.get(
  "/arbitration/metrics",
  disputeController.getArbitrationMetrics
);

// Exporter le router
module.exports = router;

