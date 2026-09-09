import type { Metadata } from 'next';
import { absoluteUrl, siteName } from '@/lib/site';
import { fetchCalendarEvents } from '@/lib/calendar';
import { CalendarHubClient } from '../CalendarHubClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Commodities & Energy Calendar | ${siteName}`,
  description:
    'Real-time agenda for crude oil (OPEC+, EIA inventories, IEA reports), natural gas storage, bullion (gold & silver MCX/COMEX expiry), and base metals catalysts.',
  alternates: {
    canonical: absoluteUrl('/calendar/commodities'),
  },
  openGraph: {
    title: `Commodities & Energy Calendar | ${siteName}`,
    description:
      'Tracking OPEC+ ministerial meetings, US crude inventories, and global energy agendas.',
    url: absoluteUrl('/calendar/commodities'),
    siteName,
  },
};

export default async function CommoditiesCalendarPage() {
  const calendarData = await fetchCalendarEvents({ timeframe: 'all' });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Clean Compact Editorial Header ─────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-slate-900/70 via-slate-950 to-slate-950 py-4 sm:py-5">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="rounded-full border border-orange-500/30 bg-orange-950/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
              Commodities &amp; Energy Desk
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              OPEC+ Agendas, Crude Oil Inventories &amp; Bullion Expiry
            </span>
          </div>

          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            Commodities &amp; Energy Calendar
          </h1>
        </div>
      </div>

      {/* ── Main Interactive Calendar Body ──────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 2xl:max-w-[1440px] pt-4 sm:pt-6">
        <CalendarHubClient initialData={calendarData} category="commodity" />
      </div>
    </main>
  );
}
