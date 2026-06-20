import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Terms from './pages/Auth/Terms';
import Welcome from './pages/Auth/Welcome';

// Main Layout
import MainLayout from './components/Layout/MainLayout';

// Pages
import Feed from './pages/Home/Feed';
import Profile from './pages/Profile/Profile';
import TrustCircles from './pages/TrustCircles/TrustCircles';
import Communities from './pages/Community/Communities';
import CommunityDetail from './pages/Community/CommunityDetail';
import Goals from './pages/Goals/Goals';
import Events from './pages/Events/Events';
import Questions from './pages/Questions/Questions';
import Journal from './pages/Journal/Journal';
import Notifications from './pages/Notifications/Notifications';
import Settings from './pages/Settings/Settings';
import Explore from './pages/Explore/Explore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner spinner-lg"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner spinner-lg"></div></div>;
  return !isAuthenticated ? children : <Navigate to="/feed" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />

      {/* Protected App Routes */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/feed" />} />
        <Route path="feed" element={<Feed />} />
        <Route path="explore" element={<Explore />} />
        <Route path="profile/:username" element={<Profile />} />
        <Route path="trust-circles" element={<TrustCircles />} />
        <Route path="communities" element={<Communities />} />
        <Route path="communities/:id" element={<CommunityDetail />} />
        <Route path="goals" element={<Goals />} />
        <Route path="events" element={<Events />} />
        <Route path="questions" element={<Questions />} />
        <Route path="journal" element={<Journal />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/feed" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1f3a',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#00d4aa', secondary: '#0a0e1a' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0a0e1a' },
            },
          }}
        />
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
