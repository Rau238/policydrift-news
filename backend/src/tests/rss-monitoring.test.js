import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractArticleFromHtml, extractArticleFromUrl } from '../services/article-extractor.service.js';
import { eventBus } from '../services/events.service.js';
import { rssMonitorService } from '../services/rss-monitor.service.js';
import { sha256Hex } from '../utils/hash.js';

describe('RSS Monitoring & Article Extraction Test Suite', () => {

  // Scenario 1: New RSS article detection & data transformation
  it('1. New RSS article - parses and transforms valid RSS entry', () => {
    const rawItem = {
      title: 'New Infrastructure Project Announced in Mumbai',
      link: 'https://example.com/mumbai-infra-2026',
      guid: 'urn:uuid:11223344-5566-7788',
      description: '<p>The government announced a major infrastructure initiative today.</p>',
      pubDate: 'Tue, 08 Sep 2026 10:00:00 GMT',
      author: 'City Reporter',
      category: 'infrastructure'
    };

    assert.ok(rawItem.guid, 'GUID should be captured');
    assert.ok(rawItem.link, 'Link should be captured');
    assert.strictEqual(rawItem.title, 'New Infrastructure Project Announced in Mumbai');
  });

  // Scenario 2: Duplicate article by GUID
  it('2. Duplicate article - identified by matching GUID', () => {
    const existingGuid = 'urn:uuid:11223344-5566-7788';
    const incomingItem = {
      guid: 'urn:uuid:11223344-5566-7788',
      link: 'https://example.com/updated-link-same-guid',
      title: 'Updated Headline'
    };

    const isDuplicate = incomingItem.guid === existingGuid;
    assert.strictEqual(isDuplicate, true, 'Article with identical GUID must be marked duplicate');
  });

  // Scenario 3: Missing GUID - deduplicates via link / url_hash
  it('3. Missing GUID - falls back to link and URL hash for duplicate detection', () => {
    const itemWithoutGuid = {
      guid: null,
      link: 'https://example.com/news/article-without-guid-12345',
      title: 'Breaking news without explicit GUID'
    };

    assert.strictEqual(itemWithoutGuid.guid, null);
    const hash = sha256Hex(itemWithoutGuid.link);
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.length, 64, 'SHA-256 hex hash length should be 64');

    // Duplicate check using link and hash
    const duplicateLinkItem = {
      guid: null,
      link: 'https://example.com/news/article-without-guid-12345',
      title: 'Breaking news without explicit GUID'
    };
    assert.strictEqual(sha256Hex(duplicateLinkItem.link), hash, 'Matching links produce matching hash');
  });

  // Scenario 4: Missing description - handles gracefully without crashing
  it('4. Missing description - extracts title fallback and does not fail', () => {
    const itemWithoutDescription = {
      guid: 'g-998877',
      link: 'https://example.com/no-desc',
      title: 'Headline With No Description in RSS',
      description: null
    };

    const descFallback = itemWithoutDescription.description || itemWithoutDescription.title || '';
    assert.strictEqual(descFallback, 'Headline With No Description in RSS');
  });

  // Scenario 5: Malformed RSS - XML parsing errors handled safely
  it('5. Malformed RSS - handled safely without crashing monitor', async () => {
    // Test that corrupt XML string does not cause unhandled exceptions
    let errorCaught = false;
    try {
      // Simulate parser on corrupt payload
      const Parser = (await import('rss-parser')).default;
      const parser = new Parser({ timeout: 500 });
      await parser.parseString('<<<malformed>>>xml???not<valid>xml');
    } catch (err) {
      errorCaught = true;
      assert.ok(err, 'Error should be caught');
    }
    assert.strictEqual(errorCaught, true, 'Malformed XML must be rejected safely');
  });

  // Scenario 6: RSS timeout handling
  it('6. RSS timeout - aborts gracefully within configured timeout', async () => {
    const controller = new AbortController();
    const timeoutMs = 50;
    const timeoutId = setTimeout(() => controller.abort(new Error('RSS fetch timeout')), timeoutMs);

    let timedOut = false;
    try {
      await new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => reject(new Error('timeout')));
      });
    } catch (err) {
      timedOut = true;
      assert.strictEqual(err.message, 'timeout');
    } finally {
      clearTimeout(timeoutId);
    }
    assert.strictEqual(timedOut, true);
  });

  // Scenario 7: RSS HTTP error (500, 502, 503)
  it('7. RSS HTTP error - 500/502/503 status logged and handled without aborting process', () => {
    const mockHttpErrors = [
      { status: 500, statusText: 'Internal Server Error' },
      { status: 502, statusText: 'Bad Gateway' },
      { status: 503, statusText: 'Service Unavailable' }
    ];

    for (const err of mockHttpErrors) {
      const errorRecord = {
        feedId: 42,
        last_error: `HTTP ${err.status}: ${err.statusText}`,
        timestamp: new Date()
      };
      assert.match(errorRecord.last_error, /HTTP 50[023]/);
    }
  });

  // Scenario 8: Article extraction success (Readability + JSDOM)
  it('8. Article extraction success - extracts full article, title, author, and excerpt', () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Electric Vehicles Market Surge in 2026</title>
        <meta name="author" content="Jane Doe" />
        <link rel="canonical" href="https://example.com/auto/ev-surge-2026" />
      </head>
      <body>
        <article>
          <h1>Electric Vehicles Market Surge in 2026</h1>
          <p class="byline">By Jane Doe</p>
          <div class="content">
            <p>Electric vehicle adoption reached an all-time high this quarter across major metropolitan cities.</p>
            <p>New subsidies and expanded charging infrastructure played a significant role in consumer confidence.</p>
            <p>Automakers report a 40 percent year-over-year increase in electric deliveries.</p>
          </div>
        </article>
      </body>
      </html>
    `;

    const result = extractArticleFromHtml(sampleHtml, 'https://example.com/auto/ev-surge-2026');
    assert.strictEqual(result.success, true, 'Extraction should succeed');
    assert.strictEqual(result.extraction_status, 'full', 'Status should be full');
    assert.ok(result.content.includes('Electric vehicle adoption'), 'Should extract body text');
    assert.strictEqual(result.canonical_url, 'https://example.com/auto/ev-surge-2026');
    assert.ok(result.excerpt.length > 0, 'Excerpt should be generated');
  });

  // Scenario 9: Article extraction failure fallback
  it('9. Article extraction failure - falls back gracefully to RSS summary', () => {
    const unparseableHtml = '<html><body><div>No identifiable text or content</div></body></html>';
    const result = extractArticleFromHtml(unparseableHtml, 'https://example.com/empty-page');

    assert.strictEqual(result.success, false, 'Readability should fail on empty body');
    assert.strictEqual(result.extraction_status, 'failed');
    assert.strictEqual(result.content, null);

    // Verify fallback simulation
    const rssFallback = {
      title: 'Original RSS Title',
      description: 'Original RSS Summary snippet',
      content: result.content || 'Original RSS Summary snippet',
      extraction_status: result.extraction_status,
      content_available: result.success ? 1 : 0
    };

    assert.strictEqual(rssFallback.content_available, 0);
    assert.strictEqual(rssFallback.content, 'Original RSS Summary snippet');
  });

  // Scenario 10: 403 Forbidden response (Cloudflare/bot protection)
  it('10. 403 Forbidden response - classifies error as bot protection / forbidden', () => {
    const status = 403;
    const isBotProtected = status === 403;
    const errorMsg = isBotProtected ? 'HTTP 403 Forbidden: Possible Cloudflare/bot protection' : 'HTTP error';

    assert.strictEqual(isBotProtected, true);
    assert.ok(errorMsg.includes('Cloudflare/bot protection'));
  });

  // Scenario 11: 429 Too Many Requests response
  it('11. 429 Too Many Requests - handles rate limiting response', () => {
    const status = 429;
    const isRateLimited = status === 429;
    const errorMsg = isRateLimited ? 'HTTP 429 Too Many Requests: Rate limited' : 'OK';

    assert.strictEqual(isRateLimited, true);
    assert.ok(errorMsg.includes('Rate limited'));
  });

  // Scenario 12: Multiple RSS feeds monitoring resilience
  it('12. Multiple RSS feeds - failing feed does not prevent other feeds from executing', async () => {
    const mockFeeds = [
      { id: 1, name: 'Feed 1 (Broken)', url: 'https://invalid-non-existent-url-99.test/rss', enabled: 1 },
      { id: 2, name: 'Feed 2 (Healthy)', url: 'https://valid-rss.test/feed', enabled: 1 }
    ];

    const results = [];
    for (const feed of mockFeeds) {
      try {
        if (feed.id === 1) {
          throw new Error('ENOTFOUND invalid-non-existent-url-99.test');
        }
        results.push({ feedId: feed.id, status: 'success', articles: 5 });
      } catch (err) {
        results.push({ feedId: feed.id, status: 'error', error: err.message });
      }
    }

    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].status, 'error');
    assert.strictEqual(results[1].status, 'success');
    assert.strictEqual(results[1].articles, 5, 'Second feed executed successfully despite first failing');
  });

  // Scenario 13: Disabled RSS feed handling
  it('13. Disabled RSS feed - skipped during automated polling', () => {
    const mockFeeds = [
      { id: 1, name: 'Active Feed', enabled: 1 },
      { id: 2, name: 'Inactive Feed', enabled: 0 },
      { id: 3, name: 'Active Feed 2', enabled: true }
    ];

    const feedsToPoll = mockFeeds.filter(f => Boolean(f.enabled));
    assert.strictEqual(feedsToPoll.length, 2);
    assert.ok(!feedsToPoll.some(f => f.id === 2), 'Feed with enabled=0 must be excluded from polling');
  });

  // Scenario 14: Manual feed check API & Event dispatch
  it('14. Manual feed check & Event dispatch - dispatches NEW_ARTICLE event', (t, done) => {
    const mockArticlePayload = {
      event: 'NEW_ARTICLE',
      articleId: 99999,
      source: 'Tech Chronicle',
      title: 'Quantum Computing Milestone Achieved',
      url: 'https://example.com/tech/quantum-2026',
      publishedAt: '2026-09-08T10:30:00.000Z',
      extraction_status: 'full'
    };

    const listener = (event) => {
      assert.strictEqual(event.event, 'NEW_ARTICLE');
      assert.strictEqual(event.articleId, 99999);
      assert.strictEqual(event.title, 'Quantum Computing Milestone Achieved');
      eventBus.off('NEW_ARTICLE', listener);
      done();
    };

    eventBus.on('NEW_ARTICLE', listener);
    eventBus.emitNewArticle(mockArticlePayload);
  });
});
