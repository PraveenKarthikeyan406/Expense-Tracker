import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import Sidebar from './components/Sidebar';
import ProfileDropdown from './components/ProfileDropdown';
import ViewProfilePage from './components/ViewProfilePage';
import EditProfilePage from './components/EditProfilePage';
import ReportIssuePage from './components/ReportIssuePage';
import ReportGenerator from './components/ReportGenerator';
import { getMe } from './services/auth';
import './styles.css';

export default function App(){
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [showViewProfile, setShowViewProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);

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

  const handleUpdateProfile = (updatedData) => {
    setUser({ ...user, ...updatedData });
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
                </div>
                <ProfileDropdown 
                  user={user}
                  onLogout={handleLogout}
                  onViewProfile={() => setShowViewProfile(true)}
                  onEditProfile={() => setShowEditProfile(true)}
                  onReportIssue={() => setShowReportIssue(true)}
                />
              </div>
            </header>
            
            <div className="content-body">
              {showViewProfile ? (
                <ViewProfilePage 
                  user={user} 
                  token={token} 
                  onClose={() => setShowViewProfile(false)} 
                />
              ) : showEditProfile ? (
                <EditProfilePage 
                  user={user} 
                  token={token} 
                  onClose={() => setShowEditProfile(false)}
                  onUpdate={handleUpdateProfile}
                />
              ) : showReportIssue ? (
                <ReportIssuePage 
                  user={user} 
                  onClose={() => setShowReportIssue(false)} 
                />
              ) : showReportGenerator ? (
                <ReportGenerator 
                  token={token} 
                  onClose={() => setShowReportGenerator(false)} 
                />
              ) : (
                <>
                  {activeView === 'overview' && (
                    <ProfileView 
                      user={user} 
                      token={token} 
                      onGenerateReport={() => setShowReportGenerator(true)}
                    />
                  )}
                  {activeView === 'calendar' && (
                    <div className="calendar-layout">
                      <CalendarView token={token} />
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
