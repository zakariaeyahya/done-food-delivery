const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

/**
 * Polygon Amoy/Mumbai blockchain connection configuration
 * @notice Configures provider, wallet and smart contract instances
 * @dev Uses ethers.js v6 to interact with Polygon
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
 * Loads ABI from Hardhat artifacts or uses minimal ABI
 * @param {string} contractName - Contract name (e.g., "DoneOrderManager")
 * @returns {Array} Contract ABI
 */
function loadABI(contractName) {
  try {
    const artifactsPath = path.join(__dirname, "../../contracts/artifacts/contracts", `${contractName}.sol`, `${contractName}.json`);
    
    if (fs.existsSync(artifactsPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));
      return artifact.abi;
    }
    
    return getMinimalABI(contractName);
  } catch (error) {
    return getMinimalABI(contractName);
  }
}

/**
 * Returns minimal ABI for a contract (fallback if artifacts unavailable)
 * @param {string} contractName - Contract name
 * @returns {Array} Minimal ABI
 */
function getMinimalABI(contractName) {
  const minimalABIs = {
    DoneOrderManager: [
      // Order management functions
      "function createOrder(address restaurant, uint256 foodPrice, uint256 deliveryFee, string memory ipfsHash) external payable returns (uint256)",
      "function confirmPreparation(uint256 orderId) external",
      "function assignDeliverer(uint256 orderId, address deliverer) external",
      "function confirmPickup(uint256 orderId) external",
      "function confirmDelivery(uint256 orderId) external",
      "function openDispute(uint256 orderId) external",
      "function resolveDispute(uint256 orderId, address payable winner, uint256 refundPercent) external",
      "function getOrder(uint256 orderId) external view returns (tuple(uint256 id, address client, address restaurant, address deliverer, uint256 foodPrice, uint256 deliveryFee, uint256 platformFee, uint256 totalAmount, uint8 status, string ipfsHash, uint256 createdAt, bool disputed, bool delivered))",
      // AccessControl functions (OpenZeppelin)
      "function hasRole(bytes32 role, address account) external view returns (bool)",
      "function grantRole(bytes32 role, address account) external",
      "function revokeRole(bytes32 role, address account) external",
      "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)",
      "function RESTAURANT_ROLE() external view returns (bytes32)",
      "function DELIVERER_ROLE() external view returns (bytes32)",
      "function PLATFORM_ROLE() external view returns (bytes32)",
      // Events
      "event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 totalAmount)",
      "event PreparationConfirmed(uint256 indexed orderId, address indexed restaurant)",
      "event DelivererAssigned(uint256 indexed orderId, address indexed deliverer)",
      "event PickupConfirmed(uint256 indexed orderId, address indexed deliverer)",
      "event DeliveryConfirmed(uint256 indexed orderId, address indexed client)",
      "event DisputeOpened(uint256 indexed orderId, address indexed opener)",
      "event DisputeResolved(uint256 indexed orderId, address winner, uint256 amount)",
      "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)"
    ],
    DonePaymentSplitter: [
      "function splitPayment(uint256 orderId, address payable restaurant, address payable deliverer, address payable platform) external payable",
      "function withdraw(address payee) external",
      "function balances(address) external view returns (uint256)",
      "event PaymentSplit(uint256 indexed orderId, address indexed restaurant, address indexed deliverer, address indexed platform, uint256 restaurantAmount, uint256 delivererAmount, uint256 platformAmount)"
    ],
    DoneToken: [
      "function mint(address to, uint256 amount) external",
      "function burn(uint256 amount) external",
      "function balanceOf(address account) external view returns (uint256)",
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function calculateReward(uint256 foodPrice) external pure returns (uint256)",
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ],
    DoneStaking: [
      "function stakeAsDeliverer() external payable",
      "function unstake() external",
      "function slash(address deliverer, uint256 amount) external",
      "function isStaked(address deliverer) external view returns (bool)",
      "function stakedAmount(address) external view returns (uint256)",
      "event Staked(address indexed deliverer, uint256 amount)",
      "event Unstaked(address indexed deliverer, uint256 amount)",
      "event Slashed(address indexed deliverer, uint256 amount, address indexed platform)"
    ]
  };
  
  return minimalABIs[contractName] || [];
}

/**
 * Initializes blockchain connection and contract instances
 * @dev Initializes provider, wallet and all contract instances
 * 
 * Required environment variables:
 * - AMOY_RPC_URL or MUMBAI_RPC_URL: Polygon RPC URL
 * - PRIVATE_KEY: Backend wallet private key
 * - ORDER_MANAGER_ADDRESS: DoneOrderManager contract address
 * - PAYMENT_SPLITTER_ADDRESS: DonePaymentSplitter contract address
 * - TOKEN_ADDRESS: DoneToken contract address
 * - STAKING_ADDRESS: DoneStaking contract address
 * 
 * @returns {Promise<Object>} Object containing contract instances
 */
