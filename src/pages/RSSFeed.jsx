import { useSEO } from '../hooks/useSEO';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { Navigate } from 'react-router-dom';
import Loading from '../components/ui/Loading';

const RSSFeed = () => {
  const { settings, loading } = useSiteSettings();

  useSEO({
    title: `RSS Feed - ${settings.site_name || 'Policy Drift News'}`,
    description: `Subscribe to our RSS feed to stay updated with the latest news and articles from ${settings.site_name || 'Policy Drift News'}.`,
    keywords: 'rss feed, subscribe, news feed, syndication, atom feed',
    url: `${window.location.origin}/rss`,
    type: 'website'
  });

  if (loading) return <Loading />;

  // If RSS is disabled, redirect to home
  if (settings.rss_enabled === false) {
    return <Navigate to="/" replace />;
  }

  const rssUrl = `${window.location.origin}/feed.xml`;
  const atomUrl = `${window.location.origin}/atom.xml`;

  const handleCopyUrl = (url, type) => {
    navigator.clipboard.writeText(url);
    alert(`${type} feed URL copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">RSS Feed</h1>
            <p className="text-lg text-white/90">
              Stay Updated with {settings.site_name || 'Policy Drift News'}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* What is RSS */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">What is RSS?</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                RSS (Really Simple Syndication) is a web feed format that allows you to access updates from 
                your favorite websites in a standardized, computer-readable format. Instead of visiting 
                multiple websites to check for new content, you can use an RSS reader to get all updates 
                in one place.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Subscribe to our RSS feed to get instant notifications whenever we publish new articles, 
                ensuring you never miss important policy news and analysis.
              </p>
            </div>

            {/* RSS Feed URLs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Subscribe to Our Feed</h2>
              
              {/* RSS 2.0 */}
              <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
                      </svg>
                      RSS 2.0 Feed
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Most widely supported RSS format</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={rssUrl} 
                    readOnly 
                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-sm"
                  />
                  <button
                    onClick={() => handleCopyUrl(rssUrl, 'RSS')}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy URL
                  </button>
                  <a
                    href={rssUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Feed
                  </a>
                </div>
              </div>

              {/* Atom Feed */}
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      Atom Feed
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Modern alternative to RSS with enhanced features</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={atomUrl} 
                    readOnly 
                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-sm"
                  />
                  <button
                    onClick={() => handleCopyUrl(atomUrl, 'Atom')}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy URL
                  </button>
                  <a
                    href={atomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Feed
                  </a>
                </div>
              </div>
            </div>

            {/* How to Use RSS */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">How to Subscribe</h2>
              
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Choose an RSS Reader</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-3">
                      Select an RSS reader application or service. Here are some popular options:
                    </p>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                      <li><strong>Feedly</strong> - Web-based, mobile apps available</li>
                      <li><strong>Inoreader</strong> - Advanced features, cross-platform</li>
                      <li><strong>NewsBlur</strong> - Social features, training filters</li>
                      <li><strong>The Old Reader</strong> - Simple, classic interface</li>
                      <li><strong>NetNewsWire</strong> - Free, native Mac/iOS app</li>
                      <li><strong>Thunderbird</strong> - Email client with RSS support</li>
                    </ul>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Add Our Feed</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Copy one of our feed URLs above and paste it into your RSS reader. Most readers have an 
                      "Add Feed" or "Subscribe" button where you can enter the URL.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Start Reading</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      That's it! You'll now receive updates whenever we publish new articles. Your RSS reader 
                      will automatically check for new content and display it in your feed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Why Use RSS?</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Email Clutter</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Stay updated without filling your inbox. Read content on your own schedule.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Privacy Focused</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      No tracking, no ads, no algorithms. Just the content you want.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Centralized Reading</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Follow multiple websites in one place. Perfect for news aggregation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Updates</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Get notified as soon as we publish new content. Never miss a story.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative Methods */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Other Ways to Stay Updated</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Not ready for RSS? We offer other ways to stay connected:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <a href="/newsletter" className="p-4 bg-white dark:bg-slate-700 rounded-lg hover:shadow-lg transition-shadow">
                  <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Newsletter</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Weekly digest in your inbox</p>
                </a>

                <a href="https://twitter.com/policydriftnews" target="_blank" rel="noopener noreferrer" className="p-4 bg-white dark:bg-slate-700 rounded-lg hover:shadow-lg transition-shadow">
                  <svg className="w-8 h-8 text-blue-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Twitter</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Follow us for updates</p>
                </a>

                <a href="/bookmarks" className="p-4 bg-white dark:bg-slate-700 rounded-lg hover:shadow-lg transition-shadow">
                  <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Bookmarks</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Save articles for later</p>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default RSSFeed;
