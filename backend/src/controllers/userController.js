// Importer les modèles MongoDB
const User = require("../models/User");
const Order = require("../models/Order");

// Importer ethers pour validation d'adresses
const { ethers } = require("ethers");

/**
 * Controller pour gérer les utilisateurs (clients)
 * @notice Gère l'enregistrement, profil et historique des clients
 * @dev Utilise MongoDB uniquement (sans blockchain pour Phase 6)
 */

/**
 * Enregistre un nouvel utilisateur
 * @dev Implémenté - MongoDB uniquement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function registerUser(req, res) {
  try {
    // Récupérer les données du body
    const { address, name, email, phone } = req.body;
    
    // Valider address Ethereum (déjà validé par middleware, mais double vérification)
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByAddress(address);
    if (existingUser) {
      return res.status(409).json({
        error: "Conflict",
        message: "User already exists"
      });
    }
    
    // Créer User dans MongoDB
    const user = new User({
      address: address.toLowerCase(),
      name,
      email,
      phone,
      deliveryAddresses: []
    });
    await user.save();
    
    // Retourner succès
    return res.status(201).json({
      success: true,
      user: {
        address: user.address,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error registering user:", error);
    
    // Gérer erreur de duplication (email unique)
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Conflict",
        message: "Email already registered"
      });
    }
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to register user",
      details: error.message
    });
  }
}

/**
 * Récupère le profil d'un utilisateur
 * @dev Implémenté - MongoDB uniquement (sans token balance)
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getUserProfile(req, res) {
  try {
    // Récupérer address depuis params ou req.validatedAddress
    const address = req.params.address || req.validatedAddress || req.userAddress;
    
    // Normaliser l'adresse
    const normalizedAddress = address.toLowerCase();
    
    // Fetch User depuis MongoDB via User.findByAddress()
    const user = await User.findByAddress(normalizedAddress);
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }
    
    // Retourner user (sans token balance pour Phase 6)
    return res.status(200).json({
      success: true,
      user: {
        address: user.address,
        name: user.name,
        email: user.email,
        phone: user.phone,
        deliveryAddresses: user.deliveryAddresses
      }
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error getting user profile:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user profile",
      details: error.message
    });
  }
}

/**
 * Met à jour le profil d'un utilisateur
 * @dev Implémenté - MongoDB uniquement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function updateUserProfile(req, res) {
  try {
    // Récupérer address depuis params ou req.userAddress
    const address = req.params.address || req.userAddress || req.validatedAddress;
    
    // Récupérer les données à mettre à jour depuis body
    const { name, email, phone } = req.body;
    
    // Normaliser l'adresse
    const normalizedAddress = address.toLowerCase();
    
    // Vérifier que l'utilisateur existe
    const user = await User.findByAddress(normalizedAddress);
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }
    
    // Préparer les updates
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    
    // Update User dans MongoDB via User.updateProfile()
    const updatedUser = await User.updateProfile(normalizedAddress, updates);
    
    // Retourner succès
    return res.status(200).json({
      success: true,
      user: {
        address: updatedUser.address,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        deliveryAddresses: updatedUser.deliveryAddresses
      }
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error updating user profile:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update user profile",
      details: error.message
    });
  }
}

/**
 * Récupère les commandes d'un utilisateur
 * @dev Implémenté - MongoDB uniquement
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getUserOrders(req, res) {
  try {
    // Récupérer address depuis params ou req.userAddress
    const address = req.params.address || req.userAddress || req.validatedAddress;
    
    // Normaliser l'adresse
    const normalizedAddress = address.toLowerCase();
    
    // Récupérer l'utilisateur pour obtenir son ID MongoDB
    const user = await User.findByAddress(normalizedAddress);
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }
    
    // Récupérer pagination depuis query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Récupérer status depuis query (optionnel)
    const status = req.query.status;
    
    // Fetch orders depuis MongoDB via Order.getOrdersByClient()
    const orders = await Order.getOrdersByClient(user._id, {
      limit,
      skip,
      status
    });
    
    // Compter le total
    const query = { client: user._id };
    if (status) query.status = status;
    const total = await Order.countDocuments(query);
    
    // Retourner array of orders avec pagination
    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error getting user orders:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user orders",
      details: error.message
    });
  }
}

/**
 * Récupère les tokens et l'historique de transactions d'un utilisateur
 * @dev Mock temporaire - Retourne des données vides (Phase 6)
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getUserTokens(req, res) {
  try {
    // Récupérer address depuis params ou req.userAddress
    const address = req.params.address || req.userAddress || req.validatedAddress;
    
    // Normaliser l'adresse
    const normalizedAddress = address.toLowerCase();
    
    // Vérifier que l'utilisateur existe
    const user = await User.findByAddress(normalizedAddress);
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }
    
    // Mock temporaire - Retourner balance et transactions vides
    // TODO: Implémenter avec blockchainService.getTokenBalance() quand blockchain sera disponible
    return res.status(200).json({
      success: true,
      balance: "0",
      transactions: []
    });
  } catch (error) {
    // Logger l'erreur
    console.error("Error getting user tokens:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user tokens",
      details: error.message
    });
  }
}

// Exporter toutes les fonctions
module.exports = {
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUserOrders,
  getUserTokens
};
