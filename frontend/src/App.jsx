import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import BlogList from './components/BlogList';
import AuthContainer from './components/AuthContainer';
import Dashboard from './components/Dashboard';
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
      <header className="App-header">
        <h1>Blog Frontend</h1>
        <p>React frontend connected to Django REST API</p>

        <nav className="nav-buttons">
          <button
            onClick={() => navigate('/blog')}
            className="nav-button"
          >
            Blog
          </button>

          {user ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="nav-button"
              >
                Dashboard
              </button>
              <span className="user-greeting">Hello, {user.username}!</span>
              <button onClick={handleLogout} className="nav-button logout">
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="nav-button"
            >
              Login/Signup
            </button>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/blog" element={<BlogList />} />
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
