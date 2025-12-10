/**
 * Composant App - Racine de l'application Restaurant
 * @notice Composant principal qui configure routing, contexts, layout
 * @dev Gère état global, navigation sidebar, Socket.io, authentification restaurant
 */

import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';

// Import des pages
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RegisterPage from './pages/RegisterPage';

// Import des composants
import ConnectWallet from './components/ConnectWallet';

// Import des contexts
import { WalletProvider, useWallet } from './contexts/WalletContext';
import { SocketContext, SocketProvider } from './contexts/SocketContext';

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
 * Composant ProtectedRoute
 * @notice Redirige vers /register si le restaurant n'est pas enregistré
 */
function ProtectedRoute({ children }) {
  const { address, restaurant, isConnected, loading } = useWallet();

  // Attendre que le chargement soit terminé
  if (loading) {
    return (
      <div className="loading-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  // Si pas connecté ou pas de restaurant enregistré, rediriger vers /register
  if (!isConnected || !address || !restaurant) {
    return <Navigate to="/register" replace />;
  }

  return children;
}

/**
 * Composant AppRoutes
 * @notice Gère le routing avec protection
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
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
          <AppRoutes />
        </BrowserRouter>
      </SocketProvider>
    </WalletProvider>
  );
}

// Exporter SocketContext pour utilisation dans autres composants
export { SocketContext };

// Exporter le composant App
export default App;
