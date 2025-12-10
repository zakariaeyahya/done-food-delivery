import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatCrypto, formatNumber, formatDate } from "../services/formatters";

export default function UserDetailsModal({ user, details, loading, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            Utilisateur — {user.name || "Inconnu"}
          </h2>

          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {loading && <p className="text-center text-gray-500">Chargement…</p>}

          {details && (
            <>
              {/* INFO GÉNÉRALES */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Informations principales</h3>
                <p><span className="font-medium">Adresse :</span> {user.address}</p>
                <p><span className="font-medium">Email :</span> {user.email || "—"}</p>
                <p><span className="font-medium">Téléphone :</span> {details.phone || "—"}</p>
                <p><span className="font-medium">Statut :</span> {details.status}</p>
              </div>

              {/* KPI */}
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Commandes totales" value={formatNumber(details.totalOrders)} />
                <Stat label="Dépenses totales" value={formatCrypto(details.totalSpent)} />
                <Stat label="Dernière activité" value={formatDate(details.lastActivity)} />
              </div>

              {/* HISTORIQUE COMMANDES */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Historique des commandes</h3>

                {details.orders?.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucune commande.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {details.orders.map((o, i) => (
                      <li key={i} className="border-b pb-1">
                        <span className="font-medium">#{o.orderId}</span> —{" "}
                        {formatCrypto(o.total)} —{" "}
                        {formatDate(o.date)} —{" "}
                        <span className="text-gray-600">{o.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 text-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
