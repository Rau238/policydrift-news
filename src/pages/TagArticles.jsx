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

const TagArticles = () => {
  const { slug } = useParams();
  const [tag, setTag] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSEO({
    title: tag ? `#${tag.name} - Tag` : 'Tag',
    description: `Browse all articles tagged with ${tag?.name || ''}`,
    url: window.location.href,
    type: 'website'
  });

  useEffect(() => {
    if (slug) {
      fetchTagAndArticles();
    }
  }, [slug]);

  const fetchTagAndArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add a minimum loading time to ensure skeleton is visible
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 600));

      // Fetch tag
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (tagError) throw tagError;

      if (!tagData) {
        setError('Tag not found');
        setLoading(false);
        return;
      }

      setTag(tagData);

      // Fetch articles with this tag (using array contains)
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (username, avatar_url, full_name),
          categories:category_id (name, slug)
        `)
        .contains('tags', [tagData.name])
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (articlesError) throw articlesError;

      // Wait for minimum load time
      await minLoadTime;

      setArticles(articlesData || []);
    } catch (err) {
      console.error('Error fetching tag articles:', err);
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
        <div className="h-64 bg-gradient-to-br from-purple-600 to-pink-700 mb-8" />
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

  if (error || !tag) {
    return (
      <ErrorMessage
        message={error || 'Tag not found'}
        onRetry={fetchTagAndArticles}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <nav className="flex items-center gap-2 text-sm text-white/80 mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white">Tags</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white font-semibold">#{tag.name}</span>
            </nav>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold border-2 border-white/30">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black mb-2">
                  #{tag.name}
                </h1>
                <p className="text-xl text-white/90">
                  {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                </p>
              </div>
            </div>

            {tag.description && (
              <p className="text-lg text-white/90 leading-relaxed max-w-3xl">
                {tag.description}
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 3).map((tagName, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold"
                          >
                            #{tagName}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-semibold">
                            +{article.tags.length - 3}
                          </span>
                        )}
                      </div>
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
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold shadow">
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
                <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                No Articles Yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                There are no published articles with this tag yet. Check back soon!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
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

export default TagArticles;
