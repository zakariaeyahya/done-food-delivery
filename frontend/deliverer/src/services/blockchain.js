/**
 * Service blockchain pour les interactions Web3
 * Gère : DoneOrderManager, DoneStaking, DonePaymentSplitter
 */

import { ethers } from "ethers";

// ENV
const ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS;
const STAKING_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;
const PAYMENT_SPLITTER_ADDRESS = import.meta.env.VITE_PAYMENT_SPLITTER_ADDRESS;

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
  if (!window.ethereum) {
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
    if (!window.ethereum)
      throw new Error("MetaMask non installé.");

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = getProvider();
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    const { chainId } = await provider.getNetwork();
    if (chainId !== 80001n) {
      throw new Error("Veuillez passer sur Polygon Mumbai (80001)");
    }

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
    if (!stakingContract) {
      stakingContract = new ethers.Contract(
        STAKING_ADDRESS,
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
export async function getStakeInfo(address) {
  try {
    if (!stakingContract) {
      stakingContract = new ethers.Contract(
        STAKING_ADDRESS,
        DoneStakingABI.abi,
        getProvider()
      );
    }

    const data = await stakingContract.stakes(address);

    return {
      amount: Number(ethers.formatEther(data[0])),
      isStaked: data[1],
    };
  } catch (err) {
    console.error("StakeInfo error:", err);
    throw new Error(err.message);
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Staker                                                                  */
/* -------------------------------------------------------------------------- */
export async function stake(amount) {
  try {
    const signer = await getSigner();

    if (!stakingContract) {
      stakingContract = new ethers.Contract(
        STAKING_ADDRESS,
        DoneStakingABI.abi,
        signer
      );
    }

    const amountWei = ethers.parseEther(amount.toString());
    const min = ethers.parseEther("0.1");
    if (amountWei < min) throw new Error("Minimum stake: 0.1 MATIC");

    const tx = await stakingContract.stakeAsDeliverer({
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
    const signer = await getSigner();
    const address = await signer.getAddress();

    const stakeInfo = await getStakeInfo(address);

    if (!stakingContract) {
      stakingContract = new ethers.Contract(
        STAKING_ADDRESS,
        DoneStakingABI.abi,
        signer
      );
    }

    const tx = await stakingContract.unstake();
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
export async function getSlashingEvents(address) {
  try {
    const provider = getProvider();

    if (!stakingContract) {
      stakingContract = new ethers.Contract(
        STAKING_ADDRESS,
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
    console.error("Slashing error:", err);
    throw new Error(err.message);
  }
}

/* -------------------------------------------------------------------------- */
/* 11. Earnings events                                                        */
/* -------------------------------------------------------------------------- */
export async function getEarningsEvents(address, orderId = null) {
  try {
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

    const parsed = filtered.map((e) => ({
      orderId: Number(e.args.orderId),
      delivererAmount: Number(ethers.formatEther(e.args.delivererAmount)),
      restaurantAmount: Number(ethers.formatEther(e.args.restaurantAmount)),
      platformAmount: Number(ethers.formatEther(e.args.platformAmount)),
      txHash: e.transactionHash,
    }));

    const totalEarnings = parsed.reduce(
      (sum, e) => sum + e.delivererAmount,
      0
    );

    return { events: parsed, totalEarnings };
  } catch (err) {
    console.error("Earnings events error:", err);
    throw new Error(err.message);
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
