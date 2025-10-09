import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    site_logo: '',
    tagline: 'Your source for the latest news',
    description: 'Stay informed with the latest news and stories from around the world',
    seo_title: 'NewsHub - Latest News & Stories',
    seo_description: 'Get the latest breaking news, analysis, and stories from around the world',
    seo_keywords: ['news', 'breaking news', 'latest news', 'world news'],
    og_image: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    github_url: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    google_analytics_id: '',
    newsletter_enabled: true,
    comments_enabled: true,
    custom_css: '',
    custom_js: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();

    // Subscribe to changes in site_settings
    const subscription = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_settings'
      }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching site settings:', error);
        return;
      }

      if (data) {
        setSettings({
          site_name: data.site_name || 'NewsHub',
          site_logo: data.site_logo || '',
          tagline: data.tagline || 'Your source for the latest news',
          description: data.description || 'Stay informed with the latest news and stories from around the world',
          seo_title: data.seo_title || 'NewsHub - Latest News & Stories',
          seo_description: data.seo_description || 'Get the latest breaking news, analysis, and stories from around the world',
          seo_keywords: data.seo_keywords || ['news', 'breaking news', 'latest news', 'world news'],
          og_image: data.og_image || '',
          facebook_url: data.facebook_url || '',
          twitter_url: data.twitter_url || '',
          instagram_url: data.instagram_url || '',
          linkedin_url: data.linkedin_url || '',
          youtube_url: data.youtube_url || '',
          github_url: data.github_url || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          address: data.address || '',
          google_analytics_id: data.google_analytics_id || '',
          newsletter_enabled: data.newsletter_enabled ?? true,
          comments_enabled: data.comments_enabled ?? true,
          custom_css: data.custom_css || '',
          custom_js: data.custom_js || '',
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

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export default SiteSettingsContext;
