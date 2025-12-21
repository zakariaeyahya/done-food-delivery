import React, { useEffect, useState } from "react";
import {
  formatAddress,
  formatCrypto,
  formatDateTime,
  formatCompactNumber,
  weiToPol,
} from "../services/formatters";

import { getUsers } from "../services/api";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

/* ============================================================
   COMPOSANT USERS TABLE
   ============================================================ */

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortField, setSortField] = useState("totalSpent");
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

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
     FETCH USERS
     ============================================================ */
  async function loadUsers() {
    try {
      setLoading(true);
      const res = await getUsers({
        search: debouncedSearch,
        page,
        limit,
        sortField,
        sortOrder,
      });

      setUsers(res?.data || []);
      setTotal(res?.total || 0);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [debouncedSearch, page, sortField, sortOrder]);

  /* ============================================================
     FONCTION POUR CHANGER LE TRI
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
     RENDU DU TABLEAU
     ============================================================ */
  return (
    <div className="bg-white shadow rounded-xl p-6 border">

      {/* HEADER + SEARCH */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Liste des utilisateurs</h2>

        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-2 top-2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
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
                label="Adresse"
                sortable
                onClick={() => toggleSort("address")}
                active={sortField === "address"}
                order={sortOrder}
              />
              <Th label="Email" />
              <Th
                label="Commandes"
                sortable
                onClick={() => toggleSort("totalOrders")}
                active={sortField === "totalOrders"}
                order={sortOrder}
              />
              <Th
                label="Total Dépensé"
                sortable
                onClick={() => toggleSort("totalSpent")}
                active={sortField === "totalSpent"}
                order={sortOrder}
              />
              <Th
                label="Dernière Activité"
                sortable
                onClick={() => toggleSort("lastActivity")}
                active={sortField === "lastActivity"}
                order={sortOrder}
              />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-800">
                    {user.name || "—"}
                  </td>

                  <td className="p-3 text-gray-700">
                    {formatAddress(user.address)}
                  </td>

                  <td className="p-3 text-gray-700">
                    {user.email || "—"}
                  </td>

                  <td className="p-3 text-gray-800">
                    {formatCompactNumber(user.totalOrders)}
                  </td>

                  <td className="p-3 text-gray-800">
                    {formatCrypto(weiToPol(user.totalSpent), "POL", 3)}
                  </td>

                  <td className="p-3 text-gray-600">
                    {user.lastActivity
                      ? formatDateTime(user.lastActivity)
                      : "—"}
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
   COMPOSANT TH (HEADER)
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
