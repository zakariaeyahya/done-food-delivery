/**
 * Service IPFS
 * @notice Gère l'upload et le téléchargement de fichiers vers/depuis IPFS
 * @dev Utilise le backend comme proxy pour les uploads (via Pinata), accès direct via gateway pour downloads
 */

// TODO: Importer axios pour les requêtes HTTP
// import axios from 'axios';

/**
 * Configuration de base
 * @dev Récupère l'URL du gateway IPFS et de l'API backend depuis les variables d'environnement
 */
// TODO: Définir IPFS_GATEWAY depuis import.meta.env
// const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

// TODO: Définir API_URL depuis import.meta.env
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fonction helper pour gérer les erreurs
 * @param {Error} error - Erreur de la requête
 * @throws {Error} Erreur avec message formaté
 */
// TODO: Implémenter handleIPFSError(error)
// function handleIPFSError(error) {
//   SI error.response existe:
//     const message = error.response.data?.message || error.response.data?.error || 'IPFS Error';
//     const status = error.response.status;
//     throw new Error(`${status}: ${message}`);
//   SINON SI error.request existe:
//     throw new Error('Network Error: No response from server');
//   SINON:
//     throw new Error(`IPFS Error: ${error.message}`);
// }

/**
 * 1. Upload une image vers IPFS via le backend
 * @param {File} file - Fichier image à uploader
 * @returns {Promise<Object>} { ipfsHash, url }
 * 
 * @example
 * const fileInput = document.querySelector('input[type="file"]');
 * const file = fileInput.files[0];
 * const result = await uploadImage(file);
 * console.log(result.ipfsHash); // 'QmHash...'
 * console.log(result.url); // 'https://gateway.pinata.cloud/ipfs/QmHash...'
 */
// TODO: Implémenter uploadImage(file)
// async function uploadImage(file) {
//   ESSAYER:
//     // Valider que file existe
//     SI !file:
//       throw new Error('File is required');
//     
//     // Valider que c'est bien un fichier image
//     SI !file.type.startsWith('image/'):
//       throw new Error('File must be an image');
//     
//     // Valider taille du fichier (max 10MB)
//     SI file.size > 10 * 1024 * 1024:
//       throw new Error('File size must be less than 10MB');
//     
//     // Créer FormData avec le fichier
//     const formData = new FormData();
//     formData.append('file', file);
//     
//     // Faire requête POST /api/upload/image via backend
//     // NOTE: Le backend utilise ipfsService.uploadImage() qui utilise Pinata
//     const response = await axios.post(
//       `${API_URL}/upload/image`,
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       }
//     );
//     
//     // Le backend retourne { ipfsHash, url }
//     const { ipfsHash, url } = response.data;
//     
//     // Construire URL complète si url n'est pas fournie
//     const fullUrl = url || `${IPFS_GATEWAY}${ipfsHash}`;
//     
//     RETOURNER {
//       ipfsHash: ipfsHash,
//       url: fullUrl
//     };
//   CATCH error:
//     handleIPFSError(error);
//     throw error;
// }

/**
 * 2. Récupérer l'URL d'une image depuis son hash IPFS
 * @param {string} hash - Hash IPFS de l'image
 * @returns {string} URL complète de l'image
 * 
 * @example
 * const imageUrl = getImage('QmHash...');
 * // Retourne: 'https://gateway.pinata.cloud/ipfs/QmHash...'
 */
// TODO: Implémenter getImage(hash)
// function getImage(hash) {
//   // Valider que hash existe
//   SI !hash:
//     throw new Error('IPFS hash is required');
//   
//   // Construire URL complète depuis gateway
//   // Retirer le slash final du gateway si présent, puis ajouter le hash
//   const gateway = IPFS_GATEWAY.endsWith('/') 
//     ? IPFS_GATEWAY.slice(0, -1) 
//     : IPFS_GATEWAY;
//   
//   const hashClean = hash.startsWith('/') ? hash.slice(1) : hash;
//   
//   RETOURNER `${gateway}/${hashClean}`;
// }

/**
 * 3. Upload un objet JSON vers IPFS via le backend
 * @param {Object} data - Objet JavaScript à uploader
 * @returns {Promise<Object>} { ipfsHash, url }
 * 
 * @example
 * const orderData = {
 *   items: [
 *     { name: 'Pizza', quantity: 2, price: 0.05 }
 *   ],
 *   deliveryAddress: '123 Rue Example, Paris',
 *   createdAt: new Date().toISOString()
 * };
 * const result = await uploadJSON(orderData);
 * console.log(result.ipfsHash); // 'QmHash...'
 */
