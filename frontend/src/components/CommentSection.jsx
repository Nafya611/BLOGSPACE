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
  const [replyingTo, setReplyingTo] = useState(null); // Track which comment we're replying to
  const [replyContent, setReplyContent] = useState(''); // Content for reply

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
    } catch {
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
    } catch {
      setError('Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await apiClient.post(`/api/Post/post/${postSlug}/send_comment`, {
        content: replyContent,
        parent_id: parentId
      });
      setSuccess('Reply submitted!');
      setReplyContent('');
      setReplyingTo(null);
      fetchComments();
    } catch {
      setError('Failed to submit reply.');
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  // Recursive component to render comments and replies
  const renderComment = (comment, depth = 0) => (
    <li key={comment.id} className={`comment-card ${depth > 0 ? 'comment-reply' : ''}`} style={{ marginLeft: depth * 20 }}>
      <div className="comment-header">
        <div className="comment-avatar">
          {comment.author?.profile_image ? (
            <img src={comment.author.profile_image} alt="avatar" className="avatar-img" />
          ) : (
            <div className="avatar-initials">{getInitials(comment.name || comment.author?.username || 'A')}</div>
          )}
        </div>
        <div className="comment-info">
          <span className="comment-name">{comment.author?.username}</span>
          <span className="comment-date">{comment.created_at && timeAgo(comment.created_at)}</span>
        </div>
        {isAuthenticated && (
          <button
            className="comment-reply-btn"
            onClick={() => startReply(comment.id)}
          >
            Reply
          </button>
        )}
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

      {/* Reply form */}
      {replyingTo === comment.id && (
        <div className="reply-form" style={{ marginTop: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows={2}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleReplySubmit(comment.id)}
              disabled={submitting || !replyContent.trim()}
              style={{ padding: '4px 12px', borderRadius: 4, border: 'none', backgroundColor: '#007bff', color: 'white' }}
            >
              {submitting ? 'Submitting...' : 'Reply'}
            </button>
            <button
              onClick={cancelReply}
              style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #ccc', backgroundColor: 'white' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <ul className="replies-list" style={{ marginTop: 10, listStyle: 'none', padding: 0 }}>
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </ul>
      )}
    </li>
  );

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
          {comments.map((comment) => renderComment(comment))}
        </ul>
      )}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="comment-form" style={{ marginTop: 20 }}>
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