// Importer les services nécessaires
const priceOracleService = require("../services/priceOracleService");
const gpsOracleService = require("../services/gpsOracleService");

/**
 * Controller pour gérer les requêtes HTTP liées aux Oracles
 * @notice Gère les interactions avec Chainlink Oracles (prix, GPS, météo)
 * @dev Intègre les services priceOracleService et gpsOracleService
 */

/**
 * Récupère le prix MATIC/USD depuis Chainlink Oracle
 * @dev TODO: Implémenter avec priceOracleService
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getPrice(req, res) {
  try {
    const pair = req.query.pair || 'MATIC/USD';
    
    // TODO: Appeler priceOracleService.getMaticUsdPrice()
    // const price = await priceOracleService.getMaticUsdPrice();
    
    // Réponse temporaire
    return res.status(200).json({
      success: true,
      data: {
        pair: pair,
        price: "0.85",
        timestamp: new Date().toISOString(),
        source: "Chainlink"
      }
    });
  } catch (error) {
    console.error("Error getting price:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get price",
      details: error.message
    });
  }
}

/**
 * Convertit un montant fiat (EUR/USD) en crypto (MATIC)
 * @dev TODO: Implémenter avec priceOracleService
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function convertCurrency(req, res) {
  try {
    const { amount, from, to } = req.body;
    
    // TODO: Appeler priceOracleService.convertUSDtoMATIC()
    // const convertedAmount = await priceOracleService.convertUSDtoMATIC(amount);
    
    // Réponse temporaire
    return res.status(200).json({
      success: true,
      data: {
        originalAmount: amount.toString(),
        convertedAmount: (parseFloat(amount) / 0.85).toFixed(2),
        from: from,
        to: to,
        exchangeRate: "0.85",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error converting currency:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to convert currency",
      details: error.message
    });
  }
}

/**
 * Vérifie que la livraison a été effectuée dans une zone acceptable (GPS Oracle)
 * @dev TODO: Implémenter avec gpsOracleService
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function verifyGPSDelivery(req, res) {
  try {
    const { orderId, delivererLat, delivererLng, clientLat, clientLng } = req.body;
    
    // TODO: Appeler gpsOracleService.verifyDelivery()
    // const verification = await gpsOracleService.verifyDelivery(orderId, delivererLat, delivererLng, clientLat, clientLng);
    
    // Calculer distance (formule Haversine simplifiée)
    const R = 6371; // Rayon de la Terre en km
    const dLat = (clientLat - delivererLat) * Math.PI / 180;
    const dLng = (clientLng - delivererLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(delivererLat * Math.PI / 180) * Math.cos(clientLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    const maxRange = 2.0; // 2 km
    const withinRange = distance <= maxRange;
    
    return res.status(200).json({
      success: true,
      data: {
        verified: withinRange,
        distance: distance.toFixed(2) + " km",
        withinRange: withinRange,
        maxRange: maxRange + " km"
      }
    });
  } catch (error) {
    console.error("Error verifying GPS delivery:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to verify GPS delivery",
      details: error.message
    });
  }
}

/**
 * Récupère les données météo pour ajuster frais de livraison
 * @dev TODO: Implémenter avec API météo externe
 * 
 * @param {Object} req - Request Express
 * @param {Object} res - Response Express
 */
async function getWeather(req, res) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lat and lng query parameters are required"
      });
    }
    
    // TODO: Appeler API météo externe (OpenWeatherMap, etc.)
    // const weather = await weatherService.getWeather(lat, lng);
    
    // Réponse temporaire
    return res.status(200).json({
      success: true,
      data: {
        location: {
          lat: lat,
          lng: lng
        },
        weather: {
          condition: "clear",
          temperature: 20,
          windSpeed: 10
        },
        deliveryFeeMultiplier: 1.0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error getting weather:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get weather",
      details: error.message
    });
  }
}

// Exporter toutes les fonctions
module.exports = {
  getPrice,
  convertCurrency,
  verifyGPSDelivery,
  getWeather
};

