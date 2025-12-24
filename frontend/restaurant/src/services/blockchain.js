import { ethers } from 'ethers';
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
  "event PaymentSplit(uint256 indexed orderId, address indexed restaurant, address indexed deliverer, address indexed platform, uint256 restaurantAmount, uint256 delivererAmount, uint256 platformAmount)"
];

const ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS;
const PAYMENT_SPLITTER_ADDRESS = import.meta.env.VITE_PAYMENT_SPLITTER_ADDRESS;

const CHAIN_ID = 80002;
const AMOY_RPC_URLS = [
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://polygon-amoy.blockpi.network/v1/rpc/public",
  "https://api.zan.top/node/v1/polygon/amoy/public"
];

const RESTAURANT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RESTAURANT_ROLE"));
let provider = null;
let signer = null;
let orderManagerContract = null;
let paymentSplitterContract = null;

function resetInstances() {
  provider = null;
  signer = null;
  orderManagerContract = null;
  paymentSplitterContract = null;
}

function getProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  provider = new ethers.BrowserProvider(window.ethereum);

  return provider;
}

async function getFallbackProvider() {
  for (const rpcUrl of AMOY_RPC_URLS) {
    try {
      const fallbackProvider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: CHAIN_ID,
        name: "polygon-amoy"
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000)
      );
      await Promise.race([fallbackProvider.getBlockNumber(), timeoutPromise]);
      return fallbackProvider;
    } catch (e) {
    }
  }
  throw new Error("All fallback RPC endpoints failed");
}

export async function switchToAmoyNetwork() {
  try {
    const chainIdHex = `0x${CHAIN_ID.toString(16)}`;
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

    if (currentChainId !== chainIdHex) {
      
      resetInstances();

      try {
        
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError) {
        
        if (switchError.code === 4902) {
          
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

      
      resetInstances();
    }
  } catch (error) {
    if (error.message && error.message.includes('rejected')) {
      throw error;
    }
    throw error;
  }
}

export async function connectWallet() {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    
    await switchToAmoyNetwork();

    
    const prov = getProvider();
    await prov.send("eth_requestAccounts", []);

    
    signer = await prov.getSigner();
    const address = await signer.getAddress();


    
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

export async function hasRole(role, address) {
  try {
    if (!address) {
      throw new Error('Address is required');
    }
    
    if (!ORDER_MANAGER_ADDRESS) {
      throw new Error('Order manager address not configured');
    }
    
    
    try {
      const prov = getProvider();
      const contract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI, prov);
      const hasRoleResult = await contract.hasRole(role, address);
      return hasRoleResult;
    } catch (metaMaskError) {


      const fallbackProvider = await getFallbackProvider();
      const contract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI, fallbackProvider);
      const hasRoleResult = await contract.hasRole(role, address);
      return hasRoleResult;
    }
  } catch (error) {
    throw new Error(`Failed to check role: ${error.message}`);
  }
}

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

    // Obtenir le gas price actuel du réseau (compatible Polygon Amoy)
    let gasPrice;
    try {
      const currentGasPrice = await signer.provider.send('eth_gasPrice', []);
      gasPrice = (BigInt(currentGasPrice) * BigInt(120)) / BigInt(100); // +20%
    } catch {
      gasPrice = ethers.parseUnits('30', 'gwei'); // Fallback
    }

    const orderIdBigInt = typeof orderId === 'number' ? BigInt(orderId) : BigInt(orderId);
    const tx = await orderManagerContract.confirmPreparation(orderIdBigInt, { gasPrice });

    const receipt = await tx.wait();

    return { txHash: receipt.hash, receipt };
  } catch (error) {
    console.error('[confirmPreparationOnChain] Error:', error.message);
    if (error.code === 4001) {
      throw new Error('User rejected transaction');
    }
    throw new Error(`Failed to confirm preparation: ${error.message}`);
  }
}

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
    
    
    const orderIds = await orderManagerContract.getRestaurantOrders(restaurantAddress);
    
    return orderIds.map(id => Number(id));
  } catch (error) {
    throw new Error(`Failed to get restaurant orders: ${error.message}`);
  }
}

