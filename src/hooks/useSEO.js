import { useEffect } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

/**
 * Custom hook for managing dynamic SEO meta tags
 * Updates document title and meta tags based on page content and site settings
 * 
 * @param {Object} options - SEO configuration options
 * @param {string} options.title - Page-specific title (will be appended to site name)
 * @param {string} options.description - Page-specific meta description
 * @param {string} options.keywords - Page-specific keywords (comma-separated)
 * @param {string} options.image - Page-specific OG image URL
 * @param {string} options.url - Current page URL for canonical and OG tags
 * @param {string} options.type - OG type (article, website, etc.)
 */
export const useSEO = ({ 
  title = '', 
  description = '', 
  keywords = '',
  image = '',
  url = '',
  type = 'website'
} = {}) => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Construct full title: Page Title | Site Name
    const fullTitle = title 
      ? `${title} | ${settings.site_name}` 
      : settings.seo_title || settings.site_name;
    
    // Use page description or fall back to site SEO description
    const metaDescription = description || settings.seo_description || settings.description;
    
    // Combine page keywords with site keywords
    const metaKeywords = keywords 
      ? `${keywords}, ${settings.seo_keywords?.join(', ') || ''}`
      : settings.seo_keywords?.join(', ') || '';
    
    // Use page image or site OG image
    const ogImage = image || settings.og_image || '';
    
    // Use provided URL or current location
    const canonicalUrl = url || window.location.href;

    // Update document title
    document.title = fullTitle;

    // Helper function to update or create meta tag
    const updateMetaTag = (selector, content, attribute = 'content') => {
      if (!content) return;
      
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attribute, content);
      } else {
        element = document.createElement('meta');
        const [attr, value] = selector.replace(/[\[\]]/g, '').split('=');
        element.setAttribute(attr, value.replace(/['"]/g, ''));
        element.setAttribute(attribute, content);
        document.head.appendChild(element);
      }
    };

    // Update standard meta tags
    updateMetaTag('meta[name="description"]', metaDescription);
    updateMetaTag('meta[name="keywords"]', metaKeywords);
    updateMetaTag('meta[name="author"]', settings.site_name);

    // Update Open Graph tags for social sharing
    updateMetaTag('meta[property="og:title"]', fullTitle);
    updateMetaTag('meta[property="og:description"]', metaDescription);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:url"]', canonicalUrl);
    updateMetaTag('meta[property="og:site_name"]', settings.site_name);
    if (ogImage) {
      updateMetaTag('meta[property="og:image"]', ogImage);
    }

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', fullTitle);
    updateMetaTag('meta[name="twitter:description"]', metaDescription);
    if (ogImage) {
      updateMetaTag('meta[name="twitter:image"]', ogImage);
    }
    if (settings.twitter_url) {
      const twitterHandle = settings.twitter_url.split('/').pop();
      if (twitterHandle) {
        updateMetaTag('meta[name="twitter:site"]', `@${twitterHandle}`);
      }
    }

    // Update or create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonicalUrl);
      document.head.appendChild(canonicalLink);
    }

    // Inject custom CSS if exists
    if (settings.custom_css) {
      let customStyle = document.getElementById('custom-site-css');
      if (customStyle) {
        customStyle.textContent = settings.custom_css;
      } else {
        customStyle = document.createElement('style');
        customStyle.id = 'custom-site-css';
        customStyle.textContent = settings.custom_css;
        document.head.appendChild(customStyle);
      }
    }

    // Inject custom JS if exists
    if (settings.custom_js) {
      let customScript = document.getElementById('custom-site-js');
      if (customScript) {
        customScript.textContent = settings.custom_js;
      } else {
        customScript = document.createElement('script');
        customScript.id = 'custom-site-js';
        customScript.textContent = settings.custom_js;
        document.head.appendChild(customScript);
      }
    }

    // Inject Google Analytics if ID exists
    if (settings.google_analytics_id && !document.getElementById('google-analytics')) {
      // Create gtag script
      const gtagScript = document.createElement('script');
      gtagScript.id = 'google-analytics';
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
      document.head.appendChild(gtagScript);

      // Create initialization script
      const initScript = document.createElement('script');
      initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.google_analytics_id}');
      `;
      document.head.appendChild(initScript);
    }

  }, [
    title, 
    description, 
    keywords, 
    image, 
    url, 
    type,
    settings.site_name,
    settings.seo_title,
    settings.seo_description,
    settings.seo_keywords,
    settings.og_image,
    settings.description,
    settings.twitter_url,
    settings.custom_css,
    settings.custom_js,
    settings.google_analytics_id
  ]);

  return {
    updateSEO: ({ title, description, keywords, image, url, type }) => {
      // This allows programmatic updates if needed
      // The hook will re-run with new values
    }
  };
};
