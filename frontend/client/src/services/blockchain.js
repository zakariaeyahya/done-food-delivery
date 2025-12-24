import { ethers } from 'ethers';
import { getWeb3Provider } from '../utils/web3';

// Mode DEMO pour bypasser les appels blockchain réels
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

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
  'function createOrder(address restaurant, uint256 foodPrice, uint256 deliveryFee, string ipfsHash) payable returns (uint256)',
  'function confirmDelivery(uint256 orderId)',
  'function openDispute(uint256 orderId)',
  'function getOrder(uint256 orderId) view returns (tuple(uint256 id, address client, address restaurant, address deliverer, uint256 foodPrice, uint256 deliveryFee, uint256 platformFee, uint256 totalAmount, uint8 status, string ipfsHash, uint256 createdAt, bool disputed, bool delivered))',
  'event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 totalAmount)',
  'event DeliveryConfirmed(uint256 indexed orderId, address indexed client)',
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

export const createOnChainOrder = async (restaurantAddress, foodPrice, deliveryFee, ipfsHash = '') => {
  // En mode DEMO, simuler la transaction
  if (DEMO_MODE) {
    console.log('[DEMO_MODE] Simulating createOrder');
    const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const mockOrderId = Math.floor(Math.random() * 10000) + 1;
    return {
      txHash: mockTxHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      onChainOrderId: mockOrderId.toString()
    };
  }

  if (!ORDER_CONTRACT_ADDRESS || !ethers.isAddress(ORDER_CONTRACT_ADDRESS)) {
    throw new Error('Order contract address not configured');
  }

  if (!signer) {
    provider = getWeb3Provider();
    await provider.send('eth_requestAccounts', []);
    signer = await provider.getSigner();
  }

  const contract = new ethers.Contract(
    ORDER_CONTRACT_ADDRESS,
    ORDER_CONTRACT_ABI,
    signer
  );

  // Convertir les prix en Wei d'abord pour éviter les erreurs de précision flottante
  // Arrondir à 6 décimales avant conversion pour éviter "too many decimals"
  const roundTo6 = (num) => Math.round(parseFloat(num) * 1e6) / 1e6;

  const foodPriceEth = roundTo6(foodPrice);
  const deliveryFeeEth = roundTo6(deliveryFee);

  // Convertir en Wei
  const foodPriceWei = ethers.parseEther(foodPriceEth.toString());
  const deliveryFeeWei = ethers.parseEther(deliveryFeeEth.toString());

  // Calculer platformFee et totalAmount en Wei (comme le smart contract le fait)
  // platformFee = foodPrice * 10 / 100 (arithmétique entière)
  const platformFeeWei = (foodPriceWei * BigInt(10)) / BigInt(100);
  const totalAmountWei = foodPriceWei + deliveryFeeWei + platformFeeWei;

  console.log('Creating on-chain order:', {
    restaurant: restaurantAddress,
    foodPriceWei: foodPriceWei.toString(),
    deliveryFeeWei: deliveryFeeWei.toString(),
    platformFeeWei: platformFeeWei.toString(),
    totalAmountWei: totalAmountWei.toString(),
    totalAmountEth: ethers.formatEther(totalAmountWei),
    ipfsHash: ipfsHash
  });

  // Appeler createOrder avec le montant payable
  const tx = await contract.createOrder(
    restaurantAddress,
    foodPriceWei,
    deliveryFeeWei,
    ipfsHash || '',
    { value: totalAmountWei }
  );

  const receipt = await tx.wait();

  // Extraire l'orderId depuis l'événement OrderCreated
  let onChainOrderId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === 'OrderCreated') {
        onChainOrderId = parsed.args[0].toString();
        break;
      }
    } catch (e) {
      // Skip logs that don't match our ABI
    }
  }

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    onChainOrderId: onChainOrderId
  };
};

export const confirmOnChainDelivery = async (orderId) => {
  // En mode DEMO, simuler la transaction
  if (DEMO_MODE) {
    console.log('[DEMO_MODE] Simulating confirmDelivery for orderId:', orderId);
    const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    return {
      txHash: mockTxHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000
    };
  }

  if (!ORDER_CONTRACT_ADDRESS || !ethers.isAddress(ORDER_CONTRACT_ADDRESS)) {
    throw new Error('Order contract address not configured');
  }

  if (!signer) {
    provider = getWeb3Provider();
    await provider.send('eth_requestAccounts', []);
    signer = await provider.getSigner();
  }

  const contract = new ethers.Contract(
    ORDER_CONTRACT_ADDRESS,
    ORDER_CONTRACT_ABI,
    signer
  );

  // orderId doit être un nombre
  const orderIdNum = typeof orderId === 'string' ? parseInt(orderId) : orderId;

  const tx = await contract.confirmDelivery(orderIdNum);
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
};

export const openOnChainDispute = async (orderId) => {
  // En mode DEMO, simuler la transaction
  if (DEMO_MODE) {
    console.log('[DEMO_MODE] Simulating openDispute for orderId:', orderId);
    const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    return {
      txHash: mockTxHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000
    };
  }

  if (!ORDER_CONTRACT_ADDRESS || !ethers.isAddress(ORDER_CONTRACT_ADDRESS)) {
    throw new Error('Order contract address not configured');
  }

  if (!signer) {
    provider = getWeb3Provider();
    await provider.send('eth_requestAccounts', []);
    signer = await provider.getSigner();
  }

  const contract = new ethers.Contract(
    ORDER_CONTRACT_ADDRESS,
    ORDER_CONTRACT_ABI,
    signer
  );

  const orderIdNum = typeof orderId === 'string' ? parseInt(orderId) : orderId;

  const tx = await contract.openDispute(orderIdNum);
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
};

export const isContractsConfigured = () => {
  return (
    DONE_TOKEN_ADDRESS && 
    ethers.isAddress(DONE_TOKEN_ADDRESS) &&
    ORDER_CONTRACT_ADDRESS && 
    ethers.isAddress(ORDER_CONTRACT_ADDRESS)
  );
};