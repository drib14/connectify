import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, LogOut, Award, Crown, Check } from 'lucide-react';
import api from '../../utils/api';

export default function Navbar({ user, notifications, setNotifications, onLogout, setActiveTab, onSelectProfile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  // Handle outside click to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search users API query
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?query=${searchQuery}`);
        if (res.data.success) {
          setSearchResults(res.data.users);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const markAllNotificationsRead = async () => {
    try {
      await api.put('/notifications/read', {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleNotifClick = async (notif) => {
    try {
      await api.put(`/notifications/read/${notif._id}`, {});
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      
      // Navigate if applicable
      if (notif.type === 'like' || notif.type === 'comment') {
        setActiveTab('feed');
      } else if (notif.type === 'friend_request') {
        onSelectProfile(notif.sender.username);
      }
      setShowNotifications(false);
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  return (
    <div className="navbar-container glass-panel-heavy">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/logo.png" alt="Connectify Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', background: 'var(--main-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px' }}>
          Connectify
        </span>
      </div>

      {/* Global Search Bar */}
      <div ref={searchRef} style={{ position: 'relative', width: '320px' }}>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Connects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%', borderRadius: '30px' }}
          />
        </div>
        {searchResults.length > 0 && (
          <div className="glass-panel-heavy" style={{ position: 'absolute', top: '110%', left: 0, width: '100%', maxHeight: '300px', overflowY: 'auto', zIndex: 1000, padding: '8px', border: '1px solid var(--border-glass)' }}>
            {searchResults.map(u => (
              <div
                key={u._id}
                onClick={() => {
                  onSelectProfile(u.username);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                className="sidebar-link"
              >
                <div className="avatar-container">
                  <img src={u.profilePic || '/default-avatar.png'} alt={u.username} className={`avatar ${u.isPremium ? 'premium-avatar' : ''}`} style={{ width: '32px', height: '32px' }} />
                  {u.isPremium && <div className="premium-crown-tag">👑</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>{u.username}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.bio ? `${u.bio.substring(0, 30)}...` : 'Active Connectify Member'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Spark Points Display */}
        <div 
          onClick={() => setActiveTab('spark')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--spark-gradient)', padding: '6px 12px', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 0 10px rgba(236, 72, 153, 0.2)' }}
        >
          <Award size={16} color="white" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '13px', color: 'white' }}>{user.sparkPoints || 0} SPARK</span>
        </div>

        {/* Notifications Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', padding: '8px', borderRadius: '50%', color: 'var(--text-main)' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="glass-panel-heavy" style={{ position: 'absolute', top: '120%', right: 0, width: '360px', maxHeight: '400px', overflowY: 'auto', zIndex: 1000, padding: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: '700' }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsRead} style={{ fontSize: '12px', color: 'var(--color-primary)', background: 'none', padding: 0 }}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No notifications yet.
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n._id}
                    onClick={() => handleNotifClick(n)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '10px', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      marginBottom: '6px', 
                      background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                      border: n.isRead ? 'none' : '1px solid rgba(99,102,241,0.15)',
                      transition: 'background 0.2s'
                    }}
                    className="sidebar-link"
                  >
                    <div className="avatar-container">
                      <img src={n.sender.profilePic || '/default-avatar.png'} alt={n.sender.username} className={`avatar ${n.sender.isPremium ? 'premium-avatar' : ''}`} style={{ width: '32px', height: '32px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: n.isRead ? '400' : '600' }}>{n.content}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!n.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '6px' }}></div>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User profile dropdown access */}
        <div 
          onClick={() => onSelectProfile(user.username)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '30px' }}
          className="sidebar-link"
        >
          <div className="avatar-container">
            <img src={user.profilePic || '/default-avatar.png'} alt={user.username} className={`avatar ${user.isPremium ? 'premium-avatar' : ''}`} style={{ width: '32px', height: '32px' }} />
            {user.isPremium && <div className="premium-crown-tag">👑</div>}
          </div>
          <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }} className="flex items-center gap-1">
            {user.username}
            {user.isPremium && <Crown size={12} color="var(--premium-gold)" style={{ marginLeft: '4px' }} />}
          </span>
        </div>

        {/* Logout Button */}
        <button 
          onClick={onLogout}
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '50%', color: 'var(--color-danger)' }}
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
