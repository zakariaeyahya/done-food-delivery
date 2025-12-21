const { ethers } = require('ethers');
const axios = require('axios');
const NodeCache = require('node-cache');
const chainlinkService = require('./chainlinkService');

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const PRICE_CACHE_TTL = 300;
const MAX_DATA_AGE = 3600 * 1000;

const priceCache = new NodeCache({ stdTTL: PRICE_CACHE_TTL });

async function getChainlinkPrice() {
  try {
    const priceData = await chainlinkService.getLatestPrice();
    return priceData.price || priceData;
  } catch (error) {
    throw error;
  }
}

async function getCoinGeckoPrice() {
  try {
    const headers = {};
    if (COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
    }

    const response = await axios.get(COINGECKO_API_URL, {
      params: {
        ids: 'matic-network',
        vs_currencies: 'usd'
      },
      headers,
      timeout: 5000
    });

    const price = response.data['matic-network']?.usd;
    if (!price) {
      throw new Error('CoinGecko API returned invalid data');
    }

    return price;
  } catch (error) {
    throw error;
  }
}

async function getMaticUsdPrice() {
  const cached = priceCache.get('MATIC_USD');
  if (cached && (Date.now() - cached.timestamp) < MAX_DATA_AGE) {
    return cached;
  }

  try {
    const price = await getChainlinkPrice();
    const result = {
      price,
      source: 'chainlink',
      timestamp: Date.now()
    };

    priceCache.set('MATIC_USD', result);

    return result;
  } catch (chainlinkError) {
  }

  try {
    const price = await getCoinGeckoPrice();
    const result = {
      price,
      source: 'coingecko',
      timestamp: Date.now()
    };

    priceCache.set('MATIC_USD', result);

    return result;
  } catch (coingeckoError) {
    if (cached) {
      return cached;
    }

    throw new Error('All price sources failed and no cache available');
  }
}

function isPriceDataFresh(priceData) {
  if (!priceData || !priceData.timestamp) {
    return false;
  }

  const age = Date.now() - priceData.timestamp;
  return age < MAX_DATA_AGE;
}

module.exports = {
  getMaticUsdPrice,
  getChainlinkPrice,
  getCoinGeckoPrice,
  isPriceDataFresh
};
