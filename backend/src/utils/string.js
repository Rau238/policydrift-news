/**
 * Normalize RSS / DB / API values to plain UTF-8 strings (handles Buffer, nested XML-ish objects).
 */
export function toCleanString(val) {
  if (val == null) return '';
  if (Buffer.isBuffer(val)) return val.toString('utf8').trim();
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    const inner = val._ ?? val['#text'] ?? val.text ?? val.title ?? val.href ?? val.url;
    if (inner != null && inner !== val) return toCleanString(inner);
    try {
      return JSON.stringify(val);
    } catch {
      return '';
    }
  }
  return String(val).trim();
}

/** OpenAI chat message `content` can be a string or an array of parts (newer APIs). */
export function normalizeOpenAIContent(content) {
  if (content == null) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part?.type === 'text' && typeof part.text === 'string') return part.text;
        if (typeof part?.text === 'string') return part.text;
        return '';
      })
      .join('');
  }
  return String(content);
}

/**
 * Store feed body as HTML: pass through publisher HTML, or wrap plain text in <p> blocks.
 */
export function feedBodyToArticleHtml(raw) {
  const t = toCleanString(raw);
  if (!t) return '';
  if (/<[a-z][\s\S]*>/i.test(t)) return t;
  const paras = t
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!paras.length) return '';
  const esc = (s) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  return paras.map((p) => `<p>${esc(p.replace(/\n+/g, ' '))}</p>`).join('\n');
}

/** Plain-text teaser from feed HTML (listings, meta description, JSON-LD). */
export function excerptFromFeedContent(htmlOrText, title, maxLen = 220) {
  const raw = toCleanString(htmlOrText);
  let plain = raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:#\d+|#x[\da-fA-F]+|\w+);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) plain = toCleanString(title);
  if (plain.length <= maxLen) return plain;
  const cut = plain.lastIndexOf(' ', maxLen - 2);
  return (cut > 40 ? plain.slice(0, cut) : plain.slice(0, maxLen - 1)) + '…';
}
