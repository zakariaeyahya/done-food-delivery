/**
 * Composant App - Racine de l'application Restaurant
 * @notice Composant principal qui configure routing, contexts, layout
 * @dev Gère état global, navigation sidebar, Socket.io, authentification restaurant
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// Import Socket.io
import io from 'socket.io-client';

// Import des pages
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Import des composants
import ConnectWallet from './components/ConnectWallet';

// Import des services
import * as blockchain from './services/blockchain';
import * as api from './services/api';

/**
 * Context pour le Wallet Restaurant
 * @notice Fournit wallet, address, balance, restaurant à toute l'application
 */
const WalletContext = createContext(null);

/**
 * Context pour Socket.io
 * @notice Fournit socket connection à toute l'application
 */
const SocketContext = createContext(null);

/**
 * Provider pour WalletContext
 * @notice Gère l'état du wallet restaurant et fournit les méthodes de connexion
 */
function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState('0');
  const [restaurant, setRestaurant] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // useEffect pour charger wallet depuis localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('restaurantWalletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
      // Charger restaurant profile
      fetchRestaurantProfile(savedAddress);
    }
  }, []);

  // Fonction pour connecter wallet
  async function connect() {
    try {
      const { address: connectedAddress } = await blockchain.connectWallet();
      setAddress(connectedAddress);
      setIsConnected(true);
      localStorage.setItem('restaurantWalletAddress', connectedAddress);
      await fetchRestaurantProfile(connectedAddress);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  // Fonction pour déconnecter wallet
  function disconnect() {
    setAddress(null);
    setBalance('0');
    setRestaurant(null);
    setIsConnected(false);
    localStorage.removeItem('restaurantWalletAddress');
  }

  // Fonction pour charger restaurant profile
  async function fetchRestaurantProfile(address) {
    try {
      // Chercher restaurant par address
      const restaurantData = await api.getRestaurantByAddress(address);
      setRestaurant(restaurantData);
    } catch (error) {
      console.error('Error fetching restaurant profile:', error);
    }
  }

  return (
    <WalletContext.Provider value={{ address, balance, restaurant, isConnected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Provider pour SocketContext
 * @notice Gère la connexion Socket.io
 */
function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  // useEffect pour initialiser Socket.io
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Composant Sidebar
 * @notice Navigation sidebar pour dashboard restaurant
 */
function Sidebar() {
  const location = useLocation();

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <h2>DONE Restaurant</h2>
      </div>

      <nav className="sidebar-nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>
          Commandes
        </Link>
        <Link to="/menu" className={location.pathname === '/menu' ? 'active' : ''}>
          Menu
        </Link>
        <Link to="/analytics" className={location.pathname === '/analytics' ? 'active' : ''}>
          Statistiques
        </Link>
      </nav>
    </div>
  );
}

/**
 * Composant Header
 * @notice Header avec ConnectWallet et notifications
 */
function Header() {
  const { restaurant, address } = useContext(WalletContext);

  return (
    <div className="dashboard-header">
      <div className="header-content">
        {restaurant && <h1>{restaurant.name}</h1>}
        <ConnectWallet />
      </div>
    </div>
  );
}

/**
 * Composant Layout
 * @notice Layout avec sidebar et header
 */
function Layout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Composant App principal
 * @notice Configure routing et providers
 */
function App() {
  return (
    <WalletProvider>
      <SocketProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </SocketProvider>
    </WalletProvider>
  );
}

// Exporter les Contexts pour utilisation dans autres composants
export { WalletContext, SocketContext };

// Exporter le composant App
export default App;
