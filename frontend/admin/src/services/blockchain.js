import { ethers } from "ethers";

import DoneOrderManagerABI from "../contracts/DoneOrderManager.json";
import DoneTokenABI from "../contracts/DoneToken.json";
import DoneStakingABI from "../contracts/DoneStaking.json";

const ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS;
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const STAKING_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;

const AMOY_CHAIN_ID = 80002;
const AMOY_HEX = "0x13882";

const AMOY_PARAMS = {
  chainId: AMOY_HEX,
  chainName: "Polygon Amoy Testnet",
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
};

export const PLATFORM_ROLE = ethers.id("PLATFORM_ROLE");
export const ARBITRATOR_ROLE = ethers.id("ARBITRATOR_ROLE");
export const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

let provider = null;
let signer = null;
let orderManagerContract = null;
let tokenContract = null;
let stakingContract = null;

export function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask non installé.");
  if (!provider) provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
}

export async function switchToAmoyNetwork() {
  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    if (chainId === AMOY_HEX) return true;

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: AMOY_HEX }],
    });

    return true;
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [AMOY_PARAMS],
      });
      return true;
    }

    return false;
  }
}

export async function initContracts() {
  provider = getProvider();
  signer = await provider.getSigner();

  if (!orderManagerContract)
    orderManagerContract = new ethers.Contract(
      ORDER_MANAGER_ADDRESS,
      DoneOrderManagerABI.abi,
      signer
    );

  if (!tokenContract)
    tokenContract = new ethers.Contract(
      TOKEN_ADDRESS,
      DoneTokenABI.abi,
      signer
    );

  if (!stakingContract)
    stakingContract = new ethers.Contract(
      STAKING_ADDRESS,
      DoneStakingABI.abi,
      signer
    );
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask non installé");

  const ok = await switchToAmoyNetwork();
  if (!ok) throw new Error("Impossible de se connecter au réseau Amoy.");

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  provider = getProvider();
  signer = await provider.getSigner();
  await initContracts();

  return { address: accounts[0], signer };
}

export async function hasRole(addr, role) {
  try {
    if (!orderManagerContract) await initContracts();
    return await orderManagerContract.hasRole(role, addr);
  } catch (err) {
    return false;
  }
}

export async function getPlatformRevenue(timeframe = "week") {
  return {
    transactions: [],
    totals: { platform: "0", restaurant: "0", deliverer: "0" },
    timeframe,
  };
}

export async function getGlobalStats() {
  try {
    if (!orderManagerContract) await initContracts();

    const totalOrders = await orderManagerContract.orderCounter();

    const totalTokens = await tokenContract.totalSupply();

    const totalStaked = await stakingContract.totalStaked();

    return {
      totalOrders: Number(totalOrders),
      totalTokens: ethers.formatEther(totalTokens),
      totalStaked: ethers.formatEther(totalStaked),
    };
  } catch (err) {
    return {
      totalOrders: 0,
      totalTokens: "0",
      totalStaked: "0",
    };
  }
}
