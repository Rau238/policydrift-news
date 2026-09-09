import type { Metadata } from 'next';
import { absoluteUrl, siteName } from '@/lib/site';
import { fetchCalendarEvents } from '@/lib/calendar';
import { CalendarHubClient } from './CalendarHubClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Economic, Holiday & Commodities Calendar | ${siteName}`,
  description:
    'Comprehensive real-time financial calendar tracking central bank rate decisions (RBI, Fed), macro indicators (CPI, GDP), stock exchange holidays (NSE, BSE, MCX, NYSE), and commodities agenda.',
  alternates: {
    canonical: absoluteUrl('/calendar'),
  },
  openGraph: {
    title: `Economic, Holiday & Commodities Calendar | ${siteName}`,
    description:
      'Real-time schedule for macro economic releases, exchange trading holidays, and global commodities & energy agendas.',
    url: absoluteUrl('/calendar'),
    siteName,
  },
};

type PageProps = {
  searchParams?: {
    type?: string;
    country?: string;
  };
};

export default async function CalendarPage({ searchParams }: PageProps) {
  const typeParam = searchParams?.type?.toLowerCase();
  const category =
    typeParam === 'holiday' || typeParam === 'holidays'
      ? 'holiday'
      : typeParam === 'commodity' || typeParam === 'commodities'
      ? 'commodity'
      : 'economy';

  const calendarData = await fetchCalendarEvents({ timeframe: 'all' });

  const pageMeta =
    category === 'holiday'
      ? {
          badge: 'Stock Exchange Desks',
          subline: 'NSE, BSE, MCX, NYSE & NASDAQ Market Schedules',
          title: 'Trading & Market Holidays Calendar',
        }
      : category === 'commodity'
      ? {
          badge: 'Commodities & Energy Desk',
          subline: 'OPEC+ Agendas, Crude Oil Inventories & Bullion Expiry',
          title: 'Commodities & Energy Calendar',
        }
      : {
          badge: 'Macro Intelligence Desk',
          subline: 'RBI, Fed, CPI Inflation, GDP & Growth Prints',
          title: 'Macro Economic Calendar',
        };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Clean Compact Editorial Header ─────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-slate-900/70 via-slate-950 to-slate-950 py-4 sm:py-5">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="rounded-full border border-teal-500/30 bg-teal-950/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-400">
              {pageMeta.badge}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {pageMeta.subline}
            </span>
          </div>

          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            {pageMeta.title}
          </h1>
        </div>
      </div>

      {/* ── Main Interactive Calendar Body ──────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 2xl:max-w-[1440px] pt-4 sm:pt-6">
        <CalendarHubClient initialData={calendarData} category={category} />
      </div>
    </main>
  );
}
