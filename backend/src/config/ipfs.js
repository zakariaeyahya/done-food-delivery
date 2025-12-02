/**
 * Configuration IPFS avec Pinata uniquement
 * @notice Utilise Pinata SDK pour tous les uploads/downloads IPFS
 * @dev Pas besoin d'ipfs-http-client, Pinata gère tout
 */

const pinataSDK = require("@pinata/sdk");
require("dotenv").config();

/**
 * Configuration de la connexion IPFS avec Pinata uniquement
 * @notice Configure Pinata SDK pour upload/download de fichiers IPFS
 * @dev Utilise uniquement Pinata pour tous les opérations IPFS
 */
let pinataAPI = null;
let gatewayURL = null;

/**
 * Initialise la connexion IPFS avec Pinata
 * @dev Initialise Pinata SDK si les clés API sont configurées
 * 
 * Variables d'environnement requises:
 * - PINATA_API_KEY: Clé API Pinata (obligatoire pour les uploads)
 * - PINATA_SECRET_KEY: Clé secrète Pinata (obligatoire pour les uploads)
 * - IPFS_GATEWAY_URL: URL du gateway IPFS (optionnel, défaut: https://gateway.pinata.cloud/ipfs/)
 * 
 * @returns {Promise<Object|null>} Instance Pinata API ou null si non configuré
 */
async function initIPFS() {
  try {
    // Vérifier si Pinata est configuré (clés API présentes et valides)
    const isPinataConfigured = process.env.PINATA_API_KEY &&
                               process.env.PINATA_SECRET_KEY &&
                               !process.env.PINATA_API_KEY.includes('your_') &&
                               !process.env.PINATA_SECRET_KEY.includes('your_');

    if (isPinataConfigured) {
      // Initialiser Pinata SDK avec le mot-clé 'new'
      pinataAPI = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);
      
      // Tester la connexion Pinata
      const test = await pinataAPI.testAuthentication();
      console.log("Pinata authentication successful:", test);
      
      // Définir le gateway URL Pinata
      gatewayURL = process.env.IPFS_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/";
      
      console.log("✅ IPFS initialized with Pinata");
      return pinataAPI;
    } else {
      // Pinata non configuré - utiliser uniquement le gateway public pour les téléchargements
      gatewayURL = process.env.IPFS_GATEWAY_URL || "https://ipfs.io/ipfs/";
      
      console.log("⚠️  Pinata non configuré - Gateway public uniquement (téléchargements seulement)");
      console.log("💡 Pour les uploads, configurez PINATA_API_KEY et PINATA_SECRET_KEY dans .env");
      
      // Retourner null car on ne peut pas uploader sans Pinata
      return null;
    }
  } catch (error) {
    // Logger l'erreur
    console.error("Error initializing IPFS:", error);
    throw error;
  }
}

/**
 * Récupère la configuration Pinata
 * @dev Retourne les clés API Pinata depuis les variables d'environnement
 * 
 * @returns {Object|null} Objet { apiKey, secretKey } ou null si non configuré
 */
function getPinataConfig() {
  // Vérifier que les clés Pinata existent
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
    return null;
  }

  // Retourner la configuration Pinata
  return {
    apiKey: process.env.PINATA_API_KEY,
    secretKey: process.env.PINATA_SECRET_KEY
  };
}

/**
 * Récupère l'URL du gateway IPFS
 * @dev Retourne l'URL du gateway pour accéder aux fichiers IPFS
 * 
 * @returns {string} URL du gateway IPFS
 */
function getIPFSGateway() {
  // Retourner gatewayURL ou valeur par défaut
  return gatewayURL || process.env.IPFS_GATEWAY_URL || "https://ipfs.io/ipfs/";
}

/**
 * Récupère le client IPFS (déprécié - utiliser getPinataAPI à la place)
 * @dev Retourne toujours null car on utilise uniquement Pinata
 * @returns {Object|null} Toujours null
 */
function getIPFSClient() {
  // On utilise uniquement Pinata, pas de client IPFS local
  return null;
}

/**
 * Récupère l'API Pinata
 * @dev Retourne l'instance Pinata SDK initialisée
 * @returns {Object|null} API Pinata ou null si non initialisé
 */
function getPinataAPI() {
  return pinataAPI;
}

/**
 * Vérifie si Pinata est configuré
 * @dev Vérifie si l'instance Pinata API a été initialisée
 * @returns {boolean} True si Pinata est configuré, false sinon
 */
function isPinataConfigured() {
  // Vérifier que pinataAPI existe
  return pinataAPI !== null;
}

/**
 * Teste la connexion IPFS/Pinata
 * @dev Teste l'authentification Pinata si configuré
 * 
 * @returns {Promise<boolean>} True si Pinata est connecté, false sinon
 */
async function testConnection() {
  try {
    // Si Pinata est configuré, tester l'authentification
    if (pinataAPI) {
      await pinataAPI.testAuthentication();
      return true;
    }

    // Si Pinata n'est pas configuré, on peut quand même utiliser le gateway public
    // mais on ne peut pas uploader
    if (gatewayURL) {
      console.log("⚠️  Pinata non configuré - Gateway public disponible (téléchargements uniquement)");
      return false; // Retourne false car on ne peut pas uploader
    }

    // Si aucun gateway configuré, retourner false
    return false;
  } catch (error) {
    // Logger l'erreur
    console.error("IPFS connection test failed:", error);
    return false;
  }
}

// Exporter les fonctions et variables
module.exports = {
  initIPFS,
  getPinataConfig,
  getIPFSGateway,
  getIPFSClient, // Retourne toujours null (compatibilité)
  getPinataAPI,
  isPinataConfigured,
  testConnection,
  pinataAPI,
  gatewayURL
};

