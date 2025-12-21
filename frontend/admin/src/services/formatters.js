import { ethers } from "ethers";

export function weiToPol(weiValue) {
  try {
    if (!weiValue && weiValue !== 0) return 0;

    const strValue = weiValue.toString();

    const isWei = strValue.length > 12 && /^\d+$/.test(strValue);

    if (isWei) {
      return parseFloat(ethers.formatEther(strValue));
    }

    return parseFloat(strValue) || 0;
  } catch (err) {
    return 0;
  }
}

export function formatAddress(address, size = 4) {
  if (!address || typeof address !== "string") return "N/A";
  return `${address.slice(0, size + 2)}...${address.slice(-size)}`;
}

export function formatCurrency(value, currency = "EUR", decimals = 2) {
  if (value === undefined || value === null || isNaN(value)) return `0 ${currency}`;
  return `${Number(value).toFixed(decimals)} ${currency}`;
}

export function formatNumber(n, decimals = 2) {
  if (n === undefined || n === null || isNaN(n)) return "0";
  return Number(n).toFixed(decimals);
}

export function formatCrypto(value, symbol = "POL", decimals = 4) {
  if (!value && value !== 0) return `0 ${symbol}`;
  return `${Number(value).toFixed(decimals)} ${symbol}`;
}

export function formatToken(value, decimals = 2) {
  if (!value && value !== 0) return "0 DONE";
  return `${Number(value).toFixed(decimals)} DONE`;
}

export function formatUSD(value, decimals = 2) {
  if (!value && value !== 0) return "$0.00";
  return `$${Number(value).toFixed(decimals)}`;
}

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

export function formatDateShort(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("fr-FR", {
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "N/A";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return "0%";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function computeGrowth(current, previous) {
  if (!previous || previous === 0) return 0;
  return (current - previous) / previous;
}

export function formatGrowth(current, previous, decimals = 1) {
  if (previous === 0 || previous === null || previous === undefined)
    return "+0%";

  const growth = computeGrowth(current, previous);
  const percent = (growth * 100).toFixed(decimals);

  return growth >= 0 ? `+${percent}%` : `${percent}%`;
}

export function isPositiveGrowth(current, previous) {
  return computeGrowth(current, previous) >= 0;
}

export function formatIpfsUrl(hash) {
  if (!hash) return null;
  return `https://ipfs.io/ipfs/${hash}`;
}

export function formatCompactNumber(n) {
  if (!n && n !== 0) return "0";
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

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
