
import { useEffect, useMemo, useState } from "react";
import OrderCard from "../components/OrderCard";

import * as api from "../services/api";
import * as blockchain from "../services/blockchain";
import { useWallet } from "../contexts/WalletContext"; // adapte chemin/nom si besoin

function OrdersPage({ showSuccess, showError, showNotification }) {
  const { restaurant, address, isConnected } = useWallet();

  const restaurantId = restaurant?._id;
  const restaurantAddress = restaurant?.address || address;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState({
    status: "all",
    startDate: null,
    endDate: null,
  });

  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Charger commandes à chaque changement de filtre
  useEffect(() => {
    if (restaurantId && restaurantAddress) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, restaurantAddress, filter.status, filter.startDate, filter.endDate]);

  async function fetchOrders() {
    try {
      setLoading(true);

      const payload = {
        ...(filter.status !== "all" ? { status: filter.status } : {}),
        ...(filter.startDate ? { startDate: filter.startDate } : {}),
        ...(filter.endDate ? { endDate: filter.endDate } : {}),
      };

      const data = await api.getOrders(
        restaurantId,
        payload,
        restaurantAddress
      );

      const sorted = [...(data || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sorted);
    } catch (e) {
      showError?.("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  }

  // Action: confirmer préparation (si commandes CREATED)
  async function handleConfirmPreparation(orderId) {
    try {
      setLoading(true);

      // Confirmer via l'API (le backend gère le mode mock automatiquement)
      const apiResponse = await api.confirmPreparation(orderId, restaurantAddress);
      
      // En mode développement ou si les contrats ne sont pas configurés, 
      // on peut ignorer l'appel blockchain car le backend gère déjà le mode mock
      const isDevMode = !import.meta.env.VITE_ORDER_MANAGER_ADDRESS || 
                        import.meta.env.VITE_ORDER_MANAGER_ADDRESS === '0x0000000000000000000000000000000000000000' ||
                        import.meta.env.MODE === 'development';
      
      if (!isDevMode) {
        // En production, vérifier que le wallet est connecté avant d'appeler la blockchain
        if (!isConnected || !address) {
          // Essayer de reconnecter le wallet
          try {
            await blockchain.connectWallet();
          } catch (connectError) {
            // Continuer quand même car l'API a déjà confirmé
          }
        }
        
        // Appeler la blockchain seulement si le wallet est connecté
        try {
          await blockchain.confirmPreparationOnChain(orderId);
        } catch (blockchainError) {
          // Ne pas échouer complètement si l'API a réussi
        }
      } else {
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: "PREPARING" } : o
        )
      );

      showSuccess?.("Préparation confirmée avec succès");
      showNotification?.(`Commande #${orderId} en préparation`);
    } catch (e) {
      showError?.(`Erreur: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((o) => {
      const idMatch = String(o.orderId ?? "").includes(q);
      const nameMatch = String(o.client?.name ?? "")
        .toLowerCase()
        .includes(q);
      return idMatch || nameMatch;
    });
  }, [orders, search]);

  const counts = useMemo(() => {
    const c = {
      all: orders.length,
      CREATED: 0,
      PREPARING: 0,
      IN_DELIVERY: 0,
      DELIVERED: 0,
      DISPUTED: 0,
    };
    orders.forEach((o) => {
      if (c[o.status] != null) c[o.status] += 1;
    });
    return c;
  }, [orders]);

  function setStatus(next) {
    setFilter((p) => ({ ...p, status: next }));
  }

  function setDateField(field, value) {
    setFilter((p) => ({
      ...p,
      [field]: value ? new Date(value) : null,
    }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-neutral-900 dark:text-neutral-50">
            Gestion des commandes
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Consulte, filtre et traite toutes les commandes
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={!restaurantId || loading}
          className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700 shadow-soft transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
        >
          {loading ? "Actualisation..." : "Actualiser"}
        </button>
      </div>

      {/* Alerte si pas connecté */}
      {!restaurantId && (
        <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4 text-warning-800 dark:border-warning-900 dark:bg-warning-900/20 dark:text-warning-200">
          Connecte ton wallet restaurant pour voir les commandes.
        </div>
      )}

      {restaurantId && (
        <>
          {/* Filters bar */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-soft dark:bg-neutral-800 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search */}
              <input
                type="text"
                placeholder="Rechercher par #commande ou client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:border-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-50"
              />

              {/* Status select */}
              <select
                value={filter.status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:border-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-50 sm:w-56"
              >
                <option value="all">Toutes ({counts.all})</option>
                <option value="CREATED">Nouvelles ({counts.CREATED})</option>
                <option value="PREPARING">Préparation ({counts.PREPARING})</option>
                <option value="IN_DELIVERY">Livraison ({counts.IN_DELIVERY})</option>
                <option value="DELIVERED">Livrées ({counts.DELIVERED})</option>
                <option value="DISPUTED">Litiges ({counts.DISPUTED})</option>
              </select>
            </div>

            {/* Date range */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-500 dark:text-neutral-400">
                  Du
                </label>
                <input
                  type="date"
                  onChange={(e) => setDateField("startDate", e.target.value)}
                  className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900/30"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-500 dark:text-neutral-400">
                  Au
                </label>
                <input
                  type="date"
                  onChange={(e) => setDateField("endDate", e.target.value)}
                  className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900/30"
                />
              </div>

              {(filter.startDate || filter.endDate) && (
                <button
                  onClick={() =>
                    setFilter((p) => ({
                      ...p,
                      startDate: null,
                      endDate: null,
                    }))
                  }
                  className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600"
                >
                  Reset dates
                </button>
              )}
            </div>
          </div>

          {/* List */}
          {loading && (
            <div className="grid place-items-center rounded-2xl bg-white p-10 shadow-soft dark:bg-neutral-800">
              <div className="animate-pulse text-neutral-500 dark:text-neutral-300">
                Chargement...
              </div>
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="grid place-items-center rounded-2xl bg-white p-10 text-sm text-neutral-500 shadow-soft dark:bg-neutral-800 dark:text-neutral-300">
              Aucune commande ne correspond aux filtres.
            </div>
          )}

          {!loading && filteredOrders.length > 0 && (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.orderId}
                  onClick={() => setSelectedOrder(order)}
                  className={[
                    "transition",
                    selectedOrder?.orderId === order.orderId
                      ? "ring-2 ring-orange-200 dark:ring-orange-900/60 rounded-2xl"
                      : "",
                  ].join(" ")}
                >
                  <OrderCard
                    order={order}
                    onConfirmPreparation={handleConfirmPreparation}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrdersPage;
