import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Loading from '../ui/Loading';

const Sidebar = () => {
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        supabase
          .from('articles')
          .select('id, title, slug, view_count, created_at')
          .eq('status', 'published')
          .order('view_count', { ascending: false })
          .limit(5),
        supabase
          .from('categories')
          .select('id, name, slug, icon, color')
          .order('name', { ascending: true })
          .limit(8)
      ]);

      if (articlesRes.data) setTrending(articlesRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribing(true);
    setSubscribeMessage('');

    try {
      const { error } = await supabase
        .from('newsletters')
        .insert([{ email, subscribed_at: new Date().toISOString() }]);

      if (error) {
        if (error.code === '23505') {
          setSubscribeMessage('Already subscribed!');
        } else {
          throw error;
        }
      } else {
        setSubscribeMessage('✅ Subscribed successfully!');
        setEmail('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubscribeMessage('❌ Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <aside className="space-y-6">
      {/* Trending Articles */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span>Trending Now</span>
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loading variant="spinner" size="sm" />
          </div>
        ) : trending.length > 0 ? (
          <ul className="space-y-3">
            {trending.map((article, index) => (
              <li key={article.id}>
                <Link 
                  to={`/article/${article.slug}`} 
                  className="flex gap-3 group"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 transition-colors">
                    {article.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            No trending articles yet.
          </p>
        )}
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-800 dark:to-slate-800 rounded-lg shadow-md p-6 border border-primary-200 dark:border-slate-700">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <span className="text-2xl">📧</span>
          <span>Newsletter</span>
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Get the latest news delivered straight to your inbox.
        </p>
        <form onSubmit={handleSubscribe} className="space-y-2">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
            required
            disabled={subscribing}
          />
          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white rounded-lg font-medium text-sm transition-colors"
            disabled={subscribing}
          >
            {subscribing ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {subscribeMessage && (
          <p className="mt-2 text-sm text-center font-medium">
            {subscribeMessage}
          </p>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">📁</span>
          <span>Categories</span>
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loading variant="spinner" size="sm" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full text-sm font-medium transition-colors"
                >
                  {category.icon && <span className="mr-1">{category.icon}</span>}
                  {category.name}
                </Link>
              ))
            ) : (
              <>
                <Link to="/category/technology" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full text-sm font-medium transition-colors">
                  💻 Technology
                </Link>
                <Link to="/category/business" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full text-sm font-medium transition-colors">
                  💼 Business
                </Link>
                <Link to="/category/sports" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full text-sm font-medium transition-colors">
                  ⚽ Sports
                </Link>
                <Link to="/category/entertainment" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full text-sm font-medium transition-colors">
                  🎬 Entertainment
                </Link>
                <Link to="/category/health" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full text-sm font-medium transition-colors">
                  🏥 Health
                </Link>
                <Link to="/category/science" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full text-sm font-medium transition-colors">
                  🔬 Science
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Popular Tags */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">🏷️</span>
          <span>Popular Tags</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/tag/ai" className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-primary-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium transition-colors">
            AI
          </Link>
          <Link to="/tag/startup" className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-primary-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium transition-colors">
            Startup
          </Link>
          <Link to="/tag/crypto" className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-primary-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium transition-colors">
            Crypto
          </Link>
          <Link to="/tag/design" className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-primary-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium transition-colors">
            Design
          </Link>
          <Link to="/tag/programming" className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-primary-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium transition-colors">
            Programming
          </Link>
          <Link to="/tag/marketing" className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-primary-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium transition-colors">
            Marketing
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
