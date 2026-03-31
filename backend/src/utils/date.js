/**
 * Normalize MySQL DATETIME / JS Date to ISO-8601 strings in API JSON so the frontend
 * always parses a single instant with full date + time (minutes).
 */
export function toIso8601(value) {
  if (value == null) return value;
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isNaN(t) ? null : new Date(t).toISOString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return value;
    const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
    const d = new Date(normalized);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return value;
}

/** Apply to post rows returned from MySQL (mysql2 may yield Date objects or strings). */
export function serializePostDates(row) {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row };
  for (const key of ['published_at', 'created_at', 'updated_at']) {
    if (out[key] != null) {
      const iso = toIso8601(out[key]);
      if (iso != null) out[key] = iso;
    }
  }
  return out;
}
