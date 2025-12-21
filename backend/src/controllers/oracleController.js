const priceOracleService = require("../services/priceOracleService");
const gpsOracleService = require("../services/gpsOracleService");
const weatherOracleService = require("../services/weatherOracleService");

/**
 * Controller for managing HTTP requests related to Oracles
 * @notice Manages interactions with Chainlink Oracles (price, GPS, weather)
 * @dev Integrates priceOracleService and gpsOracleService
 */

/**
 * Gets MATIC/USD price from Chainlink Oracle
 * @dev Uses priceOracleService to fetch real-time price
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getPrice(req, res) {
  try {
    const pair = req.query.pair || 'MATIC/USD';    const priceData = await priceOracleService.getMaticUsdPrice();

    return res.status(200).json({
      success: true,
      data: {
        pair: pair,
        price: priceData.price.toString(),
        timestamp: new Date(priceData.timestamp).toISOString(),
        source: priceData.source
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get price",
      details: error.message
    });
  }
}

/**
 * Converts fiat amount (EUR/USD) to crypto (MATIC)
 * @dev Uses priceOracleService to get real-time exchange rate
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function convertCurrency(req, res) {
  try {
    const { amount, from, to } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({
        error: "Bad Request",
        message: "amount must be a valid number"
      });
    }

    // Obtenir le prix MATIC/USD réel (retourne { price, source, timestamp })
    const priceData = await priceOracleService.getMaticUsdPrice();
    const maticPrice = priceData.price;

    // Convertir USD/EUR vers MATIC
    let convertedAmount;
    if (from === 'USD' && to === 'MATIC') {
      convertedAmount = parseFloat(amount) / maticPrice;
    } else if (from === 'EUR' && to === 'MATIC') {
      // Approximation EUR/USD = 1.1 (peut être amélioré avec un oracle EUR/USD)
      const eurToUsd = 1.1;
      convertedAmount = (parseFloat(amount) * eurToUsd) / maticPrice;
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Unsupported conversion pair. Supported: USD->MATIC, EUR->MATIC"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        originalAmount: amount.toString(),
        convertedAmount: convertedAmount.toFixed(6),
        from: from,
        to: to,
        exchangeRate: maticPrice.toString(),
        source: priceData.source,
        timestamp: new Date(priceData.timestamp).toISOString()
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to convert currency",
      details: error.message
    });
  }
}

/**
 * Verifies that delivery was made in an acceptable zone (GPS Oracle)
 * @dev Uses gpsOracleService to verify delivery location
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function verifyGPSDelivery(req, res) {
  try {
    const { orderId, clientLat, clientLng } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "orderId is required"
      });
    }
    
    if (!clientLat || !clientLng || isNaN(parseFloat(clientLat)) || isNaN(parseFloat(clientLng))) {
      return res.status(400).json({
        error: "Bad Request",
        message: "clientLat and clientLng are required and must be valid numbers"
      });
    }    const verification = await gpsOracleService.verifyDelivery(
      parseInt(orderId),
      parseFloat(clientLat),
      parseFloat(clientLng)
    );
    
    return res.status(200).json({
      success: true,
      data: {
        verified: verification.verified,
        distance: verification.distance.toFixed(2) + " m",
        withinRadius: verification.withinRadius,
        maxRange: "100 m",
        lastUpdate: verification.lastUpdate
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to verify GPS delivery",
      details: error.message
    });
  }
}

/**
 * Gets weather data to adjust delivery fees
 * @dev Connected to DoneWeatherOracle contract
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
    }    const weatherData = await weatherOracleService.getWeather(lat, lng);

    return res.status(200).json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get weather",
      details: error.message
    });
  }
}

/**
 * Gets latest price from cache or fetches new
 * @dev Uses chainlinkService to get latest cached price
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getLatestPrice(req, res) {
  try {
    const chainlinkService = require("../services/chainlinkService");
    const latest = await chainlinkService.getLatestPrice();
    
    return res.status(200).json({
      success: true,
      data: {
        price: latest.price.toString(),
        source: latest.source,
        timestamp: new Date(latest.timestamp).toISOString()
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get latest price",
      details: error.message
    });
  }
}

/**
 * Gets price performance metrics
 * @dev Uses chainlinkService to get metrics
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getPriceMetrics(req, res) {
  try {
    const chainlinkService = require("../services/chainlinkService");
    const metrics = chainlinkService.getPriceMetrics();
    
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get price metrics",
      details: error.message
    });
  }
}

/**
 * Updates deliverer GPS location
 * @dev Uses gpsOracleService to update location
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function updateGPSLocation(req, res) {
  try {
    const { orderId, lat, lng } = req.body;
    const delivererAddress = req.userAddress || req.body.delivererAddress;
    
    if (!orderId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "orderId is required"
      });
    }
    
    if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      return res.status(400).json({
        error: "Bad Request",
        message: "lat and lng are required and must be valid numbers"
      });
    }
    
    if (!delivererAddress) {
      return res.status(400).json({
        error: "Bad Request",
        message: "delivererAddress is required (from auth or body)"
      });
    }
    
    const result = await gpsOracleService.updateLocation(
      parseInt(orderId),
      parseFloat(lat),
      parseFloat(lng),
      delivererAddress
    );
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update GPS location",
      details: error.message
    });
  }
}

/**
 * Tracks delivery in real-time
 * @dev Uses gpsOracleService to track delivery
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function trackDelivery(req, res) {
  try {
    const orderId = parseInt(req.params.orderId);
    
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Valid orderId is required"
      });
    }
    
    const tracking = await gpsOracleService.trackDelivery(orderId);
    
    return res.status(200).json({
      success: true,
      data: tracking
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to track delivery",
      details: error.message
    });
  }
}

/**
 * Gets GPS performance metrics
 * @dev Uses gpsOracleService to get metrics
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getGPSMetrics(req, res) {
  try {
    const metrics = gpsOracleService.getGPSMetrics();
    
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get GPS metrics",
      details: error.message
    });
  }
}

module.exports = {
  getPrice,
  getLatestPrice,
  getPriceMetrics,
  convertCurrency,
  verifyGPSDelivery,
  updateGPSLocation,
  trackDelivery,
  getGPSMetrics,
  getWeather
};

