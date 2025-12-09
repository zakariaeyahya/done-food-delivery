/**
 * Service blockchain pour les interactions Web3
 * Gère : DoneOrderManager, DoneStaking, DonePaymentSplitter
 */

import { ethers } from "ethers";

// ENV - Default contract addresses (Polygon Amoy testnet)
// These are fallbacks if env vars are not loaded
const DEFAULT_ADDRESSES = {
  ORDER_MANAGER_ADDRESS: '0x257D63E05bcf8840896b1ECb5c6d98eb5Ba06182',
  STAKING_ADDRESS: '0xFf9CD2596e73BB0bCB28d9E24d945B0ed34f874b',
  PAYMENT_SPLITTER_ADDRESS: '0xE99F26DA1B38a79d08ed8d853E45397C99818C2f',
};

// ENV - Helper function to get env vars dynamically (works better with Next.js)
function getEnvVar(name) {
  // In Next.js, NEXT_PUBLIC_* vars are available in both server and client
  // But they need to be set at build time, so we check multiple sources
  
  // 1. Try NEXT_PUBLIC_* first (Next.js standard - available at build time)
  let value = process.env[`NEXT_PUBLIC_${name}`];
  
  // 2. Fallback to VITE_* for compatibility
  if (!value) {
    value = process.env[`VITE_${name}`];
  }
  
  // 3. If still not found and we're in browser, try to get from window (for runtime injection)
  if (!value && typeof window !== "undefined") {
    // Next.js injects env vars, but sometimes they're not immediately available
    // Try accessing via window.__NEXT_DATA__ or other methods
    if (window.__NEXT_DATA__?.env?.[`NEXT_PUBLIC_${name}`]) {
      value = window.__NEXT_DATA__.env[`NEXT_PUBLIC_${name}`];
    }
  }
  
  // 4. Fallback to default addresses for development (Polygon Amoy)
  if (!value && DEFAULT_ADDRESSES[name]) {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.warn(`⚠️ ${name} not found in env vars, using default address for Polygon Amoy`);
    }
    value = DEFAULT_ADDRESSES[name];
  }
  
  // Debug logging (only in browser, development mode)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (name === 'STAKING_ADDRESS' && !value) {
      console.warn("⚠️ NEXT_PUBLIC_STAKING_ADDRESS not found in process.env");
      console.log("🔍 Available NEXT_PUBLIC_* vars:", Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')));
      console.log("🔍 process.env.NEXT_PUBLIC_STAKING_ADDRESS:", process.env.NEXT_PUBLIC_STAKING_ADDRESS);
      console.log("🔍 typeof process.env:", typeof process.env);
    }
  }
  
  return value;
}

// ENV - Get addresses dynamically
const getOrderManagerAddress = () => getEnvVar('ORDER_MANAGER_ADDRESS');
const getStakingAddress = () => getEnvVar('STAKING_ADDRESS');
const getPaymentSplitterAddress = () => getEnvVar('PAYMENT_SPLITTER_ADDRESS');

// Legacy constants for backward compatibility (will be undefined if not set)
const ORDER_MANAGER_ADDRESS = getOrderManagerAddress();
const STAKING_ADDRESS = getStakingAddress();
const PAYMENT_SPLITTER_ADDRESS = getPaymentSplitterAddress();

// Debug: Log environment variables (only in development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔍 Blockchain ENV vars:", {
    ORDER_MANAGER: getOrderManagerAddress() ? `${getOrderManagerAddress().slice(0, 10)}...` : "NOT SET",
    STAKING: getStakingAddress() ? `${getStakingAddress().slice(0, 10)}...` : "NOT SET",
    PAYMENT_SPLITTER: getPaymentSplitterAddress() ? `${getPaymentSplitterAddress().slice(0, 10)}...` : "NOT SET",
  });
}

// Rôle livreur
export const DELIVERER_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("DELIVERER_ROLE")
);

// ABIs
import DoneOrderManagerABI from "../../../../contracts/artifacts/contracts/DoneOrderManager.sol/DoneOrderManager.json";
import DoneStakingABI from "../../../../contracts/artifacts/contracts/DoneStaking.sol/DoneStaking.json";
import DonePaymentSplitterABI from "../../../../contracts/artifacts/contracts/DonePaymentSplitter.sol/DonePaymentSplitter.json";


// Variables globales
let provider = null;
let signer = null;
let orderManagerContract = null;
let stakingContract = null;
let paymentSplitterContract = null;

/* -------------------------------------------------------------------------- */
/* PROVIDER + SIGNER                                                          */
/* -------------------------------------------------------------------------- */

function getProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask non détecté.");
  }
  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  return provider;
}

