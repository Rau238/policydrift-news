import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { commentsAPI } from '../lib/api';
import Button from './ui/Button';

const CommentSection = ({ articleId }) => {
  const { user } = useAuth();
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
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getByArticle(articleId);
      setComments(response.data || []);
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
      await commentsAPI.create({
        article: articleId,
        content: newComment.trim(),
        parent_comment: replyTo?.id || null,
      });

      setNewComment('');
      setReplyTo(null);
      await fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Error posting comment:', err);
      alert(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      await commentsAPI.update(commentId, { content: editContent.trim() });
      setEditingComment(null);
      setEditContent('');
      await fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Error updating comment:', err);
      alert(err.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsAPI.delete(commentId);
      await fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert(err.message || 'Failed to delete comment');
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await commentsAPI.toggleLike(commentId);
      await fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const startReply = (comment) => {
    setReplyTo(comment);
    setNewComment(`@${comment.user?.username || 'User'} `);
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
    // Comments from backend already have replies populated
    // Just filter for root-level comments
    return comments.filter(comment => !comment.parent_comment);
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const isAuthor = user && comment.user?._id === user._id;
    const isEditing = editingComment === comment._id;
    const isLiked = comment.likes?.includes(user?._id);

    return (
      <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : 'mt-4'}`}>
        <div className="flex-shrink-0">
          {comment.user?.avatar_url ? (
            <img 
              src={comment.user.avatar_url} 
              alt={comment.user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-slate-900 dark:text-white">
              {comment.user?.username || 'Anonymous'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(comment.created_at)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                (edited)
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditComment(comment._id)}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                {comment.content}
              </p>
              <div className="flex items-center gap-3">
                {user && (
                  <button
                    onClick={() => handleToggleLike(comment._id)}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                      isLiked 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <svg className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {comment.likes?.length || 0}
                  </button>
                )}
                {user && (
                  <button
                    onClick={() => startReply(comment)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Reply
                  </button>
                )}
                {isAuthor && (
                  <>
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem key={reply._id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };  const organizedComments = organizeComments();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        {replyTo && (
          <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-400">
              Replying to <strong>@{replyTo.user?.username || 'User'}</strong>
            </span>
            <button
              type="button"
              onClick={cancelReply}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex gap-3 mb-3">
          {user && user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : user ? (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? 'Write a comment...' : 'Sign in to comment'}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            rows="3"
            disabled={!user}
          />
        </div>

        <div className="flex justify-end gap-2">
          {!user ? (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-sm transition-all"
            >
              Sign in to comment
            </button>
          ) : (
            <>
              {replyTo && (
                <button
                  type="button"
                  onClick={cancelReply}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel Reply
                </button>
              )}
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </span>
                ) : (
                  replyTo ? 'Post Reply' : 'Post Comment'
                )}
              </button>
            </>
          )}
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-1">
        {loading ? (
          <p className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            Loading comments...
          </p>
        ) : organizedComments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {organizedComments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
