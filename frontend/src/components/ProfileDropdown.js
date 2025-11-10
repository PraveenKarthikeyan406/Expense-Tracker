import React, { useState, useEffect, useRef } from 'react';

export default function ProfileDropdown({ user, onLogout, onViewProfile, onEditProfile, onReportIssue }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getInitials = () => {
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const handleMenuClick = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <div className="user-pill" onClick={() => setIsOpen(!isOpen)}>
        <div className="avatar">{getInitials()}</div>
        <span>{user.name || user.email}</span>
      </div>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <div className="profile-avatar-large">{getInitials()}</div>
            <div className="profile-info">
              <h4>{user.name || 'User'}</h4>
              <p>{user.email}</p>
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-badge blue">0</div>
                <span>Expenses</span>
              </div>
              <div className="stat-item">
                <div className="stat-badge red">0</div>
                <span>Income</span>
              </div>
            </div>
          </div>

          <div className="profile-dropdown-divider"></div>

          <div className="profile-dropdown-items">
            <button className="profile-dropdown-item" onClick={() => handleMenuClick(onViewProfile)}>
              <span className="dropdown-icon">👤</span>
              <span>View Profile</span>
            </button>
            <button className="profile-dropdown-item" onClick={() => handleMenuClick(onEditProfile)}>
              <span className="dropdown-icon">⚙️</span>
              <span>Edit Profile</span>
            </button>
            <button className="profile-dropdown-item" onClick={() => handleMenuClick(onReportIssue)}>
              <span className="dropdown-icon">⚠️</span>
              <span>Report an Issue</span>
            </button>
            <button className="profile-dropdown-item" >
              <span className="dropdown-icon">🌐</span>
              <span>Help (support@fastbudget.com)</span>
            </button>
          </div>

          <div className="profile-dropdown-divider"></div>

          <div className="profile-dropdown-items">
            <button className="profile-dropdown-item logout-item" onClick={() => handleMenuClick(onLogout)}>
              <span className="dropdown-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
