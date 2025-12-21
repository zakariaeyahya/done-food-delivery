
import { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
  DirectionsService,
} from "@react-google-maps/api";

import geolocation from "../services/geolocation";

function NavigationMap({ origin, destination, step, onArrival }) {
  const [directions, setDirections] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(origin);
  const [eta, setEta] = useState(null);
  const [map, setMap] = useState(null);

  const watchIdRef = useRef(null);
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (origin && destination) {
      calculateRoute();
    }
  }, [origin, destination]);

  useEffect(() => {
    if (!origin) return;

    watchIdRef.current = geolocation.watchPosition((pos) => {
      setCurrentPosition(pos);

      if (directions) {
        calculateRoute();
      }
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  async function calculateRoute() {
    try {
      const routeData = await geolocation.calculateRoute(origin, destination);

      setDirections(routeData.route);
      setEta(routeData.duration);
    } catch (err) {
    }
  }

  useEffect(() => {
    if (!currentPosition || !destination) return;

    const reached = geolocation.isNearLocation(
      currentPosition,
      destination,
      100 // rayon de 100 m
    );

    if (reached && onArrival) {
      onArrival();
    }
  }, [currentPosition, destination]);

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={currentPosition || origin || { lat: 48.8566, lng: 2.3522 }}
        zoom={14}
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        {/* Marker position du livreur */}
        {currentPosition && (
          <Marker position={currentPosition} label=" Vous" />
        )}

        {/* Restaurant */}
        {step === "pickup" && destination && (
          <Marker position={destination} label="🍽️ Restaurant" />
        )}

        {/* Client */}
        {step === "delivery" && destination && (
          <Marker position={destination} label="🏠 Client" />
        )}

        {/* Affichage itinéraire */}
        {directions && <DirectionsRenderer directions={directions} />}

        {/* DirectionsService (recalcul automatique) */}
        {origin && destination && (
          <DirectionsService
            options={{
              origin: origin,
              destination: destination,
              travelMode: "DRIVING",
            }}
            callback={(result, status) => {
              if (status === "OK") {
                setDirections(result);
              }
            }}
          />
        )}
      </GoogleMap>

      {/* Affichage ETA */}
      {eta && (
        <div className="eta">
          Temps estimé : {geolocation.formatDuration(eta)}
        </div>
      )}
    </LoadScript>
  );
}

export default NavigationMap;
