import { useEffect } from 'react';
import socket from './socket.js';

export function useSocketConnection() {
  useEffect(() => {
    console.log("making conn");
    console.log(socket.connected);
    if (!socket.connected) {
        console.log('onncting');
      socket.connect();
      console.log(socket.connected);
    }

    const handleConnect = () => {
      console.log('✅ Socket connected:', socket.id);
    };

    const handleDisconnect = (reason) => {
      console.log('❌ Socket disconnected:', reason);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
    };
  }, []);
}