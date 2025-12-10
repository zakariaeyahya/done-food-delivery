import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatCrypto, formatNumber, formatDate } from "../services/formatters";

export default function DelivererDetailsModal({
  deliverer,
  details,
  loading,
  onClose,
}) {
  if (!deliverer) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            Livreurs — {deliverer.name || "Non renseigné"}
          </h2>

          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* LOADING */}
          {loading && <p className="text-center text-gray-500">Chargement…</p>}

          {details && (
            <>
              {/* INFO GÉNÉRALES */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Informations principales</h3>
                <p><span className="font-medium">Adresse :</span> {deliverer.address}</p>
                <p><span className="font-medium">Véhicule :</span> {deliverer.vehicle}</p>
                <p><span className="font-medium">Statut :</span> {deliverer.status}</p>
              </div>

              {/* KPI */}
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Livraisons totales" value={formatNumber(details.totalDeliveries)} />
                <Stat label="Revenus totaux" value={formatCrypto(details.totalEarnings)} />
                <Stat label="Rating" value={details.rating?.toFixed(2) + " ★"} />
              </div>

              {/* STAKING */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Staking</h3>

                <p>
                  <span className="font-medium">Montant staké :</span>{" "}
                  {formatCrypto(details.stakedAmount)}
                </p>

                <p>
                  <span className="font-medium">Statut :</span>{" "}
                  {details.isStaked ? "Staké" : "Non staké"}
                </p>

                {/* Slashing */}
                {details.slashing > 0 && (
                  <p className="text-red-600 font-semibold mt-2">
                    ⚠ Slashing : {formatCrypto(details.slashing)}
                  </p>
                )}
              </div>

              {/* HISTORIQUE DES LIVRAISONS */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Historique des livraisons</h3>

                {details.deliveries?.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucune livraison.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {details.deliveries.map((d, i) => (
                      <li key={i} className="border-b pb-1">
                        <span className="font-medium">#{d.orderId}</span> —{" "}
                        {formatCrypto(d.earning)} —{" "}
                        {formatDate(d.date)} —{" "}
                        <span className="text-gray-600">{d.status}</span>
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
