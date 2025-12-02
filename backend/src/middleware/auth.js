// TODO: Importer ethers pour la vérification de signatures
// const { ethers } = require("ethers");

// TODO: Importer les modèles MongoDB si nécessaire pour vérifier les rôles
// const User = require("../models/User");
// const Restaurant = require("../models/Restaurant");
// const Deliverer = require("../models/Deliverer");

// TODO: Importer le service blockchain pour vérifier les rôles on-chain
// const { getContractInstance } = require("../config/blockchain");

/**
 * Middleware d'authentification Web3
 * @notice Vérifie les signatures Web3 et les rôles des utilisateurs
 * @dev Utilise ethers.js pour vérifier les signatures de messages
 */
/**
 * Vérifie la signature Web3 dans le header Authorization
 * @dev TODO: Implémenter la fonction verifySignature
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
    // TODO: Récupérer le header Authorization
    // const authHeader = req.headers.authorization;
    
    // TODO: Vérifier que le header existe et commence par "Bearer "
    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return res.status(401).json({
    //     error: "Unauthorized",
    //     message: "Missing or invalid Authorization header. Expected: Bearer <signature>"
    //   });
    // }
    
    // TODO: Extraire la signature (après "Bearer ")
    // const signature = authHeader.substring(7); // Enlever "Bearer "
    
    // TODO: Récupérer le message signé
    // Option 1: Depuis header x-message
    // const message = req.headers['x-message'];
    
    // Option 2: Depuis body
    // const message = req.body.message;
    
    // TODO: Vérifier que le message existe
    // if (!message) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "Message to verify is required. Provide it in header 'x-message' or body.message"
    //   });
    // }
    
    // TODO: Vérifier que la signature est valide (format hex)
    // if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "Invalid signature format"
    //   });
    // }
    
    // TODO: Vérifier la signature avec ethers.verifyMessage()
    // const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    // Note: Pour ethers v6, utiliser: ethers.verifyMessage(message, signature)
    
    // TODO: Normaliser l'adresse en minuscules pour comparaison
    // const normalizedAddress = recoveredAddress.toLowerCase();
    
    // TODO: Optionnel: Vérifier que l'adresse correspond à celle dans le body/header
    // const expectedAddress = req.body.address || req.headers['x-address'];
    // if (expectedAddress && expectedAddress.toLowerCase() !== normalizedAddress) {
    //   return res.status(401).json({
    //     error: "Unauthorized",
    //     message: "Signature does not match the provided address"
    //   });
    // }
    
    // TODO: Ajouter l'adresse récupérée à req pour les controllers
    // req.userAddress = normalizedAddress;
    
    // TODO: Logger pour debug (optionnel)
    // console.log(`Signature verified for address: ${normalizedAddress}`);
    
    // TODO: Appeler next() pour passer au middleware suivant
    // next();
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error verifying signature:", error);
    
    // TODO: Retourner erreur 401
    // return res.status(401).json({
    //   error: "Unauthorized",
    //   message: "Signature verification failed",
    //   details: error.message
    // });
  }
}

/**
 * Middleware factory pour vérifier un rôle spécifique
 * @dev TODO: Implémenter la fonction requireRole
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
      // TODO: Vérifier que req.userAddress existe (doit être appelé après verifySignature)
      // if (!req.userAddress) {
      //   return res.status(401).json({
      //     error: "Unauthorized",
      //     message: "User address not found. verifySignature middleware must be called first."
      //   });
      // }
      
      // TODO: Récupérer l'adresse normalisée
      // const userAddress = req.userAddress.toLowerCase();
      
      // TODO: Option 1: Vérifier le rôle depuis MongoDB
      // const User = require("../models/User");
      // const Restaurant = require("../models/Restaurant");
      // const Deliverer = require("../models/Deliverer");
      // 
      // let hasRole = false;
      // 
      // if (role === 'CLIENT_ROLE') {
      //   const user = await User.findOne({ address: userAddress });
      //   hasRole = !!user; // Tout utilisateur enregistré est un client
      // } else if (role === 'RESTAURANT_ROLE') {
      //   const restaurant = await Restaurant.findOne({ address: userAddress });
      //   hasRole = !!restaurant;
      // } else if (role === 'DELIVERER_ROLE') {
      //   const deliverer = await Deliverer.findOne({ address: userAddress });
      //   hasRole = !!deliverer;
      // }
      
      // TODO: Option 2: Vérifier le rôle depuis la blockchain (plus sécurisé)
      // const { getContractInstance } = require("../config/blockchain");
      // const orderManager = getContractInstance("orderManager");
      // 
      // // Définir les rôles bytes32
      // const roles = {
      //   CLIENT_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("CLIENT_ROLE")),
      //   RESTAURANT_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RESTAURANT_ROLE")),
      //   DELIVERER_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DELIVERER_ROLE")),
      //   PLATFORM_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PLATFORM_ROLE")),
      //   ARBITRATOR_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ARBITRATOR_ROLE"))
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
      
      // TODO: Vérifier si l'utilisateur a le rôle requis
      // if (!hasRole) {
      //   return res.status(403).json({
      //     error: "Forbidden",
      //     message: `Access denied. Required role: ${role}`
      //   });
      // }
      
      // TODO: Ajouter le rôle à req pour utilisation dans les controllers
      // req.userRole = role;
      
      // TODO: Logger pour debug (optionnel)
      // console.log(`Role ${role} verified for address: ${userAddress}`);
      
      // TODO: Appeler next() pour passer au middleware suivant
      // next();
    } catch (error) {
      // TODO: Logger l'erreur
      // console.error("Error verifying role:", error);
      
      // TODO: Retourner erreur 500
      // return res.status(500).json({
      //   error: "Internal Server Error",
      //   message: "Role verification failed",
      //   details: error.message
      // });
    }
  };
}

/**
 * Middleware optionnel pour vérifier que l'utilisateur est le propriétaire d'une ressource
 * @dev TODO: Implémenter la fonction requireOwnership
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
      // TODO: Vérifier que req.userAddress existe
      // if (!req.userAddress) {
      //   return res.status(401).json({
      //     error: "Unauthorized",
      //     message: "User address not found"
      //   });
      // }
      
      // TODO: Récupérer l'ID de la ressource depuis params
      // const resourceId = req.params[`${resourceType}Id`] || req.params.id;
      
      // TODO: Charger la ressource depuis MongoDB
      // const Order = require("../models/Order");
      // const resource = await Order.findById(resourceId);
      
      // TODO: Vérifier que la ressource existe
      // if (!resource) {
      //   return res.status(404).json({
      //     error: "Not Found",
      //     message: `${resourceType} not found`
      //   });
      // }
      
      // TODO: Vérifier que l'utilisateur est le propriétaire
      // const ownerAddress = resource[ownerField]?.address || resource[ownerField];
      // if (ownerAddress.toLowerCase() !== req.userAddress.toLowerCase()) {
      //   return res.status(403).json({
      //     error: "Forbidden",
      //     message: "You are not the owner of this resource"
      //   });
      // }
      
      // TODO: Ajouter la ressource à req pour utilisation dans les controllers
      // req[resourceType] = resource;
      
      // TODO: Appeler next()
      // next();
    } catch (error) {
      // TODO: Logger l'erreur
      // console.error("Error verifying ownership:", error);
      
      // TODO: Retourner erreur 500
      // return res.status(500).json({
      //   error: "Internal Server Error",
      //   message: "Ownership verification failed",
      //   details: error.message
      // });
    }
  };
}

// TODO: Exporter les fonctions
// module.exports = {
//   verifySignature,
//   requireRole,
//   requireOwnership
// };

