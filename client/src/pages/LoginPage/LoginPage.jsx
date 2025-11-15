import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      navigate('/');
    } catch (error) {
      console.error(error.response.data.message); // Handle login error
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '400px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#1877f2', fontSize: '24px', marginBottom: '20px' }}>Connectify</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '16px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '16px' }}
          />
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1877f2', color: '#fff', borderRadius: '6px', border: 'none', fontSize: '18px', fontWeight: 'bold' }}>
            Log In
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/forgot-password" style={{ color: '#1877f2', textDecoration: 'none' }}>Forgotten password?</Link>
        </div>
        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #dadde1' }} />
        <div style={{ textAlign: 'center' }}>
          <Link to="/register" style={{ display: 'inline-block', padding: '12px 20px', backgroundColor: '#42b72a', color: '#fff', borderRadius: '6px', border: 'none', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none' }}>
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
