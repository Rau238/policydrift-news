/**
 * Cricket team flag resolver with crisp SVG / Flag CDN images,
 * ensuring 100% cross-platform support across Windows, macOS, Android, and iOS.
 */

export interface TeamMeta {
  name: string;
  shortName: string;
  iso: string; // ISO 3166-1 alpha-2 or custom
  flagUrl: string;
  color: string;
  bgGradient: string;
}

const CRICKET_TEAMS: Record<string, TeamMeta> = {
  india: {
    name: 'India',
    shortName: 'IND',
    iso: 'in',
    flagUrl: 'https://flagcdn.com/w40/in.png',
    color: '#1d4ed8',
    bgGradient: 'from-blue-600 to-sky-500',
  },
  australia: {
    name: 'Australia',
    shortName: 'AUS',
    iso: 'au',
    flagUrl: 'https://flagcdn.com/w40/au.png',
    color: '#eab308',
    bgGradient: 'from-amber-500 to-yellow-400',
  },
  england: {
    name: 'England',
    shortName: 'ENG',
    iso: 'gb-eng',
    flagUrl: 'https://flagcdn.com/w40/gb-eng.png',
    color: '#dc2626',
    bgGradient: 'from-rose-600 to-red-500',
  },
  pakistan: {
    name: 'Pakistan',
    shortName: 'PAK',
    iso: 'pk',
    flagUrl: 'https://flagcdn.com/w40/pk.png',
    color: '#15803d',
    bgGradient: 'from-emerald-700 to-green-600',
  },
  'south africa': {
    name: 'South Africa',
    shortName: 'SA',
    iso: 'za',
    flagUrl: 'https://flagcdn.com/w40/za.png',
    color: '#047857',
    bgGradient: 'from-emerald-600 to-yellow-500',
  },
  'new zealand': {
    name: 'New Zealand',
    shortName: 'NZ',
    iso: 'nz',
    flagUrl: 'https://flagcdn.com/w40/nz.png',
    color: '#0f172a',
    bgGradient: 'from-slate-800 to-slate-950',
  },
  'sri lanka': {
    name: 'Sri Lanka',
    shortName: 'SL',
    iso: 'lk',
    flagUrl: 'https://flagcdn.com/w40/lk.png',
    color: '#1d4ed8',
    bgGradient: 'from-blue-700 to-amber-500',
  },
  bangladesh: {
    name: 'Bangladesh',
    shortName: 'BAN',
    iso: 'bd',
    flagUrl: 'https://flagcdn.com/w40/bd.png',
    color: '#065f46',
    bgGradient: 'from-emerald-800 to-rose-600',
  },
  afghanistan: {
    name: 'Afghanistan',
    shortName: 'AFG',
    iso: 'af',
    flagUrl: 'https://flagcdn.com/w40/af.png',
    color: '#2563eb',
    bgGradient: 'from-blue-600 to-red-600',
  },
  'west indies': {
    name: 'West Indies',
    shortName: 'WI',
    iso: 'jm',
    flagUrl: 'https://flagcdn.com/w40/jm.png',
    color: '#881337',
    bgGradient: 'from-rose-900 to-amber-600',
  },
  ireland: {
    name: 'Ireland',
    shortName: 'IRE',
    iso: 'ie',
    flagUrl: 'https://flagcdn.com/w40/ie.png',
    color: '#16a34a',
    bgGradient: 'from-green-600 to-emerald-500',
  },
  zimbabwe: {
    name: 'Zimbabwe',
    shortName: 'ZIM',
    iso: 'zw',
    flagUrl: 'https://flagcdn.com/w40/zw.png',
    color: '#dc2626',
    bgGradient: 'from-red-600 to-yellow-500',
  },
  netherlands: {
    name: 'Netherlands',
    shortName: 'NED',
    iso: 'nl',
    flagUrl: 'https://flagcdn.com/w40/nl.png',
    color: '#ea580c',
    bgGradient: 'from-orange-600 to-amber-500',
  },
  scotland: {
    name: 'Scotland',
    shortName: 'SCO',
    iso: 'gb-sct',
    flagUrl: 'https://flagcdn.com/w40/gb-sct.png',
    color: '#1e40af',
    bgGradient: 'from-blue-700 to-indigo-800',
  },
  namibia: {
    name: 'Namibia',
    shortName: 'NAM',
    iso: 'na',
    flagUrl: 'https://flagcdn.com/w40/na.png',
    color: '#0284c7',
    bgGradient: 'from-sky-600 to-blue-700',
  },
  oman: {
    name: 'Oman',
    shortName: 'OMA',
    iso: 'om',
    flagUrl: 'https://flagcdn.com/w40/om.png',
    color: '#dc2626',
    bgGradient: 'from-red-600 to-emerald-600',
  },
  uae: {
    name: 'UAE',
    shortName: 'UAE',
    iso: 'ae',
    flagUrl: 'https://flagcdn.com/w40/ae.png',
    color: '#059669',
    bgGradient: 'from-emerald-600 to-red-600',
  },
  'united arab emirates': {
    name: 'UAE',
    shortName: 'UAE',
    iso: 'ae',
    flagUrl: 'https://flagcdn.com/w40/ae.png',
    color: '#059669',
    bgGradient: 'from-emerald-600 to-red-600',
  },
  usa: {
    name: 'USA',
    shortName: 'USA',
    iso: 'us',
    flagUrl: 'https://flagcdn.com/w40/us.png',
    color: '#2563eb',
    bgGradient: 'from-blue-700 to-red-600',
  },
  'united states': {
    name: 'USA',
    shortName: 'USA',
    iso: 'us',
    flagUrl: 'https://flagcdn.com/w40/us.png',
    color: '#2563eb',
    bgGradient: 'from-blue-700 to-red-600',
  },
  nepal: {
    name: 'Nepal',
    shortName: 'NEP',
    iso: 'np',
    flagUrl: 'https://flagcdn.com/w40/np.png',
    color: '#dc2626',
    bgGradient: 'from-red-600 to-blue-700',
  },
  canada: {
    name: 'Canada',
    shortName: 'CAN',
    iso: 'ca',
    flagUrl: 'https://flagcdn.com/w40/ca.png',
    color: '#dc2626',
    bgGradient: 'from-red-600 to-rose-500',
  },
  uganda: {
    name: 'Uganda',
    shortName: 'UGA',
    iso: 'ug',
    flagUrl: 'https://flagcdn.com/w40/ug.png',
    color: '#ca8a04',
    bgGradient: 'from-yellow-600 to-red-600',
  },
  bahrain: {
    name: 'Bahrain',
    shortName: 'BHR',
    iso: 'bh',
    flagUrl: 'https://flagcdn.com/w40/bh.png',
    color: '#dc2626',
    bgGradient: 'from-red-600 to-rose-700',
  },
  kenya: {
    name: 'Kenya',
    shortName: 'KEN',
    iso: 'ke',
    flagUrl: 'https://flagcdn.com/w40/ke.png',
    color: '#15803d',
    bgGradient: 'from-green-700 to-red-600',
  },
  kuwait: {
    name: 'Kuwait',
    shortName: 'KUW',
    iso: 'kw',
    flagUrl: 'https://flagcdn.com/w40/kw.png',
    color: '#16a34a',
    bgGradient: 'from-emerald-600 to-red-600',
  },
  qatar: {
    name: 'Qatar',
    shortName: 'QAT',
    iso: 'qa',
    flagUrl: 'https://flagcdn.com/w40/qa.png',
    color: '#881337',
    bgGradient: 'from-rose-950 to-rose-800',
  },
  malaysia: {
    name: 'Malaysia',
    shortName: 'MAS',
    iso: 'my',
    flagUrl: 'https://flagcdn.com/w40/my.png',
    color: '#2563eb',
    bgGradient: 'from-blue-600 to-yellow-500',
  },
  singapore: {
    name: 'Singapore',
    shortName: 'SGP',
    iso: 'sg',
    flagUrl: 'https://flagcdn.com/w40/sg.png',
    color: '#dc2626',
    bgGradient: 'from-red-600 to-rose-500',
  },
  'hong kong': {
    name: 'Hong Kong',
    shortName: 'HK',
    iso: 'hk',
    flagUrl: 'https://flagcdn.com/w40/hk.png',
    color: '#dc2626',
    bgGradient: 'from-red-600 to-rose-600',
  },
  italy: {
    name: 'Italy',
    shortName: 'ITA',
    iso: 'it',
    flagUrl: 'https://flagcdn.com/w40/it.png',
    color: '#16a34a',
    bgGradient: 'from-green-600 to-blue-600',
  },
  germany: {
    name: 'Germany',
    shortName: 'GER',
    iso: 'de',
    flagUrl: 'https://flagcdn.com/w40/de.png',
    color: '#eab308',
    bgGradient: 'from-yellow-600 to-red-600',
  },
  bermuda: {
    name: 'Bermuda',
    shortName: 'BER',
    iso: 'bm',
    flagUrl: 'https://flagcdn.com/w40/bm.png',
    color: '#2563eb',
    bgGradient: 'from-blue-600 to-red-600',
  },
  'papua new guinea': {
    name: 'PNG',
    shortName: 'PNG',
    iso: 'pg',
    flagUrl: 'https://flagcdn.com/w40/pg.png',
    color: '#dc2626',
    bgGradient: 'from-red-600 to-yellow-600',
  },
};

