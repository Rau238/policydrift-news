'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  ChevronRight,
  Coins,
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

const SECTION_ORDER = ['us', 'india', 'commodities', 'fx', 'crypto'] as const;

type SectionKey = (typeof SECTION_ORDER)[number];

const SECTION_SHORT: Record<SectionKey, string> = {
  us: 'US',
  india: 'IN',
  commodities: 'Cmd',
  fx: 'FX',
  crypto: '₿',
};

const SECTION_FULL: Record<SectionKey, string> = {
  us: 'United States',
  india: 'India',
  commodities: 'Commodities',
  fx: 'Foreign exchange',
  crypto: 'Cryptocurrencies',
};

const ROW_STRIPE: Record<SectionKey, string> = {
  us: 'border-l-[3px] border-l-blue-500',
  india: 'border-l-[3px] border-l-amber-500',
  commodities: 'border-l-[3px] border-l-yellow-600',
  fx: 'border-l-[3px] border-l-teal-500',
  crypto: 'border-l-[3px] border-l-violet-500',
};

/** Top accent on detail popover — matches row stripe. */
const POPOVER_ACCENT: Record<SectionKey, string> = {
  us: 'from-blue-500 to-indigo-400',
  india: 'from-amber-500 to-orange-500',
  commodities: 'from-yellow-500 to-amber-700',
  fx: 'from-teal-500 to-cyan-400',
  crypto: 'from-violet-500 to-fuchsia-500',
};

const SECTION_BY_INSTRUMENT_ID: Record<string, SectionKey> = {
  ixic: 'us',
  nsei: 'india',
  cl: 'commodities',
  gc: 'commodities',
  bz: 'commodities',
  usdinr: 'fx',
  btc: 'crypto',
};

/** Single grid: Nifty, Nasdaq, Bitcoin, WTI, Gold, Brent, USD/INR. */
const TOP_SEVEN_IDS = ['nsei', 'ixic', 'btc', 'cl', 'gc', 'bz', 'usdinr'] as const;
type TopSevenId = (typeof TOP_SEVEN_IDS)[number];

const TOP_SEVEN_LABELS: Record<TopSevenId, string> = {
  nsei: 'Nifty',
  ixic: 'Nasdaq',
  btc: 'Bitcoin',
  cl: 'WTI crude',
  gc: 'Gold',
  bz: 'Brent',
  usdinr: 'USD / INR',
};

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
  if (q.group === 'Commodities') return 'Global';
  if (q.group === 'FX') return 'United States & India';
  if (q.group === 'Crypto') return 'Global (cryptocurrency)';
  return 'Global';
}

const CRYPTO_IDS = new Set(['btc']);

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
  commodities: 'US',
};

