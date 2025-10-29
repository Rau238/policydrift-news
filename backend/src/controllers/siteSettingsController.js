const SiteSettings = require('../models/SiteSettings');
const { asyncHandler, createError } = require('../utils/validation');

// @desc    Get site settings
// @route   GET /api/site-settings
// @access  Public
exports.getSiteSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();

  // If no settings exist, create default
  if (!settings) {
    settings = await SiteSettings.create({
      site_name: 'News Website',
      site_description: 'Your trusted source for news'
    });
  }

  res.json({
    success: true,
    data: { settings }
  });
});

// @desc    Update site settings
// @route   PUT /api/site-settings
// @access  Private (Admin)
exports.updateSiteSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = await SiteSettings.create(req.body);
  } else {
    // Update with new values
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'object' && req.body[key] !== null && !Array.isArray(req.body[key])) {
        // Merge nested objects
        settings[key] = { ...settings[key], ...req.body[key] };
      } else {
        settings[key] = req.body[key];
      }
    });

    await settings.save();
  }

  res.json({
    success: true,
    message: 'Site settings updated successfully',
    data: { settings }
  });
});

// @desc    Update specific setting section
// @route   PUT /api/site-settings/:section
// @access  Private (Admin)
exports.updateSettingSection = asyncHandler(async (req, res) => {
  const { section } = req.params;
  
  const validSections = ['social_links', 'seo', 'features', 'appearance'];
  
  if (!validSections.includes(section)) {
    throw createError('Invalid settings section', 400);
  }

  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = await SiteSettings.create({});
  }

  settings[section] = { ...settings[section], ...req.body };
  await settings.save();

  res.json({
    success: true,
    message: `${section} settings updated successfully`,
    data: { settings }
  });
});
