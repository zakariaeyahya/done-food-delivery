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
 *
 * Utilisation :
 * const priceOracleService = require('./services/priceOracleService');
 * const maticUsdPrice = await priceOracleService.getMaticUsdPrice();
 * console.log(`1 MATIC = $${maticUsdPrice}`);
 *
 * Configuration requise dans .env :
 * - PRICE_ORACLE_ADDRESS (adresse DonePriceOracle.sol)
 * - COINGECKO_API_KEY (optionnel, pour rate limit plus élevé)
 *
 * Référence :
 * - contracts/oracles/README.md
 * - infrastructure/README.md - Section "Redondance Oracles"
 */

// TODO: Implémenter getMaticUsdPrice() avec fallback
// TODO: Implémenter getChainlinkPrice() (on-chain)
// TODO: Implémenter getCoinGeckoPrice() (API)
// TODO: Ajouter cache avec TTL 5 minutes
// TODO: Valider fraîcheur des données
