import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import WelcomePage from './components/WelcomePage';
import BlogList from './components/BlogList';
import AuthContainer from './components/AuthContainer';
import Dashboard from './components/Dashboard';
import GoogleCallback from './components/GoogleCallback';
import { authApi } from './services/authApi';
import './components/BlogList.css';
import './components/Dashboard.css';
import './App.css';

function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check for existing auth token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await authApi.getUserProfile();
          setUser(userData);
        } catch (error) {
          // Token might be invalid, clear it
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    // Even if the logout API fails, clear local state
    setUser(null);
    localStorage.removeItem('authToken');
    navigate('/');
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div className="App">
      <Navbar user={user} onLogout={handleLogout} />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              user ? <BlogList /> : <WelcomePage />
            }
          />
          <Route
            path="/blog"
            element={
              <ProtectedRoute>
                <BlogList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              user ?
              <Navigate to="/dashboard" replace /> :
              <AuthContainer onAuthSuccess={handleAuthSuccess} />
            }
          />
          <Route
            path="/accounts/google/login/callback/"
            element={<GoogleCallback />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
