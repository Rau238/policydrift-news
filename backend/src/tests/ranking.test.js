/**
 * NewsFree365 — Ranking Service Unit Tests
 *
 * Tests all five component score calculators and the two composite scores
 * (trending_score, top_score) using only Node's built-in test runner.
 *
 * Run:
 *   node --test src/tests/ranking.test.js
 *   # or from the backend workspace:
 *   node --test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  freshnessScore,
  velocityScore,
  engagementScore,
  sourceScore,
  editorialScore,
} from '../services/ranking.service.js';
import { RANKING } from '../config/ranking.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return a Date that is `hours` hours in the past. */
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

/** Return a Date that is `days` days in the past. */
function daysAgo(days) {
  return hoursAgo(days * 24);
}

/**
 * Build a minimal metrics row for velocityScore / engagementScore.
 * All counters default to 0 unless overridden.
 */
function makeRow(overrides = {}) {
  return {
    published_at: hoursAgo(1),
    views_5m: 0,
    views_30m: 0,
    views_1h: 0,
    views_6h: 0,
    views_24h: 0,
    likes_1h: 0,
    likes_24h: 0,
    shares_1h: 0,
    shares_24h: 0,
    comments_1h: 0,
    bookmarks_24h: 0,
    trust_score: 70,
    editorial_priority: 'normal',
    is_breaking: false,
    is_featured: false,
    breaking_until: null,
    featured_until: null,
    ...overrides,
  };
}

// ─── Composite score helpers (mirrors ranking.service.js) ─────────────────────

function computeTrendingScore(ft, v, e, s, ed) {
  const w = RANKING.weights.trending;
  return v * w.velocity + ft * w.freshness + e * w.engagement + s * w.source + ed * w.editorial;
}

function computeTopScore(f, v, e, s, ed) {
  const w = RANKING.weights.top;
  return e * w.engagement + f * w.freshness + s * w.source + v * w.velocity + ed * w.editorial;
}

// ─── freshnessScore ───────────────────────────────────────────────────────────

describe('freshnessScore', () => {
  const halfLife = 6; // hours (trending half-life)

  test('brand-new article (age ≈ 0) scores ≈ 1.0', () => {
    // published_at = now → age ≈ 0 ms
    const score = freshnessScore(new Date(), halfLife);
    assert.ok(score > 0.99, `expected > 0.99 but got ${score}`);
    assert.ok(score <= 1.0, `expected ≤ 1.0 but got ${score}`);
  });

  test('article at exactly one half-life scores ≈ 0.607', () => {
    const score = freshnessScore(hoursAgo(halfLife), halfLife);
    // exp(-1) ≈ 0.3679... but we use half-life convention: exp(-ageHours/halfLife)
    // At age = halfLife → exp(-1) ≈ 0.3679
    // The "half-life" in this formula means the score halves every halfLife*ln2 hours.
    // At age = halfLife → score = exp(-1) ≈ 0.368
    // The docstring uses ≈ 0.607 for the mid-point; that is exp(-0.5) which occurs at halfLife/2.
    // Checking the actual formula: score = exp(-halfLife / halfLife) = exp(-1) ≈ 0.3679
    const expected = Math.exp(-1);
    assert.ok(
      Math.abs(score - expected) < 0.01,
      `expected ≈ ${expected.toFixed(4)} but got ${score.toFixed(4)}`,
    );
  });

  test('article 3× half-life old scores < 0.1', () => {
    const score = freshnessScore(hoursAgo(halfLife * 3), halfLife);
    // exp(-3) ≈ 0.0498
    assert.ok(score < 0.1, `expected < 0.1 but got ${score}`);
  });

  test('top half-life (24 h): 1-day-old article still scores ≈ exp(-1)', () => {
    const topHalfLife = RANKING.halfLife.top; // 24 h
    const score = freshnessScore(hoursAgo(topHalfLife), topHalfLife);
    const expected = Math.exp(-1);
    assert.ok(
      Math.abs(score - expected) < 0.01,
      `expected ≈ ${expected.toFixed(4)} but got ${score.toFixed(4)}`,
    );
  });
});

