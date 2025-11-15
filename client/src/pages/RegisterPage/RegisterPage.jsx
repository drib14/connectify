import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      navigate('/');
    } catch (error) {
      console.error(error.response.data.message); // Handle registration error
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '400px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#1877f2', fontSize: '24px', marginBottom: '20px' }}>Create a New Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '16px' }}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '16px' }}
          />
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '16px' }}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '16px' }}
          />
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#42b72a', color: '#fff', borderRadius: '6px', border: 'none', fontSize: '18px', fontWeight: 'bold' }}>
            Sign Up
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#1877f2', textDecoration: 'none' }}>Already have an account?</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
