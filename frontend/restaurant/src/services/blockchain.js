/**
 * Service Blockchain Web3 - Restaurant
 * @notice Interactions blockchain Polygon Mumbai
 * @dev ethers.js v6
 */

import { ethers } from "ethers";

// ABIs (adapte les chemins si besoin)
import DoneOrderManagerABI from "../../../../contracts/artifacts/DoneOrderManager.json";
import DonePaymentSplitterABI from "../../../../contracts/artifacts/DonePaymentSplitter.json";

/* ---------------- Config ---------------- */

const ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS;
const PAYMENT_SPLITTER_ADDRESS = import.meta.env.VITE_PAYMENT_SPLITTER_ADDRESS;

const AMOY_CHAIN_ID = 80002; // Polygon Amoy Testnet

// bytes32 role
const RESTAURANT_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("RESTAURANT_ROLE")
);

/* ---------------- Singletons ---------------- */

let provider = null; // ethers.BrowserProvider
let signer = null;   // ethers.JsonRpcSigner
let orderManagerContract = null;
let paymentSplitterContract = null;

/* ---------------- Helpers ---------------- */

function requireEnv() {
  if (!ORDER_MANAGER_ADDRESS) {
    throw new Error("Missing VITE_ORDER_MANAGER_ADDRESS in env");
  }
  if (!PAYMENT_SPLITTER_ADDRESS) {
    throw new Error("Missing VITE_PAYMENT_SPLITTER_ADDRESS in env");
  }
}

function getProvider() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask extension."
    );
  }

  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }

  return provider;
}

