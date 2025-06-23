import React from 'react';

const Sidebar = ({ activeSection, onSectionChange, user, onLogout }) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: '📊'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: '👤'
    },
    {
      id: 'blogs',
      label: 'Blog Posts',
      icon: '📝'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️'
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-avatar">
          <div className="avatar-circle">
            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
        <div className="user-info">
          <h3>{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}</h3>
          <p>{user?.email}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onSectionChange(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={onLogout}
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
