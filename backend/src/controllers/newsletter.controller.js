import * as newsletterModel from '../models/newsletter.model.js';
import * as emailService from '../services/email.service.js';
import * as postModel from '../models/post.model.js';

/**
 * Public: Subscribe to newsletter
 */
export async function subscribe(req, res, next) {
  try {
    const { email, name, frequency } = req.body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ ok: false, error: 'A valid email address is required.' });
    }

    const result = await newsletterModel.subscribe({
      email,
      name,
      frequency: ['daily', 'weekly', 'breaking'].includes(frequency) ? frequency : 'daily',
    });

    // Send welcome email in background
    emailService.sendWelcomeEmail({
      email: result.email,
      name,
      token: result.token,
    }).catch((e) => console.warn('[newsletter.controller] Welcome email err:', e.message));

    return res.json({
      ok: true,
      message: 'Thank you for subscribing to NewsFree365 Daily Briefing!',
      id: result.id,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public: Unsubscribe via token or email
 */
export async function unsubscribe(req, res, next) {
  try {
    const token = req.query.token || req.body?.token;
    const email = req.query.email || req.body?.email;

    if (!token && !email) {
      return res.status(400).json({ ok: false, error: 'Token or email is required.' });
    }

    let success = false;
    if (token) {
      success = await newsletterModel.unsubscribeByToken(token);
    } else if (email) {
      success = await newsletterModel.unsubscribeByEmail(email);
    }

    return res.json({
      ok: true,
      message: success
        ? 'You have been unsubscribed from the NewsFree365 newsletter.'
        : 'Subscription not found or already inactive.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public: Get active subscriber count
 */
export async function getPublicCount(req, res, next) {
  try {
    const count = await newsletterModel.countActiveSubscribers();
    return res.json({ ok: true, count });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Broadcast a newsletter campaign / digest
 */
export async function broadcast(req, res, next) {
  try {
    const { subject, headline, intro, postIds, frequency } = req.body || {};

    if (!subject) {
      return res.status(400).json({ ok: false, error: 'Subject line is required.' });
    }

    let stories = [];
    if (Array.isArray(postIds) && postIds.length > 0) {
      const posts = await Promise.all(postIds.slice(0, 10).map((id) => postModel.findById(id)));
      stories = posts.filter(Boolean);
    } else {
      // Pick top 5 latest published stories automatically
      const res = await postModel.listPosts({ limit: 5 });
      stories = res?.posts || [];
    }

    const result = await emailService.broadcastNewsletter({
      subject: subject.trim(),
      headline: headline?.trim() || subject.trim(),
      intro: intro?.trim() || '',
      stories,
      frequency: frequency || 'all',
    });

    return res.json({
      ok: true,
      message: result.message,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: List subscribers
 */
export async function listSubscribers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit || '50', 10)));
    const search = (req.query.search || '').trim();

    const data = await newsletterModel.listSubscribers({ page, limit, search });
    return res.json({ ok: true, ...data });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Stats & SMTP Config Status
 */
export async function getStats(req, res, next) {
  try {
    const count = await newsletterModel.countActiveSubscribers();
    const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    return res.json({
      ok: true,
      subscribersCount: count,
      smtpConfigured: hasSmtp,
      smtpHost: process.env.SMTP_HOST || null,
    });
  } catch (err) {
    next(err);
  }
}
