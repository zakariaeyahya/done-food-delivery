// TODO: Importer ipfs-http-client pour créer un client IPFS
// const { create } = require("ipfs-http-client");

// TODO: Importer pinata-sdk pour utiliser Pinata (optionnel)
// const pinataSDK = require("@pinata/sdk");

// TODO: Importer dotenv pour charger les variables d'environnement
// require("dotenv").config();

/**
 * Configuration de la connexion IPFS (Pinata ou IPFS local)
 * @notice Configure le client IPFS pour upload/download de fichiers
 * @dev Utilise Pinata si les clés API sont fournies, sinon IPFS local
 */
let ipfsClient = null;
let pinataAPI = null;
let gatewayURL = null;

/**
 * Initialise la connexion IPFS (Pinata ou local)
 * @dev TODO: Implémenter la fonction initIPFS
 * 
 * Logique:
 * - Si PINATA_API_KEY et PINATA_SECRET_KEY existent: utiliser Pinata SDK
 * - Sinon: créer client IPFS local (http://localhost:5001 ou gateway public)
 * 
 * Variables d'environnement requises:
 * - PINATA_API_KEY (optionnel): Clé API Pinata
 * - PINATA_SECRET_KEY (optionnel): Clé secrète Pinata
 * - IPFS_GATEWAY_URL: URL du gateway IPFS (ex: https://gateway.pinata.cloud/ipfs/)
 * 
 * @returns {Promise<Object>} Client IPFS configuré
 */
async function initIPFS() {
  try {
    // TODO: Vérifier si Pinata est configuré (clés API présentes)
    // if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
    //   // TODO: Initialiser Pinata SDK
    //   pinataAPI = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);
    //   
    //   // TODO: Tester la connexion Pinata
    //   const test = await pinataAPI.testAuthentication();
    //   console.log("Pinata authentication successful:", test);
    //   
    //   // TODO: Définir le gateway URL Pinata
    //   gatewayURL = process.env.IPFS_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/";
    //   
    //   console.log("IPFS initialized with Pinata");
    // } else {
    //   // TODO: Créer client IPFS local ou utiliser gateway public
    //   // Option 1: IPFS local (si IPFS node tourne localement)
    //   // ipfsClient = create({
    //   //   host: "localhost",
    //   //   port: 5001,
    //   //   protocol: "http"
    //   // });
    //   
    //   // Option 2: Utiliser un gateway public (Infura, Cloudflare, etc.)
    //   // ipfsClient = create({
    //   //   url: "https://ipfs.infura.io:5001/api/v0"
    //   // });
    //   
    //   // TODO: Définir le gateway URL public
    //   gatewayURL = process.env.IPFS_GATEWAY_URL || "https://ipfs.io/ipfs/";
    //   
    //   console.log("IPFS initialized with local/public gateway");
    // }

    // TODO: Vérifier la connexion IPFS
    // if (ipfsClient) {
    //   const version = await ipfsClient.version();
    //   console.log("IPFS version:", version);
    // }

    // TODO: Retourner le client IPFS configuré
    // return ipfsClient || pinataAPI;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error initializing IPFS:", error);
    // throw error;
  }
}

/**
 * Récupère la configuration Pinata
 * @dev TODO: Implémenter la fonction getPinataConfig
 * 
 * @returns {Object|null} Objet { apiKey, secretKey } ou null si non configuré
 */
function getPinataConfig() {
  // TODO: Vérifier que les clés Pinata existent
  // if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
  //   return null;
  // }

  // TODO: Retourner la configuration Pinata
  // return {
  //   apiKey: process.env.PINATA_API_KEY,
  //   secretKey: process.env.PINATA_SECRET_KEY
  // };
}

/**
 * Récupère l'URL du gateway IPFS
 * @dev TODO: Implémenter la fonction getIPFSGateway
 * 
 * @returns {string} URL du gateway IPFS
 */
function getIPFSGateway() {
  // TODO: Retourner gatewayURL ou valeur par défaut
  // return gatewayURL || process.env.IPFS_GATEWAY_URL || "https://ipfs.io/ipfs/";
}

/**
 * Récupère le client IPFS
 * @dev TODO: Retourner le client IPFS
 * @returns {Object|null} Client IPFS ou null
 */
function getIPFSClient() {
  // TODO: return ipfsClient;
}

/**
 * Récupère l'API Pinata
 * @dev TODO: Retourner l'API Pinata
 * @returns {Object|null} API Pinata ou null
 */
function getPinataAPI() {
  // TODO: return pinataAPI;
}

/**
 * Vérifie si Pinata est configuré
 * @dev TODO: Vérifier si Pinata est disponible
 * @returns {boolean} True si Pinata est configuré, false sinon
 */
function isPinataConfigured() {
  // TODO: Vérifier que pinataAPI existe
  // return pinataAPI !== null;
}

/**
 * Teste la connexion IPFS
 * @dev TODO: Implémenter la fonction testConnection
 * 
 * @returns {Promise<boolean>} True si la connexion fonctionne, false sinon
 */
async function testConnection() {
  try {
    // TODO: Si Pinata est configuré, tester l'authentification
    // if (pinataAPI) {
    //   await pinataAPI.testAuthentication();
    //   return true;
    // }

    // TODO: Si client IPFS local, tester avec version()
    // if (ipfsClient) {
    //   await ipfsClient.version();
    //   return true;
    // }

    // TODO: Si aucun client configuré, retourner false
    // return false;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("IPFS connection test failed:", error);
    // return false;
  }
}

// TODO: Exporter les fonctions et variables
// module.exports = {
//   initIPFS,
//   getPinataConfig,
//   getIPFSGateway,
//   getIPFSClient,
//   getPinataAPI,
//   isPinataConfigured,
//   testConnection,
//   ipfsClient,
//   pinataAPI,
//   gatewayURL
// };

