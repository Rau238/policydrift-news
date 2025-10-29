import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI, usersAPI, commentsAPI } from '../../lib/api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [articlesRes, usersRes, commentsRes] = await Promise.all([
        articlesAPI.getAll({ limit: 5, sort: '-created_at' }),
        usersAPI.getAll({ limit: 5, sort: '-created_at' }),
        commentsAPI.getAll({ limit: 1 }), // Just for count
      ]);

      setStats({
        totalArticles: articlesRes.pagination?.total || 0,
        totalUsers: usersRes.pagination?.total || 0,
        totalComments: commentsRes.pagination?.total || 0,
      });

      setRecentArticles(articlesRes.data || []);
      setRecentUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome back! Here's what's happening with your site.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Articles</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalArticles}</p>
            </div>
          </div>
          <Link 
            to="/admin/articles" 
            className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
          >
            Manage articles →
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
            </div>
          </div>
          <Link 
            to="/admin/users" 
            className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
          >
            Manage users →
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Comments</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalComments}</p>
            </div>
          </div>
          <Link 
            to="/admin/comments" 
            className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
          >
            Moderate comments →
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Articles</h2>
          {recentArticles.length > 0 ? (
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <div 
                  key={article._id} 
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/article/${article.slug}`}
                      className="font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 truncate block"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      By {article.author?.username || 'Unknown'} • {new Date(article.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    article.status === 'published' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {article.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
              No articles yet.
            </p>
          )}
          <Link 
            to="/admin/articles"
            className="mt-4 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            View all articles →
          </Link>
        </Card>

        {/* Recent Users */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Users</h2>
          {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div 
                  key={user._id} 
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                    user.role === 'admin'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
              No users yet.
            </p>
          )}
          <Link 
            to="/admin/users"
            className="mt-4 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            View all users →
          </Link>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/create-article"
            className="p-4 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg text-center transition-colors group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">✍️</div>
            <div className="font-medium text-slate-900 dark:text-white">New Article</div>
          </Link>
          <Link
            to="/admin/categories"
            className="p-4 bg-secondary-50 dark:bg-secondary-900/20 hover:bg-secondary-100 dark:hover:bg-secondary-900/30 rounded-lg text-center transition-colors group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏷️</div>
            <div className="font-medium text-slate-900 dark:text-white">Categories</div>
          </Link>
          <Link
            to="/admin/comments"
            className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-center transition-colors group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💬</div>
            <div className="font-medium text-slate-900 dark:text-white">Comments</div>
          </Link>
          <Link
            to="/admin/settings"
            className="p-4 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-center transition-colors group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
            <div className="font-medium text-slate-900 dark:text-white">Settings</div>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
