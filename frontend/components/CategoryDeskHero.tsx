import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { categoryLabel, categoryNavPillClass, CategoryGlyph } from '@/lib/categories';

/** Soft color wash behind each desk hero (over slate base). */
const HERO_WASH: Record<string, string> = {
  Breaking: 'from-rose-950/80 via-slate-950 to-slate-950',
  'World News': 'from-sky-950/90 via-slate-950 to-cyan-950/40',
  India: 'from-amber-950/80 via-slate-950 to-orange-950/30',
  Sports: 'from-lime-950/70 via-slate-950 to-emerald-950/40',
  Business: 'from-violet-950/80 via-slate-950 to-fuchsia-950/30',
  'Banking & Economics': 'from-cyan-950/80 via-slate-950 to-teal-950/40',
  Politics: 'from-indigo-950/85 via-slate-950 to-violet-950/30',
  'Stocks & Markets': 'from-emerald-950/80 via-slate-950 to-teal-950/40',
  Crypto: 'from-orange-950/85 via-slate-950 to-amber-950/35',
  General: 'from-slate-900 via-slate-950 to-slate-950',
};

const ACCENT_ORB: Record<string, string> = {
  Breaking: 'bg-rose-500/20',
  'World News': 'bg-sky-400/20',
  India: 'bg-amber-400/20',
  Sports: 'bg-lime-400/20',
  Business: 'bg-violet-400/20',
  'Banking & Economics': 'bg-cyan-400/20',
  Politics: 'bg-indigo-400/20',
  'Stocks & Markets': 'bg-emerald-400/20',
  Crypto: 'bg-orange-400/20',
  General: 'bg-teal-400/15',
};

/** Downloaded assets in /public/images/desk — see ATTRIBUTION.txt */
function DeskAsset({
  src,
  className = '',
}: {
  src: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      className={`pointer-events-none h-full w-full object-contain object-right select-none ${className}`}
    />
  );
}

function OutlineWorld() {
  return (
    <DeskAsset
      src="/images/desk/world-map.svg"
      className="scale-[1.05] opacity-100 brightness-0 invert"
    />
  );
}

function OutlineIndia() {
  return (
    <DeskAsset
      src="/images/desk/india-outline.svg"
      className="max-w-[min(100%,28rem)] opacity-100 brightness-0 invert"
    />
  );
}

function DeskSilhouetteRow({
  icons,
}: {
  icons: { src: string; className?: string; mobileHide?: boolean }[];
}) {
  return (
    <div className="flex h-full w-full items-end justify-end gap-3 pb-2 pr-1 sm:items-center sm:gap-8 sm:pb-0 sm:pr-8">
      {icons.map((icon) => (
        <DeskAsset
          key={icon.src}
          src={icon.src}
          className={`!h-[42%] !w-auto max-h-40 opacity-100 brightness-0 invert sm:!h-[68%] sm:max-h-72 ${
            icon.mobileHide ? 'max-md:hidden' : ''
          } ${icon.className ?? ''}`}
        />
      ))}
    </div>
  );
}

function OutlineSports() {
  return (
    <DeskSilhouetteRow
      icons={[
        { src: '/images/desk/soccerball.svg', className: 'sm:!h-[58%] sm:max-h-60', mobileHide: true },
        { src: '/images/desk/cricket-bat.svg', className: 'sm:!h-[72%] sm:max-h-72' },
      ]}
    />
  );
}

function OutlineBreaking() {
  return (
    <svg viewBox="0 0 480 480" className="h-full w-full" aria-hidden>
      <path
        d="M260 40 140 250h90l-40 190 180-250h-100l90-150z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.4"
      />
      {[90, 150, 210].map((r) => (
        <circle key={r} cx="240" cy="240" r={r} fill="none" stroke="currentColor" strokeWidth="1" opacity={0.12} />
      ))}
    </svg>
  );
}

function OutlineBusiness() {
  return (
    <DeskSilhouetteRow
      icons={[
        { src: '/images/desk/business-domain.svg', className: 'sm:!h-[68%] sm:max-h-72' },
        { src: '/images/desk/business-briefcase.svg', className: 'sm:!h-[52%] sm:max-h-52', mobileHide: true },
      ]}
    />
  );
}

