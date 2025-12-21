import React, { useEffect, useState } from "react";
import { getOrders, getOrderDetails } from "../services/api";
import { formatCrypto, formatDate, weiToPol } from "../services/formatters";
import OrderDetailsModal from "./OrderDetailsModal";

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // État pour le modal de détails
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  async function loadRecentOrders() {
    try {
      setLoading(true);

      const res = await getOrders({
        limit: 10,
        page: 1,
        sortField: "date",
        sortOrder: "desc",
      });

      // Le backend retourne: { success, data: [...], pagination }
      setOrders(res?.data || res?.orders || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  // Ouvrir le modal avec les détails de la commande
  async function handleViewOrder(order) {
    setSelectedOrder(order);
    setLoadingDetails(true);

    try {
      const res = await getOrderDetails(order.orderId);
      setOrderDetails(res?.data || res);
    } catch (err) {
      // En cas d'erreur, utiliser les données de base de la commande
      setOrderDetails(order);
    } finally {
      setLoadingDetails(false);
    }
  }

  // Fermer le modal
  function handleCloseModal() {
    setSelectedOrder(null);
    setOrderDetails(null);
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
                <Th label="Actions" />
              </tr>
            </thead>

            <tbody>
              {orders.map((o, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">#{o.orderId}</td>
                  <td className="p-3">{o.client?.name || o.customerName || "—"}</td>
                  <td className="p-3">{o.restaurant?.name || o.restaurantName || "—"}</td>
                  <td className="p-3">{formatCrypto(weiToPol(o.totalAmount || o.total || 0))}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      o.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                      o.status === "DISPUTED" ? "bg-red-100 text-red-800" :
                      o.status === "IN_DELIVERY" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3">{formatDate(o.createdAt || o.date)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleViewOrder(o)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium transition-colors"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal détails commande */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          details={orderDetails}
          loading={loadingDetails}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

function Th({ label }) {
  return (
    <th className="p-3 text-left font-semibold text-gray-700">{label}</th>
  );
}
