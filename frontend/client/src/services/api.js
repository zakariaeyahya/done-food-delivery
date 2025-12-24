import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your actual backend URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add dev auth headers (like deliverer API)
apiClient.interceptors.request.use((config) => {
  // Only run on client side
  if (typeof window === 'undefined') {
    return config;
  }

  // Get current wallet address from localStorage or window
  const address = window.ethereum?.selectedAddress || localStorage.getItem('walletAddress');

  if (address) {
    // Dev mode: use mock signature
    config.headers['Authorization'] = 'Bearer mock_signature_for_testing';
    config.headers['x-wallet-address'] = address;
    config.headers['x-message'] = 'auth';
    
  }

  return config;
});

/**
 * Fetches a list of restaurants, optionally with filters.
 * @param {object} filters - Optional filters to apply to the query.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getRestaurants = (filters = {}) => {
  return apiClient.get('/restaurants', { params: filters });
};
// === ORACLE APIs ===

/**
 * Gets MATIC/USD price from Chainlink Oracle
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getOraclePrice = () => {
  return apiClient.get('/oracles/price');
};

/**
 * Converts fiat currency to MATIC
 * @param {object} data - { amount, from: 'USD'|'EUR', to: 'MATIC' }
 * @returns {Promise<AxiosResponse<any>>}
 */
export const convertCurrency = (data) => {
  return apiClient.post('/oracles/convert', data);
};

/**
 * Gets weather data for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getWeather = (lat, lng) => {
  return apiClient.get(`/oracles/weather?lat=${lat}&lng=${lng}`);
};

/**
 * Verifies GPS delivery location
 * @param {object} data - { orderId, clientLat, clientLng }
 * @returns {Promise<AxiosResponse<any>>}
 */
export const verifyGPSDelivery = (data) => {
  return apiClient.post('/oracles/gps/verify', data);
};

/**
 * Updates deliverer GPS location
 * @param {object} data - { orderId, lat, lng, delivererAddress }
 * @returns {Promise<AxiosResponse<any>>}
 */
export const updateGPSLocation = (data) => {
  return apiClient.post('/oracles/gps/update', data);
};

/**
 * Tracks delivery in real-time
 * @param {string|number} orderId - Order ID
 * @returns {Promise<AxiosResponse<any>>}
 */
export const trackDelivery = (orderId) => {
  return apiClient.get(`/oracles/gps/track/${orderId}`);
};

/**
 * Gets GPS metrics
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getGPSMetrics = () => {
  return apiClient.get('/oracles/gps/metrics');
};

/**
 * Gets price metrics
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getPriceMetrics = () => {
  return apiClient.get('/oracles/price/metrics');
};
// src/services/api.js
export const getUserProfile = (address) => {
  return apiClient.get(`/users/${address}`);
};

export const updateUserProfile = (address, userData) => {
  return apiClient.put(`/users/${address}`, userData);
};

// frontend/api.js
export const registerUser = (userData) => {
  return apiClient.post('/users/register', userData);
};


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
 * Checks if a restaurant has the blockchain role
 * @param {string} address - The restaurant's wallet address
 * @returns {Promise<AxiosResponse<any>>}
 */
export const checkRestaurantBlockchainRole = (address) => {
  return apiClient.get(`/restaurants/blockchain/role/${address}`);
};

/**
 * Grants the blockchain role to a restaurant
 * @param {string} address - The restaurant's wallet address
 * @returns {Promise<AxiosResponse<any>>}
 */
export const grantRestaurantBlockchainRole = (address) => {
  return apiClient.post('/restaurants/blockchain/grant-role', { address });
};

/**
 * Creates a new order.
 * @param {object} orderData - The data for the new order.
 * @param {string} clientAddress - The client's wallet address (for auth in dev mode)
 * @returns {Promise<AxiosResponse<any>>}
 */
export const createOrder = (orderData, clientAddress) => {
  // En mode développement, utiliser la signature mock
  const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
  
  const headers = {};
  if (isDevelopment && clientAddress) {
    // Utiliser la signature mock pour le développement
    headers['Authorization'] = 'Bearer mock_signature_for_testing';
    headers['x-wallet-address'] = clientAddress;
    headers['x-message'] = `Create order for ${clientAddress}`;
  }
  
  return apiClient.post('/orders/create', orderData, { headers });
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
// === CART API ===

/**
 * Gets the cart for a user
 * @param {string} address - User's wallet address
 */
export const getCart = (address) => {
  return apiClient.get(`/cart/${address}`);
};

/**
 * Adds an item to the cart
 * @param {string} address - User's wallet address
 * @param {object} itemData - Item data including menuItemId, name, price, quantity, image, restaurantId, restaurantAddress
 */
export const addToCart = (address, itemData) => {
  return apiClient.post(`/cart/${address}/add`, itemData);
};

/**
 * Updates item quantity in cart
 * @param {string} address - User's wallet address
 * @param {string} menuItemId - Menu item ID
 * @param {number} quantity - New quantity
 */
export const updateCartItem = (address, menuItemId, quantity) => {
  return apiClient.put(`/cart/${address}/update`, { menuItemId, quantity });
};

/**
 * Removes an item from cart
 * @param {string} address - User's wallet address
 * @param {string} itemId - Menu item ID to remove
 */
export const removeFromCart = (address, itemId) => {
  return apiClient.delete(`/cart/${address}/remove/${itemId}`);
};

/**
 * Clears the entire cart
 * @param {string} address - User's wallet address
 */
export const clearCart = (address) => {
  return apiClient.delete(`/cart/${address}/clear`);
};

/**
 * Gets the receipt for an order
 * @param {string|number} orderId - The order ID
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getOrderReceipt = (orderId) => {
  return apiClient.get(`/orders/${orderId}/receipt`);
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
  getOrderReceipt,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  // Oracle APIs
  getOraclePrice,
  convertCurrency,
  getWeather,
  verifyGPSDelivery,
  updateGPSLocation,
  trackDelivery,
  getGPSMetrics,
  getPriceMetrics,
};