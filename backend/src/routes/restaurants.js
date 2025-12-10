// Importer Express Router
const express = require("express");
const router = express.Router();

// Importer les controllers
const restaurantController = require("../controllers/restaurantController");

// Importer les middlewares
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");

// Importer multer pour l'upload de fichiers (images)
const multer = require("multer");

// Configuration multer pour stockage en mémoire
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max par fichier
  }
});

/**
 * Routes API pour les restaurants
 * @notice Gère toutes les routes liées aux restaurants
 * @dev Applique les middlewares d'authentification et de validation
 */

// Route POST /api/restaurants/register - Enregistrer un nouveau restaurant
router.post(
  "/register",
  upload.fields([
    { name: "images", maxCount: 10 },      // Upload multiple images
    { name: "menuItem_0", maxCount: 1 },   // Upload images pour chaque item menu
    { name: "menuItem_1", maxCount: 1 },
    { name: "menuItem_2", maxCount: 1 },
    { name: "menuItem_3", maxCount: 1 },
    { name: "menuItem_4", maxCount: 1 },
    { name: "menuItem_5", maxCount: 1 },
    { name: "menuItem_6", maxCount: 1 },
    { name: "menuItem_7", maxCount: 1 },
    { name: "menuItem_8", maxCount: 1 },
    { name: "menuItem_9", maxCount: 1 }
    // ... autres items menu peuvent être ajoutés dynamiquement
  ]),
  validation.validateAddress,              // Valider address dans body
  restaurantController.registerRestaurant
);

// Route GET /api/restaurants - Récupérer tous les restaurants avec filtres
router.get(
  "/",
  restaurantController.getAllRestaurants
);

// Route GET /api/restaurants/by-address/:address - Récupérer un restaurant par adresse wallet
router.get(
  "/by-address/:address",
  restaurantController.getRestaurantByAddress
);

// Route GET /api/restaurants/:id - Récupérer les détails d'un restaurant
router.get(
  "/:id",
  restaurantController.getRestaurant
);

// Route PUT /api/restaurants/:id - Mettre à jour les informations d'un restaurant
router.put(
  "/:id",
  auth.verifySignature,                    // Vérifier signature wallet Web3
  auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
  upload.fields([
    { name: "images", maxCount: 10 }       // Upload nouvelles images
  ]),
  restaurantController.updateRestaurant
);

// Route GET /api/restaurants/:id/orders - Récupérer les commandes d'un restaurant
router.get(
  "/:id/orders",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
  restaurantController.getRestaurantOrders
);

// Route GET /api/restaurants/:id/analytics - Récupérer les analytics d'un restaurant
router.get(
  "/:id/analytics",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
  restaurantController.getRestaurantAnalytics
);

// Route PUT /api/restaurants/:id/menu - Mettre à jour le menu d'un restaurant
router.put(
  "/:id/menu",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
  upload.fields([
    { name: "menuItem_0", maxCount: 1 },   // Upload images pour chaque item menu
    { name: "menuItem_1", maxCount: 1 },
    { name: "menuItem_2", maxCount: 1 },
    { name: "menuItem_3", maxCount: 1 },
    { name: "menuItem_4", maxCount: 1 },
    { name: "menuItem_5", maxCount: 1 },
    { name: "menuItem_6", maxCount: 1 },
    { name: "menuItem_7", maxCount: 1 },
    { name: "menuItem_8", maxCount: 1 },
    { name: "menuItem_9", maxCount: 1 }
    // ... autres items menu
  ]),
  restaurantController.updateMenu
);

// Route POST /api/restaurants/:id/menu/item - Ajouter un nouvel item au menu
router.post(
  "/:id/menu/item",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
  upload.single("image"),                   // Upload image de l'item
  restaurantController.addMenuItem
);

// Route PUT /api/restaurants/:id/menu/item/:itemId - Modifier un item existant du menu
router.put(
  "/:id/menu/item/:itemId",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
  upload.single("image"),                   // Upload nouvelle image si fournie
  restaurantController.updateMenuItem
);

// Route DELETE /api/restaurants/:id/menu/item/:itemId - Supprimer un item du menu
router.delete(
  "/:id/menu/item/:itemId",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
  restaurantController.deleteMenuItem
);

// Route GET /api/restaurants/:id/earnings - Récupérer les revenus on-chain du restaurant
router.get(
  "/:id/earnings",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
  restaurantController.getRestaurantEarnings
);

// Route POST /api/restaurants/:id/withdraw - Retirer les fonds du PaymentSplitter
// NOTE: Cette route est pour documentation. Le PaymentSplitter actuel utilise un pattern "push"
// (transfert immédiat lors de splitPayment). Si un pattern "pull" est nécessaire (balance en attente),
// il faudra modifier le contrat PaymentSplitter pour ajouter un système de balance.
router.post(
  "/:id/withdraw",
  auth.verifySignature,                    // Vérifier signature
  auth.requireRole("RESTAURANT_ROLE"),     // Vérifier rôle restaurant
  restaurantController.withdrawEarnings
);

// Exporter le router
module.exports = router;