export async function getSigner() {
  if (!signer) {
    const provider = getProvider();
    signer = await provider.getSigner();
  }
  return signer;
}

/* -------------------------------------------------------------------------- */
/* 1. Connexion MetaMask                                                      */
/* -------------------------------------------------------------------------- */
export async function connectWallet() {
  try {
    if (typeof window === "undefined" || !window.ethereum)
      throw new Error("MetaMask non installé.");

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = getProvider();
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    const { chainId } = await provider.getNetwork();
    // Polygon Amoy testnet = 80002
    // Note: Change to 137 for Polygon mainnet or 80002 for Amoy
    console.log(`Connected to chain ID: ${chainId}`);

    return { address, signer };
  } catch (error) {
    console.error("Wallet error:", error);
    throw new Error(error.message);
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Vérifier rôle DELIVERER                                                 */
/* -------------------------------------------------------------------------- */
export async function hasRole(role, address) {
  try {
    if (!orderManagerContract) {
      orderManagerContract = new ethers.Contract(
        ORDER_MANAGER_ADDRESS,
        DoneOrderManagerABI.abi,
        getProvider()
      );
    }
    return await orderManagerContract.hasRole(role, address);
  } catch (err) {
    console.error("hasRole error:", err);
    throw new Error(err.message);
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Vérifier si staké                                                       */
/* -------------------------------------------------------------------------- */
export async function isStaked(address) {
  try {
    // Dev mode: Si wallet a 0 POL, considérer comme 0.1 POL staké (pour tests)
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      try {
        const provider = getProvider();
        const balance = await provider.getBalance(address);
        const balancePOL = parseFloat(ethers.formatEther(balance));
        
        // Si solde = 0 POL, considérer comme staké (dev mode)
        if (balancePOL === 0) {
          console.log("🔧 Dev mode: Wallet a 0 POL, considéré comme 0.1 POL staké");
          return true;
        }
      } catch (err) {
        // Si erreur, continuer avec la vérification normale
        console.warn("Erreur vérification solde POL:", err);
      }
    }

    const stakingAddress = getStakingAddress();
    if (!stakingAddress || stakingAddress === '') {
      throw new Error("Staking contract not configured. Please set NEXT_PUBLIC_STAKING_ADDRESS in your .env.local file.");
    }

    if (!stakingContract) {
      stakingContract = new ethers.Contract(
        stakingAddress,
        DoneStakingABI.abi,
        getProvider()
      );
    }
    return await stakingContract.isStaked(address);
  } catch (err) {
    console.error("isStaked error:", err);
    throw new Error(err.message);
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Récupérer infos staking                                                 */
/* -------------------------------------------------------------------------- */

// Track if staking warning has been shown
let stakingWarningShown = false;

export async function getStakeInfo(address) {
  try {
    // Dev mode: Si wallet a 0 POL, considérer comme 0.1 POL staké (pour tests)
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      try {
        const provider = getProvider();
        const balance = await provider.getBalance(address);
        const balancePOL = parseFloat(ethers.formatEther(balance));
        
        // Si solde = 0 POL, considérer comme 0.1 POL staké (dev mode)
        if (balancePOL === 0) {
          console.log("🔧 Dev mode: Wallet a 0 POL, considéré comme 0.1 POL staké");
          return { amount: 0.1, isStaked: true };
        }
      } catch (err) {
        // Si erreur, continuer avec la vérification normale
        console.warn("Erreur vérification solde POL:", err);
      }
    }

    const stakingAddress = getStakingAddress();
    if (!stakingAddress || stakingAddress === '') {
      if (!stakingWarningShown) {
        console.info("ℹ️ Staking contract not configured - using default values");
        stakingWarningShown = true;
      }
      return { amount: 0, isStaked: false };
    }

    if (!stakingContract) {
      stakingContract = new ethers.Contract(
        stakingAddress,
        DoneStakingABI.abi,
        getProvider()
      );
    }

    const isStaked = await stakingContract.isStaked(address);
    const stakedAmount = await stakingContract.getStakedAmount(address);

    return {
      amount: Number(ethers.formatEther(stakedAmount)),
      isStaked: isStaked,
    };
  } catch (err) {
    // BAD_DATA = contract doesn't exist or doesn't have the functions
    if (!stakingWarningShown) {
      if (err.code === 'BAD_DATA' || err.message?.includes('could not decode')) {
        console.info("ℹ️ Staking contract not deployed - using default values");
      } else {
        console.info("ℹ️ Staking unavailable:", err.message);
      }
      stakingWarningShown = true;
    }
    // Return default values instead of throwing
    return { amount: 0, isStaked: false };
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Staker                                                                  */
/* -------------------------------------------------------------------------- */
export async function stake(amount) {
  try {
    const stakingAddress = getStakingAddress();
    
    // Enhanced debugging
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.log("🔍 Debug stake() - stakingAddress:", stakingAddress);
      console.log("🔍 Debug stake() - process.env.NEXT_PUBLIC_STAKING_ADDRESS:", process.env.NEXT_PUBLIC_STAKING_ADDRESS);
      console.log("🔍 Debug stake() - process.env keys:", Object.keys(process.env).filter(k => k.includes('STAKING')));
    }
    
    if (!stakingAddress || stakingAddress === '') {
      const errorMsg = `Staking contract not configured. Please set NEXT_PUBLIC_STAKING_ADDRESS in your .env.local file. Current value: ${stakingAddress || 'undefined'}`;
      console.error("❌ Staking error:", errorMsg);
      throw new Error(errorMsg);
    }

    const signer = await getSigner();

    // Always create contract with signer for transactions (not provider)
    // Don't reuse stakingContract as it may have been created with provider (read-only)
    const stakingContractWithSigner = new ethers.Contract(
      stakingAddress,
      DoneStakingABI.abi,
      signer
    );

    const amountWei = ethers.parseEther(amount.toString());
    const min = ethers.parseEther("0.1");
    if (amountWei < min) throw new Error("Minimum stake: 0.1 POL");

    const tx = await stakingContractWithSigner.stakeAsDeliverer({
      value: amountWei,
    });

    const receipt = await tx.wait();
    return { txHash: receipt.hash, receipt };
  } catch (err) {
    console.error("Stake error:", err);
    throw new Error(err.message);
  }
}

/* -------------------------------------------------------------------------- */
/* 6. Unstake                                                                 */
/* -------------------------------------------------------------------------- */
export async function unstake() {
  try {
    const stakingAddress = getStakingAddress();
    if (!stakingAddress || stakingAddress === '') {
      throw new Error("Staking contract not configured. Please set NEXT_PUBLIC_STAKING_ADDRESS in your .env.local file.");
    }

    const signer = await getSigner();
    const address = await signer.getAddress();

    const stakeInfo = await getStakeInfo(address);

    // Always create contract with signer for transactions (not provider)
    const stakingContractWithSigner = new ethers.Contract(
      stakingAddress,
      DoneStakingABI.abi,
      signer
    );

    const tx = await stakingContractWithSigner.unstake();
    const receipt = await tx.wait();

    return { txHash: receipt.hash, amount: stakeInfo.amount };
  } catch (err) {
    console.error("Unstake error:", err);
    throw new Error(err.message);
  }
}

/* -------------------------------------------------------------------------- */
/* 7. Accepter commande on-chain                                              */
/* -------------------------------------------------------------------------- */
export async function acceptOrderOnChain(orderId) {
  try {
    const signer = await getSigner();

    if (!orderManagerContract) {
      orderManagerContract = new ethers.Contract(
        ORDER_MANAGER_ADDRESS,
        DoneOrderManagerABI.abi,
        signer
      );
    }

    const tx = await orderManagerContract.assignDeliverer(orderId);
    const receipt = await tx.wait();

    return { txHash: receipt.hash, receipt };
  } catch (err) {
    console.error("Accept error:", err);
    throw new Error(err.message);
  }
}

/* -------------------------------------------------------------------------- */
/* 8. Pickup on-chain                                                         */
/* -------------------------------------------------------------------------- */
export async function confirmPickupOnChain(orderId) {
  try {
    const signer = await getSigner();

    if (!orderManagerContract) {
      orderManagerContract = new ethers.Contract(
        ORDER_MANAGER_ADDRESS,
        DoneOrderManagerABI.abi,
        signer
      );
    }

    const tx = await orderManagerContract.confirmPickup(orderId);
    const receipt = await tx.wait();

    return { txHash: receipt.hash, receipt };
  } catch (err) {
    console.error("Pickup error:", err);
    throw new Error(err.message);
  }
}

/* -------------------------------------------------------------------------- */
/* 9. Delivery on-chain                                                       */
/* -------------------------------------------------------------------------- */
export async function confirmDeliveryOnChain(orderId) {
  try {
    const signer = await getSigner();
    const address = await signer.getAddress();

    if (!orderManagerContract) {
      orderManagerContract = new ethers.Contract(
        ORDER_MANAGER_ADDRESS,
        DoneOrderManagerABI.abi,
        signer
      );
    }

    const tx = await orderManagerContract.confirmDelivery(orderId);
    const receipt = await tx.wait();

    const { totalEarnings } = await getEarningsEvents(address, orderId);

    return { txHash: receipt.hash, earnings: totalEarnings };
  } catch (err) {
    console.error("Delivery error:", err);
    throw new Error(err.message);
  }
}

/* -------------------------------------------------------------------------- */
/* 10. Slashing events                                                        */
/* -------------------------------------------------------------------------- */

// Track if slashing warning has been shown
let slashingWarningShown = false;

export async function getSlashingEvents(address) {
  try {
    // Vérifier si l'adresse du contrat est définie
    const stakingAddress = getStakingAddress();
    if (!stakingAddress || stakingAddress === '') {
      if (!slashingWarningShown) {
        console.info("ℹ️ Staking contract not configured - returning empty slashing events");
        slashingWarningShown = true;
      }
      return [];
    }

    const provider = getProvider();

    if (!stakingContract) {
      stakingContract = new ethers.Contract(
        stakingAddress,
        DoneStakingABI.abi,
        provider
      );
    }

    const filter = stakingContract.filters.Slashed(address);
    const events = await stakingContract.queryFilter(filter);

    return Promise.all(
      events.map(async (e) => {
        const block = await provider.getBlock(e.blockNumber);
        return {
          orderId: Number(e.args.orderId),
          amount: Number(ethers.formatEther(e.args.amount)),
          reason: e.args.reason,
          txHash: e.transactionHash,
          timestamp: block.timestamp,
        };
      })
    );
  } catch (err) {
    // BAD_DATA = contract doesn't exist or doesn't have the functions
    if (!slashingWarningShown) {
      if (err.code === 'BAD_DATA' || err.message?.includes('could not decode')) {
        console.info("ℹ️ Staking contract not deployed - returning empty slashing events");
      } else {
        console.info("ℹ️ Staking unavailable for slashing events:", err.message);
      }
      slashingWarningShown = true;
    }
    // Return empty array instead of throwing
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* 11. Earnings events                                                        */
/* -------------------------------------------------------------------------- */

// Track if payment splitter warning has been shown
let paymentSplitterWarningShown = false;

export async function getEarningsEvents(address, orderId = null) {
  try {
    // Vérifier si l'adresse du contrat est définie
    if (!PAYMENT_SPLITTER_ADDRESS || PAYMENT_SPLITTER_ADDRESS === '') {
      if (!paymentSplitterWarningShown) {
        console.info("ℹ️ PaymentSplitter contract not configured - returning empty earnings");
        paymentSplitterWarningShown = true;
      }
      return { events: [], totalEarnings: 0 };
    }

    const provider = getProvider();

    if (!paymentSplitterContract) {
      paymentSplitterContract = new ethers.Contract(
        PAYMENT_SPLITTER_ADDRESS,
        DonePaymentSplitterABI.abi,
        provider
      );
    }

    let filter = paymentSplitterContract.filters.PaymentSplit(
      null,
      null,
      address
    );

    const events = await paymentSplitterContract.queryFilter(filter);

    const filtered = orderId
      ? events.filter((e) => Number(e.args.orderId) === orderId)
      : events;

    const parsed = await Promise.all(
      filtered.map(async (e) => {
        const block = await provider.getBlock(e.blockNumber);
        return {
          orderId: Number(e.args.orderId),
          delivererAmount: Number(ethers.formatEther(e.args.delivererAmount)),
          restaurantAmount: Number(ethers.formatEther(e.args.restaurantAmount)),
          platformAmount: Number(ethers.formatEther(e.args.platformAmount)),
          txHash: e.transactionHash,
          timestamp: block.timestamp,
        };
      })
    );

    const totalEarnings = parsed.reduce(
      (sum, e) => sum + e.delivererAmount,
      0
    );

    return { events: parsed, totalEarnings };
  } catch (err) {
    // BAD_DATA = contract doesn't exist or doesn't have the functions
    if (!paymentSplitterWarningShown) {
      if (err.code === 'BAD_DATA' || err.message?.includes('could not decode')) {
        console.info("ℹ️ PaymentSplitter contract not deployed - returning empty earnings");
      } else {
        console.info("ℹ️ PaymentSplitter unavailable:", err.message);
      }
      paymentSplitterWarningShown = true;
    }
    // Return default values instead of throwing
    return { events: [], totalEarnings: 0 };
  }
}

/* -------------------------------------------------------------------------- */
/* EXPORT                                                                    */
/* -------------------------------------------------------------------------- */

export default {
  connectWallet,
  getSigner,
  hasRole,
  isStaked,
  getStakeInfo,
  stake,
  unstake,
  acceptOrderOnChain,
  confirmPickupOnChain,
  confirmDeliveryOnChain,
  getSlashingEvents,
  getEarningsEvents,
  DELIVERER_ROLE,
};
