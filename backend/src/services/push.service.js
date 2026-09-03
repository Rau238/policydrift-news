import webpush from 'web-push';
import * as pushModel from '../models/push-subscription.model.js';
import { env } from '../config/env.js';

const VAPID_PUBLIC_KEY = (process.env.VAPID_PUBLIC_KEY || env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEOxX5FHHjs0jtdI7RSFK7xEtr_osf5BneU-xTVjAftofmu5eS-xST7kdJOcGSJgLTOycyS-NEf9bque6LWlIYo').trim();
const VAPID_PRIVATE_KEY = (process.env.VAPID_PRIVATE_KEY || 'Q4TL85Ps6lInPDPiwAaegjTU3v-RFX0xM2meD8o5w1c').trim();
const VAPID_SUBJECT = (process.env.VAPID_SUBJECT || 'mailto:policy.drift.yt@gmail.com').trim();

// Configure webpush with VAPID credentials
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (e) {
    console.warn('[push.service] Failed to set VAPID details:', e.message);
  }
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}

/**
 * Broadcast Web Push notification to all active subscribers stored in MySQL.
 *
 * @param {Object} params
 * @param {string} params.title Headline of the notification.
 * @param {string} params.message Summary / Body text.
 * @param {string} params.url Click destination URL.
 * @param {string} [params.imageUrl] Optional big image URL.
 * @returns {Promise<{ ok: boolean, sent: number, failed: number, total: number, message?: string, error?: string }>}
 */
export async function sendPushNotification({ title, message, url, imageUrl = null }) {
  if (!title || !message) {
    return { ok: false, error: 'Title and message are required.' };
  }

  const origin = (env.SITE_PUBLIC_URL || env.NEXT_PUBLIC_SITE_URL || 'https://www.newsfree365.live').replace(/\/$/, '');
  let destinationUrl = url || origin;
  if (destinationUrl.startsWith('/')) {
    destinationUrl = `${origin}${destinationUrl}`;
  }

  // Fetch all active subscribers from MySQL
  const subscriptions = await pushModel.getActiveSubscriptions();

  if (!subscriptions || subscriptions.length === 0) {
    return {
      ok: true,
      sent: 0,
      failed: 0,
      total: 0,
      message: 'No active subscribers found in database yet. Visitors can subscribe on the website.',
    };
  }

  const payload = JSON.stringify({
    title,
    body: message,
    url: destinationUrl,
    icon: `${origin}/icon.svg`,
    badge: `${origin}/icon.svg`,
    image: imageUrl || undefined,
    data: {
      url: destinationUrl,
      timestamp: Date.now(),
    },
  });

  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload, {
          TTL: 60 * 60 * 24, // 24 hours
          urgency: 'high',
        });
        sent++;
      } catch (err) {
        failed++;
        // If subscription is expired or unregistered (404 or 410 Gone), deactivate from MySQL
        if (err.statusCode === 404 || err.statusCode === 410) {
          await pushModel.deactivateSubscription(sub.endpoint).catch(() => {});
        }
      }
    })
  );

  console.log(`[push.service] Broadcast complete: ${sent} sent, ${failed} failed across ${subscriptions.length} subscribers.`);

  return {
    ok: true,
    sent,
    failed,
    total: subscriptions.length,
    message: `Push alert sent to ${sent} active subscriber device(s).`,
  };
}
