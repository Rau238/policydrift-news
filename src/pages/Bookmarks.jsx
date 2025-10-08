import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const Bookmarks = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();

      // Subscribe to real-time updates
      const subscription = supabase
        .channel('user-bookmarks')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchBookmarks();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bookmarks')
        .select(`
          id,
          created_at,
          articles:article_id (
            id,
            title,
            slug,
            excerpt,
            featured_image,
            created_at,
            profiles:author_id (username, avatar_url),
            categories:category_id (name, slug)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setBookmarks(data || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic update
    setRemovingIds(prev => new Set([...prev, bookmarkId]));
    
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;
      
      // Remove from local state
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
      alert('Failed to remove bookmark');
      // Revert optimistic update
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookmarkId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get unique categories from bookmarks
  const categories = bookmarks.reduce((acc, bookmark) => {
    if (bookmark.articles?.categories) {
      const cat = bookmark.articles.categories;
      if (!acc.find(c => c.id === cat.id)) {
        acc.push({ id: cat.id, name: cat.name, slug: cat.slug });
      }
    }
    return acc;
  }, []);

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const article = bookmark.articles;
    if (!article) return false;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesTitle = article.title?.toLowerCase().includes(searchLower);
      const matchesExcerpt = article.excerpt?.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesExcerpt) return false;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (article.category_id !== selectedCategory) return false;
    }

    return true;
  });

  const clearAllBookmarks = async () => {
    if (!window.confirm('Are you sure you want to remove all bookmarks? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarks([]);
    } catch (err) {
      console.error('Error clearing bookmarks:', err);
      alert('Failed to clear bookmarks');
    }
  };

  if (authLoading || loading) {
    return <Loading fullScreen text="Loading bookmarks..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBookmarks} fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  My Bookmarks
                </span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {bookmarks.length} saved {bookmarks.length === 1 ? 'article' : 'articles'}
              </p>
            </div>
            {bookmarks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllBookmarks}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          {bookmarks.length > 0 && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search your bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    All ({bookmarks.length})
                  </button>
                  {categories.map((category) => {
                    const count = bookmarks.filter(b => b.articles?.category_id === category.id).length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {category.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Results count */}
              {(searchQuery || selectedCategory !== 'all') && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {filteredBookmarks.length} of {bookmarks.length} bookmarks
                </p>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                No bookmarks yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start saving articles you want to read later
              </p>
              <Link to="/">
                <Button variant="primary" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Browse Articles
                </Button>
              </Link>
            </div>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                No results found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your search or filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map((bookmark) => {
              const article = bookmark.articles;
              if (!article) return null;

              const isRemoving = removingIds.has(bookmark.id);

              return (
                <Link
                  key={bookmark.id}
                  to={`/article/${article.slug}`}
                  className={`group block transition-all ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Card
                    variant="elevated"
                    hover
                    className="h-full overflow-hidden transition-all duration-300 hover:shadow-2xl"
                  >
                    {/* Article Image */}
                    {article.featured_image && (
                      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Bookmark Remove Button */}
                        <button
                          onClick={(e) => handleRemoveBookmark(bookmark.id, e)}
                          className="absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-red-500 hover:text-white shadow-lg z-10"
                          title="Remove bookmark"
                        >
                          {isRemoving ? (
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="p-5">
                      {/* Category Badge */}
                      {article.categories && (
                        <Badge
                          variant="primary"
                          className="mb-3"
                        >
                          {article.categories.name}
                        </Badge>
                      )}

                      {/* Article Title */}
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>

                      {/* Article Excerpt */}
                      {article.excerpt && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Article Meta */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          {article.profiles?.avatar_url ? (
                            <img
                              src={article.profiles.avatar_url}
                              alt={article.profiles.username}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                              {article.profiles?.username?.[0]?.toUpperCase() || 'A'}
                            </div>
                          )}
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {article.profiles?.username || 'Anonymous'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(bookmark.created_at)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
