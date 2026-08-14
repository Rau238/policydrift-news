/**
 * PolicyDrift — Ranking Service
 *
 * Computes five component scores for each article and combines them into
 * trending_score and top_score.  All scores are bounded [0, 1].
 *
 * Called by the background ranking worker; never called on a hot request path.
 */

import { RANKING } from '../config/ranking.js';
import { loadMetricsForRanking } from '../models/metrics.model.js';
import { saveRankingScores } from '../models/metrics.model.js';

// ─── Component calculators ────────────────────────────────────────────────────

/**
 * Freshness score — exponential time decay.
 * score = exp( -ageHours / halfLifeHours )
 */
function freshnessScore(publishedAt, halfLifeHours) {
  const ageMs    = Date.now() - new Date(publishedAt).getTime();
  const ageHours = Math.max(0, ageMs / (1000 * 60 * 60));
  return Math.exp(-ageHours / halfLifeHours);
}

/**
 * Velocity score — how fast is this article gaining attention right now?
 * score = tanh( weightedRecentEvents / (ageHours + 1) / normalizeScale )
 * Bounded [0, 1] by tanh.
 */
function velocityScore(row) {
  const v = RANKING.velocity;
  const weighted =
    (row.views_5m   || 0) * v.window5mWeight  +
    (row.views_30m  || 0) * v.window30mWeight +
    (row.views_1h   || 0) * v.window1hWeight  +
    (row.views_6h   || 0) * v.window6hWeight  +
    (row.likes_1h   || 0) * v.likeWeight      +
    (row.shares_1h  || 0) * v.shareWeight     +
    (row.comments_1h || 0) * v.commentWeight;

  const ageHours = Math.max(0,
    (Date.now() - new Date(row.published_at).getTime()) / (1000 * 60 * 60),
  );
  const normalized = weighted / (ageHours + 1);
  return Math.tanh(normalized / v.normalizeScale);
}

/**
 * Engagement score — total recent interactions weighted by type.
 * score = min(1, log(1 + rawEngagement) / logScale)
 */
function engagementScore(row) {
  const e = RANKING.engagement;
  const raw =
    (row.views_24h    || 0) +
    (row.likes_24h    || 0) * e.likeWeight    +
    (row.shares_24h   || 0) * e.shareWeight   +
    (row.comments_1h  || 0) * e.commentWeight +
    (row.bookmarks_24h || 0) * e.bookmarkWeight;

  return Math.min(1, Math.log(1 + raw) / e.logScale);
}

/**
 * Source authority score — normalised trust_score (0–100) → [0, 1].
 */
function sourceScore(trustScore) {
  return (trustScore ?? RANKING.source.defaultTrustScore) / 100;
}

/**
 * Editorial score — manual priority boost by admin actions.
 * Respects time-limited breaking/featured windows.
 */
function editorialScore(row, now = new Date()) {
  if (row.editorial_priority === 'pinned') return RANKING.editorial.pinned;

  const isBreaking  = row.is_breaking  &&
    (!row.breaking_until  || new Date(row.breaking_until)  > now);
  const isFeatured  = row.is_featured  &&
    (!row.featured_until  || new Date(row.featured_until)  > now);

  if (isBreaking)                          return RANKING.editorial.breaking;
  if (row.editorial_priority === 'high')   return RANKING.editorial.high;
  if (isFeatured)                          return RANKING.editorial.featured;
  return RANKING.editorial.normal;
}

// ─── Composite scores ─────────────────────────────────────────────────────────

function computeTrendingScore(f, v, e, s, ed) {
  const w = RANKING.weights.trending;
  return v * w.velocity + f * w.freshness + e * w.engagement + s * w.source + ed * w.editorial;
}

function computeTopScore(f, v, e, s, ed) {
  const w = RANKING.weights.top;
  return e * w.engagement + f * w.freshness + s * w.source + v * w.velocity + ed * w.editorial;
}

// ─── Main worker entry ────────────────────────────────────────────────────────

/**
 * Recalculate scores for recently published articles.
 * @returns {{ ranked: number, errors: string[] }}
 */
export async function runRankingPass() {
  const windowDays = Math.max(
    RANKING.windows.trendingDays,
    RANKING.windows.topDays,
  );

  const rows = await loadMetricsForRanking(windowDays);
  if (!rows.length) return { ranked: 0, errors: [] };

  const now    = new Date();
  const scored = [];
  const errors = [];

  for (const row of rows) {
    try {
      const f  = freshnessScore(row.published_at, RANKING.halfLife.top);
      const ft = freshnessScore(row.published_at, RANKING.halfLife.trending);
      const v  = velocityScore(row);
      const e  = engagementScore(row);
      const s  = sourceScore(row.trust_score);
      const ed = editorialScore(row, now);

      scored.push({
        postId:    row.post_id,
        freshness: f,
        engagement: e,
        velocity:  v,
        source:    s,
        editorial: ed,
        trending:  computeTrendingScore(ft, v, e, s, ed),
        top:       computeTopScore(f, v, e, s, ed),
      });
    } catch (err) {
      errors.push(`post ${row.post_id}: ${err.message}`);
    }
  }

  const saved = await saveRankingScores(scored);
  return { ranked: saved, errors };
}

// Export individual calculators for tests
export { freshnessScore, velocityScore, engagementScore, sourceScore, editorialScore };
