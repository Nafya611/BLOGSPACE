import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1 onClick={() => navigate('/')}>Blog Platform</h1>
        </div>

        <div className="navbar-menu">
          <button
            onClick={() => navigate('/blog')}
            className={`nav-link ${isActiveRoute('/blog') || isActiveRoute('/') ? 'active' : ''}`}
          >
            Blog
          </button>

          {user ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </button>
              <div className="user-section">
                <span className="user-greeting">Hello, {user.username}!</span>
                <button onClick={onLogout} className="nav-link logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className={`nav-link ${isActiveRoute('/login') ? 'active' : ''}`}
            >
              Login/Signup
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
