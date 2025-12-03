/**
 * Utilitaires de formatage de données
 * @notice Fonctions helper pour formater prix, dates, temps, texte
 * @dev Utilise les APIs natives JavaScript pour le formatage
 */

/**
 * 1. Formater un prix avec devise
 * @param {string|number} amount - Montant à formater
 * @param {string} currency - Devise (défaut: 'MATIC')
 * @returns {string} Prix formaté avec devise
 * 
 * @example
 * formatPrice(1.5, 'MATIC')
 * // Retourne: '1.50 MATIC'
 * 
 * formatPrice(10.99, 'EUR')
 * // Retourne: '10.99 EUR'
 * 
 * formatPrice('0.123456', 'MATIC')
 * // Retourne: '0.12 MATIC'
 */
// TODO: Implémenter formatPrice(amount, currency)
// export function formatPrice(amount, currency = 'MATIC') {
//   ESSAYER:
//     // Valider que amount existe
//     SI !amount && amount !== 0:
//       RETOURNER `0.00 ${currency}`;
//     
//     // Convertir amount en nombre
//     const amountNumber = typeof amount === 'string' 
//       ? parseFloat(amount) 
//       : Number(amount);
//     
//     // Valider que c'est un nombre valide
//     SI isNaN(amountNumber):
//       RETOURNER `0.00 ${currency}`;
//     
//     // Formater avec 2 décimales
//     const formattedAmount = amountNumber.toFixed(2);
//     
//     // Retourner avec devise
//     RETOURNER `${formattedAmount} ${currency}`;
//   CATCH error:
//     console.error('Error formatting price:', error);
//     RETOURNER `0.00 ${currency}`;
// }

/**
 * 2. Formater une date en format français
 * @param {string|Date|number} date - Date à formater (ISO string, Date object, ou timestamp)
 * @returns {string} Date formatée en français (dd/mm/yyyy à hh:mm)
 * 
 * @example
 * formatDate('2024-01-15T10:30:00Z')
 * // Retourne: '15/01/2024 à 11:30'
 * 
 * formatDate(new Date())
 * // Retourne: '15/01/2024 à 14:30'
 * 
 * formatDate(1705315800000) // timestamp
 * // Retourne: '15/01/2024 à 11:30'
 */
// TODO: Implémenter formatDate(date)
// export function formatDate(date) {
//   ESSAYER:
//     // Valider que date existe
//     SI !date:
//       RETOURNER '';
//     
//     // Convertir en objet Date si nécessaire
//     const dateObj = date instanceof Date 
//       ? date 
//       : new Date(date);
//     
//     // Valider que la date est valide
//     SI isNaN(dateObj.getTime()):
//       RETOURNER '';
//     
//     // Formater en français avec toLocaleDateString et toLocaleTimeString
//     // Options de formatage:
//     // - day: '2-digit' (01-31)
//     // - month: '2-digit' (01-12)
//     // - year: 'numeric' (2024)
//     // - hour: '2-digit' (00-23)
//     // - minute: '2-digit' (00-59)
//     const formattedDate = dateObj.toLocaleDateString('fr-FR', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//     
//     RETOURNER formattedDate;
//   CATCH error:
//     console.error('Error formatting date:', error);
//     RETOURNER '';
// }

/**
 * 3. Formater un temps en minutes:secondes
 * @param {number} seconds - Nombre de secondes
 * @returns {string} Temps formaté (mm:ss)
 * 
 * @example
 * formatTime(125)
 * // Retourne: '2:05'
 * 
 * formatTime(3661)
 * // Retourne: '61:01'
 * 
 * formatTime(30)
 * // Retourne: '0:30'
 */
// TODO: Implémenter formatTime(seconds)
// export function formatTime(seconds) {
//   ESSAYER:
//     // Valider que seconds existe et est un nombre
//     SI seconds === null || seconds === undefined || isNaN(seconds):
//       RETOURNER '0:00';
//     
//     // Convertir en nombre entier
//     const totalSeconds = Math.floor(Number(seconds));
//     
//     // Calculer minutes (division entière)
//     const minutes = Math.floor(totalSeconds / 60);
//     
//     // Calculer secondes restantes (modulo)
//     const secs = totalSeconds % 60;
//     
//     // Formater secondes avec padStart pour avoir 2 chiffres
//     const formattedSecs = secs.toString().padStart(2, '0');
//     
//     // Retourner format mm:ss
//     RETOURNER `${minutes}:${formattedSecs}`;
//   CATCH error:
//     console.error('Error formatting time:', error);
//     RETOURNER '0:00';
// }

/**
 * 4. Tronquer un texte avec ellipsis
 * @param {string} text - Texte à tronquer
 * @param {number} length - Longueur maximale (défaut: 100)
 * @returns {string} Texte tronqué avec '...' si nécessaire
 * 
 * @example
 * truncateText('Ceci est un très long texte qui doit être tronqué', 20)
 * // Retourne: 'Ceci est un très lo...'
 * 
 * truncateText('Court', 20)
 * // Retourne: 'Court' (pas de troncature)
 * 
 * truncateText('Texte', 5)
 * // Retourne: 'Texte' (exactement 5 caractères, pas de troncature)
 */
