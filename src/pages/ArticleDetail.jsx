import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CommentSection from '../components/CommentSection';
import SocialShare from '../components/SocialShare';
import { useSEO } from '../hooks/useSEO';
import AdSense from '../components/AdSense';
import { ArticleDetailSkeleton } from '../components/ui/Skeleton';
import { getArticleCategory } from '../lib/utils';

const ArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { settings } = useSiteSettings();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [readingProgress, setReadingProgress] = useState(0);

  // SEO for article page
  useSEO({
    title: article?.title || 'Article',
    description: article?.excerpt || article?.content?.substring(0, 160),
    keywords: article?.tags?.join(', '),
    image: article?.featured_image,
    url: window.location.href,
    type: 'article'
  });

  // Reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  useEffect(() => {
    if (user && article) {
      checkUserInteractions();
    }
  }, [user, article]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching article with slug:', slug);

      // Add a minimum loading time to ensure skeleton is visible
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 500));

      const { data, error: fetchError } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (username, avatar_url, full_name),
          categories:category_id (name, slug)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      // Wait for minimum load time
      await minLoadTime;

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.log('No article found with slug:', slug);
        setError('Article not found');
        setLoading(false);
        return;
      }

      console.log('Article loaded:', data.title);
      setArticle(data);

      // Increment view count
      await supabase
        .from('articles')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);

      // Get likes count
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', data.id);
      
      setLikesCount(count || 0);

      // Fetch related articles
      const { data: relatedData } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image,
          created_at,
          views_count,
          categories:category_id (name, slug)
        `)
        .eq('status', 'published')
        .eq('category_id', data.category_id)
        .neq('id', data.id)
        .order('created_at', { ascending: false })
        .limit(4);

      setRelatedArticles(relatedData || []);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const checkUserInteractions = async () => {
    if (!article) return;

    try {
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('article_id', article.id)
        .eq('user_id', user.id)
        .single();
      
      setIsLiked(!!likeData);

      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('article_id', article.id)
        .eq('user_id', user.id)
        .single();
      
      setIsBookmarked(!!bookmarkData);
    } catch (err) {
      // Expected when no interaction exists
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);
        
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('likes')
          .insert({ article_id: article.id, user_id: user.id });
        
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);
        
        setIsBookmarked(false);
      } else {
        await supabase
          .from('bookmarks')
          .insert({ article_id: article.id, user_id: user.id });
        
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', article.id);

      if (deleteError) throw deleteError;
      navigate('/');
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article');
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
    return <ArticleDetailSkeleton />;
  }

  if (error || !article) {
    return (
      <ErrorMessage
        message={error || 'Article not found'}
        onRetry={fetchArticle}
        fullScreen
      />
    );
  }

  const isAuthor = user && article.author_id === user.id;

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt || article.content?.substring(0, 160),
    "image": article.featured_image,
    "datePublished": article.created_at,
    "dateModified": article.updated_at || article.created_at,
    "author": {
      "@type": "Person",
      "name": article.profiles?.full_name || article.profiles?.username || "Unknown Author"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PolicyDrift News",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "articleSection": article.categories?.name,
    "keywords": article.tags?.join(', ')
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Structured Data */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Hero Section */}
        {article.featured_image && (
          <div className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={article.featured_image} 
                alt={article.title}
                className="w-full h-full object-cover scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-slate-900/40"></div>
            </div>
            
            <div className="relative h-full flex items-end">
              <div className="container mx-auto px-4 max-w-6xl pb-12 md:pb-16">
                <div className="max-w-4xl space-y-6">
                  {article.categories && (
                    <div className="inline-flex">
                      <span className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/50">
                        {getArticleCategory(article)}
                      </span>
                    </div>
                  )}
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                    {article.title}
                  </h1>
                  
                  {article.excerpt && (
                    <p className="text-lg md:text-xl text-slate-200 leading-relaxed max-w-3xl font-light">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2">
                <div className="w-1 h-3 bg-white/70 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative">
            
            {/* Main Article */}
            <article className="lg:col-span-8 -mt-16 lg:-mt-24 relative z-10">
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                
                {/* Article Header (if no featured image) */}
                {!article.featured_image && (
                  <header className="p-8 md:p-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
                    {article.categories && (
                      <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full mb-6">
                        {getArticleCategory(article)}
                      </span>
                    )}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                      {article.title}
                    </h1>
                    {article.excerpt && (
                      <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                        {article.excerpt}
                      </p>
                    )}
                  </header>
                )}

                {/* Author & Metadata */}
                <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {article.profiles?.avatar_url ? (
                          <img
                            src={article.profiles.avatar_url}
                            alt={article.profiles.username}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-4 border-white dark:border-slate-700 shadow-xl ring-2 ring-blue-500/20"
                          />
                        ) : (
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-2 ring-blue-500/20">
                            {article.profiles?.username?.[0]?.toUpperCase() || 'A'}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white dark:border-slate-800 rounded-full"></div>
                      </div>
                      
                      <div>
                        <div className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1">
                          {article.profiles?.full_name || article.profiles?.username || 'Anonymous'}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(article.published_at || article.created_at)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {Math.ceil((article.content?.split(/\s+/).length || 0) / 200)} min read
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {article.views_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleLike}
                        className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                          isLiked 
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50' 
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 border-2 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <svg className={`w-6 h-6 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current' : ''}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-bold">{likesCount}</span>
                      </button>

                      <button
                        onClick={handleBookmark}
                        className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                          isBookmarked 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50' 
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 border-2 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <svg className={`w-6 h-6 transition-transform group-hover:scale-110 ${isBookmarked ? 'fill-current' : ''}`} fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Share Bar */}
                <div className="px-6 md:px-8 py-5 bg-gradient-to-r from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </span>
                    <SocialShare 
                      url={window.location.href}
                      title={article.title}
                      description={article.excerpt || article.title}
                    />
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-8 md:p-12 lg:p-16">
                  <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-xl">
                    {/* First Letter Drop Cap */}
                    <p className="first-letter:text-7xl first-letter:font-bold first-letter:text-blue-600 dark:first-letter:text-blue-400 first-letter:mr-3 first-letter:float-left first-letter:leading-none first-letter:mt-1">
                      {article.content.split('\n')[0]}
                    </p>
                    
                    {article.content.split('\n').slice(1).map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="my-6">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>

                  {/* Video */}
                  {article.video_url && (
                    <div className="my-12 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="relative pt-[56.25%]">
                        <iframe
                          src={article.video_url}
                          title="Article video"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                      {article.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 transition-all cursor-pointer border border-blue-200 dark:border-blue-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Author Actions */}
                {isAuthor && (
                  <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/article/${article.slug}/edit`)}
                        className="flex-1 sm:flex-none"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Article
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleDelete}
                        className="flex-1 sm:flex-none text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Comments */}
                {settings?.enable_comments && (
                  <div className="border-t border-slate-200 dark:border-slate-700">
                    <CommentSection articleId={article.id} />
                  </div>
                )}
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start space-y-8">
              {/* AdSense */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                <AdSense slot="auto" format="rectangle" />
              </div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Related
                  </h3>

                  <div className="space-y-4">
                    {relatedArticles.slice(0, 3).map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        to={`/article/${relatedArticle.slug}`}
                        className="group block"
                      >
                        <div className="flex gap-4">
                          {relatedArticle.featured_image && (
                            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl">
                              <img
                                src={relatedArticle.featured_image}
                                alt={relatedArticle.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                              {relatedArticle.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span>{new Date(relatedArticle.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {relatedArticle.views_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {relatedArticles.length > 3 && (
                    <Link
                      to={`/category/${article.categories?.slug}`}
                      className="mt-6 block text-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 font-semibold rounded-xl hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 transition-all"
                    >
                      View All in {article.categories?.name}
                    </Link>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleDetail;
