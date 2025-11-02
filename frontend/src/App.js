import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import Sidebar from './components/Sidebar';
import { getMe } from './services/auth';
import './styles.css';

export default function App(){
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    async function load() {
      if(token){
        try {
          const me = await getMe(token);
          setUser(me.user);
        } catch (err){
          console.log('auth failed', err);
          setUser(null);
          localStorage.removeItem('token');
        }
      }
    }
    load();
  }, [token]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {!user ? (
        <div className="auth-container">
          <div className="title-container">
            <h1 className="animated-title">Fast Budget</h1>
            <p className="subtitle">Track your expenses with ease</p>
          </div>
          <AuthModal 
            onAuth={(t,u)=>{ setToken(t); localStorage.setItem('token', t); setUser(u); }}
            initialMode="login"
            openByDefault={true}
            showInlineButtons={false}
          />
        </div>
      ) : (
        <div className="dashboard-container">
          <Sidebar 
            activeView={activeView} 
            setActiveView={setActiveView} 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode}
            user={user}
            handleLogout={handleLogout}
          />
          
          <main className={`main-content`}>
            <header className="content-header">
              <h1>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h1>
              <div className="user-section">
                <div className="user-controls">
                  <div className="setting-item" onClick={toggleDarkMode}>
                    <span className="setting-icon">{darkMode ? '☀️' : '🌙'}</span>
                  </div>
                  <div className="logout-pill" onClick={handleLogout}>
                    <span className="setting-icon">🚪</span>
                    <span>Logout</span>
                  </div>
                </div>
                <div className="user-pill">
                  <div className="avatar">{user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}</div>
                  <span>Hi, {user.name || user.email}</span>
                </div>
              </div>
            </header>
            
            <div className="content-body">
              <>
                {activeView === 'overview' && (
                  <ProfileView user={user} token={token} />
                )}
                {activeView === 'calendar' && (
                  <div className="calendar-layout">
                    <CalendarView token={token} />
                  </div>
                )}
                {activeView === 'transactions' && (
                  <div className="transactions-layout">
                    <h2>Transactions</h2>
                    <p>Your recent transactions will appear here.</p>
                  </div>
                )}
                {activeView === 'scheduled' && (
                  <div className="scheduled-layout">
                    <h2>Scheduled Transactions</h2>
                    <p>Your scheduled transactions will appear here.</p>
                  </div>
                )}
                {activeView === 'accounts' && (
                  <div className="accounts-layout">
                    <h2>Accounts</h2>
                    <p>Your accounts will appear here.</p>
                  </div>
                )}
                {activeView === 'cards' && (
                  <div className="cards-layout">
                    <h2>Credit Cards</h2>
                    <p>Your credit cards will appear here.</p>
                  </div>
                )}
                {activeView === 'budgets' && (
                  <div className="budgets-layout">
                    <h2>Budgets</h2>
                    <p>Your budgets will appear here.</p>
                  </div>
                )}
                {activeView === 'goals' && (
                  <div className="goals-layout">
                    <h2>Goals</h2>
                    <p>Your financial goals will appear here.</p>
                  </div>
                )}
              </>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