function OutlineBanking() {
  return (
    <DeskSilhouetteRow
      icons={[
        { src: '/images/desk/banking-bank.svg', className: 'sm:!h-[68%] sm:max-h-72' },
        { src: '/images/desk/banking-currency-usd.svg', className: 'sm:!h-[48%] sm:max-h-48', mobileHide: true },
      ]}
    />
  );
}

function OutlinePolitics() {
  return (
    <DeskSilhouetteRow
      icons={[
        { src: '/images/desk/politics-account-balance.svg', className: 'sm:!h-[68%] sm:max-h-72' },
        { src: '/images/desk/politics-gavel.svg', className: 'sm:!h-[54%] sm:max-h-56', mobileHide: true },
      ]}
    />
  );
}

function OutlineMarkets() {
  return (
    <DeskSilhouetteRow
      icons={[
        { src: '/images/desk/markets-chart.svg', className: 'sm:!h-[64%] sm:max-h-68' },
        { src: '/images/desk/markets-trending-up.svg', className: 'sm:!h-[48%] sm:max-h-48', mobileHide: true },
      ]}
    />
  );
}

function OutlineCrypto() {
  return (
    <DeskSilhouetteRow
      icons={[
        { src: '/images/desk/crypto-bitcoin.svg', className: 'sm:!h-[72%] sm:max-h-72', mobileHide: true },
        { src: '/images/desk/crypto-currency-btc.svg', className: 'sm:!h-[46%] sm:max-h-44' },
      ]}
    />
  );
}

function OutlineDefault() {
  return (
    <svg viewBox="0 0 480 360" className="h-full w-full" aria-hidden>
      <rect x="80" y="70" width="320" height="220" rx="12" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M110 120h200M110 160h260M110 200h180" stroke="currentColor" strokeWidth="1.5" opacity="0.28" />
    </svg>
  );
}

function CategoryOutline({ category }: { category: string }) {
  switch (category) {
    case 'Breaking':
      return <OutlineBreaking />;
    case 'World News':
      return <OutlineWorld />;
    case 'India':
      return <OutlineIndia />;
    case 'Sports':
      return <OutlineSports />;
    case 'Business':
      return <OutlineBusiness />;
    case 'Banking & Economics':
      return <OutlineBanking />;
    case 'Politics':
      return <OutlinePolitics />;
    case 'Stocks & Markets':
      return <OutlineMarkets />;
    case 'Crypto':
      return <OutlineCrypto />;
    default:
      return <OutlineDefault />;
  }
}

type Props = {
  category: string;
  intro: string;
  storyCount?: number;
};

export function CategoryDeskHero({ category, intro, storyCount }: Props) {
  const label = categoryLabel(category);
  const wash = HERO_WASH[category] ?? HERO_WASH.General;
  const orb = ACCENT_ORB[category] ?? ACCENT_ORB.General;

  return (
    <div
      className={`relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-br text-white ${
        HERO_WASH[category] || HERO_WASH.General
      }`}
    >
      {/* Soft ambient glow */}
      <div
        className={`pointer-events-none absolute -right-8 top-0 h-72 w-72 rounded-full blur-3xl ${
          ACCENT_ORB[category] || ACCENT_ORB.General
        }`}
        aria-hidden
      />

      {/* Desk outline art (subtle) */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 flex w-[42%] items-end justify-end opacity-[0.14] sm:inset-y-[-6%] sm:right-[-4%] sm:w-[min(52%,36rem)] sm:items-center sm:opacity-[0.24]"
        aria-hidden
      >
        <div className="h-[70%] w-full sm:h-full">
          <CategoryOutline category={category} />
        </div>
      </div>

      {/* Readable scrim over art on small screens */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/55 sm:from-slate-950/75 sm:via-slate-950/45 sm:to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14 2xl:max-w-[1440px]">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          All news
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold ring-1 ${categoryNavPillClass(category)}`}
          >
            <CategoryGlyph name={category} className="h-4 w-4" />
            Desk
          </span>
          {storyCount != null ? (
            <span className="text-sm font-medium tabular-nums text-slate-300">
              {storyCount.toLocaleString()} stories
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 max-w-[16ch] font-display text-3xl font-bold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:mt-4 sm:max-w-none sm:text-4xl md:text-5xl">
          {label}
        </h1>
        <p className="mt-2.5 max-w-xl text-[0.95rem] leading-relaxed text-slate-200 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:mt-3 sm:max-w-2xl sm:text-lg sm:text-slate-300">
          {intro}
        </p>
      </div>
    </div>
  );
}
