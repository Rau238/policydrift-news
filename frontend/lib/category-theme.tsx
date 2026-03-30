import type { LucideIcon } from 'lucide-react';
import {
  Bitcoin,
  Briefcase,
  Globe2,
  Landmark,
  LineChart,
  MapPin,
  Newspaper,
  Zap,
} from 'lucide-react';

/** DB category keys — keep in sync with `backend/src/config/rss-feeds.js` */
export const CATEGORY_ORDER = [
  'Breaking',
  'World News',
  'India',
  'Business',
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
};

export const CATEGORY_THEME: Record<string, Theme> = {
  Breaking: {
    label: 'Breaking',
    Icon: Zap,
    chip: 'bg-rose-50 text-rose-900 ring-1 ring-rose-200/90',
    navPill:
      'bg-rose-500/15 text-rose-100 ring-rose-400/30 hover:bg-rose-500/25 hover:ring-rose-400/50',
    cardRing: 'hover:ring-rose-400/55',
    placeholder: 'from-rose-200/80 via-rose-50 to-orange-50',
  },
  'World News': {
    label: 'World News',
    Icon: Globe2,
    chip: 'bg-sky-50 text-sky-950 ring-1 ring-sky-200/90',
    navPill:
      'bg-sky-500/15 text-sky-100 ring-sky-400/30 hover:bg-sky-500/25 hover:ring-sky-400/50',
    cardRing: 'hover:ring-sky-400/55',
    placeholder: 'from-sky-200/80 via-sky-50 to-cyan-50',
  },
  India: {
    label: 'India',
    Icon: MapPin,
    chip: 'bg-amber-50 text-amber-950 ring-1 ring-amber-200/90',
    navPill:
      'bg-amber-500/15 text-amber-100 ring-amber-400/30 hover:bg-amber-500/25 hover:ring-amber-400/50',
    cardRing: 'hover:ring-amber-400/55',
    placeholder: 'from-amber-200/80 via-amber-50 to-orange-50',
  },
  Business: {
    label: 'Business',
    Icon: Briefcase,
    chip: 'bg-violet-50 text-violet-950 ring-1 ring-violet-200/90',
    navPill:
      'bg-violet-500/15 text-violet-100 ring-violet-400/30 hover:bg-violet-500/25 hover:ring-violet-400/50',
    cardRing: 'hover:ring-violet-400/55',
    placeholder: 'from-violet-200/80 via-violet-50 to-fuchsia-50',
  },
  Politics: {
    label: 'Politics',
    Icon: Landmark,
    chip: 'bg-indigo-50 text-indigo-950 ring-1 ring-indigo-200/90',
    navPill:
      'bg-indigo-500/15 text-indigo-100 ring-indigo-400/30 hover:bg-indigo-500/25 hover:ring-indigo-400/50',
    cardRing: 'hover:ring-indigo-400/55',
    placeholder: 'from-indigo-200/80 via-indigo-50 to-slate-100',
  },
  'Stocks & Markets': {
    label: 'Markets',
    Icon: LineChart,
    chip: 'bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200/90',
    navPill:
      'bg-emerald-500/15 text-emerald-100 ring-emerald-400/30 hover:bg-emerald-500/25 hover:ring-emerald-400/50',
    cardRing: 'hover:ring-emerald-400/55',
    placeholder: 'from-emerald-200/80 via-emerald-50 to-teal-50',
  },
  Crypto: {
    label: 'Crypto',
    Icon: Bitcoin,
    chip: 'bg-orange-50 text-orange-950 ring-1 ring-orange-200/90',
    navPill:
      'bg-orange-500/15 text-orange-100 ring-orange-400/30 hover:bg-orange-500/25 hover:ring-orange-400/50',
    cardRing: 'hover:ring-orange-400/55',
    placeholder: 'from-orange-200/80 via-amber-50 to-yellow-50',
  },
  General: {
    label: 'News',
    Icon: Newspaper,
    chip: 'bg-slate-100 text-slate-800 ring-1 ring-slate-200/90',
    navPill:
      'bg-slate-500/15 text-slate-100 ring-slate-400/30 hover:bg-slate-500/25 hover:ring-slate-400/50',
    cardRing: 'hover:ring-slate-400/50',
    placeholder: 'from-slate-200/80 via-slate-50 to-zinc-100',
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

/** High-contrast rows for the mobile drawer (avoids washed-out pills on slate-900). */
const DRAWER_ACCENT: Record<string, string> = {
  Breaking: 'border-l-rose-400',
  'World News': 'border-l-sky-400',
  India: 'border-l-amber-400',
  Business: 'border-l-violet-400',
  Politics: 'border-l-indigo-400',
  'Stocks & Markets': 'border-l-emerald-400',
  Crypto: 'border-l-orange-400',
  General: 'border-l-slate-400',
};

export function categoryDrawerRowClass(name: string): string {
  const accent = DRAWER_ACCENT[name] ?? DRAWER_ACCENT.General;
  return `border-l-4 ${accent} bg-slate-800 text-white ring-1 ring-white/15 hover:bg-slate-700`;
}

export function categoryCardRingClass(name: string): string {
  return categoryTheme(name).cardRing;
}

export function categoryPlaceholderClass(name: string): string {
  return categoryTheme(name).placeholder;
}

export function categoryHref(name: string): string {
  return `/blog?category=${encodeURIComponent(name)}`;
}

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
