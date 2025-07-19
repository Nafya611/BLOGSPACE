import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import BlogList from './BlogList';
import CreatePost from './CreatePost';
import { authApi } from '../services/authApi';
import './Dashboard.css';

const Dashboard = ({ user: initialUser, onUserUpdate, onLogout }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(0);  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  // Fetch fresh user data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authApi.isLoggedIn() && !user) {
        setLoading(true);
        try {
          const userData = await authApi.getUserProfile();
          setUser(userData);
          if (onUserUpdate) {
            onUserUpdate(userData);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, onUserUpdate]);

  // Handle dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };
  const handlePostCreated = (newPost) => {
    // Trigger refresh for BlogList components
    setRefreshPosts(prev => prev + 1);
    // Switch to blogs section to show the new post
    setActiveSection('blogs');
    // You could also add a success message here
    console.log('Post created successfully:', newPost);
  };
  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      // Fallback if onLogout is not provided
      try {
        await authApi.logout();
        localStorage.removeItem('authToken');
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    }
  };
  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="dashboard-overview">
            <div className="dashboard-header">
              <h1>Welcome to Your Dashboard</h1>
              <div className="action-buttons">
                <button
                  onClick={() => setActiveSection('create-post')}
                  className="create-post-btn"
                >
                  ✍️ Create New Post
                </button>
                <button
                  onClick={() => setActiveSection('blogs')}
                  className="view-posts-btn"
                >
                  📝 View My Posts
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Profile Status</h3>
                <p>{user?.first_name && user?.last_name ? 'Complete' : 'Incomplete'}</p>
              </div>
              <div className="stat-card">
                <h3>Account Type</h3>
                <p>Standard User</p>
              </div>
              <div className="stat-card">
                <h3>Member Since</h3>
                <p>{user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Recently'}</p>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <BlogList refreshTrigger={refreshPosts} user={user} />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="profile-section">
            <UserProfile user={user} onUserUpdate={handleUserUpdate} />
          </div>
        );

      case 'create-post':
        return (
          <div className="create-post-section">
            <div className="section-header">
              <h1>Create New Post</h1>
              <button
                onClick={() => setActiveSection('overview')}
                className="back-btn"
              >
                ← Back to Dashboard
              </button>
            </div>
            <CreatePost
              onPostCreated={handlePostCreated}
              onCancel={() => setActiveSection('overview')}
            />
          </div>
        );

      case 'blogs':
        return (
          <div className="blogs-section">
            <div className="section-header">
              <h1>My Blog Posts</h1>
              <button
                onClick={() => setActiveSection('create-post')}
                className="create-post-btn"
              >
                ✍️ Create New Post
              </button>
            </div>
            <BlogList refreshTrigger={refreshPosts} />
          </div>
        );

      case 'settings':
        return (
          <div className="settings-section">
            <h1>Settings</h1>
            <div className="settings-content">
              <div className="setting-group">
                <h3>Account Settings</h3>
                <p>Manage your account preferences and security settings.</p>
                <button className="settings-btn">Change Password</button>
              </div>
              <div className="setting-group">
                <h3>Notifications</h3>
                <p>Configure your notification preferences.</p>
                <button className="settings-btn">Notification Settings</button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-left">
          <h1 className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>BlogSpace</h1>
        </div>

        <div className="nav-center">
          <div className="nav-links">
            <button
              className={`nav-link ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              Dashboard
            </button>
            <button
              className={`nav-link ${activeSection === 'blogs' ? 'active' : ''}`}
              onClick={() => setActiveSection('blogs')}
            >
              My Posts
            </button>
            <button
              className={`nav-link ${activeSection === 'create-post' ? 'active' : ''}`}
              onClick={() => setActiveSection('create-post')}
            >
              Create Post
            </button>
          </div>
        </div>

        <div className="nav-right">
          <div className="profile-dropdown" ref={dropdownRef}>
            <button
              className="profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="profile-avatar">
                {user?.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt={`${user.username || 'User'}'s profile`}
                    className="profile-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="profile-image-placeholder"
                  style={{ display: user?.profile_image_url ? 'none' : 'flex' }}
                >
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <span className="profile-name">
                {user?.first_name || user?.username || 'User'}
              </span>
              <svg className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActiveSection('profile');
                    setDropdownOpen(false);
                  }}
                >
                  <span className="dropdown-icon">👤</span>
                  View Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActiveSection('profile');
                    setDropdownOpen(false);
                  }}
                >
                  <span className="dropdown-icon">✏️</span>
                  Edit Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActiveSection('settings');
                    setDropdownOpen(false);
                  }}
                >
                  <span className="dropdown-icon">⚙️</span>
                  Settings
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item logout"
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  <span className="dropdown-icon">🚪</span>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default Dashboard;
