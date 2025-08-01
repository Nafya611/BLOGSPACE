import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import WelcomePage from './components/WelcomePage';
import BlogList from './components/BlogList';
import AuthContainer from './components/AuthContainer';
import Dashboard from './components/Dashboard';
import PublicUserProfile from './components/PublicUserProfile';
import UserProfile from './components/UserProfile';
import GoogleCallback from './components/GoogleCallback';
import HealthCheck from './components/HealthCheck';
import TestComponent from './components/TestComponent';
import GoogleOAuthDiagnostic from './components/GoogleOAuthDiagnostic';
import ImageTest from './components/ImageTest';
import { authApi } from './services/authApi';
import './components/BlogList.css';
import './components/Dashboard.css';
import './components/DarkModeEnhancements.css';
import './App.css';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check for existing auth token on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
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
      } catch (error) {
        console.error('Failed to check authentication:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Add error boundary for the auth check
    checkAuth().catch(error => {
      console.error('Failed to check authentication:', error);
      setError(error.message);
      setLoading(false);
    });
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

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
        <p>Initializing application...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Application Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar user={user} onLogout={handleLogout} />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <TestComponent />
                <HealthCheck />
                {user ? <BlogList user={user} /> : <WelcomePage />}
              </div>
            }
          />
          <Route
            path="/blog"
            element={
              <ProtectedRoute>
                <BlogList user={user} />
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
            path="/profile/:username"
            element={<PublicUserProfile />}
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <UserProfile user={user} onUserUpdate={handleUserUpdate} />
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
          <Route
            path="/auth/callback"
            element={<GoogleCallback />}
          />
          <Route
            path="/oauth-diagnostic"
            element={<GoogleOAuthDiagnostic />}
          />
          <Route
            path="/image-test"
            element={<ImageTest />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
