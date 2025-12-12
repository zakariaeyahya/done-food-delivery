import { ethers } from 'ethers';
import { getWeb3Provider } from '../utils/web3';

const AMOY_NETWORK_ID = '80002';
const AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology';
const AMOY_CHAIN_PARAMS = {
  chainId: '0x13882',
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: [AMOY_RPC_URL],
  blockExplorerUrls: ['https://amoy.polygonscan.com/']
};

const DONE_TOKEN_ADDRESS = import.meta.env.VITE_DONE_TOKEN_ADDRESS || '';
const ORDER_CONTRACT_ADDRESS = import.meta.env.VITE_ORDER_CONTRACT_ADDRESS || '';

const DONE_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
];

const ORDER_CONTRACT_ABI = [
  'function createOrder(string memory orderId, address restaurant, address deliverer, uint256 amount)',
  'function confirmDelivery(string memory orderId)',
  'function openDispute(string memory orderId, string memory reason)',
];

let provider;
let signer;

export const connectWallet = async () => {
  provider = getWeb3Provider();
  await provider.send('eth_requestAccounts', []);
  signer = await provider.getSigner();
  const address = await signer.getAddress();
  return address;
};

export const verifyAmoyNetwork = async () => {
  if (!provider) provider = getWeb3Provider();
  const network = await provider.getNetwork();
  return network.chainId.toString() === AMOY_NETWORK_ID;
};

export const switchToAmoyNetwork = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed');

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: AMOY_CHAIN_PARAMS.chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [AMOY_CHAIN_PARAMS],
      });
    } else {
      throw switchError;
    }
  }
};

export const getMaticBalance = async (address) => {
  if (!provider) provider = getWeb3Provider();
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

export const getDoneTokenBalance = async (address) => {
  if (!DONE_TOKEN_ADDRESS || !ethers.isAddress(DONE_TOKEN_ADDRESS)) {
    throw new Error('DONE token contract address not configured');
  }

  if (!signer) {
    throw new Error('Wallet not connected');
  }

  const contract = new ethers.Contract(
    DONE_TOKEN_ADDRESS,
    DONE_TOKEN_ABI,
    provider || getWeb3Provider()
  );

  const balance = await contract.balanceOf(address);
  return ethers.formatEther(balance);
};

export const createOnChainOrder = async (orderId, restaurantAddress, delivererAddress, amount) => {
  if (!ORDER_CONTRACT_ADDRESS || !ethers.isAddress(ORDER_CONTRACT_ADDRESS)) {
    throw new Error('Order contract address not configured');
  }

  if (!signer) {
    throw new Error('Wallet not connected');
  }

  const contract = new ethers.Contract(
    ORDER_CONTRACT_ADDRESS,
    ORDER_CONTRACT_ABI,
    signer
  );

  const amountInWei = ethers.parseEther(amount);
  return contract.createOrder(orderId, restaurantAddress, delivererAddress, amountInWei);
};

export const confirmOnChainDelivery = async (orderId) => {
  if (!ORDER_CONTRACT_ADDRESS || !ethers.isAddress(ORDER_CONTRACT_ADDRESS)) {
    throw new Error('Order contract address not configured');
  }

  if (!signer) {
    throw new Error('Wallet not connected');
  }

  const contract = new ethers.Contract(
    ORDER_CONTRACT_ADDRESS,
    ORDER_CONTRACT_ABI,
    signer
  );

  return contract.confirmDelivery(orderId);
};

export const openOnChainDispute = async (orderId, reason) => {
  if (!ORDER_CONTRACT_ADDRESS || !ethers.isAddress(ORDER_CONTRACT_ADDRESS)) {
    throw new Error('Order contract address not configured');
  }

  if (!signer) {
    throw new Error('Wallet not connected');
  }

  const contract = new ethers.Contract(
    ORDER_CONTRACT_ADDRESS,
    ORDER_CONTRACT_ABI,
    signer
  );

  return contract.openDispute(orderId, reason);
};

export const isContractsConfigured = () => {
  return (
    DONE_TOKEN_ADDRESS && 
    ethers.isAddress(DONE_TOKEN_ADDRESS) &&
    ORDER_CONTRACT_ADDRESS && 
    ethers.isAddress(ORDER_CONTRACT_ADDRESS)
  );
};