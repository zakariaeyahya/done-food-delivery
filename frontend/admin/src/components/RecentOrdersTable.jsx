import React, { useEffect, useState } from "react";
import { getOrders } from "../services/api";
import { formatCrypto, formatDate } from "../services/formatters";

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRecentOrders() {
    try {
      setLoading(true);

      const res = await getOrders({
        limit: 10,
        page: 1,
        sortField: "date",
        sortOrder: "desc",
      });

      setOrders(res.orders || []);
    } catch (err) {
      console.error("Erreur chargement commandes récentes:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecentOrders();
  }, []);

  return (
    <div className="bg-white border rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Dernières commandes</h3>

      {loading ? (
        <p className="text-gray-500 text-center py-6">Chargement…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-6">Aucune commande.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <Th label="ID" />
                <Th label="Client" />
                <Th label="Restaurant" />
                <Th label="Total" />
                <Th label="Statut" />
                <Th label="Date" />
              </tr>
            </thead>

            <tbody>
              {orders.map((o, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">#{o.orderId}</td>
                  <td className="p-3">{o.customerName || "—"}</td>
                  <td className="p-3">{o.restaurantName || "—"}</td>
                  <td className="p-3">{formatCrypto(o.total)}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3">{formatDate(o.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ label }) {
  return (
    <th className="p-3 text-left font-semibold text-gray-700">{label}</th>
  );
}
