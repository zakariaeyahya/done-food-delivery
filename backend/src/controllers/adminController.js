// Importer les modèles MongoDB
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");
const Order = require("../models/Order");

// Importer le service blockchain (pour les parties blockchain)
// const blockchainService = require("../services/blockchainService");

/**
 * Controller pour gérer l'administration de la plateforme
 * @notice Gère les statistiques, litiges et listes d'utilisateurs
 * @dev Utilise MongoDB pour les données off-chain et blockchainService pour les données on-chain
 */

/**
 * Récupère les statistiques globales de la plateforme
 * @dev Combine données MongoDB et blockchain
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getStats(req, res) {
  try {
    // Aggrégations MongoDB
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalDeliverers = await Deliverer.countDocuments();
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
    // Calcul GMV depuis blockchain events PaymentSplit
    // const gmv = await blockchainService.getTotalGMV();
    // Pour l'instant, calcul depuis MongoDB
    const deliveredOrders = await Order.find({ status: 'DELIVERED' });
    const gmv = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
    // Calcul revenus plateforme (10% de toutes les commandes)
    // const platformRevenue = await blockchainService.getPlatformRevenue();
    // Pour l'instant, calcul depuis MongoDB
    const platformRevenue = deliveredOrders.reduce((sum, order) => sum + (order.platformFee || 0), 0);
    
    // Temps moyen livraison depuis MongoDB
    const avgDeliveryTimeResult = await Order.aggregate([
      { $match: { status: 'DELIVERED', completedAt: { $exists: true }, createdAt: { $exists: true } } },
      { $project: { 
        duration: { $subtract: ['$completedAt', '$createdAt'] } 
      }},
      { $group: { _id: null, avg: { $avg: '$duration' }}}
    ]);
    const avgDeliveryTime = avgDeliveryTimeResult[0]?.avg || 0;
    const avgDeliveryTimeMinutes = Math.round(avgDeliveryTime / (1000 * 60)); // Convertir en minutes
    
    // Satisfaction moyenne depuis reviews
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
 * Récupère la liste de tous les litiges
 * @dev Fetch depuis MongoDB et enrichit avec votes blockchain si disponible
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getDisputes(req, res) {
  try {
    const { status } = req.query; // Optionnel: VOTING, RESOLVED, etc.
    
    // Fetch disputes depuis MongoDB
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
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement DoneArbitration
    // Enrichir avec votes depuis blockchain (si DoneArbitration existe)
    // for (let dispute of disputes) {
    //   dispute.votes = await blockchainService.getDisputeVotes(dispute.orderId);
    // }
    // Pour l'instant, votes vides
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
 * Résout manuellement un litige par admin
 * @dev Appelle smart contract pour résoudre et update MongoDB
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function resolveDispute(req, res) {
  try {
    const disputeId = req.params.id;
    const { winner } = req.body; // CLIENT, RESTAURANT, ou DELIVERER
    
    // Vérifier que winner est valide
    const validWinners = ['CLIENT', 'RESTAURANT', 'DELIVERER'];
    if (!validWinners.includes(winner)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid winner. Must be CLIENT, RESTAURANT, or DELIVERER"
      });
    }
    
    // Vérifier dispute existe
    const order = await Order.findOne({ orderId: disputeId, disputed: true });
    if (!order) {
      return res.status(404).json({
        error: "Not Found",
        message: "Dispute not found"
      });
    }
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
    // Appeler smart contract pour résoudre
    // const txHash = await blockchainService.resolveDispute(disputeId, winner);
    // Pour l'instant, mock
    const txHash = "0x" + "0".repeat(64); // Mock transaction hash
    
    // Update MongoDB
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
 * Récupère la liste de tous les utilisateurs (clients)
 * @dev Fetch depuis MongoDB et enrichit avec données blockchain
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getAllUsers(req, res) {
  try {
    const { status } = req.query; // Optionnel: 'active'
    
    const query = {};
    if (status === 'active') {
      // Utilisateurs avec commandes récentes (30 derniers jours)
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
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
    // Enrichir avec données blockchain
    // for (let user of users) {
    //   user.totalSpent = await blockchainService.getUserTotalSpent(user.address);
    //   user.doneBalance = await blockchainService.getTokenBalance(user.address);
    // }
    // Pour l'instant, calcul depuis MongoDB
    const usersWithData = await Promise.all(users.map(async (user) => {
      const userOrders = await Order.find({ client: user._id, status: 'DELIVERED' });
      const totalSpent = userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // ⏳ PSEUDOCODE BLOCKCHAIN
      // const doneBalance = await blockchainService.getTokenBalance(user.address);
      const doneBalance = 0; // Mock pour l'instant
      
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
 * Récupère la liste de tous les restaurants
 * @dev Fetch depuis MongoDB et enrichit avec revenus blockchain
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getAllRestaurants(req, res) {
  try {
    const { cuisine } = req.query; // Optionnel
    
    const query = {};
    if (cuisine) {
      query.cuisine = cuisine;
    }
    
    const restaurants = await Restaurant.find(query)
      .select('address name cuisine totalOrders rating')
      .lean();
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
    // Enrichir avec revenus blockchain
    // for (let restaurant of restaurants) {
    //   restaurant.revenue = await blockchainService.getRestaurantRevenue(restaurant.address);
    // }
    // Pour l'instant, calcul depuis MongoDB
    const restaurantsWithRevenue = await Promise.all(restaurants.map(async (restaurant) => {
      const restaurantOrders = await Order.find({ 
        restaurant: restaurant._id, 
        status: 'DELIVERED' 
      });
      
      // Calculer revenus (70% de chaque commande)
      const revenue = restaurantOrders.reduce((sum, order) => {
        const restaurantAmount = (order.totalAmount || 0) * 0.7; // 70% pour restaurant
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
 * Récupère la liste de tous les livreurs
 * @dev Fetch depuis MongoDB et enrichit avec earnings blockchain
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getAllDeliverers(req, res) {
  try {
    const { staked } = req.query; // Optionnel: 'true' ou 'false'
    
    const query = {};
    if (staked === 'true') {
      query.isStaked = true;
    } else if (staked === 'false') {
      query.isStaked = false;
    }
    
    const deliverers = await Deliverer.find(query)
      .select('address name vehicleType stakedAmount totalDeliveries rating')
      .lean();
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
    // Enrichir avec earnings blockchain
    // for (let deliverer of deliverers) {
    //   deliverer.earnings = await blockchainService.getDelivererEarnings(deliverer.address);
    // }
    // Pour l'instant, calcul depuis MongoDB
    const deliverersWithEarnings = await Promise.all(deliverers.map(async (deliverer) => {
      const delivererOrders = await Order.find({ 
        deliverer: deliverer._id, 
        status: 'DELIVERED' 
      });
      
      // Calculer earnings (20% de chaque commande)
      const earnings = delivererOrders.reduce((sum, order) => {
        const delivererAmount = (order.totalAmount || 0) * 0.2; // 20% pour livreur
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

// Exporter toutes les fonctions
module.exports = {
  getStats,
  getDisputes,
  resolveDispute,
  getAllUsers,
  getAllRestaurants,
  getAllDeliverers
};

