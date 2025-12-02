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

// Exporter le router
module.exports = router;
