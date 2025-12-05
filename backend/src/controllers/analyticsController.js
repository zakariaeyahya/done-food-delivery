// Importer les modèles MongoDB
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");
const Order = require("../models/Order");

// Importer le service blockchain (pour les parties blockchain)
// const blockchainService = require("../services/blockchainService");

/**
 * Controller pour gérer les analytics et statistiques avancées
 * @notice Gère les dashboards, analytics commandes, revenus et utilisateurs
 * @dev Utilise MongoDB pour les données off-chain et blockchainService pour les données on-chain
 */

/**
 * Fonction utilitaire pour calculer la date de début selon la période
 * @param {string} period - 'day', 'week', 'month', 'year'
 * @returns {Date} Date de début
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
 * Fonction utilitaire pour calculer le pourcentage de croissance
 * @param {number} current - Valeur actuelle
 * @param {number} previous - Valeur précédente
 * @returns {string} Pourcentage de croissance formaté
 */
function calculateGrowthPercentage(current, previous) {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const growth = ((current - previous) / previous) * 100;
  return growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
}

/**
 * Récupère le dashboard analytics complet
 * @dev Combine stats globales et charts
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getDashboard(req, res) {
  try {
    // Stats globales
    const totalOrders = await Order.countDocuments();
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
    // const gmv = await blockchainService.getTotalGMV();
    // const platformRevenue = await blockchainService.getPlatformRevenue();
    // Pour l'instant, calcul depuis MongoDB
    const deliveredOrders = await Order.find({ status: 'DELIVERED' });
    const gmv = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const platformRevenue = deliveredOrders.reduce((sum, order) => sum + (order.platformFee || 0), 0);
    
    const stats = {
      totalOrders,
      gmv: gmv.toString(),
      platformRevenue: platformRevenue.toString()
    };
    
    // Charts: Commandes dans le temps (7 derniers jours)
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
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
    // Charts: Revenus dans le temps
    // const revenueOverTime = await blockchainService.getRevenueTimeline(7 days);
    // Pour l'instant, calcul depuis MongoDB
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
    console.error("Error in getDashboard:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch dashboard analytics"
    });
  }
}

/**
 * Récupère les analytics des commandes dans le temps
 * @dev Aggrégation MongoDB par période
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getOrdersAnalytics(req, res) {
  try {
    const period = req.query.period || 'week'; // day/week/month/year
    
    // Calculer date de début selon période
    const startDate = calculateStartDate(period);
    
    // Aggrégation par date
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
    
    // Total période
    const total = await Order.countDocuments({ createdAt: { $gte: startDate } });
    
    // Calcul croissance (comparer avec période précédente)
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
    console.error("Error in getOrdersAnalytics:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch orders analytics"
    });
  }
}

/**
 * Récupère les analytics des revenus plateforme
 * @dev Fetch events PaymentSplit depuis blockchain
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getRevenueAnalytics(req, res) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
    // Fetch events PaymentSplit depuis blockchain
    // const paymentEvents = await blockchainService.getPaymentSplitEvents(startDate, endDate);
    // Pour l'instant, calcul depuis MongoDB
    const deliveredOrders = await Order.find({
      status: 'DELIVERED',
      completedAt: { $gte: startDate, $lte: endDate }
    });
    
    // Calculer breakdown
    let totalRevenue = 0;
    const breakdown = { platformFee: 0, restaurants: 0, deliverers: 0 };
    
    deliveredOrders.forEach(order => {
      const totalAmount = order.totalAmount || 0;
      totalRevenue += totalAmount;
      breakdown.platformFee += order.platformFee || (totalAmount * 0.1); // 10%
      breakdown.restaurants += totalAmount * 0.7; // 70%
      breakdown.deliverers += totalAmount * 0.2; // 20%
    });
    
    // Timeline par jour
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
    console.error("Error in getRevenueAnalytics:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch revenue analytics"
    });
  }
}

/**
 * Récupère les analytics des utilisateurs (growth, distribution)
 * @dev Aggrégations MongoDB pour croissance et top spenders
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getUsersAnalytics(req, res) {
  try {
    // Growth: Utilisateurs par mois (4 derniers mois)
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
    
    // Actifs aujourd'hui
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
    
    // Top spenders
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
    console.error("Error in getUsersAnalytics:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch users analytics"
    });
  }
}

// Exporter toutes les fonctions
module.exports = {
  getDashboard,
  getOrdersAnalytics,
  getRevenueAnalytics,
  getUsersAnalytics
};

