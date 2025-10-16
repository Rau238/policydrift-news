import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatArticleDate } from '../lib/utils';

const TrendingArticles = ({ limit = 5 }) => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      
      // Fetch articles ordered by views_count (most viewed first)
      // In the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          created_at,
          views_count,
          featured_image,
          categories:category_id (name, slug, color, icon)
        `)
        .eq('status', 'published')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('views_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTrending(data || []);
    } catch (error) {
      console.error('Error fetching trending articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Trending Now
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trending.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
          Trending Now
        </span>
      </h3>
      
      <div className="space-y-4">
        {trending.map((article, index) => (
          <Link
            key={article.id}
            to={`/article/${article.slug}`}
            className="group flex gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
          >
            {/* Rank Number */}
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700' :
                index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
              }`}>
                {index + 1}
              </div>
            </div>

            {/* Article Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                {article.categories && (
                  <>
                    <span 
                      className="px-2 py-0.5 rounded-full text-white font-medium"
                      style={{ backgroundColor: article.categories.color || '#3B82F6' }}
                    >
                      {article.categories.name}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  {article.views_count || 0}
                </span>
              </div>
            </div>

            {/* Small Image (if available) */}
            {article.featured_image && (
              <div className="flex-shrink-0">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Updated {formatArticleDate(new Date().toISOString())}
        </div>
      </div>
    </div>
  );
};

export default TrendingArticles;
