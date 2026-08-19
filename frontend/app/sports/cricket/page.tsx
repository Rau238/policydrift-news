'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Radio,
  CheckCircle2,
  Calendar,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Clock3,
  ChevronRight,
} from 'lucide-react';
import type { LiveMatchesOverview, MatchSummary } from '@/lib/cricket-types';
import { parseMatchTeams, getMatchUrl } from '@/lib/cricket-flags';
import { CricketTeamFlag } from '@/components/CricketTeamFlag';

export default function CricketMatchCenterPage() {
  const [overview, setOverview] = useState<LiveMatchesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'recent' | 'upcoming'>('all');

  const fetchMatches = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/cricket/overview');
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          setOverview(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load cricket match center:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/cricket/stream');
      eventSource.onmessage = (event) => {
        try {
          if (event.data && event.data.startsWith('{')) {
            const data = JSON.parse(event.data);
            if (data && data.live_matches) {
              setOverview(data);
            }
          }
        } catch {
          // ignore
        }
      };
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // fallback
    }

    const interval = setInterval(() => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        fetchMatches();
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchMatches]);

  const liveList = overview?.live_matches || [];
  const recentList = overview?.recent_matches || [];
  const upcomingList = overview?.upcoming_matches || [];

  let displayedMatches: MatchSummary[] = [];
  if (activeTab === 'all') {
    displayedMatches = [...liveList, ...recentList, ...upcomingList];
  } else if (activeTab === 'live') {
    displayedMatches = liveList;
  } else if (activeTab === 'recent') {
    displayedMatches = recentList;
  } else {
    displayedMatches = upcomingList;
  }

  const getFormatBadge = (format?: string | null, title?: string) => {
    const text = (format || title || '').toUpperCase();
    if (text.includes('T20') || text.includes('IPL') || text.includes('LEAGUE') || text.includes('CPL')) {
      return { label: 'T20', cls: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
    if (text.includes('ODI')) {
      return { label: 'ODI', cls: 'bg-sky-50 text-sky-700 border-sky-200' };
    }
    if (text.includes('TEST')) {
      return { label: 'TEST', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    return { label: 'MATCH', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Top Breadcrumb Nav */}
      <div className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-emerald-600 transition">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link href="/news/sports" className="hover:text-emerald-600 transition">
              Sports
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <Link
                href="/sports/cricket"
                className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-white text-emerald-700 shadow-2xs border border-slate-200/60"
              >
                Cricket
              </Link>
              <Link
                href="/sports/football"
                className="px-2.5 py-0.5 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900 transition"
              >
                Football
              </Link>
            </div>
          </nav>

          {/* Live Pulse Indicator & Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              </span>
              <span>Live Feed</span>
            </div>

            <button
              onClick={fetchMatches}
              disabled={isRefreshing}
              aria-label="Refresh scores"
              className="group flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-emerald-600' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header Strip */}
      <section className="relative border-b border-slate-200 bg-white py-6 sm:py-8 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>Cricket Match Center</span>
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Live ball-by-ball scorecards, active tournaments, and upcoming global fixtures.
              </p>
            </div>

            {/* Quick Filter Segmented Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { key: 'all', label: 'All', count: liveList.length + recentList.length + upcomingList.length, Icon: Trophy, activeCls: 'bg-emerald-600 text-white shadow-sm' },
                  { key: 'live', label: 'Live', count: liveList.length, Icon: Radio, activeCls: 'bg-rose-600 text-white shadow-sm' },
                  { key: 'recent', label: 'Completed', count: recentList.length, Icon: CheckCircle2, activeCls: 'bg-emerald-600 text-white shadow-sm' },
                  { key: 'upcoming', label: 'Upcoming', count: upcomingList.length, Icon: Calendar, activeCls: 'bg-sky-600 text-white shadow-sm' },
                ] as const
              ).map((tab) => {
                const Icon = tab.Icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 active:scale-95 ${
                      isActive
                        ? tab.activeCls || 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-slate-100/70 text-slate-600 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    <span className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${isActive ? 'bg-black/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Matches Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px] py-6 sm:py-8">
        {loading && !overview ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs"
              >
                <div>
                  {/* Top Bar: Subtitle + Badge Skeleton */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="h-3 w-28 bg-slate-200 rounded-md" />
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-8 bg-slate-200 rounded-md" />
                      <div className="h-4 w-12 bg-slate-200 rounded-md" />
                    </div>
                  </div>

                  {/* Team Matchup Box Skeleton */}
                  <div className="space-y-2 rounded-xl bg-slate-50/90 p-2.5 border border-slate-100">
                    {/* Team 1 */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-slate-200 shrink-0" />
                        <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
                      </div>
                      <div className="h-4 w-16 bg-slate-200 rounded-md" />
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-slate-200 shrink-0" />
                        <div className="h-3.5 w-20 bg-slate-200 rounded-md" />
                      </div>
                      <div className="h-4 w-14 bg-slate-200 rounded-md" />
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Skeleton */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="h-3 w-36 bg-slate-200 rounded-md" />
                  <div className="h-3 w-16 bg-slate-200 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedMatches.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
            <Trophy className="mx-auto h-10 w-10 text-slate-400 mb-2" />
            <h2 className="text-base font-bold text-slate-900">No Matches Found</h2>
            <p className="mt-1 text-xs text-slate-500">There are no matches currently in this category.</p>
            <button
              onClick={() => setActiveTab('all')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-xs"
            >
              <span>View All Fixtures</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedMatches.map((match) => {
              const isLive = match.state === 'LIVE';
              const isCompleted = match.state === 'COMPLETED';
              const { team1, team2, seriesSuffix } = parseMatchTeams(match.title);
              const fmt = getFormatBadge(match.match_format, match.title);

              return (
                <Link
                  key={match.match_id}
                  href={getMatchUrl(match)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 hover:border-emerald-500/50 hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Top Bar: Match Subtitle / Series + Format + State */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="truncate text-[11px] font-medium text-slate-500">
                        {match.series || seriesSuffix || 'Cricket Match'}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider border ${fmt.cls}`}>
                          {fmt.label}
                        </span>

                        <span
                          className={`rounded px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                            isLive
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isCompleted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isLive ? '● LIVE' : match.state}
                        </span>
                      </div>
                    </div>

                    {/* Team Matchup Rows */}
                    <div className="space-y-2 rounded-xl bg-slate-50/90 p-2.5 border border-slate-100">
                      {/* Team 1 */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CricketTeamFlag team={team1} sizeClass="h-5 w-5 text-[10px]" />
                          <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition truncate">
                            {team1.name}
                          </span>
                        </div>
                        {match.team1_score ? (
                          <span className="font-mono text-xs font-black text-emerald-700 shrink-0">
                            {match.team1_score}
                          </span>
                        ) : null}
                      </div>

                      {/* Team 2 */}
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60">
                        <div className="flex items-center gap-2 min-w-0">
                          <CricketTeamFlag team={team2} sizeClass="h-5 w-5 text-[10px]" />
                          <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition truncate">
                            {team2.name}
                          </span>
                        </div>
                        {match.team2_score ? (
                          <span className="font-mono text-xs font-black text-emerald-700 shrink-0">
                            {match.team2_score}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer: Match Status & Action Button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isLive ? (
                        <Activity className="h-3 w-3 text-rose-600 shrink-0 animate-pulse" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock3 className="h-3 w-3 text-sky-600 shrink-0" />
                      )}
                      <span
                        className={`truncate font-medium ${
                          isLive ? 'text-rose-700 font-semibold' : isCompleted ? 'text-emerald-800 font-semibold' : 'text-slate-500'
                        }`}
                      >
                        {match.status}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 group-hover:text-emerald-700 shrink-0">
                      <span>Scorecard</span>
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
