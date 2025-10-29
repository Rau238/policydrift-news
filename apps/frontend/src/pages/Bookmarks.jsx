import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookmarksAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import { formatArticleDate } from '../lib/utils';

const Bookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookmarks();
  }, [user, navigate]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await bookmarksAPI.getAll();
      setBookmarks(response.data || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (articleId) => {
    try {
      await bookmarksAPI.toggle(articleId);
      await fetchBookmarks(); // Refresh list
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBookmarks} fullScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            My Bookmarks
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Articles you've saved for later ({bookmarks.length})
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No Bookmarks Yet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Start bookmarking articles to read them later
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Articles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => {
              const article = bookmark.article;
              return (
                <div
                  key={bookmark._id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <Link to={\`/article/\${article.slug}\`}>
                    {article.featured_image ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600" />
                    )}
                  </Link>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      {article.category && (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: article.category.color || '#3B82F6' }}
                        >
                          {article.category.icon} {article.category.name}
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveBookmark(article._id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Remove bookmark"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    </div>

                    <Link to={\`/article/\${article.slug}\`}>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>

                    {article.excerpt && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        {article.author?.avatar_url ? (
                          <img
                            src={article.author.avatar_url}
                            alt={article.author.username}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                        )}
                        <span>{article.author?.username || 'Anonymous'}</span>
                      </div>
                      <span>{formatArticleDate(article.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
