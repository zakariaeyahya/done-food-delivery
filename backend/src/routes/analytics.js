// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const analyticsController = require("../controllers/analyticsController");

// Importer les middlewares
// const verifyAdminRole = require("../middleware/verifyAdminRole");

/**
 * Routes API pour les analytics et statistiques avancées
 * @notice Gère toutes les routes liées aux analytics
 * @dev Applique le middleware verifyAdminRole pour protéger les routes
 * 
 * ⚠️ NOTE: Le middleware verifyAdminRole doit être créé dans Sprint 8
 * Pour l'instant, les routes sont accessibles sans protection (à activer après implémentation)
 */

// Route GET /api/analytics/dashboard - Dashboard analytics complet
router.get(
  "/dashboard",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  analyticsController.getDashboard
);

// Route GET /api/analytics/orders - Analytics commandes (croissance, tendances)
router.get(
  "/orders",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  analyticsController.getOrdersAnalytics
);

// Route GET /api/analytics/revenue - Analytics revenus plateforme
router.get(
  "/revenue",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  analyticsController.getRevenueAnalytics
);

// Route GET /api/analytics/users - Analytics utilisateurs (growth, distribution)
router.get(
  "/users",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  analyticsController.getUsersAnalytics
);

// Exporter le router
module.exports = router;

