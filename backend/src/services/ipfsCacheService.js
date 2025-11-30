/**
 * IPFS Cache Service - Cache local pour fichiers IPFS
 *
 * Responsabilités :
 * - Cache en mémoire des fichiers IPFS fréquemment accédés
 * - Réduire la dépendance aux gateways IPFS
 * - TTL configurable pour expiration automatique
 * - Invalidation manuelle du cache si nécessaire
 *
 * Avantages :
 * - Réduit latence (pas besoin de fetch IPFS à chaque fois)
 * - Économise bande passante
 * - Améliore performance globale
 *
 * Utilisation :
 * const ipfsCacheService = require('./services/ipfsCacheService');
 * const imageBuffer = await ipfsCacheService.getFile('QmHash...');
 *
 * Configuration :
 * - TTL par défaut : 1 heure (3600s)
 * - Check period : 10 minutes (600s)
 * - Max cache size : dépend de la RAM disponible
 *
 * Référence : infrastructure/README.md - Section "Redondance IPFS"
 */

// TODO: Implémenter avec node-cache
// TODO: Ajouter getFile(ipfsHash) avec fallback sur ipfsService
// TODO: Ajouter invalidate(ipfsHash)
// TODO: Ajouter clear() pour vider tout le cache
