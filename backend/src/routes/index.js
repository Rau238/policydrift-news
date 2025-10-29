const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const articleRoutes = require('./articleRoutes');
const categoryRoutes = require('./categoryRoutes');
const tagRoutes = require('./tagRoutes');
const commentRoutes = require('./commentRoutes');
const bookmarkRoutes = require('./bookmarkRoutes');
const newsletterRoutes = require('./newsletterRoutes');
const userRoutes = require('./userRoutes');
const siteSettingsRoutes = require('./siteSettingsRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/comments', commentRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/users', userRoutes);
router.use('/site-settings', siteSettingsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
