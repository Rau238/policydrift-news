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

  // SEO for article page - updates when article loads
  useSEO({
    title: article?.title || 'Article',
    description: article?.excerpt || article?.content?.substring(0, 160),
    keywords: article?.tags?.join(', '),
    image: article?.image_url,
    url: window.location.href,
    type: 'article'
  });

  useEffect(() => {
    fetchArticle();
    if (user) {
      checkUserInteractions();
    }
  }, [slug, user]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (username, avatar_url, full_name),
          categories:category_id (name, slug)
        `)
        .eq('slug', slug)
        .single();

      if (fetchError) throw fetchError;
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

      // Fetch related articles (same category, excluding current article)
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
        .limit(3);

      setRelatedArticles(relatedData || []);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkUserInteractions = async () => {
    if (!article) return;

    try {
      // Check if liked
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('article_id', article.id)
        .eq('user_id', user.id)
        .single();
      
      setIsLiked(!!likeData);

      // Check if bookmarked
      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('article_id', article.id)
        .eq('user_id', user.id)
        .single();
      
      setIsBookmarked(!!bookmarkData);
    } catch (err) {
      // Errors here are expected when no like/bookmark exists
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);
        
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
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
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);
        
        setIsBookmarked(false);
      } else {
        // Add bookmark
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
    return <Loading fullScreen text="Loading article..." />;
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

  // Generate structured data for article
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
      "name": article.profiles?.full_name || article.profiles?.username || "Unknown Author",
      "url": `${window.location.origin}/author/${article.profiles?.username}`
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
    "keywords": article.tags?.join(', '),
    "wordCount": article.content?.split(/\s+/).length || 0
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Structured Data for SEO */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Premium Hero Section with Featured Image */}
      {article.featured_image && (
        <div className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
          {/* Parallax Background Image */}
          <div className="absolute inset-0">
            <img 
              src={article.featured_image} 
              alt={article.title}
              className="w-full h-full object-cover scale-105"
              loading="eager"
            />
            {/* Gradient Overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-slate-900/40"></div>
          </div>
          
          {/* Hero Content with Animation */}
          <div className="relative h-full flex items-end">
            <div className="container mx-auto px-4 max-w-5xl pb-12 md:pb-16">
              <div className="max-w-4xl space-y-6 animate-fadeInUp">
                {/* Category Badge with Glow Effect */}
                {article.categories && (
                  <div className="inline-flex">
                    <span className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/50 backdrop-blur-sm">
                      {article.categories.name}
                    </span>
                  </div>
                )}
                
                {/* Title with Dramatic Typography */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                  {article.title}
                </h1>
                
                {/* Excerpt in Hero */}
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
        <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl -mt-20 relative z-10 overflow-hidden">
          {/* Article Header (if no featured image) */}
          {!article.featured_image && (
            <header className="p-8 border-b border-slate-200 dark:border-slate-700">
              {article.categories && (
                <Badge variant="primary" className="mb-4">
                  {article.categories.name}
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                  {article.excerpt}
                </p>
              )}
            </header>
          )}

          {/* Author Info & Actions Bar */}
          <div className="p-8 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Author Info */}
              <div className="flex items-center gap-4">
                {article.profiles?.avatar_url ? (
                  <img
                    src={article.profiles.avatar_url}
                    alt={article.profiles.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {article.profiles?.username?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-lg">
                    {article.profiles?.full_name || article.profiles?.username || 'Anonymous'}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span>{formatDate(article.published_at || article.created_at)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {article.views_count || 0} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isLiked 
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  title={user ? (isLiked ? 'Unlike' : 'Like') : 'Sign in to like this article'}
                >
                  <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{likesCount}</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isBookmarked 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  title={user ? (isBookmarked ? 'Remove bookmark' : 'Bookmark') : 'Sign in to bookmark this article'}
                >
                  <svg className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Social Share Section */}
            <div className="px-8 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
              <SocialShare 
                url={window.location.href}
                title={article.title}
                description={article.excerpt || article.title}
              />
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8 md:p-12">
            {/* Excerpt */}
            {article.excerpt && article.featured_image && (
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                {article.excerpt}
              </p>
            )}

            {/* Main Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {article.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                    {paragraph}
                  </p>
                )
              ))}
            </div>

            {/* Video */}
            {article.video_url && (
              <div className="my-12 rounded-xl overflow-hidden shadow-xl">
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
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Author Actions (Edit/Delete) */}
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
                  Delete Article
                </Button>
              </div>
            </div>
          )}

          {/* Comments Section */}
          {settings?.enable_comments && (
            <div className="border-t border-slate-200 dark:border-slate-700">
              <CommentSection articleId={article.id} />
            </div>
          )}
        </article>

        {/* Related Articles Section */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            You May Also Like
          </h2>

          {relatedArticles.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  to={`/article/${relatedArticle.slug}`}
                  className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Image */}
                  {relatedArticle.featured_image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={relatedArticle.featured_image}
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    {relatedArticle.categories && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {relatedArticle.categories.name}
                      </Badge>
                    )}
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {relatedArticle.title}
                    </h3>
                    {relatedArticle.excerpt && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {relatedArticle.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{new Date(relatedArticle.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {relatedArticle.views_count || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-600 dark:text-slate-400 p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-lg font-medium mb-2">No Related Articles Found</p>
              <p className="text-sm">Check out more articles on the <Link to="/" className="text-blue-500 hover:underline">home page</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
