import React from 'react';

const Sidebar = ({ activeView, setActiveView, darkMode, toggleDarkMode, user, handleLogout }) => {
  const menuItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">💰</span>
          <h2>Fast Budget</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li 
              key={item.id}
              className={activeView === item.id ? 'active' : ''}
              onClick={() => setActiveView(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;