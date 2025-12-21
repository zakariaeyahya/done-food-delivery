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
        connectionWarningShown = false;
        isConnected = true;
      });

      newSocket.on("connect_error", () => {
        if (!connectionWarningShown && !isCleaningUp) {
          connectionWarningShown = true;
        }
      });

      newSocket.on("disconnect", () => {
        if (isConnected && !isCleaningUp) {
        }
        isConnected = false;
      });

      newSocket.connect();
      setSocket(newSocket);
    } catch (err) {
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
        }
      }
    };
  }, []);

  useEffect(() => {
    if (socket && address) {
      socket.emit("join-deliverer-room", address);
    }
  }, [socket, address]);

  useEffect(() => {
    geolocation
      .getCurrentPosition()
      .then((location) => {
        setCurrentLocation(location);
      })
      .catch((error) => {
      });
  }, []);

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

