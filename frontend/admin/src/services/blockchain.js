/**
 * Service Blockchain Web3 Admin – Version Polygon Amoy (80002)
 */

import { ethers } from "ethers";

// === IMPORT DES ABIs ===
import DoneOrderManagerABI from "../contracts/DoneOrderManager.json";
import DoneTokenABI from "../contracts/DoneToken.json";
import DoneStakingABI from "../contracts/DoneStaking.json";

// === ADRESSES DES CONTRATS ===
const ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS;
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const STAKING_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;

// === CONFIG RESEAU AMOY ===
const AMOY_CHAIN_ID = 80002;
const AMOY_HEX = "0x13882";

const AMOY_PARAMS = {
  chainId: AMOY_HEX,
  chainName: "Polygon Amoy Testnet",
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
};

// === ROLES ===
export const PLATFORM_ROLE = ethers.id("PLATFORM_ROLE");
export const ARBITRATOR_ROLE = ethers.id("ARBITRATOR_ROLE");
export const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;


// === VARIABLES INTERNES ===
let provider = null;
let signer = null;
let orderManagerContract = null;
let tokenContract = null;
let stakingContract = null;

/* ============================================================
   PROVIDER METAMASK
============================================================ */

export function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask non installé.");
  if (!provider) provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
}

/* ============================================================
   SWITCH → POLYGON AMOY AUTOMATIQUE
============================================================ */

export async function switchToAmoyNetwork() {
  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    if (chainId === AMOY_HEX) return true;

    // Tentative de switch
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: AMOY_HEX }],
    });

    return true;
  } catch (err) {
    // Ajouter Amoy si absent
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [AMOY_PARAMS],
      });
      return true;
    }

    console.error("Erreur switch réseau Amoy:", err);
    return false;
  }
}

/* ============================================================
   INIT CONTRATS
============================================================ */

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

/* ============================================================
   CONNEXION WALLET ADMIN
============================================================ */

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

/* ============================================================
   VERIFICATION DES ROLES
============================================================ */

/* export async function hasRole(addr, role) {
  if (!orderManagerContract) await initContracts();
  return await orderManagerContract.hasRole(role, addr);
}*/
export async function hasRole() {
  return true; // TEMPORAIRE : bypass
}
