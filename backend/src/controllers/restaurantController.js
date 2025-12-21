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
    }    const existingRestaurant = await Restaurant.findByAddress(address.toLowerCase());
    if (existingRestaurant) {
      return res.status(409).json({
        error: "Conflict",
        message: "Restaurant already exists"
      });
    }    const images = [];
    if (req.files && req.files.images) {
      try {
        const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        for (const file of imageFiles) {
          const ipfsResult = await ipfsService.uploadImage(file.buffer, file.originalname);
          images.push(ipfsResult.ipfsHash);
        }
      } catch (ipfsError) {
        
      }
    }    const processedMenu = [];
    if (menu && Array.isArray(menu)) {
      for (let i = 0; i < menu.length; i++) {
        const menuItem = menu[i];
        let imageHash = menuItem.image || null;        const menuItemFileKey = `menuItem_${i}`;
        if (req.files && req.files[menuItemFileKey] && req.files[menuItemFileKey][0]) {
          try {
            const file = req.files[menuItemFileKey][0];
            const ipfsResult = await ipfsService.uploadImage(file.buffer, file.originalname);
            imageHash = ipfsResult.ipfsHash;
          } catch (ipfsError) {
            
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
    }    const restaurant = new Restaurant({
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
        _id: restaurant._id,
        address: restaurant.address,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        description: restaurant.description,
        email: restaurant.email,
        phone: restaurant.phone,
        location: restaurant.location,
        images: restaurant.images,
        menu: restaurant.menu,
        rating: restaurant.rating,
        totalOrders: restaurant.totalOrders,
        isActive: restaurant.isActive
      }
    });
  } catch (error) {
    
    
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
    const restaurantId = req.params.id;    let restaurant;
    if (restaurantId.match(/^[0-9a-fA-F]{24}$/)) {      restaurant = await Restaurant.findById(restaurantId);
    } else if (ethers.isAddress(restaurantId)) {      restaurant = await Restaurant.findByAddress(restaurantId.toLowerCase());
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
    }    const imageUrls = restaurant.images.map(hash => ipfsService.getImage(hash));
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
    const { cuisine, isActive, minRating, lat, lng, maxDistance } = req.query;    const query = {};
    if (cuisine) query.cuisine = cuisine;
    if (isActive !== undefined) query.isActive = isActive === 'true';    let restaurants = await Restaurant.find(query);    if (minRating) {
      restaurants = restaurants.filter(r => r.rating >= parseFloat(minRating));
    }    if (lat && lng && maxDistance) {
      const gpsTracker = require("../utils/gpsTracker");
      restaurants = restaurants.filter(restaurant => {
        const distance = gpsTracker.calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          restaurant.location.lat,
          restaurant.location.lng
        );
        return distance <= parseFloat(maxDistance);
      });      restaurants.sort((a, b) => {
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
    }    const restaurantsWithUrls = restaurants.map(restaurant => ({
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
    const restaurantAddress = req.userAddress;    let restaurant;
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
    }    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }    const { name, cuisine, description, email, phone, location } = req.body;
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
    }    if (req.files && req.files.images) {
      try {
        const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const newImages = [];
        for (const file of imageFiles) {
          const ipfsResult = await ipfsService.uploadImage(file.buffer, file.originalname);
          newImages.push(ipfsResult.ipfsHash);
        }
        restaurant.images = [...restaurant.images, ...newImages];
      } catch (ipfsError) {
        
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
    const restaurantAddress = req.userAddress;    let restaurant;
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
    }    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    const { status, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;    const query = { restaurant: restaurant._id };
    if (status && status !== 'all') query.status = status;    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      query.$or = [
        { createdAt: dateFilter },
        { updatedAt: dateFilter }
      ];
    }

    const orders = await Order.find(query)
      .populate('client', 'name address')
      .populate('deliverer', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
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
    const restaurantAddress = req.userAddress;    let restaurant;
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
    }    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }    const totalOrders = await Order.countDocuments({ restaurant: restaurant._id });
    const deliveredOrders = await Order.countDocuments({ 
      restaurant: restaurant._id, 
      status: 'DELIVERED' 
    });    const orders = await Order.find({ 
      restaurant: restaurant._id, 
      status: 'DELIVERED' 
    });
    const totalRevenue = orders.reduce((sum, order) => {
      const foodPriceMATIC = parseFloat(order.foodPrice) / 1e18;
      return sum + foodPriceMATIC;
    }, 0);    const averageRating = restaurant.rating;
    
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
    const restaurantAddress = req.userAddress;    let restaurant;
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
    }    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
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
    }    const processedMenu = [];
    for (let i = 0; i < menu.length; i++) {
      const menuItem = menu[i];
      let imageHash = menuItem.image || null;      const menuItemFileKey = `menuItem_${i}`;
      if (req.files && req.files[menuItemFileKey] && req.files[menuItemFileKey][0]) {
        try {
          const file = req.files[menuItemFileKey][0];
          const ipfsResult = await ipfsService.uploadImage(file.buffer, file.originalname);
          imageHash = ipfsResult.ipfsHash;
        } catch (ipfsError) {
          
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
    }    await Restaurant.updateMenu(restaurant._id, processedMenu);
    
    return res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      menu: processedMenu
    });
  } catch (error) {
    
    
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
    const restaurantAddress = req.userAddress;    let restaurant;
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
    }    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }
    
    const { name, description, price, category, available, image } = req.body;

    

    if (!name || !price) {
      return res.status(400).json({
        error: "Bad Request",
        message: "name and price are required"
      });
    }    let imageHash = image || null;
    if (req.file) {
      try {
        const ipfsResult = await ipfsService.uploadImage(req.file.buffer, req.file.originalname);
        imageHash = ipfsResult.ipfsHash;
        
      } catch (ipfsError) {
        
      }
    }    const newItem = {
      name,
      description: description || "",
      price: parseFloat(price),
      image: imageHash,
      category: category || "",
      available: available !== undefined ? available : true
    };    restaurant.menu.push(newItem);

    await restaurant.save();    const savedItem = restaurant.menu[restaurant.menu.length - 1];

    return res.status(201).json({
      success: true,
      menuItem: savedItem
    });
  } catch (error) {
    
    
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
    const restaurantAddress = req.userAddress;    let restaurant;
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
    }    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }    let menuItem;
    let itemIndex;    itemIndex = restaurant.menu.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {      const numIndex = parseInt(itemId);
      if (!isNaN(numIndex) && numIndex >= 0 && numIndex < restaurant.menu.length) {
        itemIndex = numIndex;
      }
    }

    if (itemIndex === -1) {
      return res.status(404).json({
        error: "Not Found",
        message: "Menu item not found"
      });
    }

    menuItem = restaurant.menu[itemIndex];    const { name, description, price, category, available, image } = req.body;
    if (name) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price) menuItem.price = parseFloat(price);
    if (category !== undefined) menuItem.category = category;
    if (available !== undefined) menuItem.available = available;
    if (image !== undefined) menuItem.image = image;    if (req.file) {
      try {
        const ipfsResult = await ipfsService.uploadImage(req.file.buffer, req.file.originalname);
        menuItem.image = ipfsResult.ipfsHash;
      } catch (ipfsError) {
        
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
    const restaurantAddress = req.userAddress;    let restaurant;
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
    }    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }    let itemIndex = restaurant.menu.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {      const numIndex = parseInt(itemId);
      if (!isNaN(numIndex) && numIndex >= 0 && numIndex < restaurant.menu.length) {
        itemIndex = numIndex;
      }
    }

    if (itemIndex === -1) {
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
    
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete menu item",
      details: error.message
    });
  }
}

