const User = require("../models/User");
const Order = require("../models/Order");
const blockchainService = require("../services/blockchainService");
const { ethers } = require("ethers");

/**
 * Controller for managing users (clients)
 * @notice Manages registration, profile and history of clients
 * @dev Uses MongoDB and blockchain services
 */

/**
 * Registers a new user
 * @dev Implemented - MongoDB only
 *
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function registerUser(req, res) {
  try {
    const { address, name, email, phone } = req.body;

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }

    const existingUser = await User.findByAddress(address);
    if (existingUser) {
      return res.status(409).json({
        error: "Conflict",
        message: "User already exists"
      });
    }

    const user = new User({
      address: address.toLowerCase(),
      name,
      email,
      phone,
      deliveryAddresses: []
    });
    await user.save();

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
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Conflict",
        message: "Email already registered"
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to register user",
      details: error.message
    });
  }
}

/**
 * Gets user profile
 * @dev Retrieves user profile with token balance from blockchain and order stats
 *
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getUserProfile(req, res) {
  try {
    const address = req.params.address || req.validatedAddress || req.userAddress;

    const normalizedAddress = address.toLowerCase();

    const user = await User.findByAddress(normalizedAddress);
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }

    // Get token balance from blockchain
    let tokenBalance = "0";
    try {
      tokenBalance = await blockchainService.getTokenBalance(normalizedAddress);
    } catch (blockchainError) {
      console.log("[UserController] Could not fetch token balance:", blockchainError.message);
    }

    // Count total orders and completed orders for this user
    let totalOrders = 0;
    let completedOrders = 0;
    try {
      totalOrders = await Order.countDocuments({ client: user._id });
      completedOrders = await Order.countDocuments({ client: user._id, status: 'DELIVERED' });
    } catch (orderError) {
      console.log("[UserController] Could not count orders:", orderError.message);
    }

    return res.status(200).json({
      success: true,
      user: {
        address: user.address,
        name: user.name,
        email: user.email,
        phone: user.phone,
        deliveryAddresses: user.deliveryAddresses,
        tokenBalance,
        totalOrders,
        completedOrders,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user profile",
      details: error.message
    });
  }
}

/**
 * Updates user profile
 * @dev Implemented - MongoDB only
 *
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function updateUserProfile(req, res) {
  try {
    const address = req.params.address || req.userAddress || req.validatedAddress;

    const { name, email, phone } = req.body;

    const normalizedAddress = address.toLowerCase();

    const user = await User.findByAddress(normalizedAddress);
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    const updatedUser = await User.updateProfile(normalizedAddress, updates);

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
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update user profile",
      details: error.message
    });
  }
}

/**
 * Gets user orders
 * @dev Implemented - MongoDB only
 *
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getUserOrders(req, res) {
  try {
    const address = req.params.address || req.userAddress || req.validatedAddress;

    const normalizedAddress = address.toLowerCase();

    const user = await User.findByAddress(normalizedAddress);
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status;

    const orders = await Order.getOrdersByClient(user._id, {
      limit,
      skip,
      status
    });

    const query = { client: user._id };
    if (status) query.status = status;
    const total = await Order.countDocuments(query);

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
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user orders",
      details: error.message
    });
  }
}

/**
 * Gets user tokens and transaction history
 * @dev Retrieves token balance from blockchain and transaction history
 *
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getUserTokens(req, res) {
  try {
    const address = req.params.address || req.userAddress || req.validatedAddress;

    const normalizedAddress = address.toLowerCase();

    const user = await User.findByAddress(normalizedAddress);
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }

    let balance = "0";
    let transactions = [];

    try {
      balance = await blockchainService.getTokenBalance(normalizedAddress);
      transactions = [];
    } catch (blockchainError) {
      console.log("[UserController] Could not fetch token balance:", blockchainError.message);
    }

    return res.status(200).json({
      success: true,
      balance,
      transactions,
      address: normalizedAddress
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user tokens",
      details: error.message
    });
  }
}

module.exports = {
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUserOrders,
  getUserTokens
};
