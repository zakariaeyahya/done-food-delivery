/**
 * Context SocketContext
 * @notice Fournit socket connection Socket.io à toute l'application
 * @dev Gère connexion Socket.io et rejoindre rooms selon wallet connecté
 */

// TODO: Importer React
// import { createContext, useState, useEffect, useContext } from 'react';
// import io from 'socket.io-client';

// TODO: Importer WalletContext pour accéder à l'adresse
// import { WalletContext } from './WalletContext';

/**
 * Créer le Context
 */
// TODO: Créer SocketContext
// export const SocketContext = createContext(null);

/**
 * Provider pour SocketContext
 * @param {Object} props - Props avec children
 * @returns {JSX.Element} Provider avec valeur du context
 */
// TODO: Créer SocketProvider
// export function SocketProvider({ children }) {
//   const [socket, setSocket] = useState(null);
//   const { address } = useContext(WalletContext);
//   
//   // TODO: Initialiser Socket.io au montage
//   // useEffect(() => {
//   //   const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
//   //   const newSocket = io(socketUrl, {
//   //     transports: ['websocket', 'polling']
//   //   });
//   //   
//   //   // Gestion événements de connexion
//   //   newSocket.on('connect', () => {
//   //     console.log('Socket.io connected');
//   //   });
//   //   
//   //   newSocket.on('disconnect', () => {
//   //     console.log('Socket.io disconnected');
//   //   });
//   //   
//   //   newSocket.on('connect_error', (error) => {
//   //     console.error('Socket.io connection error:', error);
//   //   });
//   //   
//   //   setSocket(newSocket);
//   //   
//   //   // Cleanup au démontage
//   //   RETOURNER () => {
//   //     newSocket.disconnect();
//   //   };
//   // }, []);
//   
//   // TODO: Rejoindre la room du client quand wallet connecté
//   // useEffect(() => {
//   //   SI socket && address:
//   //     // Rejoindre la room client
//   //     socket.emit('joinRoom', `client_${address}`);
//   //     
//   //     // Cleanup: quitter la room au démontage ou changement d'adresse
//   //     RETOURNER () => {
//   //       SI socket:
//   //         socket.emit('leaveRoom', `client_${address}`);
//   //     };
//   //   }
//   // }, [socket, address]);
//   
//   // TODO: Valeur du context
//   // const value = {
//   //   socket,
//   //   isConnected: socket?.connected || false
//   // };
//   
//   // TODO: Retourner le Provider
//   // RETOURNER (
//   //   <SocketContext.Provider value={value}>
//   //     {children}
//   //   </SocketContext.Provider>
//   // );
// }