async function initBlockchain() {
  try {
    console.log('⛓️  Connecting to Polygon Amoy...');
    const rpcUrl = process.env.AMOY_RPC_URL || process.env.MUMBAI_RPC_URL;
    if (!rpcUrl) {
      throw new Error("AMOY_RPC_URL or MUMBAI_RPC_URL is not defined in .env");
    }

    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Intercepter les erreurs du provider pour gérer silencieusement les erreurs "filter not found"
    // Ces erreurs sont non-critiques et surviennent avec certains providers RPC qui n'ont pas de support
    // persistant pour les filtres d'événements
    
    // Intercepter les erreurs au niveau du provider
    const originalEmit = provider.emit.bind(provider);
    provider.emit = function(event, ...args) {
      // Filtrer silencieusement les erreurs "filter not found" qui sont non-critiques
      if (event === 'error' && args[0]) {
        const error = args[0];
        if (error.code === 'UNKNOWN_ERROR' && 
            error.error && 
            error.error.message === 'filter not found') {
          // Ne pas émettre cette erreur - elle est non-critique
          return false;
        }
      }
      return originalEmit(event, ...args);
    };
    
    // Intercepter les erreurs au niveau de la méthode _send du provider
    // Cela capture les erreurs avant qu'elles ne soient loggées
    const originalSend = provider._send.bind(provider);
    if (originalSend) {
      provider._send = function(payload, callback) {
        const wrappedCallback = function(error, result) {
          // Filtrer les erreurs "filter not found" avant le callback
          if (error && error.code === 'UNKNOWN_ERROR' && 
              error.error && error.error.message === 'filter not found') {
            // Erreur non-critique, ne pas la propager
            return;
          }
          // Appeler le callback original pour les autres erreurs
          if (callback) {
            callback(error, result);
          }
        };
        return originalSend(payload, wrappedCallback);
      };
    }
    
    // Intercepter les erreurs au niveau du gestionnaire d'erreurs interne
    provider.on('error', (error) => {
      // Filtrer silencieusement les erreurs "filter not found"
      if (error && error.code === 'UNKNOWN_ERROR' && 
          error.error && error.error.message === 'filter not found') {
        // Erreur non-critique, ne pas logger
        return;
      }
      // Pour les autres erreurs, les laisser passer normalement
    });

    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is not defined in .env");
    }
    
    // Valider et normaliser la clé privée
    let privateKey = process.env.PRIVATE_KEY.trim();
    
    // Si la clé ne commence pas par 0x, l'ajouter
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    
    // Valider que la clé privée a la bonne longueur (66 caractères avec 0x)
    if (privateKey.length !== 66) {
      throw new Error(`Invalid private key length: ${privateKey.length} (expected 66 characters including 0x prefix). Please check your PRIVATE_KEY in .env`);
    }
    
    // Valider que la clé privée est hexadécimale
    if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      throw new Error("Invalid private key format. Private key must be a 64-character hexadecimal string (optionally prefixed with 0x).");
    }
    
    wallet = new ethers.Wallet(privateKey, provider);

    const orderManagerAddress = process.env.ORDER_MANAGER_ADDRESS;
    const paymentSplitterAddress = process.env.PAYMENT_SPLITTER_ADDRESS;
    const tokenAddress = process.env.TOKEN_ADDRESS;
    const stakingAddress = process.env.STAKING_ADDRESS;

    if (!orderManagerAddress || !paymentSplitterAddress || !tokenAddress || !stakingAddress) {
      throw new Error("Contract addresses are not defined in .env. Required: ORDER_MANAGER_ADDRESS, PAYMENT_SPLITTER_ADDRESS, TOKEN_ADDRESS, STAKING_ADDRESS");
    }

    const orderManagerABI = loadABI("DoneOrderManager");
    const paymentSplitterABI = loadABI("DonePaymentSplitter");
    const tokenABI = loadABI("DoneToken");
    const stakingABI = loadABI("DoneStaking");

    contracts.orderManager = new ethers.Contract(
      orderManagerAddress,
      orderManagerABI,
      wallet
    );

    contracts.paymentSplitter = new ethers.Contract(
      paymentSplitterAddress,
      paymentSplitterABI,
      wallet
    );

    contracts.token = new ethers.Contract(
      tokenAddress,
      tokenABI,
      wallet
    );

    contracts.staking = new ethers.Contract(
      stakingAddress,
      stakingABI,
      wallet
    );

    const network = await provider.getNetwork();
    console.log(`✅ Blockchain connected - Chain ID: ${network.chainId}`);
    console.log(`👛 Wallet: ${wallet.address}`);

    try {
      await contracts.orderManager.getTotalOrders?.() || await provider.getCode(orderManagerAddress);
      console.log('📋 Smart contracts loaded');
    } catch (error) {
      console.log('📋 Smart contracts loaded (minimal ABI)');
    }

    return contracts;
  } catch (error) {
    throw error;
  }
}

/**
 * Gets contract instance by name
 * @param {string} contractName - Contract name ('orderManager', 'paymentSplitter', 'token', 'staking')
 * @returns {Object} Contract instance
 * @throws {Error} If contract not found or not initialized
 */
function getContractInstance(contractName) {
  if (!contracts || !contracts[contractName]) {
    throw new Error(`Contract ${contractName} not found or not initialized. Call initBlockchain() first.`);
  }
  return contracts[contractName];
}

/**
 * Checks if blockchain connection is active
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
async function isConnected() {
  try {
    if (!provider) {
      return false;
    }
    await provider.getNetwork();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets ethers.js provider
 * @returns {Object|null} Provider instance or null
 */
function getProvider() {
  return provider;
}

/**
 * Gets backend wallet
 * @returns {Object|null} Wallet instance or null
 */
function getWallet() {
  return wallet;
}

/**
 * Gets all contract instances
 * @returns {Object} Object containing all contract instances
 */
function getContracts() {
  return contracts;
}

module.exports = {
  initBlockchain,
  getContractInstance,
  isConnected,
  getProvider,
  getWallet,
  getContracts,
  provider,
  wallet,
  contracts
};
