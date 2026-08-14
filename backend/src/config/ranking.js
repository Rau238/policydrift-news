/**
 * PolicyDrift — centralised ranking configuration.
 *
 * All weights, half-lives, and thresholds live here.
 * Override nothing in individual service files.
 *
 * TRENDING  — "what is gaining attention RIGHT NOW?"   (velocity-first)
 * TOP       — "what is the most important story?"      (balanced quality)
 * POPULAR   — "what got the most attention this period?" (raw engagement)
 * LATEST    — pure published_at DESC (no score needed)
 */

export const RANKING = {
  /**
   * Composite score weights.
   * Each row must sum to 1.0.
   */
  weights: {
    trending: {
      velocity:   0.40,
      freshness:  0.30,
      engagement: 0.15,
      source:     0.10,
      editorial:  0.05,
    },
    top: {
      engagement: 0.30,
      freshness:  0.25,
      source:     0.20,
      velocity:   0.15,
      editorial:  0.10,
    },
  },

  /**
   * Freshness decay half-life (hours).
   * freshness_score = exp( -age_hours / halfLife )
   *
   * After 1×halfLife → score ≈ 0.607
   * After 2×halfLife → score ≈ 0.368
   * After 3×halfLife → score ≈ 0.050  (article fades)
   */
  halfLife: {
    trending: 6,   // hours — fast decay; 18h old article scores ~0.05
    top:      24,  // hours — moderate decay; 3-day article still scores ~0.05
  },

  /**
   * Velocity score config.
   * velocity_score = tanh( weighted_recent_events / normalizeScale )
   * Score is bounded [0, 1] via tanh.
   */
  velocity: {
    /** Multipliers for each view window (recent windows count more) */
    window5mWeight:  4.0,
    window30mWeight: 2.0,
    window1hWeight:  1.5,
    window6hWeight:  1.0,

    /** Interaction multipliers (shares/comments are stronger signals) */
    shareWeight:    5.0,
    commentWeight:  4.0,
    likeWeight:     2.0,
    bookmarkWeight: 3.0,

    /**
     * Divide the weighted event sum by this before tanh().
     * Lower value → score saturates earlier (smaller sites).
     * Increase for high-traffic sites.
     */
    normalizeScale: 50,
  },

  /**
   * Engagement score config.
   * engagement_score = min(1, log(1 + weighted_events) / logScale)
   */
  engagement: {
    shareWeight:    5.0,
    commentWeight:  4.0,
    likeWeight:     2.0,
    bookmarkWeight: 3.0,

    /**
     * Log scale denominator.
     * At logScale=10: score reaches 1.0 at ~22,000 weighted events.
     * Tune based on typical traffic volume.
     */
    logScale: 10,
  },

  /**
   * Editorial boost scores (0–1).
   * Applied based on post fields (is_breaking, is_featured, editorial_priority).
   */
  editorial: {
    pinned:   1.0,
    breaking: 0.9,
    high:     0.8,
    featured: 0.7,
    normal:   0.5,
  },

  /**
   * Source authority config.
   * source_score = trust_score / 100
   * Default trust_score for seeded/hardcoded sources: 70.
   */
  source: {
    defaultTrustScore: 70,
  },

  /**
   * Ranking windows — how far back to consider articles.
   * Articles older than the window are not re-ranked (performance).
   */
  windows: {
    /** Articles eligible for trending ranking */
    trendingDays: 2,
    /** Articles eligible for top ranking */
    topDays: 7,
    /** Articles eligible for popular this week */
    popularWeekDays: 7,
    /** Articles eligible for popular this month */
    popularMonthDays: 30,
  },

  /**
   * View deduplication — same IP hash cannot generate a new view event
   * for the same article within this window.
   */
  viewDedupMinutes: 30,

  /**
   * Event retention — post_events older than this are cleaned up daily.
   */
  eventRetentionDays: 30,
};
