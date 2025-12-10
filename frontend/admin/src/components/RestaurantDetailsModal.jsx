import React from "react";
import { formatCrypto, formatCompactNumber } from "../services/formatters";

export default function RestaurantDetailsModal({
  restaurant,
  details,
  loading,
  onClose,
}) {
  if (!restaurant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] rounded-xl shadow-lg p-6 relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* HEADER */}
        <h2 className="text-2xl font-bold mb-2">{restaurant.name}</h2>
        <p className="text-gray-600">{restaurant.cuisine}</p>

        <div className="mt-4 border-t pt-4">

          {loading ? (
            <p className="text-center py-6 text-gray-500">Chargement...</p>
          ) : !details ? (
            <p className="text-center py-6 text-gray-500">
              Impossible de charger les détails.
            </p>
          ) : (
            <>
              {/* INFO GRID */}
              <div className="grid grid-cols-2 gap-4 mb-4">

                <Info label="Revenu total" value={formatCrypto(details.totalRevenue)} />
                <Info label="Nombre de commandes" value={formatCompactNumber(details.totalOrders)} />

                <Info label="Note moyenne" value={details.rating || "—"} />
                <Info label="Performances" value={details.performanceScore || "—"} />

              </div>

              {/* COMMANDES */}
              <h3 className="text-lg font-semibold mt-6 mb-2">Commandes récentes</h3>

              <div className="max-h-60 overflow-y-auto border rounded-lg">
                {details.recentOrders?.length === 0 ? (
                  <p className="text-gray-500 p-4 text-center">Aucune commande.</p>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <Th label="ID" />
                        <Th label="Client" />
                        <Th label="Total" />
                        <Th label="Statut" />
                      </tr>
                    </thead>
                    <tbody>
                      {details.recentOrders?.map((order, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="p-2">#{order.orderId}</td>
                          <td className="p-2">{order.customerName}</td>
                          <td className="p-2">{formatCrypto(order.total)}</td>
                          <td className="p-2">{order.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="p-3 border rounded-lg">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function Th({ label }) {
  return (
    <th className="p-2 text-left font-medium text-gray-700">{label}</th>
  );
}