// TODO: Implémenter truncateText(text, length)
// export function truncateText(text, length = 100) {
//   // Valider que text existe
//   SI !text:
//     RETOURNER '';
//   
//   // Convertir en string si nécessaire
//   const textString = String(text);
//   
//   // Valider que length est un nombre positif
//   const maxLength = Number(length);
//   SI isNaN(maxLength) || maxLength < 0:
//     RETOURNER textString; // Retourner texte tel quel si length invalide
//   
//   // Si le texte est plus court ou égal à la longueur max, retourner tel quel
//   SI textString.length <= maxLength:
//     RETOURNER textString;
//   
//   // Tronquer le texte à la longueur max
//   const truncated = textString.slice(0, maxLength);
//   
//   // Ajouter ellipsis
//   RETOURNER `${truncated}...`;
// }

/**
 * 5. (BONUS) Formater une date relative (il y a X minutes/heures/jours)
 * @param {string|Date|number} date - Date à formater
 * @returns {string} Date relative formatée
 * 
 * @example
 * formatRelativeDate(new Date(Date.now() - 5 * 60 * 1000)) // Il y a 5 minutes
 * // Retourne: 'Il y a 5 minutes'
 * 
 * formatRelativeDate(new Date(Date.now() - 2 * 60 * 60 * 1000)) // Il y a 2 heures
 * // Retourne: 'Il y a 2 heures'
 */
// TODO: (Optionnel) Implémenter formatRelativeDate(date)
// export function formatRelativeDate(date) {
//   ESSAYER:
//     // Valider que date existe
//     SI !date:
//       RETOURNER '';
//     
//     // Convertir en Date object
//     const dateObj = date instanceof Date ? date : new Date(date);
//     
//     // Valider date
//     SI isNaN(dateObj.getTime()):
//       RETOURNER '';
//     
//     // Calculer différence en millisecondes
//     const now = new Date();
//     const diffMs = now.getTime() - dateObj.getTime();
//     
//     // Convertir en secondes
//     const diffSeconds = Math.floor(diffMs / 1000);
//     
//     // Si moins d'une minute
//     SI diffSeconds < 60:
//       RETOURNER 'À l\'instant';
//     
//     // Si moins d'une heure
//     SI diffSeconds < 3600:
//       const minutes = Math.floor(diffSeconds / 60);
//       RETOURNER `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
//     
//     // Si moins d'un jour
//     SI diffSeconds < 86400:
//       const hours = Math.floor(diffSeconds / 3600);
//       RETOURNER `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
//     
//     // Si moins d'une semaine
//     SI diffSeconds < 604800:
//       const days = Math.floor(diffSeconds / 86400);
//       RETOURNER `Il y a ${days} jour${days > 1 ? 's' : ''}`;
//     
//     // Sinon, formater date normale
//     RETOURNER formatDate(dateObj);
//   CATCH error:
//     console.error('Error formatting relative date:', error);
//     RETOURNER '';
// }

/**
 * 6. (BONUS) Formater un nombre avec séparateurs de milliers
 * @param {string|number} number - Nombre à formater
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @returns {string} Nombre formaté avec séparateurs
 * 
 * @example
 * formatNumber(1234567.89)
 * // Retourne: '1 234 567,89'
 * 
 * formatNumber(1000, 'en-US')
 * // Retourne: '1,000'
 */
// TODO: (Optionnel) Implémenter formatNumber(number, locale)
// export function formatNumber(number, locale = 'fr-FR') {
//   ESSAYER:
//     // Valider que number existe
//     SI number === null || number === undefined:
//       RETOURNER '0';
//     
//     // Convertir en nombre
//     const num = typeof number === 'string' ? parseFloat(number) : Number(number);
//     
//     // Valider nombre
//     SI isNaN(num):
//       RETOURNER '0';
//     
//     // Utiliser toLocaleString pour formater avec séparateurs
//     RETOURNER num.toLocaleString(locale);
//   CATCH error:
//     console.error('Error formatting number:', error);
//     RETOURNER '0';
// }

/**
 * 7. (BONUS) Formater une durée en format lisible
 * @param {number} seconds - Nombre de secondes
 * @returns {string} Durée formatée (ex: "2h 30min" ou "45min")
 * 
 * @example
 * formatDuration(9000) // 2h 30min
 * // Retourne: '2h 30min'
 * 
 * formatDuration(2700) // 45min
 * // Retourne: '45min'
 */
// TODO: (Optionnel) Implémenter formatDuration(seconds)
// export function formatDuration(seconds) {
//   ESSAYER:
//     // Valider seconds
//     SI seconds === null || seconds === undefined || isNaN(seconds):
//       RETOURNER '0min';
//     
//     const totalSeconds = Math.floor(Number(seconds));
//     
//     // Calculer heures
//     const hours = Math.floor(totalSeconds / 3600);
//     
//     // Calculer minutes restantes
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     
//     // Formater selon présence d'heures
//     SI hours > 0:
//       SI minutes > 0:
//         RETOURNER `${hours}h ${minutes}min`;
//       SINON:
//         RETOURNER `${hours}h`;
//     SINON:
//       RETOURNER `${minutes}min`;
//   CATCH error:
//     console.error('Error formatting duration:', error);
//     RETOURNER '0min';
// }

/**
 * Exporter toutes les fonctions
 */
// TODO: Exporter toutes les fonctions
// export {
//   formatPrice,
//   formatDate,
//   formatTime,
//   truncateText,
//   // formatRelativeDate, // Optionnel
//   // formatNumber, // Optionnel
//   // formatDuration // Optionnel
// };

