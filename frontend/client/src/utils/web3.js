/**
 * Utilitaires Web3
 * @notice Fonctions helper pour formater et valider les données Web3/Ethereum
 * @dev Utilise ethers.js pour les conversions et validations
 */

// TODO: Importer ethers.js
// import { ethers } from 'ethers';

/**
 * 1. Formater une adresse Ethereum en format court
 * @param {string} address - Adresse Ethereum complète (0x...)
 * @returns {string} Adresse formatée (0x1234...5678) ou chaîne vide si invalide
 * 
 * @example
 * formatAddress('0x1234567890123456789012345678901234567890')
 * // Retourne: '0x1234...7890'
 * 
 * formatAddress(null)
 * // Retourne: ''
 */
// TODO: Implémenter formatAddress(address)
// export function formatAddress(address) {
//   // Valider que address existe
//   SI !address:
//     RETOURNER '';
//   
//   // Valider que address est une string
//   SI typeof address !== 'string':
//     RETOURNER '';
//   
//   // Valider longueur minimale (0x + au moins 4 caractères)
//   SI address.length < 6:
//     RETOURNER address; // Retourner tel quel si trop court
//   
//   // Extraire les 6 premiers caractères (0x + 4 chars)
//   const start = address.slice(0, 6);
//   
//   // Extraire les 4 derniers caractères
//   const end = address.slice(-4);
//   
//   // Retourner format: 0x1234...5678
//   RETOURNER `${start}...${end}`;
// }

/**
 * 2. Formater un solde (wei) en ether avec 4 décimales
 * @param {string|BigInt|number} balance - Solde en wei
 * @returns {string} Solde formaté en ether avec 4 décimales
 * 
 * @example
 * formatBalance('1000000000000000000') // 1 ETH en wei
 * // Retourne: '1.0000'
 * 
 * formatBalance(ethers.parseEther('0.1234'))
 * // Retourne: '0.1234'
 */
// TODO: Implémenter formatBalance(balance)
// export function formatBalance(balance) {
//   ESSAYER:
//     // Valider que balance existe
//     SI !balance:
//       RETOURNER '0.0000';
//     
//     // Convertir balance en ether via ethers.formatEther()
//     // formatEther gère automatiquement BigInt, string, number
//     const balanceEther = ethers.formatEther(balance);
//     
//     // Convertir en nombre et formater avec 4 décimales
//     const balanceNumber = parseFloat(balanceEther);
//     
//     // Formater avec 4 décimales (toFixed(4))
//     RETOURNER balanceNumber.toFixed(4);
//   CATCH error:
//     // En cas d'erreur (format invalide), retourner 0.0000
//     console.error('Error formatting balance:', error);
//     RETOURNER '0.0000';
// }

/**
 * 3. Convertir une valeur en wei (ou unité spécifiée)
 * @param {string|number} value - Valeur à convertir
 * @param {number} decimals - Nombre de décimales (défaut: 18 pour ether)
 * @returns {bigint} Valeur en wei (BigInt)
 * 
 * @example
 * parseUnits('1.5', 18)
 * // Retourne: 1500000000000000000n (BigInt)
 * 
 * parseUnits('100', 6) // Pour USDC (6 decimals)
 * // Retourne: 100000000n
 */
// TODO: Implémenter parseUnits(value, decimals)
// export function parseUnits(value, decimals = 18) {
//   ESSAYER:
//     // Valider que value existe
//     SI value === null || value === undefined:
//       throw new Error('Value is required');
//     
//     // Convertir value en string si nécessaire
//     const valueString = value.toString();
//     
//     // Valider que value est un nombre valide
//     SI isNaN(parseFloat(valueString)):
//       throw new Error('Value must be a valid number');
//     
//     // Utiliser ethers.parseUnits() pour convertir
//     // parseUnits(value, decimals) retourne un BigInt
//     const result = ethers.parseUnits(valueString, decimals);
//     
//     RETOURNER result;
//   CATCH error:
//     console.error('Error parsing units:', error);
//     throw error;
// }

