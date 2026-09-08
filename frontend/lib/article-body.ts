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

function normalizeComparableText(s: string): string {
  return decodeHtmlEntities(s)
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:#\d+|#x[\da-fA-F]+|\w+);/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * True when the article body is the same (or nearly the same) as the deck/excerpt —
 * common for thin RSS items. Avoids showing the blurb twice on the article page.
 */
export function isBodyRedundantWithExcerpt(
  articleHtml: string,
  excerpt: string | null | undefined,
): boolean {
  const ex = normalizeComparableText(excerpt || '');
  if (!ex || ex.length < 24) return false;
  const body = normalizeComparableText(stripHtmlToPlain(articleHtml, Number.POSITIVE_INFINITY));
  if (!body) return true;
  if (body === ex) return true;
  // Body is only the excerpt wrapped / truncated
  if (body.startsWith(ex) && body.length <= ex.length + 40) return true;
  if (ex.startsWith(body) && ex.length <= body.length + 40) return true;
  // High overlap for short bodies (single-paragraph feeds)
  if (body.length <= 400 && (body.includes(ex) || ex.includes(body))) return true;
  return false;
}

function splitIntoEditorialParagraphs(text: string): string[] {
  if (!text) return [];

  // Protect all HTML tags so sentence splitting NEVER cuts inside <a href="..."> or other tags
  const htmlTokens: string[] = [];
  let protectedText = text.replace(/<[^>]+>/g, (match) => {
    htmlTokens.push(match);
    return `___HTML_TAG_${htmlTokens.length - 1}___`;
  });

  // Protect full URLs e.g. https://... or http://...
  const urlTokens: string[] = [];
  protectedText = protectedText.replace(/https?:\/\/[^\s"'<>]+/gi, (match) => {
    urlTokens.push(match);
    return `___URL_TOKEN_${urlTokens.length - 1}___`;
  });

  // Protect domain names with dots e.g. foxnews.com, reuters.com
  const domainTokens: string[] = [];
  protectedText = protectedText.replace(/\b[a-zA-Z0-9-]+\.(?:com|org|net|gov|edu|io|co|in|uk|ai|live|tv|me)\b/gi, (match) => {
    domainTokens.push(match);
    return `___DOMAIN_TOKEN_${domainTokens.length - 1}___`;
  });

  // Protect decimals in numbers e.g. 3.5 or 115,000.50
  protectedText = protectedText.replace(/(\d)\.(\d)/g, '$1_DECIMAL_DOT_$2');

  // Protect common abbreviations from sentence splitting
  protectedText = protectedText
    .replace(/\bU\.S\.A\./g, 'U_S_A_DOT')
    .replace(/\bU\.S\./g, 'U_S_DOT')
    .replace(/\be\.g\./g, 'E_G_DOT')
    .replace(/\bi\.e\./g, 'I_E_DOT')
    .replace(/\b([A-Z])\./g, '$1_DOT')
    .replace(
      /\b(Mr|Mrs|Ms|Dr|Prof|Gov|Sen|Rep|Gen|Col|Lt|Capt|Rev|Hon|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\./g,
      '$1_ABBR_DOT',
    );

  // Match sentence endings: . or ? or ! followed by space and capital letter or quote
  const sentenceRegex = /[^.!?]+[.!?]+(?:["'”’\s]+|$)|[^.!?]+$/g;
  const rawSentences = protectedText.match(sentenceRegex) || [protectedText];

  const sentences = rawSentences
    .map((s) =>
      s
        .replace(/_DECIMAL_DOT_/g, '.')
        .replace(/U_S_A_DOT/g, 'U.S.A.')
        .replace(/U_S_DOT/g, 'U.S.')
        .replace(/E_G_DOT/g, 'e.g.')
        .replace(/I_E_DOT/g, 'i.e.')
        .replace(/([A-Z])_DOT/g, '$1.')
        .replace(/([A-Za-z]+)_ABBR_DOT/g, '$1.')
        .replace(/___DOMAIN_TOKEN_(\d+)___/g, (_, i) => domainTokens[Number(i)] || '')
        .replace(/___URL_TOKEN_(\d+)___/g, (_, i) => urlTokens[Number(i)] || '')
        .replace(/___HTML_TAG_(\d+)___/g, (_, i) => htmlTokens[Number(i)] || '')
        .trim(),
    )
    .filter(Boolean);

  const paragraphs: string[] = [];
  let currentPara = '';

  for (const sentence of sentences) {
    currentPara += (currentPara ? ' ' : '') + sentence;
    if (currentPara.length >= 450) {
      paragraphs.push(currentPara.trim());
      currentPara = '';
    }
  }
  if (currentPara.trim()) {
    paragraphs.push(currentPara.trim());
  }

  return paragraphs;
}

/**
 * Formats and beautifies article HTML:
 * 1. Resolves HTML entities (&quot;, &#039;, &amp;, &nbsp;) so they never display as raw code.
 * 2. Cleans glued sentences caused by feed exporters (e.g. "month.Friday" -> "month. Friday").
 * 3. Formats promotional inline links like "Also read | ..." into elegant aside callouts.
 * 4. Breaks single giant walls of unformatted text into well-spaced editorial paragraphs.
 * 5. Cleans any leaked/dangling HTML attributes like 'rel="noopener noreferrer" target="_blank">'.
 */
export function formatAndBeautifyArticleBody(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  // 1. Decode entities so &quot;, &#039;, &amp;, &nbsp; are real characters
  let text = he.decode(rawHtml);

  // 2. Remove invisible zero-width spaces/joiners
  text = text.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');

  // 3. Clean any orphaned / broken trailing HTML attributes leaked into text, e.g.:
  //    'example.com" rel="noopener noreferrer" target="_blank">'
  //    or 'rel="noopener noreferrer" target="_blank">'
  text = text.replace(/(?:[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s"'>]*["'])?\s*(?:rel=["'][^"']*["']|target=["'][^"']*["']|href=["'][^"']*["'])+\s*>/gi, '');

  // 4. Fix glued sentences where period/question/exclamation is immediately followed by a capital letter or quote
  // (Skip if period is part of a tag or link)
  text = text.replace(/([a-z0-9”"'\)])\.([A-Z“"'])/g, '$1. $2');
  text = text.replace(/([?!])([A-Z“"'])/g, '$1 $2');

  // 5. Format promotional inline markers like "Also read | ..." or "Also Read: ..." into styled callouts
  text = text.replace(
    /(?:^|\s)(Also\s+read\s*[:|]\s*[^.\n<]+(?:as|on|in|to|for|at|with|by|from)?\s*[^.\n<]*)(?:\.|\s+|$)(?=[A-Z])/gi,
    '\n\n<aside class="article-related-callout"><strong>Related Coverage:</strong> $1</aside>\n\n',
  );

  // 6. Format section subheadings in uppercase quotes e.g. 'CLUELESS' OR 'SOCK PUPPET'?
  text = text.replace(
    /(?:^|\s)([‘'"][A-Z\s]{4,}[’'"]\??)(?:\s+|$)(?=[A-Z])/g,
    '\n\n<h3 class="article-section-subhead">$1</h3>\n\n',
  );

  // 7. Split by existing HTML blocks or line breaks
  const segments = text
    .split(/(?:<\/p>\s*<p[^>]*>|\n\s*\n+)/i)
    .map((s) => s.replace(/<\/?p[^>]*>/gi, '').trim())
    .filter(Boolean);

  const formattedBlocks: string[] = [];
  // If the article already has multiple distinct paragraphs (> 2), respect the publisher's paragraph breaks!
  const hasExistingParagraphStructure = segments.length > 2;

  for (const seg of segments) {
    if (/^<(aside|h[1-6]|blockquote|div|section|ul|ol|figure|table)/i.test(seg)) {
      formattedBlocks.push(seg);
      continue;
    }

    // Only segment giant unformatted walls of text when no paragraph structure existed
    if (!hasExistingParagraphStructure && seg.length > 600) {
      const paras = splitIntoEditorialParagraphs(seg);
      for (const p of paras) {
        formattedBlocks.push(`<p>${p}</p>`);
      }
    } else {
      formattedBlocks.push(`<p>${seg}</p>`);
    }
  }

  return formattedBlocks.join('\n\n');
}

/**
 * Checks whether an article body is authentic markdown (created in the admin rich editor)
 * versus syndicated HTML from news feeds.
 */
export function isMarkdownStory(body: string | null | undefined): boolean {
  if (!body) return false;
  const t = body.trim();
  // If it starts with an HTML tag or contains HTML structure, it is HTML, not raw markdown
  if (/^<[a-z][\s\S]*>/i.test(t)) return false;
  if (t.includes('</p>') || t.includes('</div>') || t.includes('<br') || t.includes('</article>')) return false;
  // Markdown indicators
  return (
    t.includes('## ') ||
    t.includes('### ') ||
    t.includes('> [!') ||
    /(?:^|\n)\s*[-*]\s+\*\*/.test(t) ||
    /\n\s*\|[^\n]+\|\s*\n\s*\|[\s\-:|]+\|/.test(t)
  );
}

/**
 * Align display with backend `body`: resolve feed-relative URLs, format & beautify, sanitize, then plain fallback if needed.
 */
export function prepareArticleBodyForDisplay(
  rawBody: string | null | undefined,
  originalUrl: string,
  /** Used to label inline images that lack alt/title in the feed. */
  articleTitle?: string | null,
): PreparedArticleBody {
  const raw = rawBody == null ? '' : String(rawBody);
  const formatted = formatAndBeautifyArticleBody(raw);
  const resolved = resolveFeedResourceUrls(formatted, originalUrl);
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

export type GoogleNewsItem = {
  title: string;
  url: string;
  source: string;
};

/**
 * Checks whether an HTML string is a Google News syndicated RSS feed snippet.
 */
export function isGoogleNewsFeed(html: string | null | undefined): boolean {
  if (!html || typeof html !== 'string') return false;
  return (
    /<ol[^>]*>[\s\S]*?<li/i.test(html) &&
    (/news\.google\.com/i.test(html) || /<font[^>]*color=["']?#6f6f6f/i.test(html) || /target=["']_blank["']/i.test(html))
  );
}

/**
 * Parses Google News aggregated RSS `<ol><li><a href="...">Title</a>&nbsp;&nbsp;<font color="#6f6f6f">Source</font></li>...</ol>`
 * into structured items with clean titles, direct source links, and publisher names.
 */
export function parseGoogleNewsItems(html: string | null | undefined): GoogleNewsItem[] {
  if (!html || typeof html !== 'string') return [];
  const decoded = he.decode(html);

  if (!/<li[^>]*>[\s\S]*?<a/i.test(decoded)) return [];

  const items: GoogleNewsItem[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;

  while ((match = liRegex.exec(decoded)) !== null) {
    const liContent = match[1];
    const aMatch = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i.exec(liContent);
    if (!aMatch) continue;

    const url = aMatch[1].trim();
    const rawTitle = aMatch[2].replace(/<[^>]+>/g, '').trim();
    const title = decodeHtmlEntities(rawTitle).trim();

    let source = '';
    const fontMatch = /<font[^>]*>([\s\S]*?)<\/font>/i.exec(liContent);
    if (fontMatch) {
      source = decodeHtmlEntities(fontMatch[1].replace(/<[^>]+>/g, '')).trim();
    } else {
      const remaining = liContent.slice(aMatch.index + aMatch[0].length);
      const strippedRem = decodeHtmlEntities(remaining.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '')).trim();
      source = strippedRem.replace(/^[-–—|•\s]+/, '').trim();
    }

    if (title) {
      items.push({
        title,
        url,
        source: source || 'Verified News Source',
      });
    }
  }

  return items;
}

/**
 * Normalizes excerpts across cards, carousels, and article decks:
 * 1. Decodes HTML entities and strips all raw HTML tags (`<ol>`, `<li>`, `<a href...>`, `<font>`).
 * 2. If given a Google News aggregated excerpt or feed, extracts only the primary concise headline/sentence.
 * 3. Removes common RSS junk like "Continue reading...", trailing ellipses cutoffs, and run-on multi-source lists.
 */
export function cleanDisplayExcerpt(
  rawExcerpt?: string | null,
  fallbackTitle?: string | null,
  maxLen: number = 240,
): string {
  if (!rawExcerpt && !fallbackTitle) return '';
  let text = decodeHtmlEntities(rawExcerpt || '').trim();

  // 1. If it contains Google News markup or items, parse out the primary headline
  if (/<ol[^>]*>[\s\S]*?<li/i.test(text) || /news\.google\.com\/rss\/articles/i.test(text)) {
    const parsed = parseGoogleNewsItems(text);
    if (parsed.length > 0 && parsed[0].title) {
      text = parsed[0].title;
    }
  }

  // 2. Strip any remaining HTML tags (e.g. <a href...>, <p>, <font>, etc.)
  text = text.replace(/<[^>]+>/g, ' ');

  // 3. Remove boilerplate phrases
  text = text
    .replace(/\bcontinue\s+reading(\.{3}|…)?/gi, '')
    .replace(/\bread\s+more(\.{3}|…)?/gi, '')
    .replace(/\bthe\s+best\s+of\s+[^–-]+–\s*in\s+pictures/gi, '')
    .replace(/•/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 4. Handle run-on concatenated Google News plain excerpts
  const publisherSeparators = [
    'India Today',
    'NDTV',
    'The Times of India',
    'The Hindu',
    'Hindustan Times',
    'The Indian Express',
    'News18',
    'Business Standard',
    'Moneycontrol',
    'Mint',
    'Reuters',
    'Associated Press',
    'AP News',
    'CNN',
    'BBC News',
    'BBC',
    'The Guardian',
    'The Washington Post',
    'Bloomberg',
    'The Wall Street Journal',
    'Al Jazeera',
    'TechCrunch',
    'wired.com',
    'Nature',
    'Science',
    'Udayavani',
    'The Siasat Daily',
    'NewsBytes',
    'Pluang',
  ];

  for (const pub of publisherSeparators) {
    const pubIdx = text.indexOf(` ${pub} `);
    if (pubIdx > 25) {
      text = text.slice(0, pubIdx).trim();
      break;
    }
  }

  // Also remove trailing ellipsis cutoffs
  text = text.replace(/\s+[\w‘'"][^.!?]{0,30}(…|\.{3})$/g, '.');

  if (!text.trim() && fallbackTitle) {
    text = decodeHtmlEntities(fallbackTitle).replace(/<[^>]+>/g, '').trim();
  }

  if (text.length <= maxLen) return text;
  const cut = text.lastIndexOf(' ', maxLen - 2);
  return (cut > 40 ? text.slice(0, cut) : text.slice(0, maxLen - 1)) + '…';
}
