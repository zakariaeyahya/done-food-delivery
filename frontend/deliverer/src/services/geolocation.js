/**
 * Service de géolocalisation et calculs GPS
 * @fileoverview Gère la géolocalisation native du navigateur et les calculs de distance
 */

/**
 * 1. Obtenir la position actuelle
 * @returns {Promise<Object>} { lat, lng, accuracy }
 * 
 * @example
 * const position = await getCurrentPosition();
 */
// TODO: Implémenter getCurrentPosition()
// async function getCurrentPosition() {
//   RETOURNER new Promise((resolve, reject) => {
//     SI !navigator.geolocation:
//       reject(new Error('Geolocation is not supported by this browser'));
//     
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         resolve({
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//           accuracy: position.coords.accuracy
//         });
//       },
//       (error) => {
//         SI error.code === 1: // PERMISSION_DENIED
//           reject(new Error('Geolocation permission denied. Please enable location access.'));
//         SINON SI error.code === 2: // POSITION_UNAVAILABLE
//           reject(new Error('Position unavailable. Please check your GPS.'));
//         SINON SI error.code === 3: // TIMEOUT
//           reject(new Error('Geolocation timeout. Please try again.'));
//         SINON:
//           reject(new Error(`Geolocation error: ${error.message}`));
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0
//       }
//     );
//   });
// }

/**
 * 2. Suivre la position en continu (watch position)
 * @param {Function} callback - Fonction appelée à chaque update position
 * @returns {number} watchId (pour cleanup)
 * 
 * @example
 * const watchId = watchPosition((position) => {
 *   console.log('New position:', position);
 * });
 * // Plus tard: navigator.geolocation.clearWatch(watchId);
 */
// TODO: Implémenter watchPosition(callback)
// function watchPosition(callback) {
//   SI !navigator.geolocation:
//     throw new Error('Geolocation is not supported by this browser');
//   
//   const watchId = navigator.geolocation.watchPosition(
//     (position) => {
//       callback({
//         lat: position.coords.latitude,
//         lng: position.coords.longitude,
//         accuracy: position.coords.accuracy,
//         timestamp: position.timestamp
//       });
//     },
//     (error) => {
//       console.error('Geolocation watch error:', error);
//       // Ne pas rejeter, juste logger l'erreur
//     },
//     {
//       enableHighAccuracy: true,
//       timeout: 5000,
//       maximumAge: 0
//     }
//   );
//   
//   RETOURNER watchId;
// }

/**
 * 3. Calculer l'itinéraire via Google Maps DirectionsService
 * @param {Object} origin - Position de départ { lat, lng }
 * @param {Object} destination - Position d'arrivée { lat, lng }
 * @returns {Promise<Object>} { route, distance (km), duration (minutes) }
 * 
 * @example
 * const route = await calculateRoute(
 *   { lat: 48.8566, lng: 2.3522 },
 *   { lat: 48.8606, lng: 2.3376 }
 * );
 */
// TODO: Implémenter calculateRoute(origin, destination)
// async function calculateRoute(origin, destination) {
//   ESSAYER:
//     SI !origin || !destination:
//       throw new Error('Origin and destination are required');
//     
//     // TODO: Importer Google Maps DirectionsService
//     // const { DirectionsService } = await import('@react-google-maps/api');
//     
//     // Créer DirectionsService
//     const directionsService = new google.maps.DirectionsService();
//     
//     RETOURNER new Promise((resolve, reject) => {
//       directionsService.route(
//         {
//           origin: { lat: origin.lat, lng: origin.lng },
//           destination: { lat: destination.lat, lng: destination.lng },
//           travelMode: google.maps.TravelMode.DRIVING
//         },
//         (result, status) => {
//           SI status === google.maps.DirectionsStatus.OK:
//             const route = result.routes[0];
//             const leg = route.legs[0];
//             
//             resolve({
//               route: route,
//               distance: leg.distance.value / 1000, // Convertir mètres en km
//               duration: leg.duration.value / 60, // Convertir secondes en minutes
//               polyline: route.overview_polyline
//             });
//           SINON:
//             reject(new Error(`Directions request failed: ${status}`));
//         }
//       );
//     });
//   CATCH error:
//     console.error('Error calculating route:', error);
//     throw new Error(`Failed to calculate route: ${error.message}`);
// }

/**
 * 4. Calculer la distance entre deux points (formule Haversine)
 * @param {number} lat1 - Latitude point 1
 * @param {number} lng1 - Longitude point 1
 * @param {number} lat2 - Latitude point 2
 * @param {number} lng2 - Longitude point 2
 * @returns {number} Distance en kilomètres
 * 
 * @example
 * const distance = getDistance(48.8566, 2.3522, 48.8606, 2.3376);
 */
// TODO: Implémenter getDistance(lat1, lng1, lat2, lng2)
// function getDistance(lat1, lng1, lat2, lng2) {
//   // Rayon de la Terre en kilomètres
//   const R = 6371;
//   
//   // Convertir degrés en radians
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLng = (lng2 - lng1) * Math.PI / 180;
//   
//   // Formule Haversine
//   const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//             Math.sin(dLng / 2) * Math.sin(dLng / 2);
//   
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c; // Distance en km
//   
//   RETOURNER distance;
// }

/**
 * 5. Vérifier si on est proche d'une location (dans un rayon donné)
 * @param {number} currentLat - Latitude actuelle
 * @param {number} currentLng - Longitude actuelle
 * @param {number} targetLat - Latitude cible
 * @param {number} targetLng - Longitude cible
 * @param {number} radius - Rayon en kilomètres (défaut: 0.1 km = 100m)
 * @returns {boolean} true si dans le rayon
 * 
 * @example
 * const isNear = isNearLocation(48.8566, 2.3522, 48.8567, 2.3523, 0.1);
 */
// TODO: Implémenter isNearLocation(currentLat, currentLng, targetLat, targetLng, radius)
// function isNearLocation(currentLat, currentLng, targetLat, targetLng, radius = 0.1) {
//   const distance = getDistance(currentLat, currentLng, targetLat, targetLng);
//   RETOURNER distance <= radius;
// }

/**
 * 6. Formater la distance pour affichage
 * @param {number} distance - Distance en kilomètres
 * @returns {string} Distance formatée (ex: "1.5 km" ou "500 m")
 * 
 * @example
 * const formatted = formatDistance(1.5); // "1.5 km"
 * const formatted = formatDistance(0.5); // "500 m"
 */
// TODO: Implémenter formatDistance(distance)
// function formatDistance(distance) {
//   SI distance < 1:
//     RETOURNER `${Math.round(distance * 1000)} m`;
//   SINON:
//     RETOURNER `${distance.toFixed(1)} km`;
// }

/**
 * 7. Formater le temps pour affichage
 * @param {number} minutes - Temps en minutes
 * @returns {string} Temps formaté (ex: "15 min" ou "1h 30min")
 * 
 * @example
 * const formatted = formatDuration(15); // "15 min"
 * const formatted = formatDuration(90); // "1h 30min"
 */
// TODO: Implémenter formatDuration(minutes)
// function formatDuration(minutes) {
//   SI minutes < 60:
//     RETOURNER `${Math.round(minutes)} min`;
//   SINON:
//     const hours = Math.floor(minutes / 60);
//     const mins = Math.round(minutes % 60);
//     SI mins === 0:
//       RETOURNER `${hours}h`;
//     SINON:
//       RETOURNER `${hours}h ${mins}min`;
// }

// Exports
// TODO: Exporter toutes les fonctions
// export {
//   getCurrentPosition,
//   watchPosition,
//   calculateRoute,
//   getDistance,
//   isNearLocation,
//   formatDistance,
//   formatDuration
// };