/**
 * 4. Convertir wei (ou unité spécifiée) en valeur lisible
 * @param {string|bigint|number} value - Valeur en wei
 * @param {number} decimals - Nombre de décimales (défaut: 18 pour ether)
 * @returns {string} Valeur formatée en string
 * 
 * @example
 * formatUnits(1500000000000000000n, 18)
 * // Retourne: '1.5'
 * 
 * formatUnits('100000000', 6) // USDC
 * // Retourne: '100.0'
 */
// TODO: Implémenter formatUnits(value, decimals)
// export function formatUnits(value, decimals = 18) {
//   ESSAYER:
//     // Valider que value existe
//     SI value === null || value === undefined:
//       RETOURNER '0';
//     
//     // Utiliser ethers.formatUnits() pour convertir
//     // formatUnits gère automatiquement BigInt, string, number
//     const result = ethers.formatUnits(value, decimals);
//     
//     RETOURNER result;
//   CATCH error:
//     console.error('Error formatting units:', error);
//     RETOURNER '0';
// }

/**
 * 5. Valider qu'une adresse Ethereum est valide
 * @param {string} address - Adresse à valider
 * @returns {boolean} true si valide, false sinon
 * 
 * @example
 * isValidAddress('0x1234567890123456789012345678901234567890')
 * // Retourne: true
 * 
 * isValidAddress('invalid-address')
 * // Retourne: false
 * 
 * isValidAddress(null)
 * // Retourne: false
 */
// TODO: Implémenter isValidAddress(address)
// export function isValidAddress(address) {
//   // Valider que address existe
//   SI !address:
//     RETOURNER false;
//   
//   // Valider que address est une string
//   SI typeof address !== 'string':
//     RETOURNER false;
//   
//   // Utiliser ethers.isAddress() pour valider le format
//   // isAddress vérifie:
//   // - Commence par 0x
//   // - Longueur exacte de 42 caractères (0x + 40 hex)
//   // - Caractères hexadécimaux valides
//   const isValid = ethers.isAddress(address);
//   
//   RETOURNER isValid;
// }

/**
 * 6. (BONUS) Formater une adresse avec checksum (EIP-55)
 * @param {string} address - Adresse Ethereum
 * @returns {string} Adresse avec checksum ou chaîne vide si invalide
 * 
 * @example
 * formatAddressChecksum('0x1234567890123456789012345678901234567890')
 * // Retourne: '0x1234...7890' (avec checksum si valide)
 */
// TODO: (Optionnel) Implémenter formatAddressChecksum(address)
// export function formatAddressChecksum(address) {
//   ESSAYER:
//     // Valider que l'adresse est valide
//     SI !isValidAddress(address):
//       RETOURNER '';
//     
//     // Utiliser ethers.getAddress() pour obtenir l'adresse avec checksum
//     const checksumAddress = ethers.getAddress(address);
//     
//     // Formater en format court
//     RETOURNER formatAddress(checksumAddress);
//   CATCH error:
//     console.error('Error formatting address with checksum:', error);
//     RETOURNER '';
// }

/**
 * 7. (BONUS) Convertir wei en MATIC avec formatage prix
 * @param {string|bigint} weiAmount - Montant en wei
 * @returns {string} Montant formaté avec symbole MATIC
 * 
 * @example
 * formatMatic(ethers.parseEther('1.5'))
 * // Retourne: '1.5000 MATIC'
 */
// TODO: (Optionnel) Implémenter formatMatic(weiAmount)
// export function formatMatic(weiAmount) {
//   ESSAYER:
//     // Convertir wei en ether
//     const maticAmount = formatBalance(weiAmount);
//     
//     // Ajouter symbole MATIC
//     RETOURNER `${maticAmount} MATIC`;
//   CATCH error:
//     console.error('Error formatting MATIC:', error);
//     RETOURNER '0.0000 MATIC';
// }

/**
 * Exporter toutes les fonctions
 */
// TODO: Exporter toutes les fonctions
// export {
//   formatAddress,
//   formatBalance,
//   parseUnits,
//   formatUnits,
//   isValidAddress,
//   // formatAddressChecksum, // Optionnel
//   // formatMatic // Optionnel
// };

