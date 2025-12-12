// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const orderController = require("../controllers/orderController");

// Importer les middlewares
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");

/**
 * Routes API pour les avis (reviews)
 * @notice Gère la soumission d'avis sur les commandes
 * @dev Cette route accepte orderId dans le body et redirige vers le contrôleur orders
 */

// Route POST /api/reviews - Soumettre un avis sur une commande
// Cette route accepte { orderId, rating, comment, clientAddress } dans le body
router.post(
  "/",
  auth.verifySignature,                    // Vérifier signature wallet Web3
  auth.requireRole("CLIENT_ROLE"),         // Vérifier rôle client
  (req, res, next) => {
    // Extraire orderId du body et le mettre dans req.params.id pour compatibilité avec le contrôleur
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "orderId is required in request body",
        field: "orderId"
      });
    }
    // Valider que orderId est un nombre
    const orderIdNum = parseInt(orderId, 10);
    if (isNaN(orderIdNum)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "orderId must be a valid number",
        field: "orderId"
      });
    }
    // Mettre orderId dans req.params pour que le contrôleur existant fonctionne
    req.params = { ...req.params, id: orderIdNum };
    req.orderId = orderIdNum;
    next();
  },
  validation.validateReview,               // Valider body { rating (1-5), comment, clientAddress }
  orderController.submitReview
);

module.exports = router;


