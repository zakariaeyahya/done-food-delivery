const { getPinataAPI, getIPFSGateway, isPinataConfigured } = require("../config/ipfs");
const axios = require("axios");
const { Readable } = require("stream");

/**
 * IPFS Service (file upload/download)
 * @notice Manages file upload and download to/from IPFS
 * @dev Uses Pinata if configured, otherwise local IPFS or public gateway
 */

/**
 * Upload JSON object to IPFS
 * @param {Object} data - JavaScript object to upload
 * @returns {Promise<Object>} { ipfsHash, url }
 */
async function uploadJSON(data) {
  try {
    if (isPinataConfigured()) {
      const pinata = getPinataAPI();
      const result = await pinata.pinJSONToIPFS(data);
      const ipfsHash = result.IpfsHash;
      const gateway = getIPFSGateway();
      const url = gateway + ipfsHash;
      return { ipfsHash, url };
    } else {
      throw new Error("Pinata not configured. Cannot upload to IPFS without Pinata.");
    }
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw error;
  }
}

/**
 * Upload image to IPFS
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} fileName - File name (optional)
 * @returns {Promise<Object>} { ipfsHash, url }
 */
async function uploadImage(fileBuffer, fileName = "image") {
  try {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new Error("fileBuffer must be a valid Buffer");
    }
    
    if (isPinataConfigured()) {
      const pinata = getPinataAPI();
      const readableStream = Readable.from(fileBuffer);
      
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
      const gateway = getIPFSGateway();
      const url = gateway + ipfsHash;
      
      return { ipfsHash, url };
    } else {
      throw new Error("Pinata not configured. Cannot upload to IPFS without Pinata.");
    }
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    throw error;
  }
}

/**
 * Upload multiple images to IPFS
 * @param {Array<Buffer>} files - Array of file buffers
 * @param {Array<string>} fileNames - Array of file names (optional)
 * @returns {Promise<Array>} [{ ipfsHash, url }, ...]
 */
async function uploadMultipleImages(files, fileNames = []) {
  try {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = fileNames[i] || `image_${i}`;
      const result = await uploadImage(file, fileName);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error("Error uploading multiple images to IPFS:", error);
    throw error;
  }
}

/**
 * Get JSON file from IPFS
 * @param {string} ipfsHash - IPFS file hash
 * @returns {Promise<Object>} JavaScript object parsed from JSON
 */
async function getJSON(ipfsHash) {
  try {
    const gateway = getIPFSGateway();
    const url = gateway + ipfsHash;
    
    const response = await axios.get(url, {
      timeout: 10000
    });
    
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    
    return data;
  } catch (error) {
    console.error("Error getting JSON from IPFS:", error);
    throw error;
  }
}

/**
 * Get full image URL from IPFS
 * @param {string} ipfsHash - IPFS image hash
 * @returns {string} Full gateway URL
 */
function getImage(ipfsHash) {
  const gateway = getIPFSGateway();
  return gateway + ipfsHash;
}

/**
 * Pin existing file on IPFS (prevents garbage collection)
 * @param {string} ipfsHash - IPFS file hash to pin
 * @returns {Promise<Object>} { success: true }
 */
async function pinFile(ipfsHash) {
  try {
    if (isPinataConfigured()) {
      const pinata = getPinataAPI();
      await pinata.pinByHash(ipfsHash);
      return { success: true };
    } else {
      console.warn("Pinata not configured. Cannot pin file without Pinata.");
      return { success: false, message: "Pinata not configured" };
    }
  } catch (error) {
    console.error("Error pinning file to IPFS:", error);
    throw error;
  }
}

/**
 * Test IPFS connection
 * @returns {Promise<boolean>} True if connection works
 */
async function testConnection() {
  try {
    const testData = { test: "connection", timestamp: Date.now() };
    await uploadJSON(testData);
    return true;
  } catch (error) {
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

