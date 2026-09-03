import { env } from '../config/env.js';

/**
 * Send a web push notification to all subscribed users via OneSignal REST API.
 * @see https://documentation.onesignal.com/reference/create-notification
 *
 * @param {Object} params
 * @param {string} params.title Headline / Title of the notification.
 * @param {string} params.message Body text / Summary of the notification.
 * @param {string} params.url Target destination URL when clicked.
 * @param {string} [params.imageUrl] Optional big image URL.
 * @returns {Promise<{ ok: boolean, id?: string, recipients?: number, error?: string }>}
 */
export async function sendPushNotification({ title, message, url, imageUrl = null }) {
  const appId = (process.env.ONESIGNAL_APP_ID || env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '49a88bc4-f9f7-43de-a78d-ad8f4c521cea').trim();
  const restApiKey = (process.env.ONESIGNAL_REST_API_KEY || '').trim();

  if (!appId) {
    return { ok: false, error: 'OneSignal App ID is not configured.' };
  }

  if (!title || !message) {
    return { ok: false, error: 'Title and message are required.' };
  }

  // Ensure absolute public URL
  const origin = (env.SITE_PUBLIC_URL || env.NEXT_PUBLIC_SITE_URL || 'https://www.newsfree365.live').replace(/\/$/, '');
  let destinationUrl = url || origin;
  if (destinationUrl.startsWith('/')) {
    destinationUrl = `${origin}${destinationUrl}`;
  }

  const payload = {
    app_id: appId,
    included_segments: ['Subscribed Users', 'Total Subscriptions'],
    headings: { en: title },
    contents: { en: message },
    url: destinationUrl,
    web_url: destinationUrl,
  };

  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    payload.chrome_web_image = imageUrl;
    payload.big_picture = imageUrl;
    payload.adm_big_picture = imageUrl;
  }

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (restApiKey) {
    headers['Authorization'] = `Basic ${restApiKey}`;
  }

  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = Array.isArray(data.errors)
        ? data.errors.join(', ')
        : data.errors?.toString() || `OneSignal API error (HTTP ${res.status})`;
      console.warn('[push.service] OneSignal send failed:', errMsg);
      return { ok: false, error: errMsg, status: res.status };
    }

    console.log(`[push.service] Push notification sent successfully. ID: ${data.id}, Recipients: ${data.recipients || 0}`);
    return {
      ok: true,
      id: data.id,
      recipients: data.recipients ?? 0,
      external_id: data.external_id,
    };
  } catch (err) {
    console.error('[push.service] Network error calling OneSignal:', err.message);
    return { ok: false, error: err.message || 'Failed to connect to OneSignal API.' };
  }
}
