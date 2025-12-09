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
  return ethers.getDefaultProvider();
};