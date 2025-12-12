import React, { useEffect, useState } from "react";
import {
  formatAddress,
  formatCrypto,
  formatDate,
  weiToPol,
} from "../services/formatters";

import { getOrders } from "../services/api";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

/* ============================================================
   ORDERS TABLE
   ============================================================ */

export default function OrdersTable({ filters, onViewDetails }) {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [loading, setLoading] = useState(false);

  /* ============================================================
     DEBOUNCE
     ============================================================ */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ============================================================
     LOAD ORDERS WITH FILTERS
     ============================================================ */
  async function loadOrders() {
    try {
      setLoading(true);

      const res = await getOrders({
        search: debouncedSearch,
        page,
        limit,
        sortField,
        sortOrder,

        // Filtres provenant de OrdersPage.jsx
        status: filters?.status,
        dateFrom: filters?.dateFrom,
        dateTo: filters?.dateTo,
        restaurant: filters?.restaurant,
        deliverer: filters?.deliverer,
      });

      setOrders(res?.data || []);
      setTotal(res?.total || 0);
    } catch (err) {
      console.error("Erreur fetch commandes:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [debouncedSearch, page, sortField, sortOrder, filters]);

  /* ============================================================
     SORTING
     ============================================================ */
  function toggleSort(field) {
    if (sortField === field)
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  const totalPages = Math.ceil(total / limit);

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="bg-white shadow rounded-xl p-6 border">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Commandes</h2>

        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-2 top-2 text-gray-400" />
          <input
            placeholder="Rechercher commande..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 bg-gray-50"
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

              <Th label="ID" />

              <Th label="Client" />

              <Th label="Restaurant" />

              <Th label="Livreur" />

              <Th
                label="Total"
                sortable
                active={sortField === "total"}
                order={sortOrder}
                onClick={() => toggleSort("total")}
              />

              <Th
                label="Statut"
                sortable
                active={sortField === "status"}
                order={sortOrder}
                onClick={() => toggleSort("status")}
              />

              <Th
                label="Date"
                sortable
                active={sortField === "date"}
                order={sortOrder}
                onClick={() => toggleSort("date")}
              />

              <Th label="Actions" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">
                  Chargement...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6">
                  Aucune commande trouvée
                </td>
              </tr>
            ) : (
              orders.map((o, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">

                  <td className="p-3 font-medium text-gray-700">
                    #{o.orderId}
                  </td>

                  <td className="p-3">
                    <div className="text-sm font-semibold">
                      {o.clientName || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatAddress(o.client)}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="text-sm font-semibold">
                      {o.restaurantName || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatAddress(o.restaurant)}
                    </div>
                  </td>

                  <td className="p-3">
                    {o.deliverer ? (
                      <>
                        <div className="text-sm font-semibold">
                          {o.delivererName || "Livreur"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatAddress(o.deliverer)}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400">Aucun livreur</span>
                    )}
                  </td>

                  <td className="p-3 text-gray-800">
                    {formatCrypto(weiToPol(o.total), "POL", 3)}
                  </td>

                  <td className="p-3">
                    <OrderStatusBadge status={o.status} />
                  </td>

                  <td className="p-3 text-gray-700">
                    {formatDate(o.createdAt)}
                  </td>

                  <td className="p-3">
                    <button
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      onClick={() => onViewDetails(o)}
                    >
                      Voir
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
}

/* ============================================================
   ORDER STATUS BADGE
   ============================================================ */
function OrderStatusBadge({ status }) {
  const colors = {
    CREATED: "bg-gray-200 text-gray-700",
    PREPARING: "bg-yellow-200 text-yellow-700",
    IN_DELIVERY: "bg-blue-200 text-blue-700",
    DELIVERED: "bg-green-200 text-green-700",
    DISPUTED: "bg-red-200 text-red-700",
    CANCELLED: "bg-gray-300 text-gray-700",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full font-semibold ${
        colors[status] || "bg-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

/* ============================================================
   TABLE HEADER (Th)
   ============================================================ */
function Th({ label, sortable, active, order, onClick }) {
  return (
    <th
      onClick={sortable ? onClick : undefined}
      className={`p-3 text-left cursor-pointer select-none ${
        sortable ? "hover:text-indigo-600" : ""
      }`}
    >
      <div className="flex items-center gap-1 font-semibold text-gray-700">
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
function Pagination({ page, setPage, totalPages }) {
  return (
    <div className="flex justify-between items-center mt-4">
      <span className="text-gray-600">
        Page {page} / {totalPages}
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          className="px-3 py-1 bg-gray-100 rounded"
        >
          Précédent
        </button>

        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
