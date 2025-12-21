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
  try {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      try {
        const provider = getProvider();
        const balance = await provider.getBalance(address);
        const balancePOL = parseFloat(ethers.formatEther(balance));
        
        if (balancePOL === 0) {
          return true;
        }
      } catch (err) {
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
    if (err.code === 'CALL_EXCEPTION' || 
        err.message?.includes('missing revert data') ||
        err.message?.includes('execution reverted') ||
        err.code === -32002) {
      if (process.env.NODE_ENV === "development") {
        return true; // En dev, considérer comme staké pour permettre les tests
      }
      throw new Error("Impossible de vérifier le statut de staking. Vérifiez votre connexion blockchain.");
    }
    throw new Error(err.message);
  }
}


let stakingWarningShown = false;

export async function getStakeInfo(address) {
  try {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      try {
        const provider = getProvider();
        const balance = await provider.getBalance(address);
        const balancePOL = parseFloat(ethers.formatEther(balance));
        
        if (balancePOL === 0) {
          return { amount: 0.1, isStaked: true };
        }
      } catch (err) {
        if (err.code === -32002 || err.message?.includes('too many errors')) {
          if (process.env.NODE_ENV === "development") {
            return { amount: 0.1, isStaked: true };
          }
        }
        if (!err.message?.includes('RPC endpoint')) {
        }
      }
    }

    const stakingAddress = getStakingAddress();
    if (!stakingAddress || stakingAddress === '') {
      if (!stakingWarningShown) {
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

    let isStaked = false;
    let stakedAmount = ethers.parseEther("0");
    
    try {
      isStaked = await stakingContract.isStaked(address);
      stakedAmount = await stakingContract.getStakedAmount(address);
    } catch (rpcError) {
      if (rpcError.code === -32002 || rpcError.message?.includes('too many errors')) {
        if (process.env.NODE_ENV === "development") {
          return { amount: 0.1, isStaked: true };
        }
      }
      throw rpcError; // Re-lancer les autres erreurs
    }

    return {
      amount: Number(ethers.formatEther(stakedAmount)),
      isStaked: isStaked,
    };
  } catch (err) {
    if (!stakingWarningShown) {
      if (err.code === 'BAD_DATA' || err.message?.includes('could not decode')) {
      } else {
      }
      stakingWarningShown = true;
    }
    return { amount: 0, isStaked: false };
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

    const tx = await orderManagerContract.assignDeliverer(orderId);
    const receipt = await tx.wait();

    return { txHash: receipt.hash, receipt };
  } catch (err) {
    if (err.code === 'CALL_EXCEPTION' || 
        err.message?.includes('missing revert data') ||
        err.message?.includes('execution reverted') ||
        err.code === -32002 ||
        err.message?.includes('contract address not configured')) {
      if (process.env.NODE_ENV === "development") {
        return { txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''), receipt: null };
      }
      throw new Error("Impossible d'accepter la commande sur la blockchain. Vérifiez votre connexion.");
    }
    throw new Error(err.message);
  }
}

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
    throw new Error(err.message);
  }
}

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
    throw new Error(err.message);
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
