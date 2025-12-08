/**
 * Service API pour les appels backend
 * @fileoverview Gère toutes les requêtes HTTP vers l'API backend pour le livreur
 */

import axios from 'axios';

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Headers d'authentification
 */
function authHeaders(address) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${address}`
  };
}

/* -------------------------------------------------------------------------- */
/* 1. Récupérer les commandes disponibles à proximité                         */
/* -------------------------------------------------------------------------- */
async function getAvailableOrders(location) {
  try {
    if (!location || !location.lat || !location.lng) {
      throw new Error("Location is required with lat and lng");
    }

    const params = new URLSearchParams({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
    });

    const response = await axios.get(
      `${API_BASE_URL}/deliverers/available?${params}`
    );
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

    const response = await axios.post(
      `${API_BASE_URL}/deliverers/orders/${orderId}/accept`,
      { delivererAddress },
      { headers: authHeaders(delivererAddress) }
    );

    return response.data;
  } catch (error) {
    console.error("Error accepting order:", error);
    throw new Error(`Failed to accept order: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Confirmer le pickup                                                     */
/* -------------------------------------------------------------------------- */
async function confirmPickup(orderId, delivererAddress) {
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (!delivererAddress) throw new Error("Deliverer address is required");

    const response = await axios.post(
      `${API_BASE_URL}/orders/${orderId}/confirm-pickup`,
      { delivererAddress },
      { headers: authHeaders(delivererAddress) }
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

    const response = await axios.post(
      `${API_BASE_URL}/orders/${orderId}/confirm-delivery`,
      { delivererAddress },
      { headers: authHeaders(delivererAddress) }
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
async function updateGPSLocation(orderId, lat, lng) {
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (lat === undefined || lng === undefined) {
      throw new Error("Latitude and longitude are required");
    }

    const response = await axios.post(
      `${API_BASE_URL}/orders/${orderId}/update-gps`,
      { lat, lng },
      { headers: { "Content-Type": "application/json" } }
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

    const response = await axios.get(
      `${API_BASE_URL}/deliverers/${address}/earnings?${params}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching earnings:", error);
    throw new Error(`Failed to get earnings: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 7. Récupérer la note + avis                                                */
/* -------------------------------------------------------------------------- */
async function getRating(address) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await axios.get(
      `${API_BASE_URL}/deliverers/${address}/rating`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching rating:", error);
    throw new Error(`Failed to get rating: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 8. Mettre à jour le statut                                                */
/* -------------------------------------------------------------------------- */
async function updateStatus(address, isOnline) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await axios.put(
      `${API_BASE_URL}/deliverers/${address}/status`,
      { isAvailable: isOnline },
      { headers: authHeaders(address) }
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
    const url = `${API_BASE_URL}/deliverers/${address}/orders${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url);
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

    const response = await axios.get(
      `${API_BASE_URL}/deliverers/${address}/active-delivery`
    );

    return response.data || null;
  } catch (error) {
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

    const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
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

    const response = await axios.post(
      `${API_BASE_URL}/deliverers/register`,
      data,
      { headers: authHeaders(data.address) }
    );

    return response.data;
  } catch (error) {
    console.error("Error registering deliverer:", error);
    throw new Error(`Failed to register deliverer: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 13. Profil livreur                                                        */
/* -------------------------------------------------------------------------- */
async function getDeliverer(address) {
  try {
    if (!address) throw new Error("Address is required");

    const response = await axios.get(`${API_BASE_URL}/deliverers/${address}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching deliverer:", error);
    throw new Error(`Failed to get deliverer: ${error.message}`);
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
