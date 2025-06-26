import React, { useState, useEffect } from 'react';
import { blogApi } from '../services/blogApi';
import EditPost from './EditPost';

const BlogList = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
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
        console.log('Pagination data:', {
          count: data.count,
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

  const handleEditPost = (post) => {
    setEditingPost(post);
  };

  const handlePostUpdated = (updatedPost) => {
    // Update the post in the posts array
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.slug === updatedPost.slug ? updatedPost : post
      )
    );
    setEditingPost(null);

    // Optionally refetch to ensure data consistency
    // fetchPosts(pagination.currentPage);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  const handleDeletePost = async (post) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      try {
        await blogApi.deletePost(post.slug);

        // Check if we need to go to previous page (if current page becomes empty)
        const remainingPostsOnPage = posts.length - 1;
        const shouldGoToPreviousPage = remainingPostsOnPage === 0 && pagination.currentPage > 1;

        if (shouldGoToPreviousPage) {
          // Go to previous page
          fetchPosts(pagination.currentPage - 1);
        } else {
          // Refetch current page to maintain proper pagination
          fetchPosts(pagination.currentPage);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        setError(`Failed to delete post: ${error.message}`);
      }
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
      ) : (        <div className="posts-grid">
          {posts.map((post, index) => (
            <div key={post.id || post.slug || index}>
              {editingPost && editingPost.slug === post.slug ? (
                <EditPost
                  post={post}
                  onPostUpdated={handlePostUpdated}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <article className="post-card">
                  {post.image && (
                    <div className="post-image">
                      <img
                        src={post.image}
                        alt={post.title || 'Post image'}
                        className="post-thumbnail"
                      />
                    </div>
                  )}
                  <div className="post-header">
                    <h3>{post.title || 'Untitled'}</h3>
                    <div className="post-actions">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="edit-btn"
                        title="Edit post"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeletePost(post)}
                        className="delete-btn"
                        title="Delete post"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
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
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.count > 3 && (pagination.next || pagination.previous) && (
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
