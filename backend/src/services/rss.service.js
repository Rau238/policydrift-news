import Parser from 'rss-parser';
import { env } from '../config/env.js';
import { toCleanString } from '../utils/string.js';

const parser = new Parser({
  timeout: 35000,
  headers: {
    /* Some publishers (e.g. Moneycontrol) return 403 to generic “bot” UAs; keep a normal browser string. */
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PolicyDrift/1.0',
    Accept: 'application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['media:group', 'mediaGroup', { keepArray: true }],
      ['itunes:image', 'itunesImage', { keepArray: true }],
    ],
  },
});

function absolutizeImageUrl(src, articleLink) {
  const s = toCleanString(src).replace(/&amp;/g, '&');
  if (!s || s.startsWith('data:')) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) return `https:${s}`;
  try {
    return new URL(s, articleLink).href;
  } catch {
    return null;
  }
}

function looksLikeImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (/\.(jpe?g|png|gif|webp|avif|bmp|svg)(\?|#|$)/i.test(url)) return true;
  if (/[?&]format=(jpe?g|png|webp|gif)/i.test(url)) return true;
  return false;
}

function probablyRasterImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (looksLikeImageUrl(url)) return true;
  const lower = url.toLowerCase();
  if (/\.(mp4|webm|mov|m3u8|mp3|pdf)(\?|#|$)/i.test(lower)) return false;
  if (/youtube\.com|youtu\.be|vimeo\.com|podcast/i.test(lower)) return false;
  if (/\/(image|images|img|media|photos|pictures|static)\//i.test(url)) return true;
  if (/\/resizer\/|\/resize\/|cloudinary|imgix|akamai|brightcove/i.test(lower)) return true;
  return false;
}

function isLikelyBadHeroImage(url) {
  const u = (url || '').toLowerCase();
  if (/doubleclick|googlesyndication|adservice|facebook\.com\/tr|\/ads?\//i.test(u)) return true;
  if (/1x1[._-]|\/1x1\/|pixel\.gif|spacer\.|blank\.gif|transparent\.gif/i.test(u)) return true;
  return false;
}

/** Collect <img> candidates: lazy attrs, srcset, then plain src (many wires use data-src). */
function extractImageUrlsFromHtml(html) {
  if (!html || typeof html !== 'string') return [];
  const out = [];
  const imgTagRe = /<img\b[^>]*>/gi;
  let m;
  while ((m = imgTagRe.exec(html)) !== null) {
    const tag = m[0];
    const attrRes = [
      /\sdata-src\s*=\s*["']([^"']+)["']/i,
      /\sdata-lazy-src\s*=\s*["']([^"']+)["']/i,
      /\sdata-original\s*=\s*["']([^"']+)["']/i,
      /\sdata-lazy-image\s*=\s*["']([^"']+)["']/i,
      /\snitro-lazy-src\s*=\s*["']([^"']+)["']/i,
      /\sdata-srcset\s*=\s*["']([^"']+)["']/i,
      /\ssrcset\s*=\s*["']([^"']+)["']/i,
      /\ssrc\s*=\s*["']([^"']+)["']/i,
      /\ssrc\s*=\s*([^\s>]+)/i,
    ];
    for (const re of attrRes) {
      const am = tag.match(re);
      if (!am?.[1]) continue;
      let val = am[1].trim();
      if (/srcset/i.test(re.source)) {
        const first = val.split(',')[0]?.trim()?.split(/\s+/)?.[0];
        val = first || val;
      }
      if (val && !val.startsWith('data:')) out.push(val);
      break;
    }
  }
  return out;
}

function walkMediaNodes(node, out) {
  if (node == null) return;
  if (Array.isArray(node)) {
    for (const x of node) walkMediaNodes(x, out);
    return;
  }
  if (typeof node !== 'object') return;

  const dollar = node.$;
  const url = dollar?.url || node.url;
  if (url && typeof url === 'string') {
    const medium = (dollar?.medium || '').toLowerCase();
    const type = (dollar?.type || '').toLowerCase();
    const isVideo = medium === 'video' || type.startsWith('video/');
    if (isVideo && !looksLikeImageUrl(url)) {
      /* skip video files; keep poster-style URLs */
    } else if (medium === 'image' || type.startsWith('image/') || looksLikeImageUrl(url) || probablyRasterImageUrl(url)) {
      out.push(url);
    }
  }

  for (const k of Object.keys(node)) {
    if (k === '$' || k === '_') continue;
    walkMediaNodes(node[k], out);
  }
}

function normalizeEnclosures(item) {
  const e = item.enclosure;
  if (!e) return [];
  return Array.isArray(e) ? e : [e];
}

function collectMediaUrls(item) {
  const out = [];
  const push = (u) => {
    const x = toCleanString(u);
    if (x) out.push(x);
  };

  for (const enc of normalizeEnclosures(item)) {
    if (!enc?.url) continue;
    const type = (enc.type || '').toLowerCase();
    if (type.startsWith('image/') || !type || looksLikeImageUrl(enc.url) || probablyRasterImageUrl(enc.url)) {
      if (!type.startsWith('audio/') && !type.startsWith('video/')) push(enc.url);
    }
  }

  const thumbBlocks = [item['media:thumbnail'], item.mediaThumbnail].filter(Boolean).flatMap((t) =>
    Array.isArray(t) ? t : [t],
  );
  for (const t of thumbBlocks) {
    push(t?.$?.url || t?.url);
  }

  const contentBlocks = [item['media:content'], item.mediaContent].filter(Boolean).flatMap((t) =>
    Array.isArray(t) ? t : [t],
  );
  for (const c of contentBlocks) {
    const medium = (c?.$?.medium || '').toLowerCase();
    const type = (c?.$?.type || '').toLowerCase();
    const url = c?.$?.url || c?.url;
    if (!url) continue;
    const isVideo = medium === 'video' || type.startsWith('video/');
    if (isVideo && !looksLikeImageUrl(url)) continue;
    if (medium === 'image' || type.startsWith('image/') || looksLikeImageUrl(url) || probablyRasterImageUrl(url)) {
      push(url);
    }
  }

  const groupBlocks = [item['media:group'], item.mediaGroup].filter(Boolean).flatMap((g) =>
    Array.isArray(g) ? g : [g],
  );
  const fromGroups = [];
  for (const g of groupBlocks) walkMediaNodes(g, fromGroups);
  for (const u of fromGroups) push(u);

  const itunesBlocks = [item['itunes:image'], item.itunesImage].filter(Boolean).flatMap((t) =>
    Array.isArray(t) ? t : [t],
  );
  for (const t of itunesBlocks) {
    push(t?.$?.href || t?.href || t?.$?.url);
  }

  if (item.image?.url) push(item.image.url);
  if (item.image?.link) push(item.image.link);

  const jsonImage = item.image;
  if (typeof jsonImage === 'string' && jsonImage.trim()) push(jsonImage);

  const banner = item.banner_image;
  if (banner) push(typeof banner === 'string' ? banner : banner?.url);

  return out;
}

function pickImageFromStructuredAndHtml(item, rawHtmlParts, articleLink) {
  for (const u of collectMediaUrls(item)) {
    const abs = absolutizeImageUrl(u, articleLink);
    if (abs) return abs;
  }

  for (const html of rawHtmlParts) {
    for (const raw of extractImageUrlsFromHtml(String(html))) {
      const abs = absolutizeImageUrl(raw, articleLink);
      if (abs && !isLikelyBadHeroImage(abs)) return abs;
    }
  }

  return null;
}

function extractOgImageFromHtml(html) {
  if (!html || typeof html !== 'string') return null;
  const patterns = [
    /<meta[^>]+property\s*=\s*["']og:image:url["'][^>]*content\s*=\s*["']([^"']+)["']/i,
    /<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:image:url["']/i,
    /<meta[^>]+property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/i,
    /<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:image["']/i,
    /<meta[^>]+name\s*=\s*["']twitter:image:src["'][^>]*content\s*=\s*["']([^"']+)["']/i,
    /<meta[^>]+name\s*=\s*["']twitter:image["'][^>]*content\s*=\s*["']([^"']+)["']/i,
    /<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']twitter:image["']/i,
    /<link[^>]+rel\s*=\s*["']image_src["'][^>]*href\s*=\s*["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      const u = m[1].trim().replace(/&amp;/g, '&');
      if (u && !u.startsWith('data:')) return u;
    }
  }
  return null;
}

async function readHtmlPrefixForMeta(response, maxBytes) {
  const reader = response.body?.getReader?.();
  if (!reader) {
    const t = await response.text();
    return t.slice(0, maxBytes);
  }
  const dec = new TextDecoder();
  let buf = '';
  try {
    while (buf.length < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      if (/<\/head>/i.test(buf)) break;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* ignore */
    }
  }
  return buf.slice(0, maxBytes);
}

function shouldAttemptOgFetch(link) {
  const L = toCleanString(link);
  if (!/^https?:\/\//i.test(L)) return false;
  try {
    const h = new URL(L).hostname.toLowerCase();
    if (h === 'news.google.com' || h.endsWith('.news.google.com')) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Last resort: og:image / twitter:image from the article HTML (feeds often omit media).
 */
export async function fetchLeadImageFromArticlePage(articleUrl, timeoutMs = 3200) {
  const url = toCleanString(articleUrl);
  if (!shouldAttemptOgFetch(url)) return null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (compatible; PolicyDriftBot/1.0; +https://policydrift.local) AppleWebKit/537.36',
      },
    });
    if (!res.ok) return null;
    const html = await readHtmlPrefixForMeta(res, 98304);
    const raw = extractOgImageFromHtml(html);
    if (!raw) return null;
    const abs = absolutizeImageUrl(raw, url);
    if (!abs || isLikelyBadHeroImage(abs)) return null;
    return abs;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function backfillImagesFromArticlePages(rows) {
  if (!env.RSS_FETCH_OG_IMAGE) return rows;

  const timeoutMs = Math.min(Math.max(env.RSS_IMAGE_OG_TIMEOUT_MS || 3200, 800), 15000);
  const concurrency = Math.min(Math.max(env.RSS_IMAGE_OG_CONCURRENCY || 6, 1), 20);

  const need = rows.filter((r) => !r.image && shouldAttemptOgFetch(r.link));
  if (!need.length) return rows;

  const resolved = new Map();
  for (let i = 0; i < need.length; i += concurrency) {
    const chunk = need.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (row) => {
        const img = await fetchLeadImageFromArticlePage(row.link, timeoutMs);
        if (img) resolved.set(row.link, img);
      }),
    );
  }

  return rows.map((r) => (r.image ? r : { ...r, image: resolved.get(r.link) || null }));
}

function pickCategory(item) {
  const cats = item.categories || item.category;
  if (Array.isArray(cats) && cats[0]) return toCleanString(cats[0]).slice(0, 128) || 'General';
  if (typeof cats === 'string' && cats) return toCleanString(cats).slice(0, 128) || 'General';
  return 'General';
}

/**
 * @param {string} feedUrl
 * @param {string | null} feedCategory — from rss-feeds.js; overrides RSS item categories
 */
export async function fetchFeedItems(feedUrl, feedCategory = null) {
  const feed = await parser.parseURL(feedUrl);
  const items = feed.items || [];
  const cat =
    feedCategory && String(feedCategory).trim()
      ? String(feedCategory).trim().slice(0, 128)
      : null;

  const mapped = items
    .map((i) => {
      const title = toCleanString(i.title);
      const link = toCleanString(i.link);
      const rawParts = [
        i['content:encoded'],
        i.content,
        i.description,
        i.summary,
        i['content:encodedSnippet'],
        i.contentSnippet,
      ].filter(Boolean);
      const content = toCleanString(rawParts.join('\n') || i.content || i.summary || i.description || '');
      const image = pickImageFromStructuredAndHtml(i, rawParts.map(String), link);
      return {
        title,
        link,
        content,
        pubDate: i.pubDate ? new Date(i.pubDate) : new Date(),
        category: cat || pickCategory(i),
        image,
        feedUrl: toCleanString(feedUrl),
      };
    })
    .filter((i) => i.title && i.link);

  return backfillImagesFromArticlePages(mapped);
}

/** @param {{ url: string, category: string }[]} entries */
export async function fetchAllFeedEntries(entries) {
  const all = [];
  for (const { url, category } of entries) {
    try {
      const items = await fetchFeedItems(url, category);
      all.push(...items);
    } catch (e) {
      console.error(`RSS fetch failed for ${url}:`, e.message);
    }
  }
  return all;
}

/** @deprecated use fetchAllFeedEntries */
export async function fetchAllFeeds(urls) {
  const entries = urls.map((url) => ({ url, category: 'General' }));
  return fetchAllFeedEntries(entries);
}
