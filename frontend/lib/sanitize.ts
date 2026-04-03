import he from 'he';
import sanitizeHtml from 'sanitize-html';

const baseArticleSanitizeOptions: Omit<sanitizeHtml.IOptions, 'transformTags'> = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'figure',
    'figcaption',
    'picture',
    'source',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    'blockquote',
    'hr',
    'cite',
    'sup',
    'sub',
    'code',
    'pre',
    'dl',
    'dt',
    'dd',
    'abbr',
    'mark',
    'small',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'srcset', 'sizes', 'alt', 'title', 'width', 'height', 'loading', 'decoding', 'fetchpriority'],
    a: ['href', 'name', 'target', 'rel', 'title'],
    th: ['colspan', 'rowspan', 'scope', 'abbr'],
    td: ['colspan', 'rowspan'],
    source: ['srcset', 'sizes', 'type', 'media'],
    picture: [],
    abbr: ['title'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

function buildArticleSanitizeOptions(articleTitle?: string): sanitizeHtml.IOptions {
  const t = articleTitle?.trim() || '';
  const defaultImgAlt = t
    ? `Image from article: ${t.length > 110 ? `${t.slice(0, 110)}…` : t}`
    : 'Image from the syndicated article';

  return {
    ...baseArticleSanitizeOptions,
    transformTags: {
      img: (tagName, attribs) => {
        const rawAlt = (attribs.alt ?? '').trim();
        const alt = rawAlt || defaultImgAlt;
        const rawTitle = (attribs.title ?? '').trim();
        const title = rawTitle || alt;
        return { tagName: 'img', attribs: { ...attribs, alt, title } };
      },
    },
  };
}

/** Decode `&#039;`, `&apos;`, double-encoded `&amp;#039;`, etc., for display strings (title, excerpt). */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return he.decode(text);
}

/**
 * Decode entities in feed HTML, then sanitize. Fixes visible `&#039;` and similar in body text.
 * Ensures every `<img>` has non-empty `alt` and `title` (RSS feeds often omit them).
 */
export function sanitizeArticleHtml(html: string, opts?: { articleTitle?: string }): string {
  const decoded = he.decode(html || '');
  return sanitizeHtml(decoded, buildArticleSanitizeOptions(opts?.articleTitle));
}

/**
 * Plain text from HTML (strip tags). Default cap suits previews; pass `Infinity` for full text (e.g. JSON-LD `articleBody`).
 */
export function stripHtmlToPlain(html: string, maxChars: number = 8000): string {
  const decoded = he.decode(html || '');
  const plain = decoded
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '';
  if (!Number.isFinite(maxChars) || plain.length <= maxChars) return plain;
  return `${plain.slice(0, Math.max(0, maxChars - 1))}…`;
}
