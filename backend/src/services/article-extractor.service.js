/**
 * NewsFree365 — Full Article Extraction Service
 *
 * Fetches original article URLs, cleans DOM trees, and uses @mozilla/readability
 * & JSDOM to extract the main readable content, author, dates, and images.
 *
 * Falls back gracefully when articles are behind paywalls, bot challenges,
 * or when network errors occur.
 */

import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { env } from '../config/env.js';
import { toCleanString } from '../utils/string.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 NewsFree365/1.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
];

/**
 * Selectors for known paywalls, subscription barriers, ads, offers, and tracker widgets.
 */
export const AD_AND_PAYWALL_SELECTORS = [
  // Paywalls, barriers & gates
  '[id*="barrier"]', '[class*="barrier"]', '[data-ft-origin*="barrier"]',
  '[id*="paywall"]', '[class*="paywall"]', '[data-component*="paywall"]',
  '[id*="regwall"]', '[class*="regwall"]', '[data-component*="regwall"]',
  '[data-component*="heroOffer"]', '[data-component*="recommendedOffers"]',
  '[class*="gate-content"]', '[class*="subscription-wall"]',
  // Subscriptions & offers
  '[class*="subscribe-"]', '[class*="subscription-"]', '[id*="subscribe"]',
  '[class*="membership"]', '[class*="pricing-table"]', '[class*="plan-card"]',
  // Ads & Commercial
  '[class*="advertisement"]', '[class*="ad-container"]', '[class*="ad-wrapper"]',
  '[id*="google_ads"]', '[class*="dfp-ad"]', '[class*="adbox"]', '[class*="ad-slot"]',
  '[class*="ad-banner"]', '[id*="ad-slot"]', '[class*="outbrain"]', '[class*="taboola"]',
  '[id*="taboola"]', '[id*="outbrain"]', '[class*="promoted-content"]',
  '[data-ad]', '[data-ad-unit]', 'ins.adsbygoogle', 'aside.ad',
  // Non-article noise
  'header', 'footer', 'nav', 'form', '.social-share', '.share-bar',
  '.newsletter-signup', '.newsletter-box', '.related-stories', '.recommended-stories',
  '.comments', '#comments'
];

/**
 * Common phrases indicating subscription paywalls, barriers, or ad traps.
 */
export const PAYWALL_SIGNATURES = [
  /subscribe to unlock/i,
  /try unlimited access/i,
  /complete digital access to/i,
  /standard digital|premium digital/i,
  /cancel anytime during your trial/i,
  /only rs\.?\s*\d+|only \$\s*\d+/i,
  /already a subscriber\? sign in/i,
  /sign in to continue reading/i,
  /to continue reading,? (please )?subscribe/i,
  /start your (free )?trial/i,
  /this article is for subscribers only/i,
  /exclusive to subscribers/i,
  /you have reached your (free )?article limit/i,
  /subscribe now to read the full/i,
  /become a member to continue/i,
  /support (our|independent) journalism/i,
  /support quality journalism/i,
  /explore more offers/i,
  /barrier-page/i,
];

/**
 * Domains with hard paywalls where full scraping yields only subscription offers.
 */
export const HARD_PAYWALL_DOMAINS = [
  'ft.com',
  'wsj.com',
  'barrons.com',
  'thetimes.co.uk',
  'telegraph.co.uk',
  'economist.com',
  'bloomberg.com',
];

export function isHardPaywallDomain(url) {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return HARD_PAYWALL_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

export function isPaywallOrAdText(text) {
  if (!text || typeof text !== 'string') return false;
  for (const sig of PAYWALL_SIGNATURES) {
    if (sig.test(text)) return true;
  }
  return false;
}

export function isAdOrBarrierImage(src) {
  if (!src || typeof src !== 'string') return true;
  const s = src.toLowerCase();
  return (
    s.includes('barrier') ||
    s.includes('paywall') ||
    s.includes('subscribe') ||
    s.includes('pricing') ||
    s.includes('advertisement') ||
    s.includes('ad-') ||
    s.includes('/ads/') ||
    s.includes('sponsor') ||
    s.includes('promo') ||
    s.includes('app-store') ||
    s.includes('google-play') ||
    s.includes('apple-store') ||
    s.includes('1x1') ||
    s.includes('pixel') ||
    s.includes('tracker') ||
    s.includes('badge') ||
    s.includes('icon') ||
    s.includes('logo') ||
    s.includes('avatar')
  );
}

/**
 * Removes ad, banner, and paywall nodes from JSDOM document before readability parsing.
 */
function cleanDocumentDom(doc) {
  for (const selector of AD_AND_PAYWALL_SELECTORS) {
    try {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((el) => el.remove());
    } catch {
      // Ignore selector syntax issues
    }
  }
}

/**
 * Strips script tags, style sheets, trackers, and ad widgets from HTML string.
 */
function sanitizeRawHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
}

