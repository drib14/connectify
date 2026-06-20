import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiSearch, HiBell, HiPlus, HiLogout, HiUser, HiCog } from 'react-icons/hi';
import API from '../../services/api';
import ConfirmModal from '../UI/ConfirmModal';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await API.get('/notifications?unreadOnly=true&limit=1');
        setUnreadCount(data.unreadCount);
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const { data } = await API.get(`/users/search?q=${query}`);
        setSearchResults(data);
        setShowSearch(true);
      } catch (e) {}
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const performLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header" id="main-header">
      {/* Search Bar */}
      <div className="header-search" ref={searchRef}>
        <HiSearch className="header-search-icon" />
        <input
          type="text"
          placeholder="Search people, communities, topics..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="header-search-input"
          id="global-search"
        />
        {showSearch && searchResults.length > 0 && (
          <div className="header-search-results">
            {searchResults.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u.username}`}
                className="header-search-result"
                onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              >
                {u.avatar ? (
                  <img src={u.avatar} alt={u.firstName} className="avatar avatar-sm" />
                ) : (
                  <div className="avatar avatar-sm avatar-placeholder">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                )}
                <div>
                  <div className="header-search-name">{u.firstName} {u.lastName}</div>
                  <div className="header-search-username">@{u.username}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="header-actions">
        <button className="btn btn-primary btn-sm header-create-btn" onClick={() => navigate('/feed')}>
          <HiPlus /> <span className="hide-mobile">Create</span>
        </button>

        <Link to="/notifications" className="header-icon-btn" id="notifications-btn">
          <HiBell />
          {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </Link>

        {/* User Menu */}
        <div className="header-user-menu" ref={menuRef}>
          <button className="header-avatar-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="avatar avatar-sm" />
            ) : (
              <div className="avatar avatar-sm avatar-placeholder">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            )}
          </button>

          {showUserMenu && (
            <div className="dropdown">
              <div className="dropdown-header">
                <strong>{user?.firstName} {user?.lastName}</strong>
                <span>@{user?.username}</span>
              </div>
              <div className="dropdown-divider"></div>
              <Link to={`/profile/${user?.username}`} className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                <HiUser /> Profile
              </Link>
              <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                <HiCog /> Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item dropdown-item-danger" onClick={() => { setShowUserMenu(false); handleLogout(); }}>
                <HiLogout /> Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={performLogout}
        title="Confirm Log Out"
        message="Are you sure you want to log out of Connectify?"
        confirmText="Log Out"
      />
    </header>
  );
};

export default Header;
