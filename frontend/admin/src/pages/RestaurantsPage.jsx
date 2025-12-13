/**
 * RestaurantsPage.jsx
 * Gestion de tous les restaurants
 * - Tableau complet
 * - Recherche / filtre cuisine
 * - Détails restaurant dans un modal
 */

import React, { useState } from "react";
import RestaurantsTable from "../components/RestaurantsTable";
import RestaurantDetailsModal from "../components/RestaurantDetailsModal";
import { getRestaurantDetails } from "../services/api";

export default function RestaurantsPage() {
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  /* ============================================================
     LOAD DETAILS FOR MODAL
     ============================================================ */
  async function openRestaurantModal(restaurant) {
    setSelectedRestaurant(restaurant);
    setLoadingDetails(true);

    try {
      const res = await getRestaurantDetails(restaurant.address);
      setDetails(res);
    } catch (err) {
      console.error("Erreur details restaurant:", err);
    } finally {
      setLoadingDetails(false);
    }
  }

  function closeModal() {
    setSelectedRestaurant(null);
    setDetails(null);
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <p className="text-gray-600 mt-1">
          Gestion des établissements inscrits sur la plateforme.
        </p>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex items-center gap-4">

        {/* Recherche */}
        <input
          type="text"
          placeholder="Rechercher un restaurant..."
          className="px-4 py-2 border rounded-lg w-72 bg-gray-50 focus:ring-orange-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filtre cuisine */}
        <select
          className="px-4 py-2 border rounded-lg bg-gray-50 focus:ring-orange-500"
          value={cuisineFilter}
          onChange={(e) => setCuisineFilter(e.target.value)}
        >
          <option value="all">Toutes cuisines</option>
          <option value="Italian">Italienne</option>
          <option value="Chinese">Chinoise</option>
          <option value="Japanese">Japonaise</option>
          <option value="Indian">Indienne</option>
          <option value="Mexican">Mexicaine</option>
          <option value="French">Française</option>
          <option value="Other">Autre</option>
        </select>
      </div>

      {/* RESTAURANTS TABLE */}
      <RestaurantsTable
        search={search}
        cuisineFilter={cuisineFilter}
        onRestaurantClick={openRestaurantModal}
      />

      {/* DETAILS MODAL */}
      {selectedRestaurant && (
        <RestaurantDetailsModal
          restaurant={selectedRestaurant}
          details={details}
          loading={loadingDetails}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
