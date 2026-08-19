import type { LucideIcon } from 'lucide-react';
import {
  Bitcoin,
  Briefcase,
  Building2,
  Coins,
  Flame,
  Globe2,
  Landmark,
  LineChart,
  MapPin,
  Newspaper,
  Scale,
  TrendingUp,
  Trophy,
  Vote,
  Wallet,
  Zap,
} from 'lucide-react';

/** DB category keys - keep in sync with `backend/src/config/rss-feeds.js` */
export const CATEGORY_ORDER = [
  'Breaking',
  'World News',
  'India',
  'Sports',
  'Business',
  'Banking & Economics',
  'Politics',
  'Stocks & Markets',
  'Crypto',
  'General',
] as const;

export type CategoryKey = (typeof CATEGORY_ORDER)[number];

type Theme = {
  label: string;
  Icon: LucideIcon;
  /** Light surface chips (cards, article header) */
  chip: string;
  /** Dark header nav pill */
  navPill: string;
  /** Hover ring tint on story cards */
  cardRing: string;
  /** Gradient placeholder when no image */
  placeholder: string;
  /** `bg-gradient-to-r` stops under the card image (per desk) */
  cardStripe: string;
  /** `ring-*` for article hero frame on `/news/[slug]` */
  articleHeroRing: string;
};

