import React, { useState, useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import { authApi } from '../services/authApi';
import './Auth.css';

const AuthContainer = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (authApi.isLoggedIn()) {
        try {
          const userProfile = await authApi.getUserProfile();
          setUser(userProfile);
          if (onAuthSuccess) {
            onAuthSuccess(userProfile);
          }
        } catch (error) {
          // Token might be invalid, clear it
          localStorage.removeItem('authToken');
          // Silently handle the auth check failure
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [onAuthSuccess]);  const handleLoginSuccess = async (userData) => {
    // The login response already contains user data, so we don't need to fetch the profile again
    setUser(userData);
    if (onAuthSuccess) {
      onAuthSuccess(userData);
    }
  };

  const handleSignupSuccess = () => {
    // After successful signup, switch to login
    setIsLogin(true);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      if (onAuthSuccess) {
        onAuthSuccess(null);
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear user state even if logout API fails
      setUser(null);
      if (onAuthSuccess) {
        onAuthSuccess(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Welcome, {user.first_name || user.username}!</h2>
          <div className="user-info">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.first_name && <p><strong>First Name:</strong> {user.first_name}</p>}
            {user.last_name && <p><strong>Last Name:</strong> {user.last_name}</p>}
          </div>
          <button onClick={handleLogout} className="auth-button logout-button">
            Logout
          </button>
        </div>
      </div>
    );  }

  return (
    <>
      {isLogin ? (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setIsLogin(false)}
        />
      ) : (
        <Signup
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </>
  );
};

export default AuthContainer;
