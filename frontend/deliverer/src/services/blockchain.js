import { ethers } from "ethers";

const DEFAULT_ADDRESSES = {
  ORDER_MANAGER_ADDRESS: '0x257D63E05bcf8840896b1ECb5c6d98eb5Ba06182',
  STAKING_ADDRESS: '0xFf9CD2596e73BB0bCB28d9E24d945B0ed34f874b',
  PAYMENT_SPLITTER_ADDRESS: '0xE99F26DA1B38a79d08ed8d853E45397C99818C2f',
};

function getEnvVar(name) {
  let value;

  if (typeof process !== 'undefined' && process.env) {
    value = process.env[`NEXT_PUBLIC_${name}`];
  }

  if (!value && typeof process !== 'undefined' && process.env) {
    value = process.env[`VITE_${name}`];
  }

  if (!value && DEFAULT_ADDRESSES[name]) {
    value = DEFAULT_ADDRESSES[name];
  }

  return value;
}

const getOrderManagerAddress = () => getEnvVar('ORDER_MANAGER_ADDRESS');
const getStakingAddress = () => getEnvVar('STAKING_ADDRESS');
const getPaymentSplitterAddress = () => getEnvVar('PAYMENT_SPLITTER_ADDRESS');

const ORDER_MANAGER_ADDRESS = getOrderManagerAddress();
const STAKING_ADDRESS = getStakingAddress();
const PAYMENT_SPLITTER_ADDRESS = getPaymentSplitterAddress();

export const DELIVERER_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("DELIVERER_ROLE")
);

// Fallback RPC URLs pour Polygon Amoy (quand MetaMask est rate limited)
const AMOY_RPC_URLS = [
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://polygon-amoy.blockpi.network/v1/rpc/public",
  "https://rpc-amoy.polygon.technology"
];

async function getFallbackProvider() {
  for (const rpcUrl of AMOY_RPC_URLS) {
    try {
      const fallbackProvider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: 80002,
        name: "polygon-amoy"
      });
      // Test the connection
      await Promise.race([
        fallbackProvider.getBlockNumber(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
      ]);
      console.log(`[Fallback RPC] Using: ${rpcUrl}`);
      return fallbackProvider;
    } catch (e) {
      console.warn(`[Fallback RPC] ${rpcUrl} failed:`, e.message);
    }
  }
  throw new Error("All fallback RPC endpoints failed");
}

async function getGasPriceWithFallback(signerOrProvider) {
  // Try MetaMask first
  try {
    const gasPrice = await signerOrProvider.provider.send('eth_gasPrice', []);
    return (BigInt(gasPrice) * BigInt(120)) / BigInt(100); // +20%
  } catch (metaMaskError) {
    console.warn('[Gas Price] MetaMask RPC failed, trying fallback...');

    // Try fallback RPC
    try {
      const fallback = await getFallbackProvider();
      const feeData = await fallback.getFeeData();
      if (feeData.gasPrice) {
        return (feeData.gasPrice * BigInt(120)) / BigInt(100);
      }
    } catch (fallbackError) {
      console.warn('[Gas Price] Fallback failed:', fallbackError.message);
    }

    // Ultimate fallback
    return ethers.parseUnits('30', 'gwei');
  }
}

import DoneOrderManagerABI from "../../../../contracts/artifacts/contracts/DoneOrderManager.sol/DoneOrderManager.json";
import DoneStakingABI from "../../../../contracts/artifacts/contracts/DoneStaking.sol/DoneStaking.json";
import DonePaymentSplitterABI from "../../../../contracts/artifacts/contracts/DonePaymentSplitter.sol/DonePaymentSplitter.json";


let provider = null;
let signer = null;
let orderManagerContract = null;
let stakingContract = null;
let paymentSplitterContract = null;

/* PROVIDER + SIGNER                                                          */

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

