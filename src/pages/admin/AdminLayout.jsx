import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const sidebarRef = useRef(null);
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/admin/articles', label: 'Articles', icon: '📝' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { path: '/admin/tags', label: 'Tags', icon: '🔖' },
    { path: '/admin/comments', label: 'Comments', icon: '💬' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (!isDesktop && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, isDesktop]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isDesktop && sidebarOpen && sidebarRef.current) {
        // Check if click is outside sidebar and not on the hamburger button
        if (!sidebarRef.current.contains(event.target)) {
          const hamburgerButton = event.target.closest('button[aria-label="Toggle menu"]');
          if (!hamburgerButton) {
            setSidebarOpen(false);
          }
        }
      }
    };
    
    if (!isDesktop && sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [sidebarOpen, isDesktop]);

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Admin Panel
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Overlay for mobile */}
      {!isDesktop && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 
          border-r border-slate-200 dark:border-slate-700 transition-transform duration-300
          lg:translate-x-0 lg:mt-0 mt-[57px]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Desktop Sidebar Header */}
          <div className="hidden lg:flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Admin Panel
            </h2>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {profile?.username || 'Admin'}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Back to Site */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <Link
              to="/"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span className="text-xl">🏠</span>
              <span className="font-medium">Back to Site</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 mt-[57px] lg:mt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
