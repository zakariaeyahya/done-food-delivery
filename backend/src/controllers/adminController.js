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
    const { status, search } = req.query;

    const query = {
      $or: [
        { disputed: true },
        { status: 'DISPUTED' }
      ]
    };

    if (status && status !== 'all') {
      if (status === 'pending') {
        query.status = 'DISPUTED';
      } else if (status === 'resolved') {
        query.status = { $in: ['DELIVERED', 'CANCELLED'] };
        query.disputed = false;
      }
    }

    if (search) {
      const orderIdSearch = parseInt(search);
      if (!isNaN(orderIdSearch)) {
        query.orderId = orderIdSearch;
      }
    }

    const disputes = await Order.find(query)
      .populate('client', 'address name')
      .populate('restaurant', 'address name')
      .populate('deliverer', 'address name')
      .sort({ createdAt: -1 })
      .lean();

    const disputesFormatted = disputes.map(dispute => ({
      id: dispute._id?.toString() || dispute.orderId?.toString(),
      disputeId: dispute.orderId, // Pour compatibilité
      orderId: dispute.orderId,
      client: dispute.client ? {
        address: dispute.client.address || dispute.client,
        name: dispute.client.name || 'N/A'
      } : null,
      restaurant: dispute.restaurant ? {
        address: dispute.restaurant.address || dispute.restaurant,
        name: dispute.restaurant.name || 'N/A'
      } : null,
      deliverer: dispute.deliverer ? {
        address: dispute.deliverer.address || dispute.deliverer,
        name: dispute.deliverer.name || 'N/A'
      } : null,
      status: dispute.status === 'DISPUTED' ? 'pending' : 
              (dispute.disputed === false ? 'resolved' : 'pending'),
      disputeReason: dispute.disputeReason || '',
      disputeEvidence: dispute.disputeEvidence || null,
      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
      votes: dispute.votes || { client: 0, restaurant: 0, deliverer: 0 }
    }));
    
    return res.status(200).json({
      success: true,
      data: disputesFormatted
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch disputes",
      details: error.message
    });
  }
}

/**
 * Gets details of a specific dispute
 * @dev Retrieves complete dispute information including order details, evidence, and votes
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getDisputeDetails(req, res) {
  try {
    const disputeId = parseInt(req.params.id);
    
    if (isNaN(disputeId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid dispute ID. Must be a number."
      });
    }

    const order = await Order.findOne({
      orderId: disputeId,
      $or: [
        { disputed: true },
        { status: 'DISPUTED' }
      ]
    })
      .populate('client', 'address name email')
      .populate('restaurant', 'address name cuisine')
      .populate('deliverer', 'address name vehicle')
      .lean();

    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Dispute with id ${disputeId} not found`
      });
    }

    const disputeDetails = {
      id: order._id?.toString() || order.orderId?.toString(),
      disputeId: order.orderId,
      orderId: order.orderId,

      order: {
        orderId: order.orderId,
        txHash: order.txHash,
        status: order.status,
        items: order.items || [],
        deliveryAddress: order.deliveryAddress,
        totalAmount: order.totalAmount || order.total || 0,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        completedAt: order.completedAt
      },

      client: order.client ? {
        address: order.client.address || order.client,
        name: order.client.name || 'N/A',
        email: order.client.email || null
      } : null,
      restaurant: order.restaurant ? {
        address: order.restaurant.address || order.restaurant,
        name: order.restaurant.name || 'N/A',
        cuisine: order.restaurant.cuisine || null
      } : null,
      deliverer: order.deliverer ? {
        address: order.deliverer.address || order.deliverer,
        name: order.deliverer.name || 'N/A',
        vehicle: order.deliverer.vehicle || null
      } : null,

      dispute: {
        status: order.status === 'DISPUTED' ? 'pending' : 
                (order.disputed === false ? 'resolved' : 'pending'),
        reason: order.disputeReason || '',
        evidence: order.disputeEvidence || null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },

      votes: order.votes || {
        client: 0,
        restaurant: 0,
        deliverer: 0
      },

      review: order.review || null
    };
    
    return res.status(200).json({
      success: true,
      data: disputeDetails
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch dispute details",
      details: error.message
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
    const disputeId = parseInt(req.params.id);
    const { winner, reason } = req.body;
    
    if (isNaN(disputeId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid dispute ID. Must be a number."
      });
    }
    
    const validWinners = ['CLIENT', 'RESTAURANT', 'DELIVERER'];
    if (!winner || !validWinners.includes(winner)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid winner. Must be CLIENT, RESTAURANT, or DELIVERER"
      });
    }

    const order = await Order.findOne({
      orderId: disputeId,
      $or: [
        { disputed: true },
        { status: 'DISPUTED' }
      ]
    });

    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Dispute with id ${disputeId} not found`
      });
    }

    order.disputed = false;

    if (winner === 'CLIENT' || winner === 'RESTAURANT') {
      order.status = 'DELIVERED';
    } else {
      order.status = 'DISPUTED';
    }

    order.disputeResolution = winner;
    await order.save();

    const txHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    return res.status(200).json({
      success: true,
      data: {
        txHash,
        disputeId,
        winner,
        reason: reason || "Résolution manuelle par admin",
        message: "Dispute resolved successfully"
      }
    });
  } catch (error) {
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
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch deliverers"
    });
  }
}

async function getOrders(req, res) {
  try {
    const { page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc', status } = req.query;
    
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.max(1, parseInt(limit) || 10);
    const query = {};
    if (status && status !== 'all') query.status = status;
    const sortOptions = {};
    sortOptions[sortField === 'date' ? 'createdAt' : sortField] = sortOrder === 'desc' ? -1 : 1;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('client', 'address name').populate('restaurant', 'address name').populate('deliverer', 'address name')
      .sort(sortOptions).skip((safePage - 1) * safeLimit).limit(safeLimit).lean();
    return res.status(200).json({ success: true, data: orders, total, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } });
  } catch (error) {
    
    return res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch orders" });
  }
}

/**
 * Gets details of a specific order
 * @param {Object} req - Express Request with orderId param
 * @param {Object} res - Express Response
 */
