import axios from 'axios';

// A public IPFS gateway. For a real-world application, consider using a dedicated gateway service like Pinata or Infura.
const IPFS_GATEWAY_URL = 'https://ipfs.io/ipfs/';
const IPFS_API_URL = 'https://ipfs.io/api/v0';

/**
 * Uploads an image file to IPFS.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} The IPFS hash (CID) of the uploaded file.
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${IPFS_API_URL}/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.Hash;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw error;
  }
};

/**
 * Constructs the full URL to view an IPFS file via the gateway.
 * @param {string} hash - The IPFS hash (CID).
 * @returns {string} The full URL to the IPFS resource.
 */
export const getImageUrl = (hash) => {
  return `${IPFS_GATEWAY_URL}${hash}`;
};

/**
 * Uploads JSON data to IPFS.
 * @param {object} jsonData - The JSON object to upload.
 * @returns {Promise<string>} The IPFS hash (CID) of the uploaded JSON.
 */
export const uploadJSON = async (jsonData) => {
  const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
  const formData = new FormData();
  formData.append('file', jsonBlob, 'metadata.json');

  try {
    const response = await axios.post(`${IPFS_API_URL}/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.Hash;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
};

/**
 * Retrieves and parses JSON data from IPFS using its hash.
 * @param {string} hash - The IPFS hash (CID) of the JSON file.
 * @returns {Promise<object>} The parsed JSON object.
 */
export const getJSON = async (hash) => {
  try {
    const url = getImageUrl(hash);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error retrieving JSON from IPFS:', error);
    throw error;
  }
};

export default {
  uploadImage,
  getImageUrl,
  uploadJSON,
  getJSON,
};