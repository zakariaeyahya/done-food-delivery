/**
 * Composant racine App
 * @fileoverview Configuration React Router, Context API, et layout principal
 */

// TODO: Importer React Router et composants
// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// import { useState, useEffect, createContext, useContext } from 'react';
// import io from 'socket.io-client';
// import HomePage from './pages/HomePage';
// import DeliveriesPage from './pages/DeliveriesPage';
// import EarningsPage from './pages/EarningsPage';
// import ProfilePage from './pages/ProfilePage';
// import ConnectWallet from './components/ConnectWallet';
// import { geolocation } from './services/geolocation';

// TODO: Créer Contexts
// const WalletContext = createContext();
// const SocketContext = createContext();
// const GeolocationContext = createContext();
// const DeliveryContext = createContext();

/**
 * Composant App
 * @returns {JSX.Element} Application principale
 */
// TODO: Implémenter App()
// function App() {
//   // State global
//   const [address, setAddress] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [activeDelivery, setActiveDelivery] = useState(null);
//   
//   // Initialiser Socket.io
//   useEffect(() => {
//     const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
//     const newSocket = io(SOCKET_URL);
//     setSocket(newSocket);
//     
//     RETOURNER () => {
//       newSocket.close();
//     };
//   }, []);
//   
//   // Rejoindre room deliverer si connecté
//   useEffect(() => {
//     SI socket && address:
//       socket.emit('joinRoom', `deliverer_${address}`);
//   }, [socket, address]);
//   
//   // Charger position GPS au montage
//   useEffect(() => {
//     geolocation.getCurrentPosition()
//       .then(position => setCurrentLocation(position))
//       .catch(error => console.error('Error getting location:', error));
//   }, []);
//   
//   // Render
//   RETOURNER (
//     <BrowserRouter>
//       <WalletContext.Provider value={{ address, setAddress }}>
//         <SocketContext.Provider value={socket}>
//           <GeolocationContext.Provider value={{ currentLocation, setCurrentLocation }}>
//             <DeliveryContext.Provider value={{ activeDelivery, setActiveDelivery }}>
//               <div className="app">
//                 {/* Header */}
//                 <header className="app-header">
//                   <h1>DONE Livreur</h1>
//                   <nav>
//                     <Link to="/">Accueil</Link>
//                     <Link to="/deliveries">Livraisons</Link>
//                     <Link to="/earnings">Revenus</Link>
//                     <Link to="/profile">Profil</Link>
//                   </nav>
//                   <ConnectWallet />
//                 </header>
//                 
//                 {/* Main content */}
//                 <main className="app-main">
//                   <Routes>
//                     <Route path="/" element={<HomePage />} />
//                     <Route path="/deliveries" element={<DeliveriesPage />} />
//                     <Route path="/earnings" element={<EarningsPage />} />
//                     <Route path="/profile" element={<ProfilePage />} />
//                   </Routes>
//                 </main>
//                 
//                 {/* Footer */}
//                 <footer className="app-footer">
//                   <p>&copy; 2025 DONE Food Delivery</p>
//                 </footer>
//               </div>
//             </DeliveryContext.Provider>
//           </GeolocationContext.Provider>
//         </SocketContext.Provider>
//       </WalletContext.Provider>
//     </BrowserRouter>
//   );
// }

// TODO: Exporter hooks pour utiliser les contexts
// export function useWallet() {
//   return useContext(WalletContext);
// }
// 
// export function useSocket() {
//   return useContext(SocketContext);
// }
// 
// export function useGeolocation() {
//   return useContext(GeolocationContext);
// }
// 
// export function useDelivery() {
//   return useContext(DeliveryContext);
// }

// TODO: Exporter App
// export default App;

