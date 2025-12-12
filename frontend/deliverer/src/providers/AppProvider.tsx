"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import io, { Socket } from "socket.io-client";
import geolocation from "@/services/geolocation";

interface AppContextType {
  address: string | null;
  setAddress: (address: string | null) => void;
  socket: Socket | null;
  currentLocation: { lat: number; lng: number; accuracy?: number } | null;
  setCurrentLocation: (location: { lat: number; lng: number; accuracy?: number } | null) => void;
  activeDelivery: any | null;
  setActiveDelivery: (delivery: any | null) => void;
  connectWallet: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<any | null>(null);

  // Init Socket.io
  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.VITE_SOCKET_URL || "http://localhost:3000";
    let newSocket: Socket | null = null;
    let connectionWarningShown = false;
    let isConnected = false;
    let isCleaningUp = false;

    try {
      newSocket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 3,
        timeout: 5000,
        autoConnect: false,
      });

      newSocket.on("connect", () => {
        console.log("✅ WebSocket connected to backend");
        connectionWarningShown = false;
        isConnected = true;
      });

      newSocket.on("connect_error", () => {
        if (!connectionWarningShown && !isCleaningUp) {
          console.warn("⚠️ Backend server not available. Real-time features disabled. Start backend at:", SOCKET_URL);
          connectionWarningShown = true;
        }
      });

      newSocket.on("disconnect", () => {
        if (isConnected && !isCleaningUp) {
          console.log("WebSocket disconnected");
        }
        isConnected = false;
      });

      // Start connection attempt
      newSocket.connect();
      setSocket(newSocket);
    } catch (err) {
      console.warn("Failed to initialize WebSocket");
    }

    return () => {
      isCleaningUp = true;
      if (newSocket) {
        try {
          newSocket.removeAllListeners();
          if (isConnected) {
            newSocket.disconnect();
          }
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Join deliverer room
  useEffect(() => {
    if (socket && address) {
      console.log(`[Livreur] 🏠 Rejoindre room Socket.io pour livreur ${address}`);
      socket.emit("join-deliverer-room", address);
      console.log(`[Livreur] ✅ Room rejointe pour livreur ${address}`);
    }
  }, [socket, address]);

  // Load GPS
  useEffect(() => {
    console.log("[Livreur] 📍 Chargement position GPS...");
    geolocation
      .getCurrentPosition()
      .then((location) => {
        console.log(`[Livreur] ✅ Position GPS chargée: lat=${location.lat}, lng=${location.lng}`);
        setCurrentLocation(location);
      })
      .catch((error) => {
        console.warn("[Livreur] ⚠️ Géolocalisation indisponible:", error.message);
      });
  }, []);

  // Auto-connect wallet
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            localStorage.setItem("walletAddress", accounts[0]);
          }
        })
        .catch(console.error);
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask non installé");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      setAddress(walletAddress);
      localStorage.setItem("walletAddress", walletAddress);
    } catch (error) {
      alert("Erreur connexion wallet");
    }
  };

  return (
    <AppContext.Provider
      value={{
        address,
        setAddress,
        socket,
        currentLocation,
        setCurrentLocation,
        activeDelivery,
        setActiveDelivery,
        connectWallet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

