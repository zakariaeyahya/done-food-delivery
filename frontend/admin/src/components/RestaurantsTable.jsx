import React, { useEffect, useState } from "react";
import {
  formatCompactNumber,
  formatCrypto,
} from "../services/formatters";

import { getRestaurants } from "../services/api";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

/* ============================================================
   RENDER STAR RATING
   ============================================================ */
function StarRating({ rating }) {
  const stars = [];
  const rounded = Math.round(rating || 0);

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`${
          i <= rounded ? "text-yellow-400" : "text-gray-300"
        } text-lg`}
      >
        ★
      </span>
    );
  }

  return <div className="flex">{stars}</div>;
}

/* ============================================================
   TABLE PRINCIPALE
   ============================================================ */

export default function RestaurantsTable() {
  const [restaurants, setRestaurants] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortField, setSortField] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");

  const [loading, setLoading] = useState(false);

  /* ============================================================
     DEBOUNCE SEARCH INPUT
     ============================================================ */
  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  /* ============================================================
     FETCH RESTAURANTS
     ============================================================ */
  async function loadRestaurants() {
    try {
      setLoading(true);

      const res = await getRestaurants({
        search: debouncedSearch,
        page,
        limit,
        sortField,
        sortOrder,
      });

      setRestaurants(res.restaurants || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Erreur restaurants:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRestaurants();
  }, [debouncedSearch, page, sortField, sortOrder]);

  /* ============================================================
     GESTION TRI
     ============================================================ */
  function toggleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  /* ============================================================
     RENDU
     ============================================================ */

  return (
    <div className="bg-white shadow rounded-xl p-6 border">

      {/* HEADER + SEARCH */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Restaurants</h2>

        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-2 top-2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un restaurant..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 bg-gray-50 focus:bg-white focus:ring-indigo-400 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <Th label="Nom" />

              <Th
                label="Cuisine"
                sortable
                onClick={() => toggleSort("cuisine")}
                active={sortField === "cuisine"}
                order={sortOrder}
              />

              <Th
                label="Commandes Totales"
                sortable
                onClick={() => toggleSort("totalOrders")}
                active={sortField === "totalOrders"}
                order={sortOrder}
              />

              <Th
                label="Revenu Total"
                sortable
                onClick={() => toggleSort("revenue")}
                active={sortField === "revenue"}
                order={sortOrder}
              />

              <Th
                label="Note Moyenne"
                sortable
                onClick={() => toggleSort("rating")}
                active={sortField === "rating"}
                order={sortOrder}
              />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : restaurants.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Aucun restaurant trouvé.
                </td>
              </tr>
            ) : (
              restaurants.map((resto, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-800">
                    {resto.name}
                  </td>

                  <td className="p-3 text-gray-700">
                    {resto.cuisine || "—"}
                  </td>

                  <td className="p-3 text-gray-800">
                    {formatCompactNumber(resto.totalOrders)}
                  </td>

                  <td className="p-3 text-gray-800">
                    {formatCrypto(resto.revenue, "MATIC", 3)}
                  </td>

                  <td className="p-3 text-gray-800">
                    <StarRating rating={resto.rating} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination
        page={page}
        setPage={setPage}
        total={total}
        limit={limit}
      />
    </div>
  );
}

/* ============================================================
   COMPOSANT <Th />
   ============================================================ */

function Th({ label, sortable, active, order, onClick }) {
  return (
    <th
      className={`p-3 text-left font-semibold text-gray-700 ${
        sortable ? "cursor-pointer select-none" : ""
      }`}
      onClick={sortable ? onClick : undefined}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortable && (
          <span className="text-xs">
            {active ? (order === "asc" ? "▲" : "▼") : "◇"}
          </span>
        )}
      </div>
    </th>
  );
}

/* ============================================================
   PAGINATION
   ============================================================ */

function Pagination({ page, setPage, total, limit }) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex justify-between items-center mt-4">
      <span className="text-gray-600 text-sm">
        Page {page} / {totalPages || 1}
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Précédent
        </button>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
