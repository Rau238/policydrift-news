import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { generateSitemap, downloadSitemap } from '../lib/sitemap';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Loading from '../components/ui/Loading';

const Sitemap = () => {
  const [categories, setCategories] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useSEO({
    title: 'Sitemap - Policy Drift News',
    description: 'Complete sitemap of Policy Drift News. Browse all pages, categories, and recent articles.',
    keywords: 'sitemap, navigation, site structure, pages',
    url: `${window.location.origin}/sitemap`,
    type: 'website'
  });

  useEffect(() => {
    fetchSitemapData();
  }, []);

  const fetchSitemapData = async () => {
    try {
      const [categoriesRes, articlesRes] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name, slug')
          .order('name', { ascending: true }),
        supabase
          .from('articles')
          .select('id, title, slug, created_at')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (articlesRes.data) setRecentArticles(articlesRes.data);
    } catch (error) {
      console.error('Error fetching sitemap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSitemap = async () => {
    setGenerating(true);
    try {
      await downloadSitemap();
    } catch (error) {
      console.error('Error generating sitemap:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading sitemap..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sitemap</h1>
            <p className="text-lg text-white/90 mb-6">
              Navigate through all pages and content on our website
            </p>
            <button
              onClick={handleDownloadSitemap}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {generating ? 'Generating...' : 'Download XML Sitemap'}
            </button>
          </div>
        </div>
      </section>

      {/* Sitemap Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Main Pages */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Main Pages
              </h2>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/bookmarks" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Bookmarks
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Pages */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Legal
              </h2>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/accessibility" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resources
              </h2>
              <ul className="space-y-3">
                <li>
                  <Link to="/sitemap" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Sitemap
                  </Link>
                </li>
                <li>
                  <a href="/rss.xml" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    RSS Feed
                  </a>
                </li>
              </ul>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg md:col-span-2 lg:col-span-3">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Categories
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map(category => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Articles */}
            {recentArticles.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg md:col-span-2 lg:col-span-3">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Recent Articles ({recentArticles.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {recentArticles.map(article => (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-start gap-2 text-sm"
                    >
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="line-clamp-2">{article.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* XML Sitemap Notice */}
          <div className="mt-12 max-w-4xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 text-center border border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
              Looking for XML Sitemap?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              For search engines, use our XML sitemap at:
            </p>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View XML Sitemap
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sitemap;
