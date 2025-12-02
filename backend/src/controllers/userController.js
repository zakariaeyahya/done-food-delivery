// TODO: Importer les services nécessaires
// const blockchainService = require("../services/blockchainService");

// TODO: Importer les modèles MongoDB
// const User = require("../models/User");
// const Order = require("../models/Order");

// TODO: Importer ethers pour validation d'adresses
// const { ethers } = require("ethers");

/**
 * Controller pour gérer les utilisateurs (clients)
 * @notice Gère l'enregistrement, profil et historique des clients
 * @dev Intègre blockchain pour les tokens et MongoDB pour les données off-chain
 */
/**
 * Enregistre un nouvel utilisateur
 * @dev TODO: Implémenter la fonction registerUser
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function registerUser(req, res) {
  try {
    // TODO: Récupérer les données du body
    // const { address, name, email, phone } = req.body;
    
    // TODO: Valider address Ethereum (ethers.isAddress)
    // if (!address || !ethers.isAddress(address)) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "Invalid Ethereum address"
    //   });
    // }
    
    // TODO: Vérifier si l'utilisateur existe déjà
    // const existingUser = await User.findByAddress(address);
    // if (existingUser) {
    //   return res.status(409).json({
    //     error: "Conflict",
    //     message: "User already exists"
    //   });
    // }
    
    // TODO: Créer User dans MongoDB
    // const user = new User({
    //   address: address.toLowerCase(),
    //   name,
    //   email,
    //   phone,
    //   deliveryAddresses: []
    // });
    // await user.save();
    
    // TODO: Retourner succès
    // return res.status(201).json({
    //   success: true,
    //   user: {
    //     address: user.address,
    //     name: user.name,
    //     email: user.email,
    //     phone: user.phone
    //   }
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error registering user:", error);
    
    // TODO: Gérer erreur de duplication (email unique)
    // if (error.code === 11000) {
    //   return res.status(409).json({
    //     error: "Conflict",
    //     message: "Email already registered"
    //   });
    // }
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to register user",
    //   details: error.message
    // });
  }
}

/**
 * Récupère le profil d'un utilisateur
 * @dev TODO: Implémenter la fonction getUserProfile
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getUserProfile(req, res) {
  try {
    // TODO: Récupérer address depuis params ou req.userAddress
    // const address = req.params.address || req.userAddress;
    
    // TODO: Normaliser l'adresse
    // const normalizedAddress = address.toLowerCase();
    
    // TODO: Fetch User depuis MongoDB via User.findByAddress()
    // const user = await User.findByAddress(normalizedAddress);
    // if (!user) {
    //   return res.status(404).json({
    //     error: "Not Found",
    //     message: "User not found"
    //   });
    // }
    
    // TODO: Fetch DONE token balance via blockchainService.getTokenBalance()
    // const tokenBalance = await blockchainService.getTokenBalance(normalizedAddress);
    
    // TODO: Retourner user et tokenBalance
    // return res.status(200).json({
    //   success: true,
    //   user: {
    //     address: user.address,
    //     name: user.name,
    //     email: user.email,
    //     phone: user.phone,
    //     deliveryAddresses: user.deliveryAddresses
    //   },
    //   tokenBalance
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error getting user profile:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to get user profile",
    //   details: error.message
    // });
  }
}

/**
 * Met à jour le profil d'un utilisateur
 * @dev TODO: Implémenter la fonction updateUserProfile
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function updateUserProfile(req, res) {
  try {
    // TODO: Récupérer address depuis params ou req.userAddress
    // const address = req.params.address || req.userAddress;
    
    // TODO: Récupérer les données à mettre à jour depuis body
    // const { name, email, phone, deliveryAddresses } = req.body;
    
    // TODO: Normaliser l'adresse
    // const normalizedAddress = address.toLowerCase();
    
    // TODO: Vérifier que l'utilisateur existe
    // const user = await User.findByAddress(normalizedAddress);
    // if (!user) {
    //   return res.status(404).json({
    //     error: "Not Found",
    //     message: "User not found"
    //   });
    // }
    
    // TODO: Préparer les updates
    // const updates = {};
    // if (name) updates.name = name;
    // if (email) updates.email = email;
    // if (phone) updates.phone = phone;
    // if (deliveryAddresses) updates.deliveryAddresses = deliveryAddresses;
    
    // TODO: Update User dans MongoDB via User.updateProfile()
    // const updatedUser = await User.updateProfile(normalizedAddress, updates);
    
    // TODO: Retourner succès
    // return res.status(200).json({
    //   success: true,
    //   user: {
    //     address: updatedUser.address,
    //     name: updatedUser.name,
    //     email: updatedUser.email,
    //     phone: updatedUser.phone,
    //     deliveryAddresses: updatedUser.deliveryAddresses
    //   }
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error updating user profile:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to update user profile",
    //   details: error.message
    // });
  }
}

/**
 * Récupère les commandes d'un utilisateur
 * @dev TODO: Implémenter la fonction getUserOrders
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getUserOrders(req, res) {
  try {
    // TODO: Récupérer address depuis params ou req.userAddress
    // const address = req.params.address || req.userAddress;
    
    // TODO: Normaliser l'adresse
    // const normalizedAddress = address.toLowerCase();
    
    // TODO: Récupérer pagination depuis query
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    // const skip = (page - 1) * limit;
    
    // TODO: Fetch orders depuis MongoDB
    // const Order = require("../models/Order");
    // const orders = await Order.find({ client: normalizedAddress })
    //   .populate('restaurant deliverer')
    //   .sort({ createdAt: -1 })
    //   .skip(skip)
    //   .limit(limit);
    
    // TODO: Compter le total
    // const total = await Order.countDocuments({ client: normalizedAddress });
    
    // TODO: Retourner array of orders avec pagination
    // return res.status(200).json({
    //   success: true,
    //   orders,
    //   total,
    //   page,
    //   limit,
    //   totalPages: Math.ceil(total / limit)
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error getting user orders:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to get user orders",
    //   details: error.message
    // });
  }
}

/**
 * Récupère les tokens et l'historique de transactions d'un utilisateur
 * @dev TODO: Implémenter la fonction getUserTokens
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getUserTokens(req, res) {
  try {
    // TODO: Récupérer address depuis params ou req.userAddress
    // const address = req.params.address || req.userAddress;
    
    // TODO: Normaliser l'adresse
    // const normalizedAddress = address.toLowerCase();
    
    // TODO: Fetch balance via blockchainService.getTokenBalance()
    // const balance = await blockchainService.getTokenBalance(normalizedAddress);
    
    // TODO: Fetch transaction history via blockchain events (token.Transfer)
    // Note: Cela nécessite d'écouter les events Transfer du contrat Token
    // Option 1: Stocker les transactions dans MongoDB lors des events
    // Option 2: Interroger directement les events depuis la blockchain
    // 
    // const { getContractInstance } = require("../config/blockchain");
    // const token = getContractInstance("token");
    // 
    // // Filtrer les events Transfer où to = address
    // const filter = token.filters.Transfer(null, normalizedAddress);
    // const events = await token.queryFilter(filter, 0, 'latest');
    // 
    // const transactions = events.map(event => ({
    //   from: event.args.from,
    //   to: event.args.to,
    //   amount: event.args.value.toString(),
    //   blockNumber: event.blockNumber,
    //   transactionHash: event.transactionHash,
    //   timestamp: new Date() // À récupérer depuis le block
    // }));
    
    // TODO: Retourner balance et transactions
    // return res.status(200).json({
    //   success: true,
    //   balance,
    //   transactions: transactions || []
    // });
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error getting user tokens:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Failed to get user tokens",
    //   details: error.message
    // });
  }
}

// TODO: Exporter toutes les fonctions
// module.exports = {
//   registerUser,
//   getUserProfile,
//   updateUserProfile,
//   getUserOrders,
//   getUserTokens
// };