/**
 * Extracts meta property or name from JSDOM Document.
 */
function getMetaTag(doc, names) {
  for (const name of names) {
    const el =
      doc.querySelector(`meta[property="${name}"]`) ||
      doc.querySelector(`meta[name="${name}"]`) ||
      doc.querySelector(`meta[itemprop="${name}"]`);
    const content = el?.getAttribute('content')?.trim();
    if (content) return content;
  }
  return null;
}

/**
 * Extracts canonical URL from JSDOM Document.
 */
function getCanonicalUrl(doc, originalUrl) {
  const link = doc.querySelector('link[rel="canonical"]');
  const href = link?.getAttribute('href')?.trim();
  if (!href) return originalUrl;
  try {
    return new URL(href, originalUrl).href;
  } catch {
    return originalUrl;
  }
}

/**
 * Attempts to parse publication date from document meta tags.
 */
function extractPublishedDate(doc) {
  const raw = getMetaTag(doc, [
    'article:published_time',
    'og:article:published_time',
    'publication_date',
    'datePublished',
    'date',
    'parsely-pub-date',
    'sailthru.date',
  ]);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Attempts to find lead images from OpenGraph or article body.
 */
function extractImages(doc, articleContentHtml, articleUrl) {
  const images = [];

  // 1. Check og:image, twitter:image
  const ogImg = getMetaTag(doc, ['og:image', 'og:image:url', 'twitter:image', 'twitter:image:src']);
  if (ogImg && !isAdOrBarrierImage(ogImg)) {
    try {
      images.push(new URL(ogImg, articleUrl).href);
    } catch {
      images.push(ogImg);
    }
  }

  // 2. Check <img> tags inside article content
  if (articleContentHtml) {
    const imgRegex = /<img\b[^>]+src=["']([^"']+)["']/gi;
    let m;
    while ((m = imgRegex.exec(articleContentHtml)) !== null) {
      const src = m[1]?.trim();
      if (src && !src.startsWith('data:') && !isAdOrBarrierImage(src)) {
        try {
          const abs = new URL(src, articleUrl).href;
          if (!images.includes(abs)) images.push(abs);
        } catch {
          if (!images.includes(src)) images.push(src);
        }
      }
    }
  }

  return images;
}

/**
 * Extracts the full readable article from an article URL.
 *
 * @param {string} url - Target URL
 * @param {{ timeoutMs?: number, maxRetries?: number }} [options]
 * @returns {Promise<{
 *   success: boolean,
 *   title?: string,
 *   author?: string | null,
 *   publishedAt?: Date | null,
 *   content?: string,
 *   textContent?: string,
 *   excerpt?: string,
 *   images?: string[],
 *   leadImage?: string | null,
 *   canonicalUrl?: string,
 *   error?: string
 * }>}
 */
/**
 * Parses raw HTML string and extracts article content using Readability and JSDOM.
 */
export function extractArticleFromHtml(rawHtml, targetUrl = 'http://localhost') {
  try {
    const cleanHtml = sanitizeRawHtml(rawHtml);
    const dom = new JSDOM(cleanHtml, { url: targetUrl });
    const doc = dom.window.document;

    // Clean DOM of paywall barriers, ad units, and offer boxes before parsing
    cleanDocumentDom(doc);

    // Extract metadata
    const canonicalUrl = getCanonicalUrl(doc, targetUrl);
    const metaAuthor =
      getMetaTag(doc, ['author', 'article:author', 'twitter:creator', 'byl']) || null;
    const metaPublishedAt = extractPublishedDate(doc);

    // Parse with @mozilla/readability
    const reader = new Readability(doc, {
      charThreshold: 60,
      keepClasses: false,
    });
    const parsed = reader.parse();

    if (!parsed || !parsed.content || parsed.textContent.trim().length < 80) {
      return {
        success: false,
        extraction_status: 'failed',
        content: null,
        error: 'Readability returned insufficient content or failed to isolate main text',
      };
    }

    // Check for paywall or subscription advertisement barrier text
    if (isPaywallOrAdText(parsed.textContent) || isPaywallOrAdText(parsed.content)) {
      return {
        success: false,
        extraction_status: 'failed',
        content: null,
        error: 'Paywall or subscription advertisement barrier detected',
      };
    }

    const images = extractImages(doc, parsed.content, targetUrl);
    const leadImage = images[0] || null;

    return {
      success: true,
      extraction_status: 'full',
      title: toCleanString(parsed.title),
      author: metaAuthor ? toCleanString(metaAuthor) : (parsed.byline ? toCleanString(parsed.byline) : null),
      publishedAt: metaPublishedAt,
      content: parsed.content,
      textContent: parsed.textContent.trim(),
      excerpt: toCleanString(parsed.excerpt) || parsed.textContent.trim().slice(0, 220),
      images,
      leadImage,
      canonical_url: canonicalUrl,
      canonicalUrl,
    };
  } catch (err) {
    return {
      success: false,
      extraction_status: 'failed',
      content: null,
      error: err.message,
    };
  }
}

/**
 * Fetches the full article web page from a URL and extracts readable content.
 */
export async function extractArticle(url, options = {}) {
  const targetUrl = toCleanString(url);
  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    return { success: false, error: 'Invalid URL format' };
  }

  // Hard paywalled sites (e.g. FT, WSJ, Bloomberg) never provide full articles for scraping
  if (isHardPaywallDomain(targetUrl)) {
    console.log(`[ARTICLE] Skipping full extraction for known hard-paywall domain: ${targetUrl}`);
    return {
      success: false,
      extraction_status: 'failed',
      error: 'Known hard-paywall domain (bypassed to avoid subscription ad barriers)',
    };
  }

  const timeoutMs = options.timeoutMs || env.RSS_REQUEST_TIMEOUT || 15000;
  const maxRetries = options.maxRetries ?? env.RSS_MAX_RETRIES ?? 2;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[ARTICLE] (${attempt}/${maxRetries}) Fetching: ${targetUrl}`);

      const userAgent = USER_AGENTS[(attempt - 1) % USER_AGENTS.length];
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow',
        signal: controller.signal,
      });

      if (!res.ok) {
        const status = res.status;
        if (status === 401 || status === 403) {
          throw new Error(`HTTP ${status} Forbidden/Unauthorized (Paywall or Bot Protection)`);
        }
        if (status === 404) {
          throw new Error(`HTTP 404 Not Found`);
        }
        if (status === 429) {
          throw new Error(`HTTP 429 Rate Limit Exceeded`);
        }
        throw new Error(`HTTP ${status} ${res.statusText}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('html') && !contentType.includes('xml')) {
        throw new Error(`Unsupported Content-Type: ${contentType}`);
      }

      const rawHtml = await res.text();
      clearTimeout(timer);

      const parsed = extractArticleFromHtml(rawHtml, targetUrl);
      if (!parsed.success) {
        throw new Error(parsed.error);
      }

      console.log(`[ARTICLE] Extraction successful for "${parsed.title || targetUrl}" (${parsed.textContent.length} chars)`);
      return parsed;
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
      lastError = isAbort ? `Request timeout after ${timeoutMs}ms` : err.message;
      console.warn(`[ARTICLE] (${attempt}/${maxRetries}) Failed for ${targetUrl}: ${lastError}`);

      // If permanent 404 or paywall, don't retry repeatedly
      if (lastError.includes('404') || lastError.includes('401') || lastError.includes('403')) {
        break;
      }

      if (attempt < maxRetries) {
        // Backoff: 500ms, 1000ms...
        await new Promise((r) => setTimeout(r, attempt * 500));
      }
    }
  }

  console.log(`[ARTICLE] Extraction failed for ${targetUrl}: ${lastError}`);
  return {
    success: false,
    error: lastError || 'Unknown extraction failure',
  };
}

export const extractArticleFromUrl = extractArticle;

