import React from 'react';
import BlogList from './BlogList';

const Dashboard = ({ user }) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome to Your Dashboard, {user?.username || 'User'}!</h2>
        <div className="user-info-summary">
          <p>Email: {user?.email}</p>
          {user?.first_name && <p>Name: {user.first_name} {user.last_name}</p>}
        </div>
      </div>

      <div className="dashboard-content">
        <section className="blog-section">
          <h3>Latest Blog Posts</h3>
          <BlogList />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
