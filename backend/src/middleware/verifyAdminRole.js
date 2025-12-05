const { ethers } = require("ethers");

// Importer le service blockchain (pour vérifier les rôles)
// const blockchainService = require("../services/blockchainService");

/**
 * Middleware pour vérifier le rôle PLATFORM/ADMIN via blockchain
 * @notice Vérifie que l'utilisateur a le rôle PLATFORM dans le smart contract
 * @dev Utilise blockchainService pour vérifier le rôle on-chain
 * 
 * ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
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
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - À implémenter après déploiement smart contracts
    // Vérifier rôle PLATFORM via blockchain
    // 
    // Option 1: Via smart contract DoneOrderManager
    // const hasRole = await blockchainService.hasRole('PLATFORM_ROLE', walletAddress);
    // 
    // Option 2: Via appel direct au contrat
    // const orderManager = blockchainService.getContractInstance('DoneOrderManager');
    // const PLATFORM_ROLE = await orderManager.PLATFORM_ROLE();
    // const hasRole = await orderManager.hasRole(PLATFORM_ROLE, walletAddress);
    //
    // Pour l'instant, vérification mock (à remplacer par vraie vérification blockchain)
    // ⚠️ TEMPORAIRE: Permet l'accès pour développement (à désactiver en production)
    const hasRole = true; // Mock - À remplacer par vérification blockchain
    
    // ⏳ PSEUDOCODE BLOCKCHAIN - Code réel à implémenter:
    // try {
    //   const orderManager = blockchainService.getContractInstance('DoneOrderManager');
    //   const PLATFORM_ROLE = await orderManager.PLATFORM_ROLE();
    //   const hasRole = await orderManager.hasRole(PLATFORM_ROLE, walletAddress.toLowerCase());
    //   
    //   if (!hasRole) {
    //     return res.status(403).json({
    //       error: "Forbidden",
    //       message: "Access denied: PLATFORM/ADMIN role required"
    //     });
    //   }
    // } catch (error) {
    //   console.error("Error verifying admin role:", error);
    //   return res.status(500).json({
    //     error: "Internal Server Error",
    //     message: "Failed to verify admin role"
    //   });
    // }
    
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

