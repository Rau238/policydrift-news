import { CategoryGlyph, categoryLabel } from '@/lib/category-theme';
import { deskOutlineSrc } from '@/lib/desk-assets';

const CURATED_CATEGORY_IMAGE_MAP: Record<string, string> = {
  Breaking: '/images/category-curated/Breaking%20News%20Desk.avif',
  'World News': '/images/category-curated/Global%20Diplomacy%20%26%20World.jfif',
  World: '/images/category-curated/Global%20Diplomacy%20%26%20World.jfif',
  India: '/images/category-curated/Breaking%20News%20Desk.avif',
  Sports: '/images/category-curated/Stadium%20%26%20Sports%20Arena.webp',
  Business: '/images/category-curated/stock-market.webp',
  'Banking & Economics': '/images/category-curated/stock-market.webp',
  Economy: '/images/category-curated/stock-market.webp',
  Politics: '/images/category-curated/parliment%26governace.jpg',
  Technology: '/images/category-curated/ai.jfif',
  Tech: '/images/category-curated/ai.jfif',
  Science: '/images/category-curated/Science%20%26%20Deep%20Space.jpeg',
  Health: '/images/category-curated/Medical%20%26%20Healthcare.jpg',
  'Stocks & Markets': '/images/category-curated/stock-market.webp',
  Crypto: '/images/category-curated/stock-market.webp',
  General: '/images/category-curated/Breaking%20News%20Desk.avif',
};

/** Dark card-image washes when a story has no photo (per desk). */
const PLACEHOLDER_WASH: Record<string, string> = {
  Breaking: 'from-rose-950/90 via-slate-950/80 to-rose-900/60',
  'World News': 'from-sky-950/90 via-slate-950/80 to-cyan-900/60',
  India: 'from-amber-950/90 via-slate-950/80 to-orange-900/60',
  Sports: 'from-lime-950/90 via-slate-950/80 to-emerald-900/60',
  Business: 'from-violet-950/90 via-slate-950/80 to-fuchsia-900/60',
  'Banking & Economics': 'from-cyan-950/90 via-slate-950/80 to-teal-900/60',
  Politics: 'from-indigo-950/90 via-slate-950/80 to-violet-900/60',
  'Stocks & Markets': 'from-emerald-950/90 via-slate-950/80 to-teal-900/60',
  Crypto: 'from-orange-950/90 via-slate-950/80 to-amber-900/60',
  General: 'from-slate-900/90 via-slate-950/80 to-teal-950/60',
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
  const curatedImg = CURATED_CATEGORY_IMAGE_MAP[category] ?? CURATED_CATEGORY_IMAGE_MAP.General;
  const iconSrc = deskOutlineSrc(category);
  const label = categoryLabel(category);

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-950 ${className}`}
      role="img"
      aria-label={`${label} story`}
    >
      {/* Background Curated Category Photograph */}
      {curatedImg ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={curatedImg}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60 filter brightness-90 saturate-[1.15] transition-transform duration-700 ease-out hover:scale-105"
        />
      ) : null}

      {/* Atmospheric Vignette & Desk Wash */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${wash} backdrop-blur-[1px]`} aria-hidden />

      {/* Desk Outline or Glyph Badge */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 p-2 text-center">
        {iconSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={iconSrc}
            alt=""
            aria-hidden
            draggable={false}
            className={`pointer-events-none object-contain opacity-80 brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
              compact ? 'h-6 w-6' : 'h-10 w-10 sm:h-12 sm:w-12'
            }`}
          />
        ) : (
          <CategoryGlyph
            name={category}
            className={`text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${compact ? 'h-6 w-6' : 'h-10 w-10 sm:h-12 sm:w-12'}`}
          />
        )}

        {!compact && !hideCaption ? (
          <span className="pointer-events-none rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-md ring-1 ring-white/20">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
