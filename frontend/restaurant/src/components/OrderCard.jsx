/**
 * Composant OrderCard - Restaurant
 * @notice Carte individuelle d'une commande
 * @dev Affiche détails commande, items, client, statut, actions
 */

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

// Utils (remplace si tu as déjà)
import { formatAddress } from "../utils/web3";
import { formatPrice, formatDate } from "../utils/formatters";

/**
 * Convertit wei en POL (ether)
 * @param {string|number|bigint} weiValue - Valeur en wei
 * @returns {number} Valeur en POL
 */
function weiToPol(weiValue) {
  try {
    if (!weiValue && weiValue !== 0) return 0;
    const strValue = weiValue.toString();
    // Si c'est une string avec beaucoup de chiffres (>12), c'est en wei
    const isWei = strValue.length > 12 && /^\d+$/.test(strValue);
    if (isWei) {
      return parseFloat(ethers.formatEther(strValue));
    }
    return parseFloat(strValue) || 0;
  } catch {
    return 0;
  }
}

// Gateway IPFS
const IPFS_GATEWAY =
  import.meta.env.VITE_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

/**
 * Composant OrderCard
 * @param {Object} order - Données de la commande
 * @param {(orderId: string|number) => void} onConfirmPreparation
 * @param {(orderId: string|number) => void} onMarkReady - Marquer comme prête
 * @returns {JSX.Element}
 */
function OrderCard({ order, onConfirmPreparation, onMarkReady }) {
  const [elapsedTime, setElapsedTime] = useState("");

  useEffect(() => {
    if (!order?.createdAt) return;

    function updateElapsed() {
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffMin = Math.max(
        0,
        Math.floor((now.getTime() - created.getTime()) / 1000 / 60)
      );

      if (diffMin < 1) setElapsedTime("à l’instant");
      else if (diffMin < 60) setElapsedTime(`${diffMin} min`);
      else {
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        setElapsedTime(`${h}h ${m}m`);
      }
    }

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);
    return () => clearInterval(interval);
  }, [order?.createdAt]);

  function getStatusTone(status) {
    const map = {
      CREATED: "warning",
      PREPARING: "secondary",
      READY: "success",
      IN_DELIVERY: "info",
      DELIVERED: "success",
      DISPUTED: "error",
      CANCELED: "error",
    };
    return map[status] || "neutral";
  }

  const statusText = useMemo(() => {
    const map = {
      CREATED: "Nouvelle",
      PREPARING: "En préparation",
      READY: "Prête",
      IN_DELIVERY: "En livraison",
      DELIVERED: "Livrée",
      DISPUTED: "Litige",
      CANCELED: "Annulée",
    };
    return map[order?.status] || order?.status || "—";
  }, [order?.status]);

  const itemsTotal = useMemo(() => {
    return (order?.items || []).reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
      0
    );
  }, [order?.items]);

  if (!order) return null;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-neutral-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Commande #{order.orderId}
          </span>
          <StatusBadge tone={getStatusTone(order.status)}>
            {statusText}
          </StatusBadge>
        </div>

        <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <span>{formatDate?.(order.createdAt) || ""}</span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-700">
            {elapsedTime}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Items
        </h4>

        <div className="space-y-2">
          {(order.items || []).map((item, index) => {
            const lineTotal =
              Number(item.price || 0) * Number(item.quantity || 0);

            return (
              <div
                key={item._id || `${item.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 p-2 dark:bg-neutral-900/40"
              >
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={`${IPFS_GATEWAY}${item.image}`}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-50">
                      {item.quantity}x {item.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatPrice?.(item.price, 'POL', 5) ?? `${item.price} POL`} / unité
                    </p>
                  </div>
                </div>

                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  {formatPrice?.(lineTotal, 'POL', 5) ?? `${lineTotal} POL`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info client + adresse */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900/40">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Client
          </h4>
          <div className="mt-2 space-y-1 text-sm">
            <p className="font-medium text-neutral-900 dark:text-neutral-50">
              {order.client?.name || "N/A"}
            </p>
            {order.client?.address && (
              <p className="text-neutral-600 dark:text-neutral-300">
                {formatAddress?.(order.client.address) || order.client.address}
              </p>
            )}
            {order.client?.phone && (
              <p className="text-neutral-600 dark:text-neutral-300">
                {order.client.phone}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900/40">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Adresse de livraison
          </h4>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-200">
            {order.deliveryAddress || "—"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Total items:{" "}
          <span className="font-semibold text-neutral-900 dark:text-neutral-50">
            {formatPrice?.(itemsTotal, 'POL', 5) ?? `${itemsTotal} POL`}
          </span>
        </div>

        <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Total:{" "}
          {formatPrice?.(weiToPol(order.totalAmount), 'POL', 5) ?? `${weiToPol(order.totalAmount)} POL`}
        </div>

        {order.status === "CREATED" && onConfirmPreparation && (
          <button
            onClick={() => onConfirmPreparation(order.orderId)}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-orange-600"
          >
            Confirmer préparation
          </button>
        )}

        {order.status === "PREPARING" && onMarkReady && (
          <button
            onClick={() => onMarkReady(order.orderId)}
            className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-green-600"
          >
            ✅ Commande prête
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- UI Bits ---------------- */

function StatusBadge({ tone = "neutral", children }) {
  const styles = {
    warning:
      "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200",
    secondary:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    info:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    success:
      "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200",
    error:
      "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-200",
    neutral:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export default OrderCard;
