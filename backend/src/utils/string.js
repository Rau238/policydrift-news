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
 * Parses Google News aggregated RSS item elements:
 * `<ol><li><a href="...">Title</a>&nbsp;&nbsp;<font color="#6f6f6f">Source</font></li>...</ol>`
 */
export function parseGoogleNewsItems(html) {
  if (!html || typeof html !== 'string') return [];
  const isGNews =
    /<ol[^>]*>[\s\S]*?<li/i.test(html) ||
    /news\.google\.com\/rss\/articles/i.test(html) ||
    /<font color=["']?#6f6f6f["']?/i.test(html);
  if (!isGNews) return [];

  const items = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = liRegex.exec(html)) !== null) {
    const liContent = match[1];
    const aMatch = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i.exec(liContent);
    if (!aMatch) continue;

    const url = aMatch[1].trim();
    const title = aMatch[2].replace(/<[^>]+>/g, '').trim();

    let source = '';
    const fontMatch = /<font[^>]*>([\s\S]*?)<\/font>/i.exec(liContent);
    if (fontMatch) {
      source = fontMatch[1].replace(/<[^>]+>/g, '').trim();
    } else {
      const remaining = liContent.slice(aMatch.index + aMatch[0].length);
      source = remaining.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').trim();
    }
    if (title) {
      items.push({ title, url, source });
    }
  }
  return items;
}

/**
 * Store feed body as HTML: pass through publisher HTML, or wrap plain text in <p> blocks.
 */
export function feedBodyToArticleHtml(raw) {
  let t = toCleanString(raw);
  if (!t) return '';

  // Clean zero-width chars and fix glued sentences from syndicated feeds
  t = t.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');
  t = t.replace(/([a-z0-9”"'\)])\.([A-Z“"'])/g, '$1. $2');
  t = t.replace(/([?!])([A-Z“"'])/g, '$1 $2');

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

  // If this is Google News syndicated feed content, extract the primary item title
  if (/<ol[^>]*>[\s\S]*?<li/i.test(raw) || /news\.google\.com\/rss\/articles/i.test(raw)) {
    const items = parseGoogleNewsItems(raw);
    if (items.length > 0 && items[0].title) {
      const firstTitle = items[0].title;
      if (firstTitle.length <= maxLen) return firstTitle;
      const cut = firstTitle.lastIndexOf(' ', maxLen - 2);
      return (cut > 40 ? firstTitle.slice(0, cut) : firstTitle.slice(0, maxLen - 1)) + '…';
    }
  }

  let plain = raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:#\d+|#x[\da-fA-F]+|\w+);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If plain text had mashed publishers, cut at the first publisher
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
    'wired.com',
    'Nature',
  ];
  for (const pub of publisherSeparators) {
    const pubIdx = plain.indexOf(` ${pub} `);
    if (pubIdx > 25) {
      plain = plain.slice(0, pubIdx).trim();
      break;
    }
  }

  if (!plain) plain = toCleanString(title);
  if (plain.length <= maxLen) return plain;
  const cut = plain.lastIndexOf(' ', maxLen - 2);
  return (cut > 40 ? plain.slice(0, cut) : plain.slice(0, maxLen - 1)) + '…';
}

