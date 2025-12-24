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

  // Obtenir le gas price actuel du réseau (compatible Polygon Amoy)
  let gasPrice;
  try {
    const currentGasPrice = await signer.provider.send('eth_gasPrice', []);
    gasPrice = (BigInt(currentGasPrice) * BigInt(120)) / BigInt(100); // +20%
  } catch {
    gasPrice = ethers.parseUnits('30', 'gwei'); // Fallback
  }

  // Appeler createOrder avec le montant payable et gas approprié
  const tx = await contract.createOrder(
    restaurantAddress,
    foodPriceWei,
    deliveryFeeWei,
    ipfsHash || '',
    {
      value: totalAmountWei,
      gasPrice: gasPrice
    }
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

  // Obtenir le gas price actuel du réseau (compatible Polygon Amoy)
  let gasPrice;
  try {
    const currentGasPrice = await signer.provider.send('eth_gasPrice', []);
    gasPrice = (BigInt(currentGasPrice) * BigInt(120)) / BigInt(100); // +20%
  } catch {
    gasPrice = ethers.parseUnits('30', 'gwei'); // Fallback
  }

  const tx = await contract.confirmDelivery(orderIdNum, { gasPrice });
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
};

export const openOnChainDispute = async (orderId) => {
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

  // Obtenir le gas price actuel du réseau (compatible Polygon Amoy)
  let gasPrice;
  try {
    const currentGasPrice = await signer.provider.send('eth_gasPrice', []);
    gasPrice = (BigInt(currentGasPrice) * BigInt(120)) / BigInt(100); // +20%
  } catch {
    gasPrice = ethers.parseUnits('30', 'gwei'); // Fallback
  }

  const tx = await contract.openDispute(orderIdNum, { gasPrice });
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

/**
 * Vérifie si une transaction existe réellement sur la blockchain Polygon Amoy
 * @param {string} txHash - Le hash de la transaction à vérifier
 * @returns {Promise<{verified: boolean, transaction: object|null, error: string|null}>}
 */
export const verifyTransaction = async (txHash) => {
  if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x') || txHash.length !== 66) {
    return {
      verified: false,
      transaction: null,
      error: 'Hash de transaction invalide'
    };
  }

  try {
    // Utiliser un provider RPC direct pour Polygon Amoy (pas besoin de wallet connecté)
    const rpcProvider = new ethers.JsonRpcProvider(AMOY_RPC_URL);

    // Récupérer la transaction
    const transaction = await rpcProvider.getTransaction(txHash);

    if (!transaction) {
      return {
        verified: false,
        transaction: null,
        error: 'Transaction non trouvée sur la blockchain'
      };
    }

    // Récupérer le reçu pour confirmer que la transaction a été minée
    const receipt = await rpcProvider.getTransactionReceipt(txHash);

    if (!receipt) {
      return {
        verified: false,
        transaction: transaction,
        error: 'Transaction en attente (non confirmée)'
      };
    }

    // Vérifier si la transaction a réussi
    if (receipt.status === 0) {
      return {
        verified: false,
        transaction: transaction,
        error: 'Transaction échouée (reverted)'
      };
    }

    return {
      verified: true,
      transaction: {
        hash: transaction.hash,
        blockNumber: receipt.blockNumber,
        from: transaction.from,
        to: transaction.to,
        status: receipt.status === 1 ? 'success' : 'failed',
        confirmations: await rpcProvider.getBlockNumber() - receipt.blockNumber
      },
      error: null
    };
  } catch (error) {
    console.error('[verifyTransaction] Error:', error);
    return {
      verified: false,
      transaction: null,
      error: error.message || 'Erreur lors de la vérification'
    };
  }
};