const { getPinataAPI, getIPFSGateway, isPinataConfigured } = require("../config/ipfs");
const axios = require("axios");
const { Readable } = require("stream");

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
    // Vérifier si Pinata est configuré
    if (isPinataConfigured()) {
      // Utiliser Pinata SDK pour upload
      const pinata = getPinataAPI();
      
      // Upload vers Pinata (Pinata gère automatiquement le JSON)
      const result = await pinata.pinJSONToIPFS(data);
      const ipfsHash = result.IpfsHash;
      
      // Construire l'URL complète
      const gateway = getIPFSGateway();
      const url = gateway + ipfsHash;
      
      // Retourner le résultat
      return { ipfsHash, url };
    } else {
      // Si Pinata n'est pas configuré, on ne peut pas uploader
      throw new Error("Pinata not configured. Cannot upload to IPFS without Pinata.");
    }
  } catch (error) {
    // Logger l'erreur
    console.error("Error uploading JSON to IPFS:", error);
    throw error;
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
    // Vérifier que fileBuffer est valide
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new Error("fileBuffer must be a valid Buffer");
    }
    
    // Vérifier si Pinata est configuré
    if (isPinataConfigured()) {
      // Utiliser Pinata SDK pour upload image
      const pinata = getPinataAPI();
      
      // Créer un stream depuis le buffer
      const readableStream = Readable.from(fileBuffer);
      
      // Upload vers Pinata avec options
      const options = {
        pinataMetadata: {
          name: fileName
        },
        pinataOptions: {
          cidVersion: 0
        }
      };
      
      const result = await pinata.pinFileToIPFS(readableStream, options);
      const ipfsHash = result.IpfsHash;
      
      // Construire l'URL complète
      const gateway = getIPFSGateway();
      const url = gateway + ipfsHash;
      
      // Retourner le résultat
      return { ipfsHash, url };
    } else {
      // Si Pinata n'est pas configuré, on ne peut pas uploader
      throw new Error("Pinata not configured. Cannot upload to IPFS without Pinata.");
    }
  } catch (error) {
    // Logger l'erreur
    console.error("Error uploading image to IPFS:", error);
    throw error;
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
    // Créer un tableau pour stocker les résultats
    const results = [];
    
    // Parcourir chaque fichier et uploader
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = fileNames[i] || `image_${i}`;
      
      // Appeler uploadImage pour chaque fichier
      const result = await uploadImage(file, fileName);
      results.push(result);
    }
    
    // Retourner le tableau de résultats
    return results;
  } catch (error) {
    // Logger l'erreur
    console.error("Error uploading multiple images to IPFS:", error);
    throw error;
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
    // Construire l'URL complète du gateway
    const gateway = getIPFSGateway();
    const url = gateway + ipfsHash;
    
    // Faire une requête HTTP GET vers le gateway
    const response = await axios.get(url, {
      timeout: 10000 // 10 secondes timeout
    });
    
    // Parser le JSON
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    
    // Retourner l'objet JavaScript
    return data;
  } catch (error) {
    // Logger l'erreur
    console.error("Error getting JSON from IPFS:", error);
    throw error;
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
  // Construire l'URL complète du gateway
  const gateway = getIPFSGateway();
  return gateway + ipfsHash;
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
    // Vérifier si Pinata est configuré
    if (isPinataConfigured()) {
      // Utiliser Pinata SDK pour pinner
      const pinata = getPinataAPI();
      
      // Pin le fichier par hash
      await pinata.pinByHash(ipfsHash);
      
      // Retourner succès
      return { success: true };
    } else {
      // Si Pinata n'est pas configuré, on ne peut pas pinner
      console.warn("Pinata not configured. Cannot pin file without Pinata.");
      return { success: false, message: "Pinata not configured" };
    }
  } catch (error) {
    // Logger l'erreur
    console.error("Error pinning file to IPFS:", error);
    throw error;
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
    // Tester avec un upload simple
    const testData = { test: "connection", timestamp: Date.now() };
    await uploadJSON(testData);
    return true;
  } catch (error) {
    // Logger l'erreur
    console.error("IPFS connection test failed:", error);
    return false;
  }
}

// Exporter toutes les fonctions
module.exports = {
  uploadJSON,
  uploadImage,
  uploadMultipleImages,
  getJSON,
  getImage,
  pinFile,
  testConnection
};

