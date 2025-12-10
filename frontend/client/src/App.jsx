import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexts
import { WalletProvider } from './contexts/WalletContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';

// Layout
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackingPage from './pages/TrackingPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <WalletProvider>
      <SocketProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/restaurant/:id" element={<RestaurantPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/tracking/:orderId" element={<TrackingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </SocketProvider>
    </WalletProvider>
  );
}

export default App;