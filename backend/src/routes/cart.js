const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

/**
 * Routes API pour le panier
 * @notice Gere toutes les routes liees au panier utilisateur
 */

// GET /api/cart/:address - Recuperer le panier d'un utilisateur
router.get("/:address", cartController.getCart);

// POST /api/cart/:address/add - Ajouter un item au panier
router.post("/:address/add", cartController.addToCart);

// PUT /api/cart/:address/update - Mettre a jour la quantite d'un item
router.put("/:address/update", cartController.updateCartItem);

// DELETE /api/cart/:address/remove/:itemId - Supprimer un item du panier
router.delete("/:address/remove/:itemId", cartController.removeFromCart);

// DELETE /api/cart/:address/clear - Vider le panier
router.delete("/:address/clear", cartController.clearCart);

module.exports = router;
