// TODO: Importer axios pour les requêtes HTTP vers les APIs de prix
// const axios = require("axios");

// TODO: Importer ethers pour les conversions BigNumber
// const { ethers } = require("ethers");

// TODO: Importer dotenv pour les variables d'environnement
// require("dotenv").config();

/**
 * Service de simulation Chainlink Price Feed
 * @notice Simule un oracle de prix pour conversion fiat/crypto
 * @dev Utilise CoinGecko API ou mock data pour obtenir le prix MATIC/USD
 */
// TODO: Cache pour le prix MATIC (éviter trop de requêtes)
// let cachedMATICPrice = null;
// let cacheTimestamp = null;
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère le prix actuel de MATIC en USD
 * @dev TODO: Implémenter la fonction getMATICPrice
 * 
 * Sources possibles:
 * - CoinGecko API (si COINGECKO_API_KEY fourni)
 * - Mock data pour développement
 * 
 * @returns {Promise<number>} Prix MATIC/USD (ex: 0.85 pour $0.85)
 */
async function getMATICPrice() {
  try {
    // TODO: Vérifier si le cache est encore valide
    // if (cachedMATICPrice && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    //   return cachedMATICPrice;
    // }
    
    // TODO: Option 1: Utiliser CoinGecko API si disponible
    // if (process.env.COINGECKO_API_KEY) {
    //   const response = await axios.get(
    //     'https://api.coingecko.com/api/v3/simple/price',
    //     {
    //       params: {
    //         ids: 'matic-network',
    //         vs_currencies: 'usd'
    //       },
    //       headers: {
    //         'X-CG-Pro-API-Key': process.env.COINGECKO_API_KEY
    //       }
    //     }
    //   );
    //   
    //   const price = response.data['matic-network'].usd;
    //   
    //   // TODO: Mettre à jour le cache
    //   cachedMATICPrice = price;
    //   cacheTimestamp = Date.now();
    //   
    //   return price;
    // }
    
    // TODO: Option 2: Utiliser CoinGecko sans API key (rate limit)
    // const response = await axios.get(
    //   'https://api.coingecko.com/api/v3/simple/price',
    //   {
    //     params: {
    //       ids: 'matic-network',
    //       vs_currencies: 'usd'
    //     }
    //   }
    // );
    // 
    // const price = response.data['matic-network'].usd;
    // 
    // // TODO: Mettre à jour le cache
    // cachedMATICPrice = price;
    // cacheTimestamp = Date.now();
    // 
    // return price;
    
    // TODO: Option 3: Mock data pour développement (si pas d'API disponible)
    // const mockPrice = 0.85; // $0.85 par MATIC (valeur de développement)
    // cachedMATICPrice = mockPrice;
    // cacheTimestamp = Date.now();
    // return mockPrice;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error fetching MATIC price:", error);
    
    // TODO: Si erreur, utiliser le cache ou valeur par défaut
    // if (cachedMATICPrice) {
    //   console.warn("Using cached MATIC price due to error");
    //   return cachedMATICPrice;
    // }
    
    // TODO: Retourner une valeur par défaut en cas d'erreur
    // console.warn("Using default MATIC price: 0.85");
    // return 0.85; // Valeur par défaut
  }
}

/**
 * Convertit un montant USD en MATIC (wei)
 * @dev TODO: Implémenter la fonction convertUSDtoMATIC
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
    // TODO: Vérifier que usdAmount est un nombre positif
    // if (typeof usdAmount !== 'number' || usdAmount <= 0) {
    //   throw new Error("usdAmount must be a positive number");
    // }
    
    // TODO: Récupérer le prix MATIC actuel
    // const maticPrice = await getMATICPrice();
    
    // TODO: Calculer le montant MATIC
    // const maticAmount = usdAmount / maticPrice;
    
    // TODO: Convertir en wei (multiplier par 1e18)
    // const maticWei = ethers.utils.parseEther(maticAmount.toString());
    // Note: Pour ethers v6, utiliser: ethers.parseEther(maticAmount.toString())
    
    // TODO: Retourner BigNumber
    // return maticWei;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error converting USD to MATIC:", error);
    // throw error;
  }
}

/**
 * Convertit un montant MATIC (wei) en USD
 * @dev TODO: Implémenter la fonction convertMATICtoUSD
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
    // TODO: Convertir en BigNumber si string
    // const maticWei = ethers.BigNumber.from(maticAmount);
    // Note: Pour ethers v6, utiliser: ethers.BigNumber.from(maticAmount)
    
    // TODO: Récupérer le prix MATIC actuel
    // const maticPrice = await getMATICPrice();
    
    // TODO: Convertir wei en MATIC (diviser par 1e18)
    // const maticAmount = parseFloat(ethers.utils.formatEther(maticWei));
    // Note: Pour ethers v6, utiliser: parseFloat(ethers.formatEther(maticWei))
    
    // TODO: Calculer le montant USD
    // const usdAmount = maticAmount * maticPrice;
    
    // TODO: Arrondir à 2 décimales
    // const roundedUSD = Math.round(usdAmount * 100) / 100;
    
    // TODO: Retourner le montant USD
    // return roundedUSD;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error converting MATIC to USD:", error);
    // throw error;
  }
}

/**
 * Formate un montant MATIC en string lisible
 * @dev TODO: Implémenter la fonction formatMATIC
 * 
 * @param {ethers.BigNumber|string} maticWei - Montant en wei
 * @returns {string} Montant formaté (ex: "1.5 MATIC")
 */
function formatMATIC(maticWei) {
  try {
    // TODO: Convertir wei en MATIC
    // const maticAmount = ethers.utils.formatEther(maticWei);
    // Note: Pour ethers v6, utiliser: ethers.formatEther(maticWei)
    
    // TODO: Arrondir à 4 décimales
    // const rounded = parseFloat(maticAmount).toFixed(4);
    
    // TODO: Retourner formaté
    // return `${rounded} MATIC`;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error formatting MATIC:", error);
    // return "0 MATIC";
  }
}

/**
 * Formate un montant USD en string lisible
 * @dev TODO: Implémenter la fonction formatUSD
 * 
 * @param {number} usdAmount - Montant en USD
 * @returns {string} Montant formaté (ex: "$1.50")
 */
function formatUSD(usdAmount) {
  try {
    // TODO: Formater avec 2 décimales et symbole $
    // return `$${usdAmount.toFixed(2)}`;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error formatting USD:", error);
    // return "$0.00";
  }
}

// TODO: Exporter toutes les fonctions
// module.exports = {
//   getMATICPrice,
//   convertUSDtoMATIC,
//   convertMATICtoUSD,
//   formatMATIC,
//   formatUSD
// };

