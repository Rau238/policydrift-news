import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
              NewsHub
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Your source for the latest news and stories from around the world. Stay informed, stay connected.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                𝕏
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                📘
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                📸
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="LinkedIn"
              >
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Links</h4>
            <nav className="space-y-2">
              <Link to="/" className="block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                Home
              </Link>
              <Link to="/about" className="block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                About Us
              </Link>
              <Link to="/contact" className="block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                Contact
              </Link>
              <Link to="/privacy" className="block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Categories</h4>
            <nav className="space-y-2">
              <Link to="/category/technology" className="block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                Technology
              </Link>
              <Link to="/category/business" className="block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                Business
              </Link>
              <Link to="/category/sports" className="block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                Sports
              </Link>
              <Link to="/category/entertainment" className="block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                Entertainment
              </Link>
              <Link to="/category/health" className="block text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                Health
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Newsletter</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Subscribe to get the latest news delivered to your inbox.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <p>
              © {currentYear} NewsHub. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/sitemap" className="hover:text-primary-600 transition-colors">
                Sitemap
              </Link>
              <Link to="/rss" className="hover:text-primary-600 transition-colors">
                RSS Feed
              </Link>
              <Link to="/accessibility" className="hover:text-primary-600 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
