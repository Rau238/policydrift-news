import { sendPushNotification } from '../services/push.service.js';
import * as postModel from '../models/post.model.js';
import { env } from '../config/env.js';

export async function broadcastPush(req, res, next) {
  try {
    const { title, message, url, imageUrl, postId } = req.body || {};

    if (!title || !message) {
      return res.status(400).json({ ok: false, error: 'Title and message are required fields.' });
    }

    // If postId is provided, verify it exists and record action
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
      return res.status(502).json({
        ok: false,
        error: result.error || 'Failed to send notification via OneSignal.',
      });
    }

    return res.json({
      ok: true,
      message: 'Push notification broadcasted successfully to all subscribers.',
      id: result.id,
      recipients: result.recipients,
    });
  } catch (err) {
    next(err);
  }
}

export function getPushStatus(req, res) {
  const appId = (process.env.ONESIGNAL_APP_ID || env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '49a88bc4-f9f7-43de-a78d-ad8f4c521cea').trim();
  const hasRestKey = Boolean((process.env.ONESIGNAL_REST_API_KEY || '').trim());

  return res.json({
    ok: true,
    configured: Boolean(appId),
    appId,
    hasRestApiKey: hasRestKey,
  });
}
