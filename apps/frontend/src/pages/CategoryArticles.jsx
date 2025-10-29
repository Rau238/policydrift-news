import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { articlesAPI, categoriesAPI } from '../lib/api';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import Sidebar from '../components/layout/Sidebar';
import { formatArticleDate } from '../lib/utils';

const CategoryArticles = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ARTICLES_PER_PAGE = 12;

  useEffect(() => {
    fetchCategoryAndArticles();
  }, [slug]);

  const fetchCategoryAndArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category
      const categoryResponse = await categoriesAPI.getBySlug(slug);
      setCategory(categoryResponse.data);

      // Fetch articles for this category
      const articlesResponse = await articlesAPI.getAll({
        category: categoryResponse.data._id,
        page: 1,
        limit: ARTICLES_PER_PAGE
      });
      
      const articlesData = articlesResponse.data || [];
      setArticles(articlesData);
      setHasMore(articlesData.length === ARTICLES_PER_PAGE);
      setPage(1);
    } catch (err) {
      console.error('Error fetching category articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || !category) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const response = await articlesAPI.getAll({
        category: category._id,
        page: nextPage,
        limit: ARTICLES_PER_PAGE
      });

      const data = response.data || [];
      setHasMore(data.length === ARTICLES_PER_PAGE);
      setArticles(prev => [...prev, ...data]);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more articles:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchCategoryAndArticles} fullScreen />;
  }

  if (!category) {
    return <ErrorMessage message="Category not found" fullScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Category Header */}
      <div 
        className="relative py-20 mb-8"
        style={{ 
          background: category.color 
            ? \`linear-gradient(135deg, \${category.color} 0%, \${category.color}dd 100%)\`
            : 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4">{category.icon || '📁'}</div>
          <h1 className="text-5xl font-bold text-white mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
          <p className="text-white/80 mt-4">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {articles.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  No Articles Yet
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  No articles have been published in this category yet.
                </p>
                <Link
                  to="/"
                  className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Browse All Articles
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <Link
                      key={article._id}
                      to={\`/article/\${article.slug}\`}
                      className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {article.featured_image ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      ) : (
                        <div 
                          className="h-48"
                          style={{ 
                            background: category.color 
                              ? \`linear-gradient(to bottom right, \${category.color}, \${category.color}80)\`
                              : 'linear-gradient(to bottom right, #3B82F6, #1E40AF)'
                          }}
                        />
                      )}
                      
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {article.title}
                        </h3>
                        
                        {article.excerpt && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
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
                            <span className="font-medium">{article.author?.username || 'Anonymous'}</span>
                          </div>
                          <span>{formatArticleDate(article.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        'Load More Articles'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80">
            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CategoryArticles;
