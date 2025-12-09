/**
 * Service Blockchain Web3 - Restaurant
 * @notice Gère toutes les interactions directes avec la blockchain Polygon Amoy pour les restaurants
 * @dev Utilise ethers.js v6 pour interagir avec les smart contracts
 */

import { ethers } from 'ethers';

// ABIs minimaux basés sur les interfaces des contrats
const DoneOrderManagerABI = [
  "function confirmPreparation(uint256 orderId) external",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function getRestaurantOrders(address restaurant) external view returns (uint256[] memory)",
  "function orders(uint256) external view returns (uint256, address, address, address, uint256, uint256, uint8, string memory, uint256)",
  "event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 foodPrice, uint256 deliveryFee)"
];

const DonePaymentSplitterABI = [
  "function balances(address) external view returns (uint256)",
  "function withdraw() external",
  "event PaymentSplit(uint256 indexed orderId, address indexed restaurant, address indexed deliverer, address platform, uint256 restaurantAmount, uint256 delivererAmount, uint256 platformAmount)"
];

/**
 * Configuration de base
 * @dev Récupère les adresses des contrats depuis les variables d'environnement
 */
const ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS;
const PAYMENT_SPLITTER_ADDRESS = import.meta.env.VITE_PAYMENT_SPLITTER_ADDRESS;

// Réseau Polygon Amoy (testnet)
const CHAIN_ID = 80002; // Chain ID de Polygon Amoy

// RPC URLs fiables pour Polygon Amoy (fallback si MetaMask RPC échoue)
const AMOY_RPC_URLS = [
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://polygon-amoy.blockpi.network/v1/rpc/public",
  "https://api.zan.top/node/v1/polygon/amoy/public"
];

// Définir le rôle RESTAURANT_ROLE (bytes32)
const RESTAURANT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RESTAURANT_ROLE"));

/**
 * Variables globales pour provider et signer
 */
let provider = null;
let signer = null;
let orderManagerContract = null;
let paymentSplitterContract = null;

/**
 * Réinitialiser toutes les instances (après changement de réseau)
 */
function resetInstances() {
  provider = null;
  signer = null;
  orderManagerContract = null;
  paymentSplitterContract = null;
}

/**
 * Initialiser le provider Web3 depuis MetaMask
 * @returns {ethers.BrowserProvider} Instance du provider
 */
function getProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  // Toujours créer un nouveau provider pour éviter les erreurs de changement de réseau
  provider = new ethers.BrowserProvider(window.ethereum);

  return provider;
}

/**
 * Obtenir un provider JSON-RPC fallback (quand MetaMask RPC échoue)
 * @returns {ethers.JsonRpcProvider} Provider JSON-RPC
 */
async function getFallbackProvider() {
  for (const rpcUrl of AMOY_RPC_URLS) {
    try {
      const fallbackProvider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: CHAIN_ID,
        name: "polygon-amoy"
      });
      // Tester la connexion avec un timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 5000)
      );
      await Promise.race([fallbackProvider.getBlockNumber(), timeoutPromise]);
      console.log("✅ Using fallback RPC:", rpcUrl);
      return fallbackProvider;
    } catch (e) {
      console.warn("❌ RPC failed:", rpcUrl, e.message);
    }
  }
  throw new Error("All fallback RPC endpoints failed");
}

/**
 * Vérifier et switcher vers le réseau Polygon Amoy si nécessaire
 * @returns {Promise<void>}
 */
export async function switchToAmoyNetwork() {
  try {
    // Format correct du chainId pour Polygon Amoy (80002 = 0x13882)
    const chainIdHex = `0x${CHAIN_ID.toString(16)}`;

    // Vérifier le réseau actuel via MetaMask directement
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

    if (currentChainId !== chainIdHex) {
      // Reset les instances car on va changer de réseau
      resetInstances();

      try {
        // Essayer de switcher vers Amoy
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError) {
        // Si le réseau n'est pas ajouté (code 4902)
        if (switchError.code === 4902) {
          // Ajouter le réseau Amoy
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: chainIdHex,
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'POL',
                  symbol: 'POL',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.ankr.com/polygon_amoy'],
                blockExplorerUrls: ['https://amoy.polygonscan.com']
              }]
            });
          } catch (addError) {
            if (addError.code === 4001) {
              throw new Error('User rejected network addition');
            }
            throw addError;
          }
        } else if (switchError.code === 4001) {
          throw new Error('User rejected network switch');
        } else {
          throw switchError;
        }
      }

      // Après le switch, reset les instances pour utiliser le nouveau réseau
      resetInstances();
    }
  } catch (error) {
    if (error.message && error.message.includes('rejected')) {
      throw error;
    }
    console.error('Error switching network:', error);
    throw error;
  }
}

