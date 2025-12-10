const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const ipfsService = require("../services/ipfsService");
const blockchainService = require("../services/blockchainService");
const { ethers } = require("ethers");

/**
 * Controller for managing restaurants
 * @notice Manages all HTTP requests related to restaurants
 * @dev Handles registration, menu management, orders and analytics
 */

/**
 * Registers a new restaurant
 * @dev Registers restaurant with IPFS image uploads
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function registerRestaurant(req, res) {
  try {
    const { address, name, cuisine, description, email, phone, location, menu } = req.body;
    
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }
    
    // Vérifier que le restaurant n'existe pas déjà
    const existingRestaurant = await Restaurant.findByAddress(address.toLowerCase());
    if (existingRestaurant) {
      return res.status(409).json({
        error: "Conflict",
        message: "Restaurant already exists"
      });
    }
    
    // Upload des images du restaurant sur IPFS
    const images = [];
    if (req.files && req.files.images) {
      try {
        const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        for (const file of imageFiles) {
          const ipfsResult = await ipfsService.uploadImage(file.buffer, file.originalname);
          images.push(ipfsResult.ipfsHash);
        }
      } catch (ipfsError) {
        console.warn("Error uploading restaurant images to IPFS:", ipfsError);
      }
    }
    
    // Traiter le menu avec upload d'images
    const processedMenu = [];
    if (menu && Array.isArray(menu)) {
      for (let i = 0; i < menu.length; i++) {
        const menuItem = menu[i];
        let imageHash = menuItem.image || null;
        
        // Upload image de l'item menu si fournie
        const menuItemFileKey = `menuItem_${i}`;
        if (req.files && req.files[menuItemFileKey] && req.files[menuItemFileKey][0]) {
          try {
            const file = req.files[menuItemFileKey][0];
            const ipfsResult = await ipfsService.uploadImage(file.buffer, file.originalname);
            imageHash = ipfsResult.ipfsHash;
          } catch (ipfsError) {
            console.warn(`Error uploading menu item ${i} image to IPFS:`, ipfsError);
          }
        }
        
        processedMenu.push({
          name: menuItem.name,
          description: menuItem.description || "",
          price: menuItem.price,
          image: imageHash,
          category: menuItem.category || "",
          available: menuItem.available !== undefined ? menuItem.available : true
        });
      }
    }
    
    // Créer le restaurant
    const restaurant = new Restaurant({
      address: address.toLowerCase(),
      name,
      cuisine,
      description,
      email,
      phone,
      location: {
        address: location.address,
        lat: location.lat,
        lng: location.lng
      },
      images,
      menu: processedMenu,
      rating: 0,
      totalOrders: 0,
      isActive: true
    });
    
    await restaurant.save();
    
    return res.status(201).json({
      success: true,
      restaurant: {
        address: restaurant.address,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        location: restaurant.location,
        images: restaurant.images,
        menu: restaurant.menu
      }
    });
  } catch (error) {
    console.error("Error registering restaurant:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Conflict",
        message: "Restaurant address already registered"
      });
    }
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to register restaurant",
      details: error.message
    });
  }
}

/**
 * Gets restaurant details with menu
 * @dev Retrieves complete restaurant information
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getRestaurant(req, res) {
  try {
    const restaurantId = req.params.id;
    
    // Chercher par ID MongoDB ou par adresse
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      // C'est un ObjectId MongoDB
      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {
      // C'est une adresse Ethereum
      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid restaurant ID or address"
      });
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Convertir les hash IPFS en URLs complètes pour les images
    const imageUrls = restaurant.images.map(hash => ipfsService.getImage(hash));
    const menuWithUrls = restaurant.menu.map(item => ({
      ...item.toObject ? item.toObject() : item,
      imageUrl: item.image ? ipfsService.getImage(item.image) : null
    }));
    
    return res.status(200).json({
      success: true,
      restaurant: {
        address: restaurant.address,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        description: restaurant.description,
        email: restaurant.email,
        phone: restaurant.phone,
        location: restaurant.location,
        images: imageUrls,
        menu: menuWithUrls,
        rating: restaurant.rating,
        totalOrders: restaurant.totalOrders,
        isActive: restaurant.isActive,
        createdAt: restaurant.createdAt
      }
    });
  } catch (error) {
    console.error("Error getting restaurant:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get restaurant",
      details: error.message
    });
  }
}

/**
 * Gets all restaurants with filters
 * @dev Retrieves list of restaurants with optional filters
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getAllRestaurants(req, res) {
  try {
    const { cuisine, isActive, minRating, lat, lng, maxDistance } = req.query;
    
    // Construire la requête
    const query = {};
    if (cuisine) query.cuisine = cuisine;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Récupérer tous les restaurants
    let restaurants = await Restaurant.find(query);
    
    // Filtrer par note minimale
    if (minRating) {
      restaurants = restaurants.filter(r => r.rating >= parseFloat(minRating));
    }
    
    // Filtrer par distance si coordonnées fournies
    if (lat && lng && maxDistance) {
      const gpsTracker = require("../utils/gpsTracker");
      restaurants = restaurants.filter(restaurant => {
        const distance = gpsTracker.calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          restaurant.location.lat,
          restaurant.location.lng
        );
        return distance <= parseFloat(maxDistance);
      });
      
      // Trier par distance
      restaurants.sort((a, b) => {
        const distA = gpsTracker.calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          a.location.lat,
          a.location.lng
        );
        const distB = gpsTracker.calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          b.location.lat,
          b.location.lng
        );
        return distA - distB;
      });
    }
    
    // Convertir les hash IPFS en URLs
    const restaurantsWithUrls = restaurants.map(restaurant => ({
      _id: restaurant._id,
      address: restaurant.address,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      location: restaurant.location,
      images: restaurant.images.map(hash => ipfsService.getImage(hash)),
      rating: restaurant.rating,
      totalOrders: restaurant.totalOrders,
      isActive: restaurant.isActive
    }));
    
    return res.status(200).json({
      success: true,
      restaurants: restaurantsWithUrls,
      count: restaurantsWithUrls.length
    });
  } catch (error) {
    console.error("Error getting restaurants:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get restaurants",
      details: error.message
    });
  }
}

/**
 * Updates restaurant information
 * @dev Updates restaurant details and images
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function updateRestaurant(req, res) {
  try {
    const restaurantId = req.params.id;
    const restaurantAddress = req.userAddress;
    
    // Vérifier que le restaurant existe
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {
      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid restaurant ID or address"
      });
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    // Mettre à jour les champs
    const { name, cuisine, description, email, phone, location } = req.body;
    if (name) restaurant.name = name;
    if (cuisine) restaurant.cuisine = cuisine;
    if (description) restaurant.description = description;
    if (email) restaurant.email = email;
    if (phone) restaurant.phone = phone;
    if (location) {
      restaurant.location = {
        address: location.address,
        lat: location.lat,
        lng: location.lng
      };
    }
    
    // Upload nouvelles images si fournies
    if (req.files && req.files.images) {
      try {
        const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const newImages = [];
        for (const file of imageFiles) {
          const ipfsResult = await ipfsService.uploadImage(file.buffer, file.originalname);
          newImages.push(ipfsResult.ipfsHash);
        }
        restaurant.images = [...restaurant.images, ...newImages];
      } catch (ipfsError) {
        console.warn("Error uploading new images to IPFS:", ipfsError);
      }
    }
    
    await restaurant.save();
    
    return res.status(200).json({
      success: true,
      restaurant: {
        address: restaurant.address,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        location: restaurant.location,
        images: restaurant.images.map(hash => ipfsService.getImage(hash))
      }
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update restaurant",
      details: error.message
    });
  }
}

/**
 * Gets restaurant orders
 * @dev Retrieves all orders for a restaurant
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getRestaurantOrders(req, res) {
  try {
    const restaurantId = req.params.id;
    const restaurantAddress = req.userAddress;
    
    // Vérifier que le restaurant existe
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {
      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid restaurant ID or address"
      });
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const orders = await Order.getOrdersByRestaurant(restaurant._id, {
      limit,
      skip,
      status
    });
    
    const query = { restaurant: restaurant._id };
    if (status) query.status = status;
    const total = await Order.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      orders: orders.map(order => ({
        orderId: order.orderId,
        status: order.status,
        client: {
          name: order.client.name,
          address: order.client.address
        },
        deliverer: order.deliverer ? {
          name: order.deliverer.name,
          address: order.deliverer.address
        } : null,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error getting restaurant orders:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get restaurant orders",
      details: error.message
    });
  }
}

/**
 * Gets restaurant analytics
 * @dev Retrieves statistics and analytics for a restaurant
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getRestaurantAnalytics(req, res) {
  try {
    const restaurantId = req.params.id;
    const restaurantAddress = req.userAddress;
    
    // Vérifier que le restaurant existe
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {
      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid restaurant ID or address"
      });
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    // Calculer les statistiques
    const totalOrders = await Order.countDocuments({ restaurant: restaurant._id });
    const deliveredOrders = await Order.countDocuments({ 
      restaurant: restaurant._id, 
      status: 'DELIVERED' 
    });
    
    // Calculer le revenu total (depuis MongoDB)
    const orders = await Order.find({ 
      restaurant: restaurant._id, 
      status: 'DELIVERED' 
    });
    const totalRevenue = orders.reduce((sum, order) => {
      const foodPriceMATIC = parseFloat(order.foodPrice) / 1e18;
      return sum + foodPriceMATIC;
    }, 0);
    
    // Calculer la note moyenne (depuis les reviews si disponibles)
    // Pour l'instant, on utilise la note du restaurant
    const averageRating = restaurant.rating;
    
    return res.status(200).json({
      success: true,
      analytics: {
        totalOrders,
        deliveredOrders,
        pendingOrders: totalOrders - deliveredOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(4)),
        averageRating,
        rating: restaurant.rating,
        totalOrdersCount: restaurant.totalOrders
      }
    });
  } catch (error) {
    console.error("Error getting restaurant analytics:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get restaurant analytics",
      details: error.message
    });
  }
}

/**
 * Updates restaurant menu
 * @dev Updates menu with IPFS image uploads
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function updateMenu(req, res) {
  try {
    const restaurantId = req.params.id;
    const restaurantAddress = req.userAddress;
    
    // Vérifier que le restaurant existe
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {
      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid restaurant ID or address"
      });
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    const { menu } = req.body;
    
    if (!menu || !Array.isArray(menu)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "menu must be an array"
      });
    }
    
    // Traiter le menu avec upload d'images
    const processedMenu = [];
    for (let i = 0; i < menu.length; i++) {
      const menuItem = menu[i];
      let imageHash = menuItem.image || null;
      
      // Upload image de l'item menu si fournie
      const menuItemFileKey = `menuItem_${i}`;
      if (req.files && req.files[menuItemFileKey] && req.files[menuItemFileKey][0]) {
        try {
          const file = req.files[menuItemFileKey][0];
          const ipfsResult = await ipfsService.uploadImage(file.buffer, file.originalname);
          imageHash = ipfsResult.ipfsHash;
        } catch (ipfsError) {
          console.warn(`Error uploading menu item ${i} image to IPFS:`, ipfsError);
        }
      }
      
      processedMenu.push({
        name: menuItem.name,
        description: menuItem.description || "",
        price: menuItem.price,
        image: imageHash,
        category: menuItem.category || "",
        available: menuItem.available !== undefined ? menuItem.available : true
      });
    }
    
    // Mettre à jour le menu
    await Restaurant.updateMenu(restaurant._id, processedMenu);
    
    return res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      menu: processedMenu
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update menu",
      details: error.message
    });
  }
}

/**
 * Adds a new menu item
 * @dev Adds a single item to the menu
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function addMenuItem(req, res) {
  try {
    const restaurantId = req.params.id;
    const restaurantAddress = req.userAddress;
    
    // Vérifier que le restaurant existe
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {
      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid restaurant ID or address"
      });
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    const { name, description, price, category, available } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({
        error: "Bad Request",
        message: "name and price are required"
      });
    }
    
    // Upload image si fournie
    let imageHash = null;
    if (req.file) {
      try {
        const ipfsResult = await ipfsService.uploadImage(req.file.buffer, req.file.originalname);
        imageHash = ipfsResult.ipfsHash;
      } catch (ipfsError) {
        console.warn("Error uploading menu item image to IPFS:", ipfsError);
      }
    }
    
    // Ajouter l'item au menu
    restaurant.menu.push({
      name,
      description: description || "",
      price: parseFloat(price),
      image: imageHash,
      category: category || "",
      available: available !== undefined ? available : true
    });
    
    await restaurant.save();
    
    return res.status(201).json({
      success: true,
      menuItem: {
        name,
        description,
        price: parseFloat(price),
        image: imageHash,
        category,
        available
      }
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
 * Updates a menu item
 * @dev Updates an existing menu item
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function updateMenuItem(req, res) {
  try {
    const restaurantId = req.params.id;
    const itemId = req.params.itemId;
    const restaurantAddress = req.userAddress;
    
    // Vérifier que le restaurant existe
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {
      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid restaurant ID or address"
      });
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    // Trouver l'item dans le menu
    const itemIndex = parseInt(itemId);
    if (itemIndex < 0 || itemIndex >= restaurant.menu.length) {
      return res.status(404).json({
        error: "Not Found",
        message: "Menu item not found"
      });
    }
    
    const menuItem = restaurant.menu[itemIndex];
    
    // Mettre à jour les champs
    const { name, description, price, category, available } = req.body;
    if (name) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price) menuItem.price = parseFloat(price);
    if (category !== undefined) menuItem.category = category;
    if (available !== undefined) menuItem.available = available;
    
    // Upload nouvelle image si fournie
    if (req.file) {
      try {
        const ipfsResult = await ipfsService.uploadImage(req.file.buffer, req.file.originalname);
        menuItem.image = ipfsResult.ipfsHash;
      } catch (ipfsError) {
        console.warn("Error uploading menu item image to IPFS:", ipfsError);
      }
    }
    
    await restaurant.save();
    
    return res.status(200).json({
      success: true,
      menuItem: {
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        image: menuItem.image,
        category: menuItem.category,
        available: menuItem.available
      }
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
 * Deletes a menu item
 * @dev Removes an item from the menu
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function deleteMenuItem(req, res) {
  try {
    const restaurantId = req.params.id;
    const itemId = req.params.itemId;
    const restaurantAddress = req.userAddress;
    
    // Vérifier que le restaurant existe
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {
      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid restaurant ID or address"
      });
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    // Trouver et supprimer l'item
    const itemIndex = parseInt(itemId);
    if (itemIndex < 0 || itemIndex >= restaurant.menu.length) {
      return res.status(404).json({
        error: "Not Found",
        message: "Menu item not found"
      });
    }
    
    restaurant.menu.splice(itemIndex, 1);
    await restaurant.save();
    
    return res.status(200).json({
      success: true,
      message: "Menu item deleted successfully"
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
 * Gets restaurant earnings from blockchain
 * @dev Retrieves on-chain earnings for a restaurant
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getRestaurantEarnings(req, res) {
  try {
    const restaurantId = req.params.id;
    const restaurantAddress = req.userAddress;
    
    // Vérifier que le restaurant existe
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {
      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid restaurant ID or address"
      });
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    // Récupérer le solde en attente depuis PaymentSplitter
    try {
      const pendingBalance = await blockchainService.getPendingBalance(restaurant.address);
      const pendingBalanceMATIC = parseFloat(ethers.formatEther(pendingBalance));
      
      return res.status(200).json({
        success: true,
        earnings: {
          pendingBalance: pendingBalanceMATIC,
          pendingBalanceWei: pendingBalance
        }
      });
    } catch (blockchainError) {
      console.warn("Error getting earnings from blockchain:", blockchainError);
      return res.status(200).json({
        success: true,
        earnings: {
          pendingBalance: 0,
          message: "Blockchain not available, using MongoDB data only"
        }
      });
    }
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
 * Withdraws restaurant earnings
 * @dev Withdraws funds from PaymentSplitter
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function withdrawEarnings(req, res) {
  try {
    const restaurantId = req.params.id;
    const restaurantAddress = req.userAddress;
    
    // Vérifier que le restaurant existe
    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {
      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid restaurant ID or address"
      });
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found"
      });
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    // Retirer les fonds depuis PaymentSplitter
    try {
      const result = await blockchainService.withdraw(
        restaurant.address,
        req.body.restaurantPrivateKey || process.env.PRIVATE_KEY
      );
      
      return res.status(200).json({
        success: true,
        txHash: result.txHash,
        amount: result.amount,
        amountMATIC: parseFloat(ethers.formatEther(result.amount))
      });
    } catch (blockchainError) {
      console.error("Error withdrawing earnings from blockchain:", blockchainError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to withdraw earnings from blockchain",
        details: blockchainError.message
      });
    }
  } catch (error) {
    console.error("Error withdrawing earnings:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to withdraw earnings",
      details: error.message
    });
  }
}

/**
 * Get restaurant by wallet address
 * @route GET /api/restaurants/by-address/:address
 */
async function getRestaurantByAddress(req, res) {
  try {
    const { address } = req.params;

    // Validate Ethereum address
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }

    // Find restaurant by address
    const restaurant = await Restaurant.findByAddress(address.toLowerCase());

    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found with this address"
      });
    }

    return res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error getting restaurant by address:", error);

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get restaurant",
      details: error.message
    });
  }
}

module.exports = {
  registerRestaurant,
  getRestaurant,
  getRestaurantByAddress,
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

