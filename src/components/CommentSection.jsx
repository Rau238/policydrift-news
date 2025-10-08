import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from './ui/Button';

const CommentSection = ({ articleId }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`comments:${articleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${articleId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchComments();
          } else if (payload.eventType === 'UPDATE') {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === payload.new.id
                  ? { ...comment, ...payload.new }
                  : comment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setComments((prev) =>
              prev.filter((comment) => comment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: newComment.trim(),
          parent_id: replyTo?.id || null,
        });

      if (error) throw error;

      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      setEditingComment(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  const startReply = (comment) => {
    setReplyTo(comment);
    setNewComment(`@${comment.profiles.username} `);
  };

  const startEdit = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const cancelReply = () => {
    setReplyTo(null);
    setNewComment('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const organizeComments = () => {
    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach((comment) => {
      if (comment.parent_id) {
        if (commentMap[comment.parent_id]) {
          commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const isAuthor = user && comment.user_id === user.id;
    const isEditing = editingComment === comment.id;

    return (
      <div className={`comment ${isReply ? 'comment--reply' : ''}`}>
        <div className="comment__avatar">
          {comment.profiles?.avatar_url ? (
            <img src={comment.profiles.avatar_url} alt={comment.profiles.username} />
          ) : (
            <div className="comment__avatar-placeholder">
              {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        <div className="comment__content">
          <div className="comment__header">
            <span className="comment__author">
              {comment.profiles?.username || 'Anonymous'}
            </span>
            <span className="comment__date">{formatDate(comment.created_at)}</span>
          </div>

          {isEditing ? (
            <div className="comment__edit">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="comment__edit-textarea"
                rows="3"
              />
              <div className="comment__edit-actions">
                <Button size="small" onClick={() => handleEditComment(comment.id)}>
                  Save
                </Button>
                <Button size="small" variant="ghost" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="comment__text">{comment.content}</p>
              <div className="comment__actions">
                {user && (
                  <button
                    onClick={() => startReply(comment)}
                    className="comment__action"
                  >
                    Reply
                  </button>
                )}
                {isAuthor && (
                  <>
                    <button
                      onClick={() => startEdit(comment)}
                      className="comment__action"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="comment__action comment__action--danger"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="comment__replies">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const organizedComments = organizeComments();

  return (
    <div className="comment-section">
      <h2 className="comment-section__title">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="comment-section__form">
        {replyTo && (
          <div className="comment-section__reply-info">
            Replying to <strong>@{replyTo.profiles.username}</strong>
            <button
              type="button"
              onClick={cancelReply}
              className="comment-section__cancel-reply"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="comment-section__input-wrapper">
          {user && profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="comment-section__avatar"
            />
          ) : user ? (
            <div className="comment-section__avatar-placeholder">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          ) : (
            <div className="comment-section__avatar-placeholder">👤</div>
          )}
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? 'Write a comment...' : 'Sign in to comment'}
            className="comment-section__textarea"
            rows="3"
            disabled={!user}
          />
        </div>

        <div className="comment-section__form-actions">
          {!user ? (
            <Button type="button" onClick={() => navigate('/login')}>
              Sign in to comment
            </Button>
          ) : (
            <>
              {replyTo && (
                <Button type="button" variant="ghost" onClick={cancelReply}>
                  Cancel Reply
                </Button>
              )}
              <Button type="submit" loading={submitting} disabled={!newComment.trim()}>
                {replyTo ? 'Post Reply' : 'Post Comment'}
              </Button>
            </>
          )}
        </div>
      </form>

      {/* Comments List */}
      <div className="comment-section__list">
        {loading ? (
          <p className="comment-section__loading">Loading comments...</p>
        ) : organizedComments.length === 0 ? (
          <p className="comment-section__empty">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          organizedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
