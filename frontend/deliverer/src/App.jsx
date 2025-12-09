import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import io from "socket.io-client";
import geolocation from "./services/geolocation";
import "./App.css";

import HomePage from "./pages/HomePage";
import DeliveriesPage from "./pages/DeliveriesPage";
import EarningsPage from "./pages/EarningsPage";
import ProfilePage from "./pages/ProfilePage";

// Global Context
const AppContext = createContext();

function App() {
  const [address, setAddress] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);

  // Init Socket.io
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
    let newSocket = null;
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
        autoConnect: false  // Manual connection control
      });

      newSocket.on("connect", () => {
        console.log("✅ WebSocket connected to backend");
        connectionWarningShown = false;
        isConnected = true;
      });

      newSocket.on("connect_error", (error) => {
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
      socket.emit("join-deliverer-room", address);
    }
  }, [socket, address]);

  // Load GPS
  useEffect(() => {
    geolocation
      .getCurrentPosition()
      .then(setCurrentLocation)
      .catch((error) => {
        // Gérer l'erreur de géolocalisation de manière gracieuse
        console.warn("⚠️ Géolocalisation indisponible:", error.message);
        // L'application continue de fonctionner sans position GPS
        // L'utilisateur pourra activer la géolocalisation plus tard si nécessaire
      });
  }, []);

  // Auto-connect wallet
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            localStorage.setItem('walletAddress', accounts[0]);
          }
        })
        .catch(console.error);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask non installé");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      setAddress(walletAddress);
      localStorage.setItem('walletAddress', walletAddress);
    } catch (error) {
      alert("Erreur connexion wallet");
    }
  };

  return (
    <AppContext.Provider value={{ address, setAddress, socket, currentLocation, setCurrentLocation, activeDelivery, setActiveDelivery, connectWallet }}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="app">
          <header className="header">
            <h1>🚀 DONE Livreur</h1>
            <nav>
              <Link to="/">Accueil</Link>
              <Link to="/deliveries">Livraisons</Link>
              <Link to="/earnings">Revenus</Link>
              <Link to="/profile">Profil</Link>
            </nav>
            {address ? (
              <div className="wallet-badge">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            ) : (
              <button onClick={connectWallet} className="btn-primary">
                Connecter Wallet
              </button>
            )}
          </header>

          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/deliveries" element={<DeliveriesPage />} />
              <Route path="/earnings" element={<EarningsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>

          <footer>
            <p>&copy; 2025 DONE Food Delivery</p>
          </footer>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export default App;
