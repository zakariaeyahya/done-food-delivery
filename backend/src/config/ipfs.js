/**
 * IPFS configuration with Pinata only
 * @notice Uses Pinata SDK for all IPFS uploads/downloads
 * @dev No need for ipfs-http-client, Pinata handles everything
 */

const pinataSDK = require("@pinata/sdk");
require("dotenv").config();

/**
 * IPFS connection configuration with Pinata only
 * @notice Configures Pinata SDK for IPFS file upload/download
 * @dev Uses Pinata exclusively for all IPFS operations
 */
let pinataAPI = null;
let gatewayURL = null;

/**
 * Initializes IPFS connection with Pinata
 * @dev Initializes Pinata SDK if API keys are configured
 * 
 * Required environment variables:
 * - PINATA_API_KEY: Pinata API key (required for uploads)
 * - PINATA_SECRET_KEY: Pinata secret key (required for uploads)
 * - IPFS_GATEWAY_URL: IPFS gateway URL (optional, default: https://gateway.pinata.cloud/ipfs/)
 * 
 * @returns {Promise<Object|null>} Pinata API instance or null if not configured
 */
async function initIPFS() {
  try {
    const isPinataConfigured = process.env.PINATA_API_KEY &&
                               process.env.PINATA_SECRET_KEY &&
                               !process.env.PINATA_API_KEY.includes('your_') &&
                               !process.env.PINATA_SECRET_KEY.includes('your_');

    if (isPinataConfigured) {
      pinataAPI = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

      await pinataAPI.testAuthentication();

      gatewayURL = process.env.IPFS_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/";

      return pinataAPI;
    } else {
      gatewayURL = process.env.IPFS_GATEWAY_URL || "https://ipfs.io/ipfs/";

      return null;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Gets Pinata configuration
 * @dev Returns Pinata API keys from environment variables
 * 
 * @returns {Object|null} Object { apiKey, secretKey } or null if not configured
 */
function getPinataConfig() {
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
    return null;
  }

  return {
    apiKey: process.env.PINATA_API_KEY,
    secretKey: process.env.PINATA_SECRET_KEY
  };
}

/**
 * Gets IPFS gateway URL
 * @dev Returns gateway URL to access IPFS files
 * 
 * @returns {string} IPFS gateway URL
 */
function getIPFSGateway() {
  return gatewayURL || process.env.IPFS_GATEWAY_URL || "https://ipfs.io/ipfs/";
}

/**
 * Gets IPFS client (deprecated - use getPinataAPI instead)
 * @dev Always returns null as we use Pinata exclusively
 * @returns {Object|null} Always null
 */
function getIPFSClient() {
  return null;
}

/**
 * Gets Pinata API
 * @dev Returns initialized Pinata SDK instance
 * @returns {Object|null} Pinata API or null if not initialized
 */
function getPinataAPI() {
  return pinataAPI;
}

/**
 * Checks if Pinata is configured
 * @dev Checks if Pinata API instance has been initialized
 * @returns {boolean} True if Pinata is configured, false otherwise
 */
function isPinataConfigured() {
  return pinataAPI !== null;
}

/**
 * Tests IPFS/Pinata connection
 * @dev Tests Pinata authentication if configured
 * 
 * @returns {Promise<boolean>} True if Pinata is connected, false otherwise
 */
async function testConnection() {
  try {
    if (pinataAPI) {
      await pinataAPI.testAuthentication();
      return true;
    }

    if (gatewayURL) {
      return false;
    }

    return false;
  } catch (error) {
    return false;
  }
}

module.exports = {
  initIPFS,
  getPinataConfig,
  getIPFSGateway,
  getIPFSClient, // Retourne toujours null (compatibilité)
  getPinataAPI,
  isPinataConfigured,
  testConnection,
  pinataAPI,
  gatewayURL
};

