/**
 * Composant App - Racine de l'application Restaurant
 * @notice Composant principal qui configure routing, contexts, layout
 * @dev Gère état global, navigation sidebar, Socket.io, authentification restaurant
 */

<<<<<<< HEAD
import { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// Import Socket.io
import io from 'socket.io-client';
=======
import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
>>>>>>> main

// Import des pages
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RegisterPage from './pages/RegisterPage';

// Import des composants
import ConnectWallet from './components/ConnectWallet';

// Import des contexts
<<<<<<< HEAD
import { WalletProvider, useWallet } from './contexts/WalletContext';

/**
 * Context pour Socket.io
 * @notice Fournit socket connection à toute l'application
 */
const SocketContext = createContext(null);

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
=======
import { WalletContext, WalletProvider } from './contexts/WalletContext';
import { SocketContext, SocketProvider } from './contexts/SocketContext';
>>>>>>> main

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
  const { restaurant, address } = useWallet();

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
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </WalletProvider>
  );
}

// Exporter SocketContext pour utilisation dans autres composants
export { SocketContext };

// Exporter le composant App
export default App;