function CountryFlagsLine({
  q,
  section,
  theme,
}: {
  q: MarketQuoteRow;
  section: SectionKey;
  theme: 'light' | 'dark';
}) {
  const name = resolveCountry(q);
  const dark = theme === 'dark';
  const chip = dark
    ? 'inline-flex max-w-full items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 ring-1 ring-white/10'
    : 'inline-flex max-w-full items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 shadow-sm ring-1 ring-slate-200/90';

  if (section === 'crypto') {
    return (
      <p
        className={`mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-medium leading-snug ${dark ? 'text-violet-200' : 'text-violet-900'}`}
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
        className={`mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs font-medium leading-snug ${dark ? 'text-slate-300' : 'text-teal-950'}`}
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
      className={`mt-0.5 inline-flex items-center gap-2 text-xs font-medium leading-snug ${dark ? 'text-slate-300' : 'text-teal-950'} ${dark ? '' : 'line-clamp-2'}`}
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

/** Same layout as MoveReadout, tuned for the dark hover card. */
function MoveReadoutDark({ change, pct }: { change: number | null; pct: string }) {
  const tile =
    'flex h-8 w-8 shrink-0 items-center justify-center [&_svg]:h-4 [&_svg]:w-4';
  const panel = 'flex min-w-[4.25rem] items-center justify-end px-2.5 py-1 font-mono text-sm font-bold tabular-nums';

  if (change == null) {
    return (
      <span className="inline-flex overflow-hidden rounded-lg border border-white/15 bg-white/5">
        <span className={`${tile} bg-white/10 text-slate-500`} aria-hidden>
          <Minus strokeWidth={2.5} />
        </span>
        <span className={`${panel} text-slate-500`}>—</span>
      </span>
    );
  }
  if (change > 0) {
    return (
      <span className="inline-flex overflow-hidden rounded-lg border border-emerald-400/35 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]">
        <span className={`${tile} bg-emerald-500 text-white`} aria-hidden>
          <TrendingUp strokeWidth={2.75} />
        </span>
        <span className={`${panel} bg-slate-950/80 text-emerald-100`}>{pct}</span>
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="inline-flex overflow-hidden rounded-lg border border-rose-400/35 shadow-[0_0_0_1px_rgba(244,63,94,0.12)]">
        <span className={`${tile} bg-rose-500 text-white`} aria-hidden>
          <TrendingDown strokeWidth={2.75} />
        </span>
        <span className={`${panel} bg-slate-950/80 text-rose-100`}>{pct}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex overflow-hidden rounded-lg border border-white/15 bg-white/5">
      <span className={`${tile} bg-white/15 text-slate-400`} aria-hidden>
        <Minus strokeWidth={2.5} />
      </span>
      <span className={`${panel} text-slate-300`}>{pct}</span>
    </span>
  );
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
      className="pointer-events-auto fixed z-[200] w-[min(calc(100vw-1.5rem),18rem)] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 text-slate-100 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55),0_0_0_1px_rgba(45,212,191,0.12)] backdrop-blur-md"
      style={{ left: tip.left, top: tip.top }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className={`h-1 bg-gradient-to-r ${accent}`} aria-hidden />
      <div className="border-b border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent px-3.5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300/90">{SECTION_FULL[section]}</p>
        <p className="mt-1 font-display text-base font-bold leading-snug text-white">{q.label}</p>
        <CountryFlagsLine q={q} section={section} theme="dark" />
      </div>
      <dl className="space-y-2.5 px-3.5 py-3 text-sm">
        <div className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2">
          <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Symbol</dt>
          <dd className="font-mono text-sm font-semibold text-teal-200">{q.symbol}</dd>
        </div>
        {q.ok ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Last</dt>
              <dd className="text-right font-mono text-base font-bold tabular-nums text-white">
                {formatPrice(q)}
                {q.currency ? <span className="ml-1 text-xs font-sans font-medium text-slate-500">{q.currency}</span> : null}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Prev. close</dt>
              <dd className="text-right font-mono text-sm font-semibold tabular-nums text-slate-300">
                {formatPrev(q.previousClose, q)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Change</dt>
              <dd className={`text-right font-mono text-sm font-bold tabular-nums ${popoverPctClass(q.change)}`}>
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

function HeaderPct({ change, pct }: { change: number | null; pct: string }) {
  if (change == null) {
    return <span className="text-[10px] font-mono font-semibold text-slate-500">—</span>;
  }
  const cls =
    change > 0 ? 'text-emerald-400' : change < 0 ? 'text-rose-400' : 'text-slate-400';
  return <span className={`text-[10px] font-mono font-bold tabular-nums leading-none ${cls}`}>{pct}</span>;
}

function useLiveMarketQuotes() {
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

  const quoteById = useMemo(() => {
    const m = new Map<string, MarketQuoteRow>();
    for (const q of quotes) m.set(q.id, q);
    return m;
  }, [quotes]);

  return {
    quotes,
    fetchedAt,
    loading,
    refreshing,
    error,
    load,
    quoteById,
    tip,
    clearHideTimer,
    scheduleHide,
    showTip,
  };
}

/** Top 7 quotes in the site header (compact strip, horizontal scroll on small screens). */
export function LiveMarketsHeader() {
  const { quotes, fetchedAt, loading, refreshing, error, load, quoteById, tip, clearHideTimer, scheduleHide, showTip } =
    useLiveMarketQuotes();

  return (
    <>
      <MarketDetailPopover tip={tip} onEnter={clearHideTimer} onLeave={scheduleHide} />
      <div className="border-t border-white/[0.08] bg-slate-950/90 backdrop-blur-md">
        <div className="flex flex-col gap-1 py-1.5 sm:gap-1.5 sm:py-2">
          <div className="flex items-stretch gap-2 sm:gap-3">
            <div className="flex shrink-0 flex-col justify-center gap-0.5 border-r border-white/10 pr-2 sm:pr-3">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 shrink-0 text-teal-400" strokeWidth={2.5} aria-hidden />
                <span className="hidden text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:inline">
                  Markets
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:hidden">Mkt</span>
              </div>
              <p className="hidden max-w-[6rem] truncate text-[9px] font-medium text-slate-500 sm:block" title={fetchedAt ?? undefined}>
                {fetchedAt ? (
                  <>
                    {formatRelativeTime(fetchedAt)}
                    {refreshing ? ' · …' : ''}
                  </>
                ) : loading ? (
                  '…'
                ) : null}
              </p>
            </div>
            <button
              type="button"
              onClick={() => load(true)}
              disabled={loading || refreshing}
              className="flex h-[2.35rem] w-8 shrink-0 items-center justify-center self-center rounded-md bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/[0.15] disabled:opacity-40 sm:h-9 sm:w-9"
              aria-label="Refresh quotes"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
            </button>
            <div className="pd-scrollbar-none flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {loading && !quotes.length
                ? Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[3.25rem] w-[5.75rem] shrink-0 animate-pulse rounded-md bg-white/10"
                      aria-hidden
                    />
                  ))
                : null}
              {quotes.length > 0
                ? TOP_SEVEN_IDS.map((id) => {
                    const q = quoteById.get(id);
                    const headline = TOP_SEVEN_LABELS[id];
                    if (!q) {
                      return (
                        <div
                          key={id}
                          className="flex h-[3.25rem] w-[6.25rem] shrink-0 flex-col justify-center rounded-md border border-dashed border-white/20 px-2 py-1"
                        >
                          <span className="truncate text-[9px] font-bold text-slate-500">{headline}</span>
                          <span className="text-[10px] text-slate-600">—</span>
                        </div>
                      );
                    }
                    const section = resolveSectionId(q);
                    if (!section) {
                      return (
                        <div
                          key={id}
                          className="flex h-[3.25rem] w-[6.25rem] shrink-0 flex-col justify-center rounded-md border border-white/15 px-2 py-1"
                        >
                          <span className="truncate text-[9px] font-bold text-slate-300">{headline}</span>
                          <span className="text-[10px] text-slate-500">—</span>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={id}
                        role="presentation"
                        className={`flex min-w-[6.25rem] shrink-0 cursor-default flex-col gap-0.5 rounded-md border border-white/10 bg-white/[0.07] px-2 py-1.5 transition hover:bg-white/[0.11] ${ROW_STRIPE[section]}`}
                        onMouseEnter={(e) => showTip(e, q, section)}
                        onMouseLeave={scheduleHide}
                      >
                        <span className="truncate text-[9px] font-bold uppercase tracking-wide text-slate-400">
                          {headline}
                        </span>
                        {q.ok ? (
                          <>
                            <span className="font-mono text-[11px] font-semibold tabular-nums leading-tight text-white">
                              {formatPrice(q)}
                              {q.currency ? (
                                <span className="ml-0.5 align-baseline text-[8px] font-sans font-medium text-slate-500">
                                  {q.currency}
                                </span>
                              ) : null}
                            </span>
                            <HeaderPct change={q.change} pct={formatSignedPercent(q.changePercent)} />
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500">—</span>
                        )}
                      </div>
                    );
                  })
                : null}
            </div>
          </div>
          {error ? (
            <p className="truncate px-0.5 text-center text-[10px] font-medium text-amber-300/95 sm:text-left">{error}</p>
          ) : null}
          {!loading && !quotes.length && !error ? (
            <p className="text-center text-[10px] text-slate-500 sm:text-left">No market data.</p>
          ) : null}
          <p className="hidden text-[9px] font-medium text-slate-600 sm:block">
            Hover a symbol for details · Yahoo · delayed
          </p>
        </div>
      </div>
    </>
  );
}
