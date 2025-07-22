import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>Welcome to Blog Platform</h1>
        <p>A modern blog platform built with React and Django</p>
        <p>
          Experience our {isDarkMode ? '🌙 Dark' : '☀️ Light'} mode theme!
          Toggle the theme using the button in the navigation bar.
        </p>

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
            <li>📸 Upload images and videos to your posts</li>
            <li>👤 Manage your profile</li>
            <li>🎨 Beautiful dark/light mode themes</li>
            <li>📱 Responsive design</li>
            <li>💬 Interactive comments system</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
