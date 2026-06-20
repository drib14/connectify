import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    username: '', password: '', confirmPassword: '',
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    else if (formData.firstName.trim().length < 2) errs.firstName = 'At least 2 characters.';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';
    else if (formData.lastName.trim().length < 2) errs.lastName = 'At least 2 characters.';
    if (!formData.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.username.trim()) errs.username = 'Username is required.';
    else if (formData.username.trim().length < 3) errs.username = 'At least 3 characters.';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) errs.username = 'Only letters, numbers, and underscores.';
    if (!formData.password) errs.password = 'Password is required.';
    else if (formData.password.length < 6) errs.password = 'At least 6 characters.';
    if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm password.';
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!formData.agreedToTerms) errs.agreedToTerms = 'You must agree to the Terms of Service.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    try {
      await register({ ...formData, agreedToTerms: 'true' });
      toast.success('Account created! 🎉');
      navigate('/welcome');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1"></div>
        <div className="auth-bg-orb auth-bg-orb-2"></div>
        <div className="auth-bg-orb auth-bg-orb-3"></div>
      </div>

      <div className="auth-container auth-container-register animate-scale-in">
        <div className="auth-header">
          <img src="/logo.png" alt="Connectify" className="auth-logo" />
          <h1 className="auth-title">Join Connectify</h1>
          <p className="auth-subtitle">Create your account in 3 easy steps</p>
        </div>

        {/* Progress Steps */}
        <div className="register-steps">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`register-step ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
              <div className="register-step-circle">
                {step > s ? '✓' : s}
              </div>
              <span className="register-step-label">
                {s === 1 ? 'Personal' : s === 2 ? 'Account' : 'Terms'}
              </span>
            </div>
          ))}
          <div className="register-steps-line">
            <div className="register-steps-line-fill" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="register-step-content animate-fade-in-up" key="step1">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" name="firstName" className={`form-input ${errors.firstName ? 'error' : ''}`} placeholder="John" value={formData.firstName} onChange={handleChange} />
                  {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" name="lastName" className={`form-input ${errors.lastName ? 'error' : ''}`} placeholder="Doe" value={formData.lastName} onChange={handleChange} />
                  {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="john@example.com" value={formData.email} onChange={handleChange} autoComplete="email" />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <button type="button" className="btn btn-primary btn-lg w-full auth-submit-btn" onClick={nextStep} id="register-next-1">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Account Setup */}
          {step === 2 && (
            <div className="register-step-content animate-fade-in-up" key="step2">
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">@</span>
                  <input type="text" id="username" name="username" className={`form-input input-with-prefix ${errors.username ? 'error' : ''}`} placeholder="johndoe" value={formData.username} onChange={handleChange} autoComplete="username" />
                </div>
                {errors.username && <span className="form-error">{errors.username}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="password-wrapper">
                  <input type={showPassword ? 'text' : 'password'} id="reg-password" name="password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} autoComplete="new-password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
                {formData.password && (
                  <div className="password-strength">
                    <div className="password-strength-bar">
                      <div className={`password-strength-fill ${formData.password.length >= 8 ? 'strong' : formData.password.length >= 6 ? 'medium' : 'weak'}`} style={{ width: `${Math.min(100, (formData.password.length / 12) * 100)}%` }}></div>
                    </div>
                    <span className="password-strength-label">
                      {formData.password.length >= 8 ? 'Strong' : formData.password.length >= 6 ? 'Good' : 'Weak'}
                    </span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-ghost btn-lg" onClick={prevStep}>← Back</button>
                <button type="button" className="btn btn-primary btn-lg flex-1" onClick={nextStep} id="register-next-2">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Terms Agreement */}
          {step === 3 && (
            <div className="register-step-content animate-fade-in-up" key="step3">
              <div className="terms-preview">
                <h3>Terms of Service</h3>
                <div className="terms-preview-content">
                  <p>By creating a Connectify account, you agree to our community guidelines:</p>
                  <ul>
                    <li>🤝 Be respectful and authentic in all interactions</li>
                    <li>🔒 We protect your privacy and data</li>
                    <li>🚫 No harassment, hate speech, or harmful content</li>
                    <li>✅ Content you share is your responsibility</li>
                    <li>🌱 Help build a positive, growth-oriented community</li>
                  </ul>
                  <Link to="/terms" target="_blank" className="auth-link">Read full Terms of Service →</Link>
                </div>
              </div>

              <label className={`terms-checkbox ${errors.agreedToTerms ? 'error' : ''}`}>
                <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} id="terms-checkbox" />
                <span className="terms-checkmark"></span>
                <span className="terms-text">
                  I agree to the <Link to="/terms" target="_blank" className="auth-link">Terms of Service</Link> and <Link to="/terms" target="_blank" className="auth-link">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreedToTerms && <span className="form-error">{errors.agreedToTerms}</span>}

              <div className="form-row">
                <button type="button" className="btn btn-ghost btn-lg" onClick={prevStep}>← Back</button>
                <button type="submit" className="btn btn-primary btn-lg flex-1" disabled={loading} id="register-submit">
                  {loading ? <span className="spinner spinner-sm"></span> : 'Create Account 🚀'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
        </div>
      </div>

      <div className="auth-brand-footer">
        <p>© {new Date().getFullYear()} Connectify. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Register;
