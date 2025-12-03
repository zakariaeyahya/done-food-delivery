/**
 * Composant App - Racine de l'application
 * @notice Composant principal qui configure routing, contexts, layout
 * @dev Gère état global, navigation, Socket.io, header/footer
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect, createContext, useContext } from 'react';
// import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// TODO: Importer Socket.io
// import io from 'socket.io-client';

// TODO: Importer les pages
// import HomePage from './pages/HomePage';
// import RestaurantPage from './pages/RestaurantPage';
// import CheckoutPage from './pages/CheckoutPage';
// import TrackingPage from './pages/TrackingPage';
// import ProfilePage from './pages/ProfilePage';

// TODO: Importer les composants
// import ConnectWallet from './components/ConnectWallet';
// import Cart from './components/Cart';

// TODO: Importer les services
// import * as blockchain from './services/blockchain';
// import { formatAddress } from './utils/web3';

// TODO: Importer les Contexts depuis leurs fichiers
// import { WalletContext, WalletProvider } from './contexts/WalletContext';
// import { CartContext, CartProvider } from './contexts/CartContext';
// import { SocketContext, SocketProvider } from './contexts/SocketContext';

/**
 * Composant Header
 * @notice Header avec navigation, ConnectWallet, Cart icon
 */
// TODO: Créer composant Header
// function Header() {
//   const [address, setAddress] = useState(null);
//   const [balance, setBalance] = useState('0');
//   const [isConnected, setIsConnected] = useState(false);
//   
//   // TODO: Fonction pour connecter le wallet
//   // async function connect() {
//   //   ESSAYER:
//   //     const { address: connectedAddress } = await blockchain.connectWallet();
//   //     setAddress(connectedAddress);
//   //     setIsConnected(true);
//   //     
//   //     // Récupérer le solde
//   //     const maticBalance = await blockchain.getBalance(connectedAddress);
//   //     setBalance(maticBalance);
//   //     
//   //     // Sauvegarder dans localStorage
//   //     localStorage.setItem('walletAddress', connectedAddress);
//   //   CATCH error:
//   //     console.error('Error connecting wallet:', error);
//   //   }
//   // }
//   
//   // TODO: Fonction pour déconnecter le wallet
//   // function disconnect() {
//   //   setAddress(null);
//   //   setBalance('0');
//   //   setIsConnected(false);
//   //   localStorage.removeItem('walletAddress');
//   // }
//   
//   // TODO: useEffect pour vérifier wallet connecté au montage
//   // useEffect(() => {
//   //   const savedAddress = localStorage.getItem('walletAddress');
//   //   SI savedAddress:
//   //     setAddress(savedAddress);
//   //     setIsConnected(true);
//   //     // Récupérer balance
//   //     blockchain.getBalance(savedAddress).then(setBalance);
//   // }, []);
//   
//   // TODO: Retourner le Provider
//   // RETOURNER (
//   //   <WalletContext.Provider value={{ address, balance, isConnected, connect, disconnect }}>
//   //     {children}
//   //   </WalletContext.Provider>
//   // );
// }

/**
 * Provider pour CartContext
 * @notice Gère l'état du panier global
 */
// TODO: Créer CartProvider
// function CartProvider({ children }) {
//   const [cart, setCart] = useState([]);
//   
//   // TODO: Charger panier depuis localStorage au montage
//   // useEffect(() => {
//   //   const savedCart = localStorage.getItem('cart');
//   //   SI savedCart:
//   //     setCart(JSON.parse(savedCart));
//   // }, []);
//   
//   // TODO: Sauvegarder panier dans localStorage quand il change
//   // useEffect(() => {
//   //   localStorage.setItem('cart', JSON.stringify(cart));
//   // }, [cart]);
//   
//   // TODO: Fonction pour ajouter un item au panier
//   // function addItem(item) {
//   //   setCart(prev => {
//   //     // Vérifier si l'item existe déjà (même id)
//   //     const existingIndex = prev.findIndex(i => i.id === item.id);
//   //     
//   //     SI existingIndex >= 0:
//   //       // Incrémenter la quantité
//   //       const updated = [...prev];
//   //       updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + (item.quantity || 1);
//   //       RETOURNER updated;
//   //     SINON:
//   //       // Ajouter nouvel item
//   //       RETOURNER [...prev, { ...item, quantity: item.quantity || 1 }];
//   //   });
//   // }
//   
//   // TODO: Fonction pour supprimer un item du panier
//   // function removeItem(itemId) {
//   //   setCart(prev => prev.filter(item => item.id !== itemId));
//   // }
//   
//   // TODO: Fonction pour modifier la quantité d'un item
//   // function updateQuantity(itemId, quantity) {
//   //   setCart(prev => prev.map(item => 
//   //     item.id === itemId ? { ...item, quantity } : item
//   //   ));
//   // }
//   
//   // TODO: Fonction pour vider le panier
//   // function clearCart() {
//   //   setCart([]);
//   // }
//   
//   // TODO: Retourner le Provider
//   // RETOURNER (
//   //   <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart }}>
//   //     {children}
//   //   </CartContext.Provider>
//   // );
// }

/**
 * Provider pour SocketContext
 * @notice Gère la connexion Socket.io globale
 */
// TODO: Créer SocketProvider
// function SocketProvider({ children }) {
//   const [socket, setSocket] = useState(null);
//   const { address } = useContext(WalletContext);
//   
//   // TODO: Initialiser Socket.io au montage
//   // useEffect(() => {
//   //   const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
//   //   const newSocket = io(socketUrl);
//   //   
//   //   setSocket(newSocket);
//   //   
//   //   // Rejoindre la room du client si wallet connecté
//   //   SI address:
//   //     newSocket.emit('joinRoom', `client_${address}`);
//   //   
//   //   // Cleanup au démontage
//   //   RETOURNER () => {
//   //     newSocket.disconnect();
//   //   };
//   // }, [address]);
//   
//   // TODO: Retourner le Provider
//   // RETOURNER (
//   //   <SocketContext.Provider value={{ socket }}>
//   //     {children}
//   //   </SocketContext.Provider>
//   // );
// }

