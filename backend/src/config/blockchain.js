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
    
    console.warn(`⚠️  ABI not found for ${contractName}, using minimal ABI. Please compile contracts first.`);
    return getMinimalABI(contractName);
  } catch (error) {
    console.warn(`⚠️  Error loading ABI for ${contractName}:`, error.message);
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
      "function createOrder(address restaurant, uint256 foodPrice, uint256 deliveryFee, string memory ipfsHash) external payable returns (uint256)",
      "function confirmPreparation(uint256 orderId) external",
      "function assignDeliverer(uint256 orderId, address deliverer) external",
      "function confirmPickup(uint256 orderId) external",
      "function confirmDelivery(uint256 orderId) external",
      "function openDispute(uint256 orderId, string memory reason) external",
      "function resolveDispute(uint256 orderId, address payable winner, uint256 refundPercent) external",
      "function getOrder(uint256 orderId) external view returns (tuple(uint256 id, address client, address restaurant, address deliverer, uint256 foodPrice, uint256 deliveryFee, uint256 platformFee, uint256 totalAmount, uint8 status, string ipfsHash, uint256 createdAt, bool disputed, bool delivered))",
      "event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 totalAmount)",
      "event PreparationConfirmed(uint256 indexed orderId, address indexed restaurant)",
      "event DelivererAssigned(uint256 indexed orderId, address indexed deliverer)",
      "event PickupConfirmed(uint256 indexed orderId, address indexed deliverer)",
      "event DeliveryConfirmed(uint256 indexed orderId, address indexed client)",
      "event DisputeOpened(uint256 indexed orderId, address indexed opener)",
      "event DisputeResolved(uint256 indexed orderId, address winner, uint256 amount)"
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
      "function calculateReward(uint256 foodPrice) external pure returns (uint256)"
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
    const rpcUrl = process.env.AMOY_RPC_URL || process.env.MUMBAI_RPC_URL;
    if (!rpcUrl) {
      throw new Error("AMOY_RPC_URL or MUMBAI_RPC_URL is not defined in .env");
    }

    provider = new ethers.JsonRpcProvider(rpcUrl);

    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is not defined in .env");
    }

    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

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
    console.log("✅ Connected to network:", network.name, "Chain ID:", network.chainId.toString());

    console.log("✅ Backend wallet address:", wallet.address);

    try {
      await contracts.orderManager.getTotalOrders?.() || await provider.getCode(orderManagerAddress);
      console.log("✅ All contracts initialized successfully");
    } catch (error) {
      console.warn("⚠️  Warning: Could not verify contracts, but initialization completed");
    }

    return contracts;
  } catch (error) {
    console.error("❌ Error initializing blockchain:", error.message);
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
    console.error("Blockchain connection check failed:", error.message);
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
