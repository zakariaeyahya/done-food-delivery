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
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    return () => newSocket.close();
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
      .catch(console.error);
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
      <BrowserRouter>
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
