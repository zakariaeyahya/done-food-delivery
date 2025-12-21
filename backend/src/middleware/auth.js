const { ethers } = require("ethers");

/**
 * Middleware d'authentification Web3
 * @notice Vérifie les signatures Web3 et les rôles des utilisateurs
 * @dev Utilise ethers.js pour vérifier les signatures de messages
 */

/**
 * Vérifie la signature Web3 dans le header Authorization
 */
async function verifySignature(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid Authorization header. Expected: Bearer <signature>"
      });
    }

    const signature = authHeader.substring(7);

    const message = req.headers['x-message'] || req.body.message;
    if (!message) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Message to verify is required. Provide it in header 'x-message' or body.message"
      });
    }

    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    const allowMockAuth = process.env.ALLOW_MOCK_AUTH === 'true';
    const isMockSignature = signature === 'mock_signature_for_testing';

    if (isMockSignature && (isDevelopment || allowMockAuth)) {
      const mockAddress = req.headers['x-wallet-address'] || req.body.address;
      if (!mockAddress) {
        return res.status(400).json({
          error: "Bad Request",
          message: "x-wallet-address header is required when using mock signature"
        });
      }
      req.userAddress = mockAddress.toLowerCase();
      return next();
    }
    if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid signature format"
      });
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);

    const normalizedAddress = recoveredAddress.toLowerCase();
    const expectedAddress = req.body.address || req.headers['x-address'];
    if (expectedAddress && expectedAddress.toLowerCase() !== normalizedAddress) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Signature does not match the provided address"
      });
    }

    req.userAddress = normalizedAddress;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Signature verification failed",
      details: error.message
    });
  }
}

/**
 * Middleware factory pour vérifier un rôle spécifique
 */
function requireRole(role) {
  return async function(req, res, next) {
    try {
      if (!req.userAddress) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "User address not found. verifySignature middleware must be called first."
        });
      }

      const userAddress = req.userAddress.toLowerCase();
      try {
        const User = require("../models/User");
        const Restaurant = require("../models/Restaurant");
        const Deliverer = require("../models/Deliverer");

        let hasRole = false;

        if (role === 'CLIENT_ROLE') {
          const user = await User.findByAddress(userAddress);
          hasRole = !!user;
        } else if (role === 'RESTAURANT_ROLE') {
          const restaurant = await Restaurant.findByAddress(userAddress);
          hasRole = !!restaurant;
        } else if (role === 'DELIVERER_ROLE') {
          const deliverer = await Deliverer.findByAddress(userAddress);
          hasRole = !!deliverer;
        } else {
          return res.status(403).json({
            error: "Forbidden",
            message: `Role ${role} verification requires blockchain (not implemented yet)`
          });
        }
        if (!hasRole) {
          return res.status(403).json({
            error: "Forbidden",
            message: `Access denied. Required role: ${role}`
          });
        }

        req.userRole = role;

        next();
      } catch (modelError) {
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Role verification failed - models not available",
          details: modelError.message
        });
      }

    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Role verification failed",
        details: error.message
      });
    }
  };
}

/**
 * Middleware optionnel pour vérifier que l'utilisateur est le propriétaire d'une ressource
 */
function requireOwnership(resourceType, ownerField) {
  return async function(req, res, next) {
    try {
      if (!req.userAddress) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "User address not found"
        });
      }

      const resourceId = req.params[`${resourceType}Id`] || req.params.id || req.params.orderId;

      if (!resourceId) {
        return res.status(400).json({
          error: "Bad Request",
          message: `${resourceType}Id is required in URL parameters`
        });
      }

      try {
        const Order = require("../models/Order");

        let resource;
        const orderIdNumber = parseInt(resourceId, 10);
        if (!isNaN(orderIdNumber)) {
          resource = await Order.findOne({ orderId: orderIdNumber });
        } else {
          resource = await Order.findById(resourceId);
        }
        if (!resource) {
          return res.status(404).json({
            error: "Not Found",
            message: `${resourceType} not found`
          });
        }

        let ownerAddress;
        if (resource[ownerField]) {
          if (typeof resource[ownerField] === 'object' && resource[ownerField].address) {
            ownerAddress = resource[ownerField].address;
          } else if (typeof resource[ownerField] === 'string') {
            ownerAddress = resource[ownerField];
          } else {
            const ownerDoc = await resource.populate(ownerField);
            ownerAddress = ownerDoc[ownerField]?.address || ownerDoc[ownerField];
          }
        }

        if (!ownerAddress) {
          return res.status(500).json({
            error: "Internal Server Error",
            message: `Could not determine owner address for field: ${ownerField}`
          });
        }

        if (ownerAddress.toLowerCase() !== req.userAddress.toLowerCase()) {
          return res.status(403).json({
            error: "Forbidden",
            message: "You are not the owner of this resource"
          });
        }

        req[resourceType] = resource;

        next();
      } catch (modelError) {
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Ownership verification failed - Order model not available",
          details: modelError.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Ownership verification failed",
        details: error.message
      });
    }
  };
}

module.exports = {
  verifySignature,
  requireRole,
  requireOwnership
};

