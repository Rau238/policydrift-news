const express = require('express');
const router = express.Router();
const {
  getSiteSettings,
  updateSiteSettings,
  updateSettingSection
} = require('../controllers/siteSettingsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', getSiteSettings);
router.put('/', authMiddleware, adminMiddleware, updateSiteSettings);
router.put('/:section', authMiddleware, adminMiddleware, updateSettingSection);

module.exports = router;
