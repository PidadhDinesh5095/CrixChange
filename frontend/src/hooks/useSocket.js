import { useEffect } from 'react';
import socket from './socket.js';

export function useSocketConnection() {
  useEffect(() => {
    
    if (!socket.connected) {
        
      socket.connect();
     
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