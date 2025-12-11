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
    
    // Valeur par défaut pour location si non fournie (Paris par défaut)
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
    console.error("Error registering deliverer:", error);

    // Gérer les erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid registration data",
        details: validationErrors.join(', ')
      });
    }

    // Gérer les erreurs de doublon
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
    
    // Récupérer le statut de staking depuis la blockchain
    let isStakedBlockchain = false;
    let stakedAmountBlockchain = "0";
    
    try {
      isStakedBlockchain = await blockchainService.isStaked(normalizedAddress);
      
      // Récupérer le montant staké depuis le contrat
      if (isStakedBlockchain) {
        const staking = require("../config/blockchain").getContractInstance("staking");
        const stakedAmountWei = await staking.stakedAmount(normalizedAddress);
        stakedAmountBlockchain = ethers.formatEther(stakedAmountWei);
        
        // Synchroniser avec MongoDB
        if (deliverer.isStaked !== isStakedBlockchain || deliverer.stakedAmount !== parseFloat(stakedAmountBlockchain)) {
          deliverer.isStaked = isStakedBlockchain;
          deliverer.stakedAmount = parseFloat(stakedAmountBlockchain);
          await deliverer.save();
        }
      }
    } catch (blockchainError) {
      console.warn("Error getting staking status from blockchain:", blockchainError.message);
      // En cas d'erreur, utiliser les valeurs MongoDB
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
    console.error("Error getting deliverer:", error);
    
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
    
    console.log(`[Backend] 📋 Récupération commandes disponibles pour livreur (lat: ${lat}, lng: ${lng})...`);
    
    // Récupérer les commandes avec statut PREPARING ou CREATED (pas encore assignées à un livreur)
    // On inclut CREATED au cas où certaines commandes n'ont pas encore été confirmées en préparation
    const availableOrders = await Order.find({
      $or: [
        { status: 'PREPARING', deliverer: null },
        { status: 'CREATED', deliverer: null }
      ]
    })
    .populate('restaurant', 'name address location')
    .populate('client', 'address name')
    .sort({ createdAt: -1 }); // Plus récentes en premier
    
    console.log(`[Backend] ✅ ${availableOrders.length} commande(s) disponible(s) trouvée(s)`);
    
    if (availableOrders.length > 0) {
      console.log(`[Backend]   - Détails des commandes:`, availableOrders.map(o => ({
        orderId: o.orderId,
        status: o.status,
        restaurant: o.restaurant?.name || 'Unknown',
        hasDeliverer: !!o.deliverer
      })));
    } else {
      // Diagnostic : vérifier combien de commandes existent avec différents statuts
      const totalOrders = await Order.countDocuments();
      const preparingOrders = await Order.countDocuments({ status: 'PREPARING' });
      const createdOrders = await Order.countDocuments({ status: 'CREATED' });
      const ordersWithDeliverer = await Order.countDocuments({ deliverer: { $ne: null } });
      
      console.log(`[Backend] 🔍 Diagnostic - Total commandes en DB: ${totalOrders}`);
      console.log(`[Backend]   - Commandes PREPARING: ${preparingOrders}`);
      console.log(`[Backend]   - Commandes CREATED: ${createdOrders}`);
      console.log(`[Backend]   - Commandes avec livreur assigné: ${ordersWithDeliverer}`);
      console.log(`[Backend]   - Commandes sans livreur: ${totalOrders - ordersWithDeliverer}`);
    }
    
    // Formater les commandes pour le frontend
    let formattedOrders = availableOrders.map(order => {
      const orderObj = order.toObject();
      
      // Calculer la distance si location fournie
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
    
    // Trier par distance si location fournie
    if (lat && lng) {
      formattedOrders = formattedOrders
        .filter(order => order.distance !== null)
        .sort((a, b) => a.distance - b.distance);
    }
    
    return res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Error getting available orders:", error);
    
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
    
    console.log(`[Backend] 🔄 Mise à jour statut livreur ${normalizedAddress}: isAvailable=${isAvailable}`);
    
    const updatedDeliverer = await Deliverer.setAvailability(normalizedAddress, isAvailable);
    
    if (!updatedDeliverer) {
      console.log(`[Backend] ❌ Livreur ${normalizedAddress} non trouvé dans la base de données`);
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    console.log(`[Backend] ✅ Statut livreur ${normalizedAddress} mis à jour:`, {
      isAvailable: updatedDeliverer.isAvailable,
      isStaked: updatedDeliverer.isStaked,
      name: updatedDeliverer.name
    });
    
    // Si le livreur devient disponible, vérifier et synchroniser le statut de staking
    if (isAvailable && !updatedDeliverer.isStaked) {
      console.log(`[Backend] 💡 Livreur ${normalizedAddress} devient disponible mais n'est pas staké. Synchronisation blockchain...`);
      try {
        const isStakedBlockchain = await blockchainService.isStaked(normalizedAddress);
        if (isStakedBlockchain) {
          const staking = require("../config/blockchain").getContractInstance("staking");
          const stakedAmountWei = await staking.stakedAmount(normalizedAddress);
          const stakedAmountBlockchain = ethers.formatEther(stakedAmountWei);
          
          updatedDeliverer.isStaked = true;
          updatedDeliverer.stakedAmount = parseFloat(stakedAmountBlockchain);
          await updatedDeliverer.save();
          
          console.log(`[Backend] ✅ Statut de staking synchronisé pour ${normalizedAddress}:`, {
            isStaked: true,
            stakedAmount: stakedAmountBlockchain
          });
        } else {
          console.log(`[Backend] ⚠️ Livreur ${normalizedAddress} n'est pas staké sur la blockchain`);
        }
      } catch (blockchainError) {
        console.warn(`[Backend] ⚠️ Erreur synchronisation staking pour ${normalizedAddress}:`, blockchainError.message);
      }
    }
    
    return res.status(200).json({
      success: true,
      isAvailable: updatedDeliverer.isAvailable,
      isStaked: updatedDeliverer.isStaked
    });
  } catch (error) {
    console.error("Error updating deliverer status:", error);
    
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
    
    // Vérifier que le livreur existe
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    // Valider le montant minimum
    const minimumStake = ethers.parseEther("0.1");
    const stakeAmountWei = ethers.parseEther(amount.toString());
    
    if (stakeAmountWei < minimumStake) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Minimum stake is 0.1 MATIC"
      });
    }
    
    // Vérifier que la clé privée est fournie
    if (!delivererPrivateKey) {
      return res.status(400).json({
        error: "Bad Request",
        message: "delivererPrivateKey is required to sign the transaction"
      });
    }
    
    // Staker sur la blockchain
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.stakeDeliverer(
        normalizedAddress,
        amount.toString(),
        delivererPrivateKey
      );
    } catch (blockchainError) {
      console.error("Error staking on blockchain:", blockchainError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to stake on blockchain",
        details: blockchainError.message
      });
    }
    
    // Synchroniser avec MongoDB
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
    console.error("Error staking deliverer:", error);
    
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
    
    // Vérifier que le livreur existe
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    // Vérifier qu'il n'y a pas de commandes actives
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
    
    // Vérifier que la clé privée est fournie
    if (!delivererPrivateKey) {
      return res.status(400).json({
        error: "Bad Request",
        message: "delivererPrivateKey is required to sign the transaction"
      });
    }
    
    // Unstake sur la blockchain
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.unstake(
        normalizedAddress,
        delivererPrivateKey
      );
    } catch (blockchainError) {
      console.error("Error unstaking on blockchain:", blockchainError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to unstake on blockchain",
        details: blockchainError.message
      });
    }
    
    // Synchroniser avec MongoDB
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
    console.error("Error unstaking deliverer:", error);
    
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
    
    return res.status(200).json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error("Error getting deliverer orders:", error);
    
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
    
    const { startDate, endDate } = req.query;
    
    const query = { 
      deliverer: deliverer._id,
      status: 'DELIVERED'
    };
    
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(query);
    
    const totalEarnings = orders.reduce((sum, order) => {
      const deliveryFeeMATIC = parseFloat(order.deliveryFee) / 1e18;
      return sum + (deliveryFeeMATIC * 0.2);
    }, 0);
    
    const completedDeliveries = orders.length;
    const averageEarning = completedDeliveries > 0 ? totalEarnings / completedDeliveries : 0;
    
    return res.status(200).json({
      success: true,
      earnings: {
        totalEarnings: parseFloat(totalEarnings.toFixed(4)),
        completedDeliveries,
        averageEarning: parseFloat(averageEarning.toFixed(4))
      }
    });
  } catch (error) {
    console.error("Error getting deliverer earnings:", error);
    
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
    
    console.log(`[Backend] 📥 Acceptation commande #${orderId} par livreur...`);
    console.log(`[Backend]   - orderId: ${orderId} (type: ${typeof orderId})`);
    console.log(`[Backend]   - req.userAddress: ${req.userAddress}`);
    console.log(`[Backend]   - req.body.delivererAddress: ${req.body?.delivererAddress}`);
    console.log(`[Backend]   - delivererAddress final: ${delivererAddress}`);
    
    if (!orderId || isNaN(orderId)) {
      console.log(`[Backend] ❌ Order ID invalide: ${orderId}`);
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid order ID"
      });
    }
    
    if (!delivererAddress) {
      console.log(`[Backend] ❌ Adresse livreur manquante`);
      return res.status(400).json({
        error: "Bad Request",
        message: "Deliverer address is required"
      });
    }
    
    const normalizedAddress = delivererAddress.toLowerCase();
    console.log(`[Backend]   - Adresse normalisée: ${normalizedAddress}`);
    
    // Vérifier que la commande existe
    console.log(`[Backend] 🔍 Recherche commande #${orderId}...`);
    const order = await Order.findOne({ orderId })
      .populate('restaurant', 'name address')
      .populate('client', 'address');
      
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
      hasDeliverer: !!order.deliverer,
      delivererId: order.deliverer
    });
    
    // Vérifier le statut
    if (order.status !== 'PREPARING' && order.status !== 'CREATED') {
      console.log(`[Backend] ❌ Statut invalide: ${order.status} (attendu: PREPARING ou CREATED)`);
      return res.status(400).json({
        error: "Bad Request",
        message: `Order status must be PREPARING or CREATED, current status: ${order.status}`
      });
    }
    
    // Vérifier que la commande n'est pas déjà assignée
    if (order.deliverer) {
      console.log(`[Backend] ❌ Commande déjà assignée à un livreur: ${order.deliverer}`);
      return res.status(400).json({
        error: "Bad Request",
        message: "Order is already assigned to a deliverer"
      });
    }
    
    // Vérifier que le livreur existe et est disponible
    console.log(`[Backend] 🔍 Recherche livreur ${normalizedAddress}...`);
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      console.log(`[Backend] ❌ Livreur ${normalizedAddress} non trouvé`);
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found. Please register first."
      });
    }
    
    console.log(`[Backend] ✅ Livreur trouvé:`, {
      address: deliverer.address,
      name: deliverer.name,
      isAvailable: deliverer.isAvailable,
      isStaked: deliverer.isStaked
    });
    
    if (!deliverer.isAvailable) {
      console.log(`[Backend] ❌ Livreur non disponible (isAvailable: ${deliverer.isAvailable})`);
      return res.status(400).json({
        error: "Bad Request",
        message: "Deliverer is not available. Please set your status to online."
      });
    }
    
    // Synchroniser le statut de staking depuis la blockchain avant de vérifier
    if (!deliverer.isStaked) {
      console.log(`[Backend] 💡 Livreur marqué non staké dans DB, synchronisation blockchain...`);
      try {
        const isStakedBlockchain = await blockchainService.isStaked(normalizedAddress);
        if (isStakedBlockchain) {
          const staking = require("../config/blockchain").getContractInstance("staking");
          const stakedAmountWei = await staking.stakedAmount(normalizedAddress);
          const stakedAmountBlockchain = ethers.formatEther(stakedAmountWei);
          
          deliverer.isStaked = true;
          deliverer.stakedAmount = parseFloat(stakedAmountBlockchain);
          await deliverer.save();
          
          console.log(`[Backend] ✅ Statut de staking synchronisé depuis blockchain:`, {
            isStaked: true,
            stakedAmount: stakedAmountBlockchain
          });
        } else {
          console.log(`[Backend] ❌ Livreur non staké sur la blockchain`);
          // En mode dev, permettre quand même si disponible
          if (process.env.NODE_ENV === 'development' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true') {
            console.log(`[Backend] 💡 Mode dev: Permettre acceptation même si non staké sur blockchain`);
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
        // Gérer les erreurs RPC communes
        const isRpcError = blockchainError.code === -32002 || 
                          blockchainError.message?.includes('too many errors') ||
                          blockchainError.message?.includes('missing revert data') ||
                          blockchainError.message?.includes('CALL_EXCEPTION');
        
        // En mode dev ou si erreur RPC, permettre de continuer si le livreur est disponible
        if (process.env.NODE_ENV === 'development' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || isRpcError) {
          console.warn(`[Backend] ⚠️ Erreur synchronisation staking (${isRpcError ? 'RPC error' : 'mode dev'}):`, blockchainError.message);
          console.log(`[Backend] 💡 Permettre acceptation même si blockchain inaccessible`);
          // Considérer comme staké si disponible
          if (deliverer.isAvailable) {
            deliverer.isStaked = true;
            await deliverer.save();
            console.log(`[Backend] ✅ Livreur considéré comme staké (mode dev/RPC error)`);
          }
        } else {
          console.log(`[Backend] ❌ Erreur synchronisation staking:`, blockchainError.message);
          return res.status(400).json({
            error: "Bad Request",
            message: "Deliverer is not staked. Please stake minimum 0.1 POL to accept orders."
          });
        }
      }
    }
    
    // Recharger le livreur depuis la DB pour avoir les valeurs à jour
    const updatedDeliverer = await Deliverer.findByAddress(normalizedAddress);
    
    // Vérifier à nouveau après synchronisation
    if (!updatedDeliverer.isStaked) {
      console.log(`[Backend] ❌ Livreur non staké après synchronisation (isStaked: ${updatedDeliverer.isStaked})`);
      return res.status(400).json({
        error: "Bad Request",
        message: "Deliverer is not staked. Please stake minimum 0.1 POL to accept orders."
      });
    }
    
    console.log(`[Backend] ✅ Livreur vérifié et prêt:`, {
      isAvailable: updatedDeliverer.isAvailable,
      isStaked: updatedDeliverer.isStaked
    });
    
    // Assigner le livreur à la commande
    order.deliverer = deliverer._id;
    order.status = 'IN_DELIVERY';
    await order.save();
    
    // Notifier le client et le restaurant
    try {
      const notificationService = require("../services/notificationService");
      
      // Notifier le client
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
      
      // Notifier le restaurant
      const restaurantId = order.restaurant?._id || order.restaurant;
      if (restaurantId) {
        // Émettre un événement Socket.io pour le restaurant
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
      console.warn("Error sending notifications:", notifError);
    }
    
    console.log(`[Backend] ✅ Commande #${orderId} acceptée par livreur ${normalizedAddress}`);
    
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
    console.error("Error accepting order:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to accept order",
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
  getDelivererEarnings
};
