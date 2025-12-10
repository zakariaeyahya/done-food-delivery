import React, { createContext, useContext } from 'react';
import io from 'socket.io-client';

// The backend URL where the Socket.io server is running
const SOCKET_URL = 'http://localhost:3000'; // Replace with your actual backend URL

const socket = io(SOCKET_URL, {
  transports: ['websocket'], // Explicitly use websockets
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

const SocketContext = createContext(socket);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;