import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

function authHeaders(address) {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer mock_signature_for_testing",
    "x-message": "Sign this message to authenticate with DONE Restaurant",
    "x-wallet-address": address,
  };
}

function handleApiError(error) {
  if (error?.response) {
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      "API Error";
    const status = error.response.status;
    throw new Error(`${status}: ${message}`);
  } else if (error?.request) {
    throw new Error("Network Error: No response from server");
  } else {
    throw new Error(`Request Error: ${error?.message || "Unknown error"}`);
  }
}

async function getRestaurantByAddress(address) {
  try {
    if (!address) return null;

    const response = await axios.get(
      `${API_BASE_URL}/restaurants/by-address/${address}`,
      { headers: authHeaders(address) }
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
    throw error;
  }
}

async function getRestaurant(restaurantId) {
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required");

    const response = await axios.get(
      `${API_BASE_URL}/restaurants/${restaurantId}`
    );
    return response.data?.restaurant || response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function getOrders(restaurantId, filters = {}, restaurantAddress) {
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required");

    const queryParams = new URLSearchParams();
    if (filters.status && filters.status !== "all")
      queryParams.append("status", filters.status);
    if (filters.startDate)
      queryParams.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      queryParams.append("endDate", filters.endDate.toISOString());

    const url = `${API_BASE_URL}/restaurants/${restaurantId}/orders${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: authHeaders(restaurantAddress),
    });

    return response.data?.orders || [];
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function confirmPreparation(orderId, restaurantAddress, payload = {}) {
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (!restaurantAddress) throw new Error("Restaurant address is required");

    const response = await axios.post(
      `${API_BASE_URL}/orders/${orderId}/confirm-preparation`,
      { restaurantAddress, ...payload },
      { headers: authHeaders(restaurantAddress) }
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function markOrderReady(orderId, restaurantAddress) {
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (!restaurantAddress) throw new Error("Restaurant address is required");

    const response = await axios.post(
      `${API_BASE_URL}/orders/${orderId}/mark-ready`,
      { restaurantAddress },
      { headers: authHeaders(restaurantAddress) }
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function updateMenu(restaurantId, menu, restaurantAddress) {
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    if (!Array.isArray(menu)) throw new Error("Menu must be an array");

    const response = await axios.put(
      `${API_BASE_URL}/restaurants/${restaurantId}/menu`,
      { menu },
      { headers: authHeaders(restaurantAddress) }
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function addMenuItem(restaurantId, item, restaurantAddress) {
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    if (!item?.name || !item?.price)
      throw new Error("Item name and price are required");

    const response = await axios.post(
      `${API_BASE_URL}/restaurants/${restaurantId}/menu/item`,
      item,
      { headers: authHeaders(restaurantAddress) }
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function updateMenuItem(
  restaurantId,
  itemId,
  updates,
  restaurantAddress
) {
  try {
    if (!restaurantId || !itemId)
      throw new Error("Restaurant ID and Item ID are required");

    const response = await axios.put(
      `${API_BASE_URL}/restaurants/${restaurantId}/menu/item/${itemId}`,
      updates,
      { headers: authHeaders(restaurantAddress) }
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function deleteMenuItem(restaurantId, itemId, restaurantAddress) {
  try {
    if (!restaurantId || !itemId)
      throw new Error("Restaurant ID and Item ID are required");

    const response = await axios.delete(
      `${API_BASE_URL}/restaurants/${restaurantId}/menu/item/${itemId}`,
      { headers: authHeaders(restaurantAddress) }
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function getAnalytics(restaurantId, params = {}, restaurantAddress) {
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required");

    const queryParams = new URLSearchParams();
    if (params.startDate)
      queryParams.append("startDate", params.startDate.toISOString());
    if (params.endDate)
      queryParams.append("endDate", params.endDate.toISOString());

    const url = `${API_BASE_URL}/restaurants/${restaurantId}/analytics${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: authHeaders(restaurantAddress),
    });

    return response.data?.analytics || { totalOrders: 0, deliveredOrders: 0, totalRevenue: 0 };
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function uploadImage(file) {
  try {
    if (!file) throw new Error("File is required");

    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_BASE_URL}/upload/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function getEarnings(restaurantId, params = {}, restaurantAddress) {
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required");

    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append("period", params.period);
    if (params.startDate)
      queryParams.append("startDate", params.startDate.toISOString());
    if (params.endDate)
      queryParams.append("endDate", params.endDate.toISOString());

    const url = `${API_BASE_URL}/restaurants/${restaurantId}/earnings${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: authHeaders(restaurantAddress),
    });

    const earningsData = response.data?.earnings || {};
    return {
      pending: earningsData.pending ?? earningsData.pendingBalance ?? 0,
      pendingBalance: earningsData.pendingBalance ?? earningsData.pending ?? 0,
      daily: earningsData.daily ?? [],
      weekly: earningsData.weekly ?? [],
      withdrawn: earningsData.withdrawn ?? 0,
      transactions: earningsData.transactions ?? []
    };
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

async function withdrawEarnings(restaurantId, restaurantAddress) {
  try {
    if (!restaurantId || !restaurantAddress)
      throw new Error("Restaurant ID and address are required");

    const response = await axios.post(
      `${API_BASE_URL}/restaurants/${restaurantId}/withdraw`,
      { restaurantAddress },
      { headers: authHeaders(restaurantAddress) }
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export {
  getRestaurantByAddress,
  getRestaurant,
  getOrders,
  confirmPreparation,
  markOrderReady,
  updateMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAnalytics,
  uploadImage,
  getEarnings,
  withdrawEarnings,
};
