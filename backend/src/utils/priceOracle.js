const axios = require("axios");
const { ethers } = require("ethers");
require("dotenv").config();

/**
 * Service de simulation Chainlink Price Feed
 * @notice Simule un oracle de prix pour conversion fiat/crypto
 * @dev Utilise CoinGecko API ou mock data pour obtenir le prix MATIC/USD
 */
// Cache pour le prix MATIC (éviter trop de requêtes)
let cachedMATICPrice = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère le prix actuel de MATIC en USD
 * 
 * Sources possibles:
 * - CoinGecko API (si COINGECKO_API_KEY fourni)
 * - Mock data pour développement
 * 
 * @returns {Promise<number>} Prix MATIC/USD (ex: 0.85 pour $0.85)
 */
async function getMATICPrice() {
  try {
    // Vérifier si le cache est encore valide
    if (cachedMATICPrice !== null && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      return cachedMATICPrice;
    }
    
    // Option 1: Utiliser CoinGecko API si disponible
    if (process.env.COINGECKO_API_KEY) {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price',
          {
            params: {
              ids: 'matic-network',
              vs_currencies: 'usd'
            },
            headers: {
              'X-CG-Pro-API-Key': process.env.COINGECKO_API_KEY
            },
            timeout: 5000 // 5 secondes timeout
          }
        );
        
        if (response.data && response.data['matic-network'] && response.data['matic-network'].usd) {
          const price = response.data['matic-network'].usd;
          
          // Mettre à jour le cache
          cachedMATICPrice = price;
          cacheTimestamp = Date.now();
          
          return price;
        }
      } catch (apiError) {
        console.warn("CoinGecko API error, trying free API...", apiError.message);
      }
    }
    
    // Option 2: Utiliser CoinGecko sans API key (rate limit)
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'matic-network',
            vs_currencies: 'usd'
          },
          timeout: 5000
        }
      );
      
      if (response.data && response.data['matic-network'] && response.data['matic-network'].usd) {
        const price = response.data['matic-network'].usd;
        
        // Mettre à jour le cache
        cachedMATICPrice = price;
        cacheTimestamp = Date.now();
        
        return price;
      }
    } catch (apiError) {
      console.warn("CoinGecko free API error, using mock data...", apiError.message);
    }
    
    // Option 3: Mock data pour développement (si pas d'API disponible)
    const mockPrice = 0.85; // $0.85 par MATIC (valeur de développement)
    cachedMATICPrice = mockPrice;
    cacheTimestamp = Date.now();
    return mockPrice;
  } catch (error) {
    // Logger l'erreur
    console.error("Error fetching MATIC price:", error);
    
    // Si erreur, utiliser le cache ou valeur par défaut
    if (cachedMATICPrice) {
      console.warn("Using cached MATIC price due to error");
      return cachedMATICPrice;
    }
    
    // Retourner une valeur par défaut en cas d'erreur
    console.warn("Using default MATIC price: 0.85");
    const defaultPrice = 0.85;
    cachedMATICPrice = defaultPrice;
    cacheTimestamp = Date.now();
    return defaultPrice; // Valeur par défaut
  }
}

/**
 * Convertit un montant USD en MATIC (wei)
 * 
 * Étapes:
 * 1. Récupérer le prix MATIC actuel
 * 2. Calculer: maticAmount = usdAmount / maticPrice
 * 3. Convertir en wei (multiplier par 1e18)
 * 4. Retourner BigNumber
 * 
 * @param {number} usdAmount - Montant en USD
 * @returns {Promise<ethers.BigNumber>} Montant en MATIC wei (BigNumber)
 */
async function convertUSDtoMATIC(usdAmount) {
  try {
    // Vérifier que usdAmount est un nombre positif
    if (typeof usdAmount !== 'number' || usdAmount <= 0) {
      throw new Error("usdAmount must be a positive number");
    }
    
    // Récupérer le prix MATIC actuel
    const maticPrice = await getMATICPrice();
    
    // Calculer le montant MATIC
    const maticAmount = usdAmount / maticPrice;
    
    // Convertir en wei (multiplier par 1e18)
    // Note: ethers v6 utilise parseEther directement
    const maticWei = ethers.parseEther(maticAmount.toString());
    
    // Retourner BigNumber
    return maticWei;
  } catch (error) {
    // Logger l'erreur
    console.error("Error converting USD to MATIC:", error);
    throw error;
  }
}

/**
 * Convertit un montant MATIC (wei) en USD
 * 
 * Étapes:
 * 1. Récupérer le prix MATIC actuel
 * 2. Convertir wei en MATIC (diviser par 1e18)
 * 3. Calculer: usdAmount = maticAmount * maticPrice
 * 4. Retourner nombre
 * 
 * @param {ethers.BigNumber|string} maticAmount - Montant en MATIC wei (BigNumber ou string)
 * @returns {Promise<number>} Montant en USD
 */
async function convertMATICtoUSD(maticAmount) {
  try {
    // Convertir en BigNumber si string
    // Note: ethers v6 gère automatiquement la conversion
    let maticWei;
    if (typeof maticAmount === 'string') {
      maticWei = ethers.parseEther(maticAmount);
    } else if (typeof maticAmount === 'bigint') {
      // C'est déjà un BigInt
      maticWei = maticAmount;
    } else if (maticAmount && typeof maticAmount.toString === 'function' && typeof maticAmount !== 'number') {
      // C'est probablement un BigNumber (objet avec toString)
      maticWei = maticAmount;
    } else {
      // Si c'est un nombre, le convertir en string puis en wei
      maticWei = ethers.parseEther(maticAmount.toString());
    }
    
    // Récupérer le prix MATIC actuel
    const maticPrice = await getMATICPrice();
    
    // Convertir wei en MATIC (diviser par 1e18)
    // Note: ethers v6 utilise formatEther
    const maticAmountFloat = parseFloat(ethers.formatEther(maticWei));
    
    // Calculer le montant USD
    const usdAmount = maticAmountFloat * maticPrice;
    
    // Arrondir à 2 décimales
    const roundedUSD = Math.round(usdAmount * 100) / 100;
    
    // Retourner le montant USD
    return roundedUSD;
  } catch (error) {
    // Logger l'erreur
    console.error("Error converting MATIC to USD:", error);
    throw error;
  }
}

/**
 * Formate un montant MATIC en string lisible
 * 
 * @param {ethers.BigNumber|string} maticWei - Montant en wei
 * @returns {string} Montant formaté (ex: "1.5 MATIC")
 */
function formatMATIC(maticWei) {
  try {
    // Convertir wei en MATIC
    // Note: ethers v6 utilise formatEther
    const maticAmount = ethers.formatEther(maticWei);
    
    // Arrondir à 4 décimales
    const rounded = parseFloat(maticAmount).toFixed(4);
    
    // Retourner formaté
    return `${rounded} MATIC`;
  } catch (error) {
    // Logger l'erreur
    console.error("Error formatting MATIC:", error);
    return "0 MATIC";
  }
}

/**
 * Formate un montant USD en string lisible
 * 
 * @param {number} usdAmount - Montant en USD
 * @returns {string} Montant formaté (ex: "$1.50")
 */
function formatUSD(usdAmount) {
  try {
    // Formater avec 2 décimales et symbole $
    return `$${usdAmount.toFixed(2)}`;
  } catch (error) {
    // Logger l'erreur
    console.error("Error formatting USD:", error);
    return "$0.00";
  }
}

// Exporter toutes les fonctions
module.exports = {
  getMATICPrice,
  convertUSDtoMATIC,
  convertMATICtoUSD,
  formatMATIC,
  formatUSD
};

