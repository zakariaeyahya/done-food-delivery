/**
 * Price Oracle Service - Récupération prix MATIC/USD avec failover
 *
 * Responsabilités :
 * - Fetch prix MATIC/USD depuis Chainlink on-chain (primary)
 * - Fallback sur CoinGecko API si Chainlink échoue
 * - Validation de la fraîcheur des données (< 1 heure)
 * - Cache temporaire des prix pour éviter appels répétés
 *
 * Sources de prix (par ordre de priorité) :
 * 1. Chainlink Price Feed (on-chain, décentralisé)
 * 2. CoinGecko API (off-chain, centralisé mais fiable)
 * 3. Cache local (si échec des 2 sources)
 */

const { ethers } = require('ethers');
const axios = require('axios');
const NodeCache = require('node-cache');
const chainlinkService = require('./chainlinkService');

// Configuration
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const PRICE_CACHE_TTL = 300; // 5 minutes
const MAX_DATA_AGE = 3600 * 1000; // 1 heure en millisecondes

// Initialiser cache
const priceCache = new NodeCache({ stdTTL: PRICE_CACHE_TTL });

/**
 * Récupère le prix MATIC/USD depuis Chainlink (on-chain)
 * @returns {Promise<number>} Prix MATIC/USD
 */
async function getChainlinkPrice() {
  try {
    const priceData = await chainlinkService.getLatestPrice();
    return priceData.price || priceData;
  } catch (error) {
    console.warn('⚠️ Chainlink price fetch failed:', error.message);
    throw error;
  }
}

/**
 * Récupère le prix MATIC/USD depuis CoinGecko API
 * @returns {Promise<number>} Prix MATIC/USD
 */
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

    console.log(`✓ CoinGecko price: ${price}`);
    return price;
  } catch (error) {
    console.error('❌ CoinGecko price fetch failed:', error.message);
    throw error;
  }
}

/**
 * Récupère le prix MATIC/USD avec failover automatique
 * @returns {Promise<Object>} { price, source, timestamp }
 */
async function getMaticUsdPrice() {
  // 1. Vérifier cache
  const cached = priceCache.get('MATIC_USD');
  if (cached && (Date.now() - cached.timestamp) < MAX_DATA_AGE) {
    console.log('✓ Price from cache');
    return cached;
  }

  // 2. Essayer Chainlink (primary)
  try {
    const price = await getChainlinkPrice();
    const result = {
      price,
      source: 'chainlink',
      timestamp: Date.now()
    };

    // Mettre en cache
    priceCache.set('MATIC_USD', result);

    return result;
  } catch (chainlinkError) {
    console.warn('⚠️ Chainlink failed, trying CoinGecko...');
  }

  // 3. Fallback sur CoinGecko
  try {
    const price = await getCoinGeckoPrice();
    const result = {
      price,
      source: 'coingecko',
      timestamp: Date.now()
    };

    // Mettre en cache
    priceCache.set('MATIC_USD', result);

    return result;
  } catch (coingeckoError) {
    console.error('❌ Both price sources failed');

    // 4. Dernier recours: utiliser cache même si expiré
    if (cached) {
      console.warn('⚠️ Using expired cache as last resort');
      return cached;
    }

    throw new Error('All price sources failed and no cache available');
  }
}

/**
 * Valide la fraîcheur des données de prix
 * @param {Object} priceData - Données de prix avec timestamp
 * @returns {boolean} True si les données sont fraîches (< 1 heure)
 */
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
