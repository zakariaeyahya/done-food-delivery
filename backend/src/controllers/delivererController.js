const gpsTracker = require("../utils/gpsTracker");
const Deliverer = require("../models/Deliverer");
const Order = require("../models/Order");
const blockchainService = require("../services/blockchainService");
const { ethers } = require("ethers");

/**
 * Controller for managing deliverers
 * @notice Manages registration, staking, availability and earnings of deliverers
 * @dev Uses MongoDB and blockchain services
 */

/**
 * Registers a new deliverer
 * @dev Implemented - MongoDB only
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function registerDeliverer(req, res) {
  try {
    const { address, name, phone, vehicleType, location } = req.body;
    
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }
    
    const existingDeliverer = await Deliverer.findByAddress(address.toLowerCase());
    if (existingDeliverer) {
      return res.status(409).json({
        error: "Conflict",
        message: "Deliverer already exists"
      });
    }
    const defaultLocation = {
      lat: 48.8566,  // Paris
      lng: 2.3522
    };
    
    const delivererLocation = location && location.lat && location.lng 
      ? { lat: parseFloat(location.lat), lng: parseFloat(location.lng) }
      : defaultLocation;
    
    const deliverer = new Deliverer({
      address: address.toLowerCase(),
      name,
      phone,
      vehicleType: vehicleType || 'bike',
      currentLocation: {
        lat: delivererLocation.lat,
        lng: delivererLocation.lng,
        lastUpdated: new Date()
      },
      isAvailable: false,
      isStaked: false,
      stakedAmount: 0,
      rating: 0,
      totalDeliveries: 0
    });
    await deliverer.save();
    
    return res.status(201).json({
      success: true,
      deliverer: {
        address: deliverer.address,
        name: deliverer.name,
        phone: deliverer.phone,
        vehicleType: deliverer.vehicleType,
        location: deliverer.currentLocation
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid registration data",
        details: validationErrors.join(', ')
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Conflict",
        message: "Deliverer with this address already exists"
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to register deliverer",
      details: error.message
    });
  }
}

/**
 * Gets deliverer details
 * @dev Retrieves deliverer profile with blockchain staking status
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getDeliverer(req, res) {
  try {
    const address = req.params.address || req.validatedAddress || req.userAddress;
    
    const normalizedAddress = address.toLowerCase();
    
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    let isStakedBlockchain = false;
    let stakedAmountBlockchain = "0";
    
    try {
      isStakedBlockchain = await blockchainService.isStaked(normalizedAddress);
      if (isStakedBlockchain) {
        const staking = require("../config/blockchain").getContractInstance("staking");
        const stakedAmountWei = await staking.stakedAmount(normalizedAddress);
        stakedAmountBlockchain = ethers.formatEther(stakedAmountWei);
        if (deliverer.isStaked !== isStakedBlockchain || deliverer.stakedAmount !== parseFloat(stakedAmountBlockchain)) {
          deliverer.isStaked = isStakedBlockchain;
          deliverer.stakedAmount = parseFloat(stakedAmountBlockchain);
          await deliverer.save();
        }
      }
    } catch (blockchainError) {
      isStakedBlockchain = deliverer.isStaked;
      stakedAmountBlockchain = deliverer.stakedAmount.toString();
    }
    
    return res.status(200).json({
      success: true,
      deliverer: {
        address: deliverer.address,
        name: deliverer.name,
        phone: deliverer.phone,
        vehicleType: deliverer.vehicleType,
        currentLocation: deliverer.currentLocation,
        isAvailable: deliverer.isAvailable,
        isStaked: isStakedBlockchain,
        stakedAmount: stakedAmountBlockchain,
        rating: deliverer.rating,
        totalDeliveries: deliverer.totalDeliveries
      }
    });
  } catch (error) {
    
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get deliverer",
      details: error.message
    });
  }
}

/**
 * Gets available orders for deliverers
 * @dev Retrieves orders with PREPARING status that are available for delivery
 * @notice This endpoint is used by deliverers to see available orders
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getAvailableDeliverers(req, res) {
  try {
    const { lat, lng } = req.query;
    const availableOrders = await Order.find({
      $or: [
        { status: 'READY', deliverer: null },
        { status: 'PREPARING', deliverer: null },
        { status: 'CREATED', deliverer: null }
      ]
    })
    .populate('restaurant', 'name address location')
    .populate('client', 'address name')
    .sort({ createdAt: -1 }); // Plus récentes en premier
    
    
    
    if (availableOrders.length > 0) {
      
    } else {
      const totalOrders = await Order.countDocuments();
      const readyOrders = await Order.countDocuments({ status: 'READY' });
      const preparingOrders = await Order.countDocuments({ status: 'PREPARING' });
      const createdOrders = await Order.countDocuments({ status: 'CREATED' });
      const ordersWithDeliverer = await Order.countDocuments({ deliverer: { $ne: null } });
      
      
      
      
      
      
      
    }
    let formattedOrders = availableOrders.map(order => {
      const orderObj = order.toObject();
      let distance = null;
      if (lat && lng && orderObj.restaurant?.location) {
        const restaurantLocation = orderObj.restaurant.location;
        if (restaurantLocation.lat && restaurantLocation.lng) {
          distance = gpsTracker.calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            restaurantLocation.lat,
            restaurantLocation.lng
          );
        }
      }
      
      return {
        orderId: orderObj.orderId,
        restaurant: {
          name: orderObj.restaurant?.name || 'Restaurant',
          address: orderObj.restaurant?.address || orderObj.restaurant,
          location: orderObj.restaurant?.location || null
        },
        totalAmount: orderObj.totalAmount,
        deliveryAddress: orderObj.deliveryAddress,
        items: orderObj.items || [],
        createdAt: orderObj.createdAt,
        distance: distance // Distance en km depuis la position du livreur
      };
    });
    if (lat && lng) {
      formattedOrders = formattedOrders
        .filter(order => order.distance !== null)
        .sort((a, b) => a.distance - b.distance);
    }
    
    return res.status(200).json(formattedOrders);
  } catch (error) {
    
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get available orders",
      details: error.message
    });
  }
}

/**
 * Updates deliverer availability status
 * @dev Implemented - MongoDB only
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function updateDelivererStatus(req, res) {
  try {
    const address = req.params.address || req.userAddress || req.validatedAddress;
    
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        error: "Bad Request",
        message: "isAvailable must be a boolean"
      });
    }
    
    const normalizedAddress = address.toLowerCase();
    
    
    
    const updatedDeliverer = await Deliverer.setAvailability(normalizedAddress, isAvailable);
    
    if (!updatedDeliverer) {
      
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    if (isAvailable && !updatedDeliverer.isStaked) {

      // En mode DEMO, auto-activer le staking pour permettre les tests
      if (process.env.DEMO_MODE === 'true') {
        updatedDeliverer.isStaked = true;
        updatedDeliverer.stakedAmount = 0.1;
        await updatedDeliverer.save();
        console.log('[DEMO_MODE] Auto-staking livreur:', normalizedAddress);
      } else {
        try {
          const isStakedBlockchain = await blockchainService.isStaked(normalizedAddress);
          if (isStakedBlockchain) {
            const staking = require("../config/blockchain").getContractInstance("staking");
            const stakedAmountWei = await staking.stakedAmount(normalizedAddress);
            const stakedAmountBlockchain = ethers.formatEther(stakedAmountWei);

            updatedDeliverer.isStaked = true;
            updatedDeliverer.stakedAmount = parseFloat(stakedAmountBlockchain);
            await updatedDeliverer.save();
          }
        } catch (blockchainError) {
          console.log('[updateDelivererStatus] Blockchain error:', blockchainError.message);
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      isAvailable: updatedDeliverer.isAvailable,
      isStaked: updatedDeliverer.isStaked
    });
  } catch (error) {
    
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update deliverer status",
      details: error.message
    });
  }
}

/**
 * Stakes a deliverer (deposit guarantee)
 * @dev Stakes deliverer on blockchain and synchronizes with MongoDB
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function stakeAsDeliverer(req, res) {
  try {
    const { address, amount, delivererPrivateKey } = req.body;
    
    const normalizedAddress = address.toLowerCase();
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    const minimumStake = ethers.parseEther("0.1");
    const stakeAmountWei = ethers.parseEther(amount.toString());
    
    if (stakeAmountWei < minimumSke) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Minimum stake  0.1 MATIC"
      });
    }
    if (!delivererPrivateKey) {
      return res.status(400).json({
        error: "Bad Request",
        message: "delivererPrivateKey is required to sign the transaction"
      });
    }
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.stakeDeliverer(
        normalizedAddress,
        amount.toString(),
        delivererPrivateKey
      );
    } catch (blockchainError) {
      
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to stake on blockchain",
        details: blockchainError.message
      });
    }
    const updatedDeliverer = await Deliverer.findOneAndUpdate(
      { address: normalizedAddress },
      { 
        $set: { 
          isStaked: true,
          stakedAmount: parseFloat(amount)
        } 
      },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      blockNumber: blockchainResult.blockNumber,
      message: "Stake successful on blockchain",
      deliverer: {
        address: updatedDeliverer.address,
        isStaked: updatedDeliverer.isStaked,
        stakedAmount: updatedDeliverer.stakedAmount
      }
    });
  } catch (error) {
    
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to stake deliverer",
      details: error.message
    });
  }
}

/**
 * Unstakes a deliverer
 * @dev Unstakes deliverer on blockchain and synchronizes with MongoDB
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function unstake(req, res) {
  try {
    const address = req.body.address || req.userAddress || req.validatedAddress;
    const { delivererPrivateKey } = req.body;
    
    const normalizedAddress = address.toLowerCase();
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    const activeOrders = await Order.find({ 
      deliverer: deliverer._id,
      status: 'IN_DELIVERY'
    });
    
    if (activeOrders.length > 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Cannot unstake while having active deliveries"
      });
    }
    if (!delivererPrivateKey) {
      return res.status(400).json({
        error: "Bad Request",
        message: "delivererPrivateKey is required to sign the transaction"
      });
    }
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.unstake(
        normalizedAddress,
        delivererPrivateKey
      );
    } catch (blockchainError) {
      
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to unstake on blockchain",
        details: blockchainError.message
      });
    }
    const updatedDeliverer = await Deliverer.findOneAndUpdate(
      { address: normalizedAddress },
      { 
        $set: { 
          isStaked: false,
          stakedAmount: 0
        } 
      },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      txHash: blockchainResult.txHash,
      blockNumber: blockchainResult.blockNumber,
      message: "Unstake successful on blockchain",
      deliverer: {
        address: updatedDeliverer.address,
        isStaked: updatedDeliverer.isStaked,
        stakedAmount: updatedDeliverer.stakedAmount
      }
    });
  } catch (error) {
    
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to unstake deliverer",
      details: error.message
    });
  }
}

/**
 * Gets deliverer orders
 * @dev Implemented - MongoDB only
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getDelivererOrders(req, res) {
  try {
    const address = req.params.address || req.userAddress || req.validatedAddress;

    const normalizedAddress = address.toLowerCase();

    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }

    const { status } = req.query;

    const orders = await Order.getOrdersByDeliverer(deliverer._id, {
      status
    });
    const ordersWithEarnings = orders.map(order => {
      const orderObj = order.toObject ? order.toObject() : order;
      const deliveryFeeWei = parseFloat(orderObj.deliveryFee || 0);
      const earningsPOL = deliveryFeeWei / 1e18;
      return {
        ...orderObj,
        earnings: parseFloat(earningsPOL.toFixed(5))
      };
    });

    return res.status(200).json({
      success: true,
      orders: ordersWithEarnings,
      count: ordersWithEarnings.length
    });
  } catch (error) {
    

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get deliverer orders",
      details: error.message
    });
  }
}

/**
 * Gets deliverer earnings
 * @dev Implemented - MongoDB calculations only
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getDelivererEarnings(req, res) {
  try {
    const address = req.params.address || req.userAddress || req.validatedAddress;
    
    const normalizedAddress = address.toLowerCase();
    
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    const { startDate, endDate, period } = req.query;
    
    // Condition de base: deliverer + status DELIVERED
    const delivererCondition = {
      $or: [
        { deliverer: deliverer._id },
        { delivererAddress: normalizedAddress }
      ]
    };

    // Construire la requête avec $and pour combiner les conditions
    const query = {
      $and: [
        delivererCondition,
        { status: 'DELIVERED' }
      ]
    };

    // Ajouter le filtre de date si spécifié
    if (period) {
      const now = new Date();
      let start = new Date();

      switch (period.toLowerCase()) {
        case 'today':
          start.setHours(0, 0, 0, 0);
          break;
        case 'week':
          start.setDate(now.getDate() - 7);
          break;
        case 'month':
          start.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      if (period.toLowerCase() === 'today' || period.toLowerCase() === 'week' || period.toLowerCase() === 'month') {
        query.$and.push({
          $or: [
            { completedAt: { $gte: start, $lte: now } },
            { completedAt: null, updatedAt: { $gte: start, $lte: now } }
          ]
        });
      }
    } else if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      query.$and.push({
        $or: [
          { completedAt: dateFilter },
          { completedAt: null, updatedAt: dateFilter }
        ]
      });
    }
    
    console.log('📊 Earnings query:', JSON.stringify(query, null, 2));
    const orders = await Order.find(query).sort({ completedAt: -1, updatedAt: -1 });
    console.log(`📊 Found ${orders.length} orders for deliverer ${normalizedAddress}`);

    const totalEarnings = orders.reduce((sum, order) => {
      const deliveryFeePOL = parseFloat(order.deliveryFee || 0) / 1e18;
      return sum + deliveryFeePOL;
    }, 0);

    const completedDeliveries = orders.length;
    const averageEarning = completedDeliveries > 0 ? totalEarnings / completedDeliveries : 0;

    // Construire la liste des transactions pour l'historique
    const transactions = orders.map(order => ({
      orderId: order.orderId,
      delivererAmount: parseFloat(order.deliveryFee || 0) / 1e18,
      totalAmount: parseFloat(order.totalAmount || 0) / 1e18,
      txHash: order.txHash || null,
      timestamp: order.completedAt ? Math.floor(new Date(order.completedAt).getTime() / 1000) : Math.floor(new Date(order.updatedAt).getTime() / 1000),
      date: order.completedAt || order.updatedAt
    }));

    // Disable caching for fresh earnings data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    return res.status(200).json({
      success: true,
      earnings: {
        totalEarnings: parseFloat(totalEarnings.toFixed(4)),
        completedDeliveries,
        averageEarning: parseFloat(averageEarning.toFixed(4)),
        transactions
      }
    });
  } catch (error) {


    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get deliverer earnings",
      details: error.message
    });
  }
}

/**
 * Accept an order (deliverer accepts an available order)
 * @dev Deliverer accepts an order that is in PREPARING status
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function acceptOrder(req, res) {
  try {
    const orderId = parseInt(req.params.orderId);
    const delivererAddress = req.userAddress || req.body.delivererAddress;
    
    
    
    
    
    
    
    if (!orderId || isNaN(orderId)) {
      
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid order ID"
      });
    }
    
    if (!delivererAddress) {
      
      return res.status(400).json({
        error: "Bad Request",
        message: "Deliverer address is required"
      });
    }
    
    const normalizedAddress = delivererAddress.toLowerCase();
    
    const order = await Order.findOne({ orderId })
      .populate('restaurant', 'name address')
      .populate('client', 'address');
      
    if (!order) {
      
      return res.status(404).json({
        error: "Not Found",
        message: `Order with id ${orderId} not found`
      });
    }
    if (order.status !== 'READY' && order.status !== 'PREPARING' && order.status !== 'CREATED') {
      
      return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be READY, PREPARING or CREATED, current status: ${order.status}`
      });
    }
    if (order.deliverer) {
      
      return res.status(400).json({
        error: "Bad Request",
        message: "Order is already assigned to a deliverer"
      });
    }
    
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found. Please register first."
      });
    }
    
    
    
    if (!deliverer.isAvailable) {
      
      return res.status(400).json({
        error: "Bad Request",
        message: "Deliverer is not available. Please set your status to online."
      });
    }
    if (!deliverer.isStaked) {
      
      try {
        const isStakedBlockchain = await blockchainService.isStaked(normalizedAddress);
        if (isStakedBlockchain) {
          const staking = require("../config/blockchain").getContractInstance("staking");
          const stakedAmountWei = await staking.stakedAmount(normalizedAddress);
          const stakedAmountBlockchain = ethers.formatEther(stakedAmountWei);
          
          deliverer.isStaked = true;
          deliverer.stakedAmount = parseFloat(stakedAmountBlockchain);
          await deliverer.save();
          
          
        } else {
          if (process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.DEMO_MODE === 'true') {

            deliverer.isStaked = true;
            await deliverer.save();
          } else {
            return res.status(400).json({
              error: "Bad Request",
              message: "Deliverer is not staked. Please stake minimum 0.1 POL to accept orders."
            });
          }
        }
      } catch (blockchainError) {
        const isRpcError = blockchainError.code === -32002 ||
                          blockchainError.message?.includes('too many errors') ||
                          blockchainError.message?.includes('missing revert data') ||
                          blockchainError.message?.includes('CALL_EXCEPTION');
        if (process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.DEMO_MODE === 'true' || isRpcError) {
          if (deliverer.isAvailable) {
            deliverer.isStaked = true;
            await deliverer.save();

          }
        } else {

          return res.status(400).json({
            error: "Bad Request",
            message: "Deliverer is not staked. Please stake minimum 0.1 POL to accept orders."
          });
        }
      }
    }
    const updatedDeliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!updatedDeliverer.isStaked && process.env.DEMO_MODE !== 'true') {

      return res.status(400).json({
        error: "Bad Request",
        message: "Deliverer is not staked. Please stake minimum 0.1 POL to accept orders."
      });
    }

    // En mode DEMO, marquer automatiquement comme staké
    if (process.env.DEMO_MODE === 'true' && !updatedDeliverer.isStaked) {
      updatedDeliverer.isStaked = true;
      updatedDeliverer.stakedAmount = 0.1;
      await updatedDeliverer.save();
      console.log('[DEMO_MODE] Auto-staking for accept order:', normalizedAddress);
    }

    order.deliverer = deliverer._id;
    order.status = 'IN_DELIVERY';
    await order.save();
    try {
      const notificationService = require("../services/notificationService");
      const clientAddr = order.client?.address || order.client;
      if (clientAddr) {
        await notificationService.notifyClientOrderUpdate(
          orderId,
          clientAddr,
          'IN_DELIVERY',
          { 
            message: "Your order is being delivered",
            deliverer: {
              name: deliverer.name,
              address: deliverer.address
            }
          }
        );
      }
      const restaurantId = order.restaurant?._id || order.restaurant;
      if (restaurantId) {
        const io = notificationService.getSocketIO();
        if (io) {
          io.to(`restaurant_${restaurantId}`).emit('delivererAssigned', {
            orderId,
            deliverer: {
              name: deliverer.name,
              address: deliverer.address
            }
          });
        }
      }
    } catch (notifError) {
      
    }
    
    
    
    return res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      order: {
        orderId: order.orderId,
        status: order.status,
        deliverer: {
          address: deliverer.address,
          name: deliverer.name
        }
      }
    });
  } catch (error) {
    
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to accept order",
      details: error.message
    });
  }
}

/**
 * Gets deliverer rating and reviews
 * @dev Calculates average rating from all delivered orders with reviews
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getDelivererRating(req, res) {
  try {
    const address = req.params.address || req.userAddress || req.validatedAddress;
    
    const normalizedAddress = address.toLowerCase();
    
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    const ordersWithReviews = await Order.find({
      deliverer: deliverer._id,
      status: 'DELIVERED',
      'review.rating': { $exists: true, $ne: null }
    })
    .populate('client', 'address name')
    .sort({ 'review.createdAt': -1 });
    let averageRating = 0;
    if (ordersWithReviews.length > 0) {
      const sumRatings = ordersWithReviews.reduce((sum, order) => {
        return sum + (order.review?.rating || 0);
      }, 0);
      averageRating = sumRatings / ordersWithReviews.length;
    }
    const reviews = ordersWithReviews.map(order => ({
      orderId: order.orderId,
      rating: order.review?.rating || 0,
      comment: order.review?.comment || '',
      clientName: order.client?.name || 'Client',
      clientAddress: order.client?.address || order.client,
      createdAt: order.review?.createdAt || order.completedAt
    }));
    
    return res.status(200).json({
      success: true,
      rating: parseFloat(averageRating.toFixed(2)),
      totalDeliveries: deliverer.totalDeliveries || 0,
      reviews: reviews
    });
  } catch (error) {
    
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get deliverer rating",
      details: error.message
    });
  }
}

/**
 * Cancel/abandon a delivery (return order to READY status)
 * @dev Allows deliverer to abandon a stuck delivery
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function cancelDelivery(req, res) {
  try {
    const orderId = parseInt(req.params.orderId);
    const address = req.userAddress || req.body.delivererAddress;
    
    if (!address) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Deliverer address is required"
      });
    }
    
    const normalizedAddress = address.toLowerCase();
    
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    const order = await Order.findOne({ orderId, deliverer: deliverer._id });
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: "Order not found or not assigned to this deliverer"
      });
    }
    
    if (order.status !== 'IN_DELIVERY') {
      return res.status(400).json({
        error: "Bad Request",
        message: `Cannot cancel order with status ${order.status}`
      });
    }
    order.status = 'READY';
    order.deliverer = null;
    await order.save();
    
    
    
    return res.status(200).json({
      success: true,
      message: `Order #${orderId} cancelled and returned to READY status`,
      orderId: orderId
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to cancel delivery",
      details: error.message
    });
  }
}

/**
 * Force complete a delivery (mark as DELIVERED)
 * @dev Allows deliverer to force complete a stuck delivery
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function forceCompleteDelivery(req, res) {
  try {
    const orderId = parseInt(req.params.orderId);
    const address = req.userAddress || req.body.delivererAddress;
    
    if (!address) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Deliverer address is required"
      });
    }
    
    const normalizedAddress = address.toLowerCase();
    
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    const order = await Order.findOne({ orderId, deliverer: deliverer._id });
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: "Order not found or not assigned to this deliverer"
      });
    }
    
    if (order.status !== 'IN_DELIVERY') {
      return res.status(400).json({
        error: "Bad Request",
        message: `Cannot force complete order with status ${order.status}`
      });
    }
    order.status = 'DELIVERED';
    order.deliveredAt = new Date();
    await order.save();
    
    
    
    return res.status(200).json({
      success: true,
      message: `Order #${orderId} marked as DELIVERED`,
      orderId: orderId
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to force complete delivery",
      details: error.message
    });
  }
}

/**
 * Gets all active deliveries for a deliverer
 * @dev Returns ALL orders currently being delivered (status IN_DELIVERY)
 * @notice Returns array with all active deliveries, most recent first
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getActiveDelivery(req, res) {
  try {
    const address = req.params.address || req.userAddress || req.validatedAddress;
    
    const normalizedAddress = address.toLowerCase();
    
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    const activeOrders = await Order.find({
      deliverer: deliverer._id,
      status: 'IN_DELIVERY'
    })
    .populate('restaurant', 'name address location')
    .populate('client', 'address name')
    .sort({ createdAt: -1 }); // Plus récentes en premier
    
    
    
    if (activeOrders.length === 0) {
      return res.status(200).json({
        activeDelivery: null,
        allActiveDeliveries: [],
        count: 0
      });
    }
    const formattedOrders = activeOrders.map(order => ({
      orderId: order.orderId,
      restaurant: {
        name: order.restaurant?.name || 'Restaurant',
        address: order.restaurant?.address || order.restaurant,
        location: order.restaurant?.location || null
      },
      client: {
        name: order.client?.name || 'Client',
        address: order.client?.address || order.client
      },
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      items: order.items || [],
      status: order.status,
      createdAt: order.createdAt,
      pickedUpAt: order.pickedUpAt,
      gpsTracking: order.gpsTracking || []
    }));
    return res.status(200).json({
      activeDelivery: formattedOrders[0],  // La plus récente
      allActiveDeliveries: formattedOrders, // Toutes les livraisons actives
      count: formattedOrders.length
    });
  } catch (error) {
    
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get active delivery",
      details: error.message
    });
  }
}

module.exports = {
  registerDeliverer,
  getDeliverer,
  getAvailableDeliverers,
  updateDelivererStatus,
  acceptOrder,
  stakeAsDeliverer,
  unstake,
  getDelivererOrders,
  getDelivererEarnings,
  getDelivererRating,
  cancelDelivery,
  forceCompleteDelivery,
  getActiveDelivery
};
