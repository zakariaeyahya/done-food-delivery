// TODO: Importer les configurations IPFS
// const { getIPFSClient, getPinataAPI, getIPFSGateway, isPinataConfigured } = require("../config/ipfs");

// TODO: Importer axios pour les requêtes HTTP vers le gateway IPFS
// const axios = require("axios");

// TODO: Importer fs pour la gestion de fichiers si nécessaire
// const fs = require("fs");

/**
 * Service de gestion IPFS (upload/download de fichiers)
 * @notice Gère l'upload et le téléchargement de fichiers vers/depuis IPFS
 * @dev Utilise Pinata si configuré, sinon IPFS local ou gateway public
 */
/**
 * Upload un objet JSON vers IPFS
 * @dev TODO: Implémenter la fonction uploadJSON
 * 
 * Étapes:
 * 1. Convertir l'objet JavaScript en JSON string
 * 2. Upload vers IPFS (Pinata ou local)
 * 3. Pin le fichier si Pinata est configuré
 * 4. Retourner hash IPFS et URL complète
 * 
 * @param {Object} data - Objet JavaScript à uploader
 * @returns {Promise<Object>} { ipfsHash, url }
 */
async function uploadJSON(data) {
  try {
    // TODO: Convertir l'objet en JSON string
    // const jsonString = JSON.stringify(data);
    // const jsonBuffer = Buffer.from(jsonString, 'utf-8');
    
    // TODO: Vérifier si Pinata est configuré
    // if (isPinataConfigured()) {
    //   // TODO: Utiliser Pinata SDK pour upload
    //   const pinata = getPinataAPI();
    //   
    //   // TODO: Upload vers Pinata
    //   const result = await pinata.pinJSONToIPFS(data);
    //   const ipfsHash = result.IpfsHash;
    //   
    //   // TODO: Construire l'URL complète
    //   const gateway = getIPFSGateway();
    //   const url = gateway + ipfsHash;
    //   
    //   // TODO: Retourner le résultat
    //   return { ipfsHash, url };
    // } else {
    //   // TODO: Utiliser client IPFS local
    //   const ipfs = getIPFSClient();
    //   
    //   // TODO: Upload vers IPFS
    //   const result = await ipfs.add(jsonBuffer);
    //   const ipfsHash = result.path;
    //   
    //   // TODO: Construire l'URL complète
    //   const gateway = getIPFSGateway();
    //   const url = gateway + ipfsHash;
    //   
    //   // TODO: Retourner le résultat
    //   return { ipfsHash, url };
    // }
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error uploading JSON to IPFS:", error);
    // throw error;
  }
}

/**
 * Upload une image vers IPFS
 * @dev TODO: Implémenter la fonction uploadImage
 * 
 * @param {Buffer} fileBuffer - Buffer du fichier image
 * @param {string} fileName - Nom du fichier (optionnel)
 * @returns {Promise<Object>} { ipfsHash, url }
 */
async function uploadImage(fileBuffer, fileName = "image") {
  try {
    // TODO: Vérifier si Pinata est configuré
    // if (isPinataConfigured()) {
    //   // TODO: Utiliser Pinata SDK pour upload image
    //   const pinata = getPinataAPI();
    //   
    //   // TODO: Créer un stream depuis le buffer
    //   const readableStream = require('stream').Readable.from(fileBuffer);
    //   
    //   // TODO: Upload vers Pinata avec options
    //   const options = {
    //     pinataMetadata: {
    //       name: fileName
    //     },
    //     pinataOptions: {
    //       cidVersion: 0
    //     }
    //   };
    //   
    //   const result = await pinata.pinFileToIPFS(readableStream, options);
    //   const ipfsHash = result.IpfsHash;
    //   
    //   // TODO: Construire l'URL complète
    //   const gateway = getIPFSGateway();
    //   const url = gateway + ipfsHash;
    //   
    //   // TODO: Retourner le résultat
    //   return { ipfsHash, url };
    // } else {
    //   // TODO: Utiliser client IPFS local
    //   const ipfs = getIPFSClient();
    //   
    //   // TODO: Upload vers IPFS
    //   const result = await ipfs.add(fileBuffer, {
    //     pin: true // Pin automatiquement
    //   });
    //   const ipfsHash = result.path;
    //   
    //   // TODO: Construire l'URL complète
    //   const gateway = getIPFSGateway();
    //   const url = gateway + ipfsHash;
    //   
    //   // TODO: Retourner le résultat
    //   return { ipfsHash, url };
    // }
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error uploading image to IPFS:", error);
    // throw error;
  }
}

/**
 * Upload plusieurs images vers IPFS
 * @dev TODO: Implémenter la fonction uploadMultipleImages
 * 
 * @param {Array<Buffer>} files - Tableau de buffers de fichiers
 * @param {Array<string>} fileNames - Tableau de noms de fichiers (optionnel)
 * @returns {Promise<Array>} [{ ipfsHash, url }, ...]
 */
async function uploadMultipleImages(files, fileNames = []) {
  try {
    // TODO: Créer un tableau pour stocker les résultats
    // const results = [];
    
    // TODO: Parcourir chaque fichier et uploader
    // for (let i = 0; i < files.length; i++) {
    //   const file = files[i];
    //   const fileName = fileNames[i] || `image_${i}`;
    //   
    //   // TODO: Appeler uploadImage pour chaque fichier
    //   const result = await uploadImage(file, fileName);
    //   results.push(result);
    // }
    
    // TODO: Retourner le tableau de résultats
    // return results;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error uploading multiple images to IPFS:", error);
    // throw error;
  }
}

/**
 * Récupère un fichier JSON depuis IPFS
 * @dev TODO: Implémenter la fonction getJSON
 * 
 * @param {string} ipfsHash - Hash IPFS du fichier
 * @returns {Promise<Object>} Objet JavaScript parsé depuis JSON
 */
async function getJSON(ipfsHash) {
  try {
    // TODO: Construire l'URL complète du gateway
    // const gateway = getIPFSGateway();
    // const url = gateway + ipfsHash;
    
    // TODO: Faire une requête HTTP GET vers le gateway
    // const response = await axios.get(url);
    
    // TODO: Parser le JSON
    // const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    
    // TODO: Retourner l'objet JavaScript
    // return data;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error getting JSON from IPFS:", error);
    // throw error;
  }
}

/**
 * Récupère l'URL complète d'une image depuis IPFS
 * @dev TODO: Implémenter la fonction getImage
 * 
 * @param {string} ipfsHash - Hash IPFS de l'image
 * @returns {string} URL complète du gateway
 */
function getImage(ipfsHash) {
  // TODO: Construire l'URL complète du gateway
  // const gateway = getIPFSGateway();
  // return gateway + ipfsHash;
}

/**
 * Pin un fichier existant sur IPFS (évite garbage collection)
 * @dev TODO: Implémenter la fonction pinFile
 * 
 * Note: Utile pour s'assurer qu'un fichier reste disponible sur IPFS
 * 
 * @param {string} ipfsHash - Hash IPFS du fichier à pinner
 * @returns {Promise<Object>} { success: true }
 */
async function pinFile(ipfsHash) {
  try {
    // TODO: Vérifier si Pinata est configuré
    // if (isPinataConfigured()) {
    //   // TODO: Utiliser Pinata SDK pour pinner
    //   const pinata = getPinataAPI();
    //   
    //   // TODO: Pin le fichier par hash
    //   await pinata.pinByHash(ipfsHash);
    //   
    //   // TODO: Retourner succès
    //   return { success: true };
    // } else {
    //   // TODO: Si IPFS local, le fichier est déjà piné lors de l'upload
    //   // Retourner succès
    //   return { success: true };
    // }
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error pinning file to IPFS:", error);
    // throw error;
  }
}

/**
 * Teste la connexion IPFS
 * @dev TODO: Implémenter la fonction testConnection
 * 
 * @returns {Promise<boolean>} True si la connexion fonctionne
 */
async function testConnection() {
  try {
    // TODO: Tester avec un upload simple
    // const testData = { test: "connection" };
    // await uploadJSON(testData);
    // return true;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("IPFS connection test failed:", error);
    // return false;
  }
}

// TODO: Exporter toutes les fonctions
// module.exports = {
//   uploadJSON,
//   uploadImage,
//   uploadMultipleImages,
//   getJSON,
//   getImage,
//   pinFile,
//   testConnection
// };

