import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatCrypto, formatDate, weiToPol, formatAddress } from "../services/formatters";

/**
 * Modal OrderDetailsModal
 * Affiche :
 * - Infos commande
 * - Client, restaurant, livreur
 * - Montants
 * - Statut & logs
 * - Avis client
 */

// Configuration des statuts (même format que client)
const statusConfig = {
  CREATED: { label: 'Créée', color: 'bg-blue-100 text-blue-700', icon: '📝' },
  PREPARING: { label: 'En préparation', color: 'bg-yellow-100 text-yellow-700', icon: '👨‍🍳' },
  READY: { label: 'Prête', color: 'bg-purple-100 text-purple-700', icon: '✅' },
  IN_DELIVERY: { label: 'En livraison', color: 'bg-orange-100 text-orange-700', icon: '🚴' },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-700', icon: '✓' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: '✕' },
  DISPUTED: { label: 'En litige', color: 'bg-red-100 text-red-700', icon: '⚠️' },
};

export default function OrderDetailsModal({ order, details, loading, onClose }) {
  if (!order) return null;

  // Utiliser details si disponible, sinon order
  const data = details || order;
  const statusInfo = statusConfig[data?.status] || { label: data?.status || 'Inconnu', color: 'bg-gray-100 text-gray-700', icon: '?' };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              {statusInfo.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Commande #{order.orderId || order.id}
              </h2>
              <p className="text-indigo-100 text-sm">
                {data?.restaurant?.name || data?.restaurantName || 'Restaurant'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">

          {/* LOADING */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="ml-4 text-gray-500">Chargement des détails...</span>
            </div>
          )}

          {!loading && data && (
            <>
              {/* STATUT + DATE */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${statusInfo.color}`}>
                  <span>{statusInfo.icon}</span>
                  {statusInfo.label}
                </span>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Créée le:</span> {formatDate(data.createdAt)}
                </div>
              </div>

              {/* RÉSUMÉ RAPIDE */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Articles</p>
                  <p className="font-semibold text-gray-800">{data.items?.length || 0} article{(data.items?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Paiement</p>
                  <p className="font-semibold text-gray-800">{data.paymentMethod || 'Crypto (POL)'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">TX Hash</p>
                  <p className="font-semibold text-gray-800 text-xs truncate" title={data.txHash}>
                    {data.txHash ? `${data.txHash.slice(0, 10)}...` : 'N/A'}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-indigo-600">Total</p>
                  <p className="font-bold text-indigo-700">{formatCrypto(weiToPol(data.totalAmount || data.total), "POL", 6)}</p>
                </div>
              </div>

              {/* SECTION ACTEURS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Client */}
                <div className="border rounded-xl p-4 bg-gray-50 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">👤</span>
                    Client
                  </h4>
                  <p className="font-medium text-gray-900">{data.client?.name || "N/A"}</p>
                  {data.client?.address && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">{formatAddress(data.client.address)}</p>
                  )}
                  {data.client?.phone && (
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                      <span>📞</span> {data.client.phone}
                    </p>
                  )}
                  {data.client?.email && (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <span>✉️</span> {data.client.email}
                    </p>
                  )}
                </div>

                {/* Restaurant */}
                <div className="border rounded-xl p-4 bg-gray-50 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">🍽️</span>
                    Restaurant
                  </h4>
                  <p className="font-medium text-gray-900">{data.restaurant?.name || "N/A"}</p>
                  {data.restaurant?.address && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">{formatAddress(data.restaurant.address)}</p>
                  )}
                  {data.restaurant?.cuisine && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">{data.restaurant.cuisine}</span>
                    </p>
                  )}
                </div>

                {/* Livreur */}
                <div className="border rounded-xl p-4 bg-gray-50 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">🚴</span>
                    Livreur
                  </h4>
                  {data.deliverer ? (
                    <>
                      <p className="font-medium text-gray-900">{data.deliverer.name || "Livreur"}</p>
                      {data.deliverer.address && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">{formatAddress(data.deliverer.address)}</p>
                      )}
                      {data.deliverer.vehicleType && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{data.deliverer.vehicleType}</span>
                        </p>
                      )}
                      {data.deliverer.phone && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <span>📞</span> {data.deliverer.phone}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400 italic">Non assigné</p>
                  )}
                </div>
              </div>

              {/* Adresse de livraison */}
              {data.deliveryAddress && (
                <div className="border rounded-xl p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">📍</span>
                    Adresse de livraison
                  </h4>
                  <p className="text-gray-800 ml-10">{data.deliveryAddress}</p>
                </div>
              )}

              {/* MONTANTS DÉTAILLÉS */}
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">💰</span>
                  Répartition des montants
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat
                    label="Total"
                    value={formatCrypto(weiToPol(data.totalAmount || data.total), "POL", 6)}
                    highlight
                  />
                  <Stat
                    label="Plateforme (10%)"
                    value={formatCrypto(weiToPol(data.platformFee), "POL", 6)}
                    color="purple"
                  />
                  <Stat
                    label="Restaurant (70%)"
                    value={formatCrypto(weiToPol(data.restaurantAmount), "POL", 6)}
                    color="orange"
                  />
                  <Stat
                    label="Livreur (20%)"
                    value={formatCrypto(weiToPol(data.delivererAmount), "POL", 6)}
                    color="green"
                  />
                </div>
              </div>

              {/* ITEMS */}
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">🛒</span>
                  Articles commandés ({data.items?.length || 0})
                </h3>

                {!data.items || data.items.length === 0 ? (
                  <p className="text-gray-500 text-sm italic ml-10">Aucun article dans cette commande.</p>
                ) : (
                  <div className="space-y-2 ml-10">
                    {data.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-bold min-w-[40px] text-center">
                            {item.quantity || item.qty || 1}x
                          </span>
                          <span className="font-medium text-gray-800">{item.name}</span>
                        </div>
                        <span className="font-semibold text-gray-700">{formatCrypto(weiToPol(item.price), "POL", 6)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AVIS CLIENT */}
              {data.review && (
                <div className="border rounded-xl p-4 bg-yellow-50 border-yellow-200">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">⭐</span>
                    Avis du client
                  </h3>
                  <div className="ml-10">
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={data.review.rating} />
                      <span className="text-sm text-gray-600">({data.review.rating}/5)</span>
                    </div>
                    {data.review.comment && (
                      <p className="text-gray-700 italic">"{data.review.comment}"</p>
                    )}
                    {data.review.createdAt && (
                      <p className="text-xs text-gray-500 mt-2">Posté le {formatDate(data.review.createdAt)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* LOGS / HISTORIQUE */}
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">📜</span>
                  Historique des événements
                </h3>

                {!data.logs || data.logs.length === 0 ? (
                  <p className="text-gray-500 text-sm italic ml-10">Aucun événement enregistré.</p>
                ) : (
                  <div className="ml-10 space-y-0">
                    {data.logs.map((log, i) => (
                      <div key={i} className="flex items-start gap-3 relative pb-4">
                        {/* Ligne verticale */}
                        {i < data.logs.length - 1 && (
                          <div className="absolute left-[7px] top-4 w-0.5 h-full bg-gray-200"></div>
                        )}
                        <div className="w-4 h-4 bg-indigo-500 rounded-full mt-1 flex-shrink-0 z-10"></div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-800">{log.type || log.status}</span>
                            <span className="text-gray-400 text-xs">
                              {formatDate(log.timestamp || log.date)}
                            </span>
                          </div>
                          {log.message && (
                            <p className="text-gray-600 text-sm mt-1">{log.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant StarRating
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Stat({ label, value, highlight, color }) {
  const colorClasses = {
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    green: "bg-green-50 border-green-200 text-green-700",
  };

  const baseClass = highlight
    ? "bg-indigo-50 border-indigo-200"
    : color
      ? colorClasses[color]
      : "bg-gray-50 border-gray-200";

  const valueClass = highlight
    ? "text-indigo-700"
    : color
      ? colorClasses[color]?.split(' ')[2] || "text-gray-900"
      : "text-gray-900";

  return (
    <div className={`p-3 border rounded-lg text-center ${baseClass}`}>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`text-sm font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