/**
 * Resolves any team name into a rich metadata object with real flag URL and clean initials.
 */
export function getTeamMeta(rawTeamName?: string): TeamMeta {
  if (!rawTeamName) {
    return {
      name: 'Team',
      shortName: 'TM',
      iso: 'un',
      flagUrl: 'https://flagcdn.com/w40/un.png',
      color: '#059669',
      bgGradient: 'from-emerald-600 to-teal-700',
    };
  }

  const clean = rawTeamName.toLowerCase().trim();

  // 1. Direct match
  if (CRICKET_TEAMS[clean]) {
    return CRICKET_TEAMS[clean];
  }

  // 2. Partial substring match
  for (const [key, meta] of Object.entries(CRICKET_TEAMS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return {
        ...meta,
        name: rawTeamName,
      };
    }
  }

  // 3. Fallback abbreviation generator
  const words = rawTeamName.split(/[\s-]+/).filter(Boolean);
  let initials = '';
  if (words.length === 1) {
    initials = words[0].slice(0, 3).toUpperCase();
  } else {
    initials = words.map((w) => w[0]).join('').slice(0, 3).toUpperCase();
  }

  return {
    name: rawTeamName,
    shortName: initials || 'TM',
    iso: 'un',
    flagUrl: '',
    color: '#0284c7',
    bgGradient: 'from-slate-700 to-slate-900',
  };
}