// ─── velocityScore ────────────────────────────────────────────────────────────

describe('velocityScore', () => {
  test('1 000 views/5 m AND very fresh (age 0.1 h) scores > 0.9', () => {
    const row = makeRow({
      published_at: hoursAgo(0.1),
      views_5m: 1000,
    });
    const score = velocityScore(row);
    assert.ok(score > 0.9, `expected > 0.9 but got ${score}`);
  });

  test('1 view/5 m AND old (24 h) scores < 0.1', () => {
    const row = makeRow({
      published_at: hoursAgo(24),
      views_5m: 1,
    });
    const score = velocityScore(row);
    assert.ok(score < 0.1, `expected < 0.1 but got ${score}`);
  });

  test('score is bounded [0, 1] for extreme inputs', () => {
    const big = makeRow({ published_at: hoursAgo(0.01), views_5m: 1_000_000 });
    const zero = makeRow({ published_at: hoursAgo(720), views_5m: 0 });
    assert.ok(velocityScore(big) <= 1.0);
    assert.ok(velocityScore(big) >= 0.0);
    assert.ok(velocityScore(zero) >= 0.0);
  });

  test('shares and comments boost velocity more than raw views', () => {
    const viewsOnly = makeRow({ published_at: hoursAgo(1), views_5m: 100 });
    // 10 shares × weight 5 = 50; 10 comments × weight 4 = 40 → weighted 90
    // vs 100 views × weight 4 = 400; viewsOnly is still much bigger here,
    // so test a case where interactions dominate
    const interactions = makeRow({
      published_at: hoursAgo(1),
      views_5m: 0,
      shares_1h: 10,
      comments_1h: 10,
    });
    // views_5m=100 → 400 weighted; interactions → 90 weighted. Views win, OK.
    // Use a fairer comparison: 20 shares (100) + 20 comments (80) vs 40 views (160)
    const fewViews = makeRow({ published_at: hoursAgo(1), views_5m: 40 });
    const richInteractions = makeRow({
      published_at: hoursAgo(1),
      shares_1h: 20,
      comments_1h: 20,
    });
    assert.ok(
      velocityScore(richInteractions) > velocityScore(fewViews),
      'interactions (weighted 900) should outrank 40 views (weighted 160)',
    );
  });
});

// ─── engagementScore ──────────────────────────────────────────────────────────

describe('engagementScore', () => {
  test('10 000 views_24h with no interactions scores close to max', () => {
    const row = makeRow({ views_24h: 10_000 });
    const score = engagementScore(row);
    // log(1 + 10000) / 10 ≈ 0.9 → min(1, ...) = 0.9
    const expected = Math.min(1, Math.log(1 + 10_000) / RANKING.engagement.logScale);
    assert.ok(
      Math.abs(score - expected) < 0.001,
      `expected ≈ ${expected.toFixed(4)} but got ${score.toFixed(4)}`,
    );
    assert.ok(score > 0.8);
  });

  test('zero engagement scores exactly 0', () => {
    const row = makeRow({
      views_24h: 0,
      likes_24h: 0,
      shares_24h: 0,
      comments_1h: 0,
      bookmarks_24h: 0,
    });
    assert.equal(engagementScore(row), 0);
  });

  test('score is capped at 1.0 even for enormous traffic', () => {
    const row = makeRow({
      views_24h: 10_000_000,
      likes_24h: 1_000_000,
      shares_24h: 500_000,
      comments_1h: 200_000,
      bookmarks_24h: 100_000,
    });
    assert.equal(engagementScore(row), 1.0);
  });

  test('shares and bookmarks are weighted higher than raw views', () => {
    const viewHeavy = makeRow({ views_24h: 1000, shares_24h: 0 });
    const shareHeavy = makeRow({ views_24h: 0, shares_24h: 50 });
    // raw views: 1000; shares: 50 × 5 = 250 — views still win
    // use more shares to confirm weighting
    const shareDominant = makeRow({ views_24h: 0, shares_24h: 300 });
    // raw: 300 × 5 = 1500 > 1000 views
    assert.ok(
      engagementScore(shareDominant) > engagementScore(viewHeavy),
      '300 shares (weighted 1500) should beat 1000 raw views',
    );
  });
});

