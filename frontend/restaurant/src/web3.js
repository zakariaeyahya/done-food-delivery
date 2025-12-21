import { ethers } from 'ethers';

export function formatAddress(address) {
  if (!address) return '';

  try {
    const checksumAddress = ethers.getAddress(address);

    if (checksumAddress.length === 42) {
      return `${checksumAddress.slice(0, 6)}...${checksumAddress.slice(-4)}`;
    }

    return checksumAddress;
  } catch (error) {
    return address;
  }
}

export function formatBalance(balance, decimals = 18, displayDecimals = 4) {
  if (!balance && balance !== 0) return '0';

  try {
    let balanceBN;
    if (typeof balance === 'bigint') {
      balanceBN = balance;
    } else if (typeof balance === 'string') {
      balanceBN = BigInt(balance);
    } else {
      balanceBN = BigInt(balance);
    }

    const formatted = ethers.formatUnits(balanceBN, decimals);

    const num = parseFloat(formatted);
    return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
  } catch (error) {
    return balance?.toString() || '0';
  }
}

export function formatPrice(price, decimals = 18, displayDecimals = 2) {
  return formatBalance(price, decimals, displayDecimals);
}