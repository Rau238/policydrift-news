import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminRoute from './components/AdminRoute';
import AdBlockerDetector from './components/AdBlockerDetector';

// Client Pages
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import CreateArticle from './pages/CreateArticle';
import Bookmarks from './pages/Bookmarks';
import Auth from './pages/auth/Auth';
import ForgotPassword from './pages/auth/ForgotPassword';
import Profile from './pages/auth/Profile';
import CategoryArticles from './pages/CategoryArticles';
import TagArticles from './pages/TagArticles';
import NotFound from './pages/NotFound';

// Info & Legal Pages
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Accessibility from './pages/Accessibility';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminArticles from './pages/admin/AdminArticles';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminTags from './pages/admin/AdminTags';
import AdminComments from './pages/admin/AdminComments';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <Router>
          <AdBlockerDetector />
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="tags" element={<AdminTags />} />
              <Route path="comments" element={<AdminComments />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Client Routes with Header/Footer - Last because of wildcard */}
            <Route path="/" element={
              <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
                {/* Skip to main content link for accessibility */}
                <a 
                  href="#main-content" 
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Skip to main content"
                >
                  Skip to main content
                </a>
                <Header />
                <main id="main-content" className="flex-1 py-8" role="main" aria-label="Main content">
                  <Routes>
                    <Route index element={<Home />} />
                    <Route path="article/:slug" element={<ArticleDetail />} />
                    <Route path="article/:slug/edit" element={<CreateArticle />} />
                    <Route path="create-article" element={<CreateArticle />} />
                    <Route path="bookmarks" element={<Bookmarks />} />
                    <Route path="category/:slug" element={<CategoryArticles />} />
                    <Route path="tag/:slug" element={<TagArticles />} />
                    <Route path="login" element={<Auth />} />
                    <Route path="signup" element={<Auth />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="profile" element={<Profile />} />
                    
                    {/* Info & Legal Pages */}
                    <Route path="about" element={<AboutUs />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="terms-of-service" element={<TermsOfService />} />
                    <Route path="accessibility" element={<Accessibility />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </Router>
      </SiteSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
