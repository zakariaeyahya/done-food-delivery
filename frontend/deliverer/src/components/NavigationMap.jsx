/**
 * Composant NavigationMap - Carte de navigation Google Maps
 * @fileoverview Carte interactive avec itinéraire et markers
 */

// TODO: Importer React et Google Maps
// import { useState, useEffect } from 'react';
// import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
// import { geolocation } from '../services/geolocation';

/**
 * Composant NavigationMap
 * @param {Object} origin - Position de départ { lat, lng }
 * @param {Object} destination - Position d'arrivée { lat, lng }
 * @param {string} step - 'pickup' ou 'delivery'
 * @param {Function} onArrival - Callback quand arrivé à destination
 * @returns {JSX.Element} Carte de navigation
 */
// TODO: Implémenter NavigationMap({ origin, destination, step, onArrival })
// function NavigationMap({ origin, destination, step, onArrival }) {
//   // State
//   const [directions, setDirections] = useState(null);
//   const [currentPosition, setCurrentPosition] = useState(origin);
//   const [eta, setEta] = useState(null);
//   const [map, setMap] = useState(null);
//   
//   const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//   
//   // Calculer route au montage
//   useEffect(() => {
//     SI origin && destination:
//       calculateRoute();
//   }, [origin, destination]);
//   
//   // Suivre position en temps réel
//   useEffect(() => {
//     SI !origin:
//       RETOURNER;
//     
//     const watchId = geolocation.watchPosition((position) => {
//       setCurrentPosition(position);
//       
//       // Recalculer route si déviation
//       SI directions:
//         calculateRoute();
//     });
//     
//     RETOURNER () => {
//       navigator.geolocation.clearWatch(watchId);
//     };
//   }, []);
//   
//   // Calculer itinéraire
//   async function calculateRoute() {
//     ESSAYER:
//       const routeData = await geolocation.calculateRoute(origin, destination);
//       setDirections(routeData.route);
//       setEta(routeData.duration);
//     CATCH error:
//       console.error('Error calculating route:', error);
//   }
//   
//   // Vérifier arrivée
//   useEffect(() => {
//     SI !currentPosition || !destination:
//       RETOURNER;
//     
//     const isNear = geolocation.isNearLocation(
//       currentPosition.lat,
//       currentPosition.lng,
//       destination.lat,
//       destination.lng,
//       0.1 // 100m
//     );
//     
//     SI isNear && onArrival:
//       onArrival();
//   }, [currentPosition, destination]);
//   
//   // Render
//   RETOURNER (
//     <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
//       <GoogleMap
//         mapContainerStyle={{ width: '100%', height: '400px' }}
//         center={origin || { lat: 48.8566, lng: 2.3522 }}
//         zoom={13}
//         onLoad={setMap}
//       >
//         {/* Marker position actuelle */}
//         SI currentPosition:
//           <Marker
//             position={currentPosition}
//             label="📍 Vous"
//           />
//         
//         {/* Marker restaurant (si pickup) */}
//         SI step === 'pickup' && destination:
//           <Marker
//             position={destination}
//             label="🍽️ Restaurant"
//           />
//         
//         {/* Marker client (si delivery) */}
//         SI step === 'delivery' && destination:
//           <Marker
//             position={destination}
//             label="🏠 Client"
//           />
//         
//         {/* Directions */}
//         SI directions:
//           <DirectionsRenderer directions={directions} />
//         
//         {/* DirectionsService */}
//         SI origin && destination:
//           <DirectionsService
//             options={{
//               destination: destination,
//               origin: origin,
//               travelMode: 'DRIVING'
//             }}
//             callback={(result, status) => {
//               SI status === 'OK':
//                 setDirections(result);
//             }}
//           />
//       </GoogleMap>
//       
//       {/* ETA */}
//       SI eta:
//         <div className="eta">
//           Temps estimé: {geolocation.formatDuration(eta)}
//         </div>
//     </LoadScript>
//   );
// }

// TODO: Exporter le composant
// export default NavigationMap;

