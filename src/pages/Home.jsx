import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/ui/Badge';
import AdSense from '../components/AdSense';
import { useSEO } from '../hooks/useSEO';
import { ArticleCardSkeleton, CategorySectionSkeleton } from '../components/ui/Skeleton';
import { getArticleCategory, formatArticleDate, calculateReadTime } from '../lib/utils';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryArticles, setCategoryArticles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ARTICLES_PER_PAGE = 12;

  // SEO for home page
  useSEO({
    url: window.location.origin,
    type: 'website'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch breaking news (latest 5 published articles from last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: breakingData } = await supabase
        .from('articles')
        .select('id, title, slug, created_at')
        .eq('status', 'published')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);
      
      setBreakingNews(breakingData || []);

      // Fetch featured articles (top 3)
      const { data: featuredData } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (username, avatar_url, full_name),
          categories:category_id (name, slug, color, icon)
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

      setFeaturedArticles(featuredData || []);

      // Fetch all active categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
        .limit(6); // Show top 6 categories

      setCategories(categoriesData || []);

      // Fetch articles for each category
      if (categoriesData && categoriesData.length > 0) {
        const categoryArticlesMap = {};
        
        for (const category of categoriesData) {
          const { data: catArticles } = await supabase
            .from('articles')
            .select(`
              *,
              profiles:author_id (username, avatar_url, full_name),
              categories:category_id (name, slug, color, icon)
            `)
            .eq('status', 'published')
            .eq('category_id', category.id)
            .order('created_at', { ascending: false })
            .limit(4); // Show 4 articles per category
          
          categoryArticlesMap[category.id] = catArticles || [];
        }
        
        setCategoryArticles(categoryArticlesMap);
      }

      // Fetch regular articles with pagination
      const { data, error: fetchError } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (username, avatar_url, full_name),
          categories:category_id (name, slug, color, icon),
          article_tags (
            tags (id, name, slug)
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range((page - 1) * ARTICLES_PER_PAGE, page * ARTICLES_PER_PAGE - 1);

      if (fetchError) throw fetchError;
      
      // Check if there are more articles
      setHasMore(data?.length === ARTICLES_PER_PAGE);
      
      setArticles(prev => page === 1 ? (data || []) : [...prev, ...(data || [])]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);

      const { data } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (username, avatar_url, full_name),
          categories:category_id (name, slug, color, icon),
          article_tags (
            tags (id, name, slug)
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range((nextPage - 1) * ARTICLES_PER_PAGE, nextPage * ARTICLES_PER_PAGE - 1);

      // Check if there are more articles
      setHasMore(data?.length === ARTICLES_PER_PAGE);

      setArticles(prev => [...prev, ...(data || [])]);
    } catch (err) {
      console.error('Error loading more articles:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'YESTERDAY';
    if (diffDays <= 7) return `${diffDays} DAYS AGO`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }).toUpperCase();
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.split(/\s+/).length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes || 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <CategorySectionSkeleton />
              <CategorySectionSkeleton />
            </div>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <ArticleCardSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white py-2 shadow-lg sticky top-0 z-40 animate-pulse-slow">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="flex items-center gap-2 font-bold text-sm uppercase flex-shrink-0">
                <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Breaking
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap flex gap-8">
                  {breakingNews.map((news, index) => (
                    <Link
                      key={`${news.id}-${index}`}
                      to={`/article/${news.slug}`}
                      className="inline-flex items-center gap-2 hover:underline text-sm font-medium"
                    >
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      {news.title}
                    </Link>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {breakingNews.map((news, index) => (
                    <Link
                      key={`${news.id}-dup-${index}`}
                      to={`/article/${news.slug}`}
                      className="inline-flex items-center gap-2 hover:underline text-sm font-medium"
                    >
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      {news.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 mb-12">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              Discover Stories That Matter
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slide-up">
              Explore the latest news, insights, and perspectives from around the world
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto animate-scale-in">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/95 dark:bg-slate-800/95 text-slate-900 dark:text-white placeholder-slate-400 shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50 backdrop-blur-lg transition-all"
                />
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-12">
            {/* Featured Articles - Large Cards */}
            {featuredArticles.length > 0 && !searchQuery && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="text-4xl">⭐</span>
                    Featured Stories
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredArticles.slice(0, 1).map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      className="md:col-span-2 group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative h-96">
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                          {article.categories && (
                            <Badge 
                              variant="primary" 
                              className="mb-3"
                              style={{ backgroundColor: article.categories.color }}
                            >
                              {article.categories.icon} {getArticleCategory(article)}
                            </Badge>
                          )}
                          <h3 className="text-3xl md:text-4xl font-bold mb-3 group-hover:text-blue-300 transition-colors">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-lg text-white/90 mb-4 line-clamp-2">{article.excerpt}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-white/80">
                            <div className="flex items-center gap-2">
                              {article.profiles?.avatar_url ? (
                                <img
                                  src={article.profiles.avatar_url}
                                  alt={article.profiles.username}
                                  className="w-8 h-8 rounded-full border-2 border-white/50"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                  {article.profiles?.username?.[0]?.toUpperCase()}
                                </div>
                              )}
                              <span>{article.profiles?.full_name || article.profiles?.username}</span>
                            </div>
                            <span>•</span>
                            <span>{formatDate(article.created_at)}</span>
                            <span>•</span>
                            <span>{calculateReadTime(article.content)} min read</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {featuredArticles.slice(1, 3).map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative h-64">
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          {article.categories && (
                            <Badge 
                              variant="primary" 
                              size="sm" 
                              className="mb-2"
                              style={{ backgroundColor: article.categories.color }}
                            >
                              {article.categories.icon} {getArticleCategory(article)}
                            </Badge>
                          )}
                          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-white/80">
                            <span>{article.profiles?.username}</span>
                            <span>•</span>
                            <span>{formatDate(article.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Category Sections - Multiple Categories */}
            {categories.length > 0 && categories.map((category) => {
              const catArticles = categoryArticles[category.id] || [];
              
              if (catArticles.length === 0) return null;
              
              return (
                <section key={category.id} className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.name}
                      </h2>
                      {category.color && (
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                    </div>
                    <Link
                      to={`/category/${category.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm flex items-center gap-1 group"
                    >
                      View All
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {catArticles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/article/${article.slug}`}
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
                            className="h-48 bg-gradient-to-br"
                            style={{ 
                              backgroundImage: `linear-gradient(to bottom right, ${category.color || '#3B82F6'}, ${category.color ? category.color + '80' : '#1E40AF'})` 
                            }}
                          />
                        )}
                        
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {article.title}
                          </h3>
                          
                          {article.excerpt && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              {article.profiles?.avatar_url ? (
                                <img
                                  src={article.profiles.avatar_url}
                                  alt={article.profiles.username}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                              )}
                              <span className="font-medium">{article.profiles?.username || 'Anonymous'}</span>
                            </div>
                            <span>{formatArticleDate(article.created_at)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Latest Articles Grid - Enhanced Cards */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {searchQuery ? 'Search Results' : 'Latest Articles'}
                </h2>
                <span className="text-slate-500 dark:text-slate-400">
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                </span>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    No Articles Found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchQuery ? 'Try a different search query.' : 'Be the first to create an article!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredArticles.map((article, index) => {
                    const gradients = [
                      'from-blue-900/95 via-blue-800/60',
                      'from-purple-900/95 via-purple-800/60',
                      'from-rose-900/95 via-rose-800/60',
                      'from-emerald-900/95 via-emerald-800/60',
                      'from-orange-900/95 via-orange-800/60',
                      'from-cyan-900/95 via-cyan-800/60',
                      'from-indigo-900/95 via-indigo-800/60',
                      'from-pink-900/95 via-pink-800/60',
                      'from-teal-900/95 via-teal-800/60',
                    ];
                    const gradient = gradients[index % gradients.length];
                    
                    return (
                      <Link
                        key={article.id}
                        to={`/article/${article.slug}`}
                        className="group relative overflow-hidden rounded-lg aspect-[4/3]"
                      >
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
                        )}
                        
                        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} to-transparent group-hover:opacity-90 transition-opacity`} />
                        
                        <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                          <div className="flex items-start justify-between">
                            {article.categories && (
                              <div className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-white text-xs font-bold uppercase tracking-wide border border-white/30">
                                {getArticleCategory(article)}
                              </div>
                            )}
                            <div className="text-white/90 text-xs font-semibold uppercase tracking-wide">
                              {formatDate(article.created_at)}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-white/80 text-xs font-semibold uppercase tracking-wide">
                              {article.views_count || 0} VIEWS
                            </div>
                            <h3 className="text-white font-bold text-lg leading-tight line-clamp-3 group-hover:text-orange-300 transition-colors">
                              {article.title}
                            </h3>
                            {article.excerpt && (
                              <p className="text-white/80 text-sm line-clamp-2">
                                {article.excerpt}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-lg transition-colors pointer-events-none" />
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Load More Button */}
              {!searchQuery && filteredArticles.length > 0 && hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Load More Articles
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    )}
                  </button>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                    Showing {filteredArticles.length} articles
                  </p>
                </div>
              )}
            </section>
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

export default Home;
