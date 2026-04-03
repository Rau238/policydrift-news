import { env } from '../config/env.js';

/**
 * Notify search engines (Bing, Yandex, etc.) about new URLs via IndexNow.
 * @see https://www.indexnow.org/documentation
 * @param {string[]} urls Absolute https URLs (e.g. article pages).
 */
export async function submitNewUrlsToIndexNow(urls) {
  if (!urls?.length) return { ok: true, skipped: true };
  const key = env.INDEXNOW_KEY?.trim();
  const origin = env.SITE_PUBLIC_URL?.replace(/\/$/, '') || '';
  if (!key || !origin.startsWith('https://')) {
    return { ok: true, skipped: true };
  }

  let host;
  try {
    host = new URL(origin).hostname;
  } catch {
    return { ok: false, error: 'Invalid SITE_PUBLIC_URL' };
  }

  const keyLocation = `${origin}/${key}.txt`;
  const unique = [...new Set(urls.filter((u) => typeof u === 'string' && u.startsWith('https://')))];
  if (!unique.length) return { ok: true, skipped: true };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList: unique.slice(0, 10_000),
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('[indexnow]', res.status, text.slice(0, 200));
      return { ok: false, status: res.status };
    }
    console.log(`[indexnow] submitted ${unique.length} URL(s)`);
    return { ok: true, count: unique.length };
  } catch (e) {
    console.warn('[indexnow]', e.message);
    return { ok: false, error: e.message };
  }
}
