import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatCrypto, formatNumber, formatDate } from "../services/formatters";

/**
 * Modal OrderDetailsModal
 * Affiche :
 * - Infos commande
 * - Client, restaurant, livreur
 * - Montants
 * - Statut & logs
 */

export default function OrderDetailsModal({ order, details, loading, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            Commande #{order.id}
          </h2>

          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* LOADING */}
          {loading && (
            <p className="text-center text-gray-500">Chargement des détails…</p>
          )}

          {details && (
            <>
              {/* SECTION INFOS GÉNÉRALES */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Informations générales</h3>

                <p><span className="font-medium">Client :</span> {details.client?.name || "N/A"}</p>
                <p><span className="font-medium">Restaurant :</span> {details.restaurant?.name}</p>
                <p><span className="font-medium">Livreur :</span> {details.deliverer?.name || "Non assigné"}</p>
                <p><span className="font-medium">Créée le :</span> {formatDate(details.createdAt)}</p>
                <p><span className="font-medium">Statut :</span> {details.status}</p>
              </div>

              {/* MONTANTS */}
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Montant Total" value={formatCrypto(details.total)} />
                <Stat label="Commission Plateforme" value={formatCrypto(details.platformFee)} />
                <Stat label="Restaurant Reçu" value={formatCrypto(details.restaurantAmount)} />
              </div>

              {/* ITEMS */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Articles</h3>

                {details.items?.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun article.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {details.items.map((item, i) => (
                      <li key={i} className="border-b pb-1 flex justify-between">
                        <span>{item.name} × {item.qty}</span>
                        <span>{formatCrypto(item.price)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* LOGS */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Historique</h3>

                {details.logs?.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun événement.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {details.logs.map((log, i) => (
                      <li key={i} className="border-b pb-1">
                        <span className="font-medium">{log.type}</span> —{" "}
                        {formatDate(log.timestamp)}  
                        <div className="text-gray-600">{log.message}</div>
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
