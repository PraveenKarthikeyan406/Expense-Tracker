import React, { useState } from 'react';
import { login, register, forgotPassword, resetPassword, signupSendOTP, signupVerifyOTP } from '../services/auth';

const AuthModal = ({ onAuth, initialMode = 'login', openByDefault = false, showInlineButtons = true }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [isModalOpen, setIsModalOpen] = useState(openByDefault);

  const [isForgotFlow, setIsForgotFlow] = useState(false);
  const [forgotStep, setForgotStep] = useState('request');
  const [category, setCategory] = useState('user');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [isSignupOTPFlow, setIsSignupOTPFlow] = useState(false);
  const [signupUserId, setSignupUserId] = useState(null);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const resetTransientState = () => {
    setIsForgotFlow(false);
    setForgotStep('request');
    setCategory('user');
    setOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setMessage(null);
    setSubmitting(false);
    setIsSignupOTPFlow(false);
    setSignupUserId(null);
    setNameError('');
    setEmailError('');
    setPasswordError('');
  };

  const validateNameField = (value) => {
    if (!value || value.trim().length === 0) {
      return 'Name is required';
    }
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return 'Name must contain only alphabets and spaces';
    }
    return '';
  };

  const validateEmailField = (value) => {
    if (!value || value.trim().length === 0) {
      return 'Email is required';
    }
    if (/^\d/.test(value)) {
      return 'Email cannot start with a number';
    }
    if (!/^[a-zA-Z][a-zA-Z0-9]{2,}@gmail\.com$/.test(value)) {
      return 'Enter valid email';
    }
    return '';
  };

  const validatePasswordField = (value, nameValue) => {
    if (!value || value.length === 0) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    const consecutiveNumbers = /^(\d)\1+$|012345|123456|234567|345678|456789|567890|654321|543210|432109|321098|210987|109876|098765/;
    if (consecutiveNumbers.test(value)) {
      return 'Choose a different strong password (avoid consecutive or repeated numbers)';
    }
    if (nameValue && value.toLowerCase().includes(nameValue.toLowerCase().split(' ')[0])) {
      return 'Choose a different strong password (password should not contain your name)';
    }
    const weakPasswords = ['password', 'pass123', 'qwerty', 'abc123', '123abc', 'password123'];
    if (weakPasswords.includes(value.toLowerCase())) {
      return 'Choose a different strong password (this password is too common)';
    }
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    if (!hasLetter || !hasNumber) {
      return 'Choose a different strong password (include both letters and numbers)';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setNameError('');
    setEmailError('');
    setPasswordError('');
    
    try {
      if (mode === 'login') {
        const res = await login({ email, password });
        onAuth(res.token, res.user);
        resetTransientState();
        setIsModalOpen(false);
      } else {
        
        const nameErr = validateNameField(name);
        const emailErr = validateEmailField(email);
        const passwordErr = validatePasswordField(password, name);
        
        if (nameErr || emailErr || passwordErr) {
          setNameError(nameErr);
          setEmailError(emailErr);
          setPasswordError(passwordErr);
          return;
        }
        
        setSubmitting(true);
        const res = await signupSendOTP({ email, password, name, role });
        setSignupUserId(res.userId);
        setIsSignupOTPFlow(true);
        setMessage({
          type: 'success',
          text: res.message
        });
        setSubmitting(false);
      }
    } catch (err) {
      setSubmitting(false);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Auth failed'
      });
    }
  };

  const handleSignupOTPVerify = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    if (!otp || otp.trim().length === 0) {
      setMessage({ type: 'error', text: 'Please enter the OTP' });
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await signupVerifyOTP({ userId: signupUserId, otp });
      onAuth(res.token, res.user);
      setMessage({
        type: 'success',
        text: res.message
      });
      setTimeout(() => {
        resetTransientState();
        setIsModalOpen(false);
      }, 1500);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'OTP verification failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenLogin = () => {
    setMode('login');
    resetTransientState();
    setIsModalOpen(true);
  };

  const handleOpenRegister = () => {
    setMode('register');
    resetTransientState();
    setIsModalOpen(true);
  };

  const startForgotFlow = () => {
    setIsForgotFlow(true);
    setForgotStep('request');
    setCategory(role || 'user');
    setMessage(null);
  };

  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await forgotPassword({ email, category });
      setMessage({
        type: 'success',
        text: 'OTP sent to your email address.'
      });
      setForgotStep('reset');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to send OTP. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!otp || !newPassword || !confirmNewPassword) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword({ email, category, otp, newPassword });
      setMessage({
        type: 'success',
        text: res?.message || 'Password reset successful. Please login.'
      });
      setIsForgotFlow(false);
      setForgotStep('request');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to reset password. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {showInlineButtons && (
        <div className="auth-buttons">
          <button
            className="auth-btn login-btn"
            onClick={handleOpenLogin}
          >
            Sign In
          </button>
          <button
            className="auth-btn signup-btn"
            onClick={handleOpenRegister}
          >
            Sign Up
          </button>
        </div>
      )}
      
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className={`auth-modal ${mode}`} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {isForgotFlow
                  ? 'Reset Password'
                  : isSignupOTPFlow
                    ? 'Verify Email'
                    : mode === 'login'
                      ? 'Sign In'
                      : 'Create Account'}
              </h2>
            </div>
            <div className="auth-image-container">
              <img 
                src={mode === 'register' 
                  ? "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80" 
                  : "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80"}
                alt={mode === 'register' ? "Expense Tracker" : "Budget Planning"}
                className="auth-image" 
              />
            </div>

            {!isForgotFlow && !isSignupOTPFlow ? (
              <form onSubmit={handleSubmit}>
                {message && (
                  <div className={`form-message ${message.type}`}>
                    {message.text}
                  </div>
                )}

                <div className="input-group">
                  <label>Account Type</label>
                  <div className="role-selector">
                    <label className={`role-option ${role === 'user' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="user" 
                        checked={role === 'user'} 
                        onChange={e => setRole(e.target.value)}
                      />
                      <span className="role-icon">👤</span>
                      <span className="role-label">User</span>
                    </label>
                    <label className={`role-option ${role === 'admin' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="admin" 
                        checked={role === 'admin'} 
                        onChange={e => setRole(e.target.value)}
                      />
                      <span className="role-icon">👨‍💼</span>
                      <span className="role-label">Admin</span>
                    </label>
                  </div>
                </div>
                
                {mode === 'register' && (
                  <div className="input-group">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                    {nameError && <div className="field-error">{nameError}</div>}
                  </div>
                )}
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  {emailError && <div className="field-error">{emailError}</div>}
                </div>
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  {passwordError && <div className="field-error">{passwordError}</div>}
                </div>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
                <div className="auth-switch">
                  <button
                    type="button"
                    className="switch-btn"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  >
                    {mode === 'login'
                      ? 'Need an account? Sign up'
                      : 'Already have an account? Sign in'}
                  </button>
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={startForgotFlow}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            ) : isSignupOTPFlow ? (
              <form onSubmit={handleSignupOTPVerify}>
                {message && (
                  <div className={`form-message ${message.type}`}>
                    {message.text}
                  </div>
                )}
                <div className="input-group">
                  <label htmlFor="signup-otp">Enter OTP</label>
                  <input
                    id="signup-otp"
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Check your email for the verification code
                  </small>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setIsSignupOTPFlow(false);
                      setOtp('');
                      setMessage(null);
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {forgotStep === 'request' && (
                  <form onSubmit={handleForgotRequestSubmit}>
                    {message && (
                      <div className={`form-message ${message.type}`}>
                        {message.text}
                      </div>
                    )}
                    <div className="input-group">
                      <label htmlFor="fp-email">Email</label>
                      <input
                        id="fp-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="fp-category">Category</label>
                      <select
                        id="fp-category"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setIsForgotFlow(false);
                          setForgotStep('request');
                          setMessage(null);
                        }}
                      >
                        Back to Login
                      </button>
                      <button
                        type="submit"
                        className="save-btn"
                        disabled={submitting}
                      >
                        {submitting ? 'Sending...' : 'Send OTP'}
                      </button>
                    </div>
                  </form>
                )}
                {forgotStep === 'reset' && (
                  <form onSubmit={handleResetPasswordSubmit}>
                    {message && (
                      <div className={`form-message ${message.type}`}>
                        {message.text}
                      </div>
                    )}
                    <div className="input-group">
                      <label htmlFor="fp-otp">OTP</label>
                      <input
                        id="fp-otp"
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="fp-new-password">New Password</label>
                      <input
                        id="fp-new-password"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="fp-confirm-password">Confirm New Password</label>
                      <input
                        id="fp-confirm-password"
                        type="password"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setForgotStep('request');
                          setOtp('');
                          setNewPassword('');
                          setConfirmNewPassword('');
                          setMessage(null);
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="save-btn"
                        disabled={submitting}
                      >
                        {submitting ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AuthModal;
