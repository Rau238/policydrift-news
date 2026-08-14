/**
 * PolicyDrift — Deduplication & String Utility Tests
 *
 * Tests the pure utility functions used during RSS ingestion for duplicate
 * detection.  No database required — all logic under test is stateless.
 *
 * Run:
 *   node --test src/tests/dedup.test.js
 *   # or from the backend workspace:
 *   node --test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { sha256Hex } from '../utils/hash.js';
import { toCleanString, excerptFromFeedContent } from '../utils/string.js';
import slugify from 'slugify';

// ─── Inline normalizeTitle (mirrors ingestion.service.js) ─────────────────────

/**
 * Mirrors the private `normalizeTitle` helper in ingestion.service.js.
 * Strips special characters, lowercases, collapses whitespace, truncates to
 * 200 characters.  Used for content-level deduplication via SHA-256 hash.
 *
 * @param {unknown} title
 * @returns {string}
 */
function normalizeTitle(title) {
  return toCleanString(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

// ─── sha256Hex ────────────────────────────────────────────────────────────────

describe('sha256Hex', () => {
  test('identical URLs produce the same hash', () => {
    const url = 'https://example.com/news/budget-2025';
    assert.equal(sha256Hex(url), sha256Hex(url));
  });

  test('different URLs produce different hashes', () => {
    const a = sha256Hex('https://example.com/article/1');
    const b = sha256Hex('https://example.com/article/2');
    assert.notEqual(a, b);
  });

  test('output is a 64-character lowercase hex string', () => {
    const hash = sha256Hex('https://example.com/news/test');
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  test('URLs differing only by trailing slash produce different hashes', () => {
    // Trailing slash is a distinct URL — we store the hash as-is
    const withSlash    = sha256Hex('https://example.com/article/');
    const withoutSlash = sha256Hex('https://example.com/article');
    assert.notEqual(withSlash, withoutSlash);
  });

  test('hash is deterministic across calls', () => {
    const url  = 'https://ndtv.com/india-news/some-policy-story-1234567';
    const run1 = sha256Hex(url);
    const run2 = sha256Hex(url);
    assert.equal(run1, run2);
  });
});

// ─── toCleanString ────────────────────────────────────────────────────────────

describe('toCleanString', () => {
  test('null returns empty string', () => {
    assert.equal(toCleanString(null), '');
  });

  test('undefined returns empty string', () => {
    assert.equal(toCleanString(undefined), '');
  });

  test('plain string is returned trimmed', () => {
    assert.equal(toCleanString('  hello world  '), 'hello world');
  });

  test('Buffer is decoded as UTF-8 and trimmed', () => {
    const buf = Buffer.from('  PolicyDrift  ', 'utf8');
    assert.equal(toCleanString(buf), 'PolicyDrift');
  });

  test('Buffer with UTF-8 multibyte chars decoded correctly', () => {
    const text = 'नई दिल्ली'; // Hindi — "New Delhi"
    const buf  = Buffer.from(text, 'utf8');
    assert.equal(toCleanString(buf), text);
  });

  test('object with _ key returns inner value', () => {
    assert.equal(toCleanString({ _: 'inner text' }), 'inner text');
  });

  test('object with #text key returns inner value', () => {
    assert.equal(toCleanString({ '#text': 'text content' }), 'text content');
  });

  test('object with nested _ key resolves recursively', () => {
    // Inner value is itself an object with _
    assert.equal(toCleanString({ _: { _: 'deep value' } }), 'deep value');
  });

  test('number is converted to string', () => {
    assert.equal(toCleanString(42), '42');
  });

  test('boolean is converted to string', () => {
    assert.equal(toCleanString(true), 'true');
  });

  test('plain object without known keys is JSON-stringified', () => {
    const result = toCleanString({ foo: 'bar' });
    assert.equal(result, JSON.stringify({ foo: 'bar' }));
  });
});

// ─── slugify ─────────────────────────────────────────────────────────────────

describe('slugify (ingestion slug behaviour)', () => {
  const opts = { lower: true, strict: true, trim: true };

  test('"India Announces New Economic Policy" → "india-announces-new-economic-policy"', () => {
    assert.equal(
      slugify('India Announces New Economic Policy', opts),
      'india-announces-new-economic-policy',
    );
  });

  test('special characters are stripped (strict mode)', () => {
    assert.equal(
      slugify('Budget 2025: What\'s New?', opts),
      'budget-2025-whats-new',
    );
  });

  test('consecutive spaces collapse to single hyphen', () => {
    assert.equal(slugify('A   B   C', opts), 'a-b-c');
  });

  test('leading / trailing whitespace is trimmed', () => {
    assert.equal(slugify('  Hello World  ', opts), 'hello-world');
  });

  test('already-lowercase input is unchanged', () => {
    assert.equal(slugify('rbi-rate-hike-2025', opts), 'rbi-rate-hike-2025');
  });
});

// ─── normalizeTitle ───────────────────────────────────────────────────────────

describe('normalizeTitle (content-hash dedup helper)', () => {
  test('lowercases the title', () => {
    assert.equal(normalizeTitle('INDIA BUDGET 2025'), 'india budget 2025');
  });

  test('strips special characters', () => {
    assert.equal(normalizeTitle('Budget 2025: What\'s New?!'), 'budget 2025 whats new');
  });

  test('collapses multiple whitespace to single space', () => {
    assert.equal(normalizeTitle('India   Announces   Policy'), 'india   announces   policy'.replace(/\s+/g, ' '));
  });

  test('handles null gracefully → empty string', () => {
    assert.equal(normalizeTitle(null), '');
  });

  test('handles Buffer input', () => {
    const buf = Buffer.from('  Breaking News  ', 'utf8');
    assert.equal(normalizeTitle(buf), 'breaking news');
  });

  test('truncates to 200 characters', () => {
    const longTitle = 'a '.repeat(120).trim(); // 239 chars
    const result = normalizeTitle(longTitle);
    assert.ok(result.length <= 200, `expected ≤ 200 chars but got ${result.length}`);
  });

  test('two titles that differ only in punctuation produce the same hash', () => {
    const h1 = sha256Hex(normalizeTitle('RBI raises repo rate by 25 bps'));
    const h2 = sha256Hex(normalizeTitle('RBI raises repo rate by 25 bps!'));
    assert.equal(h1, h2);
  });

  test('genuinely different titles produce different hashes', () => {
    const h1 = sha256Hex(normalizeTitle('India raises import duty on gold'));
    const h2 = sha256Hex(normalizeTitle('India cuts import duty on gold'));
    assert.notEqual(h1, h2);
  });
});

// ─── excerptFromFeedContent ───────────────────────────────────────────────────

describe('excerptFromFeedContent', () => {
  test('strips HTML tags from input', () => {
    const html   = '<p>The government announced <strong>new policy</strong> today.</p>';
    const result = excerptFromFeedContent(html);
    assert.ok(!result.includes('<'), `result should not contain HTML tags: "${result}"`);
    assert.ok(result.includes('new policy'));
  });

  test('decodes HTML entities', () => {
    const html   = '<p>Budget &amp; Policy &mdash; 2025</p>';
    const result = excerptFromFeedContent(html);
    assert.ok(!result.includes('&amp;'), `entities should be replaced: "${result}"`);
  });

  test('truncates to 220 chars and appends ellipsis', () => {
    const longText = 'word '.repeat(60).trim(); // > 220 chars
    const result   = excerptFromFeedContent(longText);
    assert.ok(result.endsWith('…'), `should end with ellipsis but got: "${result.slice(-5)}"`);
    // Result length: up to 220 chars of text + 1 char ellipsis
    assert.ok(
      result.length <= 221,
      `expected ≤ 221 chars but got ${result.length}`,
    );
  });

  test('short text is returned as-is (no truncation)', () => {
    const text   = 'Short article summary.';
    const result = excerptFromFeedContent(text);
    assert.equal(result, text);
  });

  test('empty HTML falls back to title when provided', () => {
    const result = excerptFromFeedContent('<p></p>', 'Fallback Title Here');
    assert.equal(result, 'Fallback Title Here');
  });

  test('null input with title falls back to title', () => {
    const result = excerptFromFeedContent(null, 'Article Title');
    assert.equal(result, 'Article Title');
  });

  test('nested HTML tags are all stripped', () => {
    const html = '<div><h2>Headline</h2><p>Para <em>one</em>.</p><ul><li>Item</li></ul></div>';
    const result = excerptFromFeedContent(html);
    assert.ok(!/<[^>]+>/.test(result), 'no HTML tags should remain');
    assert.ok(result.includes('Headline'));
    assert.ok(result.includes('Para'));
    assert.ok(result.includes('Item'));
  });

  test('collapses multiple whitespace into single spaces', () => {
    const html   = '<p>India   \n\n   announces    new    budget</p>';
    const result = excerptFromFeedContent(html);
    assert.ok(!/\s{2,}/.test(result), `whitespace not collapsed: "${result}"`);
  });

  test('custom maxLen is respected', () => {
    const text   = 'a '.repeat(50).trim(); // 99 chars
    const result = excerptFromFeedContent(text, null, 50);
    // Result should be truncated to ≤ 51 chars (50 + ellipsis)
    assert.ok(result.length <= 51, `expected ≤ 51 chars but got ${result.length}`);
    assert.ok(result.endsWith('…'));
  });
});
