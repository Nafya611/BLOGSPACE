import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { blogApi } from '../services/blogApi';
import './UserProfile.css';

const PublicUserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profile = await authApi.getUserProfileByUsername(username);
        setUserProfile(profile);

        // Fetch user's posts
        try {
          const postsData = await blogApi.getPosts({ author: username });
          if (postsData && postsData.results && Array.isArray(postsData.results)) {
            setUserPosts(postsData.results);
          } else if (Array.isArray(postsData)) {
            setUserPosts(postsData);
          } else {
            setUserPosts([]);
          }
        } catch (postsError) {
          console.error('Error fetching user posts:', postsError);
          setUserPosts([]);
        }

      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('User not found or error loading profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  const handlePostClick = (post) => {
    navigate(`/blog/post/${post.slug}`);
  };

  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading">Loading user profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/blog')} className="back-btn">
          Back to Blog
        </button>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="user-profile">
        <div className="error">User not found</div>
        <button onClick={() => navigate('/blog')} className="back-btn">
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <button onClick={() => navigate('/blog')} className="back-btn">
        ← Back to Blog
      </button>

      <div className="profile-header">
        <div className="profile-image-container">
          {userProfile.profile_image_url ? (
            <img
              src={userProfile.profile_image_url}
              alt={`${userProfile.username}'s profile`}
              className="profile-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="profile-image-placeholder"
            style={{ display: userProfile.profile_image_url ? 'none' : 'flex' }}
          >
            {userProfile.username.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-info">
          <h1>{userProfile.username}</h1>
          {(userProfile.first_name || userProfile.last_name) && (
            <p className="full-name">
              {userProfile.first_name} {userProfile.last_name}
            </p>
          )}
          <p className="member-since">
            Member since {new Date(userProfile.date_joined).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="user-posts-section">
        <h2>Posts by {userProfile.username} ({userPosts.length})</h2>

        {userPosts.length === 0 ? (
          <p className="no-posts">This user hasn't published any posts yet.</p>
        ) : (
          <div className="posts-grid">
            {userPosts.map((post) => (
              <article
                key={post.id || post.slug}
                className="post-card"
                onClick={() => handlePostClick(post)}
                style={{ cursor: 'pointer' }}
              >
                {post.image_url && (
                  <div className="post-image">
                    <img
                      src={post.image_url}
                      alt={post.title || 'Post image'}
                      className="post-thumbnail"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="post-header">
                  <h3>{post.title || 'Untitled'}</h3>
                  <div className="post-meta">
                    <span className="post-date">
                      {post.created_at && new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {post.content && (
                  <div className="post-excerpt">
                    {String(post.content).substring(0, 150)}...
                  </div>
                )}
                {post.category && (
                  <span className="post-category">
                    {typeof post.category === 'string' ? post.category :
                      typeof post.category === 'object' && post.category.name ? post.category.name : 'Category'}
                  </span>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicUserProfile;
