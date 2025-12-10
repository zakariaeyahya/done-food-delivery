import { ethers } from 'ethers';
import { getWeb3Provider } from '../utils/web3';

// Constants
const MUMBAI_NETWORK_ID = '80001';
const DONE_TOKEN_ADDRESS = 'YOUR_DONE_TOKEN_CONTRACT_ADDRESS'; // Replace with your DONE token contract address
const DONE_TOKEN_ABI = [
  // A minimal ABI for balance check. Replace with your full ABI.
  'function balanceOf(address owner) view returns (uint256)',
];
const ORDER_CONTRACT_ADDRESS = 'YOUR_ORDER_CONTRACT_ADDRESS'; // Replace with your order contract address
const ORDER_CONTRACT_ABI = [
  // Placeholder ABI. Replace with your full order contract ABI.
  'function createOrder(string memory orderId, address restaurant, address deliverer, uint256 amount)',
  'function confirmDelivery(string memory orderId)',
  'function openDispute(string memory orderId, string memory reason)',
];

let provider;
let signer;
let doneTokenContract;
let orderContract;

/**
 * Connects to the MetaMask wallet and gets the signer.
 * @returns {Promise<string>} The connected wallet address.
 */
export const connectWallet = async () => {
  provider = getWeb3Provider();
  await provider.send('eth_requestAccounts', []);
  signer = await provider.getSigner();
  const address = await signer.getAddress();
  
  doneTokenContract = new ethers.Contract(DONE_TOKEN_ADDRESS, DONE_TOKEN_ABI, signer);
  orderContract = new ethers.Contract(ORDER_CONTRACT_ADDRESS, ORDER_CONTRACT_ABI, signer);

  return address;
};

/**
 * Verifies if the connected network is Polygon Mumbai.
 * @returns {Promise<boolean>}
 */
export const verifyMumbaiNetwork = async () => {
  if (!provider) provider = getWeb3Provider();
  const network = await provider.getNetwork();
  return network.chainId.toString() === MUMBAI_NETWORK_ID;
};

/**
 * Gets the MATIC balance of a given address.
 * @param {string} address - The address to check.
 * @returns {Promise<string>} The balance in MATIC.
 */
export const getMaticBalance = async (address) => {
  if (!provider) provider = getWeb3Provider();
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

/**
 * Gets the DONE token balance of a given address.
 * @param {string} address - The address to check.
 * @returns {Promise<string>} The balance in DONE tokens.
 */
export const getDoneTokenBalance = async (address) => {
  if (!doneTokenContract) {
    if (!signer) await connectWallet();
    doneTokenContract = new ethers.Contract(DONE_TOKEN_ADDRESS, DONE_TOKEN_ABI, signer);
  }
  const balance = await doneTokenContract.balanceOf(address);
  return ethers.formatEther(balance);
};

// --- Optional On-Chain Functions ---

/**
 * Creates an order on the blockchain.
 * @param {string} orderId - The off-chain ID of the order.
 * @param {string} restaurantAddress - The restaurant's wallet address.
 * @param {string} delivererAddress - The deliverer's wallet address.
 * @param {string} amount - The order amount in ethers.
 * @returns {Promise<ethers.TransactionResponse>}
 */
export const createOnChainOrder = async (orderId, restaurantAddress, delivererAddress, amount) => {
    if (!orderContract) throw new Error('Order contract not initialized. Please connect wallet.');
    const amountInWei = ethers.parseEther(amount);
    return orderContract.createOrder(orderId, restaurantAddress, delivererAddress, amountInWei);
};

/**
 * Confirms delivery of an order on the blockchain.
 * @param {string} orderId - The off-chain ID of the order.
 * @returns {Promise<ethers.TransactionResponse>}
 */
export const confirmOnChainDelivery = async (orderId) => {
    if (!orderContract) throw new Error('Order contract not initialized. Please connect wallet.');
    return orderContract.confirmDelivery(orderId);
};

/**
 * Opens a dispute for an order on the blockchain.
 * @param {string} orderId - The off-chain ID of the order.
 * @param {string} reason - The reason for the dispute.
 * @returns {Promise<ethers.TransactionResponse>}
 */
export const openOnChainDispute = async (orderId, reason) => {
    if (!orderContract) throw new Error('Order contract not initialized. Please connect wallet.');
    return orderContract.openDispute(orderId, reason);
};