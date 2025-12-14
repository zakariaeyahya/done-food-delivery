import axios from 'axios';

// Force l'URL avec /api
const API_URL = 'http://localhost:3000/api';

const blockchainMetrics = {

  async getDashboard() {
    const response = await axios.get(`${API_URL}/blockchain/dashboard`);
    return response.data.data;
  },

  async getNetworkStats() {
    const response = await axios.get(`${API_URL}/blockchain/network`);
    return response.data.data;
  },

  async getHealth() {
    const response = await axios.get(`${API_URL}/blockchain/health`);
    return response.data.data;
  }
};

export default blockchainMetrics;
