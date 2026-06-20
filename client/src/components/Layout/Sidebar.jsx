import { NavLink, useLocation } from 'react-router-dom';
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
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Connectify" className="sidebar-logo-icon" />
        <span className="sidebar-logo-text">Connectify</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.title} className="sidebar-section">
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
          <NavLink to={`/profile/${user.username}`} className="sidebar-user-info">
            {user.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="avatar avatar-sm" />
            ) : (
              <div className="avatar avatar-sm avatar-placeholder">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{user.firstName} {user.lastName}</span>
              <span className="sidebar-user-username">@{user.username}</span>
            </div>
          </NavLink>
          <NavLink to="/settings" className="sidebar-settings-btn">
            <HiCog />
          </NavLink>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