/**
 * Helper: Get start of week (Monday) for a date
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Helper: Format date label for chart
 */
function formatDateLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
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
    const restaurantAddress = req.userAddress;    let restaurant;
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
    }    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }    const { period = 'week' } = req.query;    const now = new Date();
    let startDate = new Date();
    
    if (period === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
    }    const deliveredOrders = await Order.find({
      restaurant: restaurant._id,
      status: 'DELIVERED',
      $or: [
        { completedAt: { $gte: startDate, $lte: now } },
        { completedAt: null, updatedAt: { $gte: startDate, $lte: now } }
      ]
    }).sort({ completedAt: 1, updatedAt: 1 });    const dailyEarnings = {};
    const weeklyEarnings = {};

    deliveredOrders.forEach(order => {      const orderDate = new Date(order.completedAt || order.updatedAt);
      const dayKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD      const totalAmountRaw = order.totalAmount || 0;      let totalAmountMATIC = 0;
      try {        const amountStr = typeof totalAmountRaw === 'string' 
          ? totalAmountRaw 
          : totalAmountRaw.toString();        const amountNum = parseFloat(amountStr);
        if (amountNum > 0 && amountNum < 1e15) {          totalAmountMATIC = amountNum;
        } else {          const totalAmountBN = ethers.BigNumber.from(amountStr);
          totalAmountMATIC = parseFloat(ethers.formatEther(totalAmountBN));
        }
      } catch (e) {        const amountNum = parseFloat(totalAmountRaw);
        totalAmountMATIC = amountNum >= 1e15 ? amountNum / 1e18 : amountNum;
      }
      
      const restaurantRevenue = totalAmountMATIC * 0.8; // 80% pour le restaurant      if (!dailyEarnings[dayKey]) {
        dailyEarnings[dayKey] = { date: dayKey, amount: 0 };
      }
      dailyEarnings[dayKey].amount += restaurantRevenue;      const weekStart = getWeekStart(orderDate);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyEarnings[weekKey]) {
        weeklyEarnings[weekKey] = { date: weekKey, amount: 0 };
      }
      weeklyEarnings[weekKey].amount += restaurantRevenue;
    });    const daily = Object.values(dailyEarnings)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        date: item.date,
        label: formatDateLabel(item.date),
        amount: parseFloat(item.amount.toFixed(5))
      }));
    
    const weekly = Object.values(weeklyEarnings)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        date: item.date,
        label: formatDateLabel(item.date),
        amount: parseFloat(item.amount.toFixed(5))
      }));    const totalWithdrawn = deliveredOrders.reduce((sum, order) => {
      const totalAmountRaw = order.totalAmount || 0;
      
      let totalAmountMATIC;
      try {
        const totalAmountBN = ethers.BigNumber.from(totalAmountRaw.toString());
        totalAmountMATIC = parseFloat(ethers.formatEther(totalAmountBN));
      } catch (e) {
        totalAmountMATIC = parseFloat(totalAmountRaw) / 1e18;
      }
      
      return sum + (totalAmountMATIC * 0.8);
    }, 0);    const totalWithdrawnFormatted = parseFloat(totalWithdrawn.toFixed(5));    const transactions = deliveredOrders.map(order => {
      const totalAmountRaw = order.totalAmount || 0;
      
      let totalAmountMATIC;
      try {
        const totalAmountBN = ethers.BigNumber.from(totalAmountRaw.toString());
        totalAmountMATIC = parseFloat(ethers.formatEther(totalAmountBN));
      } catch (e) {
        totalAmountMATIC = parseFloat(totalAmountRaw) / 1e18;
      }
      
      return {
        orderId: order.orderId,
        date: order.completedAt,
        amount: parseFloat((totalAmountMATIC * 0.8).toFixed(4)),
        txHash: order.txHash || null
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));    let pendingBalanceMATIC = 0;
    try {
      const pendingBalance = await blockchainService.getPendingBalance(restaurant.address);
      pendingBalanceMATIC = parseFloat(ethers.formatEther(pendingBalance));
    } catch (blockchainError) {
      
    }
    
    return res.status(200).json({
      success: true,
      earnings: {
        pending: parseFloat(pendingBalanceMATIC.toFixed(5)),
        pendingBalance: parseFloat(pendingBalanceMATIC.toFixed(5)),
        daily,
        weekly,
        withdrawn: totalWithdrawnFormatted,
        transactions: transactions.slice(0, 50) // Limiter à 50 dernières transactions
      }
    });
  } catch (error) {
    
    
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
    const restaurantAddress = req.userAddress;    let restaurant;
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
    }    if (restaurant.address.toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this restaurant"
      });
    }    try {
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
      
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to withdraw earnings from blockchain",
        details: blockchainError.message
      });
    }
  } catch (error) {
    
    
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
    const { address } = req.params;    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }    const restaurant = await Restaurant.findByAddress(address.toLowerCase());

    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found with this address"
      });
    }

    return res.status(200).json(restaurant);
  } catch (error) {
    

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

