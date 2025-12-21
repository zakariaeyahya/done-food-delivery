const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");
const Order = require("../models/Order");

/**
 * Controller for managing analytics and advanced statistics
 * @notice Manages dashboards, order analytics, revenue and users
 * @dev Uses MongoDB for off-chain data and blockchainService for on-chain data
 */

/**
 * Utility function to calculate start date based on period
 * @param {string} period - 'day', 'week', 'month', 'year'
 * @returns {Date} Start date
 */
function calculateStartDate(period) {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 7); // Default: week
  }
  
  return start;
}

/**
 * Utility function to calculate growth percentage
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {string} Formatted growth percentage
 */
function calculateGrowthPercentage(current, previous) {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const growth = ((current - previous) / previous) * 100;
  return growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
}

/**
 * Gets complete analytics dashboard
 * @dev Combines global stats and charts
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getDashboard(req, res) {
  try {
    const totalOrders = await Order.countDocuments();
    
    const deliveredOrders = await Order.find({ status: 'DELIVERED' });
    const gmv = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const platformRevenue = deliveredOrders.reduce((sum, order) => sum + (order.platformFee || 0), 0);
    
    const stats = {
      totalOrders,
      gmv: gmv.toString(),
      platformRevenue: platformRevenue.toString()
    };
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const ordersOverTime = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 }
      }},
      { $sort: { _id: 1 } },
      { $project: {
        date: '$_id',
        orders: 1,
        _id: 0
      }}
    ]);
    
    const revenueOverTime = await Order.aggregate([
      { $match: { status: 'DELIVERED', createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$platformFee' }
      }},
      { $sort: { _id: 1 } },
      { $project: {
        date: '$_id',
        revenue: { $toString: '$revenue' },
        _id: 0
      }}
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        stats,
        charts: {
          ordersOverTime,
          revenueOverTime
        }
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch dashboard analytics"
    });
  }
}

/**
 * Gets order analytics over time
 * @dev MongoDB aggregation by period
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getOrdersAnalytics(req, res) {
  try {
    const period = req.query.period || 'week';
    
    const startDate = calculateStartDate(period);
    
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        avgValue: { $avg: '$totalAmount' }
      }},
      { $sort: { _id: 1 } },
      { $project: {
        date: '$_id',
        orders: 1,
        avgValue: { $toString: '$avgValue' },
        _id: 0
      }}
    ]);
    
    const total = await Order.countDocuments({ createdAt: { $gte: startDate } });
    
    const periodDuration = startDate.getTime() - Date.now();
    const previousPeriodStart = new Date(startDate.getTime() + periodDuration);
    const previousTotal = await Order.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    });
    const growth = calculateGrowthPercentage(total, previousTotal);
    
    return res.status(200).json({
      success: true,
      data: {
        period,
        data,
        total,
        growth
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch orders analytics"
    });
  }
}

/**
 * Gets platform revenue analytics
 * @dev Fetches PaymentSplit events from blockchain
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getRevenueAnalytics(req, res) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    const deliveredOrders = await Order.find({
      status: 'DELIVERED',
      completedAt: { $gte: startDate, $lte: endDate }
    });
    
    let totalRevenue = 0;
    const breakdown = { platformFee: 0, restaurants: 0, deliverers: 0 };
    
    deliveredOrders.forEach(order => {
      const totalAmount = order.totalAmount || 0;
      totalRevenue += totalAmount;
      breakdown.platformFee += order.platformFee || (totalAmount * 0.1); // 10%
      breakdown.restaurants += totalAmount * 0.7; // 70%
      breakdown.deliverers += totalAmount * 0.2;
    });
    
    const timeline = await Order.aggregate([
      { $match: { status: 'DELIVERED', completedAt: { $gte: startDate, $lte: endDate } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
        revenue: { $sum: '$platformFee' }
      }},
      { $sort: { _id: 1 } },
      { $project: {
        date: '$_id',
        revenue: { $toString: '$revenue' },
        _id: 0
      }}
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue.toString(),
        breakdown: {
          platformFee: breakdown.platformFee.toString(),
          restaurants: breakdown.restaurants.toString(),
          deliverers: breakdown.deliverers.toString()
        },
        timeline
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch revenue analytics"
    });
  }
}

/**
 * Gets user analytics (growth, distribution)
 * @dev MongoDB aggregations for growth and top spenders
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getUsersAnalytics(req, res) {
  try {
    const growth = {
      clients: [],
      restaurants: [],
      deliverers: []
    };
    
    for (let i = 0; i < 4; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - (i + 1));
      const monthEnd = new Date();
      monthEnd.setMonth(monthEnd.getMonth() - i);
      
      growth.clients[i] = await User.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });
      growth.restaurants[i] = await Restaurant.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });
      growth.deliverers[i] = await Deliverer.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });
    }
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const activeClients = await Order.distinct('client', {
      createdAt: { $gte: todayStart }
    });
    const activeRestaurants = await Order.distinct('restaurant', {
      createdAt: { $gte: todayStart }
    });
    const activeDeliverers = await Order.distinct('deliverer', {
      createdAt: { $gte: todayStart }
    });
    
    const activeToday = {
      clients: activeClients.length,
      restaurants: activeRestaurants.length,
      deliverers: activeDeliverers.length
    };
    
    const topSpenders = await Order.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: {
        _id: '$client',
        spent: { $sum: '$totalAmount' }
      }},
      { $sort: { spent: -1 } },
      { $limit: 10 },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }},
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: {
        address: { $ifNull: ['$user.address', 'Unknown'] },
        name: { $ifNull: ['$user.name', 'Unknown'] },
        spent: { $toString: '$spent' },
        _id: 0
      }}
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        growth,
        activeToday,
        topSpenders
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch users analytics"
    });
  }
}

module.exports = {
  getDashboard,
  getOrdersAnalytics,
  getRevenueAnalytics,
  getUsersAnalytics
};

