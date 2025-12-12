/**
 * Service API pour les appels backend
 * @fileoverview Gère toutes les requêtes HTTP vers l'API backend pour le livreur
 */

import axios from 'axios';

// Configuration de base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add dev auth headers
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

// Interceptor to suppress expected 404 errors from console
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress console logging for expected 404s (deliverer not registered yet)
    if (error.response?.status === 404 && error.config?.url?.includes('/deliverers/')) {
      // Don't log to console - this is expected when deliverer isn't registered
      return Promise.reject(error);
    }
    // For other errors, let axios log them normally
    return Promise.reject(error);
  }
);

/**
 * Headers d'authentification
 */
function authHeaders(address) {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer mock_signature_for_testing",
    "x-wallet-address": address,
    "x-message": "auth"
  };
}

/* -------------------------------------------------------------------------- */
/* 1. Récupérer les commandes disponibles à proximité                         */
/* -------------------------------------------------------------------------- */
async function getAvailableOrders(location = {}) {
  try {
    const params = new URLSearchParams();
    
    // Ajouter les paramètres de position si disponibles
    if (location && location.lat && location.lng) {
      params.append('lat', location.lat.toString());
      params.append('lng', location.lng.toString());
    }

    const queryString = params.toString();
    const url = `/deliverers/available${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching available orders:", error);
    throw new Error(`Failed to get available orders: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Accepter une commande disponible                                        */
/* -------------------------------------------------------------------------- */
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
    console.error("Error accepting order:", error);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    const errorDetails = error.response?.data?.details || '';
    console.error("  - Status:", error.response?.status);
    console.error("  - Message:", errorMessage);
    console.error("  - Details:", errorDetails);
    throw new Error(`Failed to accept order: ${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Confirmer le pickup                                                     */
/* -------------------------------------------------------------------------- */
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
    console.error("Error confirming pickup:", error);
    throw new Error(`Failed to confirm pickup: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Confirmer la livraison                                                  */
/* -------------------------------------------------------------------------- */
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
    console.error("Error confirming delivery:", error);
    throw new Error(`Failed to confirm delivery: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Mettre à jour la position GPS                                           */
/* -------------------------------------------------------------------------- */
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
    console.error("Error updating GPS location:", error);
    throw new Error(`Failed to update GPS location: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 6. Récupérer les revenus                                                   */
/* -------------------------------------------------------------------------- */
async function getEarnings(address, period = "week") {
  try {
    if (!address) throw new Error("Address is required");

    const params = new URLSearchParams({ period });
    const response = await apiClient.get(`/deliverers/${address}/earnings?${params}`);

    return response.data;
  } catch (error) {
    // 403 = User doesn't have DELIVERER_ROLE - needs to register first
    if (error.response?.status === 403) {
      console.warn("User not registered as deliverer yet");
      return { earnings: { completedDeliveries: 0, totalEarnings: 0 } };
    }
    console.error("Error fetching earnings:", error);
    return { earnings: { completedDeliveries: 0, totalEarnings: 0 } };
  }
}

/* -------------------------------------------------------------------------- */
/* 7. Récupérer la note + avis                                                */
/* -------------------------------------------------------------------------- */
async function getRating(address) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await apiClient.get(`/deliverers/${address}/rating`);
    // Le backend retourne { success, rating, totalDeliveries, reviews }
    // On retourne directement les données sans le wrapper success
    const data = response.data;
    return {
      rating: data.rating || 0,
      totalDeliveries: data.totalDeliveries || 0,
      reviews: data.reviews || []
    };
  } catch (error) {
    console.error("Error fetching rating:", error);
    // En cas d'erreur, retourner des valeurs par défaut
    return { rating: 0, totalDeliveries: 0, reviews: [] };
  }
}

/* -------------------------------------------------------------------------- */
/* 8. Mettre à jour le statut                                                */
/* -------------------------------------------------------------------------- */
async function updateStatus(address, isOnline) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await apiClient.put(
      `/deliverers/${address}/status`,
      { isAvailable: isOnline }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating status:", error);
    throw new Error(`Failed to update status: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 9. Historique des livraisons                                              */
/* -------------------------------------------------------------------------- */
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
    console.error("Error fetching deliverer orders:", error);
    throw new Error(`Failed to get deliverer orders: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 10. Livraison active                                                      */
/* -------------------------------------------------------------------------- */
async function getActiveDelivery(address) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await apiClient.get(`/deliverers/${address}/active-delivery`);
    // Le backend retourne null si pas de livraison active
    return response.data || null;
  } catch (error) {
    // 404 est normal - pas de livraison active
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching active delivery:", error);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* 11. Détails commande                                                      */
/* -------------------------------------------------------------------------- */
async function getOrder(orderId) {
  try {
    if (!orderId) throw new Error("Order ID is required");

    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error(`Failed to get order: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 12. Register deliverer                                                    */
/* -------------------------------------------------------------------------- */
async function registerDeliverer(data) {
  try {
    if (!data || !data.address) throw new Error("Address is required");

    const response = await apiClient.post(`/deliverers/register`, data);
    return response.data;
  } catch (error) {
    console.error("Error registering deliverer:", error);

    // Extraire le message d'erreur du backend
    const errorDetails = error.response?.data?.details ||
                         error.response?.data?.message ||
                         error.message;

    // Si c'est une erreur 409 (déjà inscrit), le livreur existe déjà
    if (error.response?.status === 409) {
      throw { alreadyRegistered: true, message: "Ce wallet est déjà inscrit comme livreur" };
    }

    throw new Error(errorDetails);
  }
}

/* -------------------------------------------------------------------------- */
/* 13. Profil livreur                                                        */
/* -------------------------------------------------------------------------- */
async function getDeliverer(address) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await apiClient.get(`/deliverers/${address}`);
    return response.data;
  } catch (error) {
    // 404 is expected if deliverer not registered yet - don't log it
    if (error.response?.status === 404) {
      throw error; // Re-throw to let caller handle registration
    }
    console.error("Error fetching deliverer:", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*  EXPORT PAR DÉFAUT (IMPORTANT POUR TON FRONT-END !)                       */
/* -------------------------------------------------------------------------- */
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
  getOrder,
  registerDeliverer,
  getDeliverer
};

export default api;

/* -------------------------------------------------------------------------- */
/* EXPORTS NOMMÉS (optionnel mais utile)                                     */
/* -------------------------------------------------------------------------- */
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
  getOrder,
  registerDeliverer,
  getDeliverer
};
