// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const adminController = require("../controllers/adminController");

// Importer les middlewares
// const verifyAdminRole = require("../middleware/verifyAdminRole");

/**
 * Routes API pour l'administration de la plateforme
 * @notice Gère toutes les routes liées à l'administration
 * @dev Applique le middleware verifyAdminRole pour protéger les routes
 * 
 * ⚠️ NOTE: Le middleware verifyAdminRole doit être créé dans Sprint 8
 * Pour l'instant, les routes sont accessibles sans protection (à activer après implémentation)
 */

// Route GET /api/admin/stats - Statistiques globales plateforme
router.get(
  "/stats",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  adminController.getStats
);

// Route GET /api/admin/disputes - Liste tous les litiges
router.get(
  "/disputes",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  adminController.getDisputes
);

// Route POST /api/admin/resolve-dispute/:id - Résolution manuelle litige
router.post(
  "/resolve-dispute/:id",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  adminController.resolveDispute
);

// Route GET /api/admin/users - Liste tous les clients
router.get(
  "/users",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  adminController.getAllUsers
);

// Route GET /api/admin/restaurants - Liste tous les restaurants
router.get(
  "/restaurants",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  adminController.getAllRestaurants
);

// Route GET /api/admin/deliverers - Liste tous les livreurs
router.get(
  "/deliverers",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  adminController.getAllDeliverers
);

// Exporter le router
module.exports = router;

