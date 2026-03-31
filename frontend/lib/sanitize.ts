import he from 'he';
import sanitizeHtml from 'sanitize-html';

const options: sanitizeHtml.IOptions = {
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

/** Decode `&#039;`, `&apos;`, double-encoded `&amp;#039;`, etc., for display strings (title, excerpt). */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return he.decode(text);
}

/**
 * Decode entities in feed HTML, then sanitize. Fixes visible `&#039;` and similar in body text.
 */
export function sanitizeArticleHtml(html: string): string {
  const decoded = he.decode(html || '');
  return sanitizeHtml(decoded, options);
}

/** Plain text from HTML for schema.org `articleBody` (strip tags, cap length). */
export function stripHtmlToPlain(html: string, maxChars = 8000): string {
  const decoded = he.decode(html || '');
  const plain = decoded
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '';
  if (plain.length <= maxChars) return plain;
  return `${plain.slice(0, Math.max(0, maxChars - 1))}…`;
}
