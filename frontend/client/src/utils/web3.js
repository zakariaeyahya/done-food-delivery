import { ethers } from 'ethers';

/**
 * Returns a Web3 provider from MetaMask or a default provider.
 * @returns {ethers.Provider}
 */
export const getWeb3Provider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to a default provider if MetaMask is not available
  // You might want to configure this with an actual RPC URL for production
  return ethers.getDefaultProvider("mainnet"); // Example for mainnet, change as needed
};

/**
 * Formats a wallet address to a short, readable form (e.g., 0x1234...abcd).
 * @param {string} address - The full Ethereum address.
 * @param {number} [chars=4] - Number of characters to show at start and end.
 * @returns {string} The formatted address.
 */
export const formatAddress = (address, chars = 4) => {
  if (!address || address.length < chars * 2 + 2) {
    return address; // Not a valid address or too short to format
  }
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

/**
 * Formats a BigNumberish value (e.g., wei) into a human-readable MATIC string.
 * @param {ethers.BigNumberish} balance - The balance in wei or other units.
 * @returns {string} The formatted balance in MATIC.
 */
export const formatMatic = (balance) => {
  return ethers.formatEther(balance);
};

/**
 * Parses a human-readable string representation of units (e.g., "1.5") into BigInt in smallest units.
 * @param {string} value - The human-readable value.
 * @param {number} decimals - The number of decimals for the unit (e.g., 18 for Ether).
 * @returns {bigint} The value in smallest units (e.g., wei).
 */
export const parseUnits = (value, decimals) => {
  return ethers.parseUnits(value, decimals);
};

/**
 * Formats a BigInt value in smallest units into a human-readable string.
 * @param {bigint} value - The value in smallest units (e.g., wei).
 * @param {number} decimals - The number of decimals for the unit (e.g., 18 for Ether).
 * @returns {string} The formatted human-readable value.
 */
export const formatUnits = (value, decimals) => {
  return ethers.formatUnits(value, decimals);
};

/**
 * Validates if a given string is a valid Ethereum address.
 * @param {string} address - The string to validate.
 * @returns {boolean} True if the address is valid, false otherwise.
 */
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false; // ethers.isAddress can throw on malformed input
  }
};