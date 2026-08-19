'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  ArrowRightLeft,
  ChevronRight,
  Coins,
  Droplet,
  Fuel,
  Gem,
  Globe,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { MarketQuoteRow, MarketQuotesResponse } from '@/lib/types';
import { formatDate, formatRelativeTime } from '@/lib/format';

const POLL_MS = 60_000;
const NUM_LOCALE = 'en-US';

const SECTION_ORDER = [
  'us',
  'india',
  'china',
  'united_kingdom',
  'japan',
  'germany',
  'commodities',
  'fx',
  'crypto',
] as const;

type SectionKey = (typeof SECTION_ORDER)[number];

const SECTION_SHORT: Record<SectionKey, string> = {
  us: 'US',
  india: 'IN',
  china: 'CN',
  united_kingdom: 'UK',
  japan: 'JP',
  germany: 'DE',
  commodities: 'Cmd',
  fx: 'FX',
  crypto: '₿',
};

const SECTION_FULL: Record<SectionKey, string> = {
  us: 'United States',
  india: 'India',
  china: 'China',
  united_kingdom: 'United Kingdom',
  japan: 'Japan',
  germany: 'Germany',
  commodities: 'Commodities',
  fx: 'Foreign exchange',
  crypto: 'Cryptocurrencies',
};

/** Left edge on table rows (desktop); top accent on mobile card grid. */
const ROW_STRIPE: Record<SectionKey, string> = {
  us: 'border-l-[3px] border-l-blue-500 max-lg:border-l-0 max-lg:border-t-[3px] max-lg:border-t-blue-500',
  india: 'border-l-[3px] border-l-amber-500 max-lg:border-l-0 max-lg:border-t-[3px] max-lg:border-t-amber-500',
  china: 'border-l-[3px] border-l-red-600 max-lg:border-l-0 max-lg:border-t-[3px] max-lg:border-t-red-600',
  united_kingdom:
    'border-l-[3px] border-l-indigo-500 max-lg:border-l-0 max-lg:border-t-[3px] max-lg:border-t-indigo-500',
  japan: 'border-l-[3px] border-l-rose-500 max-lg:border-l-0 max-lg:border-t-[3px] max-lg:border-t-rose-500',
  germany: 'border-l-[3px] border-l-slate-600 max-lg:border-l-0 max-lg:border-t-[3px] max-lg:border-t-slate-600',
  commodities:
    'border-l-[3px] border-l-yellow-600 max-lg:border-l-0 max-lg:border-t-[3px] max-lg:border-t-yellow-600',
  fx: 'border-l-[3px] border-l-teal-500 max-lg:border-l-0 max-lg:border-t-[3px] max-lg:border-t-teal-500',
  crypto: 'border-l-[3px] border-l-violet-500 max-lg:border-l-0 max-lg:border-t-[3px] max-lg:border-t-violet-500',
};

/** Top accent on detail popover - matches row stripe. */
const POPOVER_ACCENT: Record<SectionKey, string> = {
  us: 'from-blue-500 to-indigo-400',
  india: 'from-amber-500 to-orange-500',
  china: 'from-red-600 to-rose-500',
  united_kingdom: 'from-indigo-500 to-violet-400',
  japan: 'from-rose-500 to-red-400',
  germany: 'from-slate-600 to-amber-600',
  commodities: 'from-yellow-500 to-amber-700',
  fx: 'from-teal-500 to-cyan-400',
  crypto: 'from-violet-500 to-fuchsia-500',
};

const SECTION_BY_INSTRUMENT_ID: Record<string, SectionKey> = {
  gspc: 'us',
  dji: 'us',
  ixic: 'us',
  vix: 'us',
  nsei: 'india',
  bsesn: 'india',
  sse: 'china',
  ftse: 'united_kingdom',
  n225: 'japan',
  gdaxi: 'germany',
  cl: 'commodities',
  gc: 'commodities',
  bz: 'commodities',
  usdinr: 'fx',
  btc: 'crypto',
  eth: 'crypto',
  sol: 'crypto',
};

/** Featured strip order: Nifty, Nasdaq, Bitcoin, WTI, Gold, Brent. */
const TOP_SIX_IDS = ['nsei', 'ixic', 'btc', 'cl', 'gc', 'bz'] as const;
type TopSixId = (typeof TOP_SIX_IDS)[number];

const TOP_SIX_LABELS: Record<TopSixId, string> = {
  nsei: 'Nifty',
  ixic: 'Nasdaq',
  btc: 'Bitcoin',
  cl: 'WTI crude',
  gc: 'Gold',
  bz: 'Brent',
};

