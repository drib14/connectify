import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (user) {
      const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : '/';
      const newSocket = io(socketUrl, { transports: ['websocket', 'polling'] });
      
      newSocket.on('connect', () => {
        newSocket.emit('user_online', user._id);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('new_notification', (notification) => {
        toast(notification.message, {
          icon: notification.type === 'tip' ? '🪙' : '✨',
          duration: 5000,
        });

        // Automatically sync points/coins
        if (notification.type === 'tip' || notification.type === 'badgeEarned') {
          refreshUser();
        }

        window.dispatchEvent(new CustomEvent('new_notification', { detail: notification }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, refreshUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
