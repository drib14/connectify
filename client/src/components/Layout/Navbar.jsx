import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Infinity, Activity, Video, MessageSquare, Award, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

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
      {/* Brand logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
        <Infinity size={32} className="text-gradient" style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }} />
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

      {/* Profile actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
