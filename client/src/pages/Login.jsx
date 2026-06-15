import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import { Infinity, Lock, Mail, User, ShieldAlert, Sparkles, CheckCircle, X, Check, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // If already logged in, redirect home
  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Real-time password requirements verification
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!firstName.trim() || !lastName.trim()) {
        setError('First Name and Last Name are required.');
        return;
      }
      if (strengthPoints < 4) {
        setError('Please choose a stronger password matching the construction instructions.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!privacyPolicyAccepted) {
        setError('You must accept the terms of service and privacy policy.');
        return;
      }

      setLoading(true);
      try {
        await register(username, email, password);
        navigate('/');
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        await login(email, password, rememberMe);
        navigate('/');
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotEmail) {
      setForgotError('Please enter your email.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await API.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess(response.data.message);
      setForgotEmail('');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to request reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Infinity size={48} className="text-gradient" style={{ filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.4))' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Connectify</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
            {isRegister ? 'Create your canvas and share your vibe' : 'Sign in to sync your circle'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            width: '100%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ef4444',
            fontSize: '13px',
          }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <>
              {/* Names row */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="input-field"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="input-field"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Username input */}
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Username"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Email input */}
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
            <input
              type="email"
              placeholder="Email address"
              className="input-field"
              style={{ paddingLeft: '40px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input */}
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              style={{ paddingLeft: '40px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Password strength guide (Only on signup) */}
          {isRegister && password && (
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

              {/* Requirements list */}
              <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', marginTop: '4px' }}>
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
            </div>
          )}

          {isRegister && (
            /* Confirm Password input */
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
          )}

          {/* Toggles and checkboxes footer */}
          {!isRegister ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>Remember me</label>
              </div>

              <button
                type="button"
                onClick={() => {
                  setForgotError('');
                  setForgotSuccess('');
                  setShowForgotModal(true);
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary-glow)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Forgot Password?
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input
                id="legal"
                type="checkbox"
                checked={privacyPolicyAccepted}
                onChange={(e) => setPrivacyPolicyAccepted(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <label htmlFor="legal" style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: '1.4' }}>
                I agree to the Connectify{' '}
                <Link to="/legal" style={{ color: 'var(--primary-glow)', textDecoration: 'underline' }}>Terms of Service</Link>
                ,{' '}
                <Link to="/legal" style={{ color: 'var(--primary-glow)', textDecoration: 'underline' }}>Privacy Policy</Link>
                , and{' '}
                <Link to="/legal" style={{ color: 'var(--primary-glow)', textDecoration: 'underline' }}>Community Guidelines</Link>
                .
              </label>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}
            disabled={loading}
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Connect'}</span>
          </button>
        </form>

        {/* Toggle link */}
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          <span>{isRegister ? 'Already have an account? ' : 'New to Connectify? '}</span>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-glow)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>

      {/* Forgot Password Request Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '18px' }}>Reset Password</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Enter your registered email address and we will mail you a password reset link.</p>

            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {forgotSuccess && (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px' }}>
                  <CheckCircle size={16} />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {forgotError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px' }}>
                  <ShieldAlert size={16} />
                  <span>{forgotError}</span>
                </div>
              )}

              <input
                type="email"
                placeholder="Email Address"
                className="input-field"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                disabled={forgotLoading}
              />

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                disabled={forgotLoading}
              >
                <span>{forgotLoading ? 'Sending link...' : 'Send Link'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
