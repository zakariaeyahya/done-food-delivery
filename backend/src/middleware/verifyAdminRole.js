const { ethers } = require("ethers");

// Importer le service blockchain (pour vérifier les rôles)
// const blockchainService = require("../services/blockchainService");

/**
 * Middleware pour vérifier le rôle PLATFORM/ADMIN via blockchain
 * @notice Vérifie que l'utilisateur a le rôle PLATFORM dans le smart contract
 * @dev Utilise blockchainService pour vérifier le rôle on-chain
 * 
 * Implémenté avec fallback mock en développement si blockchain non disponible
 * 
 * Format du header:
 * x-wallet-address: 0x...
 * Authorization: Bearer <signature> (optionnel pour vérification signature)
 */

/**
 * Vérifie que l'utilisateur a le rôle PLATFORM/ADMIN
 * @dev Vérifie le rôle via smart contract DoneOrderManager.hasRole(PLATFORM_ROLE, address)
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
async function verifyAdminRole(req, res, next) {
  try {
    // Récupérer l'adresse wallet depuis header
    const walletAddress = req.headers['x-wallet-address'];
    
    // Vérifier que l'adresse est fournie et valide
    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing wallet address"
      });
    }
    
    // Vérifier rôle PLATFORM via blockchain
    let hasRole = false;
    
    try {
      const { getContractInstance } = require("../config/blockchain");
      const orderManager = getContractInstance("orderManager");
      
      // Récupérer PLATFORM_ROLE depuis le contrat
      // Note: Si le contrat n'a pas PLATFORM_ROLE, on peut utiliser DEFAULT_ADMIN_ROLE
      try {
        const PLATFORM_ROLE = await orderManager.PLATFORM_ROLE();
        hasRole = await orderManager.hasRole(PLATFORM_ROLE, walletAddress.toLowerCase());
      } catch (roleError) {
        // Si PLATFORM_ROLE n'existe pas, essayer DEFAULT_ADMIN_ROLE
        try {
          const DEFAULT_ADMIN_ROLE = await orderManager.DEFAULT_ADMIN_ROLE();
          hasRole = await orderManager.hasRole(DEFAULT_ADMIN_ROLE, walletAddress.toLowerCase());
        } catch (adminRoleError) {
          // Si aucun rôle n'est disponible, utiliser vérification mock en développement
          if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            console.warn("⚠️  Blockchain role verification not available, using mock in development");
            hasRole = true; // Mock pour développement
          } else {
            throw new Error("Cannot verify admin role: contract roles not available");
          }
        }
      }
    } catch (blockchainError) {
      // Si la vérification blockchain échoue, utiliser mock en développement
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        console.warn("⚠️  Blockchain verification failed, using mock in development:", blockchainError.message);
        hasRole = true; // Mock pour développement
      } else {
        console.error("Error verifying admin role:", blockchainError);
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
    
    // Ajouter l'adresse admin à la requête pour utilisation dans les controllers
    req.adminAddress = walletAddress.toLowerCase();
    
    // Continuer vers le prochain middleware/controller
    next();
  } catch (error) {
    console.error("Admin role verification failed:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Role verification failed"
    });
  }
}

// Exporter la fonction
module.exports = verifyAdminRole;

