'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Clock,
  Calendar,
  Activity,
  ChevronRight,
  Filter,
  RefreshCw,
  Zap,
  Globe2,
} from 'lucide-react';
import type { FootballOverview, FootballMatchSummary } from '@/lib/football-types';
import { getFootballMatchUrl, getFootballStatusBadge, getLeagueDisplayName } from '@/lib/football-helpers';
import { FootballTeamLogo } from '@/components/FootballTeamLogo';

function FootballMatchCenterSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between space-y-4"
        >
          {/* Top Bar Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-12 bg-slate-200 rounded" />
          </div>

          {/* Teams Arena Skeleton */}
          <div className="space-y-2.5 py-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-slate-200" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-7 bg-slate-200 rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-slate-200" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-7 bg-slate-200 rounded" />
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3.5 w-20 bg-slate-200 rounded" />
            <div className="h-3.5 w-16 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FootballMatchCenterPage() {
  const [overview, setOverview] = useState<FootballOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'recent' | 'upcoming'>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  const fetchMatches = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/football/overview');
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          setOverview(json.data);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/football/stream');
      eventSource.onmessage = (event) => {
        try {
          if (event.data && event.data.startsWith('{')) {
            const data = JSON.parse(event.data);
            if (data && data.live_matches) {
              setOverview(data);
              setLoading(false);
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

    const timer = setInterval(() => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        fetchMatches();
      }
    }, 60000);

    return () => {
      clearInterval(timer);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchMatches]);

  const allMatches: FootballMatchSummary[] = useMemo(() => {
    if (!overview) return [];
    const combined = [
      ...overview.live_matches,
      ...overview.recent_matches,
      ...overview.upcoming_matches,
    ];
    // Deduplicate by match_id
    const seen = new Set<string>();
    return combined.filter((m) => {
      if (seen.has(m.match_id)) return false;
      seen.add(m.match_id);
      return true;
    });
  }, [overview]);

  const displayedMatches = useMemo(() => {
    let list = allMatches;

    if (activeTab === 'live') {
      list = overview?.live_matches || [];
    } else if (activeTab === 'recent') {
      list = overview?.recent_matches || [];
    } else if (activeTab === 'upcoming') {
      list = overview?.upcoming_matches || [];
    }

    if (selectedLeague !== 'all') {
      list = list.filter((m) => m.league === selectedLeague);
    }

    return list;
  }, [allMatches, overview, activeTab, selectedLeague]);

  const liveCount = overview?.live_matches?.length || 0;
  const recentCount = overview?.recent_matches?.length || 0;
  const upcomingCount = overview?.upcoming_matches?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Top Breadcrumb & Sports Switcher Bar */}
      <div className="border-b border-slate-200/90 bg-white/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Sports Hub</span>
            <span className="text-slate-300">/</span>

            {/* Sport Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <Link
                href="/sports/cricket"
                className="px-2.5 py-1 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900 transition"
              >
                Cricket
              </Link>
              <Link
                href="/sports/football"
                className="px-2.5 py-1 text-xs font-bold rounded-md bg-white text-emerald-700 shadow-2xs border border-slate-200/60"
              >
                Football
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Tribuna Live Feed</span>
            </div>

            <button
              onClick={() => fetchMatches()}
              disabled={isRefreshing}
              title="Refresh match scores"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px] py-6 sm:py-8 space-y-6">
        {/* Header Hero Banner */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Globe2 className="h-4 w-4" />
                <span>Global Football Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Live Football Scores & Fixtures
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
                Real-time scores, goal incidents, and live match coverage from top European leagues and global tournaments.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 text-center min-w-[90px]">
                <div className="text-xl font-mono font-bold text-rose-600 flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4" />
                  {liveCount}
                </div>
                <div className="text-[11px] font-semibold text-rose-700/80 uppercase tracking-wider mt-0.5">Live</div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 text-center min-w-[90px]">
                <div className="text-xl font-mono font-bold text-slate-700 flex items-center justify-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {recentCount}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Finished</div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 text-center min-w-[90px]">
                <div className="text-xl font-mono font-bold text-blue-600 flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  {upcomingCount}
                </div>
                <div className="text-[11px] font-semibold text-blue-700/80 uppercase tracking-wider mt-0.5">Upcoming</div>
              </div>
            </div>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                All Fixtures ({allMatches.length})
              </button>

              <button
                onClick={() => setActiveTab('live')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'live'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60 hover:bg-rose-100/70'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Live Matches ({liveCount})
              </button>

              <button
                onClick={() => setActiveTab('recent')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'recent'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Results ({recentCount})
              </button>

              <button
                onClick={() => setActiveTab('upcoming')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'upcoming'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Scheduled ({upcomingCount})
              </button>
            </div>

            {/* League Dropdown Filter if multiple leagues */}
            {overview?.leagues && overview.leagues.length > 1 && (
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-emerald-500"
                >
                  <option value="all">All Competitions</option>
                  {overview.leagues.map((lg) => (
                    <option key={lg} value={lg}>
                      {lg}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Match Fixture Cards Grid */}
        {loading && !overview ? (
          <FootballMatchCenterSkeleton />
        ) : displayedMatches.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <Calendar className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Football Fixtures Found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no active matches for the selected filter. Check back soon for today's upcoming matches.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedLeague('all');
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              <span>View All Matches</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedMatches.map((match) => {
              const isLive = match.state === 'LIVE';
              const isCompleted = match.state === 'COMPLETED';
              const badge = getFootballStatusBadge(match.state, match.status_text, match.minute);

              return (
                <Link
                  key={match.match_id}
                  href={getFootballMatchUrl(match)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 hover:border-emerald-500/50 hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Top Bar: League + Status Pill */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="truncate text-[11px] font-medium text-slate-500">
                        {getLeagueDisplayName(match.league, match.match_url)}
                      </span>

                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Teams Head-to-Head */}
                    <div className="space-y-2.5 py-1">
                      {/* Home Team */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FootballTeamLogo
                            name={match.home_team}
                            logoUrl={match.home_logo}
                            sizeClass="h-6 w-6"
                          />
                          <span className="truncate font-semibold text-[13px] text-slate-900 group-hover:text-emerald-700 transition">
                            {match.home_team}
                          </span>
                        </div>

                        {match.home_score !== null && match.home_score !== undefined ? (
                          <span className="font-mono font-extrabold text-sm text-slate-900 shrink-0">
                            {match.home_score}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs font-mono">-</span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FootballTeamLogo
                            name={match.away_team}
                            logoUrl={match.away_logo}
                            sizeClass="h-6 w-6"
                          />
                          <span className="truncate font-semibold text-[13px] text-slate-900 group-hover:text-emerald-700 transition">
                            {match.away_team}
                          </span>
                        </div>

                        {match.away_score !== null && match.away_score !== undefined ? (
                          <span className="font-mono font-extrabold text-sm text-slate-900 shrink-0">
                            {match.away_score}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs font-mono">-</span>
                        )}
                      </div>
                    </div>

                    {/* Penalty indicator if present */}
                    {match.penalty_score && (
                      <div className="mt-2 text-[10.5px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
                        Penalties: {match.penalty_score}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Action Link */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
                    <span className="text-slate-400 font-medium truncate">
                      {isLive ? 'Match in progress' : isCompleted ? 'Full Time Result' : 'Pre-match preview'}
                    </span>

                    <span className="font-bold text-emerald-700 group-hover:translate-x-0.5 transition inline-flex items-center gap-0.5">
                      Match Center
                      <ChevronRight className="h-3 w-3" />
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
