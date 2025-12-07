const { ethers } = require("ethers");
const axios = require("axios");
const NodeCache = require("node-cache");
const { getProvider, getContractInstance } = require("../config/blockchain");
require("dotenv").config();

/**
 * Price Oracle Service - Fetch MATIC/USD price with failover
 * 
 * Responsibilities:
 * - Fetch MATIC/USD price from Chainlink on-chain (primary)
 * - Fallback to CoinGecko API if Chainlink fails
 * - Validate data freshness (< 1 hour)
 * - Temporary cache of prices to avoid repeated calls
 * 
 * Sources (priority order):
 * 1. Chainlink Price Feed (on-chain, decentralized)
 * 2. CoinGecko API (off-chain, centralized but reliable)
 * 3. Local cache (if both sources fail)
 * 
 * Usage:
 * const priceOracleService = require('./services/priceOracleService');
 * const maticUsdPrice = await priceOracleService.getMaticUsdPrice();
 * console.log(`1 MATIC = $${maticUsdPrice}`);
 */

// Initialize cache with 5 minute TTL
const priceCache = new NodeCache({ stdTTL: 300 });

// Chainlink MATIC/USD price feed address (Polygon Amoy)
const CHAINLINK_MATIC_USD = process.env.CHAINLINK_PRICE_FEED_ADDRESS || '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada';

/**
 * Get MATIC/USD price from Chainlink (on-chain)
 * @returns {Promise<number>} MATIC/USD price
 */
async function getChainlinkPrice() {
  try {
    const provider = getProvider();
    if (!provider) {
      throw new Error("Provider not initialized");
    }

    // Chainlink AggregatorV3Interface ABI (minimal)
    const aggregatorABI = [
      "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
      "function decimals() external view returns (uint8)"
    ];

    const aggregator = new ethers.Contract(CHAINLINK_MATIC_USD, aggregatorABI, provider);
    
    // Get latest price data
    const roundData = await aggregator.latestRoundData();
    const decimals = await aggregator.decimals();
    
    // Convert answer to readable price (Chainlink uses 8 decimals for USD pairs)
    const price = parseFloat(ethers.formatUnits(roundData.answer, decimals));
    
    // Validate freshness (updatedAt should be recent, within 1 hour)
    const updatedAt = Number(roundData.updatedAt);
    const now = Math.floor(Date.now() / 1000);
    const age = now - updatedAt;
    
    if (age > 3600) {
      throw new Error(`Chainlink price data is stale (${age}s old)`);
    }
    
    console.log(`✓ Chainlink price: $${price} (updated ${age}s ago)`);
    return price;
  } catch (error) {
    console.error("Error fetching Chainlink price:", error.message);
    throw error;
  }
}

/**
 * Get MATIC/USD price from CoinGecko API
 * @returns {Promise<number>} MATIC/USD price
 */
async function getCoinGeckoPrice() {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    const url = apiKey 
      ? `https://api.coingecko.com/api/v3/simple/price?ids=polygon&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`
      : 'https://api.coingecko.com/api/v3/simple/price?ids=polygon&vs_currencies=usd';
    
    const response = await axios.get(url, {
      timeout: 5000,
      headers: apiKey ? { 'x-cg-demo-api-key': apiKey } : {}
    });
    
    const price = response.data.polygon?.usd;
    if (!price) {
      throw new Error("Invalid response from CoinGecko");
    }
    
    console.log(`✓ CoinGecko price: $${price}`);
    return price;
  } catch (error) {
    console.error("Error fetching CoinGecko price:", error.message);
    throw error;
  }
}

/**
 * Get MATIC/USD price with fallback strategy
 * @returns {Promise<number>} MATIC/USD price
 */
async function getMaticUsdPrice() {
  // 1. Check cache first
  const cachedPrice = priceCache.get('MATIC_USD');
  if (cachedPrice) {
    console.log('✓ Price cache HIT');
    return cachedPrice;
  }

  // 2. Try Chainlink (on-chain, primary)
  try {
    const price = await getChainlinkPrice();
    priceCache.set('MATIC_USD', price);
    priceCache.set('MATIC_USD_LAST', price); // Backup
    return price;
  } catch (chainlinkError) {
    console.warn('⚠️  Chainlink fetch failed, trying CoinGecko...');
    
    // 3. Fallback to CoinGecko
    try {
      const price = await getCoinGeckoPrice();
      priceCache.set('MATIC_USD', price);
      priceCache.set('MATIC_USD_LAST', price);
      return price;
    } catch (coingeckoError) {
      console.error('❌ Both price sources failed');
      
      // 4. Last resort: use cached backup if available
      const lastKnownPrice = priceCache.get('MATIC_USD_LAST');
      if (lastKnownPrice) {
        console.warn(`⚠️  Using last known price: $${lastKnownPrice}`);
        return lastKnownPrice;
      }
      
      throw new Error('Unable to fetch MATIC/USD price from any source');
    }
  }
}

/**
 * Validate data freshness
 * @param {number} timestamp - Timestamp to validate
 * @param {number} maxAgeSeconds - Maximum age in seconds
 * @returns {boolean} True if data is fresh
 */
function validateFreshness(timestamp, maxAgeSeconds = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const age = now - timestamp;
  return age <= maxAgeSeconds;
}

module.exports = {
  getMaticUsdPrice,
  getChainlinkPrice,
  getCoinGeckoPrice,
  validateFreshness
};
