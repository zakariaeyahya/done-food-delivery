
import { ethers } from 'ethers';

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

export function formatBalance(balance, decimals = 18, displayDecimals = 4) {
  if (!balance && balance !== 0) return '0';
  
  try {
    // Si c'est déjà un BigInt, le traiter comme wei
    if (typeof balance === 'bigint') {
      const formatted = ethers.formatUnits(balance, decimals);
      const num = parseFloat(formatted);
      return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
    }
    
    // Si c'est une chaîne
    if (typeof balance === 'string') {
      // Vérifier si c'est déjà formaté (contient un point décimal)
      if (balance.includes('.') || balance.includes(',')) {
        // C'est déjà formaté, juste arrondir
        const num = parseFloat(balance.replace(',', '.'));
        if (isNaN(num)) return '0';
        return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
      }
      
      // Sinon, essayer de le traiter comme wei (BigInt)
      try {
        const balanceBN = BigInt(balance);
        const formatted = ethers.formatUnits(balanceBN, decimals);
        const num = parseFloat(formatted);
        return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
      } catch (e) {
        // Si la conversion en BigInt échoue, traiter comme nombre décimal
        const num = parseFloat(balance);
        if (isNaN(num)) return '0';
        return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
      }
    }
    
    // Si c'est un nombre
    if (typeof balance === 'number') {
      // Si c'est un entier, le traiter comme wei
      if (Number.isInteger(balance) && balance > 0) {
        try {
          const balanceBN = BigInt(balance);
          const formatted = ethers.formatUnits(balanceBN, decimals);
          const num = parseFloat(formatted);
          return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
        } catch (e) {
          // Si échec, traiter comme nombre décimal
          return balance.toFixed(displayDecimals).replace(/\.?0+$/, '');
        }
      } else {
        // C'est déjà un nombre décimal, le formater directement
        return balance.toFixed(displayDecimals).replace(/\.?0+$/, '');
      }
    }
    
    return balance?.toString() || '0';
  } catch (error) {
    return balance?.toString() || '0';
  }
}

export function formatPrice(price, decimals = 18, displayDecimals = 2) {
  return formatBalance(price, decimals, displayDecimals);
}
