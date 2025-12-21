const { getPinataAPI, getIPFSGateway, isPinataConfigured } = require("../config/ipfs");
const axios = require("axios");
const { Readable } = require("stream");

/**
 * IPFS Service (file upload/download)
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
      if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' || process.env.ALLOW_MOCK_IPFS === 'true') {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
        const mockHash = 'Qm' + hash.substring(0, 44);
        const gateway = getIPFSGateway();
        return { ipfsHash: mockHash, url: gateway + mockHash };
      }
      throw new Error("Pinata not configured. Cannot upload to IPFS without Pinata.");
    }
  } catch (error) {
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
    throw error;
  }
}

/**
 * Get JSON file from IPFS
 * @param {string} ipfsHash - IPFS file hash
 * @returns {Promise<Object>} JavaScript object parsed from JSON
 */
/**
 * Valide un hash IPFS
 * @param {string} ipfsHash - Hash IPFS à valider
 * @returns {boolean} True si le hash est valide
 */
function isValidIPFSHash(ipfsHash) {
  if (!ipfsHash || typeof ipfsHash !== 'string') {
    return false;
  }

  if (ipfsHash.toLowerCase().includes('test') ||
      ipfsHash.toLowerCase().includes('mock') ||
      ipfsHash.toLowerCase().includes('example')) {
    return false;
  }

  const cidV0Pattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;

  const cidV1Pattern = /^[b-zB-Z][0-9a-z]{58,}$/;

  return cidV0Pattern.test(ipfsHash) || cidV1Pattern.test(ipfsHash);
}

async function getJSON(ipfsHash) {
  try {
    if (!isValidIPFSHash(ipfsHash)) {
      throw new Error(`Invalid IPFS hash format: ${ipfsHash}`);
    }

    const gateway = getIPFSGateway();
    const url = gateway + ipfsHash;

    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });

    if (response.status === 400) {
      throw new Error(`Invalid IPFS CID: ${ipfsHash}`);
    }

    if (response.status !== 200) {
      throw new Error(`IPFS gateway returned status ${response.status}`);
    }

    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    return data;
  } catch (error) {
    if (error.message && error.message.includes('Invalid IPFS')) {
      throw error;
    }
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
      return { success: false, message: "Pinata not configured" };
    }
  } catch (error) {
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
    return false;
  }
}

module.exports = {
  uploadJSON,
  uploadImage,
  uploadMultipleImages,
  getJSON,
  getImage,
  pinFile,
  testConnection,
  isValidIPFSHash
};