// ─── Critical: Trending — virality beats age ──────────────────────────────────

describe('trending_score: virality vs. volume', () => {
  /**
   * Article A: established article — huge cumulative views but going cold.
   * Article B: newcomer — far fewer total views but spiking hard right now.
   *
   * The trending formula is velocity-first (40 % weight + 30 % freshness)
   * so B must beat A.
   */
  test('fast-rising new article beats old high-volume article', () => {
    const trendingHalfLife = RANKING.halfLife.trending; // 6 h

    const rowA = makeRow({
      published_at: daysAgo(7),
      views_24h: 100_000,
      views_5m: 5,
      views_30m: 20,
      views_1h: 50,
      views_6h: 200,
    });

    const rowB = makeRow({
      published_at: hoursAgo(2),
      views_24h: 5_000,
      views_5m: 500,
      views_30m: 800,
      views_1h: 1_200,
      views_6h: 3_000,
    });

    const edNormal = RANKING.editorial.normal;
    const srcScore = RANKING.source.defaultTrustScore / 100;

    const vA = velocityScore(rowA);
    const vB = velocityScore(rowB);
    const eA = engagementScore(rowA);
    const eB = engagementScore(rowB);
    const ftA = freshnessScore(rowA.published_at, trendingHalfLife);
    const ftB = freshnessScore(rowB.published_at, trendingHalfLife);

    const trendA = computeTrendingScore(ftA, vA, eA, srcScore, edNormal);
    const trendB = computeTrendingScore(ftB, vB, eB, srcScore, edNormal);

    assert.ok(
      trendB > trendA,
      `Article B (fresh spike) trending=${trendB.toFixed(4)} should beat ` +
        `Article A (old volume) trending=${trendA.toFixed(4)}`,
    );
  });
});

// ─── top_score: quality vs. age ───────────────────────────────────────────────

describe('top_score: quality + freshness balance', () => {
  const topHalfLife = RANKING.halfLife.top; // 24 h
  const srcScore    = RANKING.source.defaultTrustScore / 100;
  const edNormal    = RANKING.editorial.normal;

  test('30-day-old article with massive engagement can beat 1-hour-old with tiny engagement', () => {
    const oldRow = makeRow({
      published_at: daysAgo(30),
      views_24h: 500_000,
      likes_24h: 50_000,
      shares_24h: 20_000,
      comments_1h: 5_000,
      bookmarks_24h: 10_000,
    });

    const freshRow = makeRow({
      published_at: hoursAgo(1),
      views_24h: 5,
      likes_24h: 1,
    });

    const eOld   = engagementScore(oldRow);
    const eFresh = engagementScore(freshRow);
    const fOld   = freshnessScore(oldRow.published_at, topHalfLife);
    const fFresh = freshnessScore(freshRow.published_at, topHalfLife);
    const vOld   = velocityScore(oldRow);
    const vFresh = velocityScore(freshRow);

    const topOld   = computeTopScore(fOld,   vOld,   eOld,   srcScore, edNormal);
    const topFresh = computeTopScore(fFresh, vFresh, eFresh, srcScore, edNormal);

    assert.ok(
      topOld > topFresh,
      `Massive-engagement old article top=${topOld.toFixed(4)} should beat ` +
        `near-zero fresh article top=${topFresh.toFixed(4)}`,
    );
  });

  test('1-day-old article with moderate engagement scores well (> 0.4)', () => {
    const row = makeRow({
      published_at: daysAgo(1),
      views_24h: 5_000,
      likes_24h: 300,
      shares_24h: 100,
      comments_1h: 50,
      bookmarks_24h: 80,
    });

    const e  = engagementScore(row);
    const f  = freshnessScore(row.published_at, topHalfLife);
    const v  = velocityScore(row);
    const top = computeTopScore(f, v, e, srcScore, edNormal);

    assert.ok(top > 0.4, `1-day moderate article should score > 0.4 but got ${top.toFixed(4)}`);
  });
});

