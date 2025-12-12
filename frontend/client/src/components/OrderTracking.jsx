import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useSocket } from '../contexts/SocketContext';
import { confirmDelivery } from '../services/api';
import { formatPriceInMATIC } from '../utils/formatters';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = ['places'];

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
};

const ORDER_STATUSES = [
  { key: 'CREATED', label: 'Commande creee', icon: '📝', color: 'blue' },
  { key: 'PREPARING', label: 'En preparation', icon: '👨‍🍳', color: 'yellow' },
  { key: 'IN_DELIVERY', label: 'En livraison', icon: '🚗', color: 'purple' },
  { key: 'DELIVERED', label: 'Livree', icon: '✅', color: 'green' },
  { key: 'DISPUTED', label: 'Litige', icon: '⚠️', color: 'red' },
];

const OrderTracking = ({ order }) => {
  const socket = useSocket();

  if (!order) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-500">Commande non trouvee</p>
        </div>
      </div>
    );
  }

  const orderId = order.orderId || order.id || order._id;
  const [currentStatus, setCurrentStatus] = useState(order.status || 'CREATED');
  const [driverPosition, setDriverPosition] = useState(order.deliverer?.location || order.driver?.location || null);
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [tokensEarned, setTokensEarned] = useState(null);
  const [showTokensNotification, setShowTokensNotification] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    if (!orderId) return;

    socket.emit('join_order_room', orderId);

    socket.on('order_status_update', (data) => {
      if (data.orderId === orderId || data.orderId === parseInt(orderId)) {
        setCurrentStatus(data.status);
      }
    });

    socket.on('driver_position_update', (data) => {
      if (data.orderId === orderId || data.orderId === parseInt(orderId)) {
        setDriverPosition(data.position);
      }
    });

    return () => {
      socket.emit('leave_order_room', orderId);
      socket.off('order_status_update');
      socket.off('driver_position_update');
    };
  }, [socket, orderId]);

  const handleConfirmDelivery = async () => {
    try {
      setIsConfirming(true);
      console.log(`[Client] Confirmation livraison commande #${orderId}...`);

      if (!window.ethereum) {
        alert('MetaMask n\'est pas installe. Veuillez installer MetaMask pour confirmer la livraison.');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        const connectedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (connectedAccounts.length === 0) {
          alert('Veuillez connecter votre wallet pour confirmer la livraison.');
          return;
        }
      }

      const response = await confirmDelivery(orderId);
      console.log(`[Client] Livraison confirmee pour commande #${orderId}:`, response.data);

      // Récupérer les tokens gagnés depuis la réponse
      const tokensEarnedValue = response.data?.tokensEarned || "0";
      setTokensEarned(tokensEarnedValue);
      
      // Afficher la notification de tokens reçus
      if (tokensEarnedValue && parseFloat(tokensEarnedValue) > 0) {
        setShowTokensNotification(true);
        // Masquer la notification après 10 secondes
        setTimeout(() => setShowTokensNotification(false), 10000);
      }

      setCurrentStatus('DELIVERED');
      
      // Émettre un événement pour rafraîchir le solde de tokens dans TokenBalance
      window.dispatchEvent(new CustomEvent('tokensUpdated', { 
        detail: { tokensEarned: tokensEarnedValue } 
      }));
    } catch (error) {
      console.error(`[Client] Erreur confirmation livraison commande #${orderId}:`, error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erreur inconnue';
      alert(`Echec de la confirmation de livraison: ${errorMessage}`);
    } finally {
      setIsConfirming(false);
    }
  };

  const getCurrentStatusIndex = () => {
    return ORDER_STATUSES.findIndex(s => s.key === currentStatus);
  };

  const getStatusColor = (statusKey) => {
    const status = ORDER_STATUSES.find(s => s.key === statusKey);
    const colors = {
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
    };
    return colors[status?.color] || 'bg-gray-500';
  };

  const getStatusBgLight = (statusKey) => {
    const status = ORDER_STATUSES.find(s => s.key === statusKey);
    const colors = {
      blue: 'bg-blue-100',
      yellow: 'bg-yellow-100',
      purple: 'bg-purple-100',
      green: 'bg-green-100',
      red: 'bg-red-100',
    };
    return colors[status?.color] || 'bg-gray-100';
  };

  const renderTimeline = () => {
    const currentIndex = getCurrentStatusIndex();
    const displayStatuses = ORDER_STATUSES.filter(s => s.key !== 'DISPUTED' || currentStatus === 'DISPUTED');

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Progression de la commande</h2>
              <p className="text-white/80 text-sm">Suivi en temps reel</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6">
          <div className="relative">
            {displayStatuses.map((status, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={status.key} className="flex items-start mb-6 last:mb-0">
                  {/* Line */}
                  {index < displayStatuses.length - 1 && (
                    <div
                      className={`absolute left-5 w-0.5 h-12 ${isCompleted ? getStatusColor(status.key) : 'bg-gray-200'}`}
                      style={{ top: `${index * 72 + 40}px` }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                      isCompleted ? getStatusColor(status.key) : 'bg-gray-200'
                    } ${isCurrent ? 'ring-4 ring-offset-2 ring-' + status.color + '-200' : ''}`}
                  >
                    {isCompleted ? (
                      <span className="text-lg">{status.icon}</span>
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                        {status.label}
                      </h3>
                      {isCurrent && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBgLight(status.key)} ${isCompleted ? 'text-gray-700' : 'text-gray-500'}`}>
                          En cours
                        </span>
                      )}
                    </div>
                    {isCurrent && (
                      <p className="text-sm text-gray-500 mt-1">
                        {status.key === 'CREATED' && 'Votre commande a ete recue'}
                        {status.key === 'PREPARING' && 'Le restaurant prepare votre commande'}
                        {status.key === 'IN_DELIVERY' && 'Votre livreur est en route'}
                        {status.key === 'DELIVERED' && 'Votre commande a ete livree'}
                        {status.key === 'DISPUTED' && 'Un litige est en cours de traitement'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderOrderDetails = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Details de la commande</h2>
            <p className="text-white/80 text-sm">#{orderId}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Restaurant info */}
        {order.restaurant && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🍽️</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Restaurant</p>
              <p className="font-semibold text-gray-800">{order.restaurant.name || 'Restaurant'}</p>
            </div>
          </div>
        )}

        {/* Delivery address */}
        {order.deliveryAddress && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📍</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Adresse de livraison</p>
              <p className="font-semibold text-gray-800">{order.deliveryAddress}</p>
            </div>
          </div>
        )}

        {/* Order items */}
        {order.items && order.items.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Articles commandes</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{item.quantity}x</span>
                    <span className="font-medium text-gray-800">{item.name}</span>
                  </div>
                  <span className="text-orange-500 font-medium">{formatPriceInMATIC(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        {order.totalAmount && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">Total</span>
              <span className="text-xl font-bold text-orange-500">{formatPriceInMATIC(order.totalAmount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMap = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Carte en direct</h2>
            <p className="text-white/80 text-sm">Suivez votre livreur</p>
          </div>
          {currentStatus === 'IN_DELIVERY' && (
            <div className="ml-auto flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="text-white text-sm">En route</span>
            </div>
          )}
        </div>
      </div>

      {/* Map container */}
      <div className="h-80 relative">
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Erreur de chargement de la carte</p>
              <p className="text-gray-400 text-sm">Google Maps ne peut pas se charger</p>
            </div>
          </div>
        )}
        {!isLoaded && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Chargement de la carte...</p>
            </div>
          </div>
        )}
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={order.gpsTracking && order.gpsTracking.length > 0
              ? { lat: order.gpsTracking[order.gpsTracking.length - 1].lat, lng: order.gpsTracking[order.gpsTracking.length - 1].lng }
              : { lat: 48.8566, lng: 2.3522 }
            }
            zoom={14}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {order.restaurant?.location && (
              <Marker position={order.restaurant.location} label="🍽️" />
            )}
            {order.client?.location && (
              <Marker position={order.client.location} label="🏠" />
            )}
            {driverPosition && (
              <Marker
                position={driverPosition}
                icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
              />
            )}
            {order.gpsTracking && order.gpsTracking.length > 0 && (
              order.gpsTracking.map((point, index) => (
                <Marker
                  key={index}
                  position={{ lat: point.lat, lng: point.lng }}
                  opacity={index === order.gpsTracking.length - 1 ? 1 : 0.5}
                />
              ))
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        )}
      </div>

      {/* ETA */}
      {eta && (
        <div className="px-6 py-3 bg-green-50 border-t border-green-100">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 font-medium">Temps estime d'arrivee : {eta}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderConfirmButton = () => {
    if (currentStatus !== 'IN_DELIVERY') return null;

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Commande arrivee ?</h3>
                <p className="text-sm text-green-600 mt-1">
                  Confirmez la reception de votre commande pour debloquer le paiement au restaurant et au livreur.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmDelivery}
            disabled={isConfirming}
            className={`w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-3 ${
              isConfirming ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isConfirming ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirmation en cours...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Confirmer la reception</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderDeliveredSuccess = () => {
    if (currentStatus !== 'DELIVERED') return null;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Commande livree avec succes !</h3>
              <p className="text-white/80 mt-1">Merci pour votre commande. Bon appetit !</p>
            </div>
          </div>
        </div>

        {/* Notification des tokens reçus */}
        {showTokensNotification && tokensEarned && parseFloat(tokensEarned) > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">🎁</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">Tokens DONE reçus !</h3>
                <p className="text-white/90 mt-1">
                  Vous avez reçu <strong className="text-2xl">{parseFloat(tokensEarned).toFixed(2)} DONE</strong> pour cette commande !
                </p>
                <p className="text-white/80 text-sm mt-2">
                  Utilisez vos tokens DONE pour obtenir des réductions sur vos prochaines commandes.
                </p>
              </div>
              <button
                onClick={() => setShowTokensNotification(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-6">
        {renderTimeline()}
        {renderOrderDetails()}
      </div>

      {/* Right column */}
      <div className="space-y-6">
        {renderMap()}
        {renderConfirmButton()}
        {renderDeliveredSuccess()}
      </div>
    </div>
  );
};

export default OrderTracking;
