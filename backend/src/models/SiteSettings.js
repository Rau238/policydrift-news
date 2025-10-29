const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  site_name: {
    type: String,
    required: true,
    default: 'News Website'
  },
  site_description: {
    type: String,
    default: 'Your trusted source for news'
  },
  site_logo: String,
  site_favicon: String,
  contact_email: String,
  social_links: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  seo: {
    meta_title: String,
    meta_description: String,
    meta_keywords: [String],
    google_analytics_id: String,
    google_site_verification: String
  },
  features: {
    enable_comments: {
      type: Boolean,
      default: true
    },
    enable_newsletter: {
      type: Boolean,
      default: true
    },
    enable_bookmarks: {
      type: Boolean,
      default: true
    },
    require_comment_approval: {
      type: Boolean,
      default: false
    }
  },
  appearance: {
    primary_color: {
      type: String,
      default: '#3B82F6'
    },
    secondary_color: {
      type: String,
      default: '#1E40AF'
    },
    accent_color: {
      type: String,
      default: '#F59E0B'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
