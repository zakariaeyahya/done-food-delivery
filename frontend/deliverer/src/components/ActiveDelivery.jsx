
import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import blockchain from "../services/blockchain";
import geolocation from "../services/geolocation";
import NavigationMap from "./NavigationMap";
import { formatPrice } from "../utils/formatters";

function ActiveDelivery({ order }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [step, setStep] = useState("pickup"); // "pickup" ou "delivery"
  const [isNearRestaurant, setIsNearRestaurant] = useState(false);
  const [isNearClient, setIsNearClient] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);

  const watchIdRef = useRef(null);

  useEffect(() => {
    loadCurrentLocation();

    if (order && order.status === "IN_DELIVERY") {
      startGPSTracking();
      setStep("delivery");
    }

    return () => stopGPSTracking();
  }, [order]);

  useEffect(() => {
    if (!currentLocation || !order) return;

    const interval = setInterval(() => {
      checkProximity();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentLocation, order, step]);

  async function loadCurrentLocation() {
    try {
      const position = await geolocation.getCurrentPosition();
      setCurrentLocation(position);
    } catch (error) {
    }
  }

  function checkProximity() {
    if (!currentLocation || !order) return;

    if (step === "pickup") {
      const nearRestaurant = geolocation.isNearLocation(
        currentLocation,
        order.restaurant.location,
        100
      );
      setIsNearRestaurant(nearRestaurant);
    }

    if (step === "delivery") {
      const nearClient = geolocation.isNearLocation(
        currentLocation,
        order.deliveryAddress,
        100
      );
      setIsNearClient(nearClient);
    }
  }

  function startGPSTracking() {
    if (tracking) return;

    setTracking(true);

    watchIdRef.current = geolocation.watchPosition(async (pos) => {
      setCurrentLocation(pos);

      if (order) {
        api.updateGPSLocation(order.orderId, {
          lat: pos.lat,
          lng: pos.lng,
        });
      }
    });
  }

  function stopGPSTracking() {
    setTracking(false);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }

  async function handleConfirmPickup() {
    if (!isNearRestaurant) {
      alert("Vous devez être à moins de 100m du restaurant.");
      return;
    }

    setLoading(true);
    try {
      const signer = await blockchain.getSigner();
      const address = await signer.getAddress();

      await blockchain.confirmPickupOnChain(order.orderId);
      await api.confirmPickup(order.orderId, address);

      setStep("delivery");
      startGPSTracking();

      alert("Pickup confirmé. GPS activé.");
    } catch (error) {
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelivery() {
    if (!isNearClient) {
      alert("Vous devez être à moins de 100m du client.");
      return;
    }

    setLoading(true);
    try {
      const signer = await blockchain.getSigner();
      const address = await signer.getAddress();

      const { earnings } = await blockchain.confirmDeliveryOnChain(order.orderId);
      await api.confirmDelivery(order.orderId, address);

      stopGPSTracking();

      alert(`Livraison confirmée ! Vous gagnez ${earnings} POL`);
      window.location.href = "/";
    } catch (error) {
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function getDistance(targetLocation) {
    if (!currentLocation || !targetLocation) return null;

    const meters = geolocation.getDistance(currentLocation, targetLocation);
    return geolocation.formatDistance(meters);
  }

  if (!order) return <p>Aucune livraison active.</p>;

  return (
    <div className="active-delivery card">
      <h2>Livraison en cours</h2>

      {/* Infos commande */}
      <div className="order-details">
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Client:</strong> {order.client.name}</p>
        <p><strong>Total:</strong> {formatPrice(order.totalAmount, 'POL', 5)}</p>
        <p><strong>Frais (20%):</strong> {(() => {
          const totalAmountNumber = parseFloat(formatPrice(order.totalAmount, 'POL', 5).replace(' POL', ''));
          return formatPrice((totalAmountNumber * 0.2).toString(), 'POL', 5);
        })()}</p>
      </div>

      {/* Restaurant */}
      <div className="restaurant-section">
        <h3>Restaurant</h3>
        <p>{order.restaurant.name}</p>
        <p>{order.restaurant.address}</p>
        {currentLocation && (
          <p>Distance: {getDistance(order.restaurant.location)}</p>
        )}
        <button onClick={() => window.open(`tel:${order.restaurant.phone}`)}>
          Appeler restaurant
        </button>
      </div>

      {/* Client */}
      <div className="client-section">
        <h3>Client</h3>
        <p>{order.client.name}</p>
        <p>{order.deliveryAddress.address}</p>
        {currentLocation && (
          <p>Distance: {getDistance(order.deliveryAddress)}</p>
        )}
        <button onClick={() => window.open(`tel:${order.client.phone}`)}>
          Appeler client
        </button>
      </div>

      {/* Map & Navigation */}
      <div className="navigation-section">
        {step === "pickup" ? (
          <>
            <NavigationMap
              origin={currentLocation}
              destination={order.restaurant.location}
              step="pickup"
              onArrival={() => setIsNearRestaurant(true)}
            />
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${order.restaurant.location.lat},${order.restaurant.location.lng}`
                )
              }
            >
              Naviguer vers restaurant
            </button>
          </>
        ) : (
          <>
            <NavigationMap
              origin={currentLocation}
              destination={order.deliveryAddress}
              step="delivery"
              onArrival={() => setIsNearClient(true)}
            />
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${order.deliveryAddress.lat},${order.deliveryAddress.lng}`
                )
              }
            >
              Naviguer vers client
            </button>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="actions">
        {step === "pickup" && isNearRestaurant && (
          <button
            onClick={handleConfirmPickup}
            disabled={loading}
            className="btn-success"
          >
            {loading ? "Confirmation..." : "Confirmer pickup"}
          </button>
        )}

        {step === "delivery" && isNearClient && (
          <button
            onClick={handleConfirmDelivery}
            disabled={loading}
            className="btn-success"
          >
            {loading ? "Confirmation..." : "Confirmer delivery"}
          </button>
        )}
      </div>

      {/* Indicateur GPS */}
      {tracking && (
        <div className="gps-indicator gps-active">
           GPS tracking actif
        </div>
      )}
    </div>
  );
}

export default ActiveDelivery;
