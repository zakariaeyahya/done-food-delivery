/**
 * DeliverersPage.jsx
 * Page de gestion des livreurs
 * - Liste complète
 * - Filtres stakés / actifs / suspendus
 * - Détails livreur dans un modal
 */

import React, { useState } from "react";
import DeliverersTable from "../components/DeliverersTable";
import DelivererDetailsModal from "../components/DelivererDetailsModal";
import { getDelivererDetails } from "../services/api";

export default function DeliverersPage() {
  const [filters, setFilters] = useState({
    staked: "all",
    status: "all",
  });

  const [selectedDeliverer, setSelectedDeliverer] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  /* ============================================================
     LOAD DETAILS FOR MODAL
     ============================================================ */
  async function openDelivererModal(deliverer) {
    setSelectedDeliverer(deliverer);
    setLoadingDetails(true);

    try {
      const res = await getDelivererDetails(deliverer.address);
      setDetails(res);
    } catch (err) {
    } finally {
      setLoadingDetails(false);
    }
  }

  function closeModal() {
    setSelectedDeliverer(null);
    setDetails(null);
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Livreurs</h1>
        <p className="text-gray-600 mt-1">
          Gestion des livreurs, staking, performances et slashing éventuels.
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-4">

        {/* Filtre staked */}
        <select
          className="px-4 py-2 border rounded-lg bg-gray-50"
          value={filters.staked}
          onChange={(e) =>
            setFilters({ ...filters, staked: e.target.value })
          }
        >
          <option value="all">Tous</option>
          <option value="yes">Stakés</option>
          <option value="no">Non stakés</option>
        </select>

        {/* Filtre statut */}
        <select
          className="px-4 py-2 border rounded-lg bg-gray-50"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="all">Tous statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Suspendus</option>
        </select>

      </div>

      {/* TABLE DES LIVREURS */}
      <DeliverersTable
        filters={filters}
        onViewDetails={openDelivererModal}
      />

      {/* MODAL DÉTAIL LIVREUR */}
      {selectedDeliverer && (
        <DelivererDetailsModal
          deliverer={selectedDeliverer}
          details={details}
          loading={loadingDetails}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