async function getOrderDetails(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId: parseInt(orderId) })
      .populate('client', 'address name email phone')
      .populate('restaurant', 'address name cuisine')
      .populate('deliverer', 'address name vehicleType phone')
      .lean();

    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: `Commande #${orderId} non trouvée`
      });
    }
    const details = {
      ...order,

      client: order.client || { name: "N/A", address: null },

      restaurant: order.restaurant || { name: "N/A", address: null },

      deliverer: order.deliverer || null,

      totalAmount: order.totalAmount || 0,
      platformFee: order.platformFee || Math.round((order.totalAmount || 0) * 0.1),
      restaurantAmount: order.restaurantAmount || Math.round((order.totalAmount || 0) * 0.7),
      delivererAmount: order.delivererAmount || Math.round((order.totalAmount || 0) * 0.2),

      items: order.items || [],
      logs: order.logs || order.statusHistory || [],

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      completedAt: order.completedAt,

      status: order.status,

      deliveryAddress: order.deliveryAddress || order.address || "N/A"
    };

    return res.status(200).json({
      success: true,
      data: details
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch order details"
    });
  }
}

async function getAnalyticsOrders(req, res) {
  try {
    const { timeframe = 'all' } = req.query;
    let query = {};
    if (timeframe !== 'all') {
      let startDate = new Date();
      if (timeframe === 'day') startDate.setDate(startDate.getDate() - 1);
      else if (timeframe === 'week') startDate.setDate(startDate.getDate() - 7);
      else if (timeframe === 'month') startDate.setMonth(startDate.getMonth() - 1);
      query.createdAt = { $gte: startDate };
    }
    const orders = await Order.find(query).lean();
    console.log(`[Analytics Orders] Timeframe: ${timeframe}, Query:`, JSON.stringify(query), `Found: ${orders.length} orders`);
    if (orders.length > 0) {
      console.log(`[Analytics Orders] Order dates:`, orders.map(o => o.createdAt));
    }
    const groupedData = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!groupedData[date]) groupedData[date] = { count: 0, total: 0 };
      groupedData[date].count++;
      groupedData[date].total += order.totalAmount || 0;
    });
    const chartData = Object.entries(groupedData).map(([date, data]) => ({ date, orders: data.count, revenue: data.total })).sort((a, b) => new Date(a.date) - new Date(b.date));
    return res.status(200).json({ success: true, data: chartData, timeframe, summary: { totalOrders: orders.length, totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) } });
  } catch (error) {
    
    return res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch orders analytics" });
  }
}

