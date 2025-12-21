"use client";

import { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
  DirectionsService,
} from "@react-google-maps/api";
import geolocation from "@/services/geolocation";

interface NavigationMapProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  step: "pickup" | "delivery";
  onArrival?: () => void;
}

export default function NavigationMap({
  origin,
  destination,
  step,
  onArrival,
}: NavigationMapProps) {
  const [directions, setDirections] = useState<any>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(origin);
  const [eta, setEta] = useState<number | null>(null);
  const [map, setMap] = useState<any>(null);

  const watchIdRef = useRef<number | null>(null);
  const GOOGLE_MAPS_API_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    "";

  useEffect(() => {
    if (origin && destination) {
      calculateRoute();
    }
  }, [origin, destination]);

  useEffect(() => {
    if (!origin) return;

    watchIdRef.current = geolocation.watchPosition((pos: { lat: number; lng: number; accuracy?: number; timestamp?: number }) => {
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
    if (!origin || !destination) return;
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
      100
    );

    if (reached && onArrival) {
      onArrival();
    }
  }, [currentPosition, destination, onArrival]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-[400px] bg-white/5 rounded-lg flex items-center justify-center">
        <p className="text-slate-400">Clé API Google Maps manquante</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={
          currentPosition || origin || { lat: 48.8566, lng: 2.3522 }
        }
        zoom={14}
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        {currentPosition && (
          <Marker position={currentPosition} label=" Vous" />
        )}

        {step === "pickup" && destination && (
          <Marker position={destination} label="🍽️ Restaurant" />
        )}

        {step === "delivery" && destination && (
          <Marker position={destination} label="🏠 Client" />
        )}

        {directions && <DirectionsRenderer directions={directions} />}

        {origin && destination && (
          <DirectionsService
            options={{
              origin: origin,
              destination: destination,
              travelMode: "DRIVING" as any,
            }}
            callback={(result, status) => {
              if (status === "OK") {
                setDirections(result);
              }
            }}
          />
        )}
      </GoogleMap>

      {eta && (
        <div className="mt-2 text-center text-sm text-slate-400">
          Temps estimé : {geolocation.formatDuration(eta)}
        </div>
      )}
    </LoadScript>
  );
}

