/**
 * Utilitaires de formatage de données pour Restaurant
 * @notice Fonctions helper pour formater prix, dates, temps, texte
 */

/**
 * Formater une date en format français
 * @param {string|Date|number} date - Date à formater
 * @returns {string} Date formatée en français
 */
export function formatDate(date) {
  try {
    if (!date) {
      return '';
    }
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Formater un prix avec devise
 * @param {string|number} amount - Montant à formater
 * @param {string} currency - Devise (défaut: 'POL')
 * @param {number} decimals - Nombre de décimales (défaut: 5)
 * @returns {string} Prix formaté
 */
export function formatPrice(amount, currency = 'POL', decimals = 5) {
  try {
    if (!amount && amount !== 0) {
      return `0.${'0'.repeat(decimals)} ${currency}`;
    }
    
    const amountNumber = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    
    if (isNaN(amountNumber)) {
      return `0.${'0'.repeat(decimals)} ${currency}`;
    }
    
    return `${amountNumber.toFixed(decimals)} ${currency}`;
  } catch (error) {
    console.error('Error formatting price:', error);
    return `0.${'0'.repeat(decimals)} ${currency}`;
  }
}
