import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import './CommentSection.css';

// Helper to get initials from name
function getInitials(name) {
  if (!name) return 'A';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper to get 'X days ago' format
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

const CommentSection = ({ postSlug, isAuthenticated }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [postSlug]);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/api/Post/post/${postSlug}/read_comments`);
      setComments(response.data.results || response.data || []);
    } catch (err) {
      setError('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.post(`/api/Post/post/${postSlug}/send_comment`, { content, name, email });
      setSuccess('Comment submitted!');
      setContent('');
      setName('');
      setEmail('');
      fetchComments();
    } catch (err) {
      setError('Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments</h3>
      {loading ? (
        <p>Loading comments...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-card">
              <div className="comment-header">
                <div className="comment-avatar">
                  {/* Avatar with initials or image */}
                  {comment.author?.profile_image ? (
                    <img src={comment.author.profile_image} alt="avatar" className="avatar-img" />
                  ) : (
                    <div className="avatar-initials">{getInitials(comment.name || comment.author?.username || 'A')}</div>
                  )}
                </div>
                <div className="comment-info">
                  <span className="comment-name">{comment.name || comment.author?.username || 'Anonymous'}</span>
                  <span className="comment-date">{comment.created_at && timeAgo(comment.created_at)}</span>
                </div>
                <button className="comment-reply-btn">Reply</button>
              </div>
              <div className="comment-content">{comment.content}</div>
              <div className="comment-actions">
                <button className="comment-action-btn" title="Like">
                  <span role="img" aria-label="like">👍</span>
                </button>
                <button className="comment-action-btn" title="Dislike">
                  <span role="img" aria-label="dislike">👎</span>
                </button>
                <button className="comment-action-btn comment-reactions-btn">
                  <span role="img" aria-label="reactions">😀</span> Reactions
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="comment-form" style={{ marginTop: 20 }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name (optional)"
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email (optional)"
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your comment..."
            rows={3}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button type="submit" disabled={submitting || !content.trim()} style={{ marginTop: 8 }}>
            {submitting ? 'Submitting...' : 'Submit Comment'}
          </button>
          {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
        </form>
      )}
      {!isAuthenticated && <p style={{ color: '#888', marginTop: 10 }}>Log in to write a comment.</p>}
    </div>
  );
};

export default CommentSection;