const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

export function getImage(hash) {
  if (!hash) {
    return '';
  }

  const gateway = IPFS_GATEWAY.endsWith('/') ? IPFS_GATEWAY.slice(0, -1) : IPFS_GATEWAY;
  const hashClean = hash.startsWith('/') ? hash.slice(1) : hash;

  return `${gateway}/${hashClean}`;
}