// TODO: Implémenter uploadJSON(data)
// async function uploadJSON(data) {
//   ESSAYER:
//     // Valider que data existe
//     SI !data:
//       throw new Error('Data is required');
//     
//     // Valider que data est un objet
//     SI typeof data !== 'object' || Array.isArray(data):
//       throw new Error('Data must be an object');
//     
//     // Convertir l'objet en JSON string
//     const jsonString = JSON.stringify(data);
//     
//     // Valider taille (max 1MB pour JSON)
//     SI jsonString.length > 1024 * 1024:
//       throw new Error('JSON data too large (max 1MB)');
//     
//     // Faire requête POST /api/upload/json via backend
//     // NOTE: Le backend utilise ipfsService.uploadJSON() qui utilise Pinata
//     const response = await axios.post(
//       `${API_URL}/upload/json`,
//       { data: data }, // Backend attend { data: {...} }
//       {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }
//     );
//     
//     // Le backend retourne { ipfsHash, url }
//     const { ipfsHash, url } = response.data;
//     
//     // Construire URL complète si url n'est pas fournie
//     const fullUrl = url || `${IPFS_GATEWAY}${ipfsHash}`;
//     
//     RETOURNER {
//       ipfsHash: ipfsHash,
//       url: fullUrl
//     };
//   CATCH error:
//     handleIPFSError(error);
//     throw error;
// }

/**
 * 4. Récupérer et parser un JSON depuis IPFS
 * @param {string} hash - Hash IPFS du JSON
 * @returns {Promise<Object>} Objet JavaScript parsé
 * 
 * @example
 * const data = await getJSON('QmHash...');
 * console.log(data.items); // Array d'items
 */
// TODO: Implémenter getJSON(hash)
// async function getJSON(hash) {
//   ESSAYER:
//     // Valider que hash existe
//     SI !hash:
//       throw new Error('IPFS hash is required');
//     
//     // Construire URL complète depuis gateway
//     const imageUrl = getImage(hash);
//     
//     // Faire requête GET vers le gateway IPFS
//     const response = await axios.get(imageUrl, {
//       headers: {
//         'Accept': 'application/json'
//       },
//       timeout: 10000 // 10 secondes timeout
//     });
//     
//     // Parser le JSON
//     const data = typeof response.data === 'string' 
//       ? JSON.parse(response.data) 
//       : response.data;
//     
//     RETOURNER data;
//   CATCH error:
//     SI error.response && error.response.status === 404:
//       throw new Error(`IPFS content not found: ${hash}`);
//     SINON:
//       handleIPFSError(error);
//       throw error;
// }

/**
 * 5. Upload plusieurs images vers IPFS (helper function)
 * @param {Array<File>} files - Array de fichiers images
 * @returns {Promise<Array<Object>>} Array de { ipfsHash, url }
 * 
 * @example
 * const files = fileInput.files; // FileList
 * const results = await uploadMultipleImages(Array.from(files));
 * results.forEach(result => console.log(result.ipfsHash));
 */
// TODO: Implémenter uploadMultipleImages(files)
// async function uploadMultipleImages(files) {
//   ESSAYER:
//     // Valider que files est un array
//     SI !Array.isArray(files) || files.length === 0:
//       throw new Error('Files array is required and cannot be empty');
//     
//     // Upload chaque fichier séquentiellement
//     // NOTE: On pourrait faire en parallèle avec Promise.all() mais risque de surcharge
//     const results = [];
//     POUR CHAQUE file DANS files:
//       const result = await uploadImage(file);
//       results.push(result);
//     
//     RETOURNER results;
//   CATCH error:
//     handleIPFSError(error);
//     throw error;
// }

/**
 * 6. Vérifier si un hash IPFS est accessible (helper function)
 * @param {string} hash - Hash IPFS à vérifier
 * @returns {Promise<boolean>} true si accessible, false sinon
 * 
 * @example
 * const isAccessible = await checkIPFSHash('QmHash...');
 */
// TODO: Implémenter checkIPFSHash(hash)
// async function checkIPFSHash(hash) {
//   ESSAYER:
//     // Essayer de récupérer le contenu
//     await getJSON(hash);
//     RETOURNER true;
//   CATCH error:
//     RETOURNER false;
// }

/**
 * Exporter toutes les fonctions
 */
// TODO: Exporter toutes les fonctions
// export {
//   uploadImage,
//   getImage,
//   uploadJSON,
//   getJSON,
//   uploadMultipleImages,
//   checkIPFSHash
// };

