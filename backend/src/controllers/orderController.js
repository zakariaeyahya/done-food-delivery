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

    const { restaurantId, items, deliveryAddress, clientAddress, clientPrivateKey, txHash: frontendTxHash, onChainOrderId: frontendOnChainOrderId } = req.body;
    const userAddress = req.userAddress || clientAddress;

    if (!userAddress) {
            return res.status(400).json({
        error: "Bad Request",
        message: "Client address is required"
      });
    }
    const client = await User.findByAddress(userAddress);
        if (!client) {
            return res.status(404).json({
        error: "Not Found",
        message: "Client not found. Please register first."
      });
    }
    let restaurant;
    if (restaurantId) {
            restaurant = await Restaurant.findById(restaurantId);
    }
    if (!restaurant && req.body.restaurantAddress) {
            restaurant = await Restaurant.findByAddress(req.body.restaurantAddress);
    }

        if (!restaurant) {
            return res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found. Please provide a valid restaurantId or restaurantAddress."
      });
    }
    const finalRestaurantId = restaurant._id;
    let foodPrice = 0;
    items.forEach(item => {
      foodPrice += item.price * item.quantity;
    });
    const deliveryFee = req.body.deliveryFee || 0.01; // 0.01 MATIC par défaut
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
    let ipfsHash;
    try {
      const ipfsResult = await ipfsService.uploadJSON(orderData);
      ipfsHash = ipfsResult.ipfsHash;
    } catch (ipfsError) {
            return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to upload order data to IPFS",
        details: ipfsError.message
      });
    }
    let blockchainResult;

    // Vérifier et accorder le rôle RESTAURANT_ROLE si nécessaire
    const isMockMode = process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.DEMO_MODE === 'true';

    if (!isMockMode) {
      try {
        const hasRole = await blockchainService.hasRestaurantRole(restaurant.address);
        if (!hasRole) {
          console.log(`[createOrder] Restaurant ${restaurant.address} n'a pas RESTAURANT_ROLE, attribution...`);
          await blockchainService.grantRestaurantRole(restaurant.address);
          console.log(`[createOrder] RESTAURANT_ROLE accordé à ${restaurant.address}`);
        }
      } catch (roleError) {
        console.error('[createOrder] Erreur lors de l\'attribution du rôle:', roleError.message);
        // Continuer quand même, le frontend gérera l'erreur si nécessaire
      }
    }

    // Si le frontend a déjà créé l'ordre sur la blockchain (via MetaMask),
    // utiliser le txHash et onChainOrderId fournis
    if (frontendTxHash && frontendOnChainOrderId) {
      console.log('[createOrder] Utilisation du txHash/orderId du frontend:', {
        txHash: frontendTxHash,
        onChainOrderId: frontendOnChainOrderId
      });
      blockchainResult = {
        orderId: frontendOnChainOrderId,
        txHash: frontendTxHash
      };
    } else {
      // Sinon, créer sur la blockchain via le backend (mode legacy/mock)
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
              return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to create order on blockchain",
          details: blockchainError.message
        });
      }
    }
    const foodPriceWei = ethers.parseEther(foodPrice.toString());
    const deliveryFeeWei = ethers.parseEther(deliveryFee.toString());
    const platformFeeWei = (foodPriceWei * BigInt(10)) / BigInt(100);
    const totalAmountWei = foodPriceWei + deliveryFeeWei + platformFeeWei;
    let order = await Order.findOne({ orderId: blockchainResult.orderId });
    
    if (order) {
      if (order.txHash === blockchainResult.txHash) {
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
        return res.status(409).json({
          error: "Conflict",
          message: `Order ID ${blockchainResult.orderId} already exists with a different transaction hash`,
          details: "This orderId is already in use. Please try again."
        });
      }
    }
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
      if (saveError.code === 11000) {
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
    try {
      await notificationService.notifyOrderCreated(
        blockchainResult.orderId,
        restaurant._id.toString(),
        { items, totalAmount: totalAmountWei.toString() }
      );
    } catch (notifError) {
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
    let blockchainOrder = null;
    try {
      blockchainOrder = await blockchainService.getOrder(orderId);
    } catch (blockchainError) {
          }
    
    // Gérer les cas où client/restaurant peuvent être des strings (adresses) ou des objets peuplés
    const orderClientAddress = order.client?.address || (typeof order.client === 'string' ? order.client : null);
    const orderRestaurantAddress = order.restaurant?.address || (typeof order.restaurant === 'string' ? order.restaurant : null);
    if (!orderClientAddress || !orderRestaurantAddress) {
      if (blockchainOrder) {
        if (!orderClientAddress && blockchainOrder.client) {
          order.client = { address: blockchainOrder.client, name: 'Unknown' };
        }
        if (!orderRestaurantAddress && blockchainOrder.restaurant) {
          order.restaurant = { address: blockchainOrder.restaurant, name: 'Unknown' };
        }
      } else {
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Order data is incomplete. Client or restaurant information missing."
        });
      }
    }
    let ipfsData = null;
    if (order.ipfsHash) {
      try {
        ipfsData = await ipfsService.getJSON(order.ipfsHash);
      } catch (ipfsError) {
        if (!ipfsError.message || !ipfsError.message.includes('Invalid IPFS')) {
                  }
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
    const order = await Order.findOne({ orderId })
      .populate('restaurant', 'address name');
    
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    const orderRestaurantAddress = order.restaurant?.address || order.restaurant;
    if (!orderRestaurantAddress) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Order data is incomplete. Restaurant information missing."
      });
    }
    if (!orderRestaurantAddress || orderRestaurantAddress.toString().toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this order"
      });
    }
    if (order.status !== 'CREATED') {
      return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be CREATED, current status: ${order.status}`
      });
    }
    let blockchainResult;
    try {
      const restaurant = await Restaurant.findByAddress(restaurantAddress);
      const privateKey = req.body.restaurantPrivateKey || process.env.PRIVATE_KEY || null;
      
      blockchainResult = await blockchainService.confirmPreparation(
        orderId,
        restaurantAddress,
        privateKey
      );
    } catch (blockchainError) {
      if (process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.DEMO_MODE === 'true') {
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
    await Order.updateStatus(orderId, 'PREPARING');
    const updatedOrder = await Order.findOne({ orderId })
      .populate('restaurant', 'address name location')
      .populate('client', 'address');
    try {
      const clientAddr = order.client?.address || order.client;
      await notificationService.notifyClientOrderUpdate(
        orderId,
        clientAddr,
        'PREPARING',
        { message: "Your order is being prepared" }
      );
    } catch (notifError) {
          }
    try {
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
      const availableDeliverers = await Deliverer.find({ 
        isAvailable: true,
        isStaked: true 
      }).select('address name isAvailable isStaked');
      
                                    
      if (availableDeliverers.length > 0) {
              } else {
                                              }
      
      const delivererAddresses = availableDeliverers && availableDeliverers.length > 0 
        ? availableDeliverers.map(d => d.address)
        : [];
            await notificationService.notifyDeliverersAvailable(
        orderId,
        delivererAddresses,
        orderData
      );
          } catch (notifError) {
    }
    
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      status: 'PREPARING'
    });
  } catch (error) {
        
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to confirm preparation",
      details: error.message
    });
  }
}

/**
 * Marks an order as ready for pickup
 * @dev Restaurant marks the order as ready after preparation is complete
 * @notice This triggers notifications to available deliverers
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function markOrderReady(req, res) {
  try {
    const orderId = req.orderId || parseInt(req.params.id);
    const restaurantAddress = req.userAddress;
    const order = await Order.findOne({ orderId })
      .populate('restaurant', 'address name location')
      .populate('client', 'address name');
    
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    const orderRestaurantAddress = order.restaurant?.address || order.restaurant;
    if (!orderRestaurantAddress || orderRestaurantAddress.toString().toLowerCase() !== restaurantAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this order"
      });
    }
    if (order.status !== 'PREPARING') {
      return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be PREPARING, current status: ${order.status}`
      });
    }
    await Order.updateStatus(orderId, 'READY');
    const updatedOrder = await Order.findOne({ orderId })
      .populate('restaurant', 'address name location')
      .populate('client', 'address name');
    try {
      const clientAddr = order.client?.address || order.client;
      await notificationService.notifyClientOrderUpdate(
        orderId,
        clientAddr,
        'READY',
        { message: "Your order is ready for pickup!" }
      );
          } catch (notifError) {
          }
    try {
      const orderData = {
        orderId: updatedOrder.orderId,
        restaurant: {
          name: updatedOrder.restaurant?.name || 'Restaurant',
          address: updatedOrder.restaurant?.address || order.restaurant,
          location: updatedOrder.restaurant?.location || null
        },
        totalAmount: updatedOrder.totalAmount,
        deliveryAddress: updatedOrder.deliveryAddress,
        items: updatedOrder.items,
        client: {
          name: updatedOrder.client?.name || 'Client',
          address: updatedOrder.client?.address
        }
      };
      const availableDeliverers = await Deliverer.find({ 
        isAvailable: true,
        isStaked: true 
      }).select('address name');
      
            
      const delivererAddresses = availableDeliverers.map(d => d.address);
      await notificationService.notifyDeliverersAvailable(
        orderId,
        delivererAddresses,
        orderData
      );
          } catch (notifError) {
          }
    
    return res.status(200).json({
      success: true,
      message: `Order #${orderId} marked as ready`,
      status: 'READY'
    });
  } catch (error) {
        
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to mark order as ready",
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
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    if (order.status !== 'PREPARING') {
      return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be PREPARING, current status: ${order.status}`
      });
    }
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
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.assignDeliverer(
        orderId,
        delivererAddress,
        process.env.PRIVATE_KEY // Platform private key
      );
    } catch (blockchainError) {
            return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to assign deliverer on blockchain",
        details: blockchainError.message
      });
    }
    order.deliverer = deliverer._id;
    order.status = 'IN_DELIVERY';
    await order.save();
    try {
      await notificationService.notifyDeliverersAvailable(
        orderId,
        [delivererAddress],
        { restaurant: order.restaurant.name, deliveryAddress: order.deliveryAddress }
      );
    } catch (notifError) {
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
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    const orderDelivererAddress = order.deliverer?.address || order.deliverer;
    if (!orderDelivererAddress || orderDelivererAddress.toString().toLowerCase() !== delivererAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not assigned to this order"
      });
    }
    if (order.status !== 'IN_DELIVERY') {
      return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be IN_DELIVERY, current status: ${order.status}`
      });
    }
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.confirmPickup(
        orderId,
        delivererAddress,
        req.body.delivererPrivateKey || process.env.PRIVATE_KEY
      );
    } catch (blockchainError) {
            return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to confirm pickup on blockchain",
        details: blockchainError.message
      });
    }
    try {
      const clientAddr = order.client?.address || order.client;
      await notificationService.notifyClientOrderUpdate(
        orderId,
        clientAddr,
        'IN_DELIVERY',
        { message: "Your order is on the way" }
      );
    } catch (notifError) {
          }
    
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      message: "Pickup confirmed"
    });
  } catch (error) {
        
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
    const order = await Order.findOne({ orderId })
      .populate('deliverer', 'address name');
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    const orderDelivererAddress = order.deliverer?.address || order.deliverer;
    if (!orderDelivererAddress || orderDelivererAddress.toString().toLowerCase() !== delivererAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not assigned to this order"
      });
    }
    await Order.addGPSLocation(orderId, lat, lng);
    await Deliverer.updateLocation(delivererAddress, lat, lng);
    
    return res.status(200).json({
      success: true,
      message: "GPS location updated",
      location: { lat, lng }
    });
  } catch (error) {
        
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
    const order = await Order.findOne({ orderId })
      .populate('client', 'address name')
      .populate('deliverer', 'address name');
    if (!order) {
            return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    const orderClientAddress = order.client?.address || order.client;
    if (!orderClientAddress || orderClientAddress.toString().toLowerCase() !== clientAddress.toLowerCase()) {
            return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this order"
      });
    }
    if (order.status !== 'IN_DELIVERY') {
            return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be IN_DELIVERY, current status: ${order.status}`
      });
    }
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.confirmDelivery(
        orderId,
        clientAddress,
        req.body.clientPrivateKey || process.env.PRIVATE_KEY
      );
    } catch (blockchainError) {
      // Mode mock/demo si ALLOW_MOCK_BLOCKCHAIN ou DEMO_MODE actif
      const isMockMode = process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.DEMO_MODE === 'true';

      console.log('[confirmDelivery] Blockchain error, mock mode:', isMockMode);

      if (isMockMode) {
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
        await Order.updateStatus(orderId, 'DELIVERED');
    try {
      if (order.restaurant && order.restaurant._id) {
        await Restaurant.incrementOrderCount(order.restaurant._id);
              }
      if (order.deliverer && order.deliverer._id) {
        const delivererAddr = order.deliverer?.address || order.deliverer;
        if (delivererAddr) {
          await Deliverer.incrementDeliveryCount(delivererAddr.toString());
                  }
      }
    } catch (counterError) {
          }
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
          } catch (notifError) {
          }
    
        
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      status: 'DELIVERED',
      tokensEarned: blockchainResult.tokensEarned || "0"
    });
  } catch (error) {
        
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
    if (!openerAddress) {
            return res.status(401).json({
        error: "Unauthorized",
        message: "User address not found. Please ensure you are authenticated."
      });
    }
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
    const orderClientAddress = order.client?.address || order.client;
    const orderRestaurantAddress = order.restaurant?.address || order.restaurant;
    if (!orderClientAddress || !orderRestaurantAddress) {
            return res.status(500).json({
        error: "Internal Server Error",
        message: "Order data is incomplete. Client or restaurant information missing."
      });
    }
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
    let evidenceHash = null;
    if (evidence) {
      try {
                const ipfsResult = await ipfsService.uploadJSON(evidence);
        evidenceHash = ipfsResult.ipfsHash;
              } catch (ipfsError) {
      }
    }
    let blockchainResult;
    try {
            blockchainResult = await blockchainService.openDispute(
        orderId,
        openerAddress,
        reason || "",
        req.body.openerPrivateKey || process.env.PRIVATE_KEY
      );
          } catch (blockchainError) {

      // En mode mock/demo, permettre de continuer même si la blockchain échoue
      if (process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.DEMO_MODE === 'true') {
                blockchainResult = {
          txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
          blockNumber: 12345678
        };
      } else {
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to open dispute on blockchain",
          details: blockchainError.message
        });
      }
    }
    order.status = 'DISPUTED';
    order.disputed = true; // Important: ce champ est utilisé par getDisputes() dans adminController
    order.disputeReason = reason || "";
    order.disputeEvidence = evidenceHash;
    await order.save();
    try {
      await notificationService.notifyArbitrators(
        orderId,
        orderId,
        { reason, opener: openerAddress }
      );
    } catch (notifError) {
          }
    
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      status: 'DISPUTED',
      disputeReason: reason
    });
  } catch (error) {
        
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
    const client = await User.findByAddress(address);
    let clientOrders = [];
    if (client) {
      clientOrders = await Order.getOrdersByClient(client._id, {
        limit,
        skip,
        status
      });
    }
    const restaurant = await Restaurant.findByAddress(address);
    let restaurantOrders = [];
    if (restaurant) {
      restaurantOrders = await Order.getOrdersByRestaurant(restaurant._id, {
        limit,
        skip,
        status
      });
    }
    const deliverer = await Deliverer.findByAddress(address);
    let delivererOrders = [];
    if (deliverer) {
      delivererOrders = await Order.getOrdersByDeliverer(deliverer._id, {
        limit,
        skip,
        status
      });
    }
    const allOrders = [...clientOrders, ...restaurantOrders, ...delivererOrders];
    const uniqueOrders = Array.from(
      new Map(allOrders.map(order => [order.orderId, order])).values()
    );
    uniqueOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.status(200).json({
      success: true,
      orders: uniqueOrders.map(order => ({
        orderId: orderrderId,
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
    const order = await Order.findOne({ orderId })
      .populate('client', 'address name')
      .populate('restaurant', 'address name');
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    const orderClientAddress = order.client?.address || order.client;
    if (!orderClientAddress || orderClientAddress.toString().toLowerCase() !== clientAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not the owner of this order"
      });
    }
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({
        error: "Bad Request",
        message: "Order must be delivered before submitting a review"
      });
    }
    order.review = {
      rating,
      comment: comment || '',
      createdAt: new Date()
    };
    await order.save();
    
        
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
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({
        error: "Bad Request",
        message: "Le reçu n'est disponible que pour les commandes livrées"
      });
    }
    const formatAmount = (weiAmount) => {
      if (!weiAmount) return '0.00';
      try {
        return ethers.formatEther(weiAmount.toString());
      } catch {
        return weiAmount.toString();
      }
    };
    const receipt = {
      receiptNumber: `DONE-${orderId}-${Date.now().toString(36).toUpperCase()}`,
      orderId: order.orderId,
      txHash: order.txHash,
      date: order.createdAt,
      deliveredAt: order.completedAt || order.updatedAt,
      client: {
        name: order.client?.name || 'Client',
        address: order.client?.address || 'N/A',
        email: order.client?.email || null,
        phone: order.client?.phone || null
      },
      restaurant: {
        name: order.restaurant?.name || 'Restaurant',
        address: order.restaurant?.address || 'N/A',
        location: order.restaurant?.location?.address || null,
        cuisine: order.restaurant?.cuisine || null
      },
      deliverer: order.deliverer ? {
        name: order.deliverer.name || 'Livreur',
        address: order.deliverer.address || 'N/A'
      } : null,
      deliveryAddress: order.deliveryAddress,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: (item.price * item.quantity).toFixed(4)
      })),
      subtotal: formatAmount(order.foodPrice),
      deliveryFee: formatAmount(order.deliveryFee),
      platformFee: formatAmount(order.platformFee),
      total: formatAmount(order.totalAmount),
      currency: 'MATIC',
      review: order.review ? {
        rating: order.review.rating,
        comment: order.review.comment,
        date: order.review.createdAt
      } : null,
      ipfsHash: order.fsHash,
      blockchainVerified: !!order.txHash,
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
  markOrderReady,
  assignDeliverer,
  confirmPickup,
  updateGPSLocation,
  confirmDelivery,
  openDispute,
  getOrderHistory,
  submitReview,
  getOrderReceipt
};

