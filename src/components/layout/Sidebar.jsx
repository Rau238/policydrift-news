import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../../lib/api';
import Loading from '../ui/Loading';
import TrendingArticles from '../TrendingArticles';
import PopularTags from '../PopularTags';
import Newsletter from '../Newsletter';

const Sidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await categoriesAPI.getAll({ limit: 8 });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="space-y-6">
      {/* Trending Articles */}
      <TrendingArticles limit={5} />

      {/* Newsletter Signup */}
      <Newsletter />

      {/* Popular Tags */}
      <PopularTags limit={12} />

      {/* Categories - Quick Links */}
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
                  key={category._id}
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
    </aside>
  );
};

export default Sidebar;
