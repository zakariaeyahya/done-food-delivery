// TODO: Importer les services nécessaires
// const blockchainService = require("../services/blockchainService");
// const gpsTracker = require("../utils/gpsTracker");

// TODO: Importer les modèles MongoDB
// const Deliverer = require("../models/Deliverer");
// const Order = require("../models/Order");

// TODO: Importer ethers pour validation d'adresses et conversions
// const { ethers } = require("ethers");

/**
 * Controller pour gérer les livreurs
 * @notice Gère l'enregistrement, staking, disponibilité et earnings des livreurs
 * @dev Intègre blockchain pour staking et MongoDB pour les données off-chain
 */
/**
 * Enregistre un nouveau livreur
 * @dev TODO: Implémenter la fonction registerDeliverer
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function registerDeliverer(req, res) {
  try {
    // TODO: Récupérer les données du body
    // const { address, name, phone, vehicleType, location } = req.body;
    
    // TODO: Valider address Ethereum
    // if (!address || !ethers.isAddress(address)) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "Invalid Ethereum address"
    //   });
    // }
    
    // TODO: Vérifier si le livreur existe déjà
    // const existingDeliverer = await Deliverer.findByAddress(address.toLowerCase());
    // if (existingDeliverer) {
    //   return res.status(409).json({
    //     error: "Conflict",
    //     message: "Deliverer already exists"
    //   });
    // }
    
    // TODO: Créer Deliverer dans MongoDB
    // const deliverer = new Deliverer({
    //   address: address.toLowerCase(),
    //   name,
    //   phone,
    //   vehicleType: vehicleType || 'bike',
    //   currentLocation: {
    //     lat: location.lat,
    //     lng: location.lng,
    //     lastUpdated: new Date()
    //   },
    //   isAvailable: false,
    //   isStaked: false,
    //   stakedAmount: 0,
    //   rating: 0,
    //   totalDeliveries: 0
    // });
    // await deliverer.save();
    
    // TODO: Retourner succès
    // return res.status(201).json({
    //   success: true,
    //   deliverer: {
    //     address: deliverer.address,
    //     name: deliverer.name,
    //     phone: deliverer.phone,
    //     vehicleType: deliverer.vehicleType,
    //     location: deliverer.currentLocation
    //   }
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error registering deliverer:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to register deliverer",
    //   details: error.message
    // });
  }
}

/**
 * Récupère les détails d'un livreur
 * @dev TODO: Implémenter la fonction getDeliverer
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getDeliverer(req, res) {
  try {
    // TODO: Récupérer address depuis params
    // const address = req.params.address;
    
    // TODO: Normaliser l'adresse
    // const normalizedAddress = address.toLowerCase();
    
    // TODO: Fetch Deliverer depuis MongoDB
    // const deliverer = await Deliverer.findByAddress(normalizedAddress);
    // if (!deliverer) {
    //   return res.status(404).json({
    //     error: "Not Found",
    //     message: "Deliverer not found"
    //   });
    // }
    
    // TODO: Fetch staking status via blockchainService.isStaked()
    // const isStaked = await blockchainService.isStaked(normalizedAddress);
    
    // TODO: Fetch stakedAmount via blockchain
    // const { getContractInstance } = require("../config/blockchain");
    // const staking = getContractInstance("staking");
    // const stakedAmountWei = await staking.getStakedAmount(normalizedAddress);
    // const stakedAmount = ethers.utils.formatEther(stakedAmountWei);
    
    // TODO: Update MongoDB avec les données blockchain (synchronisation)
    // await Deliverer.findOneAndUpdate(
    //   { address: normalizedAddress },
    //   { 
    //     isStaked,
    //     stakedAmount: parseFloat(stakedAmount)
    //   }
    // );
    
    // TODO: Retourner deliverer, isStaked, stakedAmount
    // return res.status(200).json({
    //   success: true,
    //   deliverer: {
    //     address: deliverer.address,
    //     name: deliverer.name,
    //     phone: deliverer.phone,
    //     vehicleType: deliverer.vehicleType,
    //     currentLocation: deliverer.currentLocation,
    //     isAvailable: deliverer.isAvailable,
    //     rating: deliverer.rating,
    //     totalDeliveries: deliverer.totalDeliveries
    //   },
    //   isStaked,
    //   stakedAmount
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error getting deliverer:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to get deliverer",
    //   details: error.message
    // });
  }
}

/**
 * Récupère les livreurs disponibles
 * @dev TODO: Implémenter la fonction getAvailableDeliverers
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getAvailableDeliverers(req, res) {
  try {
    // TODO: Récupérer location depuis query (optionnel)
    // const { location } = req.query;
    
    // TODO: Fetch deliverers avec isAvailable=true depuis MongoDB
    // let deliverers = await Deliverer.find({ isAvailable: true });
    
    // TODO: Vérifier staking via blockchainService.isStaked() pour chaque deliverer
    // const availableDeliverers = [];
    // for (const deliverer of deliverers) {
    //   const isStaked = await blockchainService.isStaked(deliverer.address);
    //   if (isStaked) {
    //     availableDeliverers.push(deliverer);
    //   }
    // }
    
    // TODO: Filtrer par distance via gpsTracker.calculateDistance() si location fournie
    // if (location) {
    //   const { lat, lng, maxDistance } = JSON.parse(location);
    //   availableDeliverers.forEach(deliverer => {
    //     deliverer.distance = gpsTracker.calculateDistance(
    //       lat,
    //       lng,
    //       deliverer.currentLocation.lat,
    //       deliverer.currentLocation.lng
    //     );
    //   });
    //   
    //   // Filtrer par maxDistance et trier par distance
    //   availableDeliverers = availableDeliverers
    //     .filter(d => d.distance <= (maxDistance || 10))
    //     .sort((a, b) => a.distance - b.distance);
    // }
    
    // TODO: Retourner array of available deliverers triés par distance
    // return res.status(200).json({
    //   success: true,
    //   deliverers: availableDeliverers.map(d => ({
    //     address: d.address,
    //     name: d.name,
    //     vehicleType: d.vehicleType,
    //     currentLocation: d.currentLocation,
    //     rating: d.rating,
    //     distance: d.distance || null
    //   }))
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error getting available deliverers:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to get available deliverers",
    //   details: error.message
    // });
  }
}

/**
 * Met à jour le statut de disponibilité d'un livreur
 * @dev TODO: Implémenter la fonction updateDelivererStatus
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function updateDelivererStatus(req, res) {
  try {
    // TODO: Récupérer address depuis params ou req.userAddress
    // const address = req.params.address || req.userAddress;
    
    // TODO: Récupérer isAvailable depuis body
    // const { isAvailable } = req.body;
    
    // TODO: Normaliser l'adresse
    // const normalizedAddress = address.toLowerCase();
    
    // TODO: Update Deliverer.isAvailable dans MongoDB
    // await Deliverer.findOneAndUpdate(
    //   { address: normalizedAddress },
    //   { $set: { isAvailable: isAvailable } },
    //   { new: true }
    // );
    
    // TODO: Retourner succès
    // return res.status(200).json({
    //   success: true,
    //   isAvailable
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error updating deliverer status:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to update deliverer status",
    //   details: error.message
    // });
  }
}

/**
 * Stake un livreur (dépôt de garantie)
 * @dev TODO: Implémenter la fonction stakeAsDeliverer
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function stakeAsDeliverer(req, res) {
  try {
    // TODO: Récupérer address et amount depuis body
    // const { address, amount } = req.body;
    
    // TODO: Normaliser l'adresse
    // const normalizedAddress = address.toLowerCase();
    
    // TODO: Valide amount >= 0.1 ETH
    // const minimumStake = ethers.utils.parseEther("0.1");
    // const stakeAmount = ethers.utils.parseEther(amount.toString());
    // if (stakeAmount.lt(minimumStake)) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "Minimum stake is 0.1 ETH"
    //   });
    // }
    
    // TODO: Appeler blockchainService.stakeDeliverer(address, amount)
    // const blockchainResult = await blockchainService.stakeDeliverer(
    //   normalizedAddress,
    //   stakeAmount.toString(),
    //   req.body.delivererPrivateKey // À sécuriser
    // );
    
    // TODO: Update Deliverer dans MongoDB : isStaked=true, stakedAmount=amount
    // await Deliverer.findOneAndUpdate(
    //   { address: normalizedAddress },
    //   { 
    //     $set: { 
    //       isStaked: true,
    //       stakedAmount: parseFloat(amount)
    //     } 
    //   }
    // );
    
    // TODO: Retourner succès
    // return res.status(200).json({
    //   success: true,
    //   txHash: blockchainResult.txHash
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error staking deliverer:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to stake deliverer",
    //   details: error.message
    // });
  }
}

/**
 * Retire le stake d'un livreur
 * @dev TODO: Implémenter la fonction unstake
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function unstake(req, res) {
  try {
    // TODO: Récupérer address depuis body ou req.userAddress
    // const address = req.body.address || req.userAddress;
    
    // TODO: Normaliser l'adresse
    // const normalizedAddress = address.toLowerCase();
    
    // TODO: Vérifier pas de livraisons actives (order.status IN_DELIVERY where deliverer = address)
    // const activeOrders = await Order.find({ 
    //   deliverer: normalizedAddress,
    //   status: 'IN_DELIVERY'
    // });
    // if (activeOrders.length > 0) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "Cannot unstake while having active deliveries"
    //   });
    // }
    
    // TODO: Appeler blockchainService.unstake(address)
    // const blockchainResult = await blockchainService.unstake(
    //   normalizedAddress,
    //   req.body.delivererPrivateKey // À sécuriser
    // );
    
    // TODO: Update Deliverer dans MongoDB : isStaked=false, stakedAmount=0
    // await Deliverer.findOneAndUpdate(
    //   { address: normalizedAddress },
    //   { 
    //     $set: { 
    //       isStaked: false,
    //       stakedAmount: 0
    //     } 
    //   }
    // );
    
    // TODO: Retourner succès
    // return res.status(200).json({
    //   success: true,
    //   txHash: blockchainResult.txHash
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error unstaking deliverer:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to unstake deliverer",
    //   details: error.message
    // });
  }
}

/**
 * Récupère les commandes d'un livreur
 * @dev TODO: Implémenter la fonction getDelivererOrders
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getDelivererOrders(req, res) {
  try {
    // TODO: Récupérer address depuis params ou req.userAddress
    // const address = req.params.address || req.userAddress;
    
    // TODO: Récupérer status depuis query (optionnel)
    // const { status } = req.query;
    
    // TODO: Normaliser l'adresse
    // const normalizedAddress = address.toLowerCase();
    
    // TODO: Construire la requête
    // let query = { deliverer: normalizedAddress };
    // if (status) {
    //   query.status = status;
    // }
    
    // TODO: Fetch orders du deliverer depuis MongoDB where deliverer = address
    // const orders = await Order.find(query)
    //   .populate('client restaurant')
    //   .sort({ createdAt: -1 });
    
    // TODO: Retourner array of orders
    // return res.status(200).json({
    //   success: true,
    //   orders
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error getting deliverer orders:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to get deliverer orders",
    //   details: error.message
    // });
  }
}

/**
 * Récupère les earnings d'un livreur
 * @dev TODO: Implémenter la fonction getDelivererEarnings
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getDelivererEarnings(req, res) {
  try {
    // TODO: Récupérer address depuis params ou req.userAddress
    // const address = req.params.address || req.userAddress;
    
    // TODO: Récupérer startDate et endDate depuis query
    // const { startDate, endDate } = req.query;
    
    // TODO: Normaliser l'adresse
    // const normalizedAddress = address.toLowerCase();
    
    // TODO: Calcule earnings depuis blockchain events PaymentSplit
    // Note: Cela nécessite d'écouter les events PaymentSplit et les stocker dans MongoDB
    // Option 1: Interroger les events depuis la blockchain
    // const { getContractInstance } = require("../config/blockchain");
    // const paymentSplitter = getContractInstance("paymentSplitter");
    // 
    // const filter = paymentSplitter.filters.PaymentSplit(null, null, normalizedAddress);
    // const events = await paymentSplitter.queryFilter(filter, 0, 'latest');
    // 
    // // Filtrer par dates si fournies
    // let filteredEvents = events;
    // if (startDate || endDate) {
    //   filteredEvents = events.filter(event => {
    //     const eventDate = new Date(event.blockNumber * 1000); // Approximation
    //     if (startDate && eventDate < new Date(startDate)) return false;
    //     if (endDate && eventDate > new Date(endDate)) return false;
    //     return true;
    //   });
    // }
    // 
    // // Sum delivererAmount (20% de chaque commande)
    // const totalEarningsWei = filteredEvents.reduce((sum, event) => {
    //   return sum.add(event.args.delivererAmount);
    // }, ethers.BigNumber.from(0));
    // const totalEarnings = ethers.utils.formatEther(totalEarningsWei);
    
    // TODO: Option 2: Calculer depuis MongoDB orders (si stocké)
    // const query = { 
    //   deliverer: normalizedAddress,
    //   status: 'DELIVERED'
    // };
    // if (startDate || endDate) {
    //   query.completedAt = {};
    //   if (startDate) query.completedAt.$gte = new Date(startDate);
    //   if (endDate) query.completedAt.$lte = new Date(endDate);
    // }
    // 
    // const orders = await Order.find(query);
    // const totalEarnings = orders.reduce((sum, order) => {
    //   return sum + (parseFloat(order.deliveryFee) * 0.2); // 20% du deliveryFee
    // }, 0);
    
    // TODO: Calcule stats
    // const completedDeliveries = orders.length;
    // const averageEarning = completedDeliveries > 0 ? totalEarnings / completedDeliveries : 0;
    
    // TODO: Retourner earnings
    // return res.status(200).json({
    //   success: true,
    //   earnings: {
    //     totalEarnings: parseFloat(totalEarnings),
    //     completedDeliveries,
    //     averageEarning: parseFloat(averageEarning.toFixed(4))
    //   }
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error getting deliverer earnings:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to get deliverer earnings",
    //   details: error.message
    // });
  }
}

// TODO: Exporter toutes les fonctions
// module.exports = {
//   registerDeliverer,
//   getDeliverer,
//   getAvailableDeliverers,
//   updateDelivererStatus,
//   stakeAsDeliverer,
//   unstake,
//   getDelivererOrders,
//   getDelivererEarnings
// };

