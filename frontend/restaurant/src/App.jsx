import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RegisterPage from './pages/RegisterPage';

import ConnectWallet from './components/ConnectWallet';

import { WalletProvider, useWallet } from './contexts/WalletContext';
import { SocketContext, SocketProvider } from './contexts/SocketContext';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '' },
    { path: '/orders', label: 'Commandes', icon: '' },
    { path: '/menu', label: 'Menu', icon: '' },
    { path: '/analytics', label: 'Statistiques', icon: '' },
  ];

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="flex items-center gap-3">
          <span className="text-2xl"></span>
          <h2>DONE Restaurant</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="px-6 py-4 text-xs text-orange-200">
          © 2025 DONE Platform
        </div>
      </div>
    </div>
  );
}

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

function ProtectedRoute({ children }) {
  const { address, restaurant, isConnected, loading } = useWallet();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isConnected || !address || !restaurant) {
    return <Navigate to="/register" replace />;
  }

  return children;
}

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

export { SocketContext };

export default App;