export const CATEGORY_THEME: Record<string, Theme> = {
  Breaking: {
    label: 'Breaking',
    Icon: Flame,
    chip: 'bg-rose-50 text-rose-900 ring-1 ring-rose-200/90',
    navPill:
      'bg-rose-500/15 text-rose-100 ring-rose-400/30 hover:bg-rose-500/25 hover:ring-rose-400/50',
    cardRing: 'hover:ring-rose-400/55',
    placeholder: 'from-rose-200/80 via-rose-50 to-orange-50',
    cardStripe: 'from-rose-500/80 via-rose-400/35 to-teal-500/20',
    articleHeroRing: 'ring-rose-300/75',
  },
  'World News': {
    label: 'World News',
    Icon: Globe2,
    chip: 'bg-sky-50 text-sky-950 ring-1 ring-sky-200/90',
    navPill:
      'bg-sky-500/15 text-sky-100 ring-sky-400/30 hover:bg-sky-500/25 hover:ring-sky-400/50',
    cardRing: 'hover:ring-sky-400/55',
    placeholder: 'from-sky-200/80 via-sky-50 to-cyan-50',
    cardStripe: 'from-sky-500/80 via-cyan-400/35 to-teal-500/20',
    articleHeroRing: 'ring-sky-300/75',
  },
  India: {
    label: 'India',
    Icon: MapPin,
    chip: 'bg-amber-50 text-amber-950 ring-1 ring-amber-200/90',
    navPill:
      'bg-amber-500/15 text-amber-100 ring-amber-400/30 hover:bg-amber-500/25 hover:ring-amber-400/50',
    cardRing: 'hover:ring-amber-400/55',
    placeholder: 'from-amber-200/80 via-amber-50 to-orange-50',
    cardStripe: 'from-amber-500/80 via-orange-400/35 to-rose-500/15',
    articleHeroRing: 'ring-amber-300/75',
  },
  Sports: {
    label: 'Sports',
    Icon: Trophy,
    chip: 'bg-lime-50 text-lime-950 ring-1 ring-lime-200/90',
    navPill:
      'bg-lime-500/20 text-lime-100 ring-lime-400/35 hover:bg-lime-500/30 hover:ring-lime-400/55',
    cardRing: 'hover:ring-lime-400/55',
    placeholder: 'from-lime-200/80 via-green-50 to-emerald-50',
    cardStripe: 'from-lime-500/80 via-emerald-400/35 to-teal-500/20',
    articleHeroRing: 'ring-lime-300/75',
  },
  Business: {
    label: 'Business',
    Icon: Building2,
    chip: 'bg-violet-50 text-violet-950 ring-1 ring-violet-200/90',
    navPill:
      'bg-violet-500/15 text-violet-100 ring-violet-400/30 hover:bg-violet-500/25 hover:ring-violet-400/50',
    cardRing: 'hover:ring-violet-400/55',
    placeholder: 'from-violet-200/80 via-violet-50 to-fuchsia-50',
    cardStripe: 'from-violet-500/80 via-fuchsia-400/35 to-teal-500/20',
    articleHeroRing: 'ring-violet-300/75',
  },
  'Banking & Economics': {
    label: 'Banking & Economics',
    Icon: Landmark,
    chip: 'bg-cyan-50 text-cyan-950 ring-1 ring-cyan-200/90',
    navPill:
      'bg-cyan-500/15 text-cyan-100 ring-cyan-400/30 hover:bg-cyan-500/25 hover:ring-cyan-400/50',
    cardRing: 'hover:ring-cyan-400/55',
    placeholder: 'from-cyan-200/80 via-cyan-50 to-teal-50',
    cardStripe: 'from-cyan-500/80 via-teal-400/40 to-sky-500/20',
    articleHeroRing: 'ring-cyan-300/75',
  },
  Politics: {
    label: 'Politics',
    Icon: Vote,
    chip: 'bg-indigo-50 text-indigo-950 ring-1 ring-indigo-200/90',
    navPill:
      'bg-indigo-500/15 text-indigo-100 ring-indigo-400/30 hover:bg-indigo-500/25 hover:ring-indigo-400/50',
    cardRing: 'hover:ring-indigo-400/55',
    placeholder: 'from-indigo-200/80 via-indigo-50 to-slate-100',
    cardStripe: 'from-indigo-500/80 via-violet-400/35 to-sky-500/20',
    articleHeroRing: 'ring-indigo-300/75',
  },
  'Stocks & Markets': {
    label: 'Markets',
    Icon: TrendingUp,
    chip: 'bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200/90',
    navPill:
      'bg-emerald-500/15 text-emerald-100 ring-emerald-400/30 hover:bg-emerald-500/25 hover:ring-emerald-400/50',
    cardRing: 'hover:ring-emerald-400/55',
    placeholder: 'from-emerald-200/80 via-emerald-50 to-teal-50',
    cardStripe: 'from-emerald-500/80 via-teal-400/40 to-cyan-500/20',
    articleHeroRing: 'ring-emerald-300/75',
  },
  Crypto: {
    label: 'Crypto',
    Icon: Coins,
    chip: 'bg-orange-50 text-orange-950 ring-1 ring-orange-200/90',
    navPill:
      'bg-orange-500/15 text-orange-100 ring-orange-400/30 hover:bg-orange-500/25 hover:ring-orange-400/50',
    cardRing: 'hover:ring-orange-400/55',
    placeholder: 'from-orange-200/80 via-amber-50 to-yellow-50',
    cardStripe: 'from-orange-500/80 via-amber-400/40 to-yellow-500/25',
    articleHeroRing: 'ring-orange-300/75',
  },
  General: {
    label: 'News',
    Icon: Newspaper,
    chip: 'bg-slate-100 text-slate-800 ring-1 ring-slate-200/90',
    navPill:
      'bg-slate-500/15 text-slate-100 ring-slate-400/30 hover:bg-slate-500/25 hover:ring-slate-400/50',
    cardRing: 'hover:ring-slate-400/50',
    placeholder: 'from-slate-200/80 via-slate-50 to-zinc-100',
    cardStripe: 'from-slate-500/70 via-slate-400/30 to-teal-500/20',
    articleHeroRing: 'ring-slate-300/70',
  },
};

export function categoryTheme(name: string): Theme {
  return CATEGORY_THEME[name] ?? CATEGORY_THEME.General;
}

export function categoryLabel(name: string): string {
  return categoryTheme(name).label;
}

export function categoryChipClass(name: string): string {
  return categoryTheme(name).chip;
}

export function categoryNavPillClass(name: string): string {
  return categoryTheme(name).navPill;
}

/** Left accent bar - drawer rows, article “more in desk” rail, etc. */
const CATEGORY_VERTICAL_ACCENT: Record<string, string> = {
  Breaking: 'border-l-rose-400',
  'World News': 'border-l-sky-400',
  India: 'border-l-amber-400',
  Sports: 'border-l-lime-400',
  Business: 'border-l-violet-400',
  'Banking & Economics': 'border-l-cyan-400',
  Politics: 'border-l-indigo-400',
  'Stocks & Markets': 'border-l-emerald-400',
  Crypto: 'border-l-orange-400',
  General: 'border-l-slate-400',
};

