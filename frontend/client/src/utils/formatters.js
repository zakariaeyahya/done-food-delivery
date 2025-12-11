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
 * Formats a BigNumberish value (e.g., wei) into a human-readable MATIC string.
 * @param {ethers.BigNumberish} amount - The amount in wei or other units.
 * @returns {string} The formatted balance in MATIC.
 */
export const formatPriceInMATIC = (amount) => {
  if (amount === null || amount === undefined) {
    return '0.0000 MATIC';
  }
  // If it's already a simple number (not wei), just format it
  if (typeof amount === 'number') {
    return `${amount.toFixed(4)} MATIC`;
  }
  // Assuming 'amount' is in wei, format it to ether (MATIC)
  const maticAmount = ethers.formatEther(amount);
  return `${parseFloat(maticAmount).toFixed(4)} MATIC`;
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