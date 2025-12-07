const { ethers } = require("ethers");

/**
 * Middleware d'authentification Web3
 * @notice Vérifie les signatures Web3 et les rôles des utilisateurs
 * @dev Utilise ethers.js pour vérifier les signatures de messages
 */
/**
 * Vérifie la signature Web3 dans le header Authorization
 * @dev Implémenté
 * 
 * Format du header:
 * Authorization: Bearer <signature>
 * 
 * Le message signé doit être envoyé dans le body ou header:
 * - Option 1: Header x-message avec le message original
 * - Option 2: Body avec message et signature
 * 
 * Étapes:
 * 1. Récupérer la signature depuis Authorization header
 * 2. Récupérer le message signé (header ou body)
 * 3. Utiliser ethers.verifyMessage() pour récupérer l'adresse
 * 4. Vérifier que l'adresse correspond
 * 5. Ajouter req.userAddress pour les controllers
 * 6. Next() si valide, sinon error 401
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
async function verifySignature(req, res, next) {
  try {
    // Récupérer le header Authorization
    const authHeader = req.headers.authorization;
    
    // Vérifier que le header existe et commence par "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid Authorization header. Expected: Bearer <signature>"
      });
    }
    
    // Extraire la signature (après "Bearer ")
    const signature = authHeader.substring(7); // Enlever "Bearer "
    
    // Récupérer le message signé
    // Option 1: Depuis header x-message
    // Option 2: Depuis body
    const message = req.headers['x-message'] || req.body.message;
    
    // Vérifier que le message existe
    if (!message) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Message to verify is required. Provide it in header 'x-message' or body.message"
      });
    }
    
    // En mode développement/test, accepter "mock_signature_for_testing"
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    const isMockSignature = signature === 'mock_signature_for_testing';
    
    if (isMockSignature && isDevelopment) {
      // En mode dev/test, utiliser l'adresse depuis le header x-wallet-address
      const mockAddress = req.headers['x-wallet-address'] || req.body.address;
      if (!mockAddress) {
        return res.status(400).json({
          error: "Bad Request",
          message: "x-wallet-address header is required when using mock signature"
        });
      }
      req.userAddress = mockAddress.toLowerCase();
      if (process.env.NODE_ENV === 'development') {
        console.log(`Mock signature accepted for address: ${req.userAddress}`);
      }
      return next();
    }
    
    // Vérifier que la signature est valide (format hex - 65 bytes = 130 caractères hex)
    if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid signature format"
      });
    }
    
    // Vérifier la signature avec ethers.verifyMessage()
    // Note: ethers v6 utilise verifyMessage directement
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Normaliser l'adresse en minuscules pour comparaison
    const normalizedAddress = recoveredAddress.toLowerCase();
    
    // Optionnel: Vérifier que l'adresse correspond à celle dans le body/header
    const expectedAddress = req.body.address || req.headers['x-address'];
    if (expectedAddress && expectedAddress.toLowerCase() !== normalizedAddress) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Signature does not match the provided address"
      });
    }
    
    // Ajouter l'adresse récupérée à req pour les controllers
    req.userAddress = normalizedAddress;
    
    // Logger pour debug (optionnel, seulement en développement)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Signature verified for address: ${normalizedAddress}`);
    }
    
    // Appeler next() pour passer au middleware suivant
    next();
  } catch (error) {
    // Logger l'erreur
    console.error("Error verifying signature:", error);
    
    // Retourner erreur 401
    return res.status(401).json({
      error: "Unauthorized",
      message: "Signature verification failed",
      details: error.message
    });
  }
}

/**
 * Middleware factory pour vérifier un rôle spécifique
 * @dev Implémenté
 * 
 * Utilisation:
 * router.post('/orders', verifySignature, requireRole('CLIENT_ROLE'), orderController.createOrder);
 * router.post('/prepare', verifySignature, requireRole('RESTAURANT_ROLE'), orderController.confirmPreparation);
 * 
 * @param {string} role - Rôle requis ('CLIENT_ROLE', 'RESTAURANT_ROLE', 'DELIVERER_ROLE', 'PLATFORM_ROLE', 'ARBITRATOR_ROLE')
 * @returns {Function} Middleware Express
 */
