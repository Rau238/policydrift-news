/** Stroke outline assets in /public/images/desk (see ATTRIBUTION.txt). */
export const DESK_OUTLINE_SRC: Record<string, string> = {
  'World News': '/images/desk/world-map.svg',
  India: '/images/desk/india-outline.svg',
  Sports: '/images/desk/cricket-bat.svg',
  Business: '/images/desk/business-domain.svg',
  'Banking & Economics': '/images/desk/banking-bank.svg',
  Politics: '/images/desk/politics-gavel.svg',
  'Stocks & Markets': '/images/desk/markets-chart.svg',
  Crypto: '/images/desk/crypto-bitcoin.svg',
};

export function deskOutlineSrc(category: string): string | null {
  return DESK_OUTLINE_SRC[category] ?? null;
}

/** Soft tint rings for desk icon badges on dark UI */
export const DESK_ICON_TINT: Record<string, string> = {
  Breaking: 'bg-rose-500/25 ring-rose-300/50 text-rose-100',
  'World News': 'bg-sky-500/25 ring-sky-300/50 text-sky-100',
  India: 'bg-amber-500/30 ring-amber-300/55 text-amber-100',
  Sports: 'bg-lime-500/25 ring-lime-300/50 text-lime-100',
  Business: 'bg-violet-500/25 ring-violet-300/50 text-violet-100',
  'Banking & Economics': 'bg-cyan-500/25 ring-cyan-300/50 text-cyan-100',
  Politics: 'bg-indigo-500/25 ring-indigo-300/50 text-indigo-100',
  'Stocks & Markets': 'bg-emerald-500/25 ring-emerald-300/50 text-emerald-100',
  Crypto: 'bg-orange-500/25 ring-orange-300/50 text-orange-100',
  General: 'bg-teal-500/25 ring-teal-300/50 text-teal-100',
};

export function deskIconTint(category: string): string {
  return DESK_ICON_TINT[category] ?? DESK_ICON_TINT.General;
}