export async function connectWallet() {
  try {
    if (typeof window === "undefined" || !window.ethereum)
      throw new Error("MetaMask non installé.");

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = getProvider();
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    const { chainId } = await provider.getNetwork();

    return { address, signer };
  } catch (error) {
    throw new Error(error.message);
  }
}

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
    throw new Error(err.message);
  }
}

export async function isStaked(address) {
  const stakingAddress = getStakingAddress();
  if (!stakingAddress || stakingAddress === '') {
    throw new Error("Staking contract not configured. Please set NEXT_PUBLIC_STAKING_ADDRESS in your .env.local file.");
  }

  // Essayer d'abord avec MetaMask
  try {
    const contract = new ethers.Contract(
      stakingAddress,
      DoneStakingABI.abi,
      getProvider()
    );
    return await contract.isStaked(address);
  } catch (metaMaskError) {
    console.warn('[isStaked] MetaMask RPC failed, trying fallback...', metaMaskError.message);

    // Essayer avec fallback RPC
    try {
      const fallbackProvider = await getFallbackProvider();
      const contract = new ethers.Contract(
        stakingAddress,
        DoneStakingABI.abi,
        fallbackProvider
      );
      return await contract.isStaked(address);
    } catch (fallbackError) {
      console.error('[isStaked] Fallback RPC also failed:', fallbackError.message);
      throw new Error("Impossible de vérifier le statut de staking. Tous les RPC ont échoué.");
    }
  }
}


export async function getStakeInfo(address) {
  const stakingAddress = getStakingAddress();
  if (!stakingAddress || stakingAddress === '') {
    console.warn('[getStakeInfo] Staking contract not configured');
    return { amount: 0, isStaked: false };
  }

  // Essayer d'abord avec MetaMask
  try {
    const contract = new ethers.Contract(
      stakingAddress,
      DoneStakingABI.abi,
      getProvider()
    );
    const isStakedResult = await contract.isStaked(address);
    const stakedAmount = await contract.getStakedAmount(address);
    return {
      amount: Number(ethers.formatEther(stakedAmount)),
      isStaked: isStakedResult,
    };
  } catch (metaMaskError) {
    console.warn('[getStakeInfo] MetaMask RPC failed, trying fallback...', metaMaskError.message);

    // Essayer avec fallback RPC
    try {
      const fallbackProvider = await getFallbackProvider();
      const contract = new ethers.Contract(
        stakingAddress,
        DoneStakingABI.abi,
        fallbackProvider
      );
      const isStakedResult = await contract.isStaked(address);
      const stakedAmount = await contract.getStakedAmount(address);
      return {
        amount: Number(ethers.formatEther(stakedAmount)),
        isStaked: isStakedResult,
      };
    } catch (fallbackError) {
      console.error('[getStakeInfo] Fallback RPC also failed:', fallbackError.message);
      return { amount: 0, isStaked: false };
    }
  }
}

/* UTILITY: Retry avec backoff exponentiel                                    */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isRpcError = 
        error.message?.includes('RPC endpoint') || 
        error.code === 'UNKNOWN_ERROR' ||
        error.code === -32002 ||
        error.message?.includes('could not coalesce');
      
      const isLastRetry = i === maxRetries - 1;
      
      if (!isRpcError || isLastRetry) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export async function stake(amount) {
  return retryWithBackoff(async () => {
    const stakingAddress = getStakingAddress();
    
    if (!stakingAddress || stakingAddress === '') {
      throw new Error("Staking contract not configured");
    }

    const signer = await getSigner();
    
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
  }, 3, 3000);
}

