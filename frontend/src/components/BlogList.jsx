import React, { useState, useEffect } from 'react';
import { blogApi } from '../services/blogApi';

const BlogList = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  });

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const data = await blogApi.getPosts({ page });

      // Handle paginated response
      if (data && data.results && Array.isArray(data.results)) {
        setPosts(data.results);
        setPagination({
          count: data.count || 0,
          next: data.next,
          previous: data.previous,
          currentPage: page
        });
      } else if (Array.isArray(data)) {
        // Handle non-paginated response (fallback)
        setPosts(data);
        setPagination({
          count: data.length,
          next: null,
          previous: null,
          currentPage: 1
        });
      } else {
        // Fallback: set empty array if data structure is unexpected
        console.warn('Unexpected API response format:', data);
        setPosts([]);
        setPagination({
          count: 0,
          next: null,
          previous: null,
          currentPage: 1
        });
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch posts: ' + err.message);
      console.error('Error fetching posts:', err);
      // Set empty array on error to prevent map error
      setPosts([]);
      setPagination({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [refreshTrigger]);

  const handlePageChange = (page) => {
    fetchPosts(page);
  };

  const handleNextPage = () => {
    if (pagination.next) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

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
            </article>          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.count > 5 && (
        <div className="pagination">
          <div className="pagination-info">
            <span>
              Showing {posts.length} of {pagination.count} posts
            </span>
          </div>
          <div className="pagination-controls">
            <button
              onClick={handlePreviousPage}
              disabled={!pagination.previous}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="page-info">
              Page {pagination.currentPage}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!pagination.next}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;