/**
 * Composant Header
 * @notice Header avec navigation, ConnectWallet, Cart icon
 */
// TODO: Créer composant Header
// function Header() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { cart } = useContext(CartContext);
//   const { address, isConnected } = useContext(WalletContext);
//   
//   // TODO: Calculer nombre d'items dans panier
//   // const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
//   
//   // TODO: Fonction pour vérifier si route est active
//   // function isActive(path) {
//   //   RETOURNER location.pathname === path;
//   // }
//   
//   // TODO: Rendu du Header
//   // RETOURNER (
//   //   <header className="app-header">
//   //     <div className="header-content container-custom">
//   //       {/* Logo et navigation */}
//   //       <div className="header-left">
//   //         <Link to="/" className="logo">
//   //           <h1>DONE Food</h1>
//   //         </Link>
//   //         
//   //         <nav className="header-nav">
//   //           <Link 
//   //             to="/" 
//   //             className={`nav-link ${isActive('/') ? 'active' : ''}`}
//   //           >
//   //             Accueil
//   //           </Link>
//   //           <Link 
//   //             to="/restaurants" 
//   //             className={`nav-link ${isActive('/restaurants') ? 'active' : ''}`}
//   //           >
//   //             Restaurants
//   //           </Link>
//   //           SI isConnected:
//   //             <Link 
//   //               to="/profile" 
//   //               className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
//   //             >
//   //               Profil
//   //             </Link>
//   //         </nav>
//   //       </div>
//   //       
//   //       {/* Actions (Wallet + Cart) */}
//   //       <div className="header-right">
//   //         {/* ConnectWallet */}
//   //         <ConnectWallet />
//   //         
//   //         {/* Cart icon avec badge */}
//   //         <button
//   //           onClick={() => navigate('/checkout')}
//   //           className="cart-icon-button"
//   //           disabled={cartItemCount === 0}
//   //         >
//   //           🛒
//   //           SI cartItemCount > 0:
//   //             <span className="cart-badge">{cartItemCount}</span>
//   //         </button>
//   //       </div>
//   //     </div>
//   //   </header>
//   // );
// }

/**
 * Composant Footer
 * @notice Footer avec liens et copyright
 */
// TODO: Créer composant Footer
// function Footer() {
//   // TODO: Rendu du Footer
//   // RETOURNER (
//   //   <footer className="app-footer">
//   //     <div className="footer-content container-custom">
//   //       <div className="footer-section">
//   //         <h3>DONE Food Delivery</h3>
//   //         <p>Livraison de repas décentralisée sur blockchain</p>
//   //       </div>
//   //       
//   //       <div className="footer-section">
//   //         <h4>Liens utiles</h4>
//   //         <ul>
//   //           <li><Link to="/">Accueil</Link></li>
//   //           <li><Link to="/restaurants">Restaurants</Link></li>
//   //           <li><Link to="/profile">Profil</Link></li>
//   //         </ul>
//   //       </div>
//   //       
//   //       <div className="footer-section">
//   //         <h4>Support</h4>
//   //         <ul>
//   //           <li><a href="/help">Aide</a></li>
//   //           <li><a href="/contact">Contact</a></li>
//   //           <li><a href="/terms">CGU</a></li>
//   //         </ul>
//   //       </div>
//   //       
//   //       <div className="footer-bottom">
//   //         <p>&copy; {new Date().getFullYear()} DONE Food Delivery. Tous droits réservés.</p>
//   //       </div>
//   //     </div>
//   //   </footer>
//   // );
// }

/**
 * Composant App principal
 * @notice Configure routing, contexts, layout
 */
// TODO: Créer composant App
// function App() {
//   // TODO: Rendu de l'application
//   // RETOURNER (
//   //   <BrowserRouter>
//   //     {/* Providers pour état global */}
//   //     <WalletProvider>
//   //       <CartProvider>
//   //         <SocketProvider>
//   //           {/* Layout avec Header et Footer */}
//   //           <div className="app-container">
//   //             {/* Header */}
//   //             <Header />
//   //             
//   //             {/* Contenu principal avec routes */}
//   //             <main className="main-content">
//   //               <Routes>
//   //                 <Route path="/" element={<HomePage />} />
//   //                 <Route path="/restaurant/:id" element={<RestaurantPage />} />
//   //                 <Route path="/checkout" element={<CheckoutPage />} />
//   //                 <Route path="/tracking/:orderId" element={<TrackingPage />} />
//   //                 <Route path="/profile" element={<ProfilePage />} />
//   //                 
//   //                 {/* Route 404 */}
//   //                 <Route path="*" element={
//   //                   <div className="not-found-page">
//   //                     <h1>404 - Page non trouvée</h1>
//   //                     <Link to="/">Retour à l'accueil</Link>
//   //                   </div>
//   //                 } />
//   //               </Routes>
//   //             </main>
//   //             
//   //             {/* Footer */}
//   //             <Footer />
//   //           </div>
//   //         </SocketProvider>
//   //       </CartProvider>
//   //     </WalletProvider>
//   //   </BrowserRouter>
//   // );
// }

// NOTE: Les Contexts sont exportés depuis leurs fichiers respectifs:
// - WalletContext depuis './contexts/WalletContext'
// - CartContext depuis './contexts/CartContext'
// - SocketContext depuis './contexts/SocketContext'

// TODO: Exporter le composant App
// export default App;

