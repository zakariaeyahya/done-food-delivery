const { ethers } = require("ethers");
const axios = require("axios");
const NodeCache = require("node-cache");
const { getProvider } = require("../config/blockchain");
require("dotenv").config();

/**
 * Chainlink Service - Interaction with Chainlink Price Feed and DonePriceOracle
 * 
 * Manages MATIC/USD price conversions with performance metrics
 */

// Configuration
const CHAINLINK_API_URL = process.env.CHAINLINK_API_URL || 'https://api.coinbase.com/v2/prices/MATIC-USD/spot';
const PRICE_ORACLE_ADDRESS = process.env.PRICE_ORACLE_ADDRESS;
const RPC_URL = process.env.AMOY_RPC_URL || process.env.MUMBAI_RPC_URL;
const PRICE_CACHE_TTL = 60; // 60 seconds

// Chainlink MATIC/USD price feed address (Polygon Amoy)
const CHAINLINK_MATIC_USD = process.env.CHAINLINK_PRICE_FEED_ADDRESS || '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada';

// Initialize cache
const priceCache = new NodeCache({ stdTTL: PRICE_CACHE_TTL });

// Performance metrics
let totalPriceFetches = 0;
let failedFetches = 0;
let averageFetchTime = 0;
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Fetch MATIC/USD price from Chainlink (or API fallback)
 * @returns {Promise<number>} MATIC/USD price
 */
async function fetchPrice() {
  const startTime = Date.now();
  totalPriceFetches++;
  
  try {
    // 1. Check cache
    const cachedPrice = priceCache.get('MATIC_USD');
    if (cachedPrice) {
      cacheHits++;
      console.log('✓ Price cache HIT');
      return cachedPrice;
    }
    
    cacheMisses++;
    
    // 2. Try Chainlink Price Feed on-chain
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
      const priceData = await aggregator.latestRoundData();
      const decimals = await aggregator.decimals();
      const price = parseFloat(ethers.formatUnits(priceData.answer, decimals));
      
      // Measure latency
      const fetchTime = Date.now() - startTime;
      averageFetchTime = (averageFetchTime + fetchTime) / 2;
      
      console.log(`✓ Chainlink price fetched: $${price} (${fetchTime}ms)`);
      
      // 3. Cache price
      priceCache.set('MATIC_USD', price);
      priceCache.set('MATIC_USD_LAST', price); // Backup
      
      return price;
    } catch (chainlinkError) {
      // 4. Fallback to Coinbase API if Chainlink fails
      console.warn('⚠️  Chainlink fetch failed, using Coinbase API fallback');
      
      const response = await axios.get(CHAINLINK_API_URL, { timeout: 5000 });
      const price = parseFloat(response.data.data.amount);
      
      // Measure latency
      const fetchTime = Date.now() - startTime;
      averageFetchTime = (averageFetchTime + fetchTime) / 2;
      
      console.log(`✓ Coinbase API price: $${price} (${fetchTime}ms)`);
      
      // Cache price
      priceCache.set('MATIC_USD', price);
      priceCache.set('MATIC_USD_LAST', price);
      
      return price;
    }
  } catch (error) {
    failedFetches++;
    console.error('❌ fetchPrice ERROR:', error.message);
    
    // Return last known price if available
    const lastKnownPrice = priceCache.get('MATIC_USD_LAST');
    if (lastKnownPrice) {
      console.warn('⚠️  Using last known price:', lastKnownPrice);
      return lastKnownPrice;
    }
    
    throw new Error('Unable to fetch MATIC/USD price');
  }
}

/**
 * Convert USD amount to MATIC
 * @param {number} usdAmount - Amount in USD
 * @returns {Promise<Object>} { usd, matic, maticWei, exchangeRate }
 */
