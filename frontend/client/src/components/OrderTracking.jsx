/**
 * Composant OrderTracking
 * @notice Suivi en temps réel d'une commande avec GPS et Socket.io
 * @dev Timeline visuelle, Google Maps, position livreur temps réel, confirmation livraison
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useParams } from 'react-router-dom';

// TODO: Importer Socket.io
// import io from 'socket.io-client';

// TODO: Importer Google Maps
// import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';

// TODO: Importer les services
// import * as api from '../services/api';
// import * as blockchain from '../services/blockchain';
// import { formatTime } from '../utils/formatters';

/**
 * Composant OrderTracking
 * @param {Object} props - Props du composant (optionnel, orderId peut venir de useParams)
 * @param {number} props.orderId - ID de la commande (optionnel)
 * @returns {JSX.Element} Suivi de commande
 */
// TODO: Créer le composant OrderTracking
// function OrderTracking({ orderId: propOrderId }) {
//   const navigate = useNavigate();
//   const { orderId: paramOrderId } = useParams();
//   const orderId = propOrderId || paramOrderId;
//   
//   // State pour la commande
//   const [order, setOrder] = useState(null);
//   
//   // State pour la position du livreur
//   const [delivererLocation, setDelivererLocation] = useState(null);
//   
//   // State pour l'ETA (temps estimé d'arrivée)
//   const [eta, setEta] = useState(null);
//   
//   // State pour vérifier si livreur est proche
//   const [isNearby, setIsNearby] = useState(false);
//   
//   // State pour le chargement
//   const [loading, setLoading] = useState(false);
//   
//   // State pour les tokens gagnés
//   const [tokensEarned, setTokensEarned] = useState(null);
//   
//   // State pour la confirmation en cours
//   const [isConfirming, setIsConfirming] = useState(false);
//   
//   // Ref pour Socket.io
//   const socketRef = useRef(null);
//   
//   // Ref pour la map
//   const mapRef = useRef(null);
//   
//   // TODO: Charger Google Maps API
//   // const { isLoaded } = useLoadScript({
//   //   googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
//   // });
//   
//   // TODO: Fonction pour récupérer les détails de la commande
//   // useEffect(() => {
//   //   async function fetchOrder() {
//   //     ESSAYER:
//   //       setLoading(true);
//   //       const orderData = await api.getOrder(orderId);
//   //       setOrder(orderData);
//   //       
//   //       // Initialiser position livreur si disponible
//   //       SI orderData.delivererLocation:
//   //         setDelivererLocation(orderData.delivererLocation);
//   //     CATCH error:
//   //       console.error('Error fetching order:', error);
//   //     FINALLY:
//   //       setLoading(false);
//   //   }
//   //   
//   //   SI orderId:
//   //     fetchOrder();
//   // }, [orderId]);
//   
//   // TODO: Fonction pour initialiser Socket.io
//   // useEffect(() => {
//   //   SI !orderId:
//   //     RETOURNER;
//   //   
//   //   // Connexion Socket.io
//   //   const socket = io(import.meta.env.VITE_SOCKET_URL);
//   //   socketRef.current = socket;
//   //   
//   //   // Rejoindre la room de la commande
//   //   socket.emit('joinOrderRoom', orderId);
//   //   
//   //   // Listener pour les mises à jour de status
//   //   socket.on('orderStatusUpdate', (data) => {
//   //     SI data.orderId === orderId:
//   //       setOrder(prev => prev ? { ...prev, status: data.status } : null);
//   //   });
//   //   
//   //   // Listener pour les mises à jour de position livreur
//   //   socket.on('delivererLocationUpdate', (data) => {
//   //     SI data.orderId === orderId:
//   //       setDelivererLocation(data.location);
//   //       calculateETA(data.location);
//   //       checkIfNearby(data.location);
//   //   });
//   //   
//   //   // Cleanup au démontage
//   //   RETOURNER () => {
//   //     socket.off('orderStatusUpdate');
//   //     socket.off('delivererLocationUpdate');
//   //     socket.disconnect();
//   //   };
//   // }, [orderId]);
//   
//   // TODO: Fonction pour calculer l'ETA
//   // function calculateETA(location) {
//   //   SI !order || !location:
//   //     RETOURNER;
//   //   
//   //   // Calculer distance entre livreur et client
//   //   // TODO: Utiliser formule Haversine ou Google Maps Distance Matrix
//   //   const distance = calculateDistance(
//   //     location.lat, location.lng,
//   //     order.deliveryLocation.lat, order.deliveryLocation.lng
//   //   );
//   //   
//   //   // Estimer temps (vitesse moyenne 30 km/h)
//   //   const speedKmh = 30;
//   //   const timeHours = distance / speedKmh;
//   //   const timeMinutes = Math.ceil(timeHours * 60);
//   //   
//   //   setEta(timeMinutes);
//   // }
//   
//   // TODO: Fonction pour vérifier si livreur est proche (< 100m)
//   // function checkIfNearby(location) {
//   //   SI !order || !location:
//   //     RETOURNER;
//   //   
//   //   const distance = calculateDistance(
//   //     location.lat, location.lng,
//   //     order.deliveryLocation.lat, order.deliveryLocation.lng
//   //   );
//   //   
//   //   // 100m = 0.1 km
//   //   setIsNearby(distance < 0.1);
//   // }
//   
//   // TODO: Fonction pour calculer distance (Haversine)
//   // function calculateDistance(lat1, lng1, lat2, lng2) {
//   //   const R = 6371; // Rayon de la Terre en km
//   //   const dLat = (lat2 - lat1) * Math.PI / 180;
//   //   const dLng = (lng2 - lng1) * Math.PI / 180;
//   //   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//   //             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//   //             Math.sin(dLng/2) * Math.sin(dLng/2);
//   //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   //   RETOURNER R * c;
//   // }
//   
//   // TODO: Fonction pour confirmer la livraison
//   // async function handleConfirmDelivery() {
//   //   ESSAYER:
//   //     setIsConfirming(true);
//   //     
//   //     // Confirmer via API backend
//   //     const apiResult = await api.confirmDelivery(orderId, order.clientAddress);
//   //     
//   //     // Confirmer on-chain
//   //     const blockchainResult = await blockchain.confirmDeliveryOnChain(orderId);
//   //     
//   //     // Afficher tokens gagnés
//   //     setTokensEarned(apiResult.tokensEarned || blockchainResult.tokensEarned);
//   //     
//   //     // Attendre 3 secondes puis redirect
//   //     setTimeout(() => {
//   //       navigate('/profile?tab=orders');
//   //     }, 3000);
//   //     
//   //   CATCH error:
//   //     console.error('Error confirming delivery:', error);
//   //     alert('Erreur lors de la confirmation de livraison');
//   //   FINALLY:
//   //     setIsConfirming(false);
//   // }
//   
//   // TODO: Fonction pour obtenir le status en français
//   // function getStatusLabel(status) {
//   //   const statusMap = {
//   //     'CREATED': 'Créée',
//   //     'PREPARING': 'En préparation',
//   //     'IN_DELIVERY': 'En livraison',
//   //     'DELIVERED': 'Livrée',
//   //     'DISPUTED': 'En litige'
//   //   };
//   //   RETOURNER statusMap[status] || status;
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="order-tracking">
//   //     SI loading:
//   //       <div className="loading">Chargement...</div>
//   //     
//   //     SINON SI !order:
//   //       <div className="error">Commande non trouvée</div>
//   //     
//   //     SINON:
//   //       <>
//   //         <h1>Suivi de commande #{orderId}</h1>
//   //         
//   //         {/* Timeline visuelle */}
//   //         <div className="timeline">
//   //           <div className={`timeline-item ${order.status === 'CREATED' ? 'active' : 'completed'}`}>
//   //             <span>Commande créée</span>
//   //           </div>
//   //           <div className={`timeline-item ${order.status === 'PREPARING' ? 'active' : order.status === 'CREATED' ? '' : 'completed'}`}>
//   //             <span>En préparation</span>
//   //           </div>
//   //           <div className={`timeline-item ${order.status === 'IN_DELIVERY' ? 'active' : ['CREATED', 'PREPARING'].includes(order.status) ? '' : 'completed'}`}>
//   //             <span>En livraison</span>
//   //           </div>
//   //           <div className={`timeline-item ${order.status === 'DELIVERED' ? 'active completed' : ''}`}>
//   //             <span>Livrée</span>
//   //           </div>
//   //         </div>
//   //         
//   //         {/* Google Maps */}
//   //         SI isLoaded && order.restaurantLocation && order.deliveryLocation:
//   //           <div className="map-container">
//   //             <GoogleMap
//   //               mapContainerStyle={{ width: '100%', height: '400px' }}
//   //               center={order.restaurantLocation}
//   //               zoom={13}
//   //               onLoad={(map) => mapRef.current = map}
//   //             >
//   //               {/* Marker restaurant */}
//   //               <Marker position={order.restaurantLocation} label="R" />
//   //               
//   //               {/* Marker client */}
//   //               <Marker position={order.deliveryLocation} label="C" />
//   //               
//   //               {/* Marker livreur si position disponible */}
//   //               SI delivererLocation:
//   //                 <Marker position={delivererLocation} label="L" />
//   //                 
//   //                 {/* Polyline route livreur → client */}
//   //                 <Polyline
//   //                   path={[delivererLocation, order.deliveryLocation]}
//   //                   options={{ strokeColor: '#FF0000' }}
//   //                 />
//   //             </GoogleMap>
//   //           </div>
//   //         
//   //         {/* Info livreur */}
//   //         SI order.deliverer:
//   //           <div className="deliverer-info">
//   //             <h3>Livreur</h3>
//   //             <p>Nom: {order.deliverer.name}</p>
//   //             <p>Rating: {order.deliverer.rating} ⭐</p>
//   //             <p>Véhicule: {order.deliverer.vehicleType}</p>
//   //             <button className="btn btn-primary">
//   //               📞 Appeler le livreur
//   //             </button>
//   //           </div>
//   //         
//   //         {/* ETA countdown */}
//   //         SI eta && order.status === 'IN_DELIVERY':
//   //           <div className="eta-display">
//   //             <h3>Temps estimé d'arrivée</h3>
//   //             <p className="eta-value">{eta} minutes</p>
//   //             SI isNearby:
//   //               <p className="nearby-alert">Le livreur est proche!</p>
//   //           </div>
//   //         
//   //         {/* Bouton confirmer livraison */}
//   //         SI order.status === 'IN_DELIVERY' && isNearby:
//   //           <button
//   //             onClick={handleConfirmDelivery}
//   //             disabled={isConfirming}
//   //             className="btn btn-success btn-lg"
//   //           >
//   //             {isConfirming ? 'Confirmation...' : 'Confirmer la livraison'}
//   //           </button>
//   //         
//   //         {/* Tokens gagnés */}
//   //         SI tokensEarned:
//   //           <div className="tokens-earned">
//   //             <h3>🎉 Vous avez gagné {tokensEarned} tokens DONE!</h3>
//   //           </div>
//   //       </>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default OrderTracking;

