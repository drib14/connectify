import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Join the user's personal room for notifications
    socket.emit('joinUserRoom', user._id);

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get('/api/notifications');
        setNotifications(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotifications();

    // Listen for new notifications
    socket.on('newNotification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('newNotification');
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setShowNotifications(!showNotifications)}>
        🔔 ({unreadCount})
      </button>
      {showNotifications && (
        <div style={{ position: 'absolute', top: '40px', right: 0, width: '300px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {notifications.map((n) => (
            <div key={n._id} style={{ padding: '10px', borderBottom: '1px solid #eee', backgroundColor: n.read ? '#fff' : '#f0f2f5' }}>
              {n.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
