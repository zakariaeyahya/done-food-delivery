/**
 * Service API Backend - Restaurant
 * @notice Gère tous les appels HTTP vers l'API backend Node.js/Express pour les restaurants
 * @dev Utilise axios pour les requêtes HTTP avec gestion d'erreurs
 */

import axios from "axios";

/**
 * Configuration de base
 * @dev Récupère l'URL de l'API depuis les variables d'environnement
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * Fonction helper pour créer les headers d'authentification
 * @param {string} address - Adresse wallet du restaurant
 * @returns {Object} Headers avec Authorization Bearer token
 */
function authHeaders(address) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${address}`,
  };
}

/**
 * Fonction helper pour gérer les erreurs API
 * @param {Error} error - Erreur de la requête
 * @throws {Error} Erreur avec message formaté
 */
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

/**
 * 0. (Bonus) Récupérer un restaurant par adresse wallet
 * Route: GET /api/restaurants/by-address/:address
 * @returns {Object|null} Restaurant data or null if not found
 */
async function getRestaurantByAddress(address) {
  try {
    if (!address) return null;

    const response = await axios.get(
      `${API_BASE_URL}/restaurants/by-address/${address}`,
      { headers: authHeaders(address) }
    );
    return response.data;
  } catch (error) {
    // 404 = restaurant non enregistré, retourner null silencieusement
    if (error?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
    throw error;
  }
}

/**
 * 1. Récupérer les détails complets d'un restaurant avec son menu
 * Route: GET /api/restaurants/:id
 */
async function getRestaurant(restaurantId) {
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required");

    const response = await axios.get(
      `${API_BASE_URL}/restaurants/${restaurantId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

/**
 * 2. Récupérer les commandes d'un restaurant avec filtres optionnels
 * Route: GET /api/restaurants/:id/orders?status=...&startDate=...&endDate=...
 */
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

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

/**
 * 3. Confirmer la préparation d'une commande
 * Route: POST /api/orders/:id/confirm-preparation
 */
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

/**
 * 4. Mettre à jour le menu complet du restaurant
 * Route: PUT /api/restaurants/:id/menu
 */
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

/**
 * 5. Ajouter un nouvel item au menu
 * Route: POST /api/restaurants/:id/menu/item
 */
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

/**
 * 6. Modifier un item existant du menu
 * Route: PUT /api/restaurants/:id/menu/item/:itemId
 */
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

/**
 * 7. Supprimer un item du menu
 * Route: DELETE /api/restaurants/:id/menu/item/:itemId
 */
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

/**
 * 8. Récupérer les statistiques/analytics du restaurant
 * Route: GET /api/restaurants/:id/analytics?startDate=...&endDate=...
 */
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

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

/**
 * 9. Upload une image vers IPFS via le backend
 * Route: POST /api/upload/image
 */
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

/**
 * 10. Récupérer les revenus on-chain du restaurant
 * Route: GET /api/restaurants/:id/earnings?period=...&startDate=...&endDate=...
 */
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

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

/**
 * 11. Retirer les fonds du PaymentSplitter vers le wallet restaurant
 * Route: POST /api/restaurants/:id/withdraw
 */
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

/**
 * Export des fonctions
 */
export {
  getRestaurantByAddress,
  getRestaurant,
  getOrders,
  confirmPreparation,
  updateMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAnalytics,
  uploadImage,
  getEarnings,
  withdrawEarnings,
};