export async function getEarningsOnChain(restaurantAddress) {
  try {
    if (!restaurantAddress) {
      throw new Error('Restaurant address is required');
    }
    
    
    const events = await getPaymentSplitEvents(restaurantAddress);
    
    
    const totalEarnings = events.reduce((sum, event) => {
      return sum + parseFloat(ethers.formatEther(event.restaurantAmount));
    }, 0);
    
    return totalEarnings;
  } catch (error) {
    throw new Error(`Failed to get earnings: ${error.message}`);
  }
}

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
    
    
    const filter = paymentSplitterContract.filters.PaymentSplit(null, restaurantAddress);
    const events = await paymentSplitterContract.queryFilter(filter);
    
    
    const parsedEvents = events.map(event => ({
      orderId: Number(event.args[0]),
      restaurant: event.args[1],
      deliverer: event.args[2],
      platform: event.args[3],
      restaurantAmount: event.args[4], 
      delivererAmount: event.args[5],   
      platformAmount: event.args[6],     
      txHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: null 
    }));
    
    return parsedEvents;
  } catch (error) {
    throw new Error(`Failed to get payment split events: ${error.message}`);
  }
}

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
    
    
    
    try {
      const balance = await paymentSplitterContract.balances(restaurantAddress);
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      return 0;
    }
  } catch (error) {
    throw new Error(`Failed to get pending balance: ${error.message}`);
  }
}

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
    
    
    
    try {
      
      const balance = await paymentSplitterContract.balances(address);
      const amount = parseFloat(ethers.formatEther(balance));
      
      if (amount <= 0) {
        throw new Error('No funds available to withdraw');
      }
      
      
      const tx = await paymentSplitterContract.withdraw();
      
      
      const receipt = await tx.wait();
      
      return { txHash: receipt.hash, amount, receipt };
    } catch (error) {
      
      throw new Error('PaymentSplitter uses PUSH pattern. Funds are already transferred. No withdraw() function available.');
    }
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('User rejected transaction');
    }
    throw new Error(`Failed to withdraw: ${error.message}`);
  }
}

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
    
    
    const orderIdBigInt = typeof orderId === 'number' ? BigInt(orderId) : BigInt(orderId);
    const order = await orderManagerContract.orders(orderIdBigInt);
    
    
    return {
      id: Number(order[0]),
      client: order[1],
      restaurant: order[2],
      deliverer: order[3],
      foodPrice: ethers.formatEther(order[4] || 0),
      deliveryFee: ethers.formatEther(order[5] || 0),
      status: Number(order[6]), 
      ipfsHash: order[7],
      createdAt: Number(order[8] || 0)
    };
  } catch (error) {
    throw new Error(`Failed to get order: ${error.message}`);
  }
}

export async function getBalance(address) {
  try {
    if (!address) {
      throw new Error('Address is required');
    }

    
    try {
      const prov = getProvider();
      const balanceWei = await prov.getBalance(address);
      return ethers.formatEther(balanceWei);
    } catch (metaMaskError) {


      const fallbackProvider = await getFallbackProvider();
      const balanceWei = await fallbackProvider.getBalance(address);
      return ethers.formatEther(balanceWei);
    }
  } catch (error) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
}

export async function getTransactionHistory(restaurantAddress, limit = 50) {
  try {
    if (!restaurantAddress) {
      throw new Error('Restaurant address is required');
    }
    
    const provider = getProvider();
    const history = [];
    
    
    if (ORDER_MANAGER_ADDRESS) {
      try {
        const orderManager = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI, provider);
        const orderCreatedFilter = orderManager.filters.OrderCreated(null, null, restaurantAddress);
        const orderCreatedEvents = await orderManager.queryFilter(orderCreatedFilter);
        
        for (const event of orderCreatedEvents.slice(-limit)) {
          const block = await provider.getBlock(event.blockNumber);
          history.push({
            type: 'OrderCreated',
            orderId: Number(event.args.orderId),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: block.timestamp,
            amount: ethers.formatEther(event.args.foodPrice + event.args.deliveryFee),
            client: event.args.client,
            status: 'CREATED'
          });
        }
      } catch (error) {
      }
    }
    
    
    if (PAYMENT_SPLITTER_ADDRESS) {
      try {
        const paymentSplitter = new ethers.Contract(PAYMENT_SPLITTER_ADDRESS, DonePaymentSplitterABI, provider);
        const paymentSplitFilter = paymentSplitter.filters.PaymentSplit(null, restaurantAddress);
        const paymentSplitEvents = await paymentSplitter.queryFilter(paymentSplitFilter);
        
        for (const event of paymentSplitEvents.slice(-limit)) {
          const block = await provider.getBlock(event.blockNumber);
          history.push({
            type: 'PaymentSplit',
            orderId: Number(event.args.orderId || event.args[0]),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: block.timestamp,
            amount: ethers.formatEther(event.args.restaurantAmount || event.args[4]),
            status: 'PAID'
          });
        }
      } catch (error) {
      }
    }
    
    
    try {
    } catch (error) {
    }
    
    
    history.sort((a, b) => b.timestamp - a.timestamp);
    return history.slice(0, limit);
    
  } catch (error) {
    throw new Error(`Failed to get transaction history: ${error.message}`);
  }
}

export function getPolygonScanUrl(txHash) {
  return `https://amoy.polygonscan.com/tx/${txHash}`;
}

export function getPolygonScanAddressUrl(address) {
  return `https://amoy.polygonscan.com/address/${address}`;
}

export { RESTAURANT_ROLE };
