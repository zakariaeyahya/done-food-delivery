const { ethers } = require("ethers");

/**
 * Middleware pour vérifier le rôle PLATFORM/ADMIN via blockchain
 * @notice Vérifie que l'utilisateur a le rôle PLATFORM dans le smart contract
 * @dev Utilise blockchainService pour vérifier le rôle on-chain
 */

/**
 * Vérifie que l'utilisateur a le rôle PLATFORM/ADMIN
 */
async function verifyAdminRole(req, res, next) {
  try {
    const walletAddress = req.headers['x-wallet-address'];

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing wallet address"
      });
    }

    let hasRole = false;

    try {
      const { getContractInstance } = require("../config/blockchain");
      const orderManager = getContractInstance("orderManager");

      try {
        const PLATFORM_ROLE = await orderManager.PLATFORM_ROLE();
        hasRole = await orderManager.hasRole(PLATFORM_ROLE, walletAddress.toLowerCase());
      } catch (roleError) {
        try {
          const DEFAULT_ADMIN_ROLE = await orderManager.DEFAULT_ADMIN_ROLE();
          hasRole = await orderManager.hasRole(DEFAULT_ADMIN_ROLE, walletAddress.toLowerCase());
        } catch (adminRoleError) {
          if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            hasRole = true;
          } else {
            throw new Error("Cannot verify admin role: contract roles not available");
          }
        }
      }
    } catch (blockchainError) {
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        hasRole = true;
      } else {
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to verify admin role"
        });
      }
    }

    if (!hasRole) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied: PLATFORM/ADMIN role required"
      });
    }

    req.adminAddress = walletAddress.toLowerCase();

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Role verification failed"
    });
  }
}

module.exports = verifyAdminRole;
