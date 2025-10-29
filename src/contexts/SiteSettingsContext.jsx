import { createContext, useContext, useState, useEffect } from 'react';
import { siteSettingsAPI } from '../lib/api';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    // Default values
    site_name: 'NewsHub',
    site_description: 'Your source for the latest news',
    site_logo: '',
    site_favicon: '',
    contact_email: '',
    social_links: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    seo: {
      meta_title: 'NewsHub - Latest News & Stories',
      meta_description: 'Get the latest breaking news, analysis, and stories from around the world',
      meta_keywords: ['news', 'breaking news', 'latest news', 'world news'],
      google_analytics_id: '',
      google_site_verification: ''
    },
    features: {
      enable_comments: true,
      enable_newsletter: true,
      enable_bookmarks: true,
      require_comment_approval: false
    },
    appearance: {
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF',
      accent_color: '#F59E0B'
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await siteSettingsAPI.get();

      if (response.success && response.data.settings) {
        const data = response.data.settings;
        setSettings({
          site_name: data.site_name || 'NewsHub',
          site_description: data.site_description || 'Your source for the latest news',
          site_logo: data.site_logo || '',
          site_favicon: data.site_favicon || '',
          contact_email: data.contact_email || '',
          social_links: data.social_links || {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: ''
          },
          seo: data.seo || {
            meta_title: 'NewsHub - Latest News & Stories',
            meta_description: 'Get the latest breaking news, analysis, and stories from around the world',
            meta_keywords: ['news', 'breaking news', 'latest news', 'world news'],
            google_analytics_id: '',
            google_site_verification: ''
          },
          features: data.features || {
            enable_comments: true,
            enable_newsletter: true,
            enable_bookmarks: true,
            require_comment_approval: false
          },
          appearance: data.appearance || {
            primary_color: '#3B82F6',
            secondary_color: '#1E40AF',
            accent_color: '#F59E0B'
          }
        });
      }
    } catch (err) {
      console.error('Error in fetchSettings:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    return fetchSettings();
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await siteSettingsAPI.update(newSettings);
      if (response.success) {
        await fetchSettings();
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export default SiteSettingsContext;
