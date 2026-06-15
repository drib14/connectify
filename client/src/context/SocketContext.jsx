import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext.jsx';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      const socketConn = io('http://localhost:5000');
      
      socketConn.emit('setup', user);
      
      socketConn.on('connected', () => {
        console.log('Socket successfully connected to server');
      });

      socketConn.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      setSocket(socketConn);

      return () => {
        socketConn.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
