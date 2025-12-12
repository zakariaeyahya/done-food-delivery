/**
 * API Service – Admin Dashboard DONE
 * Tous les appels API centralisés ici
 */

import axios from "axios";

// ============================================
// BASE URL depuis .env
// ============================================
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// ============================================
// GESTION AUTH – adresse admin (MetaMask)
// ============================================
export function authHeaders(address) {
  return {
    "x-admin-address": address,
    "Content-Type": "application/json",
  };
}

// ============================================
// ERREURS UNIFORMES
// ============================================
function handleApiError(err) {
  console.error("API Error:", err?.response?.data || err.message);
  throw err;
}

// ============================================
// 1. UTILISATEURS
// ============================================
export async function getUsers(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    if (!address) throw new Error("Admin wallet non connecté");

    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(
      `${API_BASE_URL}/api/admin/users?${query}`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getUserDetails(userAddress) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const res = await axios.get(
      `${API_BASE_URL}/api/admin/users/${userAddress}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

// ============================================
// 2. RESTAURANTS
// ============================================
export async function getRestaurants(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const query = new URLSearchParams(filters).toString();

    const res = await axios.get(
      `${API_BASE_URL}/api/admin/restaurants?${query}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getRestaurantDetails(restaurantAddress) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const res = await axios.get(
      `${API_BASE_URL}/api/admin/restaurants/${restaurantAddress}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

// ============================================
// 3. LIVREURS
// ============================================
export async function getDeliverers(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const query = new URLSearchParams(filters).toString();

    const res = await axios.get(
      `${API_BASE_URL}/api/admin/deliverers?${query}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getDelivererDetails(delivererAddress) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const res = await axios.get(
      `${API_BASE_URL}/api/admin/deliverers/${delivererAddress}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

// ============================================
// 4. COMMANDES
// ============================================
export async function getOrders(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const query = new URLSearchParams(filters).toString();

    const res = await axios.get(
      `${API_BASE_URL}/api/admin/orders?${query}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getOrderDetails(orderId) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const res = await axios.get(
      `${API_BASE_URL}/api/admin/orders/${orderId}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

// ============================================
// 5. LITIGES (DISPUTES)
// ============================================
export async function getDisputes(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const query = new URLSearchParams(filters).toString();

    const res = await axios.get(
      `${API_BASE_URL}/api/admin/disputes?${query}`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getDisputeDetails(disputeId) {
  try {
    const address = localStorage.getItem("adminWalletAddress");

    const res = await axios.get(
      `${API_BASE_URL}/api/admin/disputes/${disputeId}`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function resolveDispute(disputeId, data) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    
    // data peut être un objet { winner, reason } ou juste winner (string)
    const body = typeof data === 'object' ? data : { winner: data };

    const res = await axios.post(
      `${API_BASE_URL}/api/admin/disputes/${disputeId}/resolve`,
      body,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

// ============================================
// 6. ANALYTICS & GRAPHIQUES
// ============================================
export async function getAnalytics(type, filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");

    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(
      `${API_BASE_URL}/api/admin/analytics/${type}?${query}`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

// ============================================
// 7. TOP RESTAURANTS & TOP DELIVERERS
// ============================================

export async function getTopRestaurants(limit = 10) {
  try {
    const address = localStorage.getItem("adminWalletAddress");

    const res = await axios.get(
      `${API_BASE_URL}/api/admin/analytics/top-restaurants?limit=${limit}`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getTopDeliverers(limit = 10) {
  try {
    const address = localStorage.getItem("adminWalletAddress");

    const res = await axios.get(
      `${API_BASE_URL}/api/admin/analytics/top-deliverers?limit=${limit}`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

// ============================================
// 8. ANALYTICS — HISTOGRAMME DES LITIGES
// ============================================

export async function getAnalyticsDisputes(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");

    const query = new URLSearchParams(filters).toString();

    const res = await axios.get(
      `${API_BASE_URL}/api/admin/analytics/disputes?${query}`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

// ============================================
// 9. DASHBOARD STATS (Stats globales)
// ============================================

export async function getDashboardStats() {
  try {
    const address = localStorage.getItem("adminWalletAddress");

    const res = await axios.get(
      `${API_BASE_URL}/api/admin/stats`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

