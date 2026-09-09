'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  TrendingUp,
  AlertCircle,
  Search,
  Landmark,
  Palmtree,
  Zap,
  ArrowUpRight,
  Filter,
  Download,
  CalendarCheck2,
  Layers,
  Flame,
} from 'lucide-react';
import type {
  CalendarEventItem,
  CalendarResponse,
  CalendarEventType,
} from '@/lib/calendar';
import { CountryFlag } from '@/components/CountryFlag';

type Props = {
  initialData: CalendarResponse;
  category?: CalendarEventType;
};

export function CalendarHubClient({ initialData, category }: Props) {
  const [activeTab, setActiveTab] = useState<CalendarEventType>(category || 'economy');
  const [selectedCountry, setSelectedCountry] = useState<'all' | 'IN' | 'US' | 'GLOBAL'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'this_week' | 'next_week' | 'this_month'>('all');
  const [onlyHighImpact, setOnlyHighImpact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync category prop if updated from page
  useEffect(() => {
    if (category && category !== activeTab) {
      setActiveTab(category);
    }
  }, [category]);

  const events = initialData.events || [];
  const summary = initialData.summary;

  const handleTabChange = (tab: CalendarEventType) => {
    setActiveTab(tab);
    if (tab === 'holiday' && selectedTimeframe !== 'all') {
      setSelectedTimeframe('all');
    }
    const targetUrl = tab === 'economy' ? '/calendar/macro' : tab === 'holiday' ? '/calendar/holidays' : '/calendar/commodities';
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', targetUrl);
    }
  };

  // Filter pipeline: strictly isolates to the selected category (no "all" mix)
  const filteredEvents = useMemo(() => {
    return events.filter((item) => {
      // 1. Category filter: only show items belonging to the active category
      if (item.type !== activeTab) return false;

      // 2. Country filter
      if (selectedCountry !== 'all') {
        if (selectedCountry === 'GLOBAL' && item.country !== 'GLOBAL') return false;
        if (selectedCountry !== 'GLOBAL' && item.country !== selectedCountry && item.country !== 'GLOBAL') return false;
      }

      // 3. Timeframe filter
      if (selectedTimeframe === 'this_week' && !(item.daysDiff >= 0 && item.daysDiff <= 7)) return false;
      if (selectedTimeframe === 'next_week' && !(item.daysDiff > 7 && item.daysDiff <= 14)) return false;
      if (selectedTimeframe === 'this_month' && !(item.daysDiff >= 0 && item.daysDiff <= 31)) return false;

      // 4. Impact filter
      if (onlyHighImpact && item.impact !== 'high') return false;

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q) ?? false;
        const matchAuth = item.authority?.toLowerCase().includes(q) ?? false;
        const matchCompany = item.company?.toLowerCase().includes(q) ?? false;
        const matchSymbol = item.symbol?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchDesc && !matchAuth && !matchCompany && !matchSymbol) return false;
      }

      return true;
    });
  }, [events, activeTab, selectedCountry, selectedTimeframe, onlyHighImpact, searchQuery]);

  // Group filtered events by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    for (const ev of filteredEvents) {
      if (!map.has(ev.date)) {
        map.set(ev.date, []);
      }
      map.get(ev.date)!.push(ev);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredEvents]);

  // Helper to format friendly date headers
  function formatDateHeader(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      full: d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      monthDay: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      year: d.getFullYear(),
    };
  }

  // Generate .ics calendar download for an event
  function handleExportIcs(event: CalendarEventItem) {
    const cleanTitle = event.title.replace(/,/g, '');
    const cleanDesc = (event.description || '').replace(/\n/g, ' ');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NewsFree365//Financial Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@newsfree365.live`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${event.date.replace(/-/g, '')}`,
      `SUMMARY:${cleanTitle}`,
      `DESCRIPTION:${cleanDesc} - via NewsFree365 Calendar`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4 pb-12">
      {/* ── Sleek Live Highlights Ticker Strip (No Cards Structure) ─────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-y border-slate-800/90 bg-slate-950/60 py-2.5 sm:py-3 px-2.5 text-xs sm:text-sm rounded-lg">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          {activeTab === 'economy' && summary?.nextEconomicEvent && (
            <div className="flex items-center gap-2 text-slate-200 min-w-0 flex-wrap">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-blue-400 ring-4 ring-blue-500/20 animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-blue-400 shrink-0">
                Next Macro:
              </span>
              <CountryFlag iso={summary.nextEconomicEvent.country} flag={summary.nextEconomicEvent.flag} size={14} className="shrink-0" />
              <span className="font-bold text-white truncate max-w-[150px] xs:max-w-[220px] sm:max-w-[280px]">
                {summary.nextEconomicEvent.title}
              </span>
              <span className="font-mono text-teal-300 text-xs sm:text-sm font-extrabold shrink-0">
                {summary.nextEconomicEvent.time}
              </span>
              <span className="text-slate-400 text-[11px] sm:text-xs font-medium shrink-0">
                ({summary.nextEconomicEvent.countdown})
              </span>
            </div>
          )}

          {activeTab === 'holiday' && summary?.nextMarketHoliday && (
            <div className="flex items-center gap-2 text-slate-200 min-w-0 flex-wrap">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-indigo-400 ring-4 ring-indigo-500/20 animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-400 shrink-0">
                Next Holiday:
              </span>
              <CountryFlag iso={summary.nextMarketHoliday.country} flag={summary.nextMarketHoliday.flag} size={14} className="shrink-0" />
              <span className="font-bold text-white truncate max-w-[150px] xs:max-w-[220px] sm:max-w-[280px]">
                {summary.nextMarketHoliday.title}
              </span>
              <span className="font-mono text-indigo-300 text-xs sm:text-sm font-extrabold shrink-0">
                {summary.nextMarketHoliday.date}
              </span>
              <span className="text-slate-400 text-[11px] sm:text-xs font-medium shrink-0">
                ({summary.nextMarketHoliday.countdown})
              </span>
            </div>
          )}

          {activeTab === 'commodity' && summary?.nextCommodity && (
            <div className="flex items-center gap-2 text-slate-200 min-w-0 flex-wrap">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-orange-400 ring-4 ring-orange-500/20 animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-orange-400 shrink-0">
                Next Commodity:
              </span>
              <span className="font-bold text-white truncate max-w-[150px] xs:max-w-[220px] sm:max-w-[280px]">
                {summary.nextCommodity.title}
              </span>
              <span className="font-mono text-orange-300 text-xs sm:text-sm font-extrabold shrink-0">
                {summary.nextCommodity.date}
              </span>
              <span className="text-slate-400 text-[11px] sm:text-xs font-medium shrink-0">
                ({summary.nextCommodity.countdown})
              </span>
            </div>
          )}
        </div>

        {/* Live Category Counts & Fast Desk Links */}
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-mono text-slate-300 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800/80">
          <Link
            href="/calendar/macro"
            className={`transition hover:underline ${
              activeTab === 'economy' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {summary?.counts.economy ?? 0} Macro
          </Link>
          <span className="text-slate-600">•</span>
          <Link
            href="/calendar/holidays"
            className={`transition hover:underline ${
              activeTab === 'holiday' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {summary?.counts.holidays ?? 0} Holidays
          </Link>
          <span className="text-slate-600">•</span>
          <Link
            href="/calendar/commodities"
            className={`transition hover:underline ${
              activeTab === 'commodity' ? 'text-orange-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {summary?.counts.commodities ?? 0} Commodities
          </Link>
        </div>
      </div>

      {/* ── Main Filter Toolbar (Search, Region, Window & High-Impact) ───────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 pb-3 border-b border-slate-800/90">
        {/* Search Input - Full width on mobile/tablet, flex-1 on desktop */}
        <div className="relative w-full lg:max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'holiday'
                ? 'Search holidays by name or exchange...'
                : 'Search by indicator, authority, or commodity...'
            }
            className="w-full rounded-lg border border-slate-700/80 bg-slate-900/90 pl-9 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-teal-400 focus:outline-hidden focus:ring-1 focus:ring-teal-400 hover:border-slate-500 transition shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white px-1 py-0.5 rounded"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls: Touch-scrollable chip bar on mobile, clean flex on desktop */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 lg:pb-0 flex-nowrap sm:flex-wrap">
          {/* Region Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-400 shrink-0 font-medium hidden xs:inline">Region:</span>
            <div className="inline-flex items-center rounded-lg bg-slate-900/90 border border-slate-700/80 p-0.5 shadow-inner">
              {(['all', 'IN', 'US', 'GLOBAL'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCountry(c)}
                  className={`rounded-md py-1.5 px-2 text-xs font-semibold text-center transition flex items-center justify-center gap-1 touch-manipulation active:scale-95 ${
                    selectedCountry === c
                      ? 'bg-slate-700 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {c === 'all' ? (
                    <span>All</span>
                  ) : c === 'IN' ? (
                    <>
                      <CountryFlag iso="in" size={13} />
                      <span>IN</span>
                    </>
                  ) : c === 'US' ? (
                    <>
                      <CountryFlag iso="us" size={13} />
                      <span>US</span>
                    </>
                  ) : (
                    <>
                      <Globe size={12} className="text-violet-400" />
                      <span>Global</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Window / Timeframe Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-400 shrink-0 font-medium hidden xs:inline">Window:</span>
            <div className="inline-flex items-center rounded-lg bg-slate-900/90 border border-slate-700/80 p-0.5 shadow-inner">
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'this_week', label: '7 Days' },
                  { key: 'this_month', label: 'Month' },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setSelectedTimeframe(t.key)}
                  className={`rounded-md py-1.5 px-2.5 text-xs font-semibold text-center transition touch-manipulation active:scale-95 ${
                    selectedTimeframe === t.key
                      ? 'bg-slate-700 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Impact Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyHighImpact((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs font-bold shrink-0 transition touch-manipulation active:scale-95 ${
              onlyHighImpact
                ? 'border-rose-400 bg-rose-950/80 text-rose-200 shadow-sm ring-1 ring-rose-400/30'
                : 'border-slate-600/80 bg-slate-900/90 text-slate-200 hover:border-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Zap size={13} className={onlyHighImpact ? 'text-rose-400 fill-rose-400' : 'text-slate-400'} />
            <span className="whitespace-nowrap">High Impact</span>
          </button>
        </div>
      </div>

      {/* ── Status Count Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-mono">{filteredEvents.length}</strong> events
          {selectedTimeframe !== 'all' && ` in selected window`}
          {onlyHighImpact && ` (high impact only)`}
        </span>
        {filteredEvents.length < events.length && (
          <button
            type="button"
            onClick={() => {
              setActiveTab(category || 'economy');
              setSelectedCountry('all');
              setSelectedTimeframe('all');
              setOnlyHighImpact(false);
              setSearchQuery('');
            }}
            className="text-teal-400 hover:text-teal-300 font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ── Authentic Vertical Timeline & Details (Strictly No Cards) ──────── */}
      {groupedByDate.length === 0 ? (
        <div className="border border-slate-800/80 bg-slate-950/40 p-8 text-center rounded-lg">
          <CalendarIcon size={26} className="mx-auto text-slate-600 mb-2" />
          <h3 className="text-sm font-bold text-white">No matching events found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing high-impact filter, or selecting a broader timeframe.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {groupedByDate.map(([dateKey, items]) => {
            const dateInfo = formatDateHeader(dateKey);
            const isToday =
              dateKey === '2026-09-09' ||
              new Date(dateKey + 'T00:00:00').toDateString() === new Date().toDateString();

            return (
              <div key={dateKey} className="relative">
                {/* ── Date Marker along Timeline ── */}
                <div className="sticky top-12 sm:top-14 z-20 flex items-center bg-slate-950/95 py-2.5 backdrop-blur-md border-b border-slate-800/80">
                  <div className="w-8 shrink-0 flex items-center justify-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      isToday
                        ? 'border-emerald-400 bg-emerald-950 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                        : activeTab === 'holiday'
                        ? 'border-indigo-400 bg-indigo-950 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                        : 'border-teal-500 bg-teal-950 text-teal-300 shadow-[0_0_8px_rgba(20,184,166,0.3)]'
                    }`}>
                      {activeTab === 'holiday' ? <Palmtree size={11} /> : <CalendarIcon size={11} />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pl-2.5">
                    <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide">
                      {dateInfo.full}
                    </span>
                    {isToday && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-2 py-0.2 text-[9px] font-black uppercase tracking-wider text-emerald-300 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        Today
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-500">
                      • {items.length} {items.length === 1 ? (activeTab === 'holiday' ? 'market closure' : 'event') : (activeTab === 'holiday' ? 'market closures' : 'events')}
                    </span>
                  </div>
                </div>

                {/* ── Timeline Spine & Table Stream (No Cards Structure) ── */}
                <div className="relative">
                  {/* Table Column Headers on Desktop */}
                  <div className="hidden lg:flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 py-2 pr-3 border-b border-slate-800/60 mb-0.5">
                    <div className="relative w-8 shrink-0 flex items-center justify-center self-stretch min-h-[18px]">
                      {/* Spine segment connecting header to list */}
                      <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b ${
                        activeTab === 'holiday' ? 'from-indigo-500/60 to-slate-800' : 'from-teal-500/60 to-slate-800'
                      }`} />
                      <span className={`relative z-10 h-1.5 w-1.5 rounded-full ${
                        activeTab === 'holiday' ? 'bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]' : 'bg-teal-400/80 shadow-[0_0_6px_rgba(45,212,191,0.8)]'
                      }`} />
                    </div>
                    {activeTab === 'holiday' ? (
                      <div className="flex-1 grid grid-cols-12 gap-2 items-center pl-2 text-slate-400">
                        <div className="col-span-2">Day &amp; Window</div>
                        <div className="col-span-4">Holiday Occasion &amp; Country</div>
                        <div className="col-span-3">Affected Exchanges</div>
                        <div className="col-span-2">Trading Session Status</div>
                        <div className="col-span-1 text-right">Calendar</div>
                      </div>
                    ) : (
                      <div className="flex-1 grid grid-cols-12 gap-2 items-center pl-2">
                        <div className="col-span-2">Time (GMT)</div>
                        <div className="col-span-5">Event &amp; Region</div>
                        <div className="col-span-1 text-center">Actual</div>
                        <div className="col-span-1 text-center">Forecast</div>
                        <div className="col-span-1 text-center">Previous</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                    )}
                  </div>

                  {/* Events Table Rows with soft, subtle divider */}
                  <div className="divide-y divide-slate-800/60">
                    {items.map((event, eventIdx) => {
                      const isHighImpact = event.impact === 'high';
                      const isEconomy = event.type === 'economy';
                      const isHoliday = event.type === 'holiday';
                      const isCommodity = event.type === 'commodity';
                      const isLastEvent = eventIdx === items.length - 1;

                      return (
                        <div
                          key={event.id}
                          className="group relative flex items-start sm:items-center hover:bg-slate-900/50 rounded-r-lg transition-colors py-2.5 sm:py-3 pr-2 sm:pr-3"
                        >
                          {/* Dedicated Timeline Gutter Column - 100% Center-Aligned Guaranteed */}
                          <div className="relative self-stretch flex items-start sm:items-center justify-center w-8 shrink-0">
                            {/* Continuous Spine Line passing exactly through node center */}
                            <div
                              className={`absolute left-1/2 -translate-x-1/2 w-0.5 transition-colors duration-200 ${
                                isLastEvent
                                    ? 'top-0 bottom-1/2 bg-gradient-to-b from-slate-800 to-slate-800/30'
                                  : 'top-0 bottom-0 bg-slate-800/90 group-hover:bg-teal-500/50'
                              }`}
                            />

                            {/* Node Dot: Centered with Category Glow & Hover Pop */}
                            <div
                              className={`relative z-10 rounded-full border-2 border-slate-950 transition-transform duration-200 group-hover:scale-130 mt-1 sm:mt-0 ${
                                isHighImpact
                                  ? 'h-3.5 w-3.5 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] ring-2 ring-rose-400/50 ring-offset-1 ring-offset-slate-950 animate-pulse'
                                  : isEconomy
                                  ? 'h-3 w-3 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] ring-1.5 ring-sky-400/40 ring-offset-1 ring-offset-slate-950'
                                  : isHoliday
                                  ? 'h-3 w-3 bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)] ring-1.5 ring-indigo-400/40 ring-offset-1 ring-offset-slate-950'
                                  : 'h-3 w-3 bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.8)] ring-1.5 ring-orange-400/40 ring-offset-1 ring-offset-slate-950'
                              }`}
                              title={`${isHighImpact ? 'High-Impact ' : ''}${isEconomy ? 'Macro' : isHoliday ? 'Holiday' : 'Commodity'}`}
                            />
                          </div>

                          {/* Event Details Content Stream */}
                          <div className="flex-1 min-w-0 pl-2">
                            {/* ── Desktop Layout: Dedicated for Holidays vs Macro/Commodities ── */}
                            {isHoliday ? (
                              <div className="hidden lg:grid lg:grid-cols-12 gap-2 items-center text-xs">
                                {/* Col 1: Day & Window Countdown */}
                                <div className="col-span-2 flex items-center gap-1.5">
                                  <span className="font-mono text-xs sm:text-sm font-extrabold text-indigo-300 shrink-0">
                                    {dateInfo.weekday}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-300 bg-slate-900/90 border border-slate-700/80 px-1.5 py-0.5 rounded font-medium">
                                    {event.countdown}
                                  </span>
                                </div>

                                {/* Col 2: Holiday Occasion & Country */}
                                <div className="col-span-4 min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                    <CountryFlag iso={event.country} flag={event.flag} size={14} />
                                    <span className="font-semibold text-slate-300 text-[11px]">
                                      {event.countryName || event.country}
                                    </span>
                                    {event.category && (
                                      <span className="rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-indigo-950/70 text-indigo-300 border border-indigo-700/50">
                                        {event.category}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-indigo-300 transition-colors leading-tight line-clamp-1">
                                    {event.title}
                                  </h4>
                                </div>

                                {/* Col 3: Affected Exchanges Badges */}
                                <div className="col-span-3 flex items-center gap-1.5 flex-wrap">
                                  {(event.exchanges && event.exchanges.length > 0
                                    ? event.exchanges
                                    : [event.country === 'US' ? 'NYSE, NASDAQ' : 'NSE, BSE']
                                  ).map((ex) => {
                                    const cleanEx = ex.trim();
                                    const isNse = cleanEx === 'NSE';
                                    const isBse = cleanEx === 'BSE';
                                    const isMcx = cleanEx === 'MCX';
                                    const isNyse = cleanEx === 'NYSE';
                                    const isNasdaq = cleanEx === 'NASDAQ';
                                    return (
                                      <span
                                        key={cleanEx}
                                        className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-extrabold border shadow-xs ${
                                          isNse
                                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/50'
                                            : isBse
                                            ? 'bg-blue-950/70 text-blue-300 border-blue-600/50'
                                            : isMcx
                                            ? 'bg-cyan-950/70 text-cyan-300 border-cyan-600/50'
                                            : isNyse
                                            ? 'bg-indigo-950/70 text-indigo-300 border-indigo-600/50'
                                            : isNasdaq
                                            ? 'bg-purple-950/70 text-purple-300 border-purple-600/50'
                                            : 'bg-slate-850 text-slate-300 border-slate-700'
                                        }`}
                                      >
                                        {cleanEx}
                                      </span>
                                    );
                                  })}
                                </div>

                                {/* Col 4: Trading Session Status */}
                                <div className="col-span-2">
                                  {event.isFullDayClose ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/80 px-2.5 py-0.5 text-[11px] font-bold text-rose-300 shadow-xs">
                                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                                      <span>Full Day Closed</span>
                                    </span>
                                  ) : event.title.toLowerCase().includes('muhurat') ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/50 bg-violet-950/90 px-2.5 py-0.5 text-[11px] font-black text-violet-200 ring-1 ring-violet-400/30 shadow-[0_0_10px_rgba(139,92,246,0.3)] animate-pulse">
                                      <Flame size={11} className="text-violet-400 fill-violet-400" />
                                      <span>Muhurat (6:15 – 7:15 PM)</span>
                                    </span>
                                  ) : event.sessionStatus?.toLowerCase().includes('evening open') ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/80 px-2.5 py-0.5 text-[11px] font-bold text-cyan-200 shadow-xs">
                                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                                      <span>Morning Closed • Eve Open</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-950/80 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300 shadow-xs">
                                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                                      <span className="truncate max-w-[140px]">{event.sessionStatus || 'Modified Session'}</span>
                                    </span>
                                  )}
                                </div>

                                {/* Col 5: Calendar Export Action */}
                                <div className="col-span-1 flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleExportIcs(event)}
                                    className="inline-flex items-center gap-1 rounded border border-indigo-600/40 bg-indigo-950/60 px-2.5 py-1 text-[10px] font-bold text-indigo-200 hover:border-indigo-400 hover:bg-indigo-900/60 hover:text-white transition shadow-xs"
                                    title="Add to Google/Outlook Calendar (.ics)"
                                  >
                                    <Download size={10} className="text-indigo-400" />
                                    <span>+ iCal</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Standard Macro & Commodities Desktop Layout */
                              <div className="hidden lg:grid lg:grid-cols-12 gap-2 items-center text-xs">
                                {/* Time & Countdown */}
                                <div className="col-span-2 flex items-center gap-1.5">
                                  <span className="font-mono text-xs sm:text-sm font-bold text-teal-300 shrink-0">
                                    {event.time}
                                  </span>
                                  {isHighImpact && (
                                    <span
                                      className="inline-flex items-center text-[9px] font-bold text-rose-400 bg-rose-950/70 px-1 py-0.2 rounded border border-rose-500/40"
                                      title="High Impact Event"
                                    >
                                      <Zap size={9} className="fill-rose-400 text-rose-400" />
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[65px]">
                                    {event.countdown}
                                  </span>
                                </div>

                                {/* Event & Region */}
                                <div className="col-span-5 min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                    <CountryFlag iso={event.country} flag={event.flag} size={13} />
                                    <span className="font-semibold text-slate-300 text-[11px]">
                                      {event.countryName || event.country}
                                    </span>
                                    <span
                                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                        isEconomy
                                          ? 'bg-blue-950/70 text-blue-300 border border-blue-800/40'
                                          : 'bg-orange-950/70 text-orange-300 border border-orange-800/40'
                                      }`}
                                    >
                                      {isEconomy ? 'Macro' : 'Commodity'}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-white text-xs sm:text-sm group-hover:text-teal-300 transition-colors leading-tight line-clamp-1">
                                    {event.title}
                                  </span>
                                </div>

                                {/* Actual */}
                                <div className="col-span-1 text-center font-mono text-xs">
                                  {event.actual ? (
                                    <span className="font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
                                      {event.actual}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 text-[11px] italic">Pending</span>
                                  )}
                                </div>

                                {/* Forecast */}
                                <div className="col-span-1 text-center font-mono text-xs text-cyan-300 font-medium">
                                  {event.forecast || '—'}
                                </div>

                                {/* Previous */}
                                <div className="col-span-1 text-center font-mono text-xs text-slate-400">
                                  {event.previous || '—'}
                                </div>

                                {/* Actions & Authority */}
                                <div className="col-span-2 flex items-center justify-end gap-2 text-[11px]">
                                  {event.authority && (
                                    <span
                                      className="text-[10px] text-slate-500 truncate max-w-[85px]"
                                      title={`Source: ${event.authority}`}
                                    >
                                      {event.authority}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleExportIcs(event)}
                                    className="inline-flex items-center gap-1 rounded border border-slate-700/80 bg-slate-800/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 hover:border-teal-500/50 hover:text-white transition"
                                    title="Add to calendar (.ics)"
                                  >
                                    <Download size={10} className="text-teal-400" />
                                    <span>iCal</span>
                                  </button>
                                  <Link
                                    href={`/search?q=${encodeURIComponent(
                                      event.company || event.symbol || event.title.split(' ')[0]
                                    )}`}
                                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-teal-400 hover:text-teal-300 transition"
                                    title="Read coverage"
                                  >
                                    <span>News</span>
                                    <ArrowUpRight size={10} />
                                  </Link>
                                </div>
                              </div>
                            )}

                            {/* ── Mobile / Tablet Responsive Stream Row (< lg) ── */}
                            {isHoliday ? (
                              <div className="lg:hidden space-y-2 text-xs py-0.5">
                                {/* Row 1: Day of Week, Flag, Country, Occasion & Countdown */}
                                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono text-xs font-black text-indigo-300">
                                      {dateInfo.weekday}
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <CountryFlag iso={event.country} flag={event.flag} size={14} />
                                    <span className="text-slate-200 text-xs font-bold">
                                      {event.countryName || event.country}
                                    </span>
                                    {event.category && (
                                      <span className="rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-indigo-950/70 text-indigo-300 border border-indigo-700/50">
                                        {event.category}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-indigo-300/90 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded-full font-bold">
                                    {event.countdown}
                                  </span>
                                </div>

                                {/* Row 2: Prominent Occasion Title */}
                                <h4 className="font-bold text-white text-sm sm:text-base leading-snug">
                                  {event.title}
                                </h4>

                                {/* Row 3: Session Status & Branded Exchange Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                  {event.isFullDayClose ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/70 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                                      <span>Full Day Closed</span>
                                    </span>
                                  ) : event.title.toLowerCase().includes('muhurat') ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/50 bg-violet-950/80 px-2 py-0.5 text-[10px] font-extrabold text-violet-200">
                                      <Flame size={10} className="text-violet-400 fill-violet-400" />
                                      <span>Muhurat (6:15 – 7:15 PM)</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/70 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
                                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                                      <span className="truncate max-w-[180px]">{event.sessionStatus || 'Modified Session'}</span>
                                    </span>
                                  )}

                                  {/* Branded Exchange Badges on Mobile */}
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {(event.exchanges && event.exchanges.length > 0
                                      ? event.exchanges
                                      : [event.country === 'US' ? 'NYSE, NASDAQ' : 'NSE, BSE']
                                    ).map((ex) => {
                                      const cleanEx = ex.trim();
                                      const isNse = cleanEx === 'NSE';
                                      const isBse = cleanEx === 'BSE';
                                      const isMcx = cleanEx === 'MCX';
                                      const isNyse = cleanEx === 'NYSE';
                                      const isNasdaq = cleanEx === 'NASDAQ';
                                      return (
                                        <span
                                          key={cleanEx}
                                          className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-extrabold border shadow-xs ${
                                            isNse
                                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/50'
                                              : isBse
                                              ? 'bg-blue-950/70 text-blue-300 border-blue-600/50'
                                              : isMcx
                                              ? 'bg-cyan-950/70 text-cyan-300 border-cyan-600/50'
                                              : isNyse
                                              ? 'bg-indigo-950/70 text-indigo-300 border-indigo-600/50'
                                              : isNasdaq
                                              ? 'bg-purple-950/70 text-purple-300 border-purple-600/50'
                                              : 'bg-slate-850 text-slate-300 border-slate-700'
                                          }`}
                                        >
                                          {cleanEx}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Row 4: Authority & Calendar Export Action */}
                                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                                  <span className="text-slate-500 font-medium truncate max-w-[170px] sm:max-w-xs">
                                    {event.authority || 'Official Exchange Notice'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleExportIcs(event)}
                                    className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200 bg-indigo-950/40 hover:bg-indigo-950/80 border border-indigo-600/40 px-2 py-0.5 rounded text-[10px] font-bold transition shadow-xs touch-manipulation active:scale-95"
                                  >
                                    <Download size={10} className="text-indigo-400" />
                                    <span>+ Add to Calendar</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Standard Macro & Commodities Mobile Layout (< lg) */
                              <div className="lg:hidden space-y-2 text-xs">
                                {/* Row 1: Time, Flag, Country, High Impact Tag & Countdown */}
                                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono text-xs font-black text-teal-300">
                                      {event.time}
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <CountryFlag iso={event.country} flag={event.flag} size={14} />
                                    <span className="text-slate-200 text-xs font-semibold">
                                      {event.countryName || event.country}
                                    </span>
                                    {isHighImpact && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-rose-300 bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-500/40 shadow-xs">
                                        <Zap size={9} className="fill-rose-400 text-rose-400" />
                                        <span>HIGH</span>
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded">
                                    {event.countdown}
                                  </span>
                                </div>

                                {/* Row 2: Headline / Event Title */}
                                <p className="font-bold text-white text-xs sm:text-sm leading-snug">
                                  {event.title}
                                </p>

                                {/* Row 3: Professional 3-Column Metrics Mini-Grid */}
                                {isEconomy && (
                                  <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-900/70 border border-slate-800/90 text-[11px] font-mono">
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-sans font-semibold">
                                        Actual
                                      </span>
                                      <span className={`text-xs font-bold truncate ${event.actual ? 'text-emerald-400' : 'text-slate-500 font-medium'}`}>
                                        {event.actual || 'Pending'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-800/90 pl-2 min-w-0">
                                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-sans font-semibold">
                                        Forecast
                                      </span>
                                      <span className="text-xs font-bold text-cyan-300 truncate">
                                        {event.forecast || '—'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-800/90 pl-2 min-w-0">
                                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-sans font-semibold">
                                        Previous
                                      </span>
                                      <span className="text-xs font-medium text-slate-300 truncate">
                                        {event.previous || '—'}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {isCommodity && (
                                  <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-900/70 border border-slate-800/90 text-[11px] font-mono">
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-sans font-semibold">
                                        Actual / Level
                                      </span>
                                      <span className={`text-xs font-bold truncate ${event.actual ? 'text-emerald-400' : 'text-slate-500 font-medium'}`}>
                                        {event.actual || 'Pending'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-800/90 pl-2 min-w-0">
                                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-sans font-semibold">
                                        Forecast
                                      </span>
                                      <span className="text-xs font-bold text-orange-300 truncate">
                                        {event.forecast || '—'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-800/90 pl-2 min-w-0">
                                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-sans font-semibold">
                                        Prior
                                      </span>
                                      <span className="text-xs font-medium text-slate-300 truncate">
                                        {event.previous || '—'}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Row 4: Authority & Touch Actions */}
                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
                                  <span className="truncate max-w-[140px] sm:max-w-xs">{event.authority}</span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleExportIcs(event)}
                                      className="inline-flex items-center gap-1 rounded bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:text-white transition touch-manipulation active:scale-95"
                                    >
                                      <Download size={10} className="text-teal-400" />
                                      <span>iCal</span>
                                    </button>
                                    <Link
                                      href={`/news?q=${encodeURIComponent(
                                        event.company || event.symbol || event.authority || event.title.split(' ')[0]
                                      )}`}
                                      className="inline-flex items-center gap-0.5 rounded bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 text-[10px] font-bold text-teal-400 hover:text-teal-300 transition touch-manipulation active:scale-95"
                                    >
                                      <span>News</span>
                                      <ArrowUpRight size={10} />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