async function convertUSDtoMATIC(usdAmount) {
  try {
    // 1. Get current price
    const price = await fetchPrice();
    
    // 2. Calculate conversion
    const maticAmount = usdAmount / price;
    
    // 3. Convert to wei (18 decimals)
    const maticWei = ethers.parseEther(maticAmount.toString());
    
    console.log(`✓ Converted $${usdAmount} USD → ${maticAmount.toFixed(4)} MATIC`);
    
    return {
      usd: usdAmount,
      matic: maticAmount,
      maticWei: maticWei.toString(),
      exchangeRate: price
    };
  } catch (error) {
    console.error('❌ convertUSDtoMATIC ERROR:', error.message);
    throw error;
  }
}

/**
 * Convert MATIC amount to USD
 * @param {number} maticAmount - Amount in MATIC
 * @returns {Promise<Object>} { matic, usd, exchangeRate }
 */
async function convertMATICtoUSD(maticAmount) {
  try {
    // 1. Get current price
    const price = await fetchPrice();
    
    // 2. Calculate conversion
    const usdAmount = maticAmount * price;
    
    console.log(`✓ Converted ${maticAmount} MATIC → $${usdAmount.toFixed(2)} USD`);
    
    return {
      matic: maticAmount,
      usd: usdAmount,
      exchangeRate: price
    };
  } catch (error) {
    console.error('❌ convertMATICtoUSD ERROR:', error.message);
    throw error;
  }
}

/**
 * Sync price on-chain with DonePriceOracle contract
 * @returns {Promise<Object>} { price, txHash, blockNumber }
 */
async function syncPrice() {
  try {
    // 1. Fetch latest price
    const latestPrice = await fetchPrice();
    
    // Note: If PRICE_ORACLE_ADDRESS is set and contract has updatePrice function,
    // we could update on-chain here. For now, we'll just return the price.
    
    // 2. Get wallet signer (backend wallet with ORACLE_ROLE)
    // const wallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
    // const oracleWithSigner = priceOracle.connect(wallet);
    
    // 3. Convert price to Chainlink format (8 decimals)
    // const priceScaled = ethers.parseUnits(latestPrice.toFixed(8), 8);
    
    // 4. Update on-chain (if contract has updatePrice function)
    // const tx = await oracleWithSigner.updatePrice(priceScaled);
    // const receipt = await tx.wait();
    
    return {
      price: latestPrice
      // txHash: tx.hash,
      // blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('❌ syncPrice ERROR:', error.message);
    throw error;
  }
}

/**
 * Get latest price
 * @returns {Promise<Object>} { price, source, timestamp }
 */
async function getLatestPrice() {
  // Get from cache
  const cachedPrice = priceCache.get('MATIC_USD');
  
  if (cachedPrice) {
    return {
      price: cachedPrice,
      source: 'cache',
      timestamp: Date.now()
    };
  }
  
  // If no cache, fetch new price
  const price = await fetchPrice();
  return {
    price,
    source: 'chainlink',
    timestamp: Date.now()
  };
}

/**
 * Get price performance metrics
 * @returns {Object} Complete metrics
 */
function getPriceMetrics() {
  const successRate = totalPriceFetches > 0
    ? ((totalPriceFetches - failedFetches) / totalPriceFetches * 100).toFixed(2)
    : 100;
  
  const totalCacheRequests = cacheHits + cacheMisses;
  const cacheHitRate = totalCacheRequests > 0
    ? ((cacheHits / totalCacheRequests) * 100).toFixed(2)
    : 0;
  
  return {
    totalFetches: totalPriceFetches,
    failedFetches: failedFetches,
    successRate: `${successRate}%`,
    averageFetchTime: `${averageFetchTime.toFixed(2)}ms`,
    cacheHitRate: `${cacheHitRate}%`,
    cacheHits,
    cacheMisses
  };
}

module.exports = {
  fetchPrice,
  convertUSDtoMATIC,
  convertMATICtoUSD,
  syncPrice,
  getLatestPrice,
  getPriceMetrics
};
