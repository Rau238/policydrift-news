import { sendPushNotification, getVapidPublicKey } from '../services/push.service.js';
import * as pushModel from '../models/push-subscription.model.js';
import * as postModel from '../models/post.model.js';
import { env } from '../config/env.js';

/**
 * Public endpoint: Save a new push subscription from the client browser.
 */
export async function subscribe(req, res, next) {
  try {
    const { endpoint, keys } = req.body || {};

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ ok: false, error: 'Invalid subscription payload. Endpoint and keys are required.' });
    }

    const userAgent = req.headers['user-agent'] || null;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;

    const result = await pushModel.saveSubscription({
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
      ip,
    });

    return res.json({
      ok: true,
      message: 'Subscribed to breaking news alerts successfully.',
      id: result.id,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public endpoint: Deactivate a push subscription.
 */
export async function unsubscribe(req, res, next) {
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) {
      return res.status(400).json({ ok: false, error: 'Endpoint is required.' });
    }

    await pushModel.deactivateSubscription(endpoint);
    return res.json({ ok: true, message: 'Unsubscribed successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Public endpoint: Get the VAPID public key.
 */
export function getVapidKey(req, res) {
  return res.json({
    ok: true,
    publicKey: getVapidPublicKey(),
  });
}

/**
 * Admin endpoint: Broadcast push notification to all MySQL subscribers.
 */
export async function broadcastPush(req, res, next) {
  try {
    const { title, message, url, imageUrl, postId } = req.body || {};

    if (!title || !message) {
      return res.status(400).json({ ok: false, error: 'Title and message are required fields.' });
    }

    let targetUrl = url;
    if (postId && !targetUrl) {
      const post = await postModel.findById(postId);
      if (post) {
        const origin = (env.SITE_PUBLIC_URL || env.NEXT_PUBLIC_SITE_URL || 'https://www.newsfree365.live').replace(/\/$/, '');
        targetUrl = `${origin}/news/${post.slug}`;
      }
    }

    const result = await sendPushNotification({
      title: title.trim(),
      message: message.trim(),
      url: targetUrl,
      imageUrl: imageUrl ? imageUrl.trim() : null,
    });

    if (!result.ok) {
      return res.status(500).json({
        ok: false,
        error: result.error || 'Failed to broadcast notification.',
      });
    }

    return res.json({
      ok: true,
      message: result.message || 'Push notification broadcasted successfully.',
      sent: result.sent,
      failed: result.failed,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin endpoint: Get current subscriber stats and VAPID setup status.
 */
export async function getPushStatus(req, res, next) {
  try {
    const subscribersCount = await pushModel.countActiveSubscriptions();
    const publicKey = getVapidPublicKey();

    return res.json({
      ok: true,
      subscribersCount,
      publicKey,
      isConfigured: Boolean(publicKey),
    });
  } catch (err) {
    next(err);
  }
}