export async function unstake() {
  try {
    const stakingAddress = getStakingAddress();
    if (!stakingAddress || stakingAddress === '') {
      throw new Error("Staking contract not configured. Please set NEXT_PUBLIC_STAKING_ADDRESS in your .env.local file.");
    }

    const signer = await getSigner();
    const address = await signer.getAddress();

    const stakeInfo = await getStakeInfo(address);

    const stakingContractWithSigner = new ethers.Contract(
      stakingAddress,
      DoneStakingABI.abi,
      signer
    );

    const tx = await stakingContractWithSigner.unstake();
    const receipt = await tx.wait();

    return { txHash: receipt.hash, amount: stakeInfo.amount };
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function acceptOrderOnChain(orderId) {
  try {
    const signer = await getSigner();

    if (!ORDER_MANAGER_ADDRESS || ORDER_MANAGER_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error("Order manager contract address not configured");
    }

    if (!orderManagerContract) {
      orderManagerContract = new ethers.Contract(
        ORDER_MANAGER_ADDRESS,
        DoneOrderManagerABI.abi,
        signer
      );
    }

    // Obtenir le gas price avec fallback RPC
    const gasPrice = await getGasPriceWithFallback(signer);

    const tx = await orderManagerContract.assignDeliverer(orderId, { gasPrice });
    const receipt = await tx.wait();

    return { txHash: receipt.hash, receipt };
  } catch (err) {
    console.error('[acceptOrderOnChain] Blockchain error:', err.message);
    throw new Error("Impossible d'accepter la commande sur la blockchain: " + err.message);
  }
}

export async function confirmPickupOnChain(orderId) {
  try {
    const signer = await getSigner();

    if (!ORDER_MANAGER_ADDRESS || ORDER_MANAGER_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error("Order manager contract address not configured");
    }

    if (!orderManagerContract) {
      orderManagerContract = new ethers.Contract(
        ORDER_MANAGER_ADDRESS,
        DoneOrderManagerABI.abi,
        signer
      );
    }

    // Obtenir le gas price avec fallback RPC
    const gasPrice = await getGasPriceWithFallback(signer);

    const tx = await orderManagerContract.confirmPickup(orderId, { gasPrice });
    const receipt = await tx.wait();

    return { txHash: receipt.hash, receipt };
  } catch (err) {
    console.error('[confirmPickupOnChain] Blockchain error:', err.message);
    throw new Error("Impossible de confirmer le pickup sur la blockchain: " + err.message);
  }
}

export async function confirmDeliveryOnChain(orderId) {
  try {
    const signer = await getSigner();
    const address = await signer.getAddress();

    if (!ORDER_MANAGER_ADDRESS || ORDER_MANAGER_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error("Order manager contract address not configured");
    }

    if (!orderManagerContract) {
      orderManagerContract = new ethers.Contract(
        ORDER_MANAGER_ADDRESS,
        DoneOrderManagerABI.abi,
        signer
      );
    }

    // Obtenir le gas price avec fallback RPC
    const gasPrice = await getGasPriceWithFallback(signer);

    const tx = await orderManagerContract.confirmDelivery(orderId, { gasPrice });
    const receipt = await tx.wait();

    const { totalEarnings } = await getEarningsEvents(address, orderId);

    return { txHash: receipt.hash, earnings: totalEarnings };
  } catch (err) {
    console.error('[confirmDeliveryOnChain] Blockchain error:', err.message);
    throw new Error("Impossible de confirmer la livraison sur la blockchain: " + err.message);
  }
}


let slashingWarningShown = false;

export async function getSlashingEvents(address) {
  try {
    const stakingAddress = getStakingAddress();
    if (!stakingAddress || stakingAddress === '') {
      if (!slashingWarningShown) {
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
    if (!slashingWarningShown) {
      if (err.code === 'BAD_DATA' || err.message?.includes('could not decode')) {
      } else {
      }
      slashingWarningShown = true;
    }
    return [];
  }
}


let paymentSplitterWarningShown = false;

export async function getEarningsEvents(address, orderId = null) {
  try {
    if (!PAYMENT_SPLITTER_ADDRESS || PAYMENT_SPLITTER_ADDRESS === '') {
      if (!paymentSplitterWarningShown) {
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
    if (!paymentSplitterWarningShown) {
      if (err.code === 'BAD_DATA' || err.message?.includes('could not decode')) {
      } else {
      }
      paymentSplitterWarningShown = true;
    }
    return { events: [], totalEarnings: 0 };
  }
}

/* EXPORT                                                                    */

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