/**
 * Parses match title string into two team objects and match description.
 */
export function parseMatchTeams(title: string): { team1: TeamMeta; team2: TeamMeta; seriesSuffix: string } {
  if (!title) {
    return {
      team1: getTeamMeta('Team 1'),
      team2: getTeamMeta('Team 2'),
      seriesSuffix: '',
    };
  }

  const parts = title.split(',');
  const vsPart = parts[0] || title;
  const seriesSuffix = parts.slice(1).join(',').trim();

  const teamNames = vsPart.split(/\s+(?:vs\.?|v\.?)\s+/i);

  const team1 = getTeamMeta(teamNames[0]?.trim());
  const team2 = getTeamMeta(teamNames[1]?.trim());

  return { team1, team2, seriesSuffix };
}

/**
 * Creates an SEO-friendly VS-formation match slug, e.g.
 * "india-vs-pakistan-167867" from title "India vs Pakistan, 2nd ODI" and matchId 167867.
 */
export function getMatchSlug(
  titleOrMatch: string | { title?: string; match_id?: string | number },
  fallbackId?: string | number
): string {
  let title = '';
  let id = '';

  if (typeof titleOrMatch === 'string') {
    title = titleOrMatch;
    id = String(fallbackId || '');
  } else if (titleOrMatch && typeof titleOrMatch === 'object') {
    title = titleOrMatch.title || '';
    id = String(titleOrMatch.match_id || fallbackId || '');
  }

  const { team1, team2 } = parseMatchTeams(title);
  const cleanTeam1 = team1.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const cleanTeam2 = team2.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (cleanTeam1 && cleanTeam2 && cleanTeam1 !== 'team-1' && cleanTeam2 !== 'team-2') {
    return id ? `${cleanTeam1}-vs-${cleanTeam2}-${id}` : `${cleanTeam1}-vs-${cleanTeam2}`;
  }

  // Fallback to title slug
  const titleSlug = (title || 'match')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

  return id ? `${titleSlug}-${id}` : titleSlug;
}

/**
 * Returns the full /sports/cricket/:vs-slug URL.
 */
export function getMatchUrl(
  titleOrMatch: string | { title?: string; match_id?: string | number },
  fallbackId?: string | number
): string {
  const slug = getMatchSlug(titleOrMatch, fallbackId);
  return `/sports/cricket/${slug}`;
}

