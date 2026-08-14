/**
 * PolicyDrift — Metrics Service
 *
 * Thin wrapper around the metrics model that can be called by the worker
 * or an admin endpoint.
 */

import { aggregateMetrics } from '../models/metrics.model.js';

/**
 * Aggregate post_events into post_metrics time-window counters.
 * @returns {{ aggregated: number }}
 */
export async function runMetricsAggregation() {
  const count = await aggregateMetrics();
  return { aggregated: count };
}
