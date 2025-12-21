/**
 * OrdersPage.jsx
 * - Affiche toutes les commandes
 * - Filtres : statut, date, restaurant, livreur
 * - Modal détaillé pour chaque commande
 */

import React, { useState } from "react";
import OrdersTable from "../components/OrdersTable";
import OrderDetailsModal from "../components/OrderDetailsModal";
import { getOrderDetails } from "../services/api";

export default function OrdersPage() {
  const [filters, setFilters] = useState({
    status: "all",
    dateFrom: "",
    dateTo: "",
    restaurant: "",
    deliverer: "",
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  /* ============================================================
     LOAD ORDER DETAILS
     ============================================================ */
  async function openOrderModal(order) {
    setSelectedOrder(order);
    setLoadingDetails(true);

    try {
      const res = await getOrderDetails(order.orderId);
      setDetails(res);
    } catch (err) {
    } finally {
      setLoadingDetails(false);
    }
  }

  function closeModal() {
    setSelectedOrder(null);
    setDetails(null);
  }

  /* ============================================================
     RENDER PAGE
     ============================================================ */

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold">Commandes</h1>
        <p className="text-gray-600 mt-1">Liste complète des commandes</p>
      </div>

      {/* FILTRES */}
      <div className="flex flex-wrap items-center gap-4">

        {/* Statut */}
        <select
          className="px-4 py-2 border rounded-lg bg-gray-50"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">Tous statuts</option>
          <option value="CREATED">Créées</option>
          <option value="PREPARING">En préparation</option>
          <option value="IN_DELIVERY">En livraison</option>
          <option value="DELIVERED">Livrées</option>
          <option value="DISPUTED">En litige</option>
          <option value="CANCELLED">Annulées</option>
        </select>

        {/* Dates */}
        <input
          type="date"
          className="px-4 py-2 border rounded-lg bg-gray-50"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
        />

        <input
          type="date"
          className="px-4 py-2 border rounded-lg bg-gray-50"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
        />

        {/* Restaurant */}
        <input
          type="text"
          placeholder="Restaurant..."
          className="px-4 py-2 border rounded-lg bg-gray-50"
          value={filters.restaurant}
          onChange={(e) =>
            setFilters({ ...filters, restaurant: e.target.value })
          }
        />

        {/* Livreur */}
        <input
          type="text"
          placeholder="Livreur..."
          className="px-4 py-2 border rounded-lg bg-gray-50"
          value={filters.deliverer}
          onChange={(e) =>
            setFilters({ ...filters, deliverer: e.target.value })
          }
        />
      </div>

      {/* TABLE DES COMMANDES */}
      <OrdersTable filters={filters} onViewDetails={openOrderModal} />

      {/* MODAL DETAILS COMMANDE */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          details={details}
          loading={loadingDetails}
          onClose={closeModal}
        />
      )}

    </div>
  );
}