const TOP_SIX_SET = new Set<string>(TOP_SIX_IDS);

function resolveSectionId(q: MarketQuoteRow): SectionKey | null {
  if (q.sectionId && q.sectionId in SECTION_SHORT) {
    return q.sectionId as SectionKey;
  }
  return SECTION_BY_INSTRUMENT_ID[q.id] ?? null;
}

function resolveCountry(q: MarketQuoteRow): string {
  if (q.country?.trim()) return q.country;
  if (q.group === 'US') return 'United States';
  if (q.group === 'India') return 'India';
  if (q.group === 'China') return 'China';
  if (q.group === 'Commodities') return 'Global';
  if (q.group === 'FX') return 'United States & India';
  if (q.group === 'Crypto') return 'Global (cryptocurrency)';
  return 'Global';
}

const CRYPTO_IDS = new Set(['btc', 'eth', 'sol']);

function formatCryptoPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return p.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return p.toLocaleString(NUM_LOCALE, { maximumFractionDigits: 6, minimumFractionDigits: 2 });
}

function formatPrice(q: MarketQuoteRow): string {
  if (q.price == null) return '-';
  const p = q.price;
  if (CRYPTO_IDS.has(q.id)) return formatCryptoPrice(p);
  if (q.id === 'usdinr') {
    return p.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  return p.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPrev(n: number | null, q: MarketQuoteRow): string {
  if (n == null) return '-';
  if (CRYPTO_IDS.has(q.id)) return formatCryptoPrice(n);
  if (q.id === 'usdinr') {
    return n.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  return n.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatSignedPercent(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '-';
  const abs = Math.abs(value);
  const fmt = abs.toLocaleString(NUM_LOCALE, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${fmt}%`;
}

function formatSignedPoints(value: number | null, q: MarketQuoteRow): string {
  if (value == null || Number.isNaN(value)) return '-';
  const abs = Math.abs(value);
  let decimals = 2;
  if (q.id === 'usdinr') decimals = 4;
  else if (CRYPTO_IDS.has(q.id)) decimals = abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6;
  const fmt = abs.toLocaleString(NUM_LOCALE, { maximumFractionDigits: decimals, minimumFractionDigits: Math.min(2, decimals) });
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${fmt}`;
}

function popoverPctClass(change: number | null): string {
  if (change == null) return 'text-slate-400';
  if (change > 0) return 'text-emerald-400';
  if (change < 0) return 'text-red-400';
  return 'text-slate-400';
}

/**
 * SVG flags via flagcdn.com (ISO 3166-1 alpha-2) — crisp at any size.
 * Use `fill` only inside a fixed circle/box; never stretch with h-full outside one.
 */
function FlagImg({
  iso,
  className,
  size = 22,
  fill = false,
}: {
  iso: string;
  className?: string;
  size?: number;
  /** Stretch to parent (circular row badges only). */
  fill?: boolean;
}) {
  const code = iso.toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) return null;
  const flagLabel = `${iso.toUpperCase()} flag`;
  const h = Math.round(size * 0.75);
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      width={size}
      height={fill ? size : h}
      alt={flagLabel}
      title={flagLabel}
      loading="lazy"
      decoding="async"
      className={
        fill
          ? `h-full w-full shrink-0 object-cover ${className ?? ''}`
          : `inline-block shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/15 ${className ?? ''}`
      }
      style={fill ? undefined : { width: size, height: h }}
    />
  );
}

/** Circular badge for flags / asset icons — same size everywhere in Markets. */
function CircleIcon({
  title,
  children,
  tone = 'slate',
}: {
  title: string;
  children: ReactNode;
  tone?: 'slate' | 'teal' | 'violet' | 'amber' | 'blue' | 'emerald';
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200/90',
    teal: 'bg-teal-50 text-teal-700 ring-teal-200/90',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200/90',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200/90',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200/90',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/90',
  };
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ${tones[tone]}`}
      title={title}
      aria-hidden
    >
      {children}
    </span>
  );
}

/** Flag, asset-class, or commodity icon for any quote row (Top 6 + Others). */
function InstrumentRowIdentifier({ id }: { id: string }) {
  switch (id) {
    case 'gspc':
    case 'dji':
    case 'ixic':
    case 'vix':
      return (
        <CircleIcon title="United States" tone="blue">
          <FlagImg iso="us" size={28} fill />
        </CircleIcon>
      );
    case 'nsei':
    case 'bsesn':
      return (
        <CircleIcon title="India" tone="amber">
          <FlagImg iso="in" size={28} fill />
        </CircleIcon>
      );
    case 'sse':
      return (
        <CircleIcon title="China" tone="slate">
          <FlagImg iso="cn" size={28} fill />
        </CircleIcon>
      );
    case 'ftse':
      return (
        <CircleIcon title="United Kingdom" tone="slate">
          <FlagImg iso="gb" size={28} fill />
        </CircleIcon>
      );
    case 'n225':
      return (
        <CircleIcon title="Japan" tone="slate">
          <FlagImg iso="jp" size={28} fill />
        </CircleIcon>
      );
    case 'gdaxi':
      return (
        <CircleIcon title="Germany" tone="slate">
          <FlagImg iso="de" size={28} fill />
        </CircleIcon>
      );
    case 'usdinr':
      return (
        <CircleIcon title="USD / INR" tone="teal">
          <ArrowRightLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
        </CircleIcon>
      );
    case 'btc':
    case 'eth':
    case 'sol':
      return (
        <CircleIcon title="Cryptocurrency" tone="violet">
          <Coins className="h-3.5 w-3.5" strokeWidth={2.25} />
        </CircleIcon>
      );
    case 'cl':
      return (
        <CircleIcon title="Crude oil" tone="amber">
          <Droplet className="h-3.5 w-3.5" strokeWidth={2.25} />
        </CircleIcon>
      );
    case 'gc':
      return (
        <CircleIcon title="Gold" tone="amber">
          <Gem className="h-3.5 w-3.5" strokeWidth={2.25} />
        </CircleIcon>
      );
    case 'bz':
      return (
        <CircleIcon title="Brent crude" tone="slate">
          <Fuel className="h-3.5 w-3.5" strokeWidth={2.25} />
        </CircleIcon>
      );
    default:
      return null;
  }
}

const ISO_FOR_SECTION: Partial<Record<SectionKey, string>> = {
  us: 'US',
  india: 'IN',
  china: 'CN',
  united_kingdom: 'GB',
  japan: 'JP',
  germany: 'DE',
  commodities: 'US',
};

function CountryFlagsLine({
  q,
  section,
  theme,
  /** No flag/coin icons - country/region text only (pair with {@link InstrumentRowIdentifier}). */
  textOnlySubline = false,
}: {
  q: MarketQuoteRow;
  section: SectionKey;
  theme: 'light' | 'dark';
  textOnlySubline?: boolean;
}) {
  const name = resolveCountry(q);
  const dark = theme === 'dark';
  const chip = dark
    ? 'inline-flex max-w-full items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 ring-1 ring-white/10'
    : 'inline-flex max-w-full items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 shadow-sm ring-1 ring-slate-200/90';
  const subMuted = dark ? 'text-slate-400' : 'text-slate-600';
  const subStrong = dark ? 'text-slate-200' : 'text-slate-800';

  if (textOnlySubline) {
    if (section === 'crypto') {
      return (
        <p className={`mt-0.5 text-[11px] font-medium leading-snug ${dark ? 'text-violet-200' : 'text-violet-800'}`}>
          {name}
        </p>
      );
    }
    if (section === 'fx' && q.id === 'usdinr') {
      return (
        <p className={`mt-0.5 text-[11px] font-medium leading-snug ${subMuted}`}>
          <span className={subStrong}>United States</span>
          <span className="mx-1">&amp;</span>
          <span className={subStrong}>India</span>
        </p>
      );
    }
    return (
      <p
        className={`mt-0.5 text-[11px] font-medium leading-snug ${subMuted} ${dark ? '' : 'line-clamp-2'}`}
        title={name}
      >
        <span className={subStrong}>{name}</span>
      </p>
    );
  }

  if (section === 'crypto') {
    return (
      <p
        className={`mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium leading-snug ${dark ? 'text-violet-200' : 'text-violet-800'}`}
      >
        <Coins
          className={`h-4 w-4 shrink-0 ${dark ? 'text-violet-300' : 'text-violet-700'}`}
          strokeWidth={2.25}
          aria-hidden
        />
        <span>{name}</span>
      </p>
    );
  }

  if (section === 'fx' && q.id === 'usdinr') {
    return (
      <div
        className={`mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] font-medium leading-snug ${dark ? 'text-slate-300' : 'text-slate-600'}`}
      >
        <span className={chip}>
          <FlagImg iso="us" size={20} />
          <span className={dark ? 'text-slate-100' : 'text-slate-900'}>United States</span>
        </span>
        <span className={dark ? 'text-slate-500' : 'text-slate-500'}>&amp;</span>
        <span className={chip}>
          <FlagImg iso="in" size={20} />
          <span className={dark ? 'text-slate-100' : 'text-slate-900'}>India</span>
        </span>
      </div>
    );
  }

  const iso = ISO_FOR_SECTION[section];
  return (
    <p
      className={`mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-medium leading-snug ${dark ? 'text-slate-300' : 'text-slate-600'} ${dark ? '' : 'line-clamp-2'}`}
      title={name}
    >
      {iso ? (
        <FlagImg iso={iso} size={dark ? 18 : 16} className="self-center" />
      ) : (
        <Globe
          className={`h-4 w-4 shrink-0 self-center ${dark ? 'text-slate-500' : 'text-slate-500'}`}
          strokeWidth={2}
          aria-hidden
        />
      )}
      <span className={dark ? 'text-slate-200' : 'text-slate-800'}>{name}</span>
    </p>
  );
}

/**
 * Split “signal” readout: direction tile + % panel. Down moves use high-contrast red + larger type.
 */
function MoveReadout({
  change,
  pct,
  compact,
}: {
  change: number | null;
  pct: string;
  compact?: boolean;
}) {
  const tileNeutral = compact
    ? 'flex h-5 w-5 shrink-0 items-center justify-center [&_svg]:h-3 [&_svg]:w-3'
    : 'flex h-7 w-7 shrink-0 items-center justify-center [&_svg]:h-3.5 [&_svg]:w-3.5';
  const panelNeutral = compact
    ? 'flex min-w-[2.85rem] items-center justify-end px-1.5 py-px font-markets-mono text-[10px] font-bold tabular-nums leading-none sm:min-w-[3rem] sm:text-[11px]'
    : 'flex min-w-[3.5rem] items-center justify-end px-2 py-0.5 font-markets-mono text-[11px] font-bold tabular-nums sm:min-w-[3.75rem] sm:text-xs';
  const wrapNeutral = 'inline-flex overflow-hidden rounded-full';

  if (change == null) {
    return (
      <span className={`${wrapNeutral} bg-white`}>
        <span className={`${tileNeutral} bg-slate-100 text-slate-400`} aria-hidden>
          <Minus className="opacity-70" strokeWidth={2.25} />
        </span>
        <span className={`${panelNeutral} text-slate-500`}>-</span>
      </span>
    );
  }
  if (change > 0) {
    const tileUp = compact
      ? 'flex h-5 w-5 shrink-0 items-center justify-center bg-emerald-600 text-white [&_svg]:h-3 [&_svg]:w-3'
      : 'flex h-7 w-7 shrink-0 items-center justify-center bg-emerald-600 text-white [&_svg]:h-3.5 [&_svg]:w-3.5';
    const panelUp = compact
      ? 'flex min-w-[2.85rem] items-center justify-end bg-emerald-50 px-1.5 py-px font-markets-mono text-[10px] font-bold tabular-nums text-emerald-950 sm:min-w-[3rem] sm:text-[11px]'
      : 'flex min-w-[3.5rem] items-center justify-end bg-emerald-50 px-2 py-0.5 font-markets-mono text-[11px] font-bold tabular-nums text-emerald-950 sm:min-w-[3.75rem] sm:text-xs';
    return (
      <span className={`${wrapNeutral} bg-white`}>
        <span className={tileUp} aria-hidden>
          <TrendingUp strokeWidth={2.5} />
        </span>
        <span className={panelUp}>{pct}</span>
      </span>
    );
  }
  if (change < 0) {
    const tileDown = compact
      ? 'flex w-[1.125rem] shrink-0 flex-col items-center justify-center self-stretch bg-red-900 leading-none text-white [&_svg]:block [&_svg]:h-2.5 [&_svg]:w-2.5 [&_svg]:shrink-0'
      : 'flex w-5 shrink-0 flex-col items-center justify-center self-stretch bg-red-900 leading-none text-white [&_svg]:block [&_svg]:h-3 [&_svg]:w-3 [&_svg]:shrink-0';
    const panelDown = compact
      ? 'flex min-w-0 items-center justify-end self-stretch bg-red-600 px-1 py-px font-markets-mono text-[11px] font-extrabold tabular-nums leading-none tracking-tight text-white sm:text-xs'
      : 'flex min-w-0 items-center justify-end self-stretch bg-red-600 px-1.5 py-0.5 font-markets-mono text-xs font-extrabold tabular-nums leading-none tracking-tight text-white sm:text-sm';
    const wrapDown = compact
      ? 'inline-flex items-stretch overflow-hidden rounded-full bg-red-600'
      : 'inline-flex items-stretch overflow-hidden rounded-full bg-red-600';
    return (
      <span className={wrapDown}>
        <span className={tileDown} aria-hidden>
          <TrendingDown strokeWidth={2.5} />
        </span>
        <span className={panelDown}>{pct}</span>
      </span>
    );
  }
  return (
    <span className={`${wrapNeutral} bg-white`}>
      <span className={`${tileNeutral} bg-slate-200/80 text-slate-600`} aria-hidden>
        <Minus strokeWidth={2.5} />
      </span>
      <span className={`${panelNeutral} bg-slate-50 text-slate-700`}>{pct}</span>
    </span>
  );
}

/** Same layout as MoveReadout, tuned for the dark hover card. */
function MoveReadoutDark({ change, pct }: { change: number | null; pct: string }) {
  const tile =
    'flex h-7 w-7 shrink-0 items-center justify-center [&_svg]:h-3 [&_svg]:w-3';
  const panel =
    'flex min-w-[3.5rem] items-center justify-end px-2 py-0.5 font-markets-mono text-[11px] font-bold tabular-nums sm:min-w-[3.75rem] sm:text-xs';

  if (change == null) {
    return (
      <span className="inline-flex overflow-hidden rounded-full bg-white/5">
        <span className={`${tile} bg-white/10 text-slate-500`} aria-hidden>
          <Minus strokeWidth={2.5} />
        </span>
        <span className={`${panel} text-slate-500`}>-</span>
      </span>
    );
  }
  if (change > 0) {
    return (
      <span className="inline-flex overflow-hidden rounded-full">
        <span className={`${tile} bg-emerald-500 text-white`} aria-hidden>
          <TrendingUp strokeWidth={2.5} />
        </span>
        <span className={`${panel} bg-slate-950/90 text-emerald-100`}>{pct}</span>
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="inline-flex items-stretch overflow-hidden rounded-full bg-red-600">
        <span
          className="flex w-5 shrink-0 flex-col items-center justify-center self-stretch bg-red-950 leading-none text-white [&_svg]:block [&_svg]:h-3 [&_svg]:w-3 [&_svg]:shrink-0"
          aria-hidden
        >
          <TrendingDown strokeWidth={2.5} />
        </span>
        <span className="flex min-w-0 items-center justify-end self-stretch px-1.5 py-px font-markets-mono text-xs font-extrabold tabular-nums leading-none tracking-tight text-white sm:text-sm">
          {pct}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex overflow-hidden rounded-full bg-white/5">
      <span className={`${tile} bg-white/15 text-slate-400`} aria-hidden>
        <Minus strokeWidth={2.75} />
      </span>
      <span className={`${panel} text-slate-300`}>{pct}</span>
    </span>
  );
}

/** Light zebra + white base - avoids heavy row tint. */
function sentimentRowBg(_ok: boolean, _change: number | null, index: number): string {
  return index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';
}

function sentimentRowHover(): string {
  return 'transition-colors duration-150 hover:bg-teal-50/60';
}

type TipState = {
  q: MarketQuoteRow;
  section: SectionKey;
  left: number;
  top: number;
};

function MarketDetailPopover({
  tip,
  onEnter,
  onLeave,
}: {
  tip: TipState | null;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !tip) return null;

  const { q, section } = tip;
  const accent = POPOVER_ACCENT[section];

  const asOfLabel =
    q.ok && q.asOf
      ? `${formatRelativeTime(q.asOf)} · ${formatDate(q.asOf)}`
      : '-';

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-auto fixed z-[200] w-[min(calc(100vw-1.5rem),14rem)] overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 font-markets text-slate-100 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.55),0_0_0_1px_rgba(45,212,191,0.12)] backdrop-blur-md"
      style={{ left: tip.left, top: tip.top }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className={`h-0.5 bg-gradient-to-r ${accent}`} aria-hidden />
      <div className="border-b border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent px-2.5 py-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-teal-300/90">{SECTION_FULL[section]}</p>
        <p className="mt-0.5 font-markets text-sm font-bold leading-snug tracking-tight text-white">{q.label}</p>
        <CountryFlagsLine q={q} section={section} theme="dark" />
      </div>
      <dl className="space-y-1.5 px-2.5 py-2 text-xs">
        <div className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-1.5">
          <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Symbol</dt>
          <dd className="font-markets-mono text-xs font-semibold text-teal-200">{q.symbol}</dd>
        </div>
        {q.ok ? (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Last</dt>
              <dd className="text-right font-markets-mono text-sm font-bold tabular-nums text-white">
                {formatPrice(q)}
                {q.currency ? <span className="ml-1 text-[10px] font-markets font-medium text-slate-500">{q.currency}</span> : null}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Prev. close</dt>
              <dd className="text-right font-markets-mono text-xs font-semibold tabular-nums text-slate-300">
                {formatPrev(q.previousClose, q)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Change</dt>
              <dd className={`text-right font-markets-mono text-xs font-bold tabular-nums ${popoverPctClass(q.change)}`}>
                {formatSignedPoints(q.change, q)}
                {q.id === 'usdinr' ? <span className="text-[10px] font-medium text-slate-500"> INR</span> : null}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Change %</dt>
              <dd className="text-right scale-90 origin-right">
                <MoveReadoutDark change={q.change} pct={formatSignedPercent(q.changePercent)} />
              </dd>
            </div>
            <div className="rounded-md bg-black/25 px-2 py-1.5 ring-1 ring-white/5">
              <dt className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Quote time</dt>
              <dd className="mt-0.5 text-[11px] leading-snug text-slate-300">
                {asOfLabel}
                {q.timezone ? (
                  <span className="mt-0.5 block text-[10px] text-slate-500">{q.timezone.replace(/_/g, ' ')}</span>
                ) : null}
              </dd>
            </div>
          </>
        ) : (
          <p className="text-xs font-medium text-amber-300/90">{q.error || 'Quote unavailable'}</p>
        )}
      </dl>
      <div className="flex items-center gap-1 border-t border-white/10 bg-black/20 px-2.5 py-1.5 text-[9px] font-medium text-slate-500">
        <ChevronRight className="h-2.5 w-2.5 text-teal-500/80" aria-hidden />
        Yahoo Finance · delayed
      </div>
    </div>,
    document.body,
  );
}

function computeTipState(
  row: HTMLElement,
  q: MarketQuoteRow,
  section: SectionKey,
  narrow: boolean,
): TipState {
  const rect = row.getBoundingClientRect();
  const gap = 8;
  const popW = Math.min(224, typeof window !== 'undefined' ? window.innerWidth - 24 : 224);
  const popH = 260;

  let left: number;
  let top: number;

  if (narrow) {
    left = rect.left + rect.width / 2 - popW / 2;
    if (typeof window !== 'undefined') {
      left = Math.max(12, Math.min(left, window.innerWidth - popW - 12));
    }
    top = rect.bottom + gap;
    if (typeof window !== 'undefined' && top + popH > window.innerHeight - 12) {
      top = Math.max(12, rect.top - popH - gap);
    }
  } else {
    left = rect.right + gap;
    if (typeof window !== 'undefined' && left + popW > window.innerWidth - 12) {
      left = Math.max(12, rect.left - popW - gap);
    }
    top = rect.top;
    if (typeof window !== 'undefined' && top + popH > window.innerHeight - 12) {
      top = Math.max(12, window.innerHeight - popH - 12);
    }
  }

  return { q, section, left, top };
}

export function LiveMarketsAside() {
  const [quotes, setQuotes] = useState<MarketQuoteRow[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tip, setTip] = useState<TipState | null>(null);
  const [narrowLayout, setNarrowLayout] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const sync = () => setNarrowLayout(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimer.current = setTimeout(() => setTip(null), 160);
  }, [clearHideTimer]);

  const showTip = useCallback(
    (e: React.MouseEvent<HTMLElement>, q: MarketQuoteRow, section: SectionKey) => {
      clearHideTimer();
      setTip(computeTipState(e.currentTarget, q, section, narrowLayout));
    },
    [clearHideTimer, narrowLayout],
  );

  const toggleTip = useCallback(
    (e: React.MouseEvent<HTMLElement>, q: MarketQuoteRow, section: SectionKey) => {
      if (!narrowLayout) return;
      e.preventDefault();
      clearHideTimer();
      const row = e.currentTarget;
      setTip((prev) => {
        if (prev?.q.id === q.id) return null;
        return computeTipState(row, q, section, true);
      });
    },
    [clearHideTimer, narrowLayout],
  );

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  useEffect(() => {
    if (!tip) return;
    const close = () => setTip(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [tip]);

  const load = useCallback(async (isBackground: boolean) => {
    if (isBackground) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/market-quotes', { cache: 'no-store' });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as MarketQuotesResponse;
      setQuotes(data.quotes || []);
      setFetchedAt(data.fetchedAt || null);
    } catch {
      setError('API offline - start the backend.');
      if (!isBackground) setQuotes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    const id = window.setInterval(() => load(true), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const quotesBySection = useMemo(() => {
    const m = new Map<SectionKey, MarketQuoteRow[]>();
    for (const k of SECTION_ORDER) m.set(k, []);
    for (const q of quotes) {
      const sid = resolveSectionId(q);
      if (!sid) continue;
      m.get(sid)?.push(q);
    }
    for (const k of SECTION_ORDER) {
      const list = m.get(k);
      if (list?.length) list.sort((a: MarketQuoteRow, b: MarketQuoteRow) => a.label.localeCompare(b.label));
    }
    return m;
  }, [quotes]);

  const flatRows = useMemo(() => {
    const out: { q: MarketQuoteRow; section: SectionKey }[] = [];
    for (const k of SECTION_ORDER) {
      for (const q of quotesBySection.get(k) || []) {
        out.push({ q, section: k });
      }
    }
    return out;
  }, [quotesBySection]);

  const quoteById = useMemo(() => {
    const m = new Map<string, MarketQuoteRow>();
    for (const q of quotes) m.set(q.id, q);
    return m;
  }, [quotes]);

  const flatRowsMain = useMemo(
    () => flatRows.filter(({ q }) => !TOP_SIX_SET.has(q.id)),
    [flatRows],
  );

  const [filterTab, setFilterTab] = useState<'all' | 'indices' | 'crypto' | 'commodities'>('all');

  const filteredFlatRows = useMemo(() => {
    return flatRowsMain.filter(({ section }) => {
      if (filterTab === 'indices') {
        return ['us', 'india', 'china', 'united_kingdom', 'japan', 'germany'].includes(section);
      }
      if (filterTab === 'crypto') return section === 'crypto';
      if (filterTab === 'commodities') return section === 'commodities' || section === 'fx';
      return true;
    });
  }, [flatRowsMain, filterTab]);

  return (
    <aside className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white font-markets shadow-sm antialiased transition-all duration-300 hover:shadow-md">
      {/* Widget Header */}
      <div className="relative flex items-center justify-between gap-3 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-[#0c1424] to-slate-900 px-4 py-3.5 text-white">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30 shadow-inner">
            <Activity className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-sm font-bold leading-tight tracking-tight text-white">
                Markets Wire
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="truncate text-[10.5px] font-medium text-slate-400">
              {fetchedAt ? (
                <>
                  <span className="text-teal-300">{formatRelativeTime(fetchedAt)}</span>
                  {refreshing ? ' • updating' : ''}
                  <span> • Global Markets</span>
                </>
              ) : (
                'Loading live quotes…'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => load(true)}
          disabled={loading || refreshing}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-40 active:scale-95"
          aria-label="Refresh quotes"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
        </button>
      </div>

      {error ? (
        <p className="border-b border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-900">
          {error}
        </p>
      ) : null}

      <div className="space-y-0">
        {!loading && !quotes.length && !error ? (
          <p className="px-3 py-8 text-center text-xs text-slate-500">No market data available.</p>
        ) : null}

        <MarketDetailPopover tip={tip} onEnter={clearHideTimer} onLeave={scheduleHide} />

        {loading && !quotes.length ? (
          <div className="space-y-3 p-3">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" aria-hidden />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : null}

        {/* Top Movers 2-Column Mini Cards Grid */}
        {quotes.length > 0 ? (
          <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white p-3">
            <div className="mb-2.5 flex items-center justify-between px-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                Key Movers
              </p>
              <span className="text-[10.5px] font-bold text-teal-700">
                Real-Time
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TOP_SIX_IDS.map((id) => {
                const q = quoteById.get(id);
                const headline = TOP_SIX_LABELS[id];
                if (!q) return null;
                const section = resolveSectionId(q) || 'us';
                const isUp = (q.changePercent ?? 0) > 0;
                const isDown = (q.changePercent ?? 0) < 0;

                return (
                  <div
                    key={id}
                    role="presentation"
                    className={`group relative flex flex-col justify-between rounded-xl border p-2.5 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                      isUp
                        ? 'border-emerald-300/80 bg-emerald-50/70 hover:bg-emerald-100/80 shadow-[0_2px_8px_rgba(16,185,129,0.08)]'
                        : isDown
                        ? 'border-rose-300/80 bg-rose-50/70 hover:bg-rose-100/80 shadow-[0_2px_8px_rgba(244,63,94,0.08)]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
                    }`}
                    onMouseEnter={(e) => showTip(e, q, section)}
                    onMouseLeave={scheduleHide}
                    onClick={(e) => toggleTip(e, q, section)}
                  >
                    {/* Header: Flag + Name + Change Badge */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <InstrumentRowIdentifier id={id} />
                        <span className="truncate font-display text-xs font-bold text-slate-900">
                          {headline}
                        </span>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[9.5px] font-black tabular-nums shadow-sm ${
                          isUp
                            ? 'bg-emerald-600 text-white'
                            : isDown
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isUp && <TrendingUp className="h-2 w-2 stroke-[2.5]" />}
                        {isDown && <TrendingDown className="h-2 w-2 stroke-[2.5]" />}
                        <span>
                          {q.changePercent != null
                            ? `${isUp ? '+' : ''}${q.changePercent.toFixed(1)}%`
                            : '0%'}
                        </span>
                      </span>
                    </div>

                    {/* Price & Points */}
                    <div className="mt-2 flex items-baseline justify-between gap-1">
                      <span className="font-markets-mono text-[13.5px] font-black tabular-nums text-slate-950">
                        {formatPrice(q)}
                      </span>
                      {q.change != null && (
                        <span
                          className={`text-[10px] font-bold tabular-nums ${
                            isUp ? 'text-emerald-700' : isDown ? 'text-rose-700' : 'text-slate-500'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {q.change.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Filter Tabs */}
        {flatRowsMain.length > 0 && (
          <div className="border-b border-slate-100 bg-slate-50/70 px-3 py-2">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-0.5 text-[11px] font-semibold">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'indices', label: 'Indices' },
                  { id: 'crypto', label: 'Crypto' },
                  { id: 'commodities', label: 'Commodities' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`flex-1 rounded-lg py-1 text-center font-bold transition ${
                    filterTab === tab.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filtered Quotes Clean List */}
        {filteredFlatRows.length > 0 ? (
          <div className="p-3">
            <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-inner divide-y divide-slate-100">
              {filteredFlatRows.map(({ q, section }, index) => {
                const isUp = (q.changePercent ?? 0) > 0;
                const isDown = (q.changePercent ?? 0) < 0;

                return (
                  <div
                    key={q.id}
                    role="presentation"
                    className={`grid grid-cols-[minmax(0,1fr)_minmax(6.5rem,auto)] items-center gap-x-2 px-3 py-2 transition-colors cursor-pointer hover:bg-slate-50/90 ${sentimentRowBg(
                      q.ok,
                      q.change,
                      index,
                    )}`}
                    onMouseEnter={(e) => showTip(e, q, section)}
                    onMouseLeave={scheduleHide}
                    onClick={(e) => toggleTip(e, q, section)}
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="mt-0.5 shrink-0">
                        <InstrumentRowIdentifier id={q.id} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold leading-snug text-slate-900">
                          {q.label}
                        </p>
                        <CountryFlagsLine q={q} section={section} theme="light" textOnlySubline />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5 text-right">
                      {q.ok ? (
                        <>
                          <p className="font-markets-mono text-xs font-black tabular-nums text-slate-950">
                            {formatPrice(q)}
                            {q.currency ? (
                              <span className="ml-1 text-[9px] font-bold text-slate-400">
                                {q.currency}
                              </span>
                            ) : null}
                          </p>
                          <span
                            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[10px] font-black tabular-nums ${
                              isUp
                                ? 'bg-emerald-100 text-emerald-800'
                                : isDown
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isUp && <TrendingUp className="h-2.5 w-2.5 stroke-[2.5]" />}
                            {isDown && <TrendingDown className="h-2.5 w-2.5 stroke-[2.5]" />}
                            <span>{formatSignedPercent(q.changePercent)}</span>
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Footer info subline */}
        <p className="border-t border-slate-100 bg-slate-50/80 px-3 py-2 text-center text-[10px] font-medium text-slate-500">
          Delayed quotes • Hover or tap row for full metrics
        </p>
      </div>
    </aside>
  );
}
