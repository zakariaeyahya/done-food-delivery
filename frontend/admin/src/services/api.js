import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function authHeaders(address) {
  return {
    "x-admin-address": address,
    "Content-Type": "application/json",
  };
}

function handleApiError(err) {
  throw err;
}

export async function getUsers(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    if (!address) throw new Error("Admin wallet non connecté");

    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(
      `${API_BASE_URL}/admin/users?${query}`,
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
      `${API_BASE_URL}/admin/users/${userAddress}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getRestaurants(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const query = new URLSearchParams(filters).toString();

    const res = await axios.get(
      `${API_BASE_URL}/admin/restaurants?${query}`,
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
      `${API_BASE_URL}/admin/restaurants/${restaurantAddress}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getDeliverers(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const query = new URLSearchParams(filters).toString();

    const res = await axios.get(
      `${API_BASE_URL}/admin/deliverers?${query}`,
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
      `${API_BASE_URL}/admin/deliverers/${delivererAddress}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getOrders(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const query = new URLSearchParams(filters).toString();

    const res = await axios.get(
      `${API_BASE_URL}/admin/orders?${query}`,
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
      `${API_BASE_URL}/admin/orders/${orderId}`,
      { headers: authHeaders(address) }
    );
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getDisputes(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");
    const query = new URLSearchParams(filters).toString();

    const res = await axios.get(
      `${API_BASE_URL}/admin/disputes?${query}`,
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
      `${API_BASE_URL}/admin/disputes/${disputeId}`,
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

    const body = typeof data === 'object' ? data : { winner: data };

    const res = await axios.post(
      `${API_BASE_URL}/admin/disputes/${disputeId}/resolve`,
      body,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getAnalytics(type, filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");

    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(
      `${API_BASE_URL}/admin/analytics/${type}?${query}`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getTopRestaurants(limit = 10) {
  try {
    const address = localStorage.getItem("adminWalletAddress");

    const res = await axios.get(
      `${API_BASE_URL}/admin/analytics/top-restaurants?limit=${limit}`,
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
      `${API_BASE_URL}/admin/analytics/top-deliverers?limit=${limit}`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getAnalyticsDisputes(filters = {}) {
  try {
    const address = localStorage.getItem("adminWalletAddress");

    const query = new URLSearchParams(filters).toString();

    const res = await axios.get(
      `${API_BASE_URL}/admin/analytics/disputes?${query}`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

export async function getDashboardStats() {
  try {
    const address = localStorage.getItem("adminWalletAddress");

    const res = await axios.get(
      `${API_BASE_URL}/admin/stats`,
      { headers: authHeaders(address) }
    );

    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

