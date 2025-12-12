/**
 * Composant AvailableOrders - Liste des commandes disponibles
 */

import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import geolocation from "../services/geolocation";
import blockchain from "../services/blockchain";
import io from "socket.io-client";
import { formatPrice } from "../utils/formatters";

function AvailableOrders({ limit = null }) {
  const [orders, setOrders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(null); // orderId en cours
  const socketRef = useRef(null);

  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

  /** Au montage : charger GPS + commandes + socket listeners */
  useEffect(() => {
    loadCurrentLocation();
    fetchAvailableOrders();

    const interval = setInterval(fetchAvailableOrders, 10000);

    // Initialiser socket uniquement si pas déjà connecté
    let orderSocketWarning = false;
    let isOrderSocketCleaningUp = false;

    if (!socketRef.current) {
      try {
        socketRef.current = io(SOCKET_URL, {
          transports: ["websocket"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 3,
          timeout: 5000,
          autoConnect: false  // Manual connection control
        });

        socketRef.current.on("connect", () => {
          console.log("[Livreur] ✅ Socket.io connecté - Notifications de commandes activées");
        });

        socketRef.current.on("orderReady", (order) => {
          console.log("[Livreur] 🔔 Nouvelle commande reçue via Socket.io:", {
            orderId: order.orderId,
            restaurant: order.restaurant?.name || 'Restaurant',
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress
          });
          setOrders((prev) => {
            const exists = prev.find(o => o.orderId === order.orderId);
            if (exists) {
              console.log(`[Livreur] ⚠️ Commande #${order.orderId} déjà dans la liste, ignorée`);
              return prev;
            }
            console.log(`[Livreur] ✅ Commande #${order.orderId} ajoutée à la liste (total: ${prev.length + 1})`);
            return [order, ...prev];
          });
          playNotificationSound();
        });

        socketRef.current.on("orderAccepted", ({ orderId }) => {
          setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        });

        socketRef.current.on("connect_error", (error) => {
          if (!orderSocketWarning && !isOrderSocketCleaningUp) {
            console.warn("⚠️ Real-time order notifications unavailable. Orders will refresh every 10s.");
            orderSocketWarning = true;
          }
        });

        // Start connection
        socketRef.current.connect();
      } catch (err) {
        console.warn("Failed to initialize order socket");
      }
    }

    return () => {
      isOrderSocketCleaningUp = true;
      clearInterval(interval);
      if (socketRef.current) {
        try {
          socketRef.current.removeAllListeners();
          if (socketRef.current.connected) {
            socketRef.current.disconnect();
          }
        } catch (err) {
          // Silently ignore cleanup errors
        }
        socketRef.current = null;
      }
    };
  }, []);

  /** Charger position actuelle */
  async function loadCurrentLocation() {
    try {
      const position = await geolocation.getCurrentPosition();
      setCurrentLocation(position);
    } catch (err) {
      console.error("Erreur GPS :", err);
    }
  }

  /** Récupérer commandes disponibles */
  async function fetchAvailableOrders() {
    if (!currentLocation) {
      console.log("[Livreur] ⚠️ Position GPS non disponible, impossible de charger les commandes");
      return;
    }
    setLoading(true);

    try {
      console.log(`[Livreur] 📡 Récupération commandes disponibles depuis API (lat: ${currentLocation.lat}, lng: ${currentLocation.lng})...`);
      const availableOrders = await api.getAvailableOrders(currentLocation);
      console.log(`[Livreur] ✅ ${availableOrders.length} commande(s) disponible(s) reçue(s) de l'API`);

      // Trier par distance
      const sortedOrders = availableOrders.sort((a, b) => {
        const dA = calculateDistance(a.restaurant.location);
        const dB = calculateDistance(b.restaurant.location);
        return dA - dB;
      });

      if (limit) {
        setOrders(sortedOrders.slice(0, limit));
        console.log(`[Livreur] 📋 Affichage des ${limit} premières commandes (triées par distance)`);
      } else {
        setOrders(sortedOrders);
        console.log(`[Livreur] 📋 ${sortedOrders.length} commande(s) affichée(s)`);
      }
    } catch (error) {
      console.error("[Livreur] ❌ Erreur chargement commandes :", error);
    } finally {
      setLoading(false);
    }
  }

  /** Calculer distance en mètres */
  function calculateDistance(restaurantLocation) {
    if (!currentLocation || !restaurantLocation) return Infinity;

    return geolocation.getDistance(
      currentLocation,
      restaurantLocation
    );
  }

  /** Gains = 20% */
  function calculateEarnings(order) {
    const totalAmountNumber = parseFloat(formatPrice(order.totalAmount, 'POL', 5).replace(' POL', ''));
    return totalAmountNumber * 0.2;
  }

  /** Icône couleur selon distance */
  function getDistanceIcon(distanceKm) {
    if (distanceKm < 2) return "🟢";
    if (distanceKm < 5) return "🟠";
    return "🔴";
  }

  /** Accepter une commande */
  async function handleAcceptOrder(orderId) {
    try {
      console.log(`[Livreur] 🚚 Acceptation commande #${orderId}...`);
      const signer = await blockchain.getSigner();
      const address = await signer.getAddress();
      console.log(`[Livreur] 👤 Adresse livreur: ${address}`);

      const isStaked = await blockchain.isStaked(address);
      if (!isStaked) {
        console.log(`[Livreur] ❌ Livreur non staké, impossible d'accepter la commande`);
        alert("Vous devez staker minimum 0.1 POL pour accepter une commande.");
        return;
      }
      console.log(`[Livreur] ✅ Livreur staké, continuation...`);

      setAccepting(orderId);

      // On-chain
      console.log(`[Livreur] ⛓️ Acceptation on-chain commande #${orderId}...`);
      await blockchain.acceptOrderOnChain(orderId);
      console.log(`[Livreur] ✅ Acceptation on-chain réussie pour commande #${orderId}`);

      // Back-end
      console.log(`[Livreur] 📡 Notification backend acceptation commande #${orderId}...`);
      await api.acceptOrder(orderId, address);
      console.log(`[Livreur] ✅ Backend notifié pour commande #${orderId}`);

      // Supprimer de la liste
      setOrders((prev) => {
        const filtered = prev.filter((o) => o.orderId !== orderId);
        console.log(`[Livreur] 📋 Commande #${orderId} retirée de la liste (reste ${filtered.length} commande(s))`);
        return filtered;
      });

      // Redirection
      console.log(`[Livreur] 🔄 Redirection vers page livraison pour commande #${orderId}`);
      window.location.href = `/deliveries?orderId=${orderId}`;
    } catch (err) {
      console.error(`[Livreur] ❌ Erreur acceptation commande #${orderId}:`, err);
      alert("Erreur: " + err.message);
    } finally {
      setAccepting(null);
    }
  }

  /** Notification sonore */
  function playNotificationSound() {
    // Décommenter si tu ajoutes un fichier
    // const audio = new Audio("/notification.mp3");
    // audio.play();
  }

  return (
    <div className="available-orders">
      <h2>Commandes disponibles</h2>

      {loading && <div>Chargement...</div>}

      {!loading && orders.length === 0 && (
        <div>Aucune commande disponible</div>
      )}

      {!loading && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => {
            const distanceMeters = calculateDistance(order.restaurant.location);
            const distanceFormatted = geolocation.formatDistance(distanceMeters);
            const distanceKm = distanceMeters / 1000;

            const earnings = calculateEarnings(order);

            return (
              <div key={order.orderId} className="order-card">
                <div className="restaurant-info">
                  <h3>{order.restaurant.name}</h3>
                  <span className="distance">
                    {getDistanceIcon(distanceKm)} {distanceFormatted}
                  </span>
                </div>

                <div className="order-details">
                  <p>Total: {formatPrice(order.totalAmount, 'POL', 5)}</p>
                  <p className="earnings">
                    Gains estimés: {formatPrice(earnings.toString(), 'POL', 5)}
                  </p>
                </div>

                <button
                  onClick={() => handleAcceptOrder(order.orderId)}
                  disabled={accepting === order.orderId}
                  className="btn-primary"
                >
                  {accepting === order.orderId
                    ? "Acceptation..."
                    : "Accepter"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AvailableOrders;
