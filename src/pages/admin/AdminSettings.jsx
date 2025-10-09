import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import ErrorMessage from '../../components/ui/ErrorMessage';
import ImageCropper from '../../components/ImageCropper';

const AdminSettings = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingImage, setUploadingImage] = useState({ logo: false, og: false });
  const [cropperState, setCropperState] = useState({ show: false, file: null, field: null });

  const [settings, setSettings] = useState({
    // Site Identity
    site_name: '',
    site_logo: '',
    tagline: '',
    description: '',
    
    // SEO Settings
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    og_image: '',
    
    // Social Media
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    github_url: '',
    
    // Contact
    contact_email: '',
    contact_phone: '',
    address: '',
    
    // Additional
    google_analytics_id: '',
    newsletter_enabled: true,
    comments_enabled: true,
    custom_css: '',
    custom_js: '',
  });

  const [settingsId, setSettingsId] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettingsId(data.id);
        setSettings({
          site_name: data.site_name || '',
          site_logo: data.site_logo || '',
          tagline: data.tagline || '',
          description: data.description || '',
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || '',
          seo_keywords: data.seo_keywords || [],
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
      console.error('Error fetching settings:', err);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    // Validate file size (max 5MB before crop)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    // Show cropper with appropriate default mode
    const defaultMode = field === 'site_logo' ? 'CIRCLE' : field === 'og_image' ? 'WIDE' : 'SQUARE';
    setCropperState({ show: true, file, field, defaultMode });
    e.target.value = ''; // Reset input
  };

  const handleCropComplete = async (croppedFile) => {
    const field = cropperState.field;
    
    try {
      setUploadingImage({ ...uploadingImage, [field]: true });
      setMessage({ type: '', text: '' });

      const fileExt = croppedFile.name.split('.').pop();
      const fileName = `${field}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-settings')
        .upload(filePath, croppedFile, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-settings')
        .getPublicUrl(filePath);

      setSettings({ ...settings, [field]: publicUrl });
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      setCropperState({ show: false, file: null, field: null });
    } catch (err) {
      console.error('Error uploading image:', err);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploadingImage({ ...uploadingImage, [field]: false });
    }
  };

  const handleKeywordsChange = (value) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    setSettings({ ...settings, seo_keywords: keywords });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const settingsData = {
        ...settings,
        updated_at: new Date().toISOString(),
      };

      if (settingsId) {
        // Update existing settings
        const { error } = await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', settingsId);

        if (error) throw error;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('site_settings')
          .insert([settingsData])
          .select()
          .single();

        if (error) throw error;
        setSettingsId(data.id);
      }

      setMessage({ type: 'success', text: 'Settings saved successfully! Reloading page...' });
      
      // Reload the page after 1 second to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'Failed to save settings: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading settings..." />;
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '🏢' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'social', label: 'Social Media', icon: '🌐' },
    { id: 'contact', label: 'Contact', icon: '📧' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Site Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your website configuration, branding, SEO, and social media links
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          <span className="text-2xl">
            {message.type === 'success' ? '✅' : '❌'}
          </span>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Site Name *
                </label>
                <Input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  placeholder="e.g., NewsHub"
                />
                <p className="mt-1 text-sm text-slate-500">Appears in header, page title, and footer</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Site Logo
                </label>
                <div className="flex items-center gap-4">
                  {settings.site_logo && (
                    <img 
                      src={settings.site_logo} 
                      alt="Site logo" 
                      className="w-20 h-20 object-contain rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'site_logo')}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                      disabled={uploadingImage.logo}
                    />
                    <p className="mt-1 text-sm text-slate-500">PNG, JPG up to 2MB (recommended: 200x60px)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tagline
                </label>
                <Input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="e.g., Your source for the latest news"
                />
                <p className="mt-1 text-sm text-slate-500">Short subtitle for your website</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Describe your news website..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-sm text-slate-500">Brief description about your website</p>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  SEO Title *
                </label>
                <Input
                  type="text"
                  value={settings.seo_title}
                  onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                  placeholder="e.g., NewsHub - Latest News & Stories"
                  maxLength={60}
                />
                <p className="mt-1 text-sm text-slate-500">
                  Default page title (50-60 characters) • {settings.seo_title.length}/60
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Meta Description *
                </label>
                <textarea
                  value={settings.seo_description}
                  onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                  placeholder="Brief description for search engines and social media..."
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-sm text-slate-500">
                  Default meta description (120-160 characters) • {settings.seo_description.length}/160
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  SEO Keywords
                </label>
                <Input
                  type="text"
                  value={settings.seo_keywords.join(', ')}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  placeholder="news, breaking news, latest news, world news"
                />
                <p className="mt-1 text-sm text-slate-500">Comma-separated keywords for meta tags</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Open Graph Image
                </label>
                <div className="flex items-start gap-4">
                  {settings.og_image && (
                    <img 
                      src={settings.og_image} 
                      alt="OG image" 
                      className="w-40 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'og_image')}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                      disabled={uploadingImage.og}
                    />
                    <p className="mt-1 text-sm text-slate-500">Image for social media previews (recommended: 1200x630px)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook URL
                </label>
                <Input
                  type="url"
                  value={settings.facebook_url}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter/X URL
                </label>
                <Input
                  type="url"
                  value={settings.twitter_url}
                  onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/youraccount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram URL
                </label>
                <Input
                  type="url"
                  value={settings.instagram_url}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/youraccount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn URL
                </label>
                <Input
                  type="url"
                  value={settings.linkedin_url}
                  onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube URL
                </label>
                <Input
                  type="url"
                  value={settings.youtube_url}
                  onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub URL
                </label>
                <Input
                  type="url"
                  value={settings.github_url}
                  onChange={(e) => setSettings({ ...settings, github_url: e.target.value })}
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  placeholder="contact@example.com"
                />
                <p className="mt-1 text-sm text-slate-500">Public email for inquiries</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contact Phone
                </label>
                <Input
                  type="tel"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="mt-1 text-sm text-slate-500">Public phone number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Address
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-sm text-slate-500">Physical address (displayed in footer)</p>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Google Analytics ID
                </label>
                <Input
                  type="text"
                  value={settings.google_analytics_id}
                  onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                  placeholder="G-XXXXXXXXXX or UA-XXXXXXXXXX"
                />
                <p className="mt-1 text-sm text-slate-500">Tracking ID from Google Analytics</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Enable Newsletter</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Show newsletter subscription widget</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.newsletter_enabled}
                    onChange={(e) => setSettings({ ...settings, newsletter_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Enable Comments</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Allow comments on articles</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.comments_enabled}
                    onChange={(e) => setSettings({ ...settings, comments_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Custom CSS
                </label>
                <textarea
                  value={settings.custom_css}
                  onChange={(e) => setSettings({ ...settings, custom_css: e.target.value })}
                  placeholder="/* Add your custom CSS here */"
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                />
                <p className="mt-1 text-sm text-slate-500">Custom CSS will be injected into all pages</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Custom JavaScript
                </label>
                <textarea
                  value={settings.custom_js}
                  onChange={(e) => setSettings({ ...settings, custom_js: e.target.value })}
                  placeholder="// Add your custom JavaScript here"
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                />
                <p className="mt-1 text-sm text-slate-500">Custom JavaScript will be executed on all pages</p>
              </div>
            </div>
          )}

          {/* Social Media, Contact, and Advanced tabs will go here - continuing in next message */}
        </div>

        {/* Save Button */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Changes will be applied immediately after saving
            </p>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="primary"
              className="min-w-[140px]"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {cropperState.show && (
        <ImageCropper
          imageFile={cropperState.file}
          defaultMode={cropperState.defaultMode}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperState({ show: false, file: null, field: null, defaultMode: null })}
        />
      )}
    </div>
  );
};

export default AdminSettings;
