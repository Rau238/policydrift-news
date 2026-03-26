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
