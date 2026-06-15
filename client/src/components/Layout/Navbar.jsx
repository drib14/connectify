import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { SocketContext } from '../../context/SocketContext.jsx';
import API from '../../services/api.js';
import { Activity, Video, MessageSquare, Award, LogOut, Bell, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('notification_received', (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });
      return () => {
        socket.off('notification_received');
      };
    }
  }, [socket]);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      zIndex: 100,
      borderRadius: '0 0 16px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    }}>
      {/* Brand logo (Interlinked nodes lowercase c) */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
        <svg viewBox="0 0 100 100" style={{ width: '32px', height: '32px', filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }}>
          <defs>
            <linearGradient id="nav-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path d="M65,35 C55,20 35,20 25,35 C15,50 15,65 25,80 C35,95 55,95 65,80" fill="none" stroke="url(#nav-glow)" strokeWidth="10" strokeLinecap="round" />
          <circle cx="25" cy="35" r="9" fill="#6366f1" />
          <circle cx="25" cy="80" r="9" fill="#a855f7" />
          <circle cx="65" cy="35" r="9" fill="#6366f1" />
          <circle cx="65" cy="80" r="9" fill="#a855f7" />
          <line x1="25" y1="35" x2="65" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
          <line x1="25" y1="80" x2="65" y2="80" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
        </svg>
        <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-title)' }}>
          Connectify
        </span>
      </Link>

      {/* Nav Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link to="/" title="Pulse Feed" style={{
          padding: '8px 16px',
          borderRadius: '8px',
          color: isActive('/') ? 'var(--primary-glow)' : 'var(--text-muted)',
          background: isActive('/') ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          transition: 'var(--transition-smooth)'
        }}>
          <Activity size={20} />
          <span style={{ display: 'none', md: 'inline' }}>Pulse</span>
        </Link>

        <Link to="/clips" title="Clips Feed" style={{
          padding: '8px 16px',
          borderRadius: '8px',
          color: isActive('/clips') ? 'var(--primary-glow)' : 'var(--text-muted)',
          background: isActive('/clips') ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          transition: 'var(--transition-smooth)'
        }}>
          <Video size={20} />
          <span style={{ display: 'none', md: 'inline' }}>Clips</span>
        </Link>

        <Link to="/whisper" title="Whisper Direct Message" style={{
          padding: '8px 16px',
          borderRadius: '8px',
          color: isActive('/whisper') ? 'var(--primary-glow)' : 'var(--text-muted)',
          background: isActive('/whisper') ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          transition: 'var(--transition-smooth)'
        }}>
          <MessageSquare size={20} />
          <span style={{ display: 'none', md: 'inline' }}>Whisper</span>
        </Link>

        <Link to="/premium" title="Premium Upgrade" style={{
          padding: '8px 16px',
          borderRadius: '8px',
          color: isActive('/premium') ? '#f59e0b' : 'var(--text-muted)',
          background: isActive('/premium') ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          transition: 'var(--transition-smooth)'
        }}>
          <Award size={20} style={{ color: isActive('/premium') ? '#f59e0b' : 'var(--text-muted)' }} />
          <span>Premium</span>
        </Link>
      </div>

      {/* Profile & Notifications actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Real-time Notifications bell icon */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{
              background: 'transparent',
              border: 'none',
              color: showNotifDropdown ? 'var(--primary-glow)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: 'var(--accent-gradient)',
                color: 'white',
                fontSize: '9px',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(236,72,153,0.6)',
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '40px',
              right: '-10px',
              width: '300px',
              maxHeight: '360px',
              overflowY: 'auto',
              zIndex: 200,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Recent Activity</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', color: 'var(--primary-glow)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length > 0 ? (
                  notifications.map((notif) => {
                    const text = notif.type === 'like' ? 'liked your Pulse post'
                               : notif.type === 'comment' ? 'commented on your post'
                               : notif.type === 'share' ? 'reposted your Pulse'
                               : notif.type === 'circle_request' ? 'invited you to their Circle'
                               : notif.type === 'circle_accept' ? 'joined your Circle'
                               : 'sent you a notification';
                    return (
                      <div
                        key={notif._id}
                        onClick={() => markRead(notif._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px',
                          borderRadius: '8px',
                          background: notif.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                          cursor: 'pointer',
                          borderLeft: notif.isRead ? 'none' : '3px solid var(--primary)',
                          transition: 'var(--transition-smooth)',
                        }}
                        className="btn-secondary"
                      >
                        <img src={notif.sender.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-main)', textAlign: 'left' }}>
                            <strong style={{ fontWeight: 600 }}>{notif.sender.username}</strong> {text}
                          </span>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                    All caught up!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <Link to={`/canvas/${user.username}`} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'var(--text-main)'
        }}>
          <div className="avatar-container" style={{ width: '36px', height: '36px' }}>
            <img
              src={user.avatar}
              alt={user.username}
              className="avatar-image"
              style={{ width: '36px', height: '36px', border: user.isPremium ? '2px solid #fbbf24' : '2px solid var(--primary)' }}
            />
          </div>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            {user.username}
            {user.isPremium && <span className="premium-badge">Premium</span>}
          </span>
        </Link>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="btn-secondary"
          style={{ padding: '8px 12px', borderRadius: '8px', gap: '6px', fontSize: '13px' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
