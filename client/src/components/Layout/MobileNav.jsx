import { NavLink } from 'react-router-dom';
import { HiHome, HiGlobeAlt, HiPlus, HiUserGroup, HiUser } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import './MobileNav.css';

const MobileNav = () => {
  const { user } = useAuth();

  return (
    <nav className="mobile-nav show-mobile-only" id="mobile-nav">
      <NavLink to="/feed" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <HiHome />
        <span>Feed</span>
      </NavLink>
      <NavLink to="/explore" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <HiGlobeAlt />
        <span>Explore</span>
      </NavLink>
      <NavLink to="/feed" className="mobile-nav-item mobile-nav-create">
        <div className="mobile-nav-create-btn">
          <HiPlus />
        </div>
      </NavLink>
      <NavLink to="/communities" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <HiUserGroup />
        <span>Groups</span>
      </NavLink>
      <NavLink to={`/profile/${user?.username}`} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <HiUser />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
