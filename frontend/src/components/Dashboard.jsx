import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserProfile from './UserProfile';
import BlogList from './BlogList';
import CreatePost from './CreatePost';
import { authApi } from '../services/authApi';
import './Sidebar.css';
import './CreatePost.css';

const Dashboard = ({ user: initialUser, onUserUpdate }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(0);
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
    try {
      await authApi.logout();
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state even if API call fails
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="dashboard-overview">
            <h1>Welcome to Your Dashboard</h1>
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
            </div>            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <BlogList refreshTrigger={refreshPosts} />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="profile-section">
            <UserProfile user={user} onUserUpdate={handleUserUpdate} />
          </div>
        );      case 'create-post':
        return (
          <div className="create-post-section">
            <CreatePost
              onPostCreated={handlePostCreated}
              onCancel={() => setActiveSection('blogs')}
            />
          </div>
        );      case 'blogs':
        return (
          <div className="blogs-section">
            <h1>My Blog Posts</h1>
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
    <div className="dashboard-layout">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        onLogout={handleLogout}
      />
      <main className="dashboard-main">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default Dashboard;
