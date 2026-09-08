import { CategoryGlyph, categoryLabel, getCardBgHex } from '@/lib/category-theme';
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

/** Vibrant atmospheric washes per desk to enrich photo tone without blacking it out. */
const PLACEHOLDER_WASH: Record<string, string> = {
  Breaking: 'from-rose-950/70 via-rose-900/20 to-transparent',
  'World News': 'from-sky-950/70 via-blue-900/20 to-transparent',
  India: 'from-amber-950/70 via-orange-900/20 to-transparent',
  Sports: 'from-emerald-950/70 via-teal-900/20 to-transparent',
  Business: 'from-violet-950/70 via-purple-900/20 to-transparent',
  'Banking & Economics': 'from-teal-950/70 via-cyan-900/20 to-transparent',
  Politics: 'from-indigo-950/70 via-blue-900/20 to-transparent',
  'Stocks & Markets': 'from-emerald-950/70 via-emerald-900/20 to-transparent',
  Crypto: 'from-orange-950/70 via-amber-900/20 to-transparent',
  General: 'from-slate-950/70 via-slate-900/20 to-transparent',
};

type Props = {
  category: string;
  className?: string;
  compact?: boolean;
  hideCaption?: boolean;
};

export function CategoryStoryPlaceholder({ category, className = '', compact, hideCaption }: Props) {
  const wash = PLACEHOLDER_WASH[category] ?? PLACEHOLDER_WASH.General;
  const curatedImg = CURATED_CATEGORY_IMAGE_MAP[category] ?? CURATED_CATEGORY_IMAGE_MAP.General;
  const iconSrc = deskOutlineSrc(category);
  const label = categoryLabel(category);
  const baseBgHex = getCardBgHex(category);

  return (
    <div
      style={{ backgroundColor: baseBgHex }}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit] ${className}`}
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
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90 filter brightness-100 contrast-105 transition-transform duration-700 ease-out hover:scale-105"
        />
      ) : null}

      {/* Atmospheric Vignette & Desk Wash */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${wash}`} aria-hidden />

      {/* Desk Outline or Glyph Badge: only display in center if no curated photo or in large card view */}
      {(!curatedImg || !compact) ? (
        <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 p-2 text-center">
          {iconSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={iconSrc}
              alt=""
              aria-hidden
              draggable={false}
              className={`pointer-events-none object-contain opacity-85 brightness-0 invert ${compact ? 'h-6 w-6' : 'h-10 w-10 sm:h-12 sm:w-12'
                }`}
            />
          ) : (
            <CategoryGlyph
              name={category}
              className={`text-white/85 ${compact ? 'h-6 w-6' : 'h-10 w-10 sm:h-12 sm:w-12'}`}
            />
          )}

          {!compact && !hideCaption ? (
            <span className="pointer-events-none rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white border border-white/20">
              {label}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
