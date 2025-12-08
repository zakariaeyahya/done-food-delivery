/**
 * Service de géolocalisation et calculs GPS
 * @fileoverview Gère la géolocalisation native du navigateur + calcul distances + Google Directions
 */

/* -------------------------------------------------------------------------- */
/* 1. Obtenir la position actuelle                                            */
/* -------------------------------------------------------------------------- */
export async function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === 1) {
          reject(
            new Error(
              "Permission de géolocalisation refusée. Activez la localisation."
            )
          );
        } else if (error.code === 2) {
          reject(new Error("Position indisponible. Vérifiez votre GPS."));
        } else if (error.code === 3) {
          reject(new Error("Timeout de géolocalisation. Réessayez."));
        } else {
          reject(new Error(`Geolocation error: ${error.message}`));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/* -------------------------------------------------------------------------- */
/* 2. Suivre la position en continu                                           */
/* -------------------------------------------------------------------------- */
export function watchPosition(callback) {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser");
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      console.error("Geolocation watch error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );

  return watchId;
}

/* -------------------------------------------------------------------------- */
/* 3. Calculer un itinéraire Google Maps DirectionsService                    */
/* -------------------------------------------------------------------------- */
export async function calculateRoute(origin, destination) {
  try {
    if (!origin || !destination) {
      throw new Error("Origin and destination are required");
    }

    if (!window.google || !google.maps) {
      throw new Error("Google Maps SDK not loaded");
    }

    const directionsService = new google.maps.DirectionsService();

    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            const route = result.routes[0];
            const leg = route.legs[0];

            resolve({
              route: result,
              distance: leg.distance.value / 1000, // km
              duration: leg.duration.value / 60, // minutes
              polyline: route.overview_polyline,
            });
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error("Error calculating route:", error);
    throw new Error(`Failed to calculate route: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Calcul distance (Haversine)                                             */
/* -------------------------------------------------------------------------- */
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Rayon de la Terre en km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // km
}

/* -------------------------------------------------------------------------- */
/* 5. Vérifier si proche d’une location                                      */
/* -------------------------------------------------------------------------- */
export function isNearLocation(
  currentLat,
  currentLng,
  targetLat,
  targetLng,
  radius = 0.1 // 100m
) {
  const distance = getDistance(currentLat, currentLng, targetLat, targetLng);
  return distance <= radius;
}

/* -------------------------------------------------------------------------- */
/* 6. Formatage distance                                                      */
/* -------------------------------------------------------------------------- */
export function formatDistance(distance) {
  if (!distance) return "—";

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/* -------------------------------------------------------------------------- */
/* 7. Formatage durée                                                         */
/* -------------------------------------------------------------------------- */
export function formatDuration(minutes) {
  if (!minutes) return "—";

  if (minutes < 60) return `${Math.round(minutes)} min`;

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}min`;
}

/* -------------------------------------------------------------------------- */
/* EXPORTS                                                                    */
/* -------------------------------------------------------------------------- */
export default {
  getCurrentPosition,
  watchPosition,
  calculateRoute,
  getDistance,
  isNearLocation,
  formatDistance,
  formatDuration,
};
