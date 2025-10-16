import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { ArticleCardSkeleton } from '../components/ui/Skeleton';
import { getArticleCategory } from '../lib/utils';

const CategoryArticles = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSEO({
    title: category ? `${category.name} - Category` : 'Category',
    description: `Browse all articles in the ${category?.name || ''} category`,
    url: window.location.href,
    type: 'website'
  });

  useEffect(() => {
    if (slug) {
      fetchCategoryAndArticles();
    }
  }, [slug]);

  const fetchCategoryAndArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (categoryError) throw categoryError;

      if (!categoryData) {
        setError('Category not found');
        setLoading(false);
        return;
      }

      setCategory(categoryData);

      // Fetch articles in this category
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (username, avatar_url, full_name),
          categories:category_id (name, slug)
        `)
        .eq('category_id', categoryData.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (articlesError) throw articlesError;

      setArticles(articlesData || []);
    } catch (err) {
      console.error('Error fetching category articles:', err);
      setError(err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="h-64 bg-gradient-to-br from-blue-600 to-purple-700 mb-8" />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <ErrorMessage
        message={error || 'Category not found'}
        onRetry={fetchCategoryAndArticles}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <nav className="flex items-center gap-2 text-sm text-white/80 mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white">Categories</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white font-semibold">{category.name}</span>
            </nav>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold border-2 border-white/30">
                {category.name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black mb-2">
                  {category.name}
                </h1>
                <p className="text-xl text-white/90">
                  {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                </p>
              </div>
            </div>

            {category.description && (
              <p className="text-lg text-white/90 leading-relaxed max-w-3xl">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 py-12">
        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Image */}
                  {article.featured_image && (
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                      
                      {/* Category Badge on Image */}
                      {article.categories && (
                        <div className="absolute top-4 left-4">
                          <Badge variant="primary" className="shadow-lg">
                            {getArticleCategory(article)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Author & Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        {article.profiles?.avatar_url ? (
                          <img
                            src={article.profiles.avatar_url}
                            alt={article.profiles.username}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold shadow">
                            {article.profiles?.username?.[0]?.toUpperCase() || 'A'}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {article.profiles?.full_name || article.profiles?.username || 'Anonymous'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(article.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Views */}
                      <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {article.views_count || 0}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                No Articles Yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                There are no published articles in this category yet. Check back soon!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryArticles;
