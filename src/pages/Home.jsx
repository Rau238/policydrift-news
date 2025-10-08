import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/ui/Badge';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      setCategories(categoriesData || []);

      // Fetch featured articles (top 3)
      const { data: featuredData } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (username, avatar_url, full_name),
          categories:category_id (name, slug, color, icon)
        `)
        .eq('published', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

      setFeaturedArticles(featuredData || []);

      // Fetch regular articles
      let query = supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (username, avatar_url, full_name),
          categories:category_id (name, slug, color, icon)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.split(/\s+/).length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes || 1;
  };

  if (loading) {
    return <Loading fullScreen text="Loading articles..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
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
            {/* Categories Filter - Horizontal Scroll */}
            {categories.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Browse by Category</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    All Articles
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? 'text-white shadow-lg scale-105'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                      style={selectedCategory === category.id ? {
                        backgroundColor: category.color
                      } : {}}
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Articles - Large Cards */}
            {featuredArticles.length > 0 && !searchQuery && selectedCategory === 'all' && (
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
                              {article.categories.icon} {article.categories.name}
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
                              {article.categories.icon} {article.categories.name}
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

            {/* Latest Articles Grid - Enhanced Cards */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {searchQuery ? 'Search Results' : selectedCategory === 'all' ? 'Latest Articles' : 'Filtered Articles'}
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      className="group bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                    >
                      {/* Article Image */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-5xl">
                            📰
                          </div>
                        )}
                        {article.categories && (
                          <div className="absolute top-3 left-3">
                            <Badge
                              variant="primary"
                              size="sm"
                              className="backdrop-blur-md shadow-lg"
                              style={{ backgroundColor: article.categories.color }}
                            >
                              {article.categories.icon} {article.categories.name}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Article Content */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        {article.excerpt && (
                          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}

                        {/* Article Meta */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            {article.profiles?.avatar_url ? (
                              <img
                                src={article.profiles.avatar_url}
                                alt={article.profiles.username}
                                className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {article.profiles?.username?.[0]?.toUpperCase() || 'A'}
                              </div>
                            )}
                            <div className="text-xs">
                              <p className="font-medium text-slate-900 dark:text-white">
                                {article.profiles?.full_name || article.profiles?.username || 'Anonymous'}
                              </p>
                              <p className="text-slate-500 dark:text-slate-400">
                                {formatDate(article.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
                            <div className="flex items-center gap-1" title="Views">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>{article.views_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Read time">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{calculateReadTime(article.content)}m</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
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
