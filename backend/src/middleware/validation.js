const { ethers } = require("ethers");

/**
 * Middleware de validation des requêtes
 * @notice Valide les données des requêtes HTTP avant traitement
 * @dev Utilise express-validator ou validation manuelle
 */

/**
 * Valide les données de création de commande
 */
function validateOrderCreation(req, res, next) {
  try {
    const { restaurantId, restaurantAddress, items, deliveryAddress, clientAddress } = req.body;

    if (!restaurantId && !restaurantAddress) {
      return res.status(400).json({
        error: "Bad Request",
        message: "restaurantId or restaurantAddress is required",
        field: "restaurantId"
      });
    }

    if (restaurantAddress && !ethers.isAddress(restaurantAddress)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "restaurantAddress must be a valid Ethereum address",
        field: "restaurantAddress"
      });
    }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "items must be an array",
        field: "items"
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "items array cannot be empty",
        field: "items"
      });
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        return res.status(400).json({
          error: "Bad Request",
          message: `Item at index ${i}: name is required and must be a non-empty string`,
          field: `items[${i}].name`
        });
      }

      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: `Item at index ${i}: quantity must be a positive number`,
          field: `items[${i}].quantity`
        });
      }

      if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: `Item at index ${i}: price must be a positive number`,
          field: `items[${i}].price`
        });
      }
    }

    if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim() === '') {
      return res.status(400).json({
        error: "Bad Request",
        message: "deliveryAddress is required and must be a non-empty string",
        field: "deliveryAddress"
      });
    }

    if (clientAddress && !ethers.isAddress(clientAddress)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "clientAddress must be a valid Ethereum address",
        field: "clientAddress"
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Validation failed",
      details: error.message
    });
  }
}

/**
 * Valide que orderId existe et est valide
 */
async function validateOrderId(req, res, next) {
  try {
    const orderId = req.params.orderId || req.params.id;

    if (!orderId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "orderId is required in URL parameters",
        field: "orderId"
      });
    }

    const orderIdNumber = parseInt(orderId, 10);
    if (isNaN(orderIdNumber) || orderIdNumber <= 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "orderId must be a positive number",
        field: "orderId"
      });
    }

    try {
      const Order = require("../models/Order");
      const order = await Order.findOne({ orderId: orderIdNumber });

      if (!order) {
        return res.status(404).json({
          error: "Not Found",
          message: `Order with id ${orderIdNumber} not found`
        });
      }

      req.order = order;
      req.orderId = orderIdNumber;
    } catch (modelError) {
      req.orderId = orderIdNumber;
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Order validation failed",
      details: error.message
    });
  }
}

/**
 * Valide qu'une adresse Ethereum est valide
 */
function validateAddress(req, res, next) {
  try {
    const address = req.params.address || req.query.address || req.body.address;

    if (!address) {
      return res.status(400).json({
        error: "Bad Request",
        message: "address is required",
        field: "address"
      });
    }

    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "address must be a valid Ethereum address",
        field: "address",
        provided: address
      });
    }

    req.validatedAddress = address.toLowerCase();

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Address validation failed",
      details: error.message
    });
  }
}

/**
 * Valide les données de mise à jour de statut de commande
 */
function validateOrderStatusUpdate(req, res, next) {
  try {
    const { status } = req.body;

    const validStatuses = ['CREATED', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'DISPUTED'];

    if (!status) {
      return res.status(400).json({
        error: "Bad Request",
        message: "status is required",
        field: "status"
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Bad Request",
        message: `status must be one of: ${validStatuses.join(', ')}`,
        field: "status",
        provided: status
      });
    }

    req.validatedStatus = status;

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Status validation failed",
      details: error.message
    });
  }
}

/**
 * Valide les coordonnées GPS (latitude et longitude)
 */
function validateGPS(req, res, next) {
  try {
    const lat = parseFloat(req.body.lat || req.query.lat);
    const lng = parseFloat(req.body.lng || req.query.lng);

    if (isNaN(lat)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lat is required and must be a number",
        field: "lat"
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lat must be between -90 and 90",
        field: "lat",
        provided: lat
      });
    }

    if (isNaN(lng)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lng is required and must be a number",
        field: "lng"
      });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lng must be between -180 and 180",
        field: "lng",
        provided: lng
      });
    }

    req.validatedGPS = { lat, lng };

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "GPS validation failed",
      details: error.message
    });
  }
}

/**
 * Valide les données d'un avis (review)
 */
function validateReview(req, res, next) {
  try {
    const { rating, comment, clientAddress } = req.body;

    if (rating === undefined || rating === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "rating is required",
        field: "rating"
      });
    }

    const ratingNumber = parseInt(rating, 10);
    if (isNaN(ratingNumber)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "rating must be a number",
        field: "rating"
      });
    }

    if (ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({
        error: "Bad Request",
        message: "rating must be between 1 and 5",
        field: "rating",
        provided: ratingNumber
      });
    }

    if (clientAddress && !ethers.isAddress(clientAddress)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "clientAddress must be a valid Ethereum address",
        field: "clientAddress"
      });
    }

    req.validatedReview = {
      rating: ratingNumber,
      comment: comment || "",
      clientAddress: clientAddress || null
    };

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Review validation failed",
      details: error.message
    });
  }
}

/**
 * Valide les coordonnées GPS pour la vérification de livraison
 */
function validateGPSDelivery(req, res, next) {
  try {
    const { delivererLat, delivererLng, clientLat, clientLng } = req.body;

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

    const delivererLatResult = validateCoordinate(delivererLat, 'delivererLat', -90, 90);
    if (delivererLatResult.error) {
      return res.status(400).json({
        error: "Bad Request",
        message: delivererLatResult.error,
        field: "delivererLat"
      });
    }

    const delivererLngResult = validateCoordinate(delivererLng, 'delivererLng', -180, 180);
    if (delivererLngResult.error) {
      return res.status(400).json({
        error: "Bad Request",
        message: delivererLngResult.error,
        field: "delivererLng"
      });
    }

    const clientLatResult = validateCoordinate(clientLat, 'clientLat', -90, 90);
    if (clientLatResult.error) {
      return res.status(400).json({
        error: "Bad Request",
        message: clientLatResult.error,
        field: "clientLat"
      });
    }

    const clientLngResult = validateCoordinate(clientLng, 'clientLng', -180, 180);
    if (clientLngResult.error) {
      return res.status(400).json({
        error: "Bad Request",
        message: clientLngResult.error,
        field: "clientLng"
      });
    }

    req.validatedGPSDelivery = {
      delivererLat: delivererLatResult.value,
      delivererLng: delivererLngResult.value,
      clientLat: clientLatResult.value,
      clientLng: clientLngResult.value
    };

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "GPS delivery validation failed",
      details: error.message
    });
  }
}

module.exports = {
  validateOrderCreation,
  validateOrderId,
  validateAddress,
  validateGPS,
  validateGPSDelivery,
  validateReview,
  validateOrderStatusUpdate
};