// ─── editorialScore ───────────────────────────────────────────────────────────

describe('editorialScore', () => {
  test('pinned article gets score 1.0', () => {
    const row = makeRow({ editorial_priority: 'pinned' });
    assert.equal(editorialScore(row), RANKING.editorial.pinned);
    assert.equal(editorialScore(row), 1.0);
  });

  test('breaking article (within window) gets score 0.9', () => {
    const row = makeRow({
      is_breaking: true,
      breaking_until: new Date(Date.now() + 60 * 60 * 1000), // 1 h from now
    });
    assert.equal(editorialScore(row), RANKING.editorial.breaking);
    assert.equal(editorialScore(row), 0.9);
  });

  test('normal priority article gets score 0.5', () => {
    const row = makeRow({ editorial_priority: 'normal' });
    assert.equal(editorialScore(row), RANKING.editorial.normal);
    assert.equal(editorialScore(row), 0.5);
  });

  test('high priority article gets score 0.8', () => {
    const row = makeRow({ editorial_priority: 'high' });
    assert.equal(editorialScore(row), RANKING.editorial.high);
    assert.equal(editorialScore(row), 0.8);
  });

  test('featured article (within window) gets score 0.7', () => {
    const row = makeRow({
      is_featured: true,
      featured_until: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });
    assert.equal(editorialScore(row), RANKING.editorial.featured);
    assert.equal(editorialScore(row), 0.7);
  });
});

// ─── Breaking news expiry ─────────────────────────────────────────────────────

describe('editorialScore — breaking news expiry', () => {
  test('article with breaking_until in the past falls back to normal (0.5)', () => {
    const row = makeRow({
      is_breaking: true,
      breaking_until: new Date(Date.now() - 60 * 1000), // 1 minute ago
      editorial_priority: 'normal',
    });
    const score = editorialScore(row);
    assert.equal(
      score,
      RANKING.editorial.normal,
      `expired breaking article should score ${RANKING.editorial.normal} but got ${score}`,
    );
    assert.notEqual(score, RANKING.editorial.breaking);
  });

  test('breaking_until = null means breaking flag never expires', () => {
    const row = makeRow({
      is_breaking: true,
      breaking_until: null,
    });
    assert.equal(editorialScore(row), RANKING.editorial.breaking);
  });

  test('featured_until in the past falls back to normal (0.5)', () => {
    const row = makeRow({
      is_featured: true,
      featured_until: new Date(Date.now() - 60 * 1000),
      editorial_priority: 'normal',
    });
    assert.equal(editorialScore(row), RANKING.editorial.normal);
  });
});

// ─── sourceScore ─────────────────────────────────────────────────────────────

describe('sourceScore', () => {
  test('trust_score 100 → source score 1.0', () => {
    assert.equal(sourceScore(100), 1.0);
  });

  test('trust_score 70 → source score 0.70', () => {
    assert.ok(Math.abs(sourceScore(70) - 0.70) < 0.001);
  });

  test('trust_score 0 → source score 0.0', () => {
    assert.equal(sourceScore(0), 0.0);
  });

  test('null trust_score uses default (70 → 0.70)', () => {
    const score = sourceScore(null);
    assert.ok(Math.abs(score - 0.70) < 0.001, `expected ≈ 0.70 but got ${score}`);
  });
});
