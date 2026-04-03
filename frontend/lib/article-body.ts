import he from 'he';
import { curatorBioShort, curatorName, curatorRole } from '@/lib/site-trust';
import { decodeHtmlEntities, sanitizeArticleHtml, stripHtmlToPlain } from '@/lib/sanitize';

function parseBaseUrl(originalUrl: string): URL | null {
  const u = originalUrl?.trim();
  if (!u) return null;
  try {
    return new URL(u);
  } catch {
    return null;
  }
}

function resolveOneUrl(raw: string, base: URL): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^(https?:|data:|mailto:|tel:)/i.test(t)) return t;
  if (/^(javascript|vbscript):/i.test(t)) return t;
  if (t.startsWith('#')) return t;
  try {
    return new URL(t, base.href).href;
  } catch {
    return t;
  }
}

function resolveSrcsetValue(srcset: string, base: URL): string {
  return srcset
    .split(',')
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return trimmed;
      const spaceIdx = trimmed.search(/\s+/);
      const urlPart = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
      const desc = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx);
      return `${resolveOneUrl(urlPart, base)}${desc}`;
    })
    .join(', ');
}

/**
 * RSS HTML often uses publisher-relative `src` / `srcset` / lazy-load attrs. Resolve against the story URL
 * so images and links load correctly on our domain.
 */
export function resolveFeedResourceUrls(html: string, originalUrl: string): string {
  if (!html?.trim() || !originalUrl?.trim()) return html || '';
  const base = parseBaseUrl(originalUrl);
  if (!base) return html;

  const urlAttrs = ['src', 'href', 'data-src', 'data-lazy-src', 'data-original', 'poster'] as const;
  let out = html;
  for (const attr of urlAttrs) {
    const re = new RegExp(`\\b${attr}\\s*=\\s*(["'])([^"']*)\\1`, 'gi');
    out = out.replace(re, (full, q: string, val: string) => `${attr}=${q}${resolveOneUrl(val, base)}${q}`);
  }
  const setAttrs = ['srcset', 'data-srcset'] as const;
  for (const attr of setAttrs) {
    const re = new RegExp(`\\b${attr}\\s*=\\s*(["'])([^"']*)\\1`, 'gi');
    out = out.replace(re, (full, q: string, val: string) => `${attr}=${q}${resolveSrcsetValue(val, base)}${q}`);
  }
  return out;
}

function isVisiblyEmptyHtml(html: string): boolean {
  return html.replace(/\s|&nbsp;/gi, '').length === 0;
}

/** When markup is stripped entirely, show escaped plain text so the article is not blank. */
function plainFallbackToSafeHtml(plain: string): string {
  const t = plain.trim();
  if (!t) return '';
  const paras = t.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (!paras.length) return `<p>${he.encode(plain.slice(0, 80000))}</p>`;
  return paras.map((p) => `<p>${he.encode(p.replace(/\n+/g, ' '))}</p>`).join('\n');
}

export type PreparedArticleBody = { html: string; hasContent: boolean };

/**
 * Align display with backend `body`: resolve feed-relative URLs, sanitize, then plain fallback if needed.
 */
export function prepareArticleBodyForDisplay(
  rawBody: string | null | undefined,
  originalUrl: string,
  /** Used to label inline images that lack alt/title in the feed. */
  articleTitle?: string | null,
): PreparedArticleBody {
  const raw = rawBody == null ? '' : String(rawBody);
  const resolved = resolveFeedResourceUrls(raw, originalUrl);
  const titleForImages = decodeHtmlEntities(articleTitle?.trim() || '').trim() || undefined;
  let html = sanitizeArticleHtml(resolved, { articleTitle: titleForImages });

  if (isVisiblyEmptyHtml(html)) {
    const plain = stripHtmlToPlain(raw);
    if (plain.length > 0) {
      html = sanitizeArticleHtml(plainFallbackToSafeHtml(plain), { articleTitle: titleForImages });
    }
  }

  return {
    html,
    hasContent: !isVisiblyEmptyHtml(html),
  };
}

/**
 * Plain text mirroring the article page (title, excerpt, curator, key takeaways, full body as rendered).
 * Used for JSON-LD `articleBody`, uncapped length so search engines see the same substance as readers.
 */
export function buildNewsArticleBodyForSchema(params: {
  title: string;
  excerpt: string | null | undefined;
  articleHtml: string;
  hasArticleBody: boolean;
  keyTakeawaysRaw: string | null | undefined;
}): string {
  const blocks: string[] = [];

  const head = decodeHtmlEntities(params.title).trim();
  if (head) blocks.push(head);

  const ex = params.excerpt?.trim();
  if (ex) blocks.push(decodeHtmlEntities(ex).trim());

  blocks.push(
    `Curated by ${curatorName()}. ${curatorRole()}. ${curatorBioShort()}`,
  );

  const kt = params.keyTakeawaysRaw?.trim();
  if (kt) {
    const lines = kt
      .split(/\n+/)
      .map((l) => decodeHtmlEntities(l.trim()))
      .filter(Boolean);
    if (lines.length) {
      blocks.push(['Key takeaways:', ...lines.map((l) => `• ${l}`)].join('\n'));
    }
  }

  if (params.hasArticleBody) {
    const bodyPlain = stripHtmlToPlain(params.articleHtml, Number.POSITIVE_INFINITY).trim();
    if (bodyPlain) blocks.push(bodyPlain);
  } else {
    blocks.push(
      'No article text in this feed item. Open the publisher link on this page for the full story from the source.',
    );
  }

  return blocks.join('\n\n').trim();
}
