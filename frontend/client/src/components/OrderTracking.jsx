import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useSocket } from '../contexts/SocketContext';
import { confirmOnChainDelivery } from '../services/blockchain';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = ['places'];

const containerStyle = {
  width: '100%',
  height: '400px',
};

const ORDER_STATUSES = ['CREATED', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'DISPUTED'];

const OrderTracking = ({ order }) => {
  const socket = useSocket();
  
  // Vérifier que order existe
  if (!order) {
    return <div className="p-6 text-center text-red-500">Commande non trouvée</div>;
  }
  
  // Utiliser orderId au lieu de id pour correspondre à la structure du backend
  const orderId = order.orderId || order.id || order._id;
  const [currentStatus, setCurrentStatus] = useState(order.status || 'CREATED');
  const [driverPosition, setDriverPosition] = useState(order.deliverer?.location || order.driver?.location || null);
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState('');

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    if (!orderId) return;
    
    // Join a room for this specific order to receive targeted updates
    socket.emit('join_order_room', orderId);

    // Listen for status updates
    socket.on('order_status_update', (data) => {
      if (data.orderId === orderId || data.orderId === parseInt(orderId)) {
        setCurrentStatus(data.status);
      }
    });

    // Listen for driver position updates
    socket.on('driver_position_update', (data) => {
      if (data.orderId === orderId || data.orderId === parseInt(orderId)) {
        setDriverPosition(data.position);
      }
    });

    // Clean up on component unmount
    return () => {
      socket.emit('leave_order_room', orderId);
      socket.off('order_status_update');
      socket.off('driver_position_update');
    };
  }, [socket, orderId]);
  
  const handleConfirmDelivery = async () => {
    try {
      await confirmOnChainDelivery(orderId);
      // The status will be updated via socket event from the backend
      alert('Delivery confirmation submitted!');
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      alert('Failed to confirm delivery. Please try again.');
    }
  };

  const renderTimeline = () => (
    <ol className="relative text-gray-500 border-l border-gray-200 my-6">
      {ORDER_STATUSES.map((status, index) => {
        const currentIndex = ORDER_STATUSES.indexOf(currentStatus);
        const isCompleted = index <= currentIndex;
        return (
          <li key={status} className="mb-10 ml-6">
            <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}>
              {isCompleted && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
            </span>
            <h3 className={`font-semibold ${isCompleted ? 'text-green-600' : ''}`}>{status}</h3>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="p-6 mx-auto bg-white border rounded-lg shadow-xl">
      <h2 className="mb-4 text-2xl font-bold">Suivi de votre commande: #{orderId}</h2>

      {renderTimeline()}

      <div className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">Carte en direct</h3>
        {loadError && (
          <div className="p-3 mb-2 text-sm text-yellow-800 bg-yellow-100 rounded">
            <p>⚠️ Erreur de chargement de la carte. Google Maps ne peut pas se charger.</p>
          </div>
        )}
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={order.gpsTracking && order.gpsTracking.length > 0 
              ? { lat: order.gpsTracking[order.gpsTracking.length - 1].lat, lng: order.gpsTracking[order.gpsTracking.length - 1].lng }
              : { lat: 48.8566, lng: 2.3522 } // Paris par défaut
            }
            zoom={12}
          >
            {/* Marqueur restaurant si coordonnées disponibles */}
            {order.restaurant?.location && (
              <Marker position={order.restaurant.location} label="🍽️ Restaurant" />
            )}
            {/* Marqueur client si coordonnées disponibles */}
            {order.client?.location && (
              <Marker position={order.client.location} label="🏠 Vous" />
            )}
            {/* Marqueur livreur si position disponible */}
            {driverPosition && (
              <Marker 
                position={driverPosition} 
                label="🚗 Livreur" 
                icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} 
              />
            )}
            {/* Afficher le suivi GPS si disponible */}
            {order.gpsTracking && order.gpsTracking.length > 0 && (
              order.gpsTracking.map((point, index) => (
                <Marker 
                  key={index}
                  position={{ lat: point.lat, lng: point.lng }} 
                  label={index === order.gpsTracking.length - 1 ? "📍 Position actuelle" : ""}
                />
              ))
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        ) : (
          <div className="p-2 text-sm text-gray-500 bg-gray-50 rounded">
            Chargement de la carte...
          </div>
        )}
        {eta && <p className="mt-2 text-sm text-center">Temps estimé d'arrivée : {eta}</p>}
        {order.deliveryAddress && (
          <p className="mt-2 text-sm text-center text-gray-600">
            <strong>Adresse de livraison :</strong> {order.deliveryAddress}
          </p>
        )}
      </div>

      {currentStatus === 'IN_DELIVERY' && (
        <button
          onClick={handleConfirmDelivery}
          className="w-full px-4 py-2 mt-6 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600"
        >
          Confirm Delivery Receipt
        </button>
      )}
    </div>
  );
};

export default OrderTracking;