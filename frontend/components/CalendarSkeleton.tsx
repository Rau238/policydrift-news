import React from 'react';

type CalendarSkeletonProps = {
  variant?: 'macro' | 'holiday' | 'commodity' | 'general';
};

export function CalendarSkeleton({ variant = 'macro' }: CalendarSkeletonProps) {
  const isHoliday = variant === 'holiday';
  const isCommodity = variant === 'commodity';

  // Desk-specific styling configuration
  const deskMeta = isHoliday
    ? {
        badge: 'Stock Exchange Desks',
        badgeClass: 'border-indigo-500/30 bg-indigo-950/60 text-indigo-400/90',
        subline: 'NSE, BSE, MCX, NYSE & NASDAQ Market Schedules',
        title: 'Trading & Market Holidays Calendar',
        spineGradient: 'from-indigo-500/50 to-slate-800',
        spineDot: 'bg-indigo-400/80 shadow-[0_0_8px_rgba(99,102,241,0.6)]',
        dateIconBg: 'border-indigo-400/60 bg-indigo-950/80 text-indigo-300',
      }
    : isCommodity
    ? {
        badge: 'Commodities & Energy Desk',
        badgeClass: 'border-orange-500/30 bg-orange-950/60 text-orange-400/80',
        subline: 'OPEC+ Agendas, Crude Oil Inventories & Bullion Expiry',
        title: 'Commodities & Energy Calendar',
        spineGradient: 'from-orange-500/50 to-slate-800',
        spineDot: 'bg-orange-400/80 shadow-[0_0_8px_rgba(249,115,22,0.6)]',
        dateIconBg: 'border-orange-400/60 bg-orange-950/80 text-orange-300',
      }
    : {
        badge: 'Macro Intelligence Desk',
        badgeClass: 'border-blue-500/30 bg-blue-950/60 text-blue-400/80',
        subline: 'RBI, Fed, CPI Inflation, GDP & Growth Prints',
        title: 'Macro Economic Calendar',
        spineGradient: 'from-teal-500/50 to-slate-800',
        spineDot: 'bg-teal-400/80 shadow-[0_0_8px_rgba(45,212,191,0.6)]',
        dateIconBg: 'border-teal-400/60 bg-teal-950/80 text-teal-300',
      };

  return (
    <main
      className="min-h-screen bg-slate-950 text-slate-100 animate-pulse select-none"
      aria-busy="true"
      aria-label="Loading calendar desk data"
    >
      {/* ── Clean Compact Editorial Header Skeleton ─────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-slate-900/70 via-slate-950 to-slate-950 py-3.5 sm:py-5">
        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`rounded-full border px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${deskMeta.badgeClass}`}>
              {deskMeta.badge}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono hidden sm:inline">
              {deskMeta.subline}
            </span>
          </div>
          <h1 className="font-display text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white/80">
            {deskMeta.title}
          </h1>
        </div>
      </div>

      {/* ── Main Interactive Calendar Body Skeleton ─────────────────────────── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 2xl:max-w-[1440px] pt-4 sm:pt-6 space-y-4">
        {/* 1. Live Highlights Ticker Strip Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-y border-slate-800/80 bg-slate-950/60 py-2.5 px-3 rounded-lg">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-slate-700 shrink-0" />
            <div className="h-3 w-16 rounded bg-slate-800 shrink-0" />
            <div className="h-3.5 w-36 sm:w-52 rounded bg-slate-800" />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-14 rounded bg-slate-800/80" />
            <div className="h-3 w-14 rounded bg-slate-800/80" />
            <div className="h-3 w-14 rounded bg-slate-800/80" />
          </div>
        </div>

        {/* 2. Filter Command Bar Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 pb-3 border-b border-slate-800/80">
          <div className="h-9 w-full lg:max-w-md rounded-lg bg-slate-900 border border-slate-800" />
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 lg:pb-0">
            <div className="h-8 w-28 sm:w-36 rounded-lg bg-slate-900 border border-slate-800 shrink-0" />
            <div className="h-8 w-28 sm:w-36 rounded-lg bg-slate-900 border border-slate-800 shrink-0" />
            <div className="h-8 w-24 sm:w-28 rounded-lg bg-slate-900 border border-slate-800 shrink-0" />
          </div>
        </div>

        {/* 3. Event Counter Header Skeleton */}
        <div className="flex items-center justify-between px-1">
          <div className="h-3.5 w-32 sm:w-44 rounded bg-slate-800/70" />
          <div className="h-3 w-16 rounded bg-slate-800/60" />
        </div>

        {/* 4. Timeline Stream with Spine Skeleton */}
        <div className="space-y-6 pt-1">
          {/* Day Group 1 */}
          <div className="relative">
            {/* Sticky Date Marker Skeleton */}
            <div className="flex items-center bg-slate-950/95 py-2 sm:py-2.5 border-b border-slate-800/80">
              <div className="w-8 shrink-0 flex items-center justify-center">
                <div className={`h-6 w-6 rounded-full border-2 ${deskMeta.dateIconBg} flex items-center justify-center`}>
                  <div className="h-2 w-2 rounded-full bg-current opacity-60" />
                </div>
              </div>
              <div className="flex items-center gap-2 pl-2">
                <div className="h-3.5 sm:h-4 w-36 sm:w-48 rounded bg-slate-800" />
                <div className="h-3 w-12 rounded bg-slate-800/60" />
              </div>
            </div>

            {/* Desktop Table Column Header Skeleton (hidden on mobile/tablet) */}
            <div className="hidden lg:flex items-center text-[10px] py-2 pr-3 border-b border-slate-800/60 mb-0.5">
              <div className="relative w-8 shrink-0 flex items-center justify-center self-stretch min-h-[18px]">
                <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b ${deskMeta.spineGradient}`} />
                <span className={`relative z-10 h-1.5 w-1.5 rounded-full ${deskMeta.spineDot}`} />
              </div>
              {isHoliday ? (
                <div className="flex-1 grid grid-cols-12 gap-2 pl-2">
                  <div className="col-span-2 h-3 w-20 rounded bg-slate-800/70" />
                  <div className="col-span-4 h-3 w-36 rounded bg-slate-800/70" />
                  <div className="col-span-3 h-3 w-28 rounded bg-slate-800/70" />
                  <div className="col-span-2 h-3 w-24 rounded bg-slate-800/70" />
                  <div className="col-span-1 h-3 w-12 rounded bg-slate-800/70 ml-auto" />
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-12 gap-2 pl-2">
                  <div className="col-span-2 h-3 w-20 rounded bg-slate-800/70" />
                  <div className="col-span-5 h-3 w-36 rounded bg-slate-800/70" />
                  <div className="col-span-1 h-3 w-12 rounded bg-slate-800/70 mx-auto" />
                  <div className="col-span-1 h-3 w-12 rounded bg-slate-800/70 mx-auto" />
                  <div className="col-span-1 h-3 w-12 rounded bg-slate-800/70 mx-auto" />
                  <div className="col-span-2 h-3 w-16 rounded bg-slate-800/70 ml-auto" />
                </div>
              )}
            </div>

            {/* Event Rows: Mobile + Desktop responsive skeletons */}
            <div className="divide-y divide-slate-800/60">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex items-start sm:items-center py-3 pr-2 sm:pr-3">
                  {/* Spine line + node dot */}
                  <div className="relative self-stretch flex items-start sm:items-center justify-center w-8 shrink-0">
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-800/80" />
                    <span className="relative z-10 h-3 w-3 rounded-full bg-slate-700 border-2 border-slate-950 mt-1 sm:mt-0" />
                  </div>

                  {/* ── MOBILE / TABLET SKELETON (< lg) ── */}
                  <div className="flex-1 min-w-0 pl-2 lg:hidden space-y-2">
                    {isHoliday ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-3 w-10 rounded bg-slate-800" />
                            <div className="h-3 w-3 rounded bg-slate-800/60" />
                            <div className="h-3 w-16 rounded bg-slate-800/80" />
                          </div>
                          <div className="h-3.5 w-14 rounded-full bg-slate-800" />
                        </div>
                        <div className="h-4 w-4/5 rounded bg-slate-800" />
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-24 rounded-full bg-slate-800/90" />
                          <div className="h-4 w-10 rounded bg-slate-800" />
                          <div className="h-4 w-10 rounded bg-slate-800" />
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
                          <div className="h-2.5 w-20 rounded bg-slate-800/60" />
                          <div className="h-4 w-20 rounded bg-slate-800/80" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-3 w-12 rounded bg-slate-800" />
                            <div className="h-3 w-3 rounded bg-slate-800/60" />
                            <div className="h-3 w-14 rounded bg-slate-800/80" />
                            <div className="h-3 w-8 rounded bg-slate-800/60" />
                          </div>
                          <div className="h-3 w-12 rounded bg-slate-800" />
                        </div>
                        <div className="h-4 w-3/4 rounded bg-slate-800" />
                        {/* 3-Column Mini Grid Skeleton */}
                        <div className="grid grid-cols-3 gap-2 py-1.5 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                          <div className="space-y-1">
                            <div className="h-2 w-8 rounded bg-slate-800/60" />
                            <div className="h-3 w-12 rounded bg-slate-800" />
                          </div>
                          <div className="space-y-1 pl-2 border-l border-slate-800">
                            <div className="h-2 w-10 rounded bg-slate-800/60" />
                            <div className="h-3 w-10 rounded bg-slate-800" />
                          </div>
                          <div className="space-y-1 pl-2 border-l border-slate-800">
                            <div className="h-2 w-10 rounded bg-slate-800/60" />
                            <div className="h-3 w-10 rounded bg-slate-800" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-0.5">
                          <div className="h-2.5 w-20 rounded bg-slate-800/60" />
                          <div className="flex items-center gap-1.5">
                            <div className="h-4 w-10 rounded bg-slate-800" />
                            <div className="h-4 w-10 rounded bg-slate-800" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* ── DESKTOP SKELETON (>= lg) ── */}
                  <div className="hidden lg:block flex-1 min-w-0 pl-2">
                    {isHoliday ? (
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-2 flex items-center gap-1.5">
                          <div className="h-3.5 w-12 rounded bg-slate-800" />
                          <div className="h-3 w-10 rounded bg-slate-800/60" />
                        </div>
                        <div className="col-span-4 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div className="h-3.5 w-4 rounded bg-slate-800" />
                            <div className="h-3 w-16 rounded bg-slate-800/80" />
                            <div className="h-3 w-12 rounded bg-slate-800/60" />
                          </div>
                          <div className="h-4 w-48 rounded bg-slate-800" />
                        </div>
                        <div className="col-span-3 flex items-center gap-1.5">
                          <div className="h-5 w-10 rounded bg-slate-800" />
                          <div className="h-5 w-10 rounded bg-slate-800" />
                          <div className="h-5 w-10 rounded bg-slate-800" />
                        </div>
                        <div className="col-span-2">
                          <div className="h-5 w-28 rounded-full bg-slate-800/90" />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <div className="h-6 w-14 rounded bg-slate-800" />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-2 flex items-center gap-1.5">
                          <div className="h-3.5 w-14 rounded bg-slate-800" />
                          <div className="h-3 w-10 rounded bg-slate-800/60" />
                        </div>
                        <div className="col-span-5 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div className="h-3.5 w-4 rounded bg-slate-800" />
                            <div className="h-3 w-16 rounded bg-slate-800/80" />
                            <div className="h-3 w-12 rounded bg-slate-800/60" />
                          </div>
                          <div className="h-4 w-60 rounded bg-slate-800" />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <div className="h-4 w-12 rounded bg-slate-800" />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <div className="h-4 w-10 rounded bg-slate-800" />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <div className="h-4 w-10 rounded bg-slate-800" />
                        </div>
                        <div className="col-span-2 flex justify-end gap-1.5">
                          <div className="h-6 w-12 rounded bg-slate-800" />
                          <div className="h-6 w-12 rounded bg-slate-800" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
