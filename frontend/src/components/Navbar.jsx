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
          <h1 onClick={() => navigate(user ? '/blog' : '/login')}>Blog Platform</h1>
        </div>

        <div className="navbar-menu">
          {user ? (
            <>
              <button
                onClick={() => navigate('/blog')}
                className={`nav-link ${isActiveRoute('/blog') || isActiveRoute('/') ? 'active' : ''}`}
              >
                Blog
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/my-profile')}
                className={`nav-link ${isActiveRoute('/my-profile') ? 'active' : ''}`}
              >
                My Profile
              </button>
              <div className="user-section">
                <div className="user-profile-section">
                  <div
                    className="user-profile-container"
                    onClick={() => navigate(`/profile/${user.username}`)}
                    title={`View ${user.username}'s profile`}
                  >
                    {user.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt={`${user.username}'s profile`}
                        className="navbar-profile-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="navbar-profile-placeholder"
                      style={{ display: user.profile_image_url ? 'none' : 'flex' }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-greeting">Hello, {user.username}!</span>
                  </div>
                </div>
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
