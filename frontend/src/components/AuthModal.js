import React, { useState } from 'react';
import { login, register } from '../services/auth';

const AuthModal = ({ onAuth, initialMode = 'login', openByDefault = false, showInlineButtons = true }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(openByDefault);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = mode === 'login'
        ? await login({ email, password })
        : await register({ email, password, name });
      onAuth(res.token, res.user);
      setIsModalOpen(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Auth failed');
    }
  };

  return (
    <>
      {showInlineButtons && (
        <div className="auth-buttons">
          <button className="auth-btn login-btn" onClick={() => {setMode('login'); setIsModalOpen(true);}}>Sign In</button>
          <button className="auth-btn signup-btn" onClick={() => {setMode('register'); setIsModalOpen(true);}}>Sign Up</button>
        </div>
      )}
      
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className={`auth-modal ${mode}`} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
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
            <form onSubmit={handleSubmit}>
              {mode === 'register' &&
                <div className="input-group">
                  <label htmlFor="name">Name</label>
                  <input id="name" type="text" value={name} onChange={e=>setName(e.target.value)} required />
                </div>
              }
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="submit-btn">{mode === 'login' ? 'Sign In' : 'Create Account'}</button>
              <div className="auth-switch">
                <button type="button" className="switch-btn" onClick={()=>setMode(mode==='login'?'register':'login')}>
                  {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthModal;
