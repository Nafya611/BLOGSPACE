import React, { useState, useEffect } from 'react';
import { blogApi } from '../services/blogApi';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getPosts();
        setPosts(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch posts: ' + err.message);
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <div className="posts-grid">
          {posts.map((post, index) => (
            <article key={post.id || index} className="post-card">
              <h3>{post.title}</h3>
              <p className="post-meta">
                {post.created_at && new Date(post.created_at).toLocaleDateString()}
                {post.author && ` by ${post.author}`}
              </p>
              {post.content && (
                <div className="post-excerpt">
                  {post.content.substring(0, 150)}...
                </div>
              )}
              {post.category && (
                <span className="post-category">{post.category}</span>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
