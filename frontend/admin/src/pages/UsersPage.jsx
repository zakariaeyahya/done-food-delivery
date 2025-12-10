/**
 * UsersPage.jsx
 * Page de gestion des utilisateurs
 * - Recherche
 * - Filtres activité
 * - Tableau utilisateurs
 * - Modal de détails utilisateur
 */

import React, { useState, useEffect } from "react";
import UsersTable from "../components/UsersTable";
import UserDetailsModal from "../components/UserDetailsModal";
import { getUsers, getUserDetails } from "../services/api";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  /* ============================================================
     FETCH DETAILS FOR MODAL
     ============================================================ */
  async function loadUserDetails(address) {
    try {
      setLoadingDetails(true);
      const data = await getUserDetails(address);
      setDetails(data);
    } catch (err) {
      console.error("Erreur détails utilisateur:", err);
    } finally {
      setLoadingDetails(false);
    }
  }

  function openUserModal(user) {
    setSelectedUser(user);
    loadUserDetails(user.address);
  }

  function closeModal() {
    setSelectedUser(null);
    setDetails(null);
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-gray-600 mt-1">
          Liste complète des clients utilisant la plateforme.
        </p>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex items-center gap-4">

        {/* Recherche */}
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="px-4 py-2 border rounded-lg w-72 bg-gray-50 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filtre activité */}
        <select
          className="px-4 py-2 border rounded-lg bg-gray-50 focus:ring-indigo-500"
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
        >
          <option value="all">Tous les utilisateurs</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>

      {/* USERS TABLE */}
      <UsersTable
        search={search}
        activityFilter={activityFilter}
        onUserClick={openUserModal}
      />

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          details={details}
          loading={loadingDetails}
          onClose={closeModal}
        />
      )}

    </div>
  );
}
