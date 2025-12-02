// TODO: Importer ethers pour la validation d'adresses
// const { ethers } = require("ethers");

// TODO: Importer les modèles MongoDB pour vérifier l'existence
// const Order = require("../models/Order");

/**
 * Middleware de validation des requêtes
 * @notice Valide les données des requêtes HTTP avant traitement
 * @dev Utilise express-validator ou validation manuelle
 */
/**
 * Valide les données de création de commande
 * @dev TODO: Implémenter la fonction validateOrderCreation
 * 
 * Vérifie:
 * - restaurantId existe dans body
 * - items[] existe et n'est pas vide
 * - Chaque item a name, quantity, price
 * - prices > 0 pour chaque item
 * - deliveryAddress existe
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
function validateOrderCreation(req, res, next) {
  try {
    // TODO: Récupérer les données du body
    // const { restaurantId, items, deliveryAddress, clientAddress } = req.body;
    
    // TODO: Vérifier que restaurantId existe
    // if (!restaurantId) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "restaurantId is required",
    //     field: "restaurantId"
    //   });
    // }
    
    // TODO: Vérifier que items existe et est un tableau
    // if (!items || !Array.isArray(items)) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "items must be an array",
    //     field: "items"
    //   });
    // }
    
    // TODO: Vérifier que items n'est pas vide
    // if (items.length === 0) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "items array cannot be empty",
    //     field: "items"
    //   });
    // }
    
    // TODO: Valider chaque item du tableau
    // for (let i = 0; i < items.length; i++) {
    //   const item = items[i];
    //   
    //   // TODO: Vérifier que name existe
    //   if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
    //     return res.status(400).json({
    //       error: "Bad Request",
    //       message: `Item at index ${i}: name is required and must be a non-empty string`,
    //       field: `items[${i}].name`
    //     });
    //   }
    //   
    //   // TODO: Vérifier que quantity existe et est un nombre positif
    //   if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
    //     return res.status(400).json({
    //       error: "Bad Request",
    //       message: `Item at index ${i}: quantity must be a positive number`,
    //       field: `items[${i}].quantity`
    //     });
    //   }
    //   
    //   // TODO: Vérifier que price existe et est > 0
    //   if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
    //     return res.status(400).json({
    //       error: "Bad Request",
    //       message: `Item at index ${i}: price must be a positive number`,
    //       field: `items[${i}].price`
    //     });
    //   }
    // }
    
    // TODO: Vérifier que deliveryAddress existe
    // if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim() === '') {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "deliveryAddress is required and must be a non-empty string",
    //     field: "deliveryAddress"
    //   });
    // }
    
    // TODO: Optionnel: Vérifier que clientAddress est une adresse Ethereum valide
    // if (clientAddress && !ethers.isAddress(clientAddress)) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "clientAddress must be a valid Ethereum address",
    //     field: "clientAddress"
    //   });
    // }
    
    // TODO: Si toutes les validations passent, appeler next()
    // next();
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error validating order creation:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Validation failed",
    //   details: error.message
    // });
  }
}

/**
 * Valide que orderId existe et est valide
 * @dev TODO: Implémenter la fonction validateOrderId
 * 
 * Vérifie:
 * - orderId existe dans params
 * - orderId est un nombre valide
 * - order existe dans MongoDB
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
async function validateOrderId(req, res, next) {
  try {
    // TODO: Récupérer orderId depuis params
    // const orderId = req.params.orderId;
    
    // TODO: Vérifier que orderId existe
    // if (!orderId) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "orderId is required in URL parameters",
    //     field: "orderId"
    //   });
    // }
    
    // TODO: Vérifier que orderId est un nombre valide
    // const orderIdNumber = parseInt(orderId, 10);
    // if (isNaN(orderIdNumber) || orderIdNumber <= 0) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "orderId must be a positive number",
    //     field: "orderId"
    //   });
    // }
    
    // TODO: Vérifier que l'order existe dans MongoDB
    // const Order = require("../models/Order");
    // const order = await Order.findOne({ orderId: orderIdNumber });
    // 
    // if (!order) {
    //   return res.status(404).json({
    //     error: "Not Found",
    //     message: `Order with id ${orderIdNumber} not found`
    //   });
    // }
    
    // TODO: Ajouter l'order à req pour utilisation dans les controllers
    // req.order = order;
    // req.orderId = orderIdNumber;
    
    // TODO: Appeler next()
    // next();
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error validating order ID:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Order validation failed",
    //   details: error.message
    // });
  }
}

/**
 * Valide qu'une adresse Ethereum est valide
 * @dev TODO: Implémenter la fonction validateAddress
 * 
 * Vérifie:
 * - address existe dans params, query ou body
 * - address est une adresse Ethereum valide via ethers.isAddress()
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
function validateAddress(req, res, next) {
  try {
    // TODO: Récupérer l'adresse depuis params, query ou body
    // const address = req.params.address || req.query.address || req.body.address;
    
    // TODO: Vérifier que l'adresse existe
    // if (!address) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "address is required",
    //     field: "address"
    //   });
    // }
    
    // TODO: Vérifier que l'adresse est valide avec ethers.isAddress()
    // if (!ethers.isAddress(address)) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "address must be a valid Ethereum address",
    //     field: "address",
    //     provided: address
    //   });
    // }
    
    // TODO: Normaliser l'adresse en minuscules et l'ajouter à req
    // req.validatedAddress = address.toLowerCase();
    
    // TODO: Appeler next()
    // next();
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error validating address:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Address validation failed",
    //   details: error.message
    // });
  }
}

/**
 * Valide les données de mise à jour de statut de commande
 * @dev TODO: Implémenter la fonction validateOrderStatusUpdate
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
function validateOrderStatusUpdate(req, res, next) {
  try {
    // TODO: Récupérer le nouveau statut depuis body
    // const { status } = req.body;
    
    // TODO: Définir les statuts valides
    // const validStatuses = ['CREATED', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'DISPUTED'];
    
    // TODO: Vérifier que status existe
    // if (!status) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "status is required",
    //     field: "status"
    //   });
    // }
    
    // TODO: Vérifier que status est valide
    // if (!validStatuses.includes(status)) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: `status must be one of: ${validStatuses.join(', ')}`,
    //     field: "status",
    //     provided: status
    //   });
    // }
    
    // TODO: Ajouter le statut validé à req
    // req.validatedStatus = status;
    
    // TODO: Appeler next()
    // next();
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error validating order status update:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "Status validation failed",
    //   details: error.message
    // });
  }
}

/**
 * Valide les coordonnées GPS (latitude et longitude)
 * @dev TODO: Implémenter la fonction validateGPS
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
function validateGPS(req, res, next) {
  try {
    // TODO: Récupérer lat et lng depuis body ou query
    // const lat = parseFloat(req.body.lat || req.query.lat);
    // const lng = parseFloat(req.body.lng || req.query.lng);
    
    // TODO: Vérifier que lat existe et est un nombre
    // if (isNaN(lat)) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "lat is required and must be a number",
    //     field: "lat"
    //   });
    // }
    
    // TODO: Vérifier que lat est dans la plage valide [-90, 90]
    // if (lat < -90 || lat > 90) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "lat must be between -90 and 90",
    //     field: "lat",
    //     provided: lat
    //   });
    // }
    
    // TODO: Vérifier que lng existe et est un nombre
    // if (isNaN(lng)) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "lng is required and must be a number",
    //     field: "lng"
    //   });
    // }
    
    // TODO: Vérifier que lng est dans la plage valide [-180, 180]
    // if (lng < -180 || lng > 180) {
    //   return res.status(400).json({
    //     error: "Bad Request",
    //     message: "lng must be between -180 and 180",
    //     field: "lng",
    //     provided: lng
    //   });
    // }
    
    // TODO: Ajouter les coordonnées validées à req
    // req.validatedGPS = { lat, lng };
    
    // TODO: Appeler next()
    // next();
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error validating GPS coordinates:", error);
    
    // TODO: Retourner erreur 500
    // return res.status(500).json({
    //   error: "Internal Server Error",
    //   message: "GPS validation failed",
    //   details: error.message
    // });
  }
}

// TODO: Exporter toutes les fonctions
// module.exports = {
//   validateOrderCreation,
//   validateOrderId,
//   validateAddress,
//   validateOrderStatusUpdate,
//   validateGPS
// };

