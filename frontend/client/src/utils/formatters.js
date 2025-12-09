import { ethers } from 'ethers';
import { format } from 'date-fns';

/**
 * Formats a number as a currency string in EUR.
 * @param {number} amount - The amount to format.
 * @returns {string} The formatted EUR currency string.
 */
export const formatPriceInEUR = (amount) => {
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
  // Assuming 'amount' is in wei, format it to ether (MATIC)
  const maticAmount = ethers.formatEther(amount);
  return `${parseFloat(maticAmount).toFixed(4)} MATIC`; // Displaying 4 decimal places
};

/**
 * Formats a date and time for display.
 * @param {Date | string} dateValue - The date object or string to format.
 * @param {string} formatStr - The format string (e.g., 'dd/MM/yyyy HH:mm').
 * @returns {string} The formatted date and time string.
 */
export const formatDateTime = (dateValue, formatStr = 'dd/MM/yyyy HH:mm') => {
  try {
    return format(new Date(dateValue), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Truncates a long text description and adds an ellipsis.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - The maximum length of the text before truncation.
 * @returns {string} The truncated text.
 */
export const truncateText = (text, maxLength) => {
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