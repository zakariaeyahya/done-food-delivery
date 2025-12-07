const { ethers } = require("ethers");

/**
 * Middleware de validation des requêtes
 * @notice Valide les données des requêtes HTTP avant traitement
 * @dev Utilise express-validator ou validation manuelle
 */
/**
 * Valide les données de création de commande
 * @dev Implémenté
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
    // Récupérer les données du body
    const { restaurantId, items, deliveryAddress, clientAddress } = req.body;
    
    // Vérifier que restaurantId existe
    if (!restaurantId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "restaurantId is required",
        field: "restaurantId"
      });
    }
    
    // Vérifier que items existe et est un tableau
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "items must be an array",
        field: "items"
      });
    }
    
    // Vérifier que items n'est pas vide
    if (items.length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "items array cannot be empty",
        field: "items"
      });
    }
    
    // Valider chaque item du tableau
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Vérifier que name existe
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        return res.status(400).json({
          error: "Bad Request",
          message: `Item at index ${i}: name is required and must be a non-empty string`,
          field: `items[${i}].name`
        });
      }
      
      // Vérifier que quantity existe et est un nombre positif
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: `Item at index ${i}: quantity must be a positive number`,
          field: `items[${i}].quantity`
        });
      }
      
      // Vérifier que price existe et est > 0
      if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: `Item at index ${i}: price must be a positive number`,
          field: `items[${i}].price`
        });
      }
    }
    
    // Vérifier que deliveryAddress existe
    if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim() === '') {
      return res.status(400).json({
        error: "Bad Request",
        message: "deliveryAddress is required and must be a non-empty string",
        field: "deliveryAddress"
      });
    }
    
    // Optionnel: Vérifier que clientAddress est une adresse Ethereum valide
    if (clientAddress && !ethers.isAddress(clientAddress)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "clientAddress must be a valid Ethereum address",
        field: "clientAddress"
      });
    }
    
    // Si toutes les validations passent, appeler next()
    next();
  } catch (error) {
    // Logger l'erreur
    console.error("Error validating order creation:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Validation failed",
      details: error.message
    });
  }
}

/**
 * Valide que orderId existe et est valide
 * @dev Implémenté
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
    // Récupérer orderId depuis params
    const orderId = req.params.orderId || req.params.id;
    
    // Vérifier que orderId existe
    if (!orderId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "orderId is required in URL parameters",
        field: "orderId"
      });
    }
    
    // Vérifier que orderId est un nombre valide
    const orderIdNumber = parseInt(orderId, 10);
    if (isNaN(orderIdNumber) || orderIdNumber <= 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "orderId must be a positive number",
        field: "orderId"
      });
    }
    
    // Vérifier que l'order existe dans MongoDB (si le modèle existe)
    try {
      const Order = require("../models/Order");
      const order = await Order.findOne({ orderId: orderIdNumber });
      
      if (!order) {
        return res.status(404).json({
          error: "Not Found",
          message: `Order with id ${orderIdNumber} not found`
        });
      }
      
      // Ajouter l'order à req pour utilisation dans les controllers
      req.order = order;
      req.orderId = orderIdNumber;
    } catch (modelError) {
      // Si le modèle Order n'existe pas encore, on valide juste le format
      // et on ajoute l'ID à req
      req.orderId = orderIdNumber;
      console.warn("Order model not found, skipping database check:", modelError.message);
    }
    
    // Appeler next()
    next();
  } catch (error) {
    // Logger l'erreur
    console.error("Error validating order ID:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Order validation failed",
      details: error.message
    });
  }
}

/**
 * Valide qu'une adresse Ethereum est valide
 * @dev Implémenté
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
    // Récupérer l'adresse depuis params, query ou body
    const address = req.params.address || req.query.address || req.body.address;
    
    // Vérifier que l'adresse existe
    if (!address) {
      return res.status(400).json({
        error: "Bad Request",
        message: "address is required",
        field: "address"
      });
    }
    
    // Vérifier que l'adresse est valide avec ethers.isAddress()
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "address must be a valid Ethereum address",
        field: "address",
        provided: address
      });
    }
    
    // Normaliser l'adresse en minuscules et l'ajouter à req
    req.validatedAddress = address.toLowerCase();
    
    // Appeler next()
    next();
  } catch (error) {
    // Logger l'erreur
    console.error("Error validating address:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Address validation failed",
      details: error.message
    });
  }
}

/**
 * Valide les données de mise à jour de statut de commande
 * @dev Implémenté
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
function validateOrderStatusUpdate(req, res, next) {
  try {
    // Récupérer le nouveau statut depuis body
    const { status } = req.body;
    
    // Définir les statuts valides
    const validStatuses = ['CREATED', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'DISPUTED'];
    
    // Vérifier que status existe
    if (!status) {
      return res.status(400).json({
        error: "Bad Request",
        message: "status is required",
        field: "status"
      });
    }
    
    // Vérifier que status est valide
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Bad Request",
        message: `status must be one of: ${validStatuses.join(', ')}`,
        field: "status",
        provided: status
      });
    }
    
    // Ajouter le statut validé à req
    req.validatedStatus = status;
    
    // Appeler next()
    next();
  } catch (error) {
    // Logger l'erreur
    console.error("Error validating order status update:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Status validation failed",
      details: error.message
    });
  }
}

/**
 * Valide les coordonnées GPS (latitude et longitude)
 * @dev Implémenté
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
function validateGPS(req, res, next) {
  try {
    // Récupérer lat et lng depuis body ou query
    const lat = parseFloat(req.body.lat || req.query.lat);
    const lng = parseFloat(req.body.lng || req.query.lng);
    
    // Vérifier que lat existe et est un nombre
    if (isNaN(lat)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lat is required and must be a number",
        field: "lat"
      });
    }
    
    // Vérifier que lat est dans la plage valide [-90, 90]
    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lat must be between -90 and 90",
        field: "lat",
        provided: lat
      });
    }
    
    // Vérifier que lng existe et est un nombre
    if (isNaN(lng)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lng is required and must be a number",
        field: "lng"
      });
    }
    
    // Vérifier que lng est dans la plage valide [-180, 180]
    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lng must be between -180 and 180",
        field: "lng",
        provided: lng
      });
    }
    
    // Ajouter les coordonnées validées à req
    req.validatedGPS = { lat, lng };
    
    // Appeler next()
    next();
  } catch (error) {
    // Logger l'erreur
    console.error("Error validating GPS coordinates:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "GPS validation failed",
      details: error.message
    });
  }
}

/**
 * Valide les données d'un avis (review)
 * @dev Valide rating (1-5) et comment optionnel
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
function validateReview(req, res, next) {
  try {
    // Récupérer rating et comment depuis body
    const { rating, comment, clientAddress } = req.body;
    
    // Vérifier que rating existe
    if (rating === undefined || rating === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "rating is required",
        field: "rating"
      });
    }
    
    // Vérifier que rating est un nombre
    const ratingNumber = parseInt(rating, 10);
    if (isNaN(ratingNumber)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "rating must be a number",
        field: "rating"
      });
    }
    
    // Vérifier que rating est entre 1 et 5
    if (ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({
        error: "Bad Request",
        message: "rating must be between 1 and 5",
        field: "rating",
        provided: ratingNumber
      });
    }
    
    // Vérifier que clientAddress est une adresse Ethereum valide (si fournie)
    if (clientAddress && !ethers.isAddress(clientAddress)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "clientAddress must be a valid Ethereum address",
        field: "clientAddress"
      });
    }
    
    // Ajouter les données validées à req
    req.validatedReview = {
      rating: ratingNumber,
      comment: comment || "",
      clientAddress: clientAddress || null
    };
    
    // Appeler next()
    next();
  } catch (error) {
    // Logger l'erreur
    console.error("Error validating review:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Review validation failed",
      details: error.message
    });
  }
}

/**
 * Valide les coordonnées GPS pour la vérification de livraison
 * @dev Valide delivererLat, delivererLng, clientLat, clientLng
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 * @param {Function} next - Next middleware
 */
function validateGPSDelivery(req, res, next) {
  try {
    const { delivererLat, delivererLng, clientLat, clientLng } = req.body;
    
    // Fonction helper pour valider une coordonnée
    const validateCoordinate = (value, name, min, max) => {
      const coord = parseFloat(value);
      if (isNaN(coord)) {
        return { error: `${name} is required and must be a number` };
      }
      if (coord < min || coord > max) {
        return { error: `${name} must be between ${min} and ${max}`, provided: coord };
      }
      return { valid: true, value: coord };
    };
    
    // Valider delivererLat
    const delivererLatResult = validateCoordinate(delivererLat, 'delivererLat', -90, 90);
    if (delivererLatResult.error) {
      return res.status(400).json({
        error: "Bad Request",
        message: delivererLatResult.error,
        field: "delivererLat"
      });
    }
    
    // Valider delivererLng
    const delivererLngResult = validateCoordinate(delivererLng, 'delivererLng', -180, 180);
    if (delivererLngResult.error) {
      return res.status(400).json({
        error: "Bad Request",
        message: delivererLngResult.error,
        field: "delivererLng"
      });
    }
    
    // Valider clientLat
    const clientLatResult = validateCoordinate(clientLat, 'clientLat', -90, 90);
    if (clientLatResult.error) {
      return res.status(400).json({
        error: "Bad Request",
        message: clientLatResult.error,
        field: "clientLat"
      });
    }
    
    // Valider clientLng
    const clientLngResult = validateCoordinate(clientLng, 'clientLng', -180, 180);
    if (clientLngResult.error) {
      return res.status(400).json({
        error: "Bad Request",
        message: clientLngResult.error,
        field: "clientLng"
      });
    }
    
    // Ajouter les coordonnées validées à req
    req.validatedGPSDelivery = {
      delivererLat: delivererLatResult.value,
      delivererLng: delivererLngResult.value,
      clientLat: clientLatResult.value,
      clientLng: clientLngResult.value
    };
    
    // Appeler next()
    next();
  } catch (error) {
    // Logger l'erreur
    console.error("Error validating GPS delivery coordinates:", error);
    
    // Retourner erreur 500
    return res.status(500).json({
      error: "Internal Server Error",
      message: "GPS delivery validation failed",
      details: error.message
    });
  }
}

// Exporter toutes les fonctions
module.exports = {
  validateOrderCreation,
  validateOrderId,
  validateAddress,
  validateGPS,
  validateGPSDelivery,
  validateReview,
  validateOrderStatusUpdate
};

