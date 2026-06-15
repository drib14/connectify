import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api.js';
import { Infinity, Lock, CheckCircle, ShieldAlert, Check, X, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password construction validations
  const validations = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strengthPoints = Object.values(validations).filter(Boolean).length;
  
  const strengthDetails = {
    0: { label: 'Too Weak', color: '#ef4444' },
    1: { label: 'Too Weak', color: '#ef4444' },
    2: { label: 'Weak', color: '#f59e0b' },
    3: { label: 'Fair', color: '#fbbf24' },
    4: { label: 'Good', color: '#6366f1' },
    5: { label: 'Excellent Vibe', color: '#10b981' },
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (strengthPoints < 4) {
      setError('Password is too weak. Please fulfill all security rules.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password, confirmPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Infinity size={48} className="text-gradient" />
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Reset Password</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>Secure your Connectify account Canvas</p>
        </div>

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} style={{ color: '#10b981' }} />
            <h2 style={{ fontSize: '18px', color: '#10b981' }}>Password Changed!</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Your password has been successfully reset. Redirecting to Login...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px' }}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Password input */}
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="New Password"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Password Tracker (Strength Meter) */}
            {password && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Strength:</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: strengthDetails[strengthPoints].color }}>
                    {strengthDetails[strengthPoints].label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className="strength-bar"
                      style={{
                        background: level <= strengthPoints ? strengthDetails[strengthPoints].color : 'rgba(255,255,255,0.06)',
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Password Construction Instructions */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Password Requirements:</span>
              <div className={`instruction-item ${validations.length ? 'valid' : 'invalid'}`}>
                {validations.length ? <Check size={10} /> : <X size={10} />}
                <span>At least 8 characters</span>
              </div>
              <div className={`instruction-item ${validations.lowercase ? 'valid' : 'invalid'}`}>
                {validations.lowercase ? <Check size={10} /> : <X size={10} />}
                <span>Contains a lowercase letter</span>
              </div>
              <div className={`instruction-item ${validations.uppercase ? 'valid' : 'invalid'}`}>
                {validations.uppercase ? <Check size={10} /> : <X size={10} />}
                <span>Contains an uppercase letter</span>
              </div>
              <div className={`instruction-item ${validations.number ? 'valid' : 'invalid'}`}>
                {validations.number ? <Check size={10} /> : <X size={10} />}
                <span>Contains a number</span>
              </div>
              <div className={`instruction-item ${validations.special ? 'valid' : 'invalid'}`}>
                {validations.special ? <Check size={10} /> : <X size={10} />}
                <span>Contains a special character</span>
              </div>
            </div>

            {/* Confirm Password input */}
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Confirm Password"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={loading}
            >
              <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
            </button>
          </form>
        )}

        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', alignSelf: 'center' }}>
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