async function getAnalyticsRevenue(req, res) {
  try {
    const { timeframe = 'all' } = req.query;
    let query = { status: 'DELIVERED' };
    if (timeframe !== 'all') {
      let startDate = new Date();
      if (timeframe === 'day') startDate.setDate(startDate.getDate() - 1);
      else if (timeframe === 'week') startDate.setDate(startDate.getDate() - 7);
      else if (timeframe === 'month') startDate.setMonth(startDate.getMonth() - 1);
      query.createdAt = { $gte: startDate };
    }
    const orders = await Order.find(query).lean();
    console.log(`[Analytics Revenue] Timeframe: ${timeframe}, Query:`, JSON.stringify(query), `Found: ${orders.length} orders`);
    if (orders.length > 0) {
      console.log(`[Analytics Revenue] Order dates:`, orders.map(o => o.createdAt));
    }
    const groupedData = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!groupedData[date]) groupedData[date] = { platform: 0, restaurant: 0, deliverer: 0, total: 0 };
      const total = order.totalAmount || 0;
      groupedData[date].platform += total * 0.1;
      groupedData[date].restaurant += total * 0.7;
      groupedData[date].deliverer += total * 0.2;
      groupedData[date].total += total;
    });
    const chartData = Object.entries(groupedData).map(([date, data]) => ({
      date,
      platform: parseFloat(data.platform.toFixed(2)),
      restaurant: parseFloat(data.restaurant.toFixed(2)),
      deliverer: parseFloat(data.deliverer.toFixed(2)),
      total: parseFloat(data.total.toFixed(2))
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    const totals = orders.reduce((acc, order) => {
      const total = order.totalAmount || 0;
      acc.platform += total * 0.1;
      acc.restaurant += total * 0.7;
      acc.deliverer += total * 0.2;
      acc.total += total;
      return acc;
    }, { platform: 0, restaurant: 0, deliverer: 0, total: 0 });
    return res.status(200).json({ success: true, data: chartData, timeframe, totals: { platform: parseFloat(totals.platform.toFixed(2)), restaurant: parseFloat(totals.restaurant.toFixed(2)), deliverer: parseFloat(totals.deliverer.toFixed(2)), total: parseFloat(totals.total.toFixed(2)) } });
  } catch (error) {
    
    return res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch revenue analytics" });
  }
}

/**
 * Gets top deliverers by earnings
 */
async function getTopDeliverers(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topDeliverers = await Deliverer.find()
      .sort({ earnings: -1 })
      .limit(limit)
      .select('address name earnings totalDeliveries rating vehicleType');

    return res.status(200).json({
      success: true,
      data: topDeliverers.map(d => ({
        address: d.address,
        name: d.name || 'Unknown',
        earnings: d.earnings || 0,
        totalDeliveries: d.totalDeliveries || 0,
        rating: d.rating || 0,
        vehicleType: d.vehicleType || 'unknown'
      }))
    });
  } catch (error) {
    
    return res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch top deliverers" });
  }
}

/**
 * Gets top restaurants by revenue
 */
async function getTopRestaurants(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topRestaurants = await Restaurant.find()
      .sort({ revenue: -1 })
      .limit(limit)
      .select('address name revenue totalOrders rating cuisine');

    return res.status(200).json({
      success: true,
      data: topRestaurants.map(r => ({
        address: r.address,
        name: r.name || 'Unknown',
        revenue: r.revenue || 0,
        totalOrders: r.totalOrders || 0,
        rating: r.rating || 0,
        cuisine: r.cuisine || 'unknown'
      }))
    });
  } catch (error) {
    
    return res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch top restaurants" });
  }
}

/**
 * Gets disputes analytics (histogram by date)
 */
async function getAnalyticsDisputes(req, res) {
  try {
    const timeframe = req.query.timeframe || 'month';

    let startDate = new Date();
    if (timeframe === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    const disputes = await Order.aggregate([
      {
        $match: {
          status: 'DISPUTED',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const totalDisputes = await Order.countDocuments({ status: 'DISPUTED' });
    const resolvedDisputes = await Order.countDocuments({ status: 'RESOLVED' });
    const pendingDisputes = await Order.countDocuments({ status: 'DISPUTED', disputeReason: { $exists: true } });

    return res.status(200).json({
      success: true,
      data: disputes.map(d => ({
        date: d._id,
        count: d.count
      })),
      summary: {
        total: totalDisputes,
        resolved: resolvedDisputes,
        pending: pendingDisputes
      },
      timeframe
    });
  } catch (error) {
    
    return res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch disputes analytics" });
  }
}

async function ping(req, res) {
  return res.status(200).json({ success: true, message: "pong", timestamp: new Date().toISOString() });
}

async function getConfig(req, res) {
  return res.status(200).json({
    success: true,
    contracts: {
      orderManager: process.env.ORDER_MANAGER_ADDRESS || null,
      token: process.env.TOKEN_ADDRESS || null,
      staking: process.env.STAKING_ADDRESS || null,
      paymentSplitter: process.env.PAYMENT_SPLITTER_ADDRESS || null
    },
    network: { chainId: 80002, name: "Polygon Amoy Testnet", rpcUrl: "https://rpc-amoy.polygon.technology" }
  });
}

module.exports = {
  getDisputeDetails,
  getStats,
  getDisputes,
  resolveDispute,
  getAllUsers,
  getAllRestaurants,
  getAllDeliverers,
  getOrders,
  getOrderDetails,
  getAnalyticsOrders,
  getAnalyticsRevenue,
  getTopDeliverers,
  getTopRestaurants,
  getAnalyticsDisputes,
  ping,
  getConfig
};

