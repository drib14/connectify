import React, { useState } from 'react';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // 1: enter email, 2: enter code and new password

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setStep(2);
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', { email, code, password });
      // Handle successful password reset, maybe redirect to login
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '400px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        {step === 1 ? (
          <>
            <h2 style={{ textAlign: 'center', color: '#1877f2', fontSize: '24px', marginBottom: '20px' }}>Find Your Account</h2>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '16px' }}
              />
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1877f2', color: '#fff', borderRadius: '6px', border: 'none', fontSize: '18px', fontWeight: 'bold' }}>
                Send Code
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', color: '#1877f2', fontSize: '24px', marginBottom: '20px' }}>Reset Your Password</h2>
            <form onSubmit={handleResetSubmit}>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '16px' }}
              />
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '16px' }}
              />
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1877f2', color: '#fff', borderRadius: '6px', border: 'none', fontSize: '18px', fontWeight: 'bold' }}>
                Reset Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
