// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const adminController = require("../controllers/adminController");
const analyticsController = require("../controllers/analyticsController");

// Importer les middlewares
// const verifyAdminRole = require("../middleware/verifyAdminRole");

/**
 * Routes API pour l'administration de la plateforme
 * @notice Gère toutes les routes liées à l'administration
 * @dev Applique le middleware verifyAdminRole pour protéger les routes
 * 
 *  NOTE: Le middleware verifyAdminRole doit être créé dans Sprint 8
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

// Route GET /api/admin/disputes/:id - Détails d'un litige
router.get(
  "/disputes/:id",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  adminController.getDisputeDetails
);

// Route POST /api/admin/disputes/:id/resolve - Résolution manuelle litige (nouvelle route cohérente)
router.post(
  "/disputes/:id/resolve",
  // verifyAdminRole, // ⏳ À activer après implémentation verifyAdminRole
  adminController.resolveDispute
);

// Route POST /api/admin/resolve-dispute/:id - Résolution manuelle litige (ancienne route pour compatibilité)
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

// Route GET /api/admin/orders - Liste toutes les commandes
router.get("/orders", adminController.getOrders);

// Route GET /api/admin/orders/:orderId - Détails d'une commande
router.get("/orders/:orderId", adminController.getOrderDetails);

// Route GET /api/admin/analytics/orders - Analytics commandes
router.get("/analytics/orders", adminController.getAnalyticsOrders);

// Route GET /api/admin/analytics/revenue - Analytics revenus
router.get("/analytics/revenue", adminController.getAnalyticsRevenue);

// Route GET /api/admin/analytics/users - Analytics utilisateurs
router.get("/analytics/users", analyticsController.getUsersAnalytics);

// Route GET /api/admin/analytics/top-deliverers - Top livreurs
router.get("/analytics/top-deliverers", adminController.getTopDeliverers);

// Route GET /api/admin/analytics/top-restaurants - Top restaurants
router.get("/analytics/top-restaurants", adminController.getTopRestaurants);

// Route GET /api/admin/analytics/disputes - Histogramme litiges
router.get("/analytics/disputes", adminController.getAnalyticsDisputes);

// Route GET /api/admin/ping - Vérifier connexion
router.get("/ping", adminController.ping);

// Route GET /api/admin/config - Configuration contrats
router.get("/config", adminController.getConfig);

// Exporter le router
module.exports = router;

