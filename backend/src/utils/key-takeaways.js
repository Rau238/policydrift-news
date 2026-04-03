import { toCleanString } from './string.js';

const BANKING_ECONOMICS = 'Banking & Economics';

function plainFromHtml(html) {
  return toCleanString(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:#\d+|#x[\da-fA-F]+|\w+);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24);
}

/**
 * Short desk framing for Banking & Economics, derived from excerpt/body (not wire copy pasted as-is only).
 * Stored newline-separated; UI renders as bullets.
 */
export function buildKeyTakeawaysForCategory({ category, excerpt, title, bodyHtml }) {
  if (category !== BANKING_ECONOMICS) return null;

  const fromExcerpt = splitSentences(plainFromHtml(excerpt || ''));
  let picks = [...fromExcerpt];
  if (picks.length < 2 && bodyHtml) {
    const bodyPlain = plainFromHtml(bodyHtml).slice(0, 2000);
    const fromBody = splitSentences(bodyPlain);
    for (const s of fromBody) {
      if (!picks.includes(s)) picks.push(s);
      if (picks.length >= 4) break;
    }
  }
  if (picks.length === 0) {
    const t = plainFromHtml(title);
    if (t.length > 20) picks = [t];
  }

  const maxLen = 320;
  const bullets = picks.slice(0, 4).map((s) => (s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s));
  if (!bullets.length) return null;

  const experienceLine =
    'Desk angle: we track rates, inflation, and bank balance sheets against this headline. Always read the original for filings and quotes.';
  return [...bullets, experienceLine].join('\n');
}
