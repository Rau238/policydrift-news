import { FootballMatchSummary, DetailedFootballMatch } from './football-types';

export function getFootballMatchSlug(
  matchOrTitle: string | { title?: string; match_id?: string; home_team?: string; away_team?: string },
  fallbackId?: string
): string {
  if (typeof matchOrTitle === 'string') {
    const clean = matchOrTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return fallbackId ? `${clean}-${fallbackId}` : clean;
  }

  const mid = matchOrTitle.match_id || fallbackId || '';
  if (matchOrTitle.home_team && matchOrTitle.away_team) {
    const h = matchOrTitle.home_team.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const a = matchOrTitle.away_team.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return mid ? `${h}-vs-${a}-${mid}` : `${h}-vs-${a}`;
  }

  const title = matchOrTitle.title || 'football-match';
  const clean = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return mid ? `${clean}-${mid}` : clean;
}

export function getFootballMatchUrl(
  match: FootballMatchSummary | DetailedFootballMatch | { match_id: string; title?: string }
): string {
  if (!match.match_id) return '/sports/football';
  return `/sports/football/${match.match_id}`;
}

// Known competition slug → display name from Tribuna tournament URLs
const LEAGUE_CODE_MAP: Record<string, string> = {
  chl: 'UEFA Champions League',
  uel: 'UEFA Europa League',
  uecl: 'UEFA Conference League',
  epl: 'Premier League',
  laliga: 'La Liga',
  bundesliga: 'Bundesliga',
  seriea: 'Serie A',
  ligue1: 'Ligue 1',
  arg: 'Argentine Primera División',
  bra: 'Brazilian Série A',
  mls: 'MLS',
  ksa: 'Saudi Pro League',
  wcq: 'World Cup Qualifier',
  euro: 'UEFA Euro',
  acn: 'Africa Cup of Nations',
  copa: 'Copa Libertadores',
  sudamericana: 'Copa Sudamericana',
  afc: 'AFC Champions League',
  facup: 'FA Cup',
  copadelrey: 'Copa del Rey',
  dfbpokal: 'DFB-Pokal',
  coppaitalia: 'Coppa Italia',
  couperdefrance: 'Coupe de France',
};

// Noisy / generic league strings that should be filtered out
const NOISY_LEAGUES = new Set([
  'other ratings',
  'ratings',
  'football',
  'prediction',
  'best bets',
  'today',
  'yesterday',
  'tomorrow',
  'matches',
  '',
]);

/**
 * Returns a clean, readable league/competition name.
 * Falls back to deriving it from the match URL tournament slug.
 */
export function getLeagueDisplayName(
  league: string | null | undefined,
  matchUrl?: string | null
): string {
  const raw = (league || '').trim();

  // Accept the value if it is not noisy
  if (raw && !NOISY_LEAGUES.has(raw.toLowerCase()) && raw.length > 2) {
    return raw;
  }

  // Derive from tournament URL segment: /tournaments/chl/ → "UEFA Champions League"
  if (matchUrl) {
    const tourMatch = matchUrl.match(/\/tournaments\/([^/]+)/);
    if (tourMatch) {
      const code = tourMatch[1].toLowerCase();
      if (LEAGUE_CODE_MAP[code]) return LEAGUE_CODE_MAP[code];
      // Capitalise the code as last resort
      return code.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  return 'International Football';
}

export function getFootballStatusBadge(state: string, statusText: string, minute?: string | null) {
  if (state === 'LIVE') {
    return {
      label: minute || statusText || 'LIVE',
      cls: 'bg-rose-500/10 text-rose-700 border-rose-200 font-bold animate-pulse',
      dotCls: 'bg-rose-500',
    };
  }
  if (state === 'COMPLETED') {
    return {
      label: statusText || 'FT',
      cls: 'bg-slate-100 text-slate-700 border-slate-200 font-bold',
      dotCls: 'bg-slate-400',
    };
  }
  return {
    label: statusText || 'Upcoming',
    cls: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    dotCls: 'bg-blue-500',
  };
}
