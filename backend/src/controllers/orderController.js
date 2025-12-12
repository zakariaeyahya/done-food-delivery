const Order = require("../models/Order");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");
const blockchainService = require("../services/blockchainService");
const ipfsService = require("../services/ipfsService");
const notificationService = require("../services/notificationService");
const { ethers } = require("ethers");

/**
 * Controller for managing orders
 * @notice Manages all HTTP requests related to orders
 * @dev Handles order lifecycle from creation to delivery
 */

/**
 * Creates a new order
 * @dev Creates order on-chain and saves off-chain data to MongoDB
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function createOrder(req, res) {
  try {
    const { restaurantId, items, deliveryAddress, clientAddress, clientPrivateKey } = req.body;
    
    // Récupérer l'adresse du client depuis le middleware auth
    const userAddress = req.userAddress || clientAddress;
    
    if (!userAddress) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Client address is required"
      });
    }
    
    // Vérifier que le client existe
    const client = await User.findByAddress(userAddress);
    if (!client) {
      return res.status(404).json({
        error: "Not Found",
        message: "Client not found. Please register first."
      });
    }
    
    // Vérifier que le restaurant existe
    let restaurant;
    if (restaurantId) {
      restaurant = await Restaurant.findById(restaurantId);
    }
    
    // Si restaurantId n'est pas fourni ou restaurant non trouvé, essayer de trouver par restaurantAddress
    if (!restaurant && req.body.restaurantAddress) {
      restaurant = await Restaurant.findByAddress(req.body.restaurantAddress);
    }
    
    if (!restaurant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found. Please provide a valid restaurantId or restaurantAddress."
      });
    }
    
    // Utiliser l'ID du restaurant trouvé
    const finalRestaurantId = restaurant._id;
    
    // Calculer les prix
    let foodPrice = 0;
    items.forEach(item => {
      foodPrice += item.price * item.quantity;
    });
    
    // Calculer deliveryFee (peut être passé dans body ou calculé)
    const deliveryFee = req.body.deliveryFee || 0.01; // 0.01 MATIC par défaut
    
    // Préparer les données pour IPFS
    const orderData = {
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || null
      })),
      deliveryAddress,
      restaurant: {
        address: restaurant.address,
        name: restaurant.name
      },
      client: {
        address: userAddress,
        name: client.name || 'Client'
      },
      createdAt: new Date().toISOString()
    };
    
    // Upload des données sur IPFS
    let ipfsHash;
    try {
      const ipfsResult = await ipfsService.uploadJSON(orderData);
      ipfsHash = ipfsResult.ipfsHash;
    } catch (ipfsError) {
      console.error("Error uploading to IPFS:", ipfsError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to upload order data to IPFS",
        details: ipfsError.message
      });
    }
    
    // Créer la commande sur la blockchain
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.createOrder({
        restaurantAddress: restaurant.address,
        foodPrice: foodPrice.toString(),
        deliveryFee: deliveryFee.toString(),
        ipfsHash,
        clientAddress: userAddress,
        clientPrivateKey: clientPrivateKey || process.env.PRIVATE_KEY // Fallback pour tests
      });
    } catch (blockchainError) {
      console.error("Error creating order on blockchain:", blockchainError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to create order on blockchain",
        details: blockchainError.message
      });
    }
    
    // Calculer platformFee et totalAmount
    const foodPriceWei = ethers.parseEther(foodPrice.toString());
    const deliveryFeeWei = ethers.parseEther(deliveryFee.toString());
    const platformFeeWei = (foodPriceWei * BigInt(10)) / BigInt(100);
    const totalAmountWei = foodPriceWei + deliveryFeeWei + platformFeeWei;
    
    // Vérifier si la commande existe déjà (cas de duplication)
    let order = await Order.findOne({ orderId: blockchainResult.orderId });
    
    if (order) {
      // La commande existe déjà, vérifier si c'est la même commande
      console.warn(`Order ${blockchainResult.orderId} already exists in database. Checking if it's the same order...`);
      
      // Si c'est la même transaction hash, retourner la commande existante
      if (order.txHash === blockchainResult.txHash) {
        console.log(`Order ${blockchainResult.orderId} already exists with same txHash. Returning existing order.`);
        return res.status(200).json({
          success: true,
          order: {
            orderId: order.orderId,
            txHash: order.txHash,
            status: order.status,
            totalAmount: order.totalAmount.toString()
          },
          message: "Order already exists"
        });
      } else {
        // Transaction hash différente, c'est un problème
        return res.status(409).json({
          error: "Conflict",
          message: `Order ID ${blockchainResult.orderId} already exists with a different transaction hash`,
          details: "This orderId is already in use. Please try again."
        });
      }
    }
    
    // Créer une nouvelle commande
    order = new Order({
      orderId: blockchainResult.orderId,
      txHash: blockchainResult.txHash,
      client: client._id,
      restaurant: finalRestaurantId,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || null
      })),
      deliveryAddress,
      ipfsHash,
      status: 'CREATED',
      foodPrice: foodPriceWei.toString(),
      deliveryFee: deliveryFeeWei.toString(),
      platformFee: platformFeeWei.toString(),
      totalAmount: totalAmountWei.toString()
    });
    
    try {
      await order.save();
    } catch (saveError) {
      // Gérer l'erreur de duplication de manière plus gracieuse
      if (saveError.code === 11000) {
        // Erreur de clé dupliquée
        console.error(`Duplicate key error for orderId ${blockchainResult.orderId}:`, saveError);
        
        // Essayer de récupérer la commande existante
        const existingOrder = await Order.findOne({ orderId: blockchainResult.orderId });
        if (existingOrder) {
          return res.status(200).json({
            success: true,
            order: {
              orderId: existingOrder.orderId,
              txHash: existingOrder.txHash,
              status: existingOrder.status,
              totalAmount: existingOrder.totalAmount.toString()
            },
            message: "Order already exists"
          });
        }
        
        return res.status(409).json({
          error: "Conflict",
          message: `Order ID ${blockchainResult.orderId} already exists`,
          details: "This orderId is already in use. Please try again."
        });
      }
      throw saveError; // Re-lancer l'erreur si ce n'est pas une duplication
    }
    
    // Notifier le restaurant
    try {
      await notificationService.notifyOrderCreated(
        blockchainResult.orderId,
        restaurant._id.toString(),
        { items, totalAmount: totalAmountWei.toString() }
      );
    } catch (notifError) {
      console.warn("Error sending notification:", notifError);
    }
    
    return res.status(201).json({
      success: true,
      order: {
        orderId: blockchainResult.orderId,
        txHash: blockchainResult.txHash,
        status: 'CREATED',
        totalAmount: totalAmountWei.toString()
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    console.error("Error stack:", error.stack);
    console.error("Request body:", req.body);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create order",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Gets order details (on-chain + off-chain)
 * @dev Retrieves complete order information from blockchain and MongoDB
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getOrder(req, res) {
  try {
    const orderId = req.orderId || parseInt(req.params.id);
    
    // Récupérer depuis MongoDB avec populate
    const order = await Order.findOne({ orderId })
      .populate('client', 'address name email')
      .populate('restaurant', 'address name')
      .populate('deliverer', 'address name');
    
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    
    // Récupérer depuis blockchain (si disponible) - avant les vérifications pour éviter les erreurs
    let blockchainOrder = null;
    try {
      blockchainOrder = await blockchainService.getOrder(orderId);
    } catch (blockchainError) {
      // Erreur non-critique, continuer sans données blockchain
      console.warn("Could not fetch order from blockchain:", blockchainError.message);
    }
    
    // Gérer les cas où client/restaurant peuvent être des strings (adresses) ou des objets peuplés
    const orderClientAddress = order.client?.address || (typeof order.client === 'string' ? order.client : null);
    const orderRestaurantAddress = order.restaurant?.address || (typeof order.restaurant === 'string' ? order.restaurant : null);
    
    // Si les adresses sont manquantes, essayer de les récupérer depuis la blockchain
    if (!orderClientAddress || !orderRestaurantAddress) {
      if (blockchainOrder) {
        // Utiliser les données blockchain comme fallback
        if (!orderClientAddress && blockchainOrder.client) {
          order.client = { address: blockchainOrder.client, name: 'Unknown' };
        }
        if (!orderRestaurantAddress && blockchainOrder.restaurant) {
          order.restaurant = { address: blockchainOrder.restaurant, name: 'Unknown' };
        }
      } else {
        // Si ni MongoDB ni blockchain n'ont les données, retourner une erreur
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Order data is incomplete. Client or restaurant information missing."
        });
      }
    }
    
    // Récupérer les détails IPFS (seulement si hash valide)
    let ipfsData = null;
    if (order.ipfsHash) {
      try {
        // La validation est faite dans ipfsService.getJSON
        ipfsData = await ipfsService.getJSON(order.ipfsHash);
      } catch (ipfsError) {
        // Ne logger que si ce n'est pas un hash invalide (hash de test, etc.)
        if (!ipfsError.message || !ipfsError.message.includes('Invalid IPFS')) {
          console.warn("Could not fetch IPFS data:", ipfsError.message);
        }
        // Hash invalide ou erreur de récupération, continuer sans données IPFS
        ipfsData = null;
      }
    }
    
    return res.status(200).json({
      success: true,
      order: {
        orderId: order.orderId,
        txHash: order.txHash,
        status: order.status,
        client: order.client ? {
          address: order.client.address || 'Unknown',
          name: order.client.name || 'Unknown'
        } : null,
        restaurant: order.restaurant ? {
          address: order.restaurant.address || 'Unknown',
          name: order.restaurant.name || 'Unknown'
        } : null,
        deliverer: order.deliverer ? {
          address: order.deliverer.address || order.deliverer,
          name: order.deliverer.name || 'Unknown'
        } : null,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        foodPrice: order.foodPrice,
        deliveryFee: order.deliveryFee,
        platformFee: order.platformFee,
        totalAmount: order.totalAmount,
        gpsTracking: order.gpsTracking,
        blockchain: blockchainOrder,
        ipfsData,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      }
    });
  } catch (error) {
    console.error("Error getting order:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get order",
      details: error.message
    });
  }
}

/**
 * Gets orders by client address
 * @dev Retrieves all orders for a specific client
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getOrdersByClient(req, res) {
  try {
    const address = req.validatedAddress || req.params.address;
    
    const client = await User.findByAddress(address);
    if (!client) {
      return res.status(404).json({
        error: "Not Found",
        message: "Client not found"
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    
    const orders = await Order.getOrdersByClient(client._id, {
      limit,
      skip,
      status
    });
    
    const query = { client: client._id };
    if (status) query.status = status;
    const total = await Order.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      orders: orders.map(order => ({
        orderId: order.orderId,
        status: order.status,
        restaurant: order.restaurant ? {
          name: order.restaurant.name || 'Unknown',
          address: order.restaurant.address || order.restaurant
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
    console.error("Error getting client orders:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get client orders",
      details: error.message
    });
  }
}

/**
 * Confirms order preparation (restaurant)
 * @dev Restaurant confirms that order is ready
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function confirmPreparation(req, res) {
  try {
    const orderId = req.orderId || parseInt(req.params.id);
    const restaurantAddress = req.userAddress;
    
    // Vérifier que la commande existe
    const order = await Order.findOne({ orderId })
      .populate('restaurant', 'address name');
    
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    
    // Vérifier que les relations sont peuplées
    const orderRestaurantAddress = order.restaurant?.address || order.restaurant;
    if (!orderRestaurantAddress) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Order data is incomplete. Restaurant information missing."
      });
    }
    
    // Vérifier que le restaurant est le propriétaire
    if (!orderRestaurantAddress || orderRestaurantAddress.toString().toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this order"
      });
    }
    
    // Vérifier le statut
    if (order.status !== 'CREATED') {
      return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be CREATED, current status: ${order.status}`
      });
    }
    
    // Confirmer sur la blockchain
    let blockchainResult;
    try {
      const restaurant = await Restaurant.findByAddress(restaurantAddress);
      // En mode développement, on peut ne pas avoir de clé privée
      const privateKey = req.body.restaurantPrivateKey || process.env.PRIVATE_KEY || null;
      
      blockchainResult = await blockchainService.confirmPreparation(
        orderId,
        restaurantAddress,
        privateKey
      );
    } catch (blockchainError) {
      console.error("Error confirming preparation on blockchain:", blockchainError);
      console.error("Stack trace:", blockchainError.stack);
      
      // En mode développement, continuer même si la blockchain échoue
      if (process.env.NODE_ENV === 'development' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true') {
        console.warn('⚠️  Blockchain error in dev mode, continuing with mock data');
        blockchainResult = {
          txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000
        };
      } else {
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to confirm preparation on blockchain",
          details: blockchainError.message
        });
      }
    }
    
    // Mettre à jour dans MongoDB
    await Order.updateStatus(orderId, 'PREPARING');
    
    // Récupérer la commande mise à jour avec toutes les relations
    const updatedOrder = await Order.findOne({ orderId })
      .populate('restaurant', 'address name location')
      .populate('client', 'address');
    
    // Notifier le client
    try {
      const clientAddr = order.client?.address || order.client;
      await notificationService.notifyClientOrderUpdate(
        orderId,
        clientAddr,
        'PREPARING',
        { message: "Your order is being prepared" }
      );
    } catch (notifError) {
      console.warn("Error sending notification to client:", notifError);
    }
    
    // Notifier les livreurs disponibles qu'une nouvelle commande est prête
    try {
      // Préparer les données de la commande pour les livreurs
      const orderData = {
        orderId: updatedOrder.orderId,
        restaurant: {
          name: updatedOrder.restaurant?.name || 'Restaurant',
          address: updatedOrder.restaurant?.address || order.restaurant,
          location: updatedOrder.restaurant?.location || null
        },
        totalAmount: updatedOrder.totalAmount,
        deliveryAddress: updatedOrder.deliveryAddress,
        items: updatedOrder.items
      };
      
      // Récupérer tous les livreurs disponibles et stakés pour les notifications ciblées
      const availableDeliverers = await Deliverer.find({ 
        isAvailable: true,
        isStaked: true 
      }).select('address name isAvailable isStaked');
      
      console.log(`[Backend] 📋 Recherche livreurs disponibles pour commande #${orderId}:`);
      console.log(`[Backend]   - Total livreurs en DB: ${await Deliverer.countDocuments()}`);
      console.log(`[Backend]   - Livreurs disponibles (isAvailable=true): ${await Deliverer.countDocuments({ isAvailable: true })}`);
      console.log(`[Backend]   - Livreurs stakés (isStaked=true): ${await Deliverer.countDocuments({ isStaked: true })}`);
      console.log(`[Backend]   - Livreurs disponibles ET stakés: ${availableDeliverers.length}`);
      
      if (availableDeliverers.length > 0) {
        console.log(`[Backend]   - Livreurs trouvés:`, availableDeliverers.map(d => ({
          address: d.address,
          name: d.name,
          isAvailable: d.isAvailable,
          isStaked: d.isStaked
        })));
      } else {
        console.log(`[Backend]   ⚠️ Aucun livreur disponible ET staké trouvé dans la DB`);
        console.log(`[Backend]   💡 Vérifiez que le livreur est:`);
        console.log(`[Backend]      1. Enregistré dans la base de données`);
        console.log(`[Backend]      2. Disponible (isAvailable: true) - via updateStatus`);
        console.log(`[Backend]      3. Staké (isStaked: true) - synchronisé depuis la blockchain via getDeliverer`);
      }
      
      const delivererAddresses = availableDeliverers && availableDeliverers.length > 0 
        ? availableDeliverers.map(d => d.address)
        : [];
      
      // Toujours notifier via Socket.io (même si aucun livreur n'est marqué disponible)
      // Car un livreur peut être connecté mais pas encore marqué comme disponible dans la DB
      console.log(`[Backend] 📢 Envoi notification Socket.io pour commande #${orderId} (${delivererAddresses.length} livreur(s) ciblé(s))`);
      await notificationService.notifyDeliverersAvailable(
        orderId,
        delivererAddresses,
        orderData
      );
      console.log(`[Backend] ✅ Notification envoyée pour commande #${orderId}`);
    } catch (notifError) {
      console.error("Error notifying deliverers:", notifError);
      console.error("Stack trace:", notifError.stack);
      // Ne pas faire échouer la requête si la notification échoue
    }
    
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      status: 'PREPARING'
    });
  } catch (error) {
    console.error("Error confirming preparation:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to confirm preparation",
      details: error.message
    });
  }
}

/**
 * Assigns a deliverer to an order
 * @dev Platform assigns a deliverer to pick up the order
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function assignDeliverer(req, res) {
  try {
    const orderId = req.orderId || parseInt(req.params.id);
    const { delivererAddress } = req.body;
    
    if (!delivererAddress) {
      return res.status(400).json({
        error: "Bad Request",
        message: "delivererAddress is required"
      });
    }
    
    // Vérifier que la commande existe
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    
    // Vérifier le statut
    if (order.status !== 'PREPARING') {
      return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be PREPARING, current status: ${order.status}`
      });
    }
    
    // Vérifier que le livreur existe et est disponible
    const deliverer = await Deliverer.findByAddress(delivererAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    if (!deliverer.isAvailable || !deliverer.isStaked) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Deliverer is not available or not staked"
      });
    }
    
    // Assigner sur la blockchain
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.assignDeliverer(
        orderId,
        delivererAddress,
        process.env.PRIVATE_KEY // Platform private key
      );
    } catch (blockchainError) {
      console.error("Error assigning deliverer on blockchain:", blockchainError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to assign deliverer on blockchain",
        details: blockchainError.message
      });
    }
    
    // Mettre à jour dans MongoDB
    order.deliverer = deliverer._id;
    order.status = 'IN_DELIVERY';
    await order.save();
    
    // Notifier le livreur
    try {
      await notificationService.notifyDeliverersAvailable(
        orderId,
        [delivererAddress],
        { restaurant: order.restaurant.name, deliveryAddress: order.deliveryAddress }
      );
    } catch (notifError) {
      console.warn("Error sending notification:", notifError);
    }
    
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      deliverer: {
        address: deliverer.address,
        name: deliverer.name
      },
      status: 'IN_DELIVERY'
    });
  } catch (error) {
    console.error("Error assigning deliverer:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to assign deliverer",
      details: error.message
    });
  }
}

/**
 * Confirms order pickup (deliverer)
 * @dev Deliverer confirms they picked up the order
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function confirmPickup(req, res) {
  try {
    const orderId = req.orderId || parseInt(req.params.id);
    const delivererAddress = req.userAddress;
    
    // Vérifier que la commande existe
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    
    // Vérifier que le livreur est assigné
    const orderDelivererAddress = order.deliverer?.address || order.deliverer;
    if (!orderDelivererAddress || orderDelivererAddress.toString().toLowerCase() !== delivererAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not assigned to this order"
      });
    }
    
    // Vérifier le statut
    if (order.status !== 'IN_DELIVERY') {
      return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be IN_DELIVERY, current status: ${order.status}`
      });
    }
    
    // Confirmer sur la blockchain
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.confirmPickup(
        orderId,
        delivererAddress,
        req.body.delivererPrivateKey || process.env.PRIVATE_KEY
      );
    } catch (blockchainError) {
      console.error("Error confirming pickup on blockchain:", blockchainError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to confirm pickup on blockchain",
        details: blockchainError.message
      });
    }
    
    // Mettre à jour dans MongoDB (statut reste IN_DELIVERY mais pickup confirmé)
    // Le statut reste IN_DELIVERY jusqu'à la livraison
    
    // Notifier le client
    try {
      const clientAddr = order.client?.address || order.client;
      await notificationService.notifyClientOrderUpdate(
        orderId,
        clientAddr,
        'IN_DELIVERY',
        { message: "Your order is on the way" }
      );
    } catch (notifError) {
      console.warn("Error sending notification:", notifError);
    }
    
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      message: "Pickup confirmed"
    });
  } catch (error) {
    console.error("Error confirming pickup:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to confirm pickup",
      details: error.message
    });
  }
}

/**
 * Updates GPS location for an order
 * @dev Updates deliverer GPS position during delivery
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function updateGPSLocation(req, res) {
  try {
    const orderId = req.orderId || parseInt(req.params.id);
    const { lat, lng } = req.validatedGPS || req.body;
    const delivererAddress = req.userAddress;
    
    if (!lat || !lng) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lat and lng are required"
      });
    }
    
    // Vérifier que la commande existe
    const order = await Order.findOne({ orderId })
      .populate('deliverer', 'address name');
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    
    // Vérifier que le livreur est assigné
    const orderDelivererAddress = order.deliverer?.address || order.deliverer;
    if (!orderDelivererAddress || orderDelivererAddress.toString().toLowerCase() !== delivererAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not assigned to this order"
      });
    }
    
    // Ajouter la position GPS
    await Order.addGPSLocation(orderId, lat, lng);
    
    // Mettre à jour la position du livreur
    await Deliverer.updateLocation(delivererAddress, lat, lng);
    
    return res.status(200).json({
      success: true,
      message: "GPS location updated",
      location: { lat, lng }
    });
  } catch (error) {
    console.error("Error updating GPS location:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update GPS location",
      details: error.message
    });
  }
}

/**
 * Confirms order delivery (client)
 * @dev Client confirms delivery and triggers payment split + token mint
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function confirmDelivery(req, res) {
  try {
    const orderId = req.orderId || parseInt(req.params.id);
    const clientAddress = req.userAddress;
    
    console.log(`[Backend] 📦 Confirmation livraison commande #${orderId} par client ${clientAddress}...`);
    
    // Vérifier que la commande existe
    const order = await Order.findOne({ orderId })
      .populate('client', 'address name')
      .populate('deliverer', 'address name');
    if (!order) {
      console.log(`[Backend] ❌ Commande #${orderId} non trouvée`);
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    
    console.log(`[Backend] ✅ Commande trouvée:`, {
      orderId: order.orderId,
      status: order.status,
      clientAddress: order.client?.address || order.client,
      delivererAddress: order.deliverer?.address || order.deliverer
    });
    
    // Vérifier que le client est le propriétaire
    const orderClientAddress = order.client?.address || order.client;
    if (!orderClientAddress || orderClientAddress.toString().toLowerCase() !== clientAddress.toLowerCase()) {
      console.log(`[Backend] ❌ Client ${clientAddress} n'est pas le propriétaire (propriétaire: ${orderClientAddress})`);
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this order"
      });
    }
    
    // Vérifier le statut
    if (order.status !== 'IN_DELIVERY') {
      console.log(`[Backend] ❌ Statut invalide: ${order.status} (attendu: IN_DELIVERY)`);
      return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be IN_DELIVERY, current status: ${order.status}`
      });
    }
    
    // Confirmer sur la blockchain (déclenche split + mint automatiquement)
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.confirmDelivery(
        orderId,
        clientAddress,
        req.body.clientPrivateKey || process.env.PRIVATE_KEY
      );
    } catch (blockchainError) {
      console.error("Error confirming delivery on blockchain:", blockchainError);
      console.error("Stack trace:", blockchainError.stack);
      
      // En mode dev, permettre de continuer même si la blockchain échoue
      if (process.env.NODE_ENV === 'development' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true') {
        console.warn('⚠️ Blockchain error in dev mode, continuing with mock data');
        blockchainResult = {
          txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
          tokensEarned: "0"
        };
      } else {
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to confirm delivery on blockchain",
          details: blockchainError.message
        });
      }
    }
    
    // Mettre à jour dans MongoDB
    console.log(`[Backend] 💾 Mise à jour statut commande #${orderId} à DELIVERED...`);
    await Order.updateStatus(orderId, 'DELIVERED');
    console.log(`[Backend] ✅ Statut mis à jour dans MongoDB`);
    
    // Incrémenter les compteurs
    try {
      if (order.restaurant && order.restaurant._id) {
        await Restaurant.incrementOrderCount(order.restaurant._id);
        console.log(`[Backend] ✅ Compteur restaurant incrémenté`);
      }
      if (order.deliverer && order.deliverer._id) {
        const delivererAddr = order.deliverer?.address || order.deliverer;
        if (delivererAddr) {
          await Deliverer.incrementDeliveryCount(delivererAddr.toString());
          console.log(`[Backend] ✅ Compteur livreur incrémenté`);
        }
      }
    } catch (counterError) {
      console.warn(`[Backend] ⚠️ Erreur incrémentation compteurs:`, counterError.message);
    }
    
    // Notifier le client
    try {
      await notificationService.notifyClientOrderUpdate(
        orderId,
        clientAddress,
        'DELIVERED',
        { 
          message: "Order delivered successfully",
          tokensEarned: blockchainResult.tokensEarned || "0"
        }
      );
      console.log(`[Backend] ✅ Notification envoyée au client`);
    } catch (notifError) {
      console.warn("[Backend] ⚠️ Erreur envoi notification:", notifError.message);
    }
    
    console.log(`[Backend] ✅ Livraison confirmée avec succès pour commande #${orderId}`);
    
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      status: 'DELIVERED',
      tokensEarned: blockchainResult.tokensEarned || "0"
    });
  } catch (error) {
    console.error("Error confirming delivery:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to confirm delivery",
      details: error.message
    });
  }
}

/**
 * Opens a dispute for an order
 * @dev Opens a dispute on the blockchain
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function openDispute(req, res) {
  try {
    const orderId = req.orderId || parseInt(req.params.id);
    const { reason, evidence } = req.body;
    const openerAddress = req.userAddress;
    
    // Vérifier que la commande existe
    const order = await Order.findOne({ orderId })
      .populate('client', 'address name')
      .populate('restaurant', 'address name')
      .populate('deliverer', 'address name');
    
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    
    // Vérifier que les relations sont peuplées
    const orderClientAddress = order.client?.address || order.client;
    const orderRestaurantAddress = order.restaurant?.address || order.restaurant;
    if (!orderClientAddress || !orderRestaurantAddress) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Order data is incomplete. Client or restaurant information missing."
      });
    }
    
    // Vérifier que l'utilisateur est impliqué dans la commande
    const orderDelivererAddress = order.deliverer?.address || order.deliverer;
    
    const isClient = orderClientAddress && orderClientAddress.toString().toLowerCase() === openerAddress.toLowerCase();
    const isRestaurant = orderRestaurantAddress && orderRestaurantAddress.toString().toLowerCase() === openerAddress.toLowerCase();
    const isDeliverer = orderDelivererAddress && orderDelivererAddress.toString().toLowerCase() === openerAddress.toLowerCase();
    
    if (!isClient && !isRestaurant && !isDeliverer) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not involved in this order"
      });
    }
    
    // Upload des preuves sur IPFS si fournies
    let evidenceHash = null;
    if (evidence) {
      try {
        const ipfsResult = await ipfsService.uploadJSON(evidence);
        evidenceHash = ipfsResult.ipfsHash;
      } catch (ipfsError) {
        console.warn("Error uploading dispute evidence to IPFS:", ipfsError);
      }
    }
    
    // Ouvrir le litige sur la blockchain
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.openDispute(
        orderId,
        openerAddress,
        reason || "",
        req.body.openerPrivateKey || process.env.PRIVATE_KEY
      );
    } catch (blockchainError) {
      console.error("Error opening dispute on blockchain:", blockchainError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to open dispute on blockchain",
        details: blockchainError.message
      });
    }
    
    // Mettre à jour dans MongoDB
    order.status = 'DISPUTED';
    order.disputeReason = reason || "";
    order.disputeEvidence = evidenceHash;
    await order.save();
    
    // Notifier les arbitres
    try {
      await notificationService.notifyArbitrators(
        orderId,
        orderId,
        { reason, opener: openerAddress }
      );
    } catch (notifError) {
      console.warn("Error sending notification:", notifError);
    }
    
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      status: 'DISPUTED',
      disputeReason: reason
    });
  } catch (error) {
    console.error("Error opening dispute:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to open dispute",
      details: error.message
    });
  }
}

/**
 * Gets order history with pagination
 * @dev Retrieves order history for a specific address
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getOrderHistory(req, res) {
  try {
    const address = req.validatedAddress || req.params.address;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    
    // Chercher comme client
    const client = await User.findByAddress(address);
    let clientOrders = [];
    if (client) {
      clientOrders = await Order.getOrdersByClient(client._id, {
        limit,
        skip,
        status
      });
    }
    
    // Chercher comme restaurant
    const restaurant = await Restaurant.findByAddress(address);
    let restaurantOrders = [];
    if (restaurant) {
      restaurantOrders = await Order.getOrdersByRestaurant(restaurant._id, {
        limit,
        skip,
        status
      });
    }
    
    // Chercher comme livreur
    const deliverer = await Deliverer.findByAddress(address);
    let delivererOrders = [];
    if (deliverer) {
      delivererOrders = await Order.getOrdersByDeliverer(deliverer._id, {
        limit,
        skip,
        status
      });
    }
    
    // Combiner et dédupliquer
    const allOrders = [...clientOrders, ...restaurantOrders, ...delivererOrders];
    const uniqueOrders = Array.from(
      new Map(allOrders.map(order => [order.orderId, order])).values()
    );
    
    // Trier par date (plus récent en premier)
    uniqueOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.status(200).json({
      success: true,
      orders: uniqueOrders.map(order => ({
        orderId: order.orderId,
        status: order.status,
        client: order.client ? {
          name: order.client.name || 'Unknown',
          address: order.client.address || order.client
        } : null,
        restaurant: order.restaurant ? {
          name: order.restaurant.name || 'Unknown',
          address: order.restaurant.address || order.restaurant
        } : null,
        deliverer: order.deliverer ? {
          name: order.deliverer.name || 'Unknown',
          address: order.deliverer.address || order.deliverer
        } : null,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      })),
      count: uniqueOrders.length
    });
  } catch (error) {
    console.error("Error getting order history:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get order history",
      details: error.message
    });
  }
}

/**
 * Submits a review for an order
 * @dev Client submits a review after delivery
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function submitReview(req, res) {
  try {
    const orderId = req.orderId || parseInt(req.params.id);
    const { rating, comment } = req.validatedReview || req.body;
    const clientAddress = req.userAddress;
    
    // Vérifier que la commande existe
    const order = await Order.findOne({ orderId })
      .populate('client', 'address name')
      .populate('restaurant', 'address name');
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    
    // Vérifier que le client est le propriétaire
    const orderClientAddress = order.client?.address || order.client;
    if (!orderClientAddress || orderClientAddress.toString().toLowerCase() !== clientAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this order"
      });
    }
    
    // Vérifier que la commande est livrée
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({
        error: "Bad Request",
        message: "Order must be delivered before submitting a review"
      });
    }
    
    // Ajouter la review à la commande
    order.review = {
      rating,
      comment: comment || '',
      createdAt: new Date()
    };
    await order.save();
    
    console.log(`[Backend] ✅ Review soumise pour commande #${orderId} par ${clientAddress} (rating: ${rating})`);
    
    return res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      review: {
        rating,
        comment: comment || '',
        createdAt: order.review.createdAt
      }
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to submit review",
      details: error.message
    });
  }
}

/**
 * Generates a receipt for an order
 * @dev Returns receipt data for PDF generation
 *
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getOrderReceipt(req, res) {
  try {
    const orderId = req.orderId || parseInt(req.params.id);

    // Récupérer la commande avec toutes les relations
    const order = await Order.findOne({ orderId })
      .populate('client', 'address name email phone')
      .populate('restaurant', 'address name location cuisine')
      .populate('deliverer', 'address name');

    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }

    // Vérifier que la commande est livrée (reçu seulement pour commandes complétées)
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({
        error: "Bad Request",
        message: "Le reçu n'est disponible que pour les commandes livrées"
      });
    }

    // Calculer les montants en format lisible
    const formatAmount = (weiAmount) => {
      if (!weiAmount) return '0.00';
      try {
        return ethers.formatEther(weiAmount.toString());
      } catch {
        return weiAmount.toString();
      }
    };

    // Construire les données du reçu
    const receipt = {
      // Informations générales
      receiptNumber: `DONE-${orderId}-${Date.now().toString(36).toUpperCase()}`,
      orderId: order.orderId,
      txHash: order.txHash,
      date: order.createdAt,
      deliveredAt: order.completedAt || order.updatedAt,

      // Client
      client: {
        name: order.client?.name || 'Client',
        address: order.client?.address || 'N/A',
        email: order.client?.email || null,
        phone: order.client?.phone || null
      },

      // Restaurant
      restaurant: {
        name: order.restaurant?.name || 'Restaurant',
        address: order.restaurant?.address || 'N/A',
        location: order.restaurant?.location?.address || null,
        cuisine: order.restaurant?.cuisine || null
      },

      // Livreur
      deliverer: order.deliverer ? {
        name: order.deliverer.name || 'Livreur',
        address: order.deliverer.address || 'N/A'
      } : null,

      // Adresse de livraison
      deliveryAddress: order.deliveryAddress,

      // Articles commandés
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: (item.price * item.quantity).toFixed(4)
      })),

      // Montants
      subtotal: formatAmount(order.foodPrice),
      deliveryFee: formatAmount(order.deliveryFee),
      platformFee: formatAmount(order.platformFee),
      total: formatAmount(order.totalAmount),

      // Monnaie
      currency: 'MATIC',

      // Review si disponible
      review: order.review ? {
        rating: order.review.rating,
        comment: order.review.comment,
        date: order.review.createdAt
      } : null,

      // Métadonnées
      ipfsHash: order.ipfsHash,
      blockchainVerified: !!order.txHash,

      // Informations de la plateforme
      platform: {
        name: 'DoneFood',
        website: 'https://donefood.io',
        support: 'support@donefood.io'
      }
    };

    return res.status(200).json({
      success: true,
      receipt
    });
  } catch (error) {
    console.error("Error generating receipt:", error);

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to generate receipt",
      details: error.message
    });
  }
}

module.exports = {
  createOrder,
  getOrder,
  getOrdersByClient,
  confirmPreparation,
  assignDeliverer,
  confirmPickup,
  updateGPSLocation,
  confirmDelivery,
  openDispute,
  getOrderHistory,
  submitReview,
  getOrderReceipt
};

