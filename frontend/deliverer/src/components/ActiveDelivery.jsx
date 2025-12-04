/**
 * Composant ActiveDelivery - Livraison en cours
 * @fileoverview Affiche et gère la livraison active avec GPS tracking
 */

// TODO: Importer React et hooks
// import { useState, useEffect } from 'react';
// import { api } from '../services/api';
// import { blockchain } from '../services/blockchain';
// import { geolocation } from '../services/geolocation';
// import NavigationMap from './NavigationMap';

/**
 * Composant ActiveDelivery
 * @param {Object} order - Données de la commande
 * @returns {JSX.Element} Affichage livraison active
 */
// TODO: Implémenter ActiveDelivery({ order })
// function ActiveDelivery({ order }) {
//   // State
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [step, setStep] = useState('pickup'); // 'pickup' ou 'delivery'
//   const [isNearRestaurant, setIsNearRestaurant] = useState(false);
//   const [isNearClient, setIsNearClient] = useState(false);
//   const [tracking, setTracking] = useState(false);
//   const [loading, setLoading] = useState(false);
//   
//   // Charger position au montage
//   useEffect(() => {
//     loadCurrentLocation();
//     
//     // GPS tracking automatique si livraison active
//     SI order && order.status === 'IN_DELIVERY':
//       startGPSTracking();
//     
//     RETOURNER () => {
//       stopGPSTracking();
//     };
//   }, [order]);
//   
//   // Vérifier proximité toutes les 5 secondes
//   useEffect(() => {
//     SI !currentLocation || !order:
//       RETOURNER;
//     
//     const interval = setInterval(() => {
//       checkProximity();
//     }, 5000);
//     
//     RETOURNER () => clearInterval(interval);
//   }, [currentLocation, order]);
//   
//   // Charger position actuelle
//   async function loadCurrentLocation() {
//     ESSAYER:
//       const position = await geolocation.getCurrentPosition();
//       setCurrentLocation(position);
//     CATCH error:
//       console.error('Error getting location:', error);
//   }
//   
//   // Vérifier proximité restaurant/client
//   function checkProximity() {
//     SI !currentLocation || !order:
//       RETOURNER;
//     
//     // Vérifier proximité restaurant (< 100m)
//     SI step === 'pickup':
//       const nearRestaurant = geolocation.isNearLocation(
//         currentLocation.lat,
//         currentLocation.lng,
//         order.restaurant.location.lat,
//         order.restaurant.location.lng,
//         0.1 // 100m
//       );
//       setIsNearRestaurant(nearRestaurant);
//     
//     // Vérifier proximité client (< 100m)
//     SI step === 'delivery':
//       const nearClient = geolocation.isNearLocation(
//         currentLocation.lat,
//         currentLocation.lng,
//         order.deliveryAddress.lat,
//         order.deliveryAddress.lng,
//         0.1 // 100m
//       );
//       setIsNearClient(nearClient);
//   }
//   
//   // Démarrer GPS tracking
//   function startGPSTracking() {
//     SI tracking:
//       RETOURNER;
//     
//     setTracking(true);
//     const watchId = geolocation.watchPosition((position) => {
//       setCurrentLocation(position);
//       
//       // Envoyer position au backend toutes les 5 secondes
//       SI order:
//         api.updateGPSLocation(order.orderId, position.lat, position.lng);
//     });
//     
//     // Stocker watchId pour cleanup
//     // TODO: Stocker watchId dans state ou ref
//   }
//   
//   // Arrêter GPS tracking
//   function stopGPSTracking() {
//     setTracking(false);
//     // TODO: Clear watch position
//   }
//   
//   // Confirmer pickup
//   async function handleConfirmPickup() {
//     SI !isNearRestaurant:
//       alert('Vous devez être à moins de 100m du restaurant');
//       RETOURNER;
//     
//     setLoading(true);
//     ESSAYER:
//       const address = await blockchain.getSigner().getAddress();
//       
//       // Confirmer on-chain
//       await blockchain.confirmPickupOnChain(order.orderId);
//       
//       // Confirmer off-chain
//       await api.confirmPickup(order.orderId, address);
//       
//       // Changer step et démarrer tracking
//       setStep('delivery');
//       startGPSTracking();
//       
//       alert('Pickup confirmé! GPS tracking activé.');
//     CATCH error:
//       alert(`Erreur: ${error.message}`);
//     FINALLY:
//       setLoading(false);
//   }
//   
//   // Confirmer delivery
//   async function handleConfirmDelivery() {
//     SI !isNearClient:
//       alert('Vous devez être à moins de 100m du client');
//       RETOURNER;
//     
//     setLoading(true);
//     ESSAYER:
//       const address = await blockchain.getSigner().getAddress();
//       
//       // Confirmer on-chain
//       const { earnings } = await blockchain.confirmDeliveryOnChain(order.orderId);
//       
//       // Confirmer off-chain
//       await api.confirmDelivery(order.orderId, address);
//       
//       // Arrêter tracking
//       stopGPSTracking();
//       
//       alert(`Livraison confirmée! Vous avez gagné ${earnings} MATIC (20%)`);
//       
//       // Rediriger vers HomePage
//       window.location.href = '/';
//     CATCH error:
//       alert(`Erreur: ${error.message}`);
//     FINALLY:
//       setLoading(false);
//   }
//   
//   // Calculer distance
//   function getDistance(targetLocation) {
//     SI !currentLocation || !targetLocation:
//       RETOURNER null;
//     
//     const distance = geolocation.getDistance(
//       currentLocation.lat,
//       currentLocation.lng,
//       targetLocation.lat,
//       targetLocation.lng
//     );
//     
//     RETOURNER geolocation.formatDistance(distance);
//   }
//   
//   // Render
//   RETOURNER (
//     <div className="active-delivery card">
//       <h2>Livraison en cours</h2>
//       
//       {/* Détails commande */}
//       <div className="order-details">
//         <p><strong>Order ID:</strong> {order.orderId}</p>
//         <p><strong>Client:</strong> {order.client.name}</p>
//         <p><strong>Total:</strong> {order.totalAmount} MATIC</p>
//         <p><strong>Delivery Fee (20%):</strong> {order.totalAmount * 0.2} MATIC</p>
//       </div>
//       
//       {/* Restaurant */}
//       <div className="restaurant-section">
//         <h3>Restaurant</h3>
//         <p>{order.restaurant.name}</p>
//         <p>{order.restaurant.address}</p>
//         SI currentLocation:
//           <p>Distance: {getDistance(order.restaurant.location)}</p>
//         <button onClick={() => window.open(`tel:${order.restaurant.phone}`)}>
//           Appeler restaurant
//         </button>
//       </div>
//       
//       {/* Client */}
//       <div className="client-section">
//         <h3>Client</h3>
//         <p>{order.client.name}</p>
//         <p>{order.deliveryAddress.address}</p>
//         SI currentLocation:
//           <p>Distance: {getDistance(order.deliveryAddress)}</p>
//         <button onClick={() => window.open(`tel:${order.client.phone}`)}>
//           Appeler client
//         </button>
//       </div>
//       
//       {/* Navigation */}
//       <div className="navigation-section">
//         SI step === 'pickup':
//           <NavigationMap
//             origin={currentLocation}
//             destination={order.restaurant.location}
//             step="pickup"
//             onArrival={() => setIsNearRestaurant(true)}
//           />
//           <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.restaurant.location.lat},${order.restaurant.location.lng}`)}>
//             Naviguer vers restaurant
//           </button>
//         SINON:
//           <NavigationMap
//             origin={currentLocation}
//             destination={order.deliveryAddress}
//             step="delivery"
//             onArrival={() => setIsNearClient(true)}
//           />
//           <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryAddress.lat},${order.deliveryAddress.lng}`)}>
//             Naviguer vers client
//           </button>
//       </div>
//       
//       {/* Actions */}
//       <div className="actions">
//         SI step === 'pickup' && isNearRestaurant:
//           <button onClick={handleConfirmPickup} disabled={loading} className="btn-success">
//             {loading ? 'Confirmation...' : 'Confirmer pickup'}
//           </button>
//         SINON SI step === 'delivery' && isNearClient:
//           <button onClick={handleConfirmDelivery} disabled={loading} className="btn-success">
//             {loading ? 'Confirmation...' : 'Confirmer delivery'}
//           </button>
//       </div>
//       
//       {/* GPS tracking indicator */}
//       SI tracking:
//         <div className="gps-indicator gps-active">
//           📍 GPS tracking actif
//         </div>
//     </div>
//   );
// }

// TODO: Exporter le composant
// export default ActiveDelivery;