export function categoryVerticalBarClass(name: string): string {
  return CATEGORY_VERTICAL_ACCENT[name] ?? CATEGORY_VERTICAL_ACCENT.General;
}

/** High-contrast rows for the mobile drawer (avoids washed-out pills on slate-900). */
export function categoryDrawerRowClass(name: string): string {
  const accent = categoryVerticalBarClass(name);
  return `border-l-4 ${accent} bg-slate-800 text-white ring-1 ring-white/15 hover:bg-slate-700`;
}

export function categoryCardRingClass(name: string): string {
  return categoryTheme(name).cardRing;
}

/** Gradient bar under card hero image - matches desk colors. */
export function categoryCardStripeClass(name: string): string {
  return categoryTheme(name).cardStripe;
}

/** Ring around article detail hero - matches desk colors. */
export function categoryArticleHeroRingClass(name: string): string {
  return categoryTheme(name).articleHeroRing;
}

export function categoryPlaceholderClass(name: string): string {
  return categoryTheme(name).placeholder;
}

/** Curated rich card background colors matching the visual mosaic aesthetic */
export const CARD_COLOR_PALETTE = [
  'bg-[#5e8328]', // 1. Olive Meadow Green
  'bg-[#b06e30]', // 2. Warm Wildfire Caramel
  'bg-[#9c1c58]', // 3. Raspberry Rose
  'bg-[#1e40af]', // 4. Royal Cobalt Blue
  'bg-[#6b21a8]', // 5. Royal Purple / Amethyst
  'bg-[#2563eb]', // 6. Vibrant Developer Blue
  'bg-[#18233c]', // 7. SpaceX Night Navy
  'bg-[#881337]', // 8. Deep Crimson / Wine
  'bg-[#0f766e]', // 9. Standoff Ocean Teal
  'bg-[#b45309]', // 10. Warm Amber / Mustard
  'bg-[#155e75]', // 11. Deep Cyan / Nordic Blue
  'bg-[#047857]', // 12. Forest Emerald / Green
  'bg-[#831843]', // 13. Blackberry / Wine Red
  'bg-[#1e293b]', // 14. Slate Graphite
  'bg-[#0284c7]', // 15. Sky Cobalt
  'bg-[#c2410c]', // 16. Sunset Terracotta / Copper
  'bg-[#991b1b]', // 17. Cardinal Red
  'bg-[#4c1d95]', // 18. Midnight Violet
  'bg-[#0369a1]', // 19. Pacific Azure
  'bg-[#3f6212]', // 20. Deep Alpine Green
  'bg-[#a16207]', // 21. Ochre Gold
  'bg-[#065f46]', // 22. Deep Evergreen
  'bg-[#86198f]', // 23. Magenta Orchid
  'bg-[#1e3a8a]', // 24. Classic Sapphire
  'bg-[#9f1239]', // 25. Ruby Rose
  'bg-[#134e4a]', // 26. Deep Forest Teal
  'bg-[#701a75]', // 27. Dark Violet Velvet
  'bg-[#172554]', // 28. Deep Prussian Navy
  'bg-[#ca8a04]', // 29. Rich Mustard Amber
  'bg-[#059669]', // 30. Vivid Jade Mint
  'bg-[#a21caf]', // 31. Electric Fuchsia
  'bg-[#3730a3]', // 32. Electric Indigo
  'bg-[#9a3412]', // 33. Burnt Orange Rust
  'bg-[#0e7490]', // 34. Deep Sea Cyan
  'bg-[#be185d]', // 35. Cerise Pink
  'bg-[#334155]', // 36. Titanium Slate
] as const;

