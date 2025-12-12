/**
 * Utils de formatage pour l'Admin Dashboard DONE
 * @notice Formatage des montants, dates, adresses, pourcentages, variations
 */

import { ethers } from "ethers";

/**
 * Convertit wei en POL (ether)
 * @param {string|number|bigint} weiValue - Valeur en wei
 * @returns {number} Valeur en POL
 */
export function weiToPol(weiValue) {
  try {
    if (!weiValue && weiValue !== 0) return 0;
    const numValue = Number(weiValue);
    // Si la valeur est < 1e12 (1 trillion), elle est probablement déjà en POL
    // Les valeurs en wei sont généralement >= 1e15 pour des montants significatifs
    if (numValue < 1e12) return numValue;
    return parseFloat(ethers.formatEther(weiValue.toString()));
  } catch {
    return 0;
  }
}

/* ============================================================
   FORMATAGE ADRESSES ETHEREUM
   ============================================================ */

/**
 * Formate une adresse Ethereum : 0x1234...abcd
 */
export function formatAddress(address, size = 4) {
  if (!address || typeof address !== "string") return "N/A";
  return `${address.slice(0, size + 2)}...${address.slice(-size)}`;
}

/**
 * Format monnaie générique (EUR, USD, etc.)
 */
export function formatCurrency(value, currency = "EUR", decimals = 2) {
  if (value === undefined || value === null || isNaN(value)) return `0 ${currency}`;
  return `${Number(value).toFixed(decimals)} ${currency}`;
}


/* ============================================================
   FORMATAGE MONTANTS (POL / ETH / DONE / USD)
   ============================================================ */

export function formatNumber(n, decimals = 2) {
  if (n === undefined || n === null || isNaN(n)) return "0";
  return Number(n).toFixed(decimals);
}

/**
 * Format ETH / POL (float ou valeur BigNumber déjà convertie)
 */
export function formatCrypto(value, symbol = "POL", decimals = 4) {
  if (!value && value !== 0) return `0 ${symbol}`;
  return `${Number(value).toFixed(decimals)} ${symbol}`;
}

/**
 * Format tokens DONE
 */
export function formatToken(value, decimals = 2) {
  if (!value && value !== 0) return "0 DONE";
  return `${Number(value).toFixed(decimals)} DONE`;
}

/**
 * Format en USD
 */
export function formatUSD(value, decimals = 2) {
  if (!value && value !== 0) return "$0.00";
  return `$${Number(value).toFixed(decimals)}`;
}

/* ============================================================
   FORMATAGE DES DATES & HEURES
   ============================================================ */

export function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format très court : 12/01
 */
export function formatDateShort(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("fr-FR", {
    month: "2-digit",
    day: "2-digit",
  });
}


/**
 * Exemple : 1250 seconds → "20m 50s"
 */
export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "N/A";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

/* ============================================================
   POURCENTAGES & TAUX DE CROISSANCE
   ============================================================ */

/**
 * Format un pourcentage simple
 * 0.156 → "15.6%"
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return "0%";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Variation : (new - old) / old
 */
export function computeGrowth(current, previous) {
  if (!previous || previous === 0) return 0;
  return (current - previous) / previous;
}

/**
 * Format variances : +12.5% ou -4.1%
 */
export function formatGrowth(current, previous, decimals = 1) {
  if (previous === 0 || previous === null || previous === undefined)
    return "+0%";

  const growth = computeGrowth(current, previous);
  const percent = (growth * 100).toFixed(decimals);

  return growth >= 0 ? `+${percent}%` : `${percent}%`;
}

/**
 * Détermine si variation positive/negative (pour couleur UI)
 */
export function isPositiveGrowth(current, previous) {
  return computeGrowth(current, previous) >= 0;
}

/* ============================================================
   FICHIERS / IPFS
   ============================================================ */

export function formatIpfsUrl(hash) {
  if (!hash) return null;
  return `https://ipfs.io/ipfs/${hash}`;
}

/* ============================================================
   NOMBRES LISIBLES (1.2K, 3.5M)
   ============================================================ */

export function formatCompactNumber(n) {
  if (!n && n !== 0) return "0";
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

/* ============================================================
   EXPORT GLOBAL
   ============================================================ */

export default {
  weiToPol,
  formatAddress,
  formatNumber,
  formatCrypto,
  formatToken,
  formatUSD,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatPercentage,
  computeGrowth,
  formatGrowth,
  isPositiveGrowth,
  formatCompactNumber,
  formatIpfsUrl,
};
