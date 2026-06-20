import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content-wrapper">
          <main className="app-content">
            <Outlet />
          </main>
          <RightSidebar />
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default MainLayout;
