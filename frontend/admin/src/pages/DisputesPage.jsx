/**
 * DisputesPage.jsx
 * - Liste des litiges actifs et résolus
 * - Tri : date, gravité, participants
 * - Module DisputeViewer pour résolution
 */

import React, { useState } from "react";
import DisputesTable from "../components/DisputesTable";
import DisputeViewer from "../components/DisputeViewer";
import { getDisputes, getDisputeDetails } from "../services/api";

export default function DisputesPage() {
  const [filter, setFilter] = useState("active"); // active | resolved | all
  const [sort, setSort] = useState("date-desc"); // tri

  const [selectedDispute, setSelectedDispute] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  /* ============================================================
     LOAD DISPUTE DETAILS
     ============================================================ */
  async function openDispute(dispute) {
    setSelectedDispute(dispute);
    setLoadingDetails(true);

    try {
      const res = await getDisputeDetails(dispute.disputeId || dispute.orderId);
      // Le backend retourne { success: true, data: {...} }
      setDetails(res?.data || res);
    } catch (err) {
      console.error("Erreur chargement litige:", err);
      setDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }

  function closeModal() {
    setSelectedDispute(null);
    setDetails(null);
  }

  /* ============================================================
     RENDER PAGE
     ============================================================ */

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Litiges</h1>
        <p className="text-gray-600 mt-1">Gestion des litiges plateforme</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 items-center">

        {/* Status */}
        <select
          className="px-4 py-2 border rounded-lg bg-gray-50"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="active">Actifs</option>
          <option value="resolved">Résolus</option>
          <option value="all">Tous</option>
        </select>

        {/* Tri */}
        <select
          className="px-4 py-2 border rounded-lg bg-gray-50"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="date-desc">Date ↓</option>
          <option value="date-asc">Date ↑</option>
          <option value="severity-desc">Gravité ↓</option>
          <option value="severity-asc">Gravité ↑</option>
          <option value="party">Participants</option>
        </select>
      </div>

      <DisputesTable filter={filter} sort={sort} onSelect={openDispute} />

      {/* Modal viewer */}
      {selectedDispute && (
        <DisputeViewer
          dispute={selectedDispute}
          details={details}
          loading={loadingDetails}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
