// Pas besoin d'importer Math, c'est un objet global en JavaScript

/**
 * Service de simulation de tracking GPS
 * @notice Simule le tracking GPS des livreurs pour calculer distances, ETA, etc.
 * @dev Utilise la formule Haversine pour calculer les distances entre coordonnées GPS
 */
/**
 * Calcule la distance entre deux points GPS en utilisant la formule Haversine
 * 
 * Formule Haversine:
 * a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlng/2)
 * c = 2 * atan2(√a, √(1-a))
 * distance = R * c (où R = rayon de la Terre ≈ 6371 km)
 * 
 * @param {number} lat1 - Latitude du premier point (degrés)
 * @param {number} lng1 - Longitude du premier point (degrés)
 * @param {number} lat2 - Latitude du deuxième point (degrés)
 * @param {number} lng2 - Longitude du deuxième point (degrés)
 * @returns {number} Distance en kilomètres
 */
/**
 * Fonction helper pour convertir degrés en radians
 * @param {number} degrees - Angle en degrés
 * @returns {number} Angle en radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  try {
    // Vérifier que les coordonnées sont valides
    if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (lng1 < -180 || lng1 > 180 || lng2 < -180 || lng2 > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }
    
    // Convertir les degrés en radians
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);
    
    // Calculer a (partie de la formule Haversine)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    // Calculer c (angle central)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    // Calculer la distance
    const distance = R * c;
    
    // Retourner la distance arrondie à 2 décimales
    return Math.round(distance * 100) / 100;
  } catch (error) {
    // Logger l'erreur
    console.error("Error calculating distance:", error);
    throw error;
  }
}

/**
 * Vérifie si un livreur est à proximité d'une cible dans un rayon donné
 * 
 * @param {Object} delivererLocation - Position du livreur { lat, lng }
 * @param {Object} targetLocation - Position cible { lat, lng }
 * @param {number} radiusKm - Rayon en kilomètres
 * @returns {boolean} True si le livreur est dans le rayon
 */
function isNearby(delivererLocation, targetLocation, radiusKm) {
  try {
    // Vérifier que les paramètres sont valides
    if (!delivererLocation || !targetLocation || typeof radiusKm !== 'number') {
      throw new Error("Invalid parameters for isNearby");
    }
    
    if (radiusKm < 0) {
      throw new Error("radiusKm must be positive");
    }
    
    // Calculer la distance entre les deux points
    const distance = calculateDistance(
      delivererLocation.lat,
      delivererLocation.lng,
      targetLocation.lat,
      targetLocation.lng
    );
    
    // Vérifier si la distance est <= radiusKm
    return distance <= radiusKm;
  } catch (error) {
    // Logger l'erreur
    console.error("Error checking if nearby:", error);
    return false;
  }
}

/**
 * Calcule le temps estimé d'arrivée (ETA) en minutes
 * 
 * @param {Object} currentLocation - Position actuelle { lat, lng }
 * @param {Object} destinationLocation - Position de destination { lat, lng }
 * @param {number} speedKmh - Vitesse moyenne en km/h (défaut: 30 km/h)
 * @returns {number} ETA en minutes (arrondi)
 */
function getETA(currentLocation, destinationLocation, speedKmh = 30) {
  try {
    // Vérifier que les paramètres sont valides
    if (!currentLocation || !destinationLocation) {
      throw new Error("Invalid locations for ETA calculation");
    }
    
    // Vérifier que speedKmh est positif
    if (speedKmh <= 0) {
      speedKmh = 30; // Valeur par défaut
    }
    
    // Calculer la distance en kilomètres
    const distanceKm = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destinationLocation.lat,
      destinationLocation.lng
    );
    
    // Calculer le temps en heures
    const timeHours = distanceKm / speedKmh;
    
    // Convertir en minutes
    const timeMinutes = timeHours * 60;
    
    // Arrondir à l'entier supérieur (toujours surestimer)
    const etaMinutes = Math.ceil(timeMinutes);
    
    // Retourner l'ETA en minutes (minimum 1 minute)
    return Math.max(1, etaMinutes);
  } catch (error) {
    // Logger l'erreur
    console.error("Error calculating ETA:", error);
    return null;
  }
}

/**
 * Génère une route simulée entre deux points GPS
 * 
 * Génère des points GPS intermédiaires pour simuler le trajet d'un livreur.
 * Utilise une interpolation linéaire entre le point de départ et d'arrivée.
 * 
 * @param {Object} startLocation - Point de départ { lat, lng }
 * @param {Object} endLocation - Point d'arrivée { lat, lng }
 * @param {number} steps - Nombre de points intermédiaires (défaut: 10)
 * @returns {Array<Object>} Tableau de points GPS [{ lat, lng }, ...]
 */
