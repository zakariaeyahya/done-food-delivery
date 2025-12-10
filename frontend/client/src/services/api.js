import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your actual backend URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches a list of restaurants, optionally with filters.
 * @param {object} filters - Optional filters to apply to the query.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getRestaurants = (filters = {}) => {
  return apiClient.get('/restaurants', { params: filters });
};
export const convertCurrency = (data) => {
  return apiClient.post('/oracles/convert', data);
};
// src/services/api.js
export const getUserProfile = (address) => {
  return apiClient.get(`/users/${address}`);
};

export const updateUserProfile = (address, userData) => {
  return apiClient.put(`/users/${address}`, userData);
};

// frontend/api.js
export async function registerUser(address, name, email, phone) {
  return axios.post('/api/users/register', {
    address,
    name,          // ⚠️ jammais vide
    email,
    phone
  });
}


export const getUserTokens = (address) => {
  return apiClient.get(`/users/${address}/tokens`);
};
/**
 * Fetches the details of a single restaurant by its ID.
 * @param {string} id - The ID of the restaurant.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getRestaurantById = (id) => {
  return apiClient.get(`/restaurants/${id}`);
};

/**
 * Creates a new order.
 * @param {object} orderData - The data for the new order.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const createOrder = (orderData) => {
  return apiClient.post('/orders', orderData);
};

/**
 * Fetches an order by its ID.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getOrderById = (orderId) => {
  return apiClient.get(`/orders/${orderId}`);
};

/**
 * Fetches all orders for a given client address.
 * @param {string} clientAddress - The blockchain address of the client.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getOrdersByClient = (clientAddress) => {
  return apiClient.get(`/orders/client/${clientAddress}`);
};

/**
 * Confirms the delivery of an order.
 * @param {string} orderId - The ID of the order to confirm.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const confirmDelivery = (orderId) => {
  return apiClient.post(`/orders/${orderId}/confirm-delivery`);
};

/**
 * Opens a dispute for an order.
 * @param {string} orderId - The ID of the order to dispute.
 * @param {object} disputeData - The data related to the dispute.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const openDispute = (orderId, disputeData) => {
  return apiClient.post(`/orders/${orderId}/dispute`, disputeData);
};

/**
 * Submits a review for an order.
 * @param {object} reviewData - The review data, including orderId, rating, and text.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const submitReview = (reviewData) => {
  return apiClient.post('/reviews', reviewData);
};
// src/services/api.js
export const getTokenRate = () => {
  return apiClient.get('/tokens/rate');
};

export const useTokenDiscount = (data) => {
  return apiClient.post('/tokens/use-discount', data);
};
export default {
  getRestaurants,
  getRestaurantById,
  createOrder,
  getOrderById,
  getOrdersByClient,
  confirmDelivery,
  openDispute,
  submitReview,
};