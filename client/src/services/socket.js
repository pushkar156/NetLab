import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log(`[Socket.IO Client] Connected to backend at ${API_BASE_URL} (ID: ${socket.id})`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO Client] Disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.warn(`[Socket.IO Client] Connection error:`, error.message);
    });
  }

  return socket;
};
