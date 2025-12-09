/**
 * Utilitaires Web3 - Formatage d'adresses et de soldes
 * @notice Fonctions utilitaires pour formater les adresses Ethereum et les soldes
 * @dev Utilise ethers.js pour le formatage
 */

import { ethers } from 'ethers';

/**
 * Formate une adresse Ethereum pour l'affichage
 * @param {string} address - Adresse Ethereum complète
 * @returns {string} Adresse formatée (ex: "0x1234...5678")
 */
export function formatAddress(address) {
  if (!address) return '';
  
  try {
    // Vérifier que c'est une adresse valide
    const checksumAddress = ethers.getAddress(address);
    
    // Format: 0x + 4 premiers caractères + ... + 4 derniers caractères
    if (checksumAddress.length === 42) {
      return `${checksumAddress.slice(0, 6)}...${checksumAddress.slice(-4)}`;
    }
    
    return checksumAddress;
  } catch (error) {
    // Si ce n'est pas une adresse valide, retourner tel quel
    return address;
  }
}

/**
 * Formate un solde (en wei ou BigInt) pour l'affichage
 * @param {string|BigInt|number} balance - Solde en wei
 * @param {number} decimals - Nombre de décimales (par défaut 18 pour ETH/MATIC)
 * @param {number} displayDecimals - Nombre de décimales à afficher (par défaut 4)
 * @returns {string} Solde formaté (ex: "1.2345")
 */
export function formatBalance(balance, decimals = 18, displayDecimals = 4) {
  if (!balance && balance !== 0) return '0';
  
  try {
    // Convertir en BigInt si nécessaire
    let balanceBN;
    if (typeof balance === 'bigint') {
      balanceBN = balance;
    } else if (typeof balance === 'string') {
      // Si c'est une chaîne, essayer de la convertir en BigInt
      balanceBN = BigInt(balance);
    } else {
      balanceBN = BigInt(balance);
    }
    
    // Convertir de wei à ether/matic
    const formatted = ethers.formatUnits(balanceBN, decimals);
    
    // Arrondir à displayDecimals décimales
    const num = parseFloat(formatted);
    return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
  } catch (error) {
    console.error('Error formatting balance:', error);
    return balance?.toString() || '0';
  }
}

/**
 * Formate un prix pour l'affichage
 * @param {string|number|BigInt} price - Prix en wei
 * @param {number} decimals - Nombre de décimales (par défaut 18)
 * @param {number} displayDecimals - Nombre de décimales à afficher (par défaut 2)
 * @returns {string} Prix formaté (ex: "1.23")
 */
export function formatPrice(price, decimals = 18, displayDecimals = 2) {
  return formatBalance(price, decimals, displayDecimals);
}