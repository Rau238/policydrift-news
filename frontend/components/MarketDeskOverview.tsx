'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Activity,
  Coins,
  Fuel,
  Gem,
  DollarSign,
} from 'lucide-react';
import type { MarketQuoteRow, MarketQuotesResponse } from '@/lib/types';

type Props = {
  category: string;
};

const NUM_LOCALE = 'en-US';

const ISO_MAP: Record<string, string> = {
  US: 'us',
  India: 'in',
  China: 'cn',
  'United Kingdom': 'gb',
  Japan: 'jp',
  Germany: 'de',
  gspc: 'us',
  dji: 'us',
  ixic: 'us',
  vix: 'us',
  nsei: 'in',
  bsesn: 'in',
  sse: 'cn',
  ftse: 'gb',
  n225: 'jp',
  gdaxi: 'de',
  usdinr: 'in',
};

function FlagImg({ iso }: { iso: string }) {
  const code = iso.toLowerCase();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${code}.svg`}
      width={20}
      height={14}
      alt={`${iso.toUpperCase()} flag`}
      title={`${iso.toUpperCase()} flag`}
      loading="lazy"
      decoding="async"
      className="inline-block shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-white/30"
      style={{ width: 20, height: 14 }}
    />
  );
}

function AssetBadge({ q }: { q: MarketQuoteRow }) {
  const iso = ISO_MAP[q.group] || ISO_MAP[q.id];
  if (iso) {
    return <FlagImg iso={iso} />;
  }
  if (q.group === 'Crypto' || q.id === 'btc' || q.id === 'eth' || q.id === 'sol') {
    return <Coins className="h-4 w-4 text-amber-300 shrink-0" />;
  }
  if (q.id === 'gc' || q.label.toLowerCase().includes('gold')) {
    return <Gem className="h-4 w-4 text-amber-200 shrink-0" />;
  }
  if (q.id === 'cl' || q.id === 'bz' || q.label.toLowerCase().includes('crude') || q.label.toLowerCase().includes('oil')) {
    return <Fuel className="h-4 w-4 text-sky-200 shrink-0" />;
  }
  if (q.group === 'FX') {
    return <DollarSign className="h-4 w-4 text-emerald-200 shrink-0" />;
  }
  return <span className="h-2 w-2 rounded-full bg-white/60 shrink-0" />;
}

function formatDisplayPrice(price: number | null, isCrypto: boolean): string {
  if (price == null) return '—';
  if (isCrypto && price < 1) {
    return `$${price.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  }
  return price.toLocaleString(NUM_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function cleanInstrumentName(q: MarketQuoteRow): string {
  const raw = q.label || q.shortName || q.symbol || q.id;
  if (raw.includes('Nasdaq Composite') || raw.includes('Nasdaq')) return 'Nasdaq';
  if (raw.includes('Shanghai Composite') || raw.includes('Shanghai')) return 'Shanghai';
  if (raw.includes('Dow Jones')) return 'Dow Jones';
  if (raw.includes('BSE Sensex') || raw.includes('Sensex')) return 'Sensex';
  if (raw.includes('NIFTY 50') || raw.includes('Nifty 50') || raw.includes('Nifty')) return 'Nifty 50';
  if (raw.includes('Nikkei')) return 'Nikkei 225';
  if (raw.includes('FTSE')) return 'FTSE 100';
  if (raw.includes('DAX')) return 'DAX 40';
  if (raw.includes('WTI')) return 'WTI Crude';
  if (raw.includes('Brent')) return 'Brent Oil';
  if (raw.includes('Gold')) return 'Gold (XAU)';
  if (raw.includes('USD/INR') || raw.includes('USDINR') || raw.includes('USD / INR')) return 'USD/INR';
  if (raw.includes('EUR/USD') || raw.includes('EURUSD') || raw.includes('EUR / USD')) return 'EUR/USD';
  if (raw.includes('GBP/USD') || raw.includes('GBPUSD') || raw.includes('GBP / USD')) return 'GBP/USD';
  return raw;
}

export function MarketDeskOverview({ category }: Props) {
  const [quotes, setQuotes] = useState<MarketQuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<'all' | 'indices' | 'commodities' | 'fx' | 'crypto'>('all');

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/market-quotes', { cache: 'no-store' });
      if (res.ok) {
        const data: MarketQuotesResponse = await res.json();
        if (Array.isArray(data.quotes)) {
          setQuotes(data.quotes);
          setLastUpdated(new Date());
        }
      }
    } catch {
      // Retain existing state on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 45000);
    return () => clearInterval(interval);
  }, []);

  const defaultFilter = useMemo(() => {
    if (category === 'Crypto') return 'crypto';
    if (category === 'Banking & Economics') return 'fx';
    return 'all';
  }, [category]);

  useEffect(() => {
    setFilter(defaultFilter);
  }, [defaultFilter]);

  const filteredQuotes = useMemo(() => {
    if (filter === 'indices') {
      return quotes.filter((q) => ['US', 'India', 'China', 'Japan', 'Germany', 'United Kingdom'].includes(q.group));
    }
    if (filter === 'commodities') {
      return quotes.filter((q) => q.group === 'Commodities');
    }
    if (filter === 'fx') {
      return quotes.filter((q) => q.group === 'FX');
    }
    if (filter === 'crypto') {
      return quotes.filter((q) => q.group === 'Crypto');
    }
    return quotes;
  }, [quotes, filter]);

  if (loading && quotes.length === 0) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-600/70 bg-[#2d313a] p-3.5 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (quotes.length === 0) return null;

  return (
    <section
      className="relative mb-6 sm:mb-8 overflow-hidden rounded-2xl border border-slate-600/70 bg-gradient-to-b from-[#323640] via-[#2a2e37] to-[#23262e] p-3 sm:p-5 lg:p-6 text-white shadow-xl"
      aria-label="Live Market Intelligence"
    >
      {/* Header Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40 shadow-inner">
            <Activity className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="font-display text-sm font-bold tracking-tight text-white sm:text-lg truncate">
                Live Market Intelligence
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-950/70 px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10.5px] font-bold uppercase tracking-wider text-emerald-300 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Real-time quotes, global indices, and commodities
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Quick Filter Tabs */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-0.5 sm:p-1 text-[11px] sm:text-xs font-semibold backdrop-blur-md overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'indices', label: 'Indices' },
                { id: 'commodities', label: 'Commodities' },
                { id: 'crypto', label: 'Crypto' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`rounded-lg px-2 py-0.5 sm:px-3 sm:py-1 text-[10.5px] sm:text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchQuotes}
            aria-label="Refresh quotes"
            className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <RefreshCw className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Dynamic Full-Color Rich Green & Red Quote Cards (Compact for Mobile) */}
      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredQuotes.slice(0, 12).map((q) => {
          const isUp = (q.changePercent ?? 0) > 0;
          const isDown = (q.changePercent ?? 0) < 0;
          const isFlat = !isUp && !isDown;
          const name = cleanInstrumentName(q);
          const isCrypto = q.group === 'Crypto';

          return (
            <div
              key={q.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border-2 p-2.5 sm:p-3.5 transition-all duration-200 hover:scale-[1.02] sm:hover:scale-[1.03] ${
                isUp
                  ? 'border-emerald-400/70 bg-gradient-to-br from-[#065f46] via-[#047857] to-[#064e3b] shadow-[0_3px_12px_rgba(4,120,87,0.3)] hover:border-emerald-300'
                  : isDown
                  ? 'border-rose-400/70 bg-gradient-to-br from-[#9f1239] via-[#be123c] to-[#881337] shadow-[0_3px_12px_rgba(190,18,60,0.3)] hover:border-rose-300'
                  : 'border-slate-600 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-md'
              }`}
            >
              {/* Top Row: Flag & Name + Percentage Badge */}
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <AssetBadge q={q} />
                    <span className="block truncate font-display text-[11px] sm:text-xs font-black text-white drop-shadow-sm">
                      {name}
                    </span>
                  </div>
                  <div className="mt-0.5 sm:mt-1 flex items-center gap-1">
                    <span
                      className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${
                        isUp ? 'text-emerald-200' : isDown ? 'text-rose-200' : 'text-slate-300'
                      }`}
                    >
                      {q.group}
                    </span>
                    {q.currency && (
                      <span className="text-[8.5px] sm:text-[9.5px] font-bold text-white/70">
                        • {q.currency}
                      </span>
                    )}
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md sm:rounded-lg border border-white/30 bg-black/30 px-1 py-0.2 sm:px-1.5 sm:py-0.5 text-[9px] sm:text-[10.5px] font-black tabular-nums text-white backdrop-blur-md shadow-inner">
                  {isUp && <TrendingUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 stroke-[3]" />}
                  {isDown && <TrendingDown className="h-2 w-2 sm:h-2.5 sm:w-2.5 stroke-[3]" />}
                  {isFlat && <Minus className="h-2 w-2 sm:h-2.5 sm:w-2.5 stroke-[3]" />}
                  <span>
                    {q.changePercent != null
                      ? `${isUp ? '+' : ''}${q.changePercent.toFixed(1)}%`
                      : '0.0%'}
                  </span>
                </span>
              </div>

              {/* Price Row */}
              <div className="mt-2 sm:mt-3.5 flex items-baseline justify-between gap-1 border-t border-white/15 pt-1.5 sm:pt-2.5">
                <span className="font-mono text-[13px] sm:text-base font-black tracking-tight text-white drop-shadow-sm">
                  {formatDisplayPrice(q.price, isCrypto)}
                </span>

                {q.change != null && (
                  <span
                    className={`text-[9.5px] sm:text-[11px] font-black tabular-nums drop-shadow-sm ${
                      isUp ? 'text-emerald-100' : isDown ? 'text-rose-100' : 'text-slate-200'
                    }`}
                  >
                    {isUp ? '+' : ''}
                    {q.change.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Bottom Extra Details Row: Prev Close */}
              {q.previousClose != null && (
                <div className="mt-0.5 flex items-center justify-between text-[8.5px] sm:text-[10px] font-medium text-white/75">
                  <span>Prev</span>
                  <span className="font-mono tabular-nums">
                    {formatDisplayPrice(q.previousClose, isCrypto)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
