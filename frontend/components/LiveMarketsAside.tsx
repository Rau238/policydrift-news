'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

/** Left edge on table rows. */
const ROW_STRIPE: Record<SectionKey, string> = {
  us: 'border-l-[3px] border-l-blue-500',
  india: 'border-l-[3px] border-l-amber-500',
  china: 'border-l-[3px] border-l-red-600',
  united_kingdom: 'border-l-[3px] border-l-indigo-500',
  japan: 'border-l-[3px] border-l-rose-500',
  germany: 'border-l-[3px] border-l-slate-600',
  commodities: 'border-l-[3px] border-l-yellow-600',
  fx: 'border-l-[3px] border-l-teal-500',
  crypto: 'border-l-[3px] border-l-violet-500',
};

/** Top accent on detail popover — matches row stripe. */
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

/** Flag, asset-class, or commodity icon for any quote row (Top 6 + Others). */
function InstrumentRowIdentifier({ id }: { id: string }) {
  const wrap = 'inline-flex shrink-0 items-center justify-center';
  switch (id) {
    case 'gspc':
    case 'dji':
    case 'ixic':
    case 'vix':
      return (
        <span className={wrap} title="United States" aria-hidden>
          <FlagImg iso="us" size={18} className="align-middle" />
        </span>
      );
    case 'nsei':
    case 'bsesn':
      return (
        <span className={wrap} title="India" aria-hidden>
          <FlagImg iso="in" size={18} className="align-middle" />
        </span>
      );
    case 'sse':
      return (
        <span className={wrap} title="China" aria-hidden>
          <FlagImg iso="cn" size={18} className="align-middle" />
        </span>
      );
    case 'ftse':
      return (
        <span className={wrap} title="United Kingdom" aria-hidden>
          <FlagImg iso="gb" size={18} className="align-middle" />
        </span>
      );
    case 'n225':
      return (
        <span className={wrap} title="Japan" aria-hidden>
          <FlagImg iso="jp" size={18} className="align-middle" />
        </span>
      );
    case 'gdaxi':
      return (
        <span className={wrap} title="Germany" aria-hidden>
          <FlagImg iso="de" size={18} className="align-middle" />
        </span>
      );
    case 'usdinr':
      return (
        <span className={wrap} title="USD / INR" aria-hidden>
          <ArrowRightLeft className="h-4 w-4 text-teal-600" strokeWidth={2.25} />
        </span>
      );
    case 'btc':
    case 'eth':
    case 'sol':
      return (
        <span className={wrap} title="Cryptocurrency" aria-hidden>
          <Coins className="h-4 w-4 text-violet-600" strokeWidth={2.25} />
        </span>
      );
    case 'cl':
      return (
        <span className={wrap} title="Crude oil" aria-hidden>
          <Droplet className="h-4 w-4 text-amber-700" strokeWidth={2.25} />
        </span>
      );
    case 'gc':
      return (
        <span className={wrap} title="Gold" aria-hidden>
          <Gem className="h-4 w-4 text-amber-500" strokeWidth={2.25} />
        </span>
      );
    case 'bz':
      return (
        <span className={wrap} title="Brent crude" aria-hidden>
          <Fuel className="h-4 w-4 text-slate-600" strokeWidth={2.25} />
        </span>
      );
    default:
      return null;
  }
}

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
  if (q.price == null) return '—';
  const p = q.price;
  if (CRYPTO_IDS.has(q.id)) return formatCryptoPrice(p);
  if (q.id === 'usdinr') {
    return p.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  return p.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPrev(n: number | null, q: MarketQuoteRow): string {
  if (n == null) return '—';
  if (CRYPTO_IDS.has(q.id)) return formatCryptoPrice(n);
  if (q.id === 'usdinr') {
    return n.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  return n.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatSignedPercent(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  const fmt = abs.toLocaleString(NUM_LOCALE, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${fmt}%`;
}

function formatSignedPoints(value: number | null, q: MarketQuoteRow): string {
  if (value == null || Number.isNaN(value)) return '—';
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
 * Raster flags via flagcdn.com (ISO 3166-1 alpha-2).
 * Only certain paths exist: e.g. 20x15/24x18/… or w20/w40/… — arbitrary w22 returns 404.
 */
function flagCdnPair(displayW: number): { oneX: string; twoX: string; width: number; height: number } {
  if (displayW <= 20) return { oneX: '20x15', twoX: '40x30', width: 20, height: 15 };
  if (displayW <= 26) return { oneX: '24x18', twoX: '48x36', width: 24, height: 18 };
  return { oneX: '32x24', twoX: '64x48', width: 32, height: 24 };
}

function FlagImg({ iso, className, size = 22 }: { iso: string; className?: string; size?: number }) {
  const code = iso.toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) return null;
  const { oneX, twoX, width, height } = flagCdnPair(size);
  return (
    <img
      src={`https://flagcdn.com/${oneX}/${code}.png`}
      srcSet={`https://flagcdn.com/${twoX}/${code}.png 2x`}
      width={width}
      height={height}
      alt=""
      loading="lazy"
      decoding="async"
      className={`shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-black/10 ${className ?? ''}`}
    />
  );
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
  /** No flag/coin icons — country/region text only (pair with {@link InstrumentRowIdentifier}). */
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
        <FlagImg iso={iso} size={22} className="self-center" />
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
        <span className={`${panelNeutral} text-slate-500`}>—</span>
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
        <span className={`${panel} text-slate-500`}>—</span>
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

/** Light zebra + white base — avoids heavy row tint. */
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
      : '—';

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-auto fixed z-[200] w-[min(calc(100vw-1.5rem),18rem)] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 font-markets text-slate-100 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55),0_0_0_1px_rgba(45,212,191,0.12)] backdrop-blur-md"
      style={{ left: tip.left, top: tip.top }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className={`h-1 bg-gradient-to-r ${accent}`} aria-hidden />
      <div className="border-b border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent px-3.5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300/90">{SECTION_FULL[section]}</p>
        <p className="mt-1 font-markets text-base font-bold leading-snug tracking-tight text-white">{q.label}</p>
        <CountryFlagsLine q={q} section={section} theme="dark" />
      </div>
      <dl className="space-y-2.5 px-3.5 py-3 text-sm">
        <div className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2">
          <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Symbol</dt>
          <dd className="font-markets-mono text-sm font-semibold text-teal-200">{q.symbol}</dd>
        </div>
        {q.ok ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Last</dt>
              <dd className="text-right font-markets-mono text-base font-bold tabular-nums text-white">
                {formatPrice(q)}
                {q.currency ? <span className="ml-1 text-xs font-markets font-medium text-slate-500">{q.currency}</span> : null}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Prev. close</dt>
              <dd className="text-right font-markets-mono text-sm font-semibold tabular-nums text-slate-300">
                {formatPrev(q.previousClose, q)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Change</dt>
              <dd className={`text-right font-markets-mono text-sm font-bold tabular-nums ${popoverPctClass(q.change)}`}>
                {formatSignedPoints(q.change, q)}
                {q.id === 'usdinr' ? <span className="text-xs font-medium text-slate-500"> INR</span> : null}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Change %</dt>
              <dd className="text-right">
                <MoveReadoutDark change={q.change} pct={formatSignedPercent(q.changePercent)} />
              </dd>
            </div>
            <div className="rounded-lg bg-black/25 px-2.5 py-2 ring-1 ring-white/5">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quote time</dt>
              <dd className="mt-1 text-xs leading-snug text-slate-300">
                {asOfLabel}
                {q.timezone ? (
                  <span className="mt-1 block text-[11px] text-slate-500">{q.timezone.replace(/_/g, ' ')}</span>
                ) : null}
              </dd>
            </div>
          </>
        ) : (
          <p className="text-sm font-medium text-amber-300/90">{q.error || 'Quote unavailable'}</p>
        )}
      </dl>
      <div className="flex items-center gap-1 border-t border-white/10 bg-black/20 px-3 py-2 text-[10px] font-medium text-slate-500">
        <ChevronRight className="h-3 w-3 text-teal-500/80" aria-hidden />
        Yahoo Finance · delayed per exchange
      </div>
    </div>,
    document.body,
  );
}

export function LiveMarketsAside() {
  const [quotes, setQuotes] = useState<MarketQuoteRow[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tip, setTip] = useState<TipState | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const row = e.currentTarget;
      const rect = row.getBoundingClientRect();
      const gap = 10;
      const popW = Math.min(288, typeof window !== 'undefined' ? window.innerWidth - 24 : 288);
      let left = rect.right + gap;
      if (typeof window !== 'undefined' && left + popW > window.innerWidth - 12) {
        left = Math.max(12, rect.left - popW - gap);
      }
      let top = rect.top;
      const popH = 320;
      if (typeof window !== 'undefined' && top + popH > window.innerHeight - 12) {
        top = Math.max(12, window.innerHeight - popH - 12);
      }
      setTip({ q, section, left, top });
    },
    [clearHideTimer],
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
      setError('API offline — start the backend.');
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

  return (
    <aside className="min-w-0 overflow-visible rounded-xl border border-slate-200 bg-white font-markets shadow-sm antialiased">
      <div className="relative flex items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-900 px-3 py-3 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -60deg,
              transparent,
              transparent 6px,
              rgba(255,255,255,0.03) 6px,
              rgba(255,255,255,0.03) 7px
            )`,
          }}
          aria-hidden
        />
        <div className="relative flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Activity className="h-4 w-4 text-teal-300" strokeWidth={2.25} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-markets text-[0.9375rem] font-bold leading-tight tracking-tight text-white">
              Markets
            </h2>
            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
              {fetchedAt ? (
                <>
                  {formatRelativeTime(fetchedAt)}
                  {refreshing ? ' · …' : ''} · Yahoo
                </>
              ) : (
                'Loading…'
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={loading || refreshing}
          className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/15 disabled:opacity-40"
          aria-label="Refresh quotes"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
        </button>
      </div>

      {error ? (
        <p className="border-b border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">{error}</p>
      ) : null}

      <div className="space-y-0">
        {!loading && !quotes.length && !error ? (
          <p className="px-3 py-8 text-center text-sm text-slate-500">No data.</p>
        ) : null}

        <MarketDetailPopover tip={tip} onEnter={clearHideTimer} onLeave={scheduleHide} />

        {loading && !quotes.length ? (
          <div className="space-y-3 px-3 py-3">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" aria-hidden />
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="h-3.5 w-20 animate-pulse rounded bg-slate-100" />
                  <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-slate-50/80" />
              ))}
            </div>
          </div>
        ) : null}

        {quotes.length > 0 ? (
          <div className="border-b border-slate-100 px-3 py-3">
            <p className="mb-2 text-xs font-semibold text-slate-500">Top 6</p>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {TOP_SIX_IDS.map((id) => {
                const q = quoteById.get(id);
                const headline = TOP_SIX_LABELS[id];
                if (!q) {
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-slate-400"
                    >
                      <span className="flex min-w-0 items-center gap-1.5 font-medium text-slate-500">
                        <span className="truncate">{headline}</span>
                        <InstrumentRowIdentifier id={id} />
                      </span>
                      <span>—</span>
                    </li>
                  );
                }
                const section = resolveSectionId(q);
                if (!section) {
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-1.5 font-medium text-slate-800">
                        <span className="truncate">{headline}</span>
                        <InstrumentRowIdentifier id={id} />
                      </span>
                      <span className="text-slate-400">—</span>
                    </li>
                  );
                }
                return (
                  <li
                    key={id}
                    role="presentation"
                    className={`flex cursor-default items-center justify-between gap-2 px-3 py-2.5 transition-colors hover:bg-slate-50 ${ROW_STRIPE[section]}`}
                    onMouseEnter={(e) => showTip(e, q, section)}
                    onMouseLeave={scheduleHide}
                  >
                    <span className="flex min-w-0 shrink items-center gap-1.5 font-medium text-sm leading-snug text-slate-800">
                      <span className="truncate">{headline}</span>
                      <InstrumentRowIdentifier id={id} />
                    </span>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-1">
                      {q.ok ? (
                        <>
                          <span className="text-right font-markets-mono text-sm tabular-nums text-slate-900">
                            {formatPrice(q)}
                            {q.currency ? (
                              <span className="ml-1 font-markets text-[10px] font-normal text-slate-500">{q.currency}</span>
                            ) : null}
                          </span>
                          <MoveReadout
                            compact
                            change={q.change}
                            pct={formatSignedPercent(q.changePercent)}
                          />
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {flatRowsMain.length > 0 ? (
          <div className="px-3 pb-3 pt-2">
            <p className="mb-2 text-xs font-semibold text-slate-500">Others</p>
            <div className="rounded-lg border border-slate-200 bg-white">
              
              {flatRowsMain.map(({ q, section }, index) => (
                <div
                  key={q.id}
                  role="presentation"
                  className={`grid grid-cols-[minmax(0,1fr)_minmax(7.25rem,auto)] items-center gap-x-2 border-t border-slate-100 px-2.5 py-2 first:border-t-0  cursor-default ${sentimentRowBg(q.ok, q.change, index)} ${sentimentRowHover()}`}
                  onMouseEnter={(e) => showTip(e, q, section)}
                  onMouseLeave={scheduleHide}
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="mt-0.5 shrink-0">
                      <InstrumentRowIdentifier id={q.id} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug text-slate-900">{q.label}</p>
                      <CountryFlagsLine q={q} section={section} theme="light" textOnlySubline />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    {q.ok ? (
                      <>
                        <p className="font-markets-mono text-[14px] leading-tight tabular-nums text-slate-900">
                          {formatPrice(q)}
                          {q.currency ? (
                            <span className="ml-1 font-markets text-[10px] font-normal text-slate-500">{q.currency}</span>
                          ) : null}
                        </p>
                        <MoveReadout
                          compact
                          change={q.change}
                          pct={formatSignedPercent(q.changePercent)}
                        />
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <p className="border-t border-slate-100 bg-slate-50 px-3 py-2.5 text-center text-[10px] text-slate-500">
          Green / red = day move · Hover row for detail · Delayed data
        </p>
      </div>
    </aside>
  );
}