async function switchToAmoyNetwork() {
  try {
    const prov = getProvider();
    const network = await prov.getNetwork();

    if (network.chainId !== BigInt(AMOY_CHAIN_ID)) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${AMOY_CHAIN_ID.toString(16)}` }],
      });
    }
  } catch (error) {
    // 4902 => chain not added
    if (error?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${AMOY_CHAIN_ID.toString(16)}`,
            chainName: "Polygon Amoy Testnet",
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            rpcUrls: [
              "https://rpc.ankr.com/polygon_amoy",
              "https://polygon-amoy.drpc.org",
              "https://polygon-amoy-bor-rpc.publicnode.com"
            ],
            blockExplorerUrls: ["https://amoy.polygonscan.com"],
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

function ensureContractsWithSigner() {
  requireEnv();

  if (!signer) throw new Error("Wallet not connected. Missing signer.");

  if (!orderManagerContract) {
    orderManagerContract = new ethers.Contract(
      ORDER_MANAGER_ADDRESS,
      DoneOrderManagerABI.abi,
      signer
    );
  }

  if (!paymentSplitterContract) {
    paymentSplitterContract = new ethers.Contract(
      PAYMENT_SPLITTER_ADDRESS,
      DonePaymentSplitterABI.abi,
      signer
    );
  }
}

function ensureContractsReadOnly() {
  requireEnv();
  const prov = getProvider();

  if (!orderManagerContract) {
    orderManagerContract = new ethers.Contract(
      ORDER_MANAGER_ADDRESS,
      DoneOrderManagerABI.abi,
      prov
    );
  }

  if (!paymentSplitterContract) {
    paymentSplitterContract = new ethers.Contract(
      PAYMENT_SPLITTER_ADDRESS,
      DonePaymentSplitterABI.abi,
      prov
    );
  }
}

/* ---------------- API ---------------- */

/**
 * 1. Connecter wallet MetaMask
 * @returns {Promise<{address: string, signer: ethers.JsonRpcSigner}>}
 */
async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed");

    await switchToAmoyNetwork();

    const prov = getProvider();
    await prov.send("eth_requestAccounts", []);

    signer = await prov.getSigner();
    const address = await signer.getAddress();

    // init contracts with signer
    orderManagerContract = new ethers.Contract(
      ORDER_MANAGER_ADDRESS,
      DoneOrderManagerABI.abi,
      signer
    );

    paymentSplitterContract = new ethers.Contract(
      PAYMENT_SPLITTER_ADDRESS,
      DonePaymentSplitterABI.abi,
      signer
    );

    return { address, signer };
  } catch (error) {
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
}

/**
 * (Bonus) Solde natif MATIC
 */
async function getBalance(address) {
  try {
    if (!address) throw new Error("Address is required");
    const prov = getProvider();
    const b = await prov.getBalance(address);
    return ethers.formatEther(b);
  } catch (error) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
}

/**
 * 2. Vérifier rôle RESTAURANT_ROLE
 */
async function hasRole(role = RESTAURANT_ROLE, address) {
  try {
    if (!address) throw new Error("Address is required");
    ensureContractsReadOnly();
    return await orderManagerContract.hasRole(role, address);
  } catch (error) {
    throw new Error(`Failed to check role: ${error.message}`);
  }
}

/**
 * 3. Confirmer préparation on-chain
 * @param {number} orderId
 * @returns {Promise<{txHash: string, receipt: any}>}
 */
async function confirmPreparationOnChain(orderId) {
  try {
    if (!orderId && orderId !== 0) throw new Error("Order ID is required");

    ensureContractsWithSigner();

    const tx = await orderManagerContract.confirmPreparation(orderId);
    const receipt = await tx.wait();

    return { txHash: receipt.hash, receipt };
  } catch (error) {
    throw new Error(`Failed to confirm preparation: ${error.message}`);
  }
}

/**
 * 4. Récupérer orderIds d’un restaurant on-chain
 */
async function getRestaurantOrders(restaurantAddress) {
  try {
    if (!restaurantAddress)
      throw new Error("Restaurant address is required");

    ensureContractsReadOnly();

    const orderIds =
      await orderManagerContract.getRestaurantOrders(restaurantAddress);

    return orderIds.map((id) => Number(id));
  } catch (error) {
    throw new Error(`Failed to get restaurant orders: ${error.message}`);
  }
}

/**
 * 6. Events PaymentSplit
 * @returns {Promise<Array>}
 */
async function getPaymentSplitEvents(restaurantAddress) {
  try {
    if (!restaurantAddress)
      throw new Error("Restaurant address is required");

    ensureContractsReadOnly();

    // filtre PaymentSplit(orderId, restaurant, deliverer, platform, ...)
    // null sur orderId => tous, restaurant => adresse ciblée
    const filter =
      paymentSplitterContract.filters.PaymentSplit(null, restaurantAddress);

    const events = await paymentSplitterContract.queryFilter(filter);

    return events.map((event) => ({
      orderId: Number(event.args.orderId),
      restaurant: event.args.restaurant,
      deliverer: event.args.deliverer,
      platform: event.args.platform,
      restaurantAmount: event.args.restaurantAmount,
      delivererAmount: event.args.delivererAmount,
      platformAmount: event.args.platformAmount,
      txHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: event.args.timestamp
        ? Number(event.args.timestamp)
        : null,
    }));
  } catch (error) {
    throw new Error(`Failed to get payment split events: ${error.message}`);
  }
}

/**
 * 5. Total earnings on-chain (somme des PaymentSplit.restaurantAmount)
 */
async function getEarningsOnChain(restaurantAddress) {
  try {
    const events = await getPaymentSplitEvents(restaurantAddress);

    const total = events.reduce((sum, e) => {
      return sum + Number(ethers.formatEther(e.restaurantAmount));
    }, 0);

    return total;
  } catch (error) {
    throw new Error(`Failed to get earnings: ${error.message}`);
  }
}

/**
 * 7. Pending balance dans PaymentSplitter
 * PUSH pattern => balances() souvent absent => retourne 0
 */
async function getPendingBalance(restaurantAddress) {
  try {
    if (!restaurantAddress)
      throw new Error("Restaurant address is required");

    ensureContractsReadOnly();

    try {
      // si PAYMENTSPLITTER pull-based (balances mapping)
      const bal = await paymentSplitterContract.balances(
        restaurantAddress
      );
      return Number(ethers.formatEther(bal));
    } catch (e) {
      console.warn(
        "PaymentSplitter uses PUSH pattern. Funds transferred immediately."
      );
      return 0;
    }
  } catch (error) {
    throw new Error(`Failed to get pending balance: ${error.message}`);
  }
}

/**
 * 8. Withdraw (si pull-based)
 */
async function withdraw() {
  try {
    ensureContractsWithSigner();

    const addr = await signer.getAddress();

    try {
      const bal = await paymentSplitterContract.balances(addr);
      const amount = Number(ethers.formatEther(bal));
      if (amount <= 0) throw new Error("No funds available to withdraw");

      const tx = await paymentSplitterContract.withdraw();
      const receipt = await tx.wait();

      return { txHash: receipt.hash, amount, receipt };
    } catch (e) {
      throw new Error(
        "PaymentSplitter uses PUSH pattern. No withdraw() available."
      );
    }
  } catch (error) {
    throw new Error(`Failed to withdraw: ${error.message}`);
  }
}

/**
 * 9. Lire une commande on-chain
 */
async function getOrderOnChain(orderId) {
  try {
    if (!orderId && orderId !== 0) throw new Error("Order ID is required");

    ensureContractsReadOnly();

    const o = await orderManagerContract.orders(orderId);

    return {
      id: Number(o.id),
      client: o.client,
      restaurant: o.restaurant,
      deliverer: o.deliverer,
      foodPrice: Number(ethers.formatEther(o.foodPrice)),
      deliveryFee: Number(ethers.formatEther(o.deliveryFee)),
      platformFee: Number(ethers.formatEther(o.platformFee)),
      totalAmount: Number(ethers.formatEther(o.totalAmount)),
      status: o.status, // enum uint8 dans le contrat
      ipfsHash: o.ipfsHash,
      createdAt: Number(o.createdAt),
      disputed: o.disputed,
      delivered: o.delivered,
    };
  } catch (error) {
    throw new Error(`Failed to get order: ${error.message}`);
  }
}

/**
 * 10. Get network information
 */
async function getNetwork() {
  try {
    const prov = getProvider();
    const network = await prov.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
    };
  } catch (error) {
    throw new Error(`Failed to get network: ${error.message}`);
  }
}

/* ---------------- Exports ---------------- */

export {
  RESTAURANT_ROLE,
  connectWallet,
  getBalance,
  getNetwork,
  hasRole,
  confirmPreparationOnChain,
  getRestaurantOrders,
  getEarningsOnChain,
  getPaymentSplitEvents,
  getPendingBalance,
  withdraw,
  getOrderOnChain,
};
