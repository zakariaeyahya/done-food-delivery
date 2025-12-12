/**
 * Utilitaires de formatage de données pour Deliverer
 * @notice Fonctions helper pour formater prix, dates, temps, texte
 */

import { ethers } from "ethers";

/**
 * Formater un prix avec conversion wei → POL si nécessaire
 * @param {string|number} amount - Montant à formater (peut être en wei ou déjà en POL)
 * @param {string} currency - Devise (défaut: 'POL')
 * @param {number} decimals - Nombre de décimales (défaut: 5)
 * @returns {string} Prix formaté
 */
export function formatPrice(amount: string | number, currency: string = 'POL', decimals: number = 5): string {
  try {
    if (!amount && amount !== 0) {
      return `0.${'0'.repeat(decimals)} ${currency}`;
    }

    let amountNumber: number;
    const amountStr = typeof amount === 'string' ? amount : amount.toString();
    
    // Convertir en nombre pour vérifier la taille
    const parsed = parseFloat(amountStr);
    
    // Si le nombre est NaN, retourner 0
    if (isNaN(parsed)) {
      return `0.${'0'.repeat(decimals)} ${currency}`;
    }

    // Si le nombre est très grand (> 1e9), c'est probablement en wei
    // On utilise 1e9 comme seuil car même 0.001 POL = 1e15 wei
    if (parsed > 1e9) {
      // Toujours convertir depuis wei vers POL
      // Utiliser ethers.js pour une conversion précise
      try {
        // Essayer avec ethers.js (gère mieux les très grands nombres)
        const weiAmount = ethers.BigNumber.from(amountStr);
        const formatted = ethers.formatEther(weiAmount);
        amountNumber = parseFloat(formatted);
      } catch (e) {
        // Si ethers échoue, diviser directement par 1e18
        // Exemple: 354000000000000 wei = 0.000354 POL
        amountNumber = parsed / 1e18;
      }
    } else {
      // Si le nombre est petit (< 1e9), c'est probablement déjà en POL
      amountNumber = parsed;
    }

    if (isNaN(amountNumber) || !isFinite(amountNumber)) {
      return `0.${'0'.repeat(decimals)} ${currency}`;
    }

    return `${amountNumber.toFixed(decimals)} ${currency}`;
  } catch (error) {
    console.error('Error formatting price:', error, 'amount:', amount);
    return `0.${'0'.repeat(decimals)} ${currency}`;
  }
}

/**
 * Formater une adresse de wallet (tronquer)
 * @param {string} address - Adresse complète
 * @param {number} start - Nombre de caractères au début (défaut: 6)
 * @param {number} end - Nombre de caractères à la fin (défaut: 4)
 * @returns {string} Adresse tronquée
 */
export function formatAddress(address: string, start: number = 6, end: number = 4): string {
  if (!address || address.length <= start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
