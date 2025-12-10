import React, { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getDisputes } from "../services/api";
import { formatDate } from "../services/formatters";

/**
 * DisputesTable.jsx
 * Liste :
 * - ID litige
 * - Commande liée
 * - Participants
 * - Statut
 * - Date
 */

export default function DisputesTable({ onSelect }) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function loadDisputes() {
    try {
      setLoading(true);
      const res = await getDisputes({
        search: debouncedSearch || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });
      setDisputes(res || []);
    } catch (err) {
      console.error("Erreur chargement litiges:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadDisputes();
  }, [debouncedSearch, filterStatus]);

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Litiges</h2>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-2 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher litige..."
              className="pl-10 pr-4 py-2 border rounded-lg w-64 bg-gray-50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <select
            className="px-3 py-2 border rounded-lg bg-gray-100"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="resolved">Résolus</option>
            <option value="rejected">Rejetés</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <Th label="Litige #" />
              <Th label="Commande #" />
              <Th label="Client" />
              <Th label="Restaurant" />
              <Th label="Livreur" />
              <Th label="Statut" />
              <Th label="Date" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  Chargement…
                </td>
              </tr>
            ) : disputes.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  Aucun litige trouvé.
                </td>
              </tr>
            ) : (
              disputes.map((d, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect && onSelect(d)}
                >
                  <td className="p-3 font-medium">{d.id}</td>
                  <td className="p-3">{d.orderId}</td>
                  <td className="p-3">{d.client?.name || "N/A"}</td>
                  <td className="p-3">{d.restaurant?.name || "N/A"}</td>
                  <td className="p-3">{d.deliverer?.name || "N/A"}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        d.status === "pending"
                          ? "bg-yellow-500"
                          : d.status === "resolved"
                          ? "bg-green-600"
                          : "bg-gray-500"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>

                  <td className="p-3">{formatDate(d.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ label }) {
  return (
    <th className="p-3 text-left font-semibold text-gray-700">{label}</th>
  );
}