export const CATEGORY_CARD_BG: Record<string, string> = {
  Breaking: 'bg-[#881337]',
  'World News': 'bg-[#1e40af]',
  India: 'bg-[#b06e30]',
  Sports: 'bg-[#5e8328]',
  Business: 'bg-[#6b21a8]',
  'Banking & Economics': 'bg-[#0f766e]',
  Politics: 'bg-[#18233c]',
  'Stocks & Markets': 'bg-[#047857]',
  Crypto: 'bg-[#c2410c]',
  General: 'bg-[#2563eb]',
};

export const CARD_HEX_PALETTE = [
  '#5e8328', // 1. Olive Meadow Green
  '#b06e30', // 2. Warm Wildfire Caramel
  '#9c1c58', // 3. Raspberry Rose
  '#1e40af', // 4. Royal Cobalt Blue
  '#6b21a8', // 5. Royal Purple / Amethyst
  '#2563eb', // 6. Vibrant Developer Blue
  '#18233c', // 7. SpaceX Night Navy
  '#881337', // 8. Deep Crimson / Wine
  '#0f766e', // 9. Standoff Ocean Teal
  '#b45309', // 10. Warm Amber / Mustard
  '#155e75', // 11. Deep Cyan / Nordic Blue
  '#047857', // 12. Forest Emerald / Green
  '#831843', // 13. Blackberry / Wine Red
  '#1e293b', // 14. Slate Graphite
  '#0284c7', // 15. Sky Cobalt
  '#c2410c', // 16. Sunset Terracotta / Copper
  '#991b1b', // 17. Cardinal Red
  '#4c1d95', // 18. Midnight Violet
  '#0369a1', // 19. Pacific Azure
  '#3f6212', // 20. Deep Alpine Green
  '#a16207', // 21. Ochre Gold
  '#065f46', // 22. Deep Evergreen
  '#86198f', // 23. Magenta Orchid
  '#1e3a8a', // 24. Classic Sapphire
  '#9f1239', // 25. Ruby Rose
  '#134e4a', // 26. Deep Forest Teal
  '#701a75', // 27. Dark Violet Velvet
  '#172554', // 28. Deep Prussian Navy
  '#ca8a04', // 29. Rich Mustard Amber
  '#059669', // 30. Vivid Jade Mint
  '#a21caf', // 31. Electric Fuchsia
  '#3730a3', // 32. Electric Indigo
  '#9a3412', // 33. Burnt Orange Rust
  '#0e7490', // 34. Deep Sea Cyan
  '#be185d', // 35. Cerise Pink
  '#334155', // 36. Titanium Slate
] as const;

export const CATEGORY_CARD_HEX: Record<string, string> = {
  Breaking: '#881337',
  'World News': '#1e40af',
  India: '#b06e30',
  Sports: '#5e8328',
  Business: '#6b21a8',
  'Banking & Economics': '#0f766e',
  Politics: '#18233c',
  'Stocks & Markets': '#047857',
  Crypto: '#c2410c',
  General: '#2563eb',
};

export function getCardBgHex(category?: string, index?: number, id?: number): string {
  if (typeof index === 'number') {
    return CARD_HEX_PALETTE[Math.abs(index) % CARD_HEX_PALETTE.length];
  }
  if (typeof id === 'number') {
    return CARD_HEX_PALETTE[Math.abs(id) % CARD_HEX_PALETTE.length];
  }
  if (category && CATEGORY_CARD_HEX[category]) {
    return CATEGORY_CARD_HEX[category];
  }
  return '#1e40af';
}

export function getCardBgClass(category?: string, index?: number, id?: number): string {
  if (typeof index === 'number') {
    return CARD_COLOR_PALETTE[Math.abs(index) % CARD_COLOR_PALETTE.length];
  }
  if (typeof id === 'number') {
    return CARD_COLOR_PALETTE[Math.abs(id) % CARD_COLOR_PALETTE.length];
  }
  if (category && CATEGORY_CARD_BG[category]) {
    return CATEGORY_CARD_BG[category];
  }
  return 'bg-[#1e40af]';
}


export { categoryHref } from './category-routes';

export function CategoryGlyph({
  name,
  className = 'h-3.5 w-3.5 shrink-0',
}: {
  name: string;
  className?: string;
}) {
  const { Icon } = categoryTheme(name);
  return <Icon className={className} strokeWidth={2.25} aria-hidden />;
}

