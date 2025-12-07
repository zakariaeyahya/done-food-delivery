const gpsTracker = require("../utils/gpsTracker");
const Deliverer = require("../models/Deliverer");
const Order = require("../models/Order");
const { ethers } = require("ethers");

/**
 * Controller for managing deliverers
 * @notice Manages registration, staking, availability and earnings of deliverers
 * @dev Uses MongoDB only for Phase 6 (mocks for staking)
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
    
    const deliverer = new Deliverer({
      address: address.toLowerCase(),
      name,
      phone,
      vehicleType: vehicleType || 'bike',
      currentLocation: {
        lat: location.lat,
        lng: location.lng,
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
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to register deliverer",
      details: error.message
    });
  }
}

/**
 * Gets deliverer details
 * @dev Implemented - MongoDB only (without blockchain synchronization)
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
    
    return res.status(200).json({
      success: true,
      deliverer: {
        address: deliverer.address,
        name: deliverer.name,
        phone: deliverer.phone,
        vehicleType: deliverer.vehicleType,
        currentLocation: deliverer.currentLocation,
        isAvailable: deliverer.isAvailable,
        isStaked: deliverer.isStaked,
        stakedAmount: deliverer.stakedAmount,
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
 * Gets available deliverers
 * @dev Implemented - MongoDB only (without blockchain verification)
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getAvailableDeliverers(req, res) {
  try {
    const { location } = req.query;
    
    const deliverers = await Deliverer.getAvailableDeliverers();
    
    let availableDeliverers = deliverers.map(d => d.toObject());
    if (location) {
      try {
        const locationData = typeof location === 'string' ? JSON.parse(location) : location;
        const { lat, lng, maxDistance } = locationData;
        
        availableDeliverers.forEach(deliverer => {
          deliverer.distance = gpsTracker.calculateDistance(
            lat,
            lng,
            deliverer.currentLocation.lat,
            deliverer.currentLocation.lng
          );
        });
        
        availableDeliverers = availableDeliverers
          .filter(d => d.distance <= (maxDistance || 10))
          .sort((a, b) => a.distance - b.distance);
      } catch (parseError) {
        console.warn("Error parsing location filter:", parseError);
      }
    }
    
    return res.status(200).json({
      success: true,
      deliverers: availableDeliverers.map(d => ({
        address: d.address,
        name: d.name,
        vehicleType: d.vehicleType,
        currentLocation: d.currentLocation,
        rating: d.rating,
        distance: d.distance || null
      }))
    });
  } catch (error) {
    console.error("Error getting available deliverers:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get available deliverers",
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
    
    return res.status(200).json({
      success: true,
      isAvailable: updatedDeliverer.isAvailable
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
 * @dev Temporary mock - Saves to MongoDB only (Phase 6)
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function stakeAsDeliverer(req, res) {
  try {
    const { address, amount } = req.body;
    
    const normalizedAddress = address.toLowerCase();
    
    const minimumStake = ethers.parseEther("0.1");
    const stakeAmountWei = ethers.parseEther(amount.toString());
    
    if (stakeAmountWei < minimumStake) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Minimum stake is 0.1 ETH"
      });
    }
    
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
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
      message: "Stake saved in MongoDB (mock - blockchain not available)",
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
 * @dev Temporary mock - MongoDB only (Phase 6)
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function unstake(req, res) {
  try {
    const address = req.body.address || req.userAddress || req.validatedAddress;
    
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
      message: "Unstake saved in MongoDB (mock - blockchain not available)",
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

module.exports = {
  registerDeliverer,
  getDeliverer,
  getAvailableDeliverers,
  updateDelivererStatus,
  stakeAsDeliverer,
  unstake,
  getDelivererOrders,
  getDelivererEarnings
};
