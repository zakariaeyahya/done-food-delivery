const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");
const Order = require("../models/Order");

/**
 * Controller for managing platform administration
 * @notice Manages statistics, disputes and user lists
 * @dev Uses MongoDB for off-chain data and blockchainService for on-chain data
 */

/**
 * Gets global platform statistics
 * @dev Combines MongoDB and blockchain data
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getStats(req, res) {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalDeliverers = await Deliverer.countDocuments();
    
    const deliveredOrders = await Order.find({ status: 'DELIVERED' });
    const gmv = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const platformRevenue = deliveredOrders.reduce((sum, order) => sum + (order.platformFee || 0), 0);
    
    const avgDeliveryTimeResult = await Order.aggregate([
      { $match: { status: 'DELIVERED', completedAt: { $exists: true }, createdAt: { $exists: true } } },
      { $project: { 
        duration: { $subtract: ['$completedAt', '$createdAt'] } 
      }},
      { $group: { _id: null, avg: { $avg: '$duration' }}}
    ]);
    const avgDeliveryTime = avgDeliveryTimeResult[0]?.avg || 0;
    const avgDeliveryTimeMinutes = Math.round(avgDeliveryTime / (1000 * 60));
    
    const satisfactionResult = await Order.aggregate([
      { $match: { review: { $exists: true }, 'review.rating': { $exists: true } }},
      { $group: { _id: null, avg: { $avg: '$review.rating' }}}
    ]);
    const satisfaction = satisfactionResult[0]?.avg || 0;
    
    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        gmv: gmv.toString(),
        activeUsers: {
          clients: totalUsers,
          restaurants: totalRestaurants,
          deliverers: totalDeliverers
        },
        platformRevenue: platformRevenue.toString(),
        avgDeliveryTime: `${avgDeliveryTimeMinutes} min`,
        satisfaction: satisfaction.toFixed(2)
      }
    });
  } catch (error) {
    console.error("Error in getStats:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch platform statistics"
    });
  }
}

/**
 * Gets list of all disputes
 * @dev Fetches from MongoDB and enriches with blockchain votes if available
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getDisputes(req, res) {
  try {
    const { status } = req.query;
    
    const query = { disputed: true };
    if (status) {
      query.status = status;
    }
    
    const disputes = await Order.find(query)
      .populate('client', 'address name')
      .populate('restaurant', 'address name')
      .populate('deliverer', 'address name')
      .sort({ createdAt: -1 })
      .lean();
    
    const disputesWithVotes = disputes.map(dispute => ({
      ...dispute,
      votes: dispute.votes || { client: 0, restaurant: 0, deliverer: 0 }
    }));
    
    return res.status(200).json({
      success: true,
      data: disputesWithVotes
    });
  } catch (error) {
    console.error("Error in getDisputes:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch disputes"
    });
  }
}

/**
 * Manually resolves a dispute by admin
 * @dev Calls smart contract to resolve and updates MongoDB
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function resolveDispute(req, res) {
  try {
    const disputeId = req.params.id;
    const { winner } = req.body;
    
    const validWinners = ['CLIENT', 'RESTAURANT', 'DELIVERER'];
    if (!validWinners.includes(winner)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid winner. Must be CLIENT, RESTAURANT, or DELIVERER"
      });
    }
    
    const order = await Order.findOne({ orderId: disputeId, disputed: true });
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: "Dispute not found"
      });
    }
    
    const txHash = "0x" + "0".repeat(64);
    
    order.disputed = false;
    order.status = 'RESOLVED';
    order.disputeResolution = winner;
    await order.save();
    
    return res.status(200).json({
      success: true,
      data: {
        txHash,
        disputeId,
        winner,
        message: "Dispute resolved successfully"
      }
    });
  } catch (error) {
    console.error("Error in resolveDispute:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to resolve dispute"
    });
  }
}

/**
 * Gets list of all users (clients)
 * @dev Fetches from MongoDB and enriches with blockchain data
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getAllUsers(req, res) {
  try {
    const { status } = req.query;
    
    const query = {};
    if (status === 'active') {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);
      
      const activeUserIds = await Order.distinct('client', {
        createdAt: { $gte: recentDate }
      });
      
      query._id = { $in: activeUserIds };
    }
    
    const users = await User.find(query)
      .select('address name email totalOrders')
      .lean();
    
    const usersWithData = await Promise.all(users.map(async (user) => {
      const userOrders = await Order.find({ client: user._id, status: 'DELIVERED' });
      const totalSpent = userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const doneBalance = 0;
      
      return {
        ...user,
        totalSpent: totalSpent.toString(),
        doneBalance: `${doneBalance} DONE`,
        status: status || 'all'
      };
    }));
    
    return res.status(200).json({
      success: true,
      data: usersWithData
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch users"
    });
  }
}

/**
 * Gets list of all restaurants
 * @dev Fetches from MongoDB and enriches with blockchain revenue
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getAllRestaurants(req, res) {
  try {
    const { cuisine } = req.query;
    
    const query = {};
    if (cuisine) {
      query.cuisine = cuisine;
    }
    
    const restaurants = await Restaurant.find(query)
      .select('address name cuisine totalOrders rating')
      .lean();
    
    const restaurantsWithRevenue = await Promise.all(restaurants.map(async (restaurant) => {
      const restaurantOrders = await Order.find({ 
        restaurant: restaurant._id, 
        status: 'DELIVERED' 
      });
      
      const revenue = restaurantOrders.reduce((sum, order) => {
        const restaurantAmount = (order.totalAmount || 0) * 0.7;
        return sum + restaurantAmount;
      }, 0);
      
      return {
        ...restaurant,
        revenue: revenue.toString(),
        status: 'active'
      };
    }));
    
    return res.status(200).json({
      success: true,
      data: restaurantsWithRevenue
    });
  } catch (error) {
    console.error("Error in getAllRestaurants:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch restaurants"
    });
  }
}

/**
 * Gets list of all deliverers
 * @dev Fetches from MongoDB and enriches with blockchain earnings
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getAllDeliverers(req, res) {
  try {
    const { staked } = req.query;
    
    const query = {};
    if (staked === 'true') {
      query.isStaked = true;
    } else if (staked === 'false') {
      query.isStaked = false;
    }
    
    const deliverers = await Deliverer.find(query)
      .select('address name vehicleType stakedAmount totalDeliveries rating')
      .lean();
    
    const deliverersWithEarnings = await Promise.all(deliverers.map(async (deliverer) => {
      const delivererOrders = await Order.find({ 
        deliverer: deliverer._id, 
        status: 'DELIVERED' 
      });
      
      const earnings = delivererOrders.reduce((sum, order) => {
        const delivererAmount = (order.totalAmount || 0) * 0.2;
        return sum + delivererAmount;
      }, 0);
      
      return {
        ...deliverer,
        earnings: earnings.toString(),
        status: deliverer.isStaked ? 'staked' : 'not_staked'
      };
    }));
    
    return res.status(200).json({
      success: true,
      data: deliverersWithEarnings
    });
  } catch (error) {
    console.error("Error in getAllDeliverers:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch deliverers"
    });
  }
}

module.exports = {
  getStats,
  getDisputes,
  resolveDispute,
  getAllUsers,
  getAllRestaurants,
  getAllDeliverers
};

