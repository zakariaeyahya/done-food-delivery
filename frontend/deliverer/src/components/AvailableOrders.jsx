
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

  useEffect(() => {
    loadCurrentLocation();
    fetchAvailableOrders();

    const interval = setInterval(fetchAvailableOrders, 10000);

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
        });

        socketRef.current.on("orderReady", (order) => {
            orderId: order.orderId,
            restaurant: order.restaurant?.name || 'Restaurant',
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress
          });
          setOrders((prev) => {
            const exists = prev.find(o => o.orderId === order.orderId);
            if (exists) {
              return prev;
            }
            return [order, ...prev];
          });
          playNotificationSound();
        });

        socketRef.current.on("orderAccepted", ({ orderId }) => {
          setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        });

        socketRef.current.on("connect_error", (error) => {
          if (!orderSocketWarning && !isOrderSocketCleaningUp) {
            orderSocketWarning = true;
          }
        });

        socketRef.current.connect();
      } catch (err) {
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
        }
        socketRef.current = null;
      }
    };
  }, []);

  async function loadCurrentLocation() {
    try {
      const position = await geolocation.getCurrentPosition();
      setCurrentLocation(position);
    } catch (err) {
    }
  }

  async function fetchAvailableOrders() {
    if (!currentLocation) {
      return;
    }
    setLoading(true);

    try {
      const availableOrders = await api.getAvailableOrders(currentLocation);

      const sortedOrders = availableOrders.sort((a, b) => {
        const dA = calculateDistance(a.restaurant.location);
        const dB = calculateDistance(b.restaurant.location);
        return dA - dB;
      });

      if (limit) {
        setOrders(sortedOrders.slice(0, limit));
      } else {
        setOrders(sortedOrders);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  function calculateDistance(restaurantLocation) {
    if (!currentLocation || !restaurantLocation) return Infinity;

    return geolocation.getDistance(
      currentLocation,
      restaurantLocation
    );
  }

  function calculateEarnings(order) {
    const totalAmountNumber = parseFloat(formatPrice(order.totalAmount, 'POL', 5).replace(' POL', ''));
    return totalAmountNumber * 0.2;
  }

  function getDistanceIcon(distanceKm) {
    if (distanceKm < 2) return "🟢";
    if (distanceKm < 5) return "🟠";
    return "🔴";
  }

  async function handleAcceptOrder(orderId) {
    try {
      const signer = await blockchain.getSigner();
      const address = await signer.getAddress();

      const isStaked = await blockchain.isStaked(address);
      if (!isStaked) {
        alert("Vous devez staker minimum 0.1 POL pour accepter une commande.");
        return;
      }

      setAccepting(orderId);

      await blockchain.acceptOrderOnChain(orderId);

      await api.acceptOrder(orderId, address);

      setOrders((prev) => {
        const filtered = prev.filter((o) => o.orderId !== orderId);
        return filtered;
      });

      window.location.href = `/deliveries?orderId=${orderId}`;
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setAccepting(null);
    }
  }

  function playNotificationSound() {
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