/**
 * 1. Connecter le wallet MetaMask
 * @returns {Promise<Object>} { address, signer }
 * 
 * @example
 * const { address, signer } = await connectWallet();
 */
export async function connectWallet() {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // Switcher vers Amoy si nécessaire (cela reset les instances si besoin)
    await switchToAmoyNetwork();

    // Demander connexion
    const prov = getProvider();
    await prov.send("eth_requestAccounts", []);

    // Récupérer signer
    signer = await prov.getSigner();
    const address = await signer.getAddress();

    // Avertissement si les adresses ne sont pas configurées
    if (!ORDER_MANAGER_ADDRESS || ORDER_MANAGER_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.warn('⚠️ VITE_ORDER_MANAGER_ADDRESS not configured. Some features may not work.');
    }
    if (!PAYMENT_SPLITTER_ADDRESS || PAYMENT_SPLITTER_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.warn('⚠️ VITE_PAYMENT_SPLITTER_ADDRESS not configured. Some features may not work.');
    }

    // Réinitialiser les contrats avec le nouveau signer
    orderManagerContract = null;
    paymentSplitterContract = null;

    if (ORDER_MANAGER_ADDRESS && ORDER_MANAGER_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      orderManagerContract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI, signer);
    }
    if (PAYMENT_SPLITTER_ADDRESS && PAYMENT_SPLITTER_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      paymentSplitterContract = new ethers.Contract(PAYMENT_SPLITTER_ADDRESS, DonePaymentSplitterABI, signer);
    }

    return { address, signer };
  } catch (error) {
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
}

/**
 * 2. Vérifier si une adresse a le rôle RESTAURANT_ROLE
 * @param {string} role - Rôle à vérifier (RESTAURANT_ROLE)
 * @param {string} address - Adresse à vérifier
 * @returns {Promise<boolean>} true si l'adresse a le rôle
 * 
 * @example
 * const hasRole = await hasRole(RESTAURANT_ROLE, '0x...');
 */
export async function hasRole(role, address) {
  try {
    if (!address) {
      throw new Error('Address is required');
    }
    
    if (!ORDER_MANAGER_ADDRESS) {
      throw new Error('Order manager address not configured');
    }
    
    // Essayer d'abord avec MetaMask provider
    try {
      const prov = getProvider();
      const contract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI, prov);
      const hasRoleResult = await contract.hasRole(role, address);
      return hasRoleResult;
    } catch (metaMaskError) {
      console.warn("MetaMask RPC failed, trying fallback...", metaMaskError.message);
      
      // Fallback: utiliser un RPC public
      const fallbackProvider = await getFallbackProvider();
      const contract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI, fallbackProvider);
      const hasRoleResult = await contract.hasRole(role, address);
      return hasRoleResult;
    }
  } catch (error) {
    throw new Error(`Failed to check role: ${error.message}`);
  }
}

/**
 * 3. Confirmer la préparation d'une commande on-chain
 * @param {number} orderId - ID de la commande
 * @returns {Promise<Object>} { txHash, receipt }
 * 
 * @example
 * const { txHash } = await confirmPreparationOnChain(123);
 */
export async function confirmPreparationOnChain(orderId) {
  try {
    if (!signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    
    if (!ORDER_MANAGER_ADDRESS) {
      throw new Error('Order manager address not configured');
    }
    
    if (!orderManagerContract) {
      orderManagerContract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI, signer);
    }
    
    // Appeler confirmPreparation sur le contrat
    const orderIdBigInt = typeof orderId === 'number' ? BigInt(orderId) : BigInt(orderId);
    const tx = await orderManagerContract.confirmPreparation(orderIdBigInt);
    
    // Attendre confirmation
    const receipt = await tx.wait();
    
    return { txHash: receipt.hash, receipt };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('User rejected transaction');
    }
    throw new Error(`Failed to confirm preparation: ${error.message}`);
  }
}

/**
 * 4. Récupérer les commandes d'un restaurant depuis la blockchain
 * @param {string} restaurantAddress - Adresse wallet du restaurant
 * @returns {Promise<Array>} Array d'orderIds
 * 
 * @example
 * const orderIds = await getRestaurantOrders('0x...');
 */
