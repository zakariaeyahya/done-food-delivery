// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const tokenController = require("../controllers/tokenController");

// Importer les middlewares
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");

/**
 * Routes API pour les Tokens DONE
 * @notice Gère les opérations sur les tokens DONE (burn, use-discount, rate)
 * @dev Applique les middlewares d'authentification et de validation
 */

// Route GET /api/tokens/rate - Récupérer le taux de conversion tokens DONE
router.get(
  "/rate",
  tokenController.getTokenRate
);

// Route POST /api/tokens/burn - Consommer des tokens DONE pour une promotion/réduction
router.post(
  "/burn",
  auth.verifySignature,                    // Vérifier signature
  validation.validateAddress,              // Valider userAddress dans body
  tokenController.burnTokens
);

// Route POST /api/tokens/use-discount - Utiliser des tokens DONE pour obtenir une réduction
router.post(
  "/use-discount",
  auth.verifySignature,                    // Vérifier signature
  validation.validateAddress,              // Valider userAddress dans body
  tokenController.useDiscount
);

// Exporter le router
module.exports = router;

