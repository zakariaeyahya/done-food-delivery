import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const address = window.ethereum?.selectedAddress || localStorage.getItem('walletAddress');

  if (address) {
    config.headers['Authorization'] = 'Bearer mock_signature_for_testing';
    config.headers['x-wallet-address'] = address;
    config.headers['x-message'] = 'auth';
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404 && error.config?.url?.includes('/deliverers/')) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

function authHeaders(address) {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer mock_signature_for_testing",
    "x-wallet-address": address,
    "x-message": "auth"
  };
}

async function getAvailableOrders(location = {}) {
  try {
    const params = new URLSearchParams();

    if (location && location.lat && location.lng) {
      params.append('lat', location.lat.toString());
      params.append('lng', location.lng.toString());
    }

    const queryString = params.toString();
    const url = `/deliverers/available${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get available orders: ${error.message}`);
  }
}

async function acceptOrder(orderId, delivererAddress) {
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (!delivererAddress) throw new Error("Deliverer address is required");

    const response = await apiClient.post(
      `/deliverers/orders/${orderId}/accept`,
      { delivererAddress }
    );

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    const errorDetails = error.response?.data?.details || '';
    throw new Error(`Failed to accept order: ${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
  }
}

async function confirmPickup(orderId, delivererAddress) {
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (!delivererAddress) throw new Error("Deliverer address is required");

    const response = await apiClient.post(
      `/orders/${orderId}/confirm-pickup`,
      { delivererAddress }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to confirm pickup: ${error.message}`);
  }
}

async function confirmDelivery(orderId, delivererAddress) {
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (!delivererAddress) throw new Error("Deliverer address is required");

    const response = await apiClient.post(
      `/orders/${orderId}/confirm-delivery`,
      { delivererAddress }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to confirm delivery: ${error.message}`);
  }
}

async function updateGPSLocation(orderId, location) {
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (!location || !location.lat || !location.lng) {
      throw new Error("Location with lat and lng is required");
    }

    const response = await apiClient.post(
      `/orders/${orderId}/update-gps`,
      { lat: location.lat, lng: location.lng }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to update GPS location: ${error.message}`);
  }
}

async function getEarnings(address, period = "week") {
  try {
    if (!address) throw new Error("Address is required");

    const params = new URLSearchParams({ period });
    const response = await apiClient.get(`/deliverers/${address}/earnings?${params}`);

    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      return { earnings: { completedDeliveries: 0, totalEarnings: 0 } };
    }
    return { earnings: { completedDeliveries: 0, totalEarnings: 0 } };
  }
}

async function getRating(address) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await apiClient.get(`/deliverers/${address}/rating`);
    const data = response.data;
    return {
      rating: data.rating || 0,
      totalDeliveries: data.totalDeliveries || 0,
      reviews: data.reviews || []
    };
  } catch (error) {
    return { rating: 0, totalDeliveries: 0, reviews: [] };
  }
}

async function updateStatus(address, isOnline) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await apiClient.put(
      `/deliverers/${address}/status`,
      { isAvailable: isOnline }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }
}

async function getDelivererOrders(address, filters = {}) {
  try {
    if (!address) throw new Error("Address is required");

    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);

    const queryString = params.toString();
    const url = `/deliverers/${address}/orders${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get deliverer orders: ${error.message}`);
  }
}

async function getActiveDelivery(address) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await apiClient.get(`/deliverers/${address}/active-delivery`);
    const data = response.data;

    if (data && data.activeDelivery) {
      return data.activeDelivery;
    }

    return data || null;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    return null;
  }
}

async function getAllActiveDeliveries(address) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await apiClient.get(`/deliverers/${address}/active-delivery`);
    const data = response.data;

    return {
      activeDelivery: data?.activeDelivery || null,
      allActiveDeliveries: data?.allActiveDeliveries || [],
      count: data?.count || 0
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { activeDelivery: null, allActiveDeliveries: [], count: 0 };
    }
    return { activeDelivery: null, allActiveDeliveries: [], count: 0 };
  }
}

async function cancelDelivery(orderId, delivererAddress) {
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (!delivererAddress) throw new Error("Deliverer address is required");

    const response = await apiClient.post(
      `/deliverers/orders/${orderId}/cancel`,
      { delivererAddress },
      { headers: authHeaders(delivererAddress) }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

async function forceCompleteDelivery(orderId, delivererAddress) {
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (!delivererAddress) throw new Error("Deliverer address is required");

    const response = await apiClient.post(
      `/deliverers/orders/${orderId}/force-complete`,
      { delivererAddress },
      { headers: authHeaders(delivererAddress) }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getOrder(orderId) {
  try {
    if (!orderId) throw new Error("Order ID is required");

    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get order: ${error.message}`);
  }
}

async function registerDeliverer(data) {
  try {
    if (!data || !data.address) throw new Error("Address is required");

    const response = await apiClient.post(`/deliverers/register`, data);
    return response.data;
  } catch (error) {
    const errorDetails = error.response?.data?.details ||
                         error.response?.data?.message ||
                         error.message;

    if (error.response?.status === 409) {
      throw { alreadyRegistered: true, message: "Ce wallet est déjà inscrit comme livreur" };
    }

    throw new Error(errorDetails);
  }
}

async function getDeliverer(address) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await apiClient.get(`/deliverers/${address}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw error;
    }
    throw error;
  }
}

async function syncStakingStatus(address, txHash = null, stakedAmount = null) {
  try {
    if (!address) throw new Error("Address is required");

    const body = {};
    if (txHash) body.txHash = txHash;
    if (stakedAmount) body.stakedAmount = stakedAmount;

    const response = await apiClient.post(`/deliverers/sync-staking/${address}`, body);
    return response.data;
  } catch (error) {
    console.error('[syncStakingStatus] Error:', error.response?.data || error.message);
    throw new Error(`Failed to sync staking status: ${error.response?.data?.message || error.message}`);
  }
}

const api = {
  getAvailableOrders,
  acceptOrder,
  confirmPickup,
  confirmDelivery,
  updateGPSLocation,
  getEarnings,
  getRating,
  updateStatus,
  getDelivererOrders,
  getActiveDelivery,
  getAllActiveDeliveries,
  cancelDelivery,
  forceCompleteDelivery,
  getOrder,
  registerDeliverer,
  getDeliverer,
  syncStakingStatus
};

export default api;

export {
  getAvailableOrders,
  acceptOrder,
  confirmPickup,
  confirmDelivery,
  updateGPSLocation,
  getEarnings,
  getRating,
  updateStatus,
  getDelivererOrders,
  getActiveDelivery,
  getAllActiveDeliveries,
  cancelDelivery,
  forceCompleteDelivery,
  getOrder,
  registerDeliverer,
  getDeliverer,
  syncStakingStatus
};