export async function getRestaurantOrders(restaurantAddress) {
  try {
    if (!restaurantAddress) {
      throw new Error('Restaurant address is required');
    }
    
    if (!ORDER_MANAGER_ADDRESS) {
      throw new Error('Order manager address not configured');
    }
    
    const provider = getProvider();
    if (!orderManagerContract) {
      orderManagerContract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI, provider);
    }
    
    // Appeler getRestaurantOrders sur le contrat
    const orderIds = await orderManagerContract.getRestaurantOrders(restaurantAddress);
    
    return orderIds.map(id => Number(id));
  } catch (error) {
    throw new Error(`Failed to get restaurant orders: ${error.message}`);
  }
}

/**
 * 5. Récupérer les revenus on-chain d'un restaurant (somme des PaymentSplit events)
 * @param {string} restaurantAddress - Adresse wallet du restaurant
 * @returns {Promise<number>} Total earnings en MATIC
 * 
 * @example
 * const totalEarnings = await getEarningsOnChain('0x...');
 */
export async function getEarningsOnChain(restaurantAddress) {
  try {
    if (!restaurantAddress) {
      throw new Error('Restaurant address is required');
    }
    
    // Récupérer tous les events PaymentSplit pour ce restaurant
    const events = await getPaymentSplitEvents(restaurantAddress);
    
    // Somme des restaurantAmount (70% de chaque commande)
    const totalEarnings = events.reduce((sum, event) => {
      return sum + parseFloat(ethers.formatEther(event.restaurantAmount));
    }, 0);
    
    return totalEarnings;
  } catch (error) {
    throw new Error(`Failed to get earnings: ${error.message}`);
  }
}

/**
 * 6. Récupérer tous les events PaymentSplit pour un restaurant
 * @param {string} restaurantAddress - Adresse wallet du restaurant
 * @returns {Promise<Array>} Array d'events avec { orderId, restaurantAmount, delivererAmount, platformAmount, txHash, blockNumber, timestamp }
 * 
 * @example
 * const events = await getPaymentSplitEvents('0x...');
 */
export async function getPaymentSplitEvents(restaurantAddress) {
  try {
    if (!restaurantAddress) {
      throw new Error('Restaurant address is required');
    }
    
    if (!PAYMENT_SPLITTER_ADDRESS) {
      throw new Error('Payment splitter address not configured');
    }
    
    const provider = getProvider();
    if (!paymentSplitterContract) {
      paymentSplitterContract = new ethers.Contract(PAYMENT_SPLITTER_ADDRESS, DonePaymentSplitterABI, provider);
    }
    
    // Filtrer events PaymentSplit où restaurant = restaurantAddress
    const filter = paymentSplitterContract.filters.PaymentSplit(null, restaurantAddress);
    const events = await paymentSplitterContract.queryFilter(filter);
    
    // Parser les events
    const parsedEvents = events.map(event => ({
      orderId: Number(event.args[0]),
      restaurant: event.args[1],
      deliverer: event.args[2],
      platform: event.args[3],
      restaurantAmount: event.args[4], // 70%
      delivererAmount: event.args[5],   // 20%
      platformAmount: event.args[6],     // 10%
      txHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: null // Peut être récupéré depuis le block si nécessaire
    }));
    
    return parsedEvents;
  } catch (error) {
    throw new Error(`Failed to get payment split events: ${error.message}`);
  }
}

/**
 * 7. Récupérer le solde en attente (pending balance) dans le PaymentSplitter
 * @param {string} restaurantAddress - Adresse wallet du restaurant
 * @returns {Promise<number>} Pending balance en MATIC
 * 
 * @example
 * const pending = await getPendingBalance('0x...');
 * 
 * @notice IMPORTANT: Le contrat PaymentSplitter actuel utilise un pattern PUSH (transfert immédiat).
 * Si le contrat n'a pas de fonction balances() ou withdraw(), cette fonction retournera 0.
 */
export async function getPendingBalance(restaurantAddress) {
  try {
    if (!restaurantAddress) {
      throw new Error('Restaurant address is required');
    }
    
    if (!PAYMENT_SPLITTER_ADDRESS) {
      throw new Error('Payment splitter address not configured');
    }
    
    const provider = getProvider();
    if (!paymentSplitterContract) {
      paymentSplitterContract = new ethers.Contract(PAYMENT_SPLITTER_ADDRESS, DonePaymentSplitterABI, provider);
    }
    
    // Vérifier si le contrat a une fonction balances()
    // Si le contrat utilise pattern PUSH, cette fonction n'existe pas
    try {
      const balance = await paymentSplitterContract.balances(restaurantAddress);
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      // Si balances() n'existe pas, le contrat utilise pattern PUSH
      // Les fonds sont déjà transférés, donc balance = 0
      console.warn('PaymentSplitter uses PUSH pattern. Funds are transferred immediately.');
      return 0;
    }
  } catch (error) {
    throw new Error(`Failed to get pending balance: ${error.message}`);
  }
}

/**
 * 8. Retirer les fonds du PaymentSplitter vers le wallet restaurant
 * @returns {Promise<Object>} { txHash, amount, receipt }
 * 
 * @example
 * const { txHash, amount } = await withdraw();
 * 
 * @notice IMPORTANT: Le contrat PaymentSplitter actuel utilise un pattern PUSH (transfert immédiat).
 * Si le contrat n'a pas de fonction withdraw(), cette fonction lancera une erreur.
 */
export async function withdraw() {
  try {
    if (!signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    
    if (!PAYMENT_SPLITTER_ADDRESS) {
      throw new Error('Payment splitter address not configured');
    }
    
    if (!paymentSplitterContract) {
      paymentSplitterContract = new ethers.Contract(PAYMENT_SPLITTER_ADDRESS, DonePaymentSplitterABI, signer);
    }
    
    const address = await signer.getAddress();
    
    // Vérifier si le contrat a une fonction withdraw()
    // Si le contrat utilise pattern PUSH, cette fonction n'existe pas
    try {
      // Vérifier balance avant retrait
      const balance = await paymentSplitterContract.balances(address);
      const amount = parseFloat(ethers.formatEther(balance));
      
      if (amount <= 0) {
        throw new Error('No funds available to withdraw');
      }
      
      // Appeler withdraw() sur le contrat
      const tx = await paymentSplitterContract.withdraw();
      
      // Attendre confirmation
      const receipt = await tx.wait();
      
      return { txHash: receipt.hash, amount, receipt };
    } catch (error) {
      // Si withdraw() n'existe pas, le contrat utilise pattern PUSH
      throw new Error('PaymentSplitter uses PUSH pattern. Funds are already transferred. No withdraw() function available.');
    }
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('User rejected transaction');
    }
    throw new Error(`Failed to withdraw: ${error.message}`);
  }
}

/**
 * 9. Récupérer les détails d'une commande depuis la blockchain
 * @param {number} orderId - ID de la commande
 * @returns {Promise<Object>} Order struct avec tous les détails
 * 
 * @example
 * const order = await getOrderOnChain(123);
 */
export async function getOrderOnChain(orderId) {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    if (!ORDER_MANAGER_ADDRESS) {
      throw new Error('Order manager address not configured');
    }
    
    const provider = getProvider();
    if (!orderManagerContract) {
      orderManagerContract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI, provider);
    }
    
    // Appeler orders(orderId) sur le contrat
    const orderIdBigInt = typeof orderId === 'number' ? BigInt(orderId) : BigInt(orderId);
    const order = await orderManagerContract.orders(orderIdBigInt);
    
    // Parser la struct Order
    return {
      id: Number(order[0]),
      client: order[1],
      restaurant: order[2],
      deliverer: order[3],
      foodPrice: ethers.formatEther(order[4] || 0),
      deliveryFee: ethers.formatEther(order[5] || 0),
      status: Number(order[6]), // 0=CREATED, 1=PREPARING, 2=IN_DELIVERY, 3=DELIVERED, 4=DISPUTED
      ipfsHash: order[7],
      createdAt: Number(order[8] || 0)
    };
  } catch (error) {
    throw new Error(`Failed to get order: ${error.message}`);
  }
}

/**
 * 10. Récupérer le solde MATIC d'une adresse
 * @param {string} address - Adresse wallet
 * @returns {Promise<string>} Balance en MATIC (formaté)
 */
export async function getBalance(address) {
  try {
    if (!address) {
      throw new Error('Address is required');
    }

    // Essayer d'abord avec MetaMask provider
    try {
      const prov = getProvider();
      const balanceWei = await prov.getBalance(address);
      return ethers.formatEther(balanceWei);
    } catch (metaMaskError) {
      console.warn("MetaMask RPC failed for balance, trying fallback...", metaMaskError.message);
      
      // Fallback: utiliser un RPC public
      const fallbackProvider = await getFallbackProvider();
      const balanceWei = await fallbackProvider.getBalance(address);
      return ethers.formatEther(balanceWei);
    }
  } catch (error) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
}

/**
 * Export des constantes
 */
export {
  RESTAURANT_ROLE
};
