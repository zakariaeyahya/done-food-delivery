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
    return '';
  }
}

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
    return `0.${'0'.repeat(decimals)} ${currency}`;
  }
}
