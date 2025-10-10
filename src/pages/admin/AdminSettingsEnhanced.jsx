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
  const [uploadingImage, setUploadingImage] = useState({});
  const [cropperState, setCropperState] = useState({ show: false, file: null, field: null });

  const [settings, setSettings] = useState({
    // Site Identity
    site_name: '',
    site_logo: '',
    tagline: '',
    description: '',
    
    // Company Information
    company_name: '',
    company_legal_name: '',
    company_founded_year: new Date().getFullYear(),
    company_mission: '',
    company_vision: '',
    company_values: [],
    
    // About Us
    about_title: 'About Us',
    about_subtitle: '',
    about_story: '',
    about_hero_image: '',
    
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
    telegram_url: '',
    tiktok_url: '',
    pinterest_url: '',
    
    // Contact Information
    contact_email: '',
    contact_name: '',
    support_email: '',
    press_email: '',
    contact_phone: '',
    office_hours: '',
    timezone: 'America/New_York',
    
    // Address
    address: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    
    // Legal
    privacy_last_updated: new Date().toISOString().split('T')[0],
    terms_last_updated: new Date().toISOString().split('T')[0],
    accessibility_last_updated: new Date().toISOString().split('T')[0],
    legal_jurisdiction: 'California, USA',
    dpo_email: '',
    dpo_name: '',
    
    // Editorial
    editor_in_chief: '',
    editorial_email: '',
    newsroom_email: '',
    editorial_standards: '',
    
    // Copyright
    copyright_notice: '',
    copyright_year: new Date().getFullYear(),
    license_type: 'All Rights Reserved',
    disclaimer: '',
    
    // Additional
    google_analytics_id: '',
    google_adsense_id: '',
    newsletter_enabled: true,
    comments_enabled: true,
    rss_enabled: true,
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
          company_name: data.company_name || data.site_name || '',
          company_legal_name: data.company_legal_name || '',
          company_founded_year: data.company_founded_year || new Date().getFullYear(),
          company_mission: data.company_mission || '',
          company_vision: data.company_vision || '',
          company_values: data.company_values || [],
          about_title: data.about_title || 'About Us',
          about_subtitle: data.about_subtitle || '',
          about_story: data.about_story || '',
          about_hero_image: data.about_hero_image || '',
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
          telegram_url: data.telegram_url || '',
          tiktok_url: data.tiktok_url || '',
          pinterest_url: data.pinterest_url || '',
          contact_email: data.contact_email || '',
          contact_name: data.contact_name || '',
          support_email: data.support_email || '',
          press_email: data.press_email || '',
          contact_phone: data.contact_phone || '',
          office_hours: data.office_hours || '',
          timezone: data.timezone || 'America/New_York',
          address: data.address || '',
          street_address: data.street_address || '',
          city: data.city || '',
          state: data.state || '',
          zip_code: data.zip_code || '',
          country: data.country || 'United States',
          privacy_last_updated: data.privacy_last_updated || new Date().toISOString().split('T')[0],
          terms_last_updated: data.terms_last_updated || new Date().toISOString().split('T')[0],
          accessibility_last_updated: data.accessibility_last_updated || new Date().toISOString().split('T')[0],
          legal_jurisdiction: data.legal_jurisdiction || 'California, USA',
          dpo_email: data.dpo_email || '',
          dpo_name: data.dpo_name || '',
          editor_in_chief: data.editor_in_chief || '',
          editorial_email: data.editorial_email || '',
          newsroom_email: data.newsroom_email || '',
          editorial_standards: data.editorial_standards || '',
          copyright_notice: data.copyright_notice || '',
          copyright_year: data.copyright_year || new Date().getFullYear(),
          license_type: data.license_type || 'All Rights Reserved',
          disclaimer: data.disclaimer || '',
          google_analytics_id: data.google_analytics_id || '',
          google_adsense_id: data.google_adsense_id || '',
          newsletter_enabled: data.newsletter_enabled ?? true,
          comments_enabled: data.comments_enabled ?? true,
          rss_enabled: data.rss_enabled ?? true,
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

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    const defaultMode = field === 'site_logo' ? 'CIRCLE' : field === 'og_image' ? 'WIDE' : 'SQUARE';
    setCropperState({ show: true, file, field, defaultMode });
    e.target.value = '';
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
        .upload(filePath, croppedFile, { upsert: true });

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
        const { error } = await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', settingsId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('site_settings')
          .insert([settingsData])
          .select()
          .single();

        if (error) throw error;
        setSettingsId(data.id);
      }

      setMessage({ type: 'success', text: 'Settings saved successfully! Reloading page...' });
      
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
    { id: 'company', label: 'Company Info', icon: '🏛️' },
    { id: 'about', label: 'About Us', icon: '📖' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'social', label: 'Social Media', icon: '🌐' },
    { id: 'contact', label: 'Contact', icon: '📧' },
    { id: 'legal', label: 'Legal', icon: '⚖️' },
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
          Manage your website configuration, branding, content, and features
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
                  placeholder="e.g., Policy Drift News"
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
                      disabled={uploadingImage.site_logo}
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
                  placeholder="e.g., Your source for policy analysis"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Copyright Notice
                </label>
                <Input
                  type="text"
                  value={settings.copyright_notice}
                  onChange={(e) => setSettings({ ...settings, copyright_notice: e.target.value })}
                  placeholder="© 2025 Policy Drift News. All rights reserved."
                />
                <p className="mt-1 text-sm text-slate-500">Copyright text shown in footer</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Copyright Year
                </label>
                <Input
                  type="number"
                  value={settings.copyright_year}
                  onChange={(e) => setSettings({ ...settings, copyright_year: parseInt(e.target.value) })}
                  placeholder="2025"
                />
              </div>
            </div>
          )}

          {/* Company Info Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Name
                </label>
                <Input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  placeholder="e.g., Policy Drift News LLC"
                />
                <p className="mt-1 text-sm text-slate-500">Official company name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Legal Company Name
                </label>
                <Input
                  type="text"
                  value={settings.company_legal_name}
                  onChange={(e) => setSettings({ ...settings, company_legal_name: e.target.value })}
                  placeholder="e.g., Policy Drift News, LLC"
                />
                <p className="mt-1 text-sm text-slate-500">Full legal entity name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Founded Year
                </label>
                <Input
                  type="number"
                  value={settings.company_founded_year}
                  onChange={(e) => setSettings({ ...settings, company_founded_year: parseInt(e.target.value) })}
                  placeholder="2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mission Statement
                </label>
                <textarea
                  value={settings.company_mission}
                  onChange={(e) => setSettings({ ...settings, company_mission: e.target.value })}
                  placeholder="Our mission is to..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Vision Statement
                </label>
                <textarea
                  value={settings.company_vision}
                  onChange={(e) => setSettings({ ...settings, company_vision: e.target.value })}
                  placeholder="Our vision is to..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Editorial Standards
                </label>
                <textarea
                  value={settings.editorial_standards}
                  onChange={(e) => setSettings({ ...settings, editorial_standards: e.target.value })}
                  placeholder="Describe your editorial standards..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Editor-in-Chief
                </label>
                <Input
                  type="text"
                  value={settings.editor_in_chief}
                  onChange={(e) => setSettings({ ...settings, editor_in_chief: e.target.value })}
                  placeholder="e.g., Jane Doe"
                />
              </div>
            </div>
          )}

          {/* About Us Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  About Page Title
                </label>
                <Input
                  type="text"
                  value={settings.about_title}
                  onChange={(e) => setSettings({ ...settings, about_title: e.target.value })}
                  placeholder="About Us"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  About Page Subtitle
                </label>
                <Input
                  type="text"
                  value={settings.about_subtitle}
                  onChange={(e) => setSettings({ ...settings, about_subtitle: e.target.value })}
                  placeholder="Learn more about who we are"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Our Story
                </label>
                <textarea
                  value={settings.about_story}
                  onChange={(e) => setSettings({ ...settings, about_story: e.target.value })}
                  placeholder="Tell your company's story..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-sm text-slate-500">This will be shown on the About Us page</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  About Hero Image
                </label>
                <div className="flex items-start gap-4">
                  {settings.about_hero_image && (
                    <img 
                      src={settings.about_hero_image} 
                      alt="About hero" 
                      className="w-40 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'about_hero_image')}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                      disabled={uploadingImage.about_hero_image}
                    />
                    <p className="mt-1 text-sm text-slate-500">Header image for About Us page (recommended: 1920x600px)</p>
                  </div>
                </div>
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
                  placeholder="e.g., Policy Drift News - Latest Policy Analysis"
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
                  placeholder="policy, news, analysis, government"
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
                      disabled={uploadingImage.og_image}
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
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    GitHub URL
                  </label>
                  <Input
                    type="url"
                    value={settings.github_url}
                    onChange={(e) => setSettings({ ...settings, github_url: e.target.value })}
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Telegram URL
                  </label>
                  <Input
                    type="url"
                    value={settings.telegram_url}
                    onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                    placeholder="https://t.me/yourchannel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    TikTok URL
                  </label>
                  <Input
                    type="url"
                    value={settings.tiktok_url}
                    onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                    placeholder="https://tiktok.com/@youraccount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pinterest URL
                  </label>
                  <Input
                    type="url"
                    value={settings.pinterest_url}
                    onChange={(e) => setSettings({ ...settings, pinterest_url: e.target.value })}
                    placeholder="https://pinterest.com/youraccount"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Primary Contact Email *
                </label>
                <Input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  placeholder="contact@policydrift.news"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contact Person Name
                </label>
                <Input
                  type="text"
                  value={settings.contact_name}
                  onChange={(e) => setSettings({ ...settings, contact_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Support Email
                  </label>
                  <Input
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                    placeholder="support@policydrift.news"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Press Email
                  </label>
                  <Input
                    type="email"
                    value={settings.press_email}
                    onChange={(e) => setSettings({ ...settings, press_email: e.target.value })}
                    placeholder="press@policydrift.news"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Editorial Email
                  </label>
                  <Input
                    type="email"
                    value={settings.editorial_email}
                    onChange={(e) => setSettings({ ...settings, editorial_email: e.target.value })}
                    placeholder="editorial@policydrift.news"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Newsroom Email
                  </label>
                  <Input
                    type="email"
                    value={settings.newsroom_email}
                    onChange={(e) => setSettings({ ...settings, newsroom_email: e.target.value })}
                    placeholder="newsroom@policydrift.news"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Office Hours
                </label>
                <Input
                  type="text"
                  value={settings.office_hours}
                  onChange={(e) => setSettings({ ...settings, office_hours: e.target.value })}
                  placeholder="Monday - Friday: 9:00 AM - 5:00 PM EST"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Timezone
                </label>
                <Input
                  type="text"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  placeholder="America/New_York"
                />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Business Address</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Street Address
                    </label>
                    <Input
                      type="text"
                      value={settings.street_address}
                      onChange={(e) => setSettings({ ...settings, street_address: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        City
                      </label>
                      <Input
                        type="text"
                        value={settings.city}
                        onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                        placeholder="San Francisco"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        State/Province
                      </label>
                      <Input
                        type="text"
                        value={settings.state}
                        onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                        placeholder="California"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        ZIP/Postal Code
                      </label>
                      <Input
                        type="text"
                        value={settings.zip_code}
                        onChange={(e) => setSettings({ ...settings, zip_code: e.target.value })}
                        placeholder="94102"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Country
                    </label>
                    <Input
                      type="text"
                      value={settings.country}
                      onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                      placeholder="United States"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Full Address (Legacy field - for footer)
                    </label>
                    <textarea
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      placeholder="123 Main St, San Francisco, CA 94102"
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legal Tab */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Privacy Policy Last Updated
                  </label>
                  <Input
                    type="date"
                    value={settings.privacy_last_updated}
                    onChange={(e) => setSettings({ ...settings, privacy_last_updated: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Terms of Service Last Updated
                  </label>
                  <Input
                    type="date"
                    value={settings.terms_last_updated}
                    onChange={(e) => setSettings({ ...settings, terms_last_updated: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Accessibility Last Updated
                  </label>
                  <Input
                    type="date"
                    value={settings.accessibility_last_updated}
                    onChange={(e) => setSettings({ ...settings, accessibility_last_updated: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Legal Jurisdiction
                </label>
                <Input
                  type="text"
                  value={settings.legal_jurisdiction}
                  onChange={(e) => setSettings({ ...settings, legal_jurisdiction: e.target.value })}
                  placeholder="California, USA"
                />
                <p className="mt-1 text-sm text-slate-500">Governing law jurisdiction for legal pages</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Data Protection Officer (DPO) Name
                  </label>
                  <Input
                    type="text"
                    value={settings.dpo_name}
                    onChange={(e) => setSettings({ ...settings, dpo_name: e.target.value })}
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    DPO Email
                  </label>
                  <Input
                    type="email"
                    value={settings.dpo_email}
                    onChange={(e) => setSettings({ ...settings, dpo_email: e.target.value })}
                    placeholder="dpo@policydrift.news"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  License Type
                </label>
                <select
                  value={settings.license_type}
                  onChange={(e) => setSettings({ ...settings, license_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option>All Rights Reserved</option>
                  <option>CC BY 4.0</option>
                  <option>CC BY-SA 4.0</option>
                  <option>CC BY-NC 4.0</option>
                  <option>CC BY-NC-SA 4.0</option>
                  <option>MIT License</option>
                  <option>Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Disclaimer
                </label>
                <textarea
                  value={settings.disclaimer}
                  onChange={(e) => setSettings({ ...settings, disclaimer: e.target.value })}
                  placeholder="Legal disclaimer text..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
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

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Google AdSense ID
                </label>
                <Input
                  type="text"
                  value={settings.google_adsense_id}
                  onChange={(e) => setSettings({ ...settings, google_adsense_id: e.target.value })}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
                <p className="mt-1 text-sm text-slate-500">Publisher ID from Google AdSense</p>
              </div>

              <div className="space-y-4">
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

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Enable RSS Feed</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Make RSS feed available for subscribers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.rss_enabled}
                      onChange={(e) => setSettings({ ...settings, rss_enabled: e.target.value })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
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
