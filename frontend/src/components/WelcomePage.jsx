import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>Welcome to Blog Platform</h1>
        <p>A modern blog platform built with React and Django</p>
        <p>Please log in to access the blog and create amazing content!</p>

        <div className="welcome-actions">
          <button
            onClick={() => navigate('/login')}
            className="welcome-btn primary"
          >
            Get Started
          </button>
        </div>

        <div className="welcome-features">
          <h3>Features:</h3>
          <ul>
            <li>✍️ Create and edit blog posts</li>
            <li>📸 Upload images to your posts</li>
            <li>👤 Manage your profile</li>
            <li>📱 Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
