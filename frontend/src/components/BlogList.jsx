import React, { useState, useEffect } from 'react';
import { blogApi } from '../services/blogApi';

const BlogList = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getPosts();

        // Handle different response formats
        if (Array.isArray(data)) {
          setPosts(data);
        } else if (data && Array.isArray(data.results)) {
          // Handle paginated response
          setPosts(data.results);
        } else if (data && data.posts && Array.isArray(data.posts)) {
          // Handle nested posts array
          setPosts(data.posts);
        } else {
          // Fallback: set empty array if data structure is unexpected
          console.warn('Unexpected API response format:', data);
          setPosts([]);
        }

        setError(null);
      } catch (err) {
        setError('Failed to fetch posts: ' + err.message);
        console.error('Error fetching posts:', err);
        // Set empty array on error to prevent map error
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="blog-list">
        <h2>Blog Posts</h2>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-list">
        <h2>Blog Posts</h2>
        <div className="error">
          <p>{error}</p>
          <p>Make sure your Django server is running on http://localhost:8000</p>
        </div>
      </div>
    );
  }
  return (
    <div className="blog-list">
      <h2>Blog Posts</h2>
      {!Array.isArray(posts) || posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <div className="posts-grid">          {posts.map((post, index) => (
            <article key={post.id || post.slug || index} className="post-card">
              <h3>{post.title || 'Untitled'}</h3>
              <p className="post-meta">
                {post.created_at && new Date(post.created_at).toLocaleDateString()}
                {post.author && (typeof post.author === 'string' ? ` by ${post.author}` :
                  typeof post.author === 'object' && post.author.username ? ` by ${post.author.username}` : '')}
              </p>
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
  );
};

export default BlogList;
