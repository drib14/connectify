import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { VibeProvider } from './context/VibeContext.jsx';

// Components
import Navbar from './components/Layout/Navbar.jsx';
import FloatingPlayer from './components/Layout/FloatingPlayer.jsx';

// Pages
import Home from './pages/Home.jsx';
import Canvas from './pages/Canvas.jsx';
import Whisper from './pages/Whisper.jsx';
import Clips from './pages/Clips.jsx';
import Premium from './pages/Premium.jsx';
import Login from './pages/Login.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <span className="text-gradient" style={{ fontWeight: 600, fontSize: '18px' }}>Syncing with Connectify...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/canvas/:username"
          element={
            <ProtectedRoute>
              <Canvas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/whisper"
          element={
            <ProtectedRoute>
              <Whisper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clips"
          element={
            <ProtectedRoute>
              <Clips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/premium"
          element={
            <ProtectedRoute>
              <Premium />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating mini audio music controller */}
      <FloatingPlayer />
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <VibeProvider>
          <AppContent />
        </VibeProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
