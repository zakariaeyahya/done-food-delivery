/**
 * Context SocketContext - Restaurant
 * @notice Fournit socket connection à toute l'application
 * @dev Gère la connexion Socket.io pour les mises à jour en temps réel
 */

import { useState, useEffect, createContext, useContext } from 'react';
import io from 'socket.io-client';

/**
 * Context pour Socket.io
 */
export const SocketContext = createContext(null);

/**
 * Provider pour SocketContext
 * @notice Gère la connexion Socket.io
 */
export function SocketProvider({ children }) {
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
 * Hook useSocket
 * @notice Hook personnalisé pour accéder au contexte Socket
 * @returns {Object|null} Socket instance ou null
 */
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}