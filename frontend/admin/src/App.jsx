/**
 * App.jsx - Routing principal + Layout Admin
 * Conforme au Sprint 8 : Sidebar, Topbar, Routing, Layout, Admin auth
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// LAYOUT
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

// PAGES
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import DeliverersPage from "./pages/DeliverersPage";
import OrdersPage from "./pages/OrdersPage";
import DisputesPage from "./pages/DisputesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage"; // optionnel

// COMPONENTS
import ConnectWallet from "./components/ConnectWallet";

// CONTEXT ADMIN (à créer si non fait)
import { WalletProvider, useWallet } from "./context/WalletContext";


// =======================
// PROTECTION DES ROUTES
// =======================
function ProtectedRoute({ children }) {
  const { address, hasAdminRole, isLoading } = useWallet();

  // Afficher un loader pendant la vérification auto-connexion
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  if (!address) {
    return <ConnectWallet />;
  }

  return children;
}


// =======================
// LAYOUT PRINCIPAL
// =======================
function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">

      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENU */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <Topbar />

        {/* PAGE */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
}


// =======================
// APPLICATION ROOT
// =======================
export default function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>

          {/* DASHBOARD */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* USERS */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <UsersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* RESTAURANTS */}
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <RestaurantsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* DELIVERERS */}
          <Route
            path="/deliverers"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DeliverersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ORDERS */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <OrdersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* DISPUTES */}
          <Route
            path="/disputes"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DisputesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ANALYTICS */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AnalyticsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* SETTINGS */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <SettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all → redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </WalletProvider>
  );
}
