const { ethers } = require("ethers");
const axios = require("axios");
const NodeCache = require("node-cache");
const { getProvider } = require("../config/blockchain");
require("dotenv").config();

const CHAINLINK_API_URL = process.env.CHAINLINK_API_URL || 'https://api.coinbase.com/v2/prices/MATIC-USD/spot';
const PRICE_ORACLE_ADDRESS = process.env.PRICE_ORACLE_ADDRESS;
const RPC_URL = process.env.AMOY_RPC_URL || process.env.MUMBAI_RPC_URL;
const PRICE_CACHE_TTL = 60;

const CHAINLINK_MATIC_USD = process.env.CHAINLINK_PRICE_FEED_ADDRESS || '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada';

const priceCache = new NodeCache({ stdTTL: PRICE_CACHE_TTL });

let totalPriceFetches = 0;
let failedFetches = 0;
let averageFetchTime = 0;
let cacheHits = 0;
let cacheMisses = 0;

async function fetchPrice() {
  const startTime = Date.now();
  totalPriceFetches++;

  try {
    const cachedPrice = priceCache.get('MATIC_USD');
    if (cachedPrice) {
      cacheHits++;
      return cachedPrice;
    }

    cacheMisses++;

    try {
      const provider = getProvider();
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      const aggregatorABI = [
        "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
        "function decimals() external view returns (uint8)"
      ];

      const aggregator = new ethers.Contract(CHAINLINK_MATIC_USD, aggregatorABI, provider);
      const priceData = await aggregator.latestRoundData();
      const decimals = await aggregator.decimals();
      const price = parseFloat(ethers.formatUnits(priceData.answer, decimals));

      const fetchTime = Date.now() - startTime;
      averageFetchTime = (averageFetchTime + fetchTime) / 2;

      priceCache.set('MATIC_USD', price);
      priceCache.set('MATIC_USD_LAST', price);

      return price;
    } catch (chainlinkError) {
      const response = await axios.get(CHAINLINK_API_URL, { timeout: 5000 });
      const price = parseFloat(response.data.data.amount);

      const fetchTime = Date.now() - startTime;
      averageFetchTime = (averageFetchTime + fetchTime) / 2;

      priceCache.set('MATIC_USD', price);
      priceCache.set('MATIC_USD_LAST', price);

      return price;
    }
  } catch (error) {
    failedFetches++;

    const lastKnownPrice = priceCache.get('MATIC_USD_LAST');
    if (lastKnownPrice) {
      return lastKnownPrice;
    }

    throw new Error('Unable to fetch MATIC/USD price');
  }
}

async function convertUSDtoMATIC(usdAmount) {
  try {
    const price = await fetchPrice();
    const maticAmount = usdAmount / price;
    const maticWei = ethers.parseEther(maticAmount.toString());

    return {
      usd: usdAmount,
      matic: maticAmount,
      maticWei: maticWei.toString(),
      exchangeRate: price
    };
  } catch (error) {
    throw error;
  }
}

async function convertMATICtoUSD(maticAmount) {
  try {
    const price = await fetchPrice();
    const usdAmount = maticAmount * price;

    return {
      matic: maticAmount,
      usd: usdAmount,
      exchangeRate: price
    };
  } catch (error) {
    throw error;
  }
}

async function syncPrice() {
  try {
    const latestPrice = await fetchPrice();

    return {
      price: latestPrice
    };
  } catch (error) {
    throw error;
  }
}

async function getLatestPrice() {
  const cachedPrice = priceCache.get('MATIC_USD');

  if (cachedPrice) {
    return {
      price: cachedPrice,
      source: 'cache',
      timestamp: Date.now()
    };
  }

  const price = await fetchPrice();
  return {
    price,
    source: 'chainlink',
    timestamp: Date.now()
  };
}

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
