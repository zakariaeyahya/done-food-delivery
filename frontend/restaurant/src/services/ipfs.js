/**
 * Service IPFS pour Restaurant
 * @notice Gère l'accès aux fichiers IPFS
 */

const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

/**
 * Récupérer l'URL d'une image depuis son hash IPFS
 * @param {string} hash - Hash IPFS
 * @returns {string} URL complète
 */
export function getImage(hash) {
  if (!hash) {
    return '';
  }
  
  const gateway = IPFS_GATEWAY.endsWith('/') ? IPFS_GATEWAY.slice(0, -1) : IPFS_GATEWAY;
  const hashClean = hash.startsWith('/') ? hash.slice(1) : hash;
  
  return `${gateway}/${hashClean}`;
}
