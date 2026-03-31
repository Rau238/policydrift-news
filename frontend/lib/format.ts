/** Fixed locale so server (Node) and browser render the same string — avoids hydration mismatches. */
const DATE_LOCALE = 'en-US';

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(DATE_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Published time for news: date plus hour and minute (RSS / DB store full DATETIME). */
export function formatPublishedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(DATE_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 45) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(iso);
}

/** Site header: today's calendar line in the user's local timezone (use from client after mount). */
export function formatTodayForHeader(d: Date, narrow: boolean): string {
  return d.toLocaleDateString(DATE_LOCALE, narrow
    ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
    : { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
