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
  if (raw.includes('Nasdaq Composite')) return 'Nasdaq';
  if (raw.includes('Shanghai Composite')) return 'Shanghai';
  if (raw.includes('Dow Jones')) return 'Dow Jones';
  if (raw.includes('BSE Sensex')) return 'BSE Sensex';
  if (raw.includes('NIFTY 50') || raw.includes('Nifty 50')) return 'Nifty 50';
  if (raw.includes('Nikkei')) return 'Nikkei 225';
  if (raw.includes('FTSE')) return 'FTSE 100';
  if (raw.includes('DAX')) return 'DAX 40';
  if (raw.includes('WTI')) return 'WTI Crude';
  if (raw.includes('Brent')) return 'Brent Oil';
  if (raw.includes('Gold')) return 'Gold (XAU)';
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
      <div className="mb-8 rounded-2xl border border-slate-600/70 bg-[#2d313a] p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (quotes.length === 0) return null;

  return (
    <section
      className="relative mb-8 overflow-hidden rounded-2xl border border-slate-600/70 bg-gradient-to-b from-[#323640] via-[#2a2e37] to-[#23262e] p-4.5 text-white shadow-xl sm:p-5 lg:p-6"
      aria-label="Live Market Intelligence"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40 shadow-inner">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold tracking-tight text-white sm:text-lg">
                Live Market Intelligence
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-950/70 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Wire
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time quotes, global indices, commodities, and currency benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filter Tabs */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-1 text-xs font-semibold backdrop-blur-md">
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
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all duration-200 ${
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
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Dynamic Full-Color Rich Green & Red Quote Cards */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredQuotes.slice(0, 12).map((q) => {
          const isUp = (q.changePercent ?? 0) > 0;
          const isDown = (q.changePercent ?? 0) < 0;
          const isFlat = !isUp && !isDown;
          const name = cleanInstrumentName(q);
          const isCrypto = q.group === 'Crypto';

          return (
            <div
              key={q.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-3.5 transition-all duration-200 hover:scale-[1.03] ${
                isUp
                  ? 'border-emerald-400/70 bg-gradient-to-br from-[#065f46] via-[#047857] to-[#064e3b] shadow-[0_4px_18px_rgba(4,120,87,0.35)] hover:border-emerald-300 hover:shadow-[0_6px_25px_rgba(4,120,87,0.5)]'
                  : isDown
                  ? 'border-rose-400/70 bg-gradient-to-br from-[#9f1239] via-[#be123c] to-[#881337] shadow-[0_4px_18px_rgba(190,18,60,0.35)] hover:border-rose-300 hover:shadow-[0_6px_25px_rgba(190,18,60,0.5)]'
                  : 'border-slate-600 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-md'
              }`}
            >
              {/* Top Row: Flag & Name + Percentage Badge */}
              <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <AssetBadge q={q} />
                    <span className="block truncate font-display text-xs font-black text-white drop-shadow-sm">
                      {name}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider ${
                        isUp ? 'text-emerald-200' : isDown ? 'text-rose-200' : 'text-slate-300'
                      }`}
                    >
                      {q.group}
                    </span>
                    {q.currency && (
                      <span className="text-[9.5px] font-bold text-white/70">
                        • {q.currency}
                      </span>
                    )}
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-white/30 bg-black/25 px-1.5 py-0.5 text-[10.5px] font-black tabular-nums text-white backdrop-blur-md shadow-inner">
                  {isUp && <TrendingUp className="h-2.5 w-2.5 stroke-[3]" />}
                  {isDown && <TrendingDown className="h-2.5 w-2.5 stroke-[3]" />}
                  {isFlat && <Minus className="h-2.5 w-2.5 stroke-[3]" />}
                  <span>
                    {q.changePercent != null
                      ? `${isUp ? '+' : ''}${q.changePercent.toFixed(2)}%`
                      : '0.00%'}
                  </span>
                </span>
              </div>

              {/* Price Row */}
              <div className="mt-3.5 flex items-baseline justify-between gap-1 border-t border-white/15 pt-2.5">
                <span className="font-mono text-base font-black tracking-tight text-white drop-shadow-sm sm:text-[17px]">
                  {formatDisplayPrice(q.price, isCrypto)}
                </span>

                {q.change != null && (
                  <span
                    className={`text-[11px] font-black tabular-nums drop-shadow-sm ${
                      isUp ? 'text-emerald-100' : isDown ? 'text-rose-100' : 'text-slate-200'
                    }`}
                  >
                    {isUp ? '+' : ''}
                    {q.change.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Bottom Extra Details Row: Prev Close */}
              {q.previousClose != null && (
                <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-white/75">
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
