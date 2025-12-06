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

// Exporter le router
module.exports = router;

