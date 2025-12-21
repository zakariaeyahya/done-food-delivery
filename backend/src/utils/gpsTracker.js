function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  try {
    if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (lng1 < -180 || lng1 > 180 || lng2 < -180 || lng2 > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }

    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return Math.round(distance * 100) / 100;
  } catch (error) {
    throw error;
  }
}

function isNearby(delivererLocation, targetLocation, radiusKm) {
  try {
    if (!delivererLocation || !targetLocation || typeof radiusKm !== 'number') {
      throw new Error("Invalid parameters for isNearby");
    }

    if (radiusKm < 0) {
      throw new Error("radiusKm must be positive");
    }

    const distance = calculateDistance(
      delivererLocation.lat,
      delivererLocation.lng,
      targetLocation.lat,
      targetLocation.lng
    );

    return distance <= radiusKm;
  } catch (error) {
    return false;
  }
}

function getETA(currentLocation, destinationLocation, speedKmh = 30) {
  try {
    if (!currentLocation || !destinationLocation) {
      throw new Error("Invalid locations for ETA calculation");
    }

    if (speedKmh <= 0) {
      speedKmh = 30;
    }

    const distanceKm = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destinationLocation.lat,
      destinationLocation.lng
    );

    const timeHours = distanceKm / speedKmh;

    const timeMinutes = timeHours * 60;

    const etaMinutes = Math.ceil(timeMinutes);

    return Math.max(1, etaMinutes);
  } catch (error) {
    return null;
  }
}

function generateMockRoute(startLocation, endLocation, steps = 10) {
  try {
    if (!startLocation || !endLocation) {
      throw new Error("Invalid locations for route generation");
    }

    if (steps <= 0) {
      steps = 10;
    }

    const route = [];
    const startTime = Date.now();

    route.push({
      lat: startLocation.lat,
      lng: startLocation.lng,
      timestamp: new Date(startTime)
    });

    for (let i = 1; i < steps; i++) {
      const ratio = i / steps;

      const lat = startLocation.lat + (endLocation.lat - startLocation.lat) * ratio;

      const lng = startLocation.lng + (endLocation.lng - startLocation.lng) * ratio;

      const randomVariation = 0.001;
      const latVariation = (Math.random() - 0.5) * randomVariation;
      const lngVariation = (Math.random() - 0.5) * randomVariation;

      route.push({
        lat: lat + latVariation,
        lng: lng + lngVariation,
        timestamp: new Date(startTime + (i * 60000))
      });
    }

    route.push({
      lat: endLocation.lat,
      lng: endLocation.lng,
      timestamp: new Date(startTime + (steps * 60000))
    });

    return route;
  } catch (error) {
    throw error;
  }
}

function calculateSpeed(point1, point2) {
  try {
    if (!point1 || !point2 || !point1.timestamp || !point2.timestamp) {
      throw new Error("Invalid points for speed calculation");
    }

    const distanceKm = calculateDistance(
      point1.lat,
      point1.lng,
      point2.lat,
      point2.lng
    );

    const timeMs = Math.abs(new Date(point2.timestamp) - new Date(point1.timestamp));
    const timeHours = timeMs / (1000 * 60 * 60);

    if (timeHours === 0) {
      return 0;
    }

    const speedKmh = distanceKm / timeHours;

    return Math.round(speedKmh * 100) / 100;
  } catch (error) {
    return 0;
  }
}

function findNearestPoint(targetLocation, points) {
  try {
    if (!targetLocation || !points || points.length === 0) {
      throw new Error("Invalid parameters for findNearestPoint");
    }

    let nearestPoint = points[0];
    let minDistance = calculateDistance(
      targetLocation.lat,
      targetLocation.lng,
      points[0].lat,
      points[0].lng
    );

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

    return {
      ...nearestPoint,
      distance: minDistance
    };
  } catch (error) {
    throw error;
  }
}
module.exports = {
  calculateDistance,
  isNearby,
  getETA,
  generateMockRoute,
  calculateSpeed,
  findNearestPoint
};

