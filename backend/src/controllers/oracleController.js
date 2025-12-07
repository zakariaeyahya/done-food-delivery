const priceOracleService = require("../services/priceOracleService");
const gpsOracleService = require("../services/gpsOracleService");

/**
 * Controller for managing HTTP requests related to Oracles
 * @notice Manages interactions with Chainlink Oracles (price, GPS, weather)
 * @dev Integrates priceOracleService and gpsOracleService
 */

/**
 * Gets MATIC/USD price from Chainlink Oracle
 * @dev TODO: Implement with priceOracleService
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getPrice(req, res) {
  try {
    const pair = req.query.pair || 'MATIC/USD';
    
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
 * Converts fiat amount (EUR/USD) to crypto (MATIC)
 * @dev TODO: Implement with priceOracleService
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function convertCurrency(req, res) {
  try {
    const { amount, from, to } = req.body;
    
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
 * Verifies that delivery was made in an acceptable zone (GPS Oracle)
 * @dev TODO: Implement with gpsOracleService
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function verifyGPSDelivery(req, res) {
  try {
    const { orderId, delivererLat, delivererLng, clientLat, clientLng } = req.body;
    
    const R = 6371;
    const dLat = (clientLat - delivererLat) * Math.PI / 180;
    const dLng = (clientLng - delivererLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(delivererLat * Math.PI / 180) * Math.cos(clientLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    const maxRange = 2.0;
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
 * Gets weather data to adjust delivery fees
 * @dev TODO: Implement with external weather API
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
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

module.exports = {
  getPrice,
  convertCurrency,
  verifyGPSDelivery,
  getWeather
};

