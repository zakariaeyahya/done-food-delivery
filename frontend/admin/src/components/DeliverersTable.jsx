import React, { useEffect, useState } from "react";
import {
  formatAddress,
  formatCrypto,
  formatCompactNumber,
  weiToPol,
} from "../services/formatters";

import { getDeliverers } from "../services/api";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

/* ============================================================
   STAR RATING
   ============================================================ */
function Stars({ rating }) {
  const r = Math.round(rating || 0);
  return (
    <div className="flex">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= r ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   DELIVERERS TABLE
   ============================================================ */
export default function DeliverersTable() {
  const [deliverers, setDeliverers] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortField, setSortField] = useState("totalDeliveries");
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
     LOAD DELIVERERS
     ============================================================ */
  async function loadDeliverers() {
    try {
      setLoading(true);
      const res = await getDeliverers({
        search: debouncedSearch,
        page,
        limit,
        sortField,
        sortOrder,
      });

      setDeliverers(res?.data || []);
      setTotal(res?.total || 0);
    } catch (err) {
      console.error("Erreur livreurs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeliverers();
  }, [debouncedSearch, page, sortField, sortOrder]);

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
        <h2 className="text-xl font-semibold">Livreurs</h2>

        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-2 top-2 text-gray-400" />
          <input
            placeholder="Rechercher livreur..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 bg-gray-50 focus:ring-indigo-500"
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
              <Th label="Identité" />
              <Th
                label="Staking"
                sortable
                active={sortField === "stakedAmount"}
                order={sortOrder}
                onClick={() => toggleSort("stakedAmount")}
              />
              <Th
                label="Livraisons"
                sortable
                active={sortField === "totalDeliveries"}
                order={sortOrder}
                onClick={() => toggleSort("totalDeliveries")}
              />
              <Th
                label="Revenu Total"
                sortable
                active={sortField === "earnings"}
                order={sortOrder}
                onClick={() => toggleSort("earnings")}
              />
              <Th
                label="Rating"
                sortable
                active={sortField === "rating"}
                order={sortOrder}
                onClick={() => toggleSort("rating")}
              />
              <Th label="Slashing" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6">Chargement...</td>
              </tr>
            ) : deliverers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6">Aucun livreur trouvé</td>
              </tr>
            ) : (
              deliverers.map((d, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-semibold">{d.name || "—"}</div>
                    <div className="text-sm text-gray-500">
                      {formatAddress(d.address)}
                    </div>
                  </td>

                  <td className="p-3">
                    {d.stakedAmount > 0 ? (
                      <span className="text-green-700 font-medium">
                        {formatCrypto(weiToPol(d.stakedAmount), "POL", 3)}
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Non staké
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-gray-800">
                    {formatCompactNumber(d.totalDeliveries)}
                  </td>

                  <td className="p-3 text-gray-800">
                    {formatCrypto(weiToPol(d.earnings), "POL", 3)}
                  </td>

                  <td className="p-3">
                    <Stars rating={d.rating} />
                  </td>

                  <td className="p-3">
                    {d.slashingCount > 0 ? (
                      <span className="text-red-600 font-bold">
                        {d.slashingCount} ⚠️
                      </span>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
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
        totalPages={totalPages}
      />
    </div>
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
