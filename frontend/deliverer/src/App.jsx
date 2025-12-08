/**
 * Composant racine App
 * Configuration : React Router, Context API, Socket.io, Geolocation
 */

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import io from "socket.io-client";

import HomePage from "./pages/HomePage";
import DeliveriesPage from "./pages/DeliveriesPage";
import EarningsPage from "./pages/EarningsPage";
import ProfilePage from "./pages/ProfilePage";

import ConnectWallet from "./components/ConnectWallet";
import geolocation from "./services/geolocation";

// Contexts
const WalletContext = createContext();
const SocketContext = createContext();
const GeolocationContext = createContext();
const DeliveryContext = createContext();

/**
 * Composant App
 */
function App() {
  // Global states
  const [address, setAddress] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);

  /** Initialiser Socket.io */
  useEffect(() => {
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  /** Rejoindre room livreur */
  useEffect(() => {
    if (socket && address) {
      socket.emit("joinRoom", `deliverer_${address}`);
    }
  }, [socket, address]);

  /** Charger position GPS au montage */
  useEffect(() => {
    geolocation
      .getCurrentPosition()
      .then((pos) => setCurrentLocation(pos))
      .catch((err) => console.error("Error getting location:", err));
  }, []);

  return (
    <BrowserRouter>
      <WalletContext.Provider value={{ address, setAddress }}>
        <SocketContext.Provider value={socket}>
          <GeolocationContext.Provider
            value={{ currentLocation, setCurrentLocation }}
          >
            <DeliveryContext.Provider
              value={{ activeDelivery, setActiveDelivery }}
            >
              <div className="app">
                {/* HEADER */}
                <header className="app-header">
                  <h1>DONE Livreur</h1>

                  <nav>
                    <Link to="/">Accueil</Link>
                    <Link to="/deliveries">Livraisons</Link>
                    <Link to="/earnings">Revenus</Link>
                    <Link to="/profile">Profil</Link>
                  </nav>

                  <ConnectWallet />
                </header>

                {/* MAIN */}
                <main className="app-main">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/deliveries" element={<DeliveriesPage />} />
                    <Route path="/earnings" element={<EarningsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Routes>
                </main>

                {/* FOOTER */}
                <footer className="app-footer">
                  <p>&copy; 2025 DONE Food Delivery</p>
                </footer>
              </div>
            </DeliveryContext.Provider>
          </GeolocationContext.Provider>
        </SocketContext.Provider>
      </WalletContext.Provider>
    </BrowserRouter>
  );
}

/**
 * Hooks d'accès aux Contexts
 */
export function useWallet() {
  return useContext(WalletContext);
}

export function useSocket() {
  return useContext(SocketContext);
}

export function useGeolocation() {
  return useContext(GeolocationContext);
}

export function useDelivery() {
  return useContext(DeliveryContext);
}

export default App;
