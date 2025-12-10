import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatCrypto, formatNumber, formatDate } from "../services/formatters";

export default function UserDetailsModal({ user, details, loading, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Détails utilisateur</h2>
          <button className="p-1 hover:bg-gray-200 rounded" onClick={onClose}>
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <p className="text-center text-gray-500">Chargement…</p>
          )}

          {details && (
            <>
              {/* INFO */}
              <div className="p-4 bg-gray-50 rounded border">
                <h3 className="font-semibold mb-2">Informations</h3>
                <p><strong>Nom :</strong> {user.name}</p>
                <p><strong>Adresse :</strong> {user.address}</p>
                <p><strong>Email :</strong> {user.email || "—"}</p>
              </div>

              {/* KPI */}
              <div className="grid grid-cols-3 gap-4">
                <Kpi label="Commandes" value={formatNumber(details.totalOrders)} />
                <Kpi label="Dépenses" value={formatCrypto(details.totalSpent)} />
                <Kpi label="Dernière activité" value={formatDate(details.lastActivity)} />
              </div>

              {/* HISTORIQUE */}
              <div className="p-4 bg-white border rounded">
                <h3 className="font-semibold mb-2">Historique commandes</h3>
                
                {details.orders?.length === 0 ? (
                  <p className="text-gray-500">Aucune commande.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {details.orders.map((o, i) => (
                      <li key={i} className="border-b pb-1">
                        <strong>#{o.orderId}</strong> — {formatCrypto(o.total)} — {formatDate(o.date)} — {o.status}
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

function Kpi({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded border text-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-semibold text-lg">{value}</div>
    </div>
  );
}
