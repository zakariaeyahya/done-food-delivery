import { ethers } from 'ethers';
import { format } from 'date-fns';

/**
 * Formats a number as a currency string in EUR.
 * @param {number} amount - The amount to format.
 * @returns {string} The formatted EUR currency string.
 */
export const formatPriceInEUR = (amount) => {
  if (amount === null || amount === undefined) {
    return '€0.00';
  }
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a BigNumberish value (e.g., wei) into a human-readable POL string.
 * @param {ethers.BigNumberish} amount - The amount in wei or other units.
 * @returns {string} The formatted balance in POL.
 */
export const formatPriceInMATIC = (amount) => {
  if (amount === null || amount === undefined || amount === 0 || amount === '0') {
    return '0.000000 POL';
  }

  try {
    // Convertir en string pour l'analyse
    const strValue = amount.toString();
    
    // Si c'est un nombre simple (pas un BigNumber), vérifier s'il est déjà en POL
    if (typeof amount === 'number') {
      // Si le nombre est petit (< 1 million), c'est probablement déjà en POL
      if (amount < 1000000) {
        return `${amount.toFixed(6)} POL`;
      }
      // Sinon, c'est probablement en wei, convertir
      // Utiliser strValue (qui est amount.toString()) pour formatEther
      const polAmountStr = ethers.formatEther(strValue);
      // formatEther retourne toujours une string, convertir en nombre avant toFixed
      const polAmount = parseFloat(polAmountStr);
      if (isNaN(polAmount)) {
        return '0.000000 POL';
      }
      return `${polAmount.toFixed(6)} POL`;
    }

    // Si c'est une string avec beaucoup de chiffres (>12), c'est probablement en wei
    // Les valeurs en wei ont généralement 15+ chiffres pour des montants significatifs
    // Exemple: 1770000000000000 (16 chiffres) = 0.00177 POL
    const isWei = strValue.length > 12 && /^\d+$/.test(strValue);
    
    if (isWei) {
      // Convertir de wei vers POL
      // ethers.formatEther() retourne toujours une string
      const polAmountStr = ethers.formatEther(strValue);
      // S'assurer que c'est bien une string avant de parser
      const polAmount = parseFloat(String(polAmountStr));
      if (isNaN(polAmount)) {
        console.warn('Failed to parse POL amount:', polAmountStr, 'from wei:', strValue);
        return '0.000000 POL';
      }
      return `${polAmount.toFixed(6)} POL`;
    } else {
      // C'est probablement déjà en POL (format décimal ou petit nombre)
      const numValue = parseFloat(strValue);
      if (isNaN(numValue)) {
        return '0.000000 POL';
      }
      return `${numValue.toFixed(6)} POL`;
    }
  } catch (error) {
    console.error('Error formatting price:', error, 'amount:', amount, 'type:', typeof amount);
    return '0.000000 POL';
  }
};

/**
 * Formats a date and time for display.
 * @param {Date | string} dateValue - The date object or string to format.
 * @param {string} formatStr - The format string (e.g., 'dd/MM/yyyy HH:mm').
 * @returns {string} The formatted date and time string.
 */
export const formatDateTime = (dateValue, formatStr = 'dd/MM/yyyy HH:mm') => {
  try {
    // Vérifier que dateValue existe et est valide
    if (!dateValue) {
      return 'Date non disponible';
    }
    
    // Créer un objet Date
    const date = new Date(dateValue);
    
    // Vérifier que la date est valide
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error, 'dateValue:', dateValue);
    return 'Date invalide';
  }
};

/**
 * Truncates a long text description and adds an ellipsis.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - The maximum length of the text before truncation.
 * @returns {string} The truncated text.
 */
export const truncateText = (text, maxLength) => {
  if (!text) {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

export default {
  formatPriceInEUR,
  formatPriceInMATIC,
  formatDateTime,
  truncateText,
};