import { useState } from 'react';
import { newsletterAPI } from '../lib/api';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const Newsletter = () => {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Don't render if newsletter is disabled in admin settings
  if (settings?.features?.newsletter === false) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await newsletterAPI.subscribe(email);
      setMessage({ type: 'success', text: response.message || 'Successfully subscribed to newsletter!' });
      setEmail('');
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to subscribe. Please try again.' 
      });
    } finally {
      setLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Subscribe to Our Newsletter</h3>
        <p className="text-blue-100">Get the latest news and updates delivered to your inbox</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg bg-white/90 dark:bg-white/10 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 border-2 border-transparent focus:border-white focus:outline-none transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-green-500/20 text-green-100 border border-green-400/30' :
            message.type === 'error' ? 'bg-red-500/20 text-red-100 border border-red-400/30' :
            'bg-blue-500/20 text-blue-100 border border-blue-400/30'
          }`}>
            {message.text}
          </div>
        )}
      </form>

      <p className="text-xs text-blue-100 text-center mt-4">
        By subscribing, you agree to receive our newsletter and promotional emails. You can unsubscribe at any time.
      </p>
    </div>
  );
};

export default Newsletter;
