import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import io from "socket.io-client";
import geolocation from "./services/geolocation";
import "./App.css";

import HomePage from "./pages/HomePage";
import DeliveriesPage from "./pages/DeliveriesPage";
import EarningsPage from "./pages/EarningsPage";
import ProfilePage from "./pages/ProfilePage";

const AppContext = createContext();

function App() {
  const [address, setAddress] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);

  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
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
        autoConnect: false
      });

      newSocket.on("connect", () => {
        connectionWarningShown = false;
        isConnected = true;
      });

      newSocket.on("connect_error", (error) => {
        if (!connectionWarningShown && !isCleaningUp) {
          connectionWarningShown = true;
        }
      });

      newSocket.on("disconnect", () => {
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
      .then(setCurrentLocation)
      .catch((error) => {
      });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            localStorage.setItem('walletAddress', accounts[0]);
          }
        })
        .catch((error) => {
          if (error.code !== -32002) {
          }
        });
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
      localStorage.setItem('walletAddress', walletAddress);
    } catch (error) {
      if (error.code !== 4001) {
        alert("Erreur connexion wallet");
      }
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
            <h1>DONE Livreur</h1>
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
