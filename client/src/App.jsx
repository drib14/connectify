import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import PostList from './components/PostList/PostList';
import ChatPage from './pages/ChatPage/ChatPage';
import Notifications from './components/Notifications/Notifications';
import AdminPage from './pages/AdminPage/AdminPage';
import AuthContext from './context/AuthContext';

const App = () => {
  const { user, isAuthenticated, loading, dispatch } = useContext(AuthContext);

  const handleLogout = () => {
    // In a real app, you'd also call a logout endpoint on the backend
    dispatch({ type: 'LOGOUT' });
  };

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  return (
    <Router>
      {isAuthenticated && user && (
        <header style={{ backgroundColor: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dddfe2' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #1877f2, #42b72a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Connectify
            </h1>
          </Link>
          <nav>
            <Link to="/chat" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Chat</Link>
            <Notifications user={user} />
            {user.isAdmin && <Link to="/admin" style={{ marginLeft: '15px', textDecoration: 'none', color: '#333' }}>Admin</Link>}
            <button onClick={handleLogout} style={{ marginLeft: '15px' }}>Logout</button>
          </nav>
        </header>
      )}

      <main>
        <Routes>
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isAuthenticated && user?.isAdmin ? <AdminPage /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </Router>
  );
};

const HomePage = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
    <div style={{ width: '300px', marginRight: '20px' }}>
      {/* Left sidebar placeholder */}
    </div>
    <div style={{ width: '600px' }}>
      <PostList />
    </div>
    <div style={{ width: '300px', marginLeft: '20px' }}>
      {/* Right sidebar placeholder */}
    </div>
  </div>
);

export default App;
