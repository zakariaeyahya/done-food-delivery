import { useEffect, useMemo, useState } from "react";
import OrderCard from "./OrderCard";

import * as api from "../services/api";
import * as blockchain from "../services/blockchain";
import { useSocket } from "../contexts/SocketContext";

// Composant FilterChip pour les filtres
function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? "bg-orange-500 text-white shadow-md"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}

function OrdersQueue({
  restaurantId,
  restaurantAddress,
  filter = "all",
  onFilterChange,
  showSuccess,
  showError,
  showNotification,
}) {
  const socket = useSocket();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtre interne (support contrôlé/non contrôlé)
  const [internalFilter, setInternalFilter] = useState(filter);
  useEffect(() => setInternalFilter(filter), [filter]);
  const currentFilter = onFilterChange ? filter : internalFilter;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [preparationTime, setPreparationTime] = useState(30); // minutes

  // Charger commandes initiales
  useEffect(() => {
    if (restaurantId) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, restaurantAddress, currentFilter]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !restaurantId) return;

    // join room restaurant
    socket.emit("joinRoom", `restaurant_${restaurantId}`);

    const onOrderCreated = (order) => {
      if (!order || order.restaurantId !== restaurantId) return;

      setOrders((prev) => {
        // éviter doublons
        if (prev.some((o) => o.orderId === order.orderId)) return prev;
        return [order, ...prev];
      });

      playNotificationSound();
      showNotification?.(`Nouvelle commande #${order.orderId}`);
    };

    const onStatusUpdate = (data) => {
      if (!data?.orderId) return;
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === data.orderId ? { ...o, status: data.status } : o
        )
      );
    };

    const onDelivererAssigned = (data) => {
      if (!data?.orderId) return;
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === data.orderId
            ? { ...o, deliverer: data.deliverer, status: "IN_DELIVERY" }
            : o
        )
      );
    };

    socket.on("orderCreated", onOrderCreated);
    socket.on("orderStatusUpdate", onStatusUpdate);
    socket.on("delivererAssigned", onDelivererAssigned);

    return () => {
      socket.off("orderCreated", onOrderCreated);
      socket.off("orderStatusUpdate", onStatusUpdate);
      socket.off("delivererAssigned", onDelivererAssigned);
    };
  }, [socket, restaurantId, showNotification]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const filters = currentFilter !== "all" ? { status: currentFilter } : {};
      const ordersData = await api.getOrders(
        restaurantId,
        filters,
        restaurantAddress
      );

      // tri: plus récentes en haut
      const sorted = [...(ordersData || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sorted);
    } catch (e) {
      showError?.("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmPreparation(orderId) {
    try {
      setLoading(true);

      // 1) D'ABORD confirmer on-chain (blockchain = source de vérité)
      const hasBlockchainConfig = import.meta.env.VITE_ORDER_MANAGER_ADDRESS &&
                                   import.meta.env.VITE_ORDER_MANAGER_ADDRESS !== '0x0000000000000000000000000000000000000000';

      if (hasBlockchainConfig) {
        console.log('🔗 Confirmation blockchain en cours...');
        await blockchain.connectWallet();
        await blockchain.confirmPreparationOnChain(orderId);
        console.log('✅ Blockchain confirmPreparation OK');
      }

      // 2) ENSUITE synchroniser avec le backend (MongoDB)
      await api.confirmPreparation(orderId, restaurantAddress, {
        preparationTime,
      });
      console.log('✅ API backend synchronisé');

      // 3) update local optimiste
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId
            ? { ...o, status: "PREPARING", preparationTime }
            : o
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

  async function handleMarkReady(orderId) {
    try {
      setLoading(true);

      // 1) Mettre à jour via API backend
      await api.markOrderReady(orderId, restaurantAddress);

      // 2) Update local optimiste
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId
            ? { ...o, status: "READY" }
            : o
        )
      );

      showSuccess?.("Commande marquée comme prête !");
      showNotification?.(`Commande #${orderId} prête - En attente d'un livreur`);
    } catch (e) {
      showError?.(`Erreur: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function playNotificationSound() {
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
    } catch (e) {
      // silencieux si fichier absent
    }
  }

  const filteredOrders = useMemo(() => {
    if (currentFilter === "all") return orders;
    return orders.filter((o) => o.status === currentFilter);
  }, [orders, currentFilter]);

  function handleFilterChange(next) {
    if (onFilterChange) onFilterChange(next);
    else setInternalFilter(next);
  }

  const counts = useMemo(() => {
    const c = {
      all: orders.length,
      CREATED: 0,
      PREPARING: 0,
      READY: 0,
      IN_DELIVERY: 0,
    };
    orders.forEach((o) => {
      if (c[o.status] != null) c[o.status] += 1;
    });
    return c;
  }, [orders]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-neutral-900 dark:text-neutral-50">
            Commandes en temps réel
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Nouvelles commandes, préparation et livraison
          </p>
        </div>

        {/* Preparation time setting */}
        <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900/40">
          <label className="text-sm text-neutral-600 dark:text-neutral-300">
            Temps prep.
          </label>
          <input
            type="number"
            min="5"
            max="180"
            value={preparationTime}
            onChange={(e) => setPreparationTime(Number(e.target.value || 0))}
            className="w-20 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:border-neutral-700 dark:bg-neutral-800"
          />
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            min
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={currentFilter === "all"}
          onClick={() => handleFilterChange("all")}
        >
          Toutes ({counts.all})
        </FilterChip>
        <FilterChip
          active={currentFilter === "CREATED"}
          onClick={() => handleFilterChange("CREATED")}
        >
          Nouvelles ({counts.CREATED})
        </FilterChip>
        <FilterChip
          active={currentFilter === "PREPARING"}
          onClick={() => handleFilterChange("PREPARING")}
        >
          Préparation ({counts.PREPARING})
        </FilterChip>
        <FilterChip
          active={currentFilter === "READY"}
          onClick={() => handleFilterChange("READY")}
        >
          Prêtes ({counts.READY})
        </FilterChip>
        <FilterChip
          active={currentFilter === "IN_DELIVERY"}
          onClick={() => handleFilterChange("IN_DELIVERY")}
        >
          Livraison ({counts.IN_DELIVERY})
        </FilterChip>
      </div>

      {/* Content */}
      {loading && (
        <div className="grid place-items-center rounded-2xl bg-white p-10 shadow-soft dark:bg-neutral-800">
          <div className="animate-pulse text-neutral-500 dark:text-neutral-300">
            Chargement...
          </div>
        </div>
      )}

      {!loading && filteredOrders.length === 0 && (
        <div className="grid place-items-center rounded-2xl bg-white p-10 text-sm text-neutral-500 shadow-soft dark:bg-neutral-800 dark:text-neutral-300">
          Aucune commande pour ce filtre.
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
                onMarkReady={handleMarkReady}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersQueue;
