// Importer les services nécessaires
const gpsTracker = require("../utils/gpsTracker");

// Importer les modèles MongoDB
const Deliverer = require("../models/Deliverer");
const Order = require("../models/Order");

// Importer ethers pour validation d'adresses et conversions
const { ethers } = require("ethers");

/**
 * Controller pour gérer les livreurs
 * @notice Gère l'enregistrement, staking, disponibilité et earnings des livreurs
 * @dev Utilise MongoDB uniquement pour Phase 6 (mocks pour staking)
 */

/**
 * Enregistre un nouveau livreur
 * @dev Implémenté - MongoDB uniquement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function registerDeliverer(req, res) {
  try {
    // Récupérer les données du body
    const { address, name, phone, vehicleType, location } = req.body;
    
    // Valider address Ethereum
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }
    
    // Vérifier si le livreur existe déjà
    const existingDeliverer = await Deliverer.findByAddress(address.toLowerCase());
    if (existingDeliverer) {
      return res.status(409).json({
        error: "Conflict",
        message: "Deliverer already exists"
      });
    }
    
    // Créer Deliverer dans MongoDB
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
    
    // Retourner succès
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
    // Logger l'erreur
    console.error("Error registering deliverer:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to register deliverer",
      details: error.message
    });
  }
}

/**
 * Récupère les détails d'un livreur
 * @dev Implémenté - MongoDB uniquement (sans synchronisation blockchain)
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getDeliverer(req, res) {
  try {
    // Récupérer address depuis params ou req.validatedAddress
    const address = req.params.address || req.validatedAddress || req.userAddress;
    
    // Normaliser l'adresse
    const normalizedAddress = address.toLowerCase();
    
    // Fetch Deliverer depuis MongoDB
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    // Retourner deliverer (sans synchronisation blockchain pour Phase 6)
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
    // Logger l'erreur
    console.error("Error getting deliverer:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get deliverer",
      details: error.message
    });
  }
}

/**
 * Récupère les livreurs disponibles
 * @dev Implémenté - MongoDB uniquement (sans vérification blockchain)
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getAvailableDeliverers(req, res) {
  try {
    // Récupérer location depuis query (optionnel)
    const { location } = req.query;
    
    // Fetch deliverers avec isAvailable=true et isStaked=true depuis MongoDB
    const deliverers = await Deliverer.getAvailableDeliverers();
    
    // Filtrer par distance via gpsTracker.calculateDistance() si location fournie
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
        
        // Filtrer par maxDistance et trier par distance
        availableDeliverers = availableDeliverers
          .filter(d => d.distance <= (maxDistance || 10))
          .sort((a, b) => a.distance - b.distance);
      } catch (parseError) {
        console.warn("Error parsing location filter:", parseError);
      }
    }
    
    // Retourner array of available deliverers triés par distance
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
    // Logger l'erreur
    console.error("Error getting available deliverers:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get available deliverers",
      details: error.message
    });
  }
}

/**
 * Met à jour le statut de disponibilité d'un livreur
 * @dev Implémenté - MongoDB uniquement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function updateDelivererStatus(req, res) {
  try {
    // Récupérer address depuis params ou req.userAddress
    const address = req.params.address || req.userAddress || req.validatedAddress;
    
    // Récupérer isAvailable depuis body
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        error: "Bad Request",
        message: "isAvailable must be a boolean"
      });
    }
    
    // Normaliser l'adresse
    const normalizedAddress = address.toLowerCase();
    
    // Update Deliverer.isAvailable dans MongoDB
    const updatedDeliverer = await Deliverer.setAvailability(normalizedAddress, isAvailable);
    
    if (!updatedDeliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    // Retourner succès
    return res.status(200).json({
      success: true,
      isAvailable: updatedDeliverer.isAvailable
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error updating deliverer status:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update deliverer status",
      details: error.message
    });
  }
}

/**
 * Stake un livreur (dépôt de garantie)
 * @dev Mock temporaire - Sauvegarde dans MongoDB seulement (Phase 6)
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function stakeAsDeliverer(req, res) {
  try {
    // Récupérer address et amount depuis body
    const { address, amount } = req.body;
    
    // Normaliser l'adresse
    const normalizedAddress = address.toLowerCase();
    
    // Valide amount >= 0.1 ETH (en wei)
    const minimumStake = ethers.parseEther("0.1");
    const stakeAmountWei = ethers.parseEther(amount.toString());
    
    if (stakeAmountWei < minimumStake) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Minimum stake is 0.1 ETH"
      });
    }
    
    // Vérifier que le livreur existe
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    // Mock temporaire - Update Deliverer dans MongoDB seulement
    // TODO: Appeler blockchainService.stakeDeliverer() quand blockchain sera disponible
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
    
    // Retourner succès (mock txHash)
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
    // Logger l'erreur
    console.error("Error staking deliverer:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to stake deliverer",
      details: error.message
    });
  }
}

/**
 * Retire le stake d'un livreur
 * @dev Mock temporaire - MongoDB seulement (Phase 6)
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function unstake(req, res) {
  try {
    // Récupérer address depuis body ou req.userAddress
    const address = req.body.address || req.userAddress || req.validatedAddress;
    
    // Normaliser l'adresse
    const normalizedAddress = address.toLowerCase();
    
    // Vérifier que le livreur existe
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    // Vérifier pas de livraisons actives (order.status IN_DELIVERY where deliverer = address)
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
    
    // Mock temporaire - Update Deliverer dans MongoDB seulement
    // TODO: Appeler blockchainService.unstake() quand blockchain sera disponible
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
    
    // Retourner succès (mock txHash)
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
    // Logger l'erreur
    console.error("Error unstaking deliverer:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to unstake deliverer",
      details: error.message
    });
  }
}

/**
 * Récupère les commandes d'un livreur
 * @dev Implémenté - MongoDB uniquement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getDelivererOrders(req, res) {
  try {
    // Récupérer address depuis params ou req.userAddress
    const address = req.params.address || req.userAddress || req.validatedAddress;
    
    // Normaliser l'adresse
    const normalizedAddress = address.toLowerCase();
    
    // Récupérer le livreur pour obtenir son ID MongoDB
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    // Récupérer status depuis query (optionnel)
    const { status } = req.query;
    
    // Fetch orders du deliverer depuis MongoDB via Order.getOrdersByDeliverer()
    const orders = await Order.getOrdersByDeliverer(deliverer._id, {
      status
    });
    
    // Retourner array of orders
    return res.status(200).json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error getting deliverer orders:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get deliverer orders",
      details: error.message
    });
  }
}

/**
 * Récupère les earnings d'un livreur
 * @dev Implémenté - Calculs MongoDB uniquement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getDelivererEarnings(req, res) {
  try {
    // Récupérer address depuis params ou req.userAddress
    const address = req.params.address || req.userAddress || req.validatedAddress;
    
    // Normaliser l'adresse
    const normalizedAddress = address.toLowerCase();
    
    // Récupérer le livreur
    const deliverer = await Deliverer.findByAddress(normalizedAddress);
    if (!deliverer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Deliverer not found"
      });
    }
    
    // Récupérer startDate et endDate depuis query
    const { startDate, endDate } = req.query;
    
    // Construire la requête
    const query = { 
      deliverer: deliverer._id,
      status: 'DELIVERED'
    };
    
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }
    
    // Calculer depuis MongoDB orders
    const orders = await Order.find(query);
    
    // Sum delivererAmount (20% du deliveryFee approximativement)
    const totalEarnings = orders.reduce((sum, order) => {
      // Convertir wei en MATIC (approximation, 1e18)
      const deliveryFeeMATIC = parseFloat(order.deliveryFee) / 1e18;
      return sum + (deliveryFeeMATIC * 0.2); // 20% du deliveryFee
    }, 0);
    
    // Calcule stats
    const completedDeliveries = orders.length;
    const averageEarning = completedDeliveries > 0 ? totalEarnings / completedDeliveries : 0;
    
    // Retourner earnings
    return res.status(200).json({
      success: true,
      earnings: {
        totalEarnings: parseFloat(totalEarnings.toFixed(4)),
        completedDeliveries,
        averageEarning: parseFloat(averageEarning.toFixed(4))
      }
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error getting deliverer earnings:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get deliverer earnings",
      details: error.message
    });
  }
}

// Exporter toutes les fonctions
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