function requireRole(role) {
  return async function(req, res, next) {
    try {
      // Vérifier que req.userAddress existe (doit être appelé après verifySignature)
      if (!req.userAddress) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "User address not found. verifySignature middleware must be called first."
        });
      }
      
      // Récupérer l'adresse normalisée
      const userAddress = req.userAddress.toLowerCase();
      
      // Option 1: Vérifier le rôle depuis MongoDB (temporaire, avant blockchain)
      try {
        const User = require("../models/User");
        const Restaurant = require("../models/Restaurant");
        const Deliverer = require("../models/Deliverer");
        
        let hasRole = false;
        
        if (role === 'CLIENT_ROLE') {
          const user = await User.findByAddress(userAddress);
          hasRole = !!user; // Tout utilisateur enregistré est un client
        } else if (role === 'RESTAURANT_ROLE') {
          const restaurant = await Restaurant.findByAddress(userAddress);
          hasRole = !!restaurant;
        } else if (role === 'DELIVERER_ROLE') {
          const deliverer = await Deliverer.findByAddress(userAddress);
          hasRole = !!deliverer;
        } else {
          // Pour les autres rôles (PLATFORM_ROLE, ARBITRATOR_ROLE), nécessite blockchain
          console.warn(`Role ${role} requires blockchain verification (not implemented yet)`);
          return res.status(403).json({
            error: "Forbidden",
            message: `Role ${role} verification requires blockchain (not implemented yet)`
          });
        }
        
        // Vérifier si l'utilisateur a le rôle requis
        if (!hasRole) {
          return res.status(403).json({
            error: "Forbidden",
            message: `Access denied. Required role: ${role}`
          });
        }
        
        // Ajouter le rôle à req pour utilisation dans les controllers
        req.userRole = role;
        
        // Logger pour debug (optionnel)
        if (process.env.NODE_ENV === 'development') {
          console.log(`Role ${role} verified for address: ${userAddress}`);
        }
        
        // Appeler next() pour passer au middleware suivant
        next();
      } catch (modelError) {
        // Si les modèles n'existent pas encore, on ne peut pas vérifier les rôles
        console.warn("Models not found, cannot verify role:", modelError.message);
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Role verification failed - models not available",
          details: modelError.message
        });
      }
      
      // TODO: Option 2: Vérifier le rôle depuis la blockchain (plus sécurisé)
      // À implémenter quand blockchain.js sera disponible
      // const { getContractInstance } = require("../config/blockchain");
      // const orderManager = getContractInstance("orderManager");
      // 
      // // Définir les rôles bytes32
      // const roles = {
      //   CLIENT_ROLE: ethers.keccak256(ethers.toUtf8Bytes("CLIENT_ROLE")),
      //   RESTAURANT_ROLE: ethers.keccak256(ethers.toUtf8Bytes("RESTAURANT_ROLE")),
      //   DELIVERER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("DELIVERER_ROLE")),
      //   PLATFORM_ROLE: ethers.keccak256(ethers.toUtf8Bytes("PLATFORM_ROLE")),
      //   ARBITRATOR_ROLE: ethers.keccak256(ethers.toUtf8Bytes("ARBITRATOR_ROLE"))
      // };
      // 
      // const roleHash = roles[role];
      // if (!roleHash) {
      //   return res.status(500).json({
      //     error: "Internal Server Error",
      //     message: `Unknown role: ${role}`
      //   });
      // }
      // 
      // const hasRole = await orderManager.hasRole(roleHash, userAddress);
    } catch (error) {
      // Logger l'erreur
      console.error("Error verifying role:", error);
      
      // Retourner erreur 500
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
 * @dev Implémenté
 * 
 * Utilisation:
 * router.put('/orders/:orderId', verifySignature, requireOwnership('order', 'client'), orderController.updateOrder);
 * 
 * @param {string} resourceType - Type de ressource ('order', 'restaurant', etc.)
 * @param {string} ownerField - Champ contenant l'adresse du propriétaire ('client', 'restaurant', 'deliverer')
 * @returns {Function} Middleware Express
 */
function requireOwnership(resourceType, ownerField) {
  return async function(req, res, next) {
    try {
      // Vérifier que req.userAddress existe
      if (!req.userAddress) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "User address not found"
        });
      }
      
      // Récupérer l'ID de la ressource depuis params
      const resourceId = req.params[`${resourceType}Id`] || req.params.id || req.params.orderId;
      
      if (!resourceId) {
        return res.status(400).json({
          error: "Bad Request",
          message: `${resourceType}Id is required in URL parameters`
        });
      }
      
      // Charger la ressource depuis MongoDB
      try {
        const Order = require("../models/Order");
        
        // Essayer de trouver par orderId (blockchain ID) ou _id (MongoDB)
        let resource;
        const orderIdNumber = parseInt(resourceId, 10);
        if (!isNaN(orderIdNumber)) {
          resource = await Order.findOne({ orderId: orderIdNumber });
        } else {
          resource = await Order.findById(resourceId);
        }
        
        // Vérifier que la ressource existe
        if (!resource) {
          return res.status(404).json({
            error: "Not Found",
            message: `${resourceType} not found`
          });
        }
        
        // Vérifier que l'utilisateur est le propriétaire
        // Le ownerField peut être une référence (ObjectId) ou une adresse directe
        let ownerAddress;
        if (resource[ownerField]) {
          // Si c'est une référence MongoDB, on doit populate ou accéder à l'adresse
          if (typeof resource[ownerField] === 'object' && resource[ownerField].address) {
            ownerAddress = resource[ownerField].address;
          } else if (typeof resource[ownerField] === 'string') {
            ownerAddress = resource[ownerField];
          } else {
            // Si c'est un ObjectId, on doit fetch le document
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
        
        // Ajouter la ressource à req pour utilisation dans les controllers
        req[resourceType] = resource;
        
        // Appeler next()
        next();
      } catch (modelError) {
        // Si le modèle Order n'existe pas encore, on ne peut pas vérifier la propriété
        console.warn("Order model not found, cannot verify ownership:", modelError.message);
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Ownership verification failed - Order model not available",
          details: modelError.message
        });
      }
    } catch (error) {
      // Logger l'erreur
      console.error("Error verifying ownership:", error);
      
      // Retourner erreur 500
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Ownership verification failed",
        details: error.message
      });
    }
  };
}

// Exporter les fonctions
module.exports = {
  verifySignature,
  requireRole,
  requireOwnership
};

