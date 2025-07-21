import React, { useState, useEffect, useCallback } from 'react';
import { blogApi } from '../services/blogApi';
import CommentSection from './CommentSection';
import './BlogDetail.css';

const BlogDetail = ({ post, onBack, onEdit, onDelete, user }) => {
  const [fullPost, setFullPost] = useState(post);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFullPost = useCallback(async () => {
    try {
      setLoading(true);
      const fullPostData = await blogApi.getPost(post.slug);
      setFullPost(fullPostData);
      setError(null);
    } catch (err) {
      console.error('Error fetching full post:', err);
      setError('Failed to load full post details');
    } finally {
      setLoading(false);
    }
  }, [post.slug]);

  useEffect(() => {
    // If we only have basic post data, fetch the full details
    if (post && post.slug && (!post.content || post.content.length <= 150)) {
      fetchFullPost();
    }
  }, [post, fetchFullPost]);

  if (loading) {
    return (
      <div className="blog-detail">
        <button onClick={onBack} className="back-btn">
          ← Back to Posts
        </button>
        <p>Loading full post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-detail">
        <button onClick={onBack} className="back-btn">
          ← Back to Posts
        </button>
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchFullPost} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!fullPost) {
    return (
      <div className="blog-detail">
        <button onClick={onBack} className="back-btn">
          ← Back to Posts
        </button>
        <p>Post not found</p>
      </div>
    );
  }

  return (
    <div className="blog-detail">
      <div className="blog-detail-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Posts
        </button>
        <div className="blog-actions">
          {user && fullPost.author && fullPost.author.username === user.username && (
            <>
              <button
                onClick={() => onEdit(fullPost)}
                className="edit-btn"
                title="Edit post"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => onDelete(fullPost)}
                className="delete-btn"
                title="Delete post"
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      <article className="blog-detail-content">
        {fullPost.image_url && (
          <div className="blog-detail-image">
            <img
              src={fullPost.image_url}
              alt={fullPost.title || 'Blog post image'}
              className="blog-detail-thumbnail"
              onError={(e) => {
                console.error('Failed to load image:', fullPost.image_url);
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {fullPost.video_url && (
          <div className="blog-detail-video">
            <video
              src={fullPost.video_url}
              className="blog-detail-video-player"
              controls
              preload="metadata"
              onError={(e) => {
                console.error('Failed to load video:', fullPost.video_url);
                e.target.style.display = 'none';
              }}
              onLoadedMetadata={() => {
                console.log('Video loaded successfully:', fullPost.video_url);
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <header className="blog-detail-header-content">
          <h1>{fullPost.title || 'Untitled'}</h1>

          <div className="blog-meta">
            <span className="blog-date">
              {fullPost.created_at && new Date(fullPost.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {fullPost.author && fullPost.author.username && (
              <span className="blog-author">
                by {fullPost.author.username}
              </span>
            )}
          </div>

          <div className="blog-taxonomy">
            {fullPost.category && (
              <span className="blog-category">
                Category: {typeof fullPost.category === 'string' ? fullPost.category :
                  typeof fullPost.category === 'object' && fullPost.category.name ? fullPost.category.name : 'Uncategorized'}
              </span>
            )}

            {fullPost.tag && Array.isArray(fullPost.tag) && fullPost.tag.length > 0 && (
              <div className="blog-tags">
                <span>Tags: </span>
                {fullPost.tag.map((tag, index) => (
                  <span key={tag.slug || tag.id || index} className="blog-tag">
                    {typeof tag === 'string' ? tag : tag.name || tag.slug}
                    {index < fullPost.tag.length - 1 && ', '}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="blog-content">
          {fullPost.content ? (
            <div
              className="blog-content-text"
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                fontSize: '1.1rem'
              }}
            >
              {fullPost.content}
            </div>
          ) : (
            <p className="no-content">No content available for this post.</p>
          )}
        </div>

        {fullPost.updated_at && fullPost.updated_at !== fullPost.created_at && (
          <footer className="blog-footer">
            <small>
              Last updated: {new Date(fullPost.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </small>
          </footer>
        )}
      </article>
      <CommentSection postSlug={fullPost.slug} isAuthenticated={!!localStorage.getItem('authToken')} />
    </div>
  );
};

export default BlogDetail;
