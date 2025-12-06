// Importer les services nécessaires
const ipfsService = require("../services/ipfsService");
const gpsTracker = require("../utils/gpsTracker");

// Importer les modèles MongoDB
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");

// Importer ethers pour validation d'adresses
const { ethers } = require("ethers");

/**
 * Controller pour gérer les restaurants
 * @notice Gère l'enregistrement, menus, commandes et analytics des restaurants
 * @dev Intègre IPFS pour les images et MongoDB pour les données
 */

/**
 * Enregistre un nouveau restaurant
 * @dev Implémenté - MongoDB + IPFS
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function registerRestaurant(req, res) {
  try {
    // Récupérer les données du body
    const { address, name, cuisine, description, email, phone, location, menu } = req.body;
    
    // Valider address Ethereum
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }
    
    // Vérifier si le restaurant existe déjà
    const existingRestaurant = await Restaurant.findByAddress(address.toLowerCase());
    if (existingRestaurant) {
      return res.status(409).json({
        error: "Conflict",
        message: "Restaurant already exists"
      });
    }
    
    // Upload images[] vers IPFS via ipfsService.uploadMultipleImages() si fichiers fournis
    let imageHashes = [];
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      const fileBuffers = imageFiles.map(file => file.buffer || Buffer.from(file.data));
      const fileNames = imageFiles.map(file => file.originalname || `image_${Date.now()}.jpg`);
      const uploadResults = await ipfsService.uploadMultipleImages(fileBuffers, fileNames);
      imageHashes = uploadResults.map(r => r.ipfsHash);
    }
    
    // Upload menu items images vers IPFS si fichiers fournis
    const processedMenu = menu && Array.isArray(menu) ? [...menu] : [];
    if (req.files && processedMenu.length > 0) {
      for (let i = 0; i < processedMenu.length; i++) {
        const item = processedMenu[i];
        if (req.files[`menuItem_${i}`]) {
          const file = Array.isArray(req.files[`menuItem_${i}`]) ? req.files[`menuItem_${i}`][0] : req.files[`menuItem_${i}`];
          const fileBuffer = file.buffer || Buffer.from(file.data);
          const fileName = file.originalname || `menu_item_${i}.jpg`;
          const imageResult = await ipfsService.uploadImage(fileBuffer, fileName);
          item.image = imageResult.ipfsHash;
        }
      }
    }
    
    // Créer Restaurant dans MongoDB avec IPFS hashes
    const restaurant = new Restaurant({
      address: address.toLowerCase(),
      name,
      cuisine,
      description,
      email,
      phone,
      location,
      images: imageHashes,
      menu: processedMenu,
      rating: 0,
      totalOrders: 0,
      isActive: true
    });
    await restaurant.save();
    
    // Retourner succès
    return res.status(201).json({
      success: true,
      restaurant: {
        id: restaurant._id,
        address: restaurant.address,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        description: restaurant.description,
        location: restaurant.location,
        images: imageHashes.map(hash => ipfsService.getImage(hash)),
        menu: restaurant.menu
      }
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error registering restaurant:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to register restaurant",
      details: error.message
    });
  }
}

/**
 * Récupère les détails d'un restaurant
 * @dev Implémenté - MongoDB + IPFS URLs
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getRestaurant(req, res) {
  try {
    // Récupérer id depuis params (peut être _id MongoDB ou address)
    const restaurantId = req.params.id;
    
    // Fetch Restaurant depuis MongoDB (essayer par _id d'abord, puis par address)
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      // C'est un ObjectId MongoDB
      restaurant = await Restaurant.findById(restaurantId);
    } else {
      // C'est probablement une adresse
      restaurant = await Restaurant.findByAddress(restaurantId);
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Populate menu avec images IPFS URLs complètes
    const menuWithImages = restaurant.menu.map(item => ({
      ...item.toObject(),
      imageUrl: item.image ? ipfsService.getImage(item.image) : null
    }));
    
    // Construire les URLs complètes des images
    const imagesUrls = restaurant.images.map(hash => ipfsService.getImage(hash));
    
    // Retourner restaurant data
    return res.status(200).json({
      success: true,
      restaurant: {
        id: restaurant._id,
        address: restaurant.address,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        description: restaurant.description,
        email: restaurant.email,
        phone: restaurant.phone,
        location: restaurant.location,
        images: imagesUrls,
        menu: menuWithImages,
        rating: restaurant.rating,
        totalOrders: restaurant.totalOrders,
        isActive: restaurant.isActive
      }
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error getting restaurant:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get restaurant",
      details: error.message
    });
  }
}

/**
 * Récupère tous les restaurants avec filtres
 * @dev Implémenté - MongoDB + filtres
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getAllRestaurants(req, res) {
  try {
    // Récupérer les filtres depuis query
    const { cuisine, location, priceRange, isActive } = req.query;
    
    // Construire la requête de base
    let query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    } else {
      query.isActive = true; // Par défaut, seulement les actifs
    }
    
    // Filtrer par cuisine si fourni
    if (cuisine) {
      query.cuisine = cuisine;
    }
    
    // Fetch restaurants depuis MongoDB
    let restaurants = await Restaurant.find(query);
    
    // Filtrer par location si fourni (calculer distance avec gpsTracker)
    if (location) {
      try {
        const locationData = typeof location === 'string' ? JSON.parse(location) : location;
        const { lat, lng, maxDistance } = locationData;
        restaurants = restaurants.filter(restaurant => {
          const distance = gpsTracker.calculateDistance(
            lat,
            lng,
            restaurant.location.lat,
            restaurant.location.lng
          );
          return distance <= (maxDistance || 10); // 10km par défaut
        });
      } catch (parseError) {
        console.warn("Error parsing location filter:", parseError);
      }
    }
    
    // Filtrer par priceRange si fourni
    if (priceRange) {
      try {
        const priceData = typeof priceRange === 'string' ? JSON.parse(priceRange) : priceRange;
        const { min, max } = priceData;
        restaurants = restaurants.filter(restaurant => {
          if (!restaurant.menu || restaurant.menu.length === 0) return false;
          const avgPrice = restaurant.menu.reduce((sum, item) => sum + (item.price || 0), 0) / restaurant.menu.length;
          return avgPrice >= min && avgPrice <= max;
        });
      } catch (parseError) {
        console.warn("Error parsing priceRange filter:", parseError);
      }
    }
    
    // Populate images URLs
    restaurants = restaurants.map(restaurant => ({
      ...restaurant.toObject(),
      images: restaurant.images.map(hash => ipfsService.getImage(hash))
    }));
    
    // Retourner array of restaurants
    return res.status(200).json({
      success: true,
      restaurants,
      count: restaurants.length
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error getting restaurants:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get restaurants",
      details: error.message
    });
  }
}

/**
 * Met à jour les informations d'un restaurant
 * @dev Implémenté - MongoDB + IPFS
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function updateRestaurant(req, res) {
  try {
    // Récupérer id depuis params
    const restaurantId = req.params.id;
    
    // Récupérer le restaurant depuis MongoDB
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else {
      restaurant = await Restaurant.findByAddress(restaurantId);
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Récupérer les données à mettre à jour depuis body
    const { name, cuisine, description, email, phone, location, menu } = req.body;
    
    // Upload nouvelles images vers IPFS si fournies
    let newImageHashes = [];
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      const fileBuffers = imageFiles.map(file => file.buffer || Buffer.from(file.data));
      const fileNames = imageFiles.map(file => file.originalname || `image_${Date.now()}.jpg`);
      const uploadResults = await ipfsService.uploadMultipleImages(fileBuffers, fileNames);
      newImageHashes = uploadResults.map(r => r.ipfsHash);
    }
    
    // Préparer les updates
    const updates = {};
    if (name) updates.name = name;
    if (cuisine) updates.cuisine = cuisine;
    if (description !== undefined) updates.description = description;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (location) updates.location = location;
    if (menu) updates.menu = menu;
    if (newImageHashes.length > 0) {
      updates.images = [...restaurant.images, ...newImageHashes];
    }
    
    // Update Restaurant dans MongoDB
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurant._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    // Retourner succès
    return res.status(200).json({
      success: true,
      restaurant: updatedRestaurant
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error updating restaurant:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update restaurant",
      details: error.message
    });
  }
}

/**
 * Récupère les commandes d'un restaurant
 * @dev Implémenté - MongoDB uniquement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getRestaurantOrders(req, res) {
  try {
    // Récupérer restaurantId depuis params
    const restaurantId = req.params.id;
    
    // Récupérer le restaurant pour obtenir son ID MongoDB
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else {
      restaurant = await Restaurant.findByAddress(restaurantId);
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Récupérer status depuis query (optionnel)
    const { status } = req.query;
    
    // Fetch orders du restaurant depuis MongoDB via Order.getOrdersByRestaurant()
    const orders = await Order.getOrdersByRestaurant(restaurant._id, {
      status
    });
    
    // Retourner array of orders
    return res.status(200).json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error getting restaurant orders:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get restaurant orders",
      details: error.message
    });
  }
}

/**
 * Récupère les analytics d'un restaurant
 * @dev Implémenté - Calculs MongoDB uniquement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getRestaurantAnalytics(req, res) {
  try {
    // Récupérer restaurantId depuis params
    const restaurantId = req.params.id;
    
    // Récupérer le restaurant
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else {
      restaurant = await Restaurant.findByAddress(restaurantId);
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Récupérer startDate et endDate depuis query
    const { startDate, endDate } = req.query;
    
    // Construire la requête avec dates
    let query = { restaurant: restaurant._id, status: 'DELIVERED' };
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }
    
    // Calcule stats depuis MongoDB
    const orders = await Order.find(query);
    
    // totalOrders = count(orders)
    const totalOrders = orders.length;
    
    // revenue = sum(order.foodPrice * 0.7) // 70% du split (approximation)
    const revenue = orders.reduce((sum, order) => {
      // Convertir wei en MATIC (approximation, 1e18)
      const foodPriceMATIC = parseFloat(order.foodPrice) / 1e18;
      return sum + (foodPriceMATIC * 0.7);
    }, 0);
    
    // averageRating = restaurant.rating
    const averageRating = restaurant.rating || 0;
    
    // popularDishes = group by item.name, count
    const dishCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        dishCounts[item.name] = (dishCounts[item.name] || 0) + item.quantity;
      });
    });
    const popularDishes = Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
    
    // Retourner analytics
    return res.status(200).json({
      success: true,
      analytics: {
        totalOrders,
        revenue: parseFloat(revenue.toFixed(2)),
        averageRating,
        popularDishes
      }
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error getting restaurant analytics:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get restaurant analytics",
      details: error.message
    });
  }
}

/**
 * Met à jour le menu d'un restaurant
 * @dev Implémenté - MongoDB + IPFS
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function updateMenu(req, res) {
  try {
    // Récupérer restaurantId depuis params
    const restaurantId = req.params.id;
    
    // Récupérer le restaurant
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else {
      restaurant = await Restaurant.findByAddress(restaurantId);
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Récupérer menu[] depuis body
    const { menu } = req.body;
    
    if (!menu || !Array.isArray(menu)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Menu must be an array"
      });
    }
    
    // Upload dish images vers IPFS si nouvelles images
    const processedMenu = [...menu];
    if (req.files) {
      for (let i = 0; i < processedMenu.length; i++) {
        const item = processedMenu[i];
        if (req.files[`menuItem_${i}`]) {
          const file = Array.isArray(req.files[`menuItem_${i}`]) ? req.files[`menuItem_${i}`][0] : req.files[`menuItem_${i}`];
          const fileBuffer = file.buffer || Buffer.from(file.data);
          const fileName = file.originalname || `menu_item_${i}.jpg`;
          const imageResult = await ipfsService.uploadImage(fileBuffer, fileName);
          item.image = imageResult.ipfsHash;
        }
      }
    }
    
    // Update menu[] dans MongoDB via Restaurant.updateMenu()
    const updatedRestaurant = await Restaurant.updateMenu(restaurant._id, processedMenu);
    
    // Retourner succès
    return res.status(200).json({
      success: true,
      menu: updatedRestaurant.menu
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error updating menu:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update menu",
      details: error.message
    });
  }
}

/**
 * Ajoute un nouvel item au menu
 * @dev TODO: Implémenter complètement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function addMenuItem(req, res) {
  try {
    const { id } = req.params;
    const { name, price, description, category } = req.body;
    
    // TODO: Implémenter la logique complète
    // - Upload image vers IPFS si fournie
    // - Ajouter l'item au menu du restaurant
    // - Sauvegarder dans MongoDB
    
    return res.status(201).json({
      success: true,
      message: "addMenuItem - TODO: Implementation",
      item: { name, price, description, category }
    });
  } catch (error) {
    console.error("Error adding menu item:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to add menu item",
      details: error.message
    });
  }
}

/**
 * Modifie un item existant du menu
 * @dev TODO: Implémenter complètement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function updateMenuItem(req, res) {
  try {
    const { id, itemId } = req.params;
    const { name, price, description, category } = req.body;
    
    // TODO: Implémenter la logique complète
    // - Upload nouvelle image vers IPFS si fournie
    // - Mettre à jour l'item dans le menu
    // - Sauvegarder dans MongoDB
    
    return res.status(200).json({
      success: true,
      message: "updateMenuItem - TODO: Implementation",
      item: { id: itemId, name, price, description, category }
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update menu item",
      details: error.message
    });
  }
}

/**
 * Supprime un item du menu
 * @dev TODO: Implémenter complètement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function deleteMenuItem(req, res) {
  try {
    const { id, itemId } = req.params;
    
    // TODO: Implémenter la logique complète
    // - Retirer l'item du menu
    // - Sauvegarder dans MongoDB
    
    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      itemId
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete menu item",
      details: error.message
    });
  }
}

/**
 * Récupère les revenus on-chain du restaurant
 * @dev TODO: Implémenter avec blockchainService
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getRestaurantEarnings(req, res) {
  try {
    const { id } = req.params;
    
    // TODO: Implémenter la logique complète
    // - Parser events PaymentSplit depuis blockchain
    // - Filtrer par restaurantAddress
    // - Calculer total earnings (70% de chaque commande)
    
    return res.status(200).json({
      success: true,
      message: "getRestaurantEarnings - TODO: Implementation",
      data: {
        totalEarnings: "0.00",
        breakdown: {
          onChain: "0.00",
          pending: "0.00"
        },
        transactions: []
      }
    });
  } catch (error) {
    console.error("Error getting restaurant earnings:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get restaurant earnings",
      details: error.message
    });
  }
}

/**
 * Retire les fonds du PaymentSplitter
 * @dev TODO: Implémenter avec blockchainService
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function withdrawEarnings(req, res) {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    // TODO: Implémenter la logique complète
    // - Vérifier que le restaurant a des fonds disponibles
    // - Appeler blockchainService.withdraw() si pattern "pull" implémenté
    // - Retourner txHash
    
    return res.status(200).json({
      success: true,
      message: "withdrawEarnings - TODO: Implementation",
      data: {
        txHash: null,
        amount: amount || "0.00"
      }
    });
  } catch (error) {
    console.error("Error withdrawing earnings:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to withdraw earnings",
      details: error.message
    });
  }
}

// Exporter toutes les fonctions
module.exports = {
  registerRestaurant,
  getRestaurant,
  getAllRestaurants,
  updateRestaurant,
  getRestaurantOrders,
  getRestaurantAnalytics,
  updateMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getRestaurantEarnings,
  withdrawEarnings
};
