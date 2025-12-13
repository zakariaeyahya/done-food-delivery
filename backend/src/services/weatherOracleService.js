const { ethers } = require("ethers");
const { getProvider } = require("../config/blockchain");
require("dotenv").config();

/**
 * Weather Oracle Service - DoneWeatherOracle contract interaction
 *
 * Manages weather data for delivery fee adjustments
 * Connected to deployed DoneWeatherOracle contract
 */

// Configuration
const WEATHER_ORACLE_ADDRESS = process.env.WEATHER_ORACLE_ADDRESS;

// Weather conditions enum (matches contract)
const WeatherCondition = {
  SUNNY: 0,
  CLOUDY: 1,
  RAINY: 2,
  SNOWY: 3,
  STORM: 4
};

const WeatherConditionNames = ["SUNNY", "CLOUDY", "RAINY", "SNOWY", "STORM"];

// Fee multipliers (100% = 10000)
const FeeMultipliers = {
  SUNNY: 10000,   // 100%
  CLOUDY: 10000,  // 100%
  RAINY: 12000,   // 120%
  SNOWY: 15000,   // 150%
  STORM: 20000    // 200%
};

// DoneWeatherOracle ABI (minimal)
const WEATHER_ORACLE_ABI = [
  "function getWeather(int256 lat, int256 lng) external view returns (uint8 condition, int256 temperature, uint256 timestamp, bool isExtreme)",
  "function canDeliver(int256 lat, int256 lng) external view returns (bool)",
  "function adjustDeliveryFee(uint256 baseFee, uint8 condition) external view returns (uint256)",
  "function updateWeather(int256 lat, int256 lng, uint8 condition, int256 temperature) external",
  "function deliveryFeeMultipliers(uint8 condition) external view returns (uint256)",
  "event WeatherUpdated(bytes32 indexed locationHash, uint8 condition, int256 temperature, bool isExtreme)",
  "event ExtremeWeatherAlert(bytes32 indexed locationHash, uint8 condition)"
];

// Weather Oracle contract instance (lazy loaded)
let weatherOracleContract = null;

// Performance metrics
let totalWeatherFetches = 0;
let onChainFetches = 0;
let fallbackFetches = 0;

/**
 * Get Weather Oracle contract instance
 * @returns {ethers.Contract|null} Contract instance or null
 */
function getWeatherOracleContract() {
  if (weatherOracleContract) return weatherOracleContract;

  if (!WEATHER_ORACLE_ADDRESS) {
    console.warn("⚠️ WEATHER_ORACLE_ADDRESS not configured");
    return null;
  }

  try {
    const provider = getProvider();
    if (!provider) {
      console.warn("⚠️ Provider not initialized for Weather Oracle");
      return null;
    }

    weatherOracleContract = new ethers.Contract(WEATHER_ORACLE_ADDRESS, WEATHER_ORACLE_ABI, provider);
    console.log("✓ Weather Oracle contract initialized:", WEATHER_ORACLE_ADDRESS);
    return weatherOracleContract;
  } catch (error) {
    console.error("❌ Failed to initialize Weather Oracle:", error.message);
    return null;
  }
}

/**
 * Get weather data for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Weather data
 */
async function getWeather(lat, lng) {
  totalWeatherFetches++;

  // Scale coordinates (contract uses int256 with 6 decimals)
  const latScaled = Math.round(lat * 1e6);
  const lngScaled = Math.round(lng * 1e6);

  // Try on-chain first
  if (WEATHER_ORACLE_ADDRESS) {
    try {
      const weatherOracle = getWeatherOracleContract();
      if (weatherOracle) {
        const [condition, temperature, timestamp, isExtreme] = await weatherOracle.getWeather(latScaled, lngScaled);

        onChainFetches++;
        console.log(`✓ Weather from on-chain: ${WeatherConditionNames[condition]}, ${Number(temperature) / 100}°C`);

        return {
          source: "on-chain",
          location: { lat, lng },
          weather: {
            condition: WeatherConditionNames[Number(condition)],
            conditionCode: Number(condition),
            temperature: Number(temperature) / 100, // Contract stores temp * 100
            temperatureUnit: "C",
            isExtreme: isExtreme
          },
          delivery: {
            canDeliver: !isExtreme && condition !== WeatherCondition.STORM,
            feeMultiplier: FeeMultipliers[WeatherConditionNames[Number(condition)]] / 10000
          },
          timestamp: new Date(Number(timestamp) * 1000).toISOString(),
          contractAddress: WEATHER_ORACLE_ADDRESS
        };
      }
    } catch (onChainError) {
      console.warn("⚠️ On-chain weather fetch failed:", onChainError.message);
      // Fall through to fallback
    }
  }

  // Fallback: simulate weather data (for testing or when no on-chain data)
  fallbackFetches++;
  console.log("⚠️ Using fallback weather simulation");

  return getSimulatedWeather(lat, lng);
}

/**
 * Get simulated weather data (fallback)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Simulated weather data
 */
function getSimulatedWeather(lat, lng) {
  // Simple simulation based on location
  const conditions = ["SUNNY", "CLOUDY", "RAINY"];
  const randomIndex = Math.floor(Math.random() * conditions.length);
  const condition = conditions[randomIndex];
  const temperature = Math.floor(Math.random() * 30) + 5; // 5-35°C
  const isExtreme = condition === "STORM" || temperature < 0 || temperature > 40;

  return {
    source: "simulated",
    location: { lat, lng },
    weather: {
      condition: condition,
      conditionCode: WeatherCondition[condition],
      temperature: temperature,
      temperatureUnit: "C",
      isExtreme: isExtreme
    },
    delivery: {
      canDeliver: !isExtreme,
      feeMultiplier: FeeMultipliers[condition] / 10000
    },
    timestamp: new Date().toISOString(),
    note: "Simulated data - no on-chain weather available for this location"
  };
}

/**
 * Check if delivery is possible at a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<boolean>} True if delivery is possible
 */
async function canDeliver(lat, lng) {
  const latScaled = Math.round(lat * 1e6);
  const lngScaled = Math.round(lng * 1e6);

  if (WEATHER_ORACLE_ADDRESS) {
    try {
      const weatherOracle = getWeatherOracleContract();
      if (weatherOracle) {
        const result = await weatherOracle.canDeliver(latScaled, lngScaled);
        console.log(`✓ canDeliver check: ${result}`);
        return result;
      }
    } catch (error) {
      console.warn("⚠️ On-chain canDeliver check failed:", error.message);
    }
  }

  // Fallback: always allow delivery
  return true;
}

/**
 * Calculate adjusted delivery fee based on weather
 * @param {number} baseFee - Base delivery fee in wei
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} { adjustedFee, multiplier, condition }
 */
async function adjustDeliveryFee(baseFee, lat, lng) {
  const weather = await getWeather(lat, lng);
  const multiplier = weather.delivery.feeMultiplier;
  const adjustedFee = Math.round(baseFee * multiplier);

  return {
    baseFee: baseFee,
    adjustedFee: adjustedFee,
    multiplier: multiplier,
    condition: weather.weather.condition,
    isExtreme: weather.weather.isExtreme
  };
}

/**
 * Update weather on-chain (admin only)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} condition - Weather condition name
 * @param {number} temperature - Temperature in Celsius
 * @returns {Promise<Object>} Transaction result
 */
async function updateWeather(lat, lng, condition, temperature) {
  if (!WEATHER_ORACLE_ADDRESS) {
    throw new Error("WEATHER_ORACLE_ADDRESS not configured");
  }

  const weatherOracle = getWeatherOracleContract();
  if (!weatherOracle) {
    throw new Error("Weather Oracle contract not initialized");
  }

  const provider = getProvider();
  if (!provider) {
    throw new Error("Provider not initialized");
  }

  // Get condition code
  const conditionCode = WeatherCondition[condition.toUpperCase()];
  if (conditionCode === undefined) {
    throw new Error(`Invalid condition: ${condition}. Valid: ${Object.keys(WeatherCondition).join(", ")}`);
  }

  // Scale values
  const latScaled = Math.round(lat * 1e6);
  const lngScaled = Math.round(lng * 1e6);
  const tempScaled = Math.round(temperature * 100); // Contract stores temp * 100

  // Use admin wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const oracleWithSigner = weatherOracle.connect(wallet);

  console.log(`📍 Updating weather: (${lat}, ${lng}) = ${condition}, ${temperature}°C`);

  const tx = await oracleWithSigner.updateWeather(latScaled, lngScaled, conditionCode, tempScaled);
  const receipt = await tx.wait();

  console.log(`✓ Weather updated on-chain: txHash=${tx.hash}`);

  return {
    success: true,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    location: { lat, lng },
    condition: condition,
    temperature: temperature
  };
}

/**
 * Get weather metrics
 * @returns {Object} Performance metrics
 */
function getWeatherMetrics() {
  return {
    totalFetches: totalWeatherFetches,
    onChainFetches: onChainFetches,
    fallbackFetches: fallbackFetches,
    onChainRatio: totalWeatherFetches > 0
      ? ((onChainFetches / totalWeatherFetches) * 100).toFixed(2) + "%"
      : "0%",
    contractAddress: WEATHER_ORACLE_ADDRESS || "not configured"
  };
}

module.exports = {
  getWeather,
  canDeliver,
  adjustDeliveryFee,
  updateWeather,
  getWeatherMetrics,
  WeatherCondition,
  WeatherConditionNames
};