function generateMockRoute(startLocation, endLocation, steps = 10) {
  try {
    // Vérifier que les paramètres sont valides
    if (!startLocation || !endLocation) {
      throw new Error("Invalid locations for route generation");
    }
    
    // Vérifier que steps est un nombre positif
    if (steps <= 0) {
      steps = 10; // Valeur par défaut
    }
    
    // Créer un tableau pour stocker les points
    const route = [];
    const startTime = Date.now();
    
    // Ajouter le point de départ
    route.push({
      lat: startLocation.lat,
      lng: startLocation.lng,
      timestamp: new Date(startTime)
    });
    
    // Générer les points intermédiaires par interpolation linéaire
    for (let i = 1; i < steps; i++) {
      const ratio = i / steps; // Ratio de progression (0 à 1)
      
      // Interpoler la latitude
      const lat = startLocation.lat + (endLocation.lat - startLocation.lat) * ratio;
      
      // Interpoler la longitude
      const lng = startLocation.lng + (endLocation.lng - startLocation.lng) * ratio;
      
      // Ajouter un peu de variation aléatoire pour simuler un trajet réel
      const randomVariation = 0.001; // Variation de ~100m
      const latVariation = (Math.random() - 0.5) * randomVariation;
      const lngVariation = (Math.random() - 0.5) * randomVariation;
      
      // Ajouter le point à la route
      route.push({
        lat: lat + latVariation,
        lng: lng + lngVariation,
        timestamp: new Date(startTime + (i * 60000)) // +1 minute par point
      });
    }
    
    // Ajouter le point d'arrivée
    route.push({
      lat: endLocation.lat,
      lng: endLocation.lng,
      timestamp: new Date(startTime + (steps * 60000))
    });
    
    // Retourner la route
    return route;
  } catch (error) {
    // Logger l'erreur
    console.error("Error generating mock route:", error);
    throw error;
  }
}

/**
 * Calcule la vitesse moyenne entre deux points GPS avec timestamps
 * 
 * @param {Object} point1 - Premier point { lat, lng, timestamp }
 * @param {Object} point2 - Deuxième point { lat, lng, timestamp }
 * @returns {number} Vitesse en km/h
 */
function calculateSpeed(point1, point2) {
  try {
    // Vérifier que les paramètres sont valides
    if (!point1 || !point2 || !point1.timestamp || !point2.timestamp) {
      throw new Error("Invalid points for speed calculation");
    }
    
    // Calculer la distance en kilomètres
    const distanceKm = calculateDistance(
      point1.lat,
      point1.lng,
      point2.lat,
      point2.lng
    );
    
    // Calculer le temps en heures
    const timeMs = Math.abs(new Date(point2.timestamp) - new Date(point1.timestamp));
    const timeHours = timeMs / (1000 * 60 * 60); // Convertir ms en heures
    
    // Éviter division par zéro
    if (timeHours === 0) {
      return 0;
    }
    
    // Calculer la vitesse en km/h
    const speedKmh = distanceKm / timeHours;
    
    // Retourner la vitesse arrondie
    return Math.round(speedKmh * 100) / 100;
  } catch (error) {
    // Logger l'erreur
    console.error("Error calculating speed:", error);
    return 0;
  }
}

/**
 * Trouve le point le plus proche d'une liste de points
 * 
 * @param {Object} targetLocation - Position cible { lat, lng }
 * @param {Array<Object>} points - Liste de points [{ lat, lng }, ...]
 * @returns {Object} Point le plus proche { lat, lng, distance }
 */
function findNearestPoint(targetLocation, points) {
  try {
    // Vérifier que les paramètres sont valides
    if (!targetLocation || !points || points.length === 0) {
      throw new Error("Invalid parameters for findNearestPoint");
    }
    
    // Initialiser avec le premier point
    let nearestPoint = points[0];
    let minDistance = calculateDistance(
      targetLocation.lat,
      targetLocation.lng,
      points[0].lat,
      points[0].lng
    );
    
    // Parcourir tous les points pour trouver le plus proche
    for (let i = 1; i < points.length; i++) {
      const distance = calculateDistance(
        targetLocation.lat,
        targetLocation.lng,
        points[i].lat,
        points[i].lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = points[i];
      }
    }
    
    // Retourner le point le plus proche avec sa distance
    return {
      ...nearestPoint,
      distance: minDistance
    };
  } catch (error) {
    // Logger l'erreur
    console.error("Error finding nearest point:", error);
    throw error;
  }
}

// Exporter toutes les fonctions
module.exports = {
  calculateDistance,
  isNearby,
  getETA,
  generateMockRoute,
  calculateSpeed,
  findNearestPoint
};

