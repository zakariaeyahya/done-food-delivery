
import { ethers } from "ethers";

export function formatPrice(amount: string | number, currency: string = 'POL', decimals: number = 5): string {
  try {
    if (!amount && amount !== 0) {
      return `0.${'0'.repeat(decimals)} ${currency}`;
    }

    let amountNumber: number;
    const amountStr = typeof amount === 'string' ? amount : amount.toString();
    
    const parsed = parseFloat(amountStr);
    
    if (isNaN(parsed)) {
      return `0.${'0'.repeat(decimals)} ${currency}`;
    }

    if (parsed > 1e9) {
      try {
        const formatted = ethers.formatEther(amountStr);
        amountNumber = parseFloat(formatted);
      } catch (e) {
        amountNumber = parsed / 1e18;
      }
    } else {
      amountNumber = parsed;
    }

    if (isNaN(amountNumber) || !isFinite(amountNumber)) {
      return `0.${'0'.repeat(decimals)} ${currency}`;
    }

    return `${amountNumber.toFixed(decimals)} ${currency}`;
  } catch (error) {
    return `0.${'0'.repeat(decimals)} ${currency}`;
  }
}

export function formatAddress(address: string, start: number = 6, end: number = 4): string {
  if (!address || address.length <= start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
