const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  deleteSubscriber
} = require('../controllers/newsletterController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { body } = require('express-validator');
const validate = require('../middleware/validator');

const emailValidator = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail()
];

router.post('/subscribe', emailValidator, validate, subscribe);
router.post('/unsubscribe', emailValidator, validate, unsubscribe);
router.get('/subscribers', authMiddleware, adminMiddleware, getSubscribers);
router.delete('/:id', authMiddleware, adminMiddleware, deleteSubscriber);

module.exports = router;
