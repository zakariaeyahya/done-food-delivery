// TODO: Importer ethers depuis ethers.js pour les interactions blockchain
// const { ethers } = require("ethers");

// TODO: Importer dotenv pour charger les variables d'environnement
// require("dotenv").config();

// TODO: Importer fs pour lire les fichiers ABI depuis artifacts/
// const fs = require("fs");
// const path = require("path");

/**
 * Configuration de la connexion à la blockchain Polygon Mumbai
 * @notice Configure le provider, wallet et instances des smart contracts
 * @dev Utilise ethers.js pour interagir avec Polygon Mumbai
 */
let provider = null;
let wallet = null;
let contracts = {
  orderManager: null,
  paymentSplitter: null,
  token: null,
  staking: null
};

/**
 * Initialise la connexion à la blockchain et les instances des contrats
 * @dev TODO: Implémenter la fonction initBlockchain
 * 
 * Étapes:
 * 1. Créer un provider ethers.js avec MUMBAI_RPC_URL depuis .env
 * 2. Créer un wallet depuis PRIVATE_KEY depuis .env
 * 3. Charger les ABIs des contrats depuis artifacts/
 * 4. Instancier les 4 contrats avec leurs adresses depuis .env
 * 5. Stocker les instances dans l'objet contracts
 * 6. Retourner les instances de contrats
 * 
 * Variables d'environnement requises:
 * - MUMBAI_RPC_URL: URL du RPC Polygon Mumbai
 * - PRIVATE_KEY: Clé privée du wallet backend (sans 0x)
 * - ORDER_MANAGER_ADDRESS: Adresse du contrat DoneOrderManager
 * - PAYMENT_SPLITTER_ADDRESS: Adresse du contrat DonePaymentSplitter
 * - TOKEN_ADDRESS: Adresse du contrat DoneToken
 * - STAKING_ADDRESS: Adresse du contrat DoneStaking
 * 
 * @returns {Promise<Object>} Objet contenant les instances des contrats
 */
async function initBlockchain() {
  try {
    // TODO: Vérifier que MUMBAI_RPC_URL existe dans .env
    // if (!process.env.MUMBAI_RPC_URL) {
    //   throw new Error("MUMBAI_RPC_URL is not defined in .env");
    // }

    // TODO: Créer un provider ethers.js avec MUMBAI_RPC_URL
    // provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);
    // Note: Pour ethers v6, utiliser JsonRpcProvider
    // Pour ethers v5, utiliser: new ethers.providers.JsonRpcProvider(process.env.MUMBAI_RPC_URL)

    // TODO: Vérifier que PRIVATE_KEY existe dans .env
    // if (!process.env.PRIVATE_KEY) {
    //   throw new Error("PRIVATE_KEY is not defined in .env");
    // }

    // TODO: Créer un wallet depuis PRIVATE_KEY
    // wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    // Note: Pour ethers v6: new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    // Pour ethers v5: new ethers.Wallet(process.env.PRIVATE_KEY, provider)

    // TODO: Vérifier que toutes les adresses des contrats existent dans .env
    // if (!process.env.ORDER_MANAGER_ADDRESS || !process.env.PAYMENT_SPLITTER_ADDRESS || 
    //     !process.env.TOKEN_ADDRESS || !process.env.STAKING_ADDRESS) {
    //   throw new Error("Contract addresses are not defined in .env");
    // }

    // TODO: Charger les ABIs des contrats depuis artifacts/
    // Chemin: ../contracts/artifacts/contracts/DoneOrderManager.sol/DoneOrderManager.json
    // const orderManagerABI = JSON.parse(
    //   fs.readFileSync(
    //     path.join(__dirname, "../../contracts/artifacts/contracts/DoneOrderManager.sol/DoneOrderManager.json"),
    //     "utf8"
    //   )
    // ).abi;
    
    // TODO: Répéter pour les 3 autres contrats:
    // - DonePaymentSplitter.sol/DonePaymentSplitter.json
    // - DoneToken.sol/DoneToken.json
    // - DoneStaking.sol/DoneStaking.json

    // TODO: Instancier le contrat DoneOrderManager
    // contracts.orderManager = new ethers.Contract(
    //   process.env.ORDER_MANAGER_ADDRESS,
    //   orderManagerABI,
    //   wallet // ou provider pour les appels en lecture seule
    // );

    // TODO: Instancier le contrat DonePaymentSplitter
    // contracts.paymentSplitter = new ethers.Contract(
    //   process.env.PAYMENT_SPLITTER_ADDRESS,
    //   paymentSplitterABI,
    //   wallet
    // );

    // TODO: Instancier le contrat DoneToken
    // contracts.token = new ethers.Contract(
    //   process.env.TOKEN_ADDRESS,
    //   tokenABI,
    //   wallet
    // );

    // TODO: Instancier le contrat DoneStaking
    // contracts.staking = new ethers.Contract(
    //   process.env.STAKING_ADDRESS,
    //   stakingABI,
    //   wallet
    // );

    // TODO: Vérifier la connexion en appelant getNetwork()
    // const network = await provider.getNetwork();
    // console.log("Connected to network:", network.name, "Chain ID:", network.chainId);

    // TODO: Afficher l'adresse du wallet
    // console.log("Backend wallet address:", wallet.address);

    // TODO: Retourner les instances de contrats
    // return contracts;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error initializing blockchain:", error);
    // throw error;
  }
}

/**
 * Récupère l'instance d'un contrat par son nom
 * @dev TODO: Implémenter la fonction getContractInstance
 * 
 * @param {string} contractName - Nom du contrat ('orderManager', 'paymentSplitter', 'token', 'staking')
 * @returns {Object|null} Instance du contrat ou null si non trouvé
 */
function getContractInstance(contractName) {
  // TODO: Vérifier que contracts est initialisé
  // if (!contracts || !contracts[contractName]) {
  //   throw new Error(`Contract ${contractName} not found or not initialized`);
  // }

  // TODO: Retourner l'instance du contrat demandé
  // return contracts[contractName];
}

/**
 * Vérifie si la connexion à la blockchain est active
 * @dev TODO: Implémenter la fonction isConnected
 * 
 * @returns {Promise<boolean>} True si connecté, false sinon
 */
async function isConnected() {
  try {
    // TODO: Vérifier que provider existe
    // if (!provider) {
    //   return false;
    // }

    // TODO: Appeler getNetwork() pour vérifier la connexion
    // await provider.getNetwork();
    // return true;
  } catch (error) {
    // TODO: Logger l'erreur si la connexion échoue
    // console.error("Blockchain connection check failed:", error);
    // return false;
  }
}

/**
 * Récupère le provider ethers.js
 * @dev TODO: Retourner le provider
 * @returns {Object|null} Instance du provider ou null
 */
function getProvider() {
  // TODO: return provider;
}

/**
 * Récupère le wallet backend
 * @dev TODO: Retourner le wallet
 * @returns {Object|null} Instance du wallet ou null
 */
function getWallet() {
  // TODO: return wallet;
}

/**
 * Récupère toutes les instances de contrats
 * @dev TODO: Retourner l'objet contracts
 * @returns {Object} Objet contenant toutes les instances de contrats
 */
function getContracts() {
  // TODO: return contracts;
}

// TODO: Exporter les fonctions et variables
// module.exports = {
//   initBlockchain,
//   getContractInstance,
//   isConnected,
//   getProvider,
//   getWallet,
//   getContracts,
//   provider,
//   wallet,
//   contracts
// };

