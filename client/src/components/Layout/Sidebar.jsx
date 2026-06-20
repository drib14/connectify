import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome, HiGlobeAlt, HiUserGroup, HiFlag, HiCalendar,
  HiQuestionMarkCircle, HiBookOpen, HiBell, HiCog,
  HiShieldCheck, HiLightningBolt, HiHeart, HiSparkles,
  HiTrendingUp, HiPuzzle,
} from 'react-icons/hi';
import './Sidebar.css';

const navSections = [
  {
    title: 'Main',
    items: [
      { to: '/feed', icon: HiHome, label: 'Feed' },
      { to: '/explore', icon: HiGlobeAlt, label: 'Explore' },
      { to: '/notifications', icon: HiBell, label: 'Notifications' },
    ],
  },
  {
    title: 'Social',
    items: [
      { to: '/trust-circles', icon: HiShieldCheck, label: 'Trust Circles' },
      { to: '/communities', icon: HiUserGroup, label: 'Communities' },
      { to: '/events', icon: HiCalendar, label: 'Events' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { to: '/goals', icon: HiFlag, label: 'Goals' },
      { to: '/questions', icon: HiQuestionMarkCircle, label: 'Q&A Hub' },
      { to: '/journal', icon: HiBookOpen, label: 'Journal' },
    ],
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside className="sidebar" id="sidebar">
      {/* Logo */}
      <Link to="/feed" className="sidebar-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <img src="/logo.png" alt="Connectify" className="sidebar-logo-icon" />
        <span className="sidebar-logo-text">Connectify</span>
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.title} className={`sidebar-section sidebar-section-${section.title.toLowerCase()}`}>
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon className="sidebar-link-icon" />
                <span className="sidebar-link-text">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User section */}
      {user && (
        <div className="sidebar-user">
          <NavLink to={`/profile/${user.username}`} className="sidebar-user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="avatar avatar-sm" style={{ border: user.isPremium ? '2px solid #d946ef' : 'none', borderRadius: '50%', padding: user.isPremium ? '2px' : '0' }} />
            ) : (
              <div className="avatar avatar-sm avatar-placeholder" style={{ border: user.isPremium ? '2px solid #d946ef' : 'none', borderRadius: '50%' }}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
            <div className="sidebar-user-details" style={{ display: 'flex', flexDirection: 'col', textAlign: 'left' }}>
              <span className="sidebar-user-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                {user.firstName} {user.lastName}
              </span>
              <span className="sidebar-user-username" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>@{user.username}</span>
              <span className="sidebar-user-stats" style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                <span>🪙 {user.coins || 0}</span>
                <span>★ {user.contributionScore || 0}</span>
              </span>
            </div>
          </NavLink>
          <NavLink to="/settings" className="sidebar-settings-btn" style={{ marginLeft: 'auto' }}>
            <HiCog />
          </NavLink>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
