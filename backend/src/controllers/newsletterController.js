const Newsletter = require('../models/Newsletter');
const { asyncHandler, createError } = require('../utils/validation');
const { sendNewsletterConfirmation } = require('../utils/emailService');
const { paginate } = require('../utils/pagination');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if already subscribed
  let subscriber = await Newsletter.findOne({ email });

  if (subscriber) {
    if (subscriber.isSubscribed) {
      return res.status(400).json({
        success: false,
        message: 'Email is already subscribed'
      });
    }

    // Resubscribe
    subscriber.isSubscribed = true;
    subscriber.subscribedAt = new Date();
    subscriber.unsubscribedAt = null;
    await subscriber.save();
  } else {
    // New subscriber
    subscriber = await Newsletter.create({ email });
  }

  // Send confirmation email (don't wait for it)
  sendNewsletterConfirmation(email).catch(err =>
    console.error('Failed to send newsletter confirmation:', err)
  );

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to newsletter'
  });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const subscriber = await Newsletter.findOne({ email });

  if (!subscriber || !subscriber.isSubscribed) {
    throw createError('Email not found in subscribers list', 404);
  }

  subscriber.isSubscribed = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  res.json({
    success: true,
    message: 'Successfully unsubscribed from newsletter'
  });
});

// @desc    Get all subscribers (Admin)
// @route   GET /api/newsletter/subscribers
// @access  Private (Admin)
exports.getSubscribers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, subscribed } = req.query;

  const query = {};
  if (subscribed !== undefined) {
    query.isSubscribed = subscribed === 'true';
  }

  const result = await paginate(Newsletter, query, {
    page,
    limit,
    sort: { subscribedAt: -1 }
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// @desc    Delete subscriber (Admin)
// @route   DELETE /api/newsletter/:id
// @access  Private (Admin)
exports.deleteSubscriber = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subscriber = await Newsletter.findById(id);

  if (!subscriber) {
    throw createError('Subscriber not found', 404);
  }

  await Newsletter.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Subscriber deleted successfully'
  });
});
