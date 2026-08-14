import { CategoryGlyph, categoryLabel } from '@/lib/category-theme';
import { deskOutlineSrc } from '@/lib/desk-assets';

/** Dark card-image washes when a story has no photo (per desk). */
const PLACEHOLDER_WASH: Record<string, string> = {
  Breaking: 'from-rose-950 via-slate-950 to-rose-900/80',
  'World News': 'from-sky-950 via-slate-950 to-cyan-900/70',
  India: 'from-amber-950 via-slate-950 to-orange-900/70',
  Sports: 'from-lime-950 via-slate-950 to-emerald-900/70',
  Business: 'from-violet-950 via-slate-950 to-fuchsia-900/60',
  'Banking & Economics': 'from-cyan-950 via-slate-950 to-teal-900/70',
  Politics: 'from-indigo-950 via-slate-950 to-violet-900/60',
  'Stocks & Markets': 'from-emerald-950 via-slate-950 to-teal-900/70',
  Crypto: 'from-orange-950 via-slate-950 to-amber-900/70',
  General: 'from-slate-900 via-slate-950 to-teal-950/80',
};

const ACCENT_ORB: Record<string, string> = {
  Breaking: 'bg-rose-400/25',
  'World News': 'bg-sky-400/25',
  India: 'bg-amber-400/25',
  Sports: 'bg-lime-400/25',
  Business: 'bg-violet-400/25',
  'Banking & Economics': 'bg-cyan-400/25',
  Politics: 'bg-indigo-400/25',
  'Stocks & Markets': 'bg-emerald-400/25',
  Crypto: 'bg-orange-400/25',
  General: 'bg-teal-400/20',
};

type Props = {
  category: string;
  className?: string;
  /** Smaller thumbs (sidebar / trending) */
  compact?: boolean;
  /** Hide the category caption under the icon (cards already show a chip) */
  hideCaption?: boolean;
};

export function CategoryStoryPlaceholder({ category, className = '', compact, hideCaption }: Props) {
  const wash = PLACEHOLDER_WASH[category] ?? PLACEHOLDER_WASH.General;
  const orb = ACCENT_ORB[category] ?? ACCENT_ORB.General;
  const iconSrc = deskOutlineSrc(category);
  const label = categoryLabel(category);

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${wash} ${className}`}
      role="img"
      aria-label={`${label} story`}
    >
      <div className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full ${orb} blur-2xl`} aria-hidden />
      <div className={`pointer-events-none absolute -bottom-8 -left-4 h-24 w-24 rounded-full ${orb} blur-2xl`} aria-hidden />

      {iconSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconSrc}
          alt=""
          aria-hidden
          draggable={false}
          className={`pointer-events-none object-contain opacity-[0.55] brightness-0 invert ${
            compact ? 'h-[70%] w-[70%] max-h-14' : 'h-[58%] w-[58%] max-h-36'
          }`}
        />
      ) : (
        <CategoryGlyph
          name={category}
          className={`text-white/55 ${compact ? 'h-8 w-8' : 'h-16 w-16 sm:h-20 sm:w-20'}`}
        />
      )}

      {!compact && !hideCaption ? (
        <span className="pointer-events-none absolute bottom-3 left-3 right-3 truncate text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45 sm:text-xs">
          {label}
        </span>
      ) : null}
    </div>
  );
}
