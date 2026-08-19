'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Shield,
  Clock,
  MapPin,
  Flame,
  Activity,
  UserCheck,
  ChevronLeft,
  RefreshCw,
  Zap,
  Globe2,
  Calendar,
} from 'lucide-react';
import type { DetailedFootballMatch } from '@/lib/football-types';
import { getFootballStatusBadge, getLeagueDisplayName } from '@/lib/football-helpers';
import { FootballTeamLogo } from '@/components/FootballTeamLogo';

function FootballMatchDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans animate-pulse">
      {/* Top Nav Skeleton */}
      <div className="border-b border-slate-200/90 bg-white/90 sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex items-center gap-2">
            <div className="h-3 w-10 bg-slate-200 rounded" />
            <div className="h-3 w-3 bg-slate-200 rounded" />
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-3 w-3 bg-slate-200 rounded" />
            <div className="h-3 w-40 bg-slate-200 rounded" />
          </div>
          <div className="h-6 w-16 bg-slate-200 rounded-lg" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px] py-6 sm:py-8 space-y-6">
        {/* Arena Hero Skeleton */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="h-5 w-40 bg-slate-200 rounded-md" />
            <div className="h-5 w-24 bg-slate-200 rounded-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-6 py-4">
            <div className="md:col-span-4 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-2">
                <div className="h-5 w-36 bg-slate-200 rounded" />
                <div className="h-8 w-12 bg-slate-200 rounded" />
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col items-center justify-center space-y-2">
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
              <div className="h-4 w-28 bg-slate-200 rounded" />
            </div>

            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-4">
              <div className="space-y-2 text-right">
                <div className="h-5 w-36 bg-slate-200 rounded ml-auto" />
                <div className="h-8 w-12 bg-slate-200 rounded ml-auto" />
              </div>
              <div className="h-16 w-16 rounded-full bg-slate-200 shrink-0" />
            </div>
          </div>
        </div>

        {/* Stats & Timeline 2-Col Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded mb-4" />
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="h-8 w-full bg-slate-100 rounded-lg" />
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded mb-4" />
            {[1, 2, 3].map((k) => (
              <div key={k} className="h-10 w-full bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FootballMatchDetailPage({
  params,
}: {
  params: { matchId: string };
}) {
  const matchId = params.matchId;

  const [match, setMatch] = useState<DetailedFootballMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'lineups'>('overview');

  const fetchMatchDetails = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/football/match/${matchId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          setMatch(json.data);
          setError(null);
        } else {
          setError(json.error || 'Match details loading...');
        }
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error || `Fetching match details for ${matchId}...`);
      }
    } catch (err: any) {
      setError(err.message || 'Connecting to sports service...');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatchDetails();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/football/stream/${matchId}`);
      eventSource.onmessage = (event) => {
        try {
          if (event.data && event.data.startsWith('{')) {
            const data = JSON.parse(event.data);
            if (data && data.match_id) {
              setMatch(data);
              setError(null);
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
        fetchMatchDetails();
      }
    }, 60000);

    return () => {
      clearInterval(timer);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchMatchDetails, matchId]);

  if (loading && !match) {
    return <FootballMatchDetailSkeleton />;
  }

  if (error && !match) {
    return (
      <div className="min-h-[60vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mb-4">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Match Data Loading</h2>
          <p className="text-xs text-slate-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setLoading(true);
                fetchMatchDetails();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Fetch
            </button>
            <Link
              href="/sports/football"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Back to Matches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const isLive = match.state === 'LIVE';
  const badge = getFootballStatusBadge(match.state, match.status_text, match.minute);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      {/* Top Breadcrumb Nav Bar */}
      <div className="border-b border-slate-200/90 bg-white/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 truncate">
            <Link href="/" className="hover:text-slate-900 transition">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/sports/football" className="text-emerald-700 hover:underline font-semibold">
              Football
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 truncate font-semibold">
              {match.home_team} vs {match.away_team}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchMatchDetails()}
              disabled={isRefreshing}
              title="Refresh match scorecard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <Link
              href="/sports/football"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              All Fixtures
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px] py-6 sm:py-8 space-y-6">
        {/* Match Hero Arena */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-lg relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Meta Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-900">{getLeagueDisplayName(match.league, match.match_url) || 'Football'}</span>
              {match.round && <span className="text-slate-400">• {match.round}</span>}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              {match.venue && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {match.venue}
                </span>
              )}
              {match.referee && <span>Ref: {match.referee}</span>}
            </div>
          </div>

          {/* Teams Arena Layout */}
          <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-6 py-2">
            {/* Home Team */}
            <div className="md:col-span-4 flex items-center gap-4">
              <FootballTeamLogo
                name={match.home_team}
                logoUrl={match.home_logo}
                sizeClass="h-16 w-16 sm:h-20 sm:w-20"
              />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{match.home_team}</h2>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Home</div>
              </div>
            </div>

            {/* Score & Match Status Center */}
            <div className="md:col-span-3 flex flex-col items-center justify-center space-y-2 text-center">
              <div className="flex items-center gap-3">
                <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900">
                  {match.home_score !== null && match.home_score !== undefined ? match.home_score : '-'}
                </span>
                <span className="text-slate-300 text-xl font-bold">:</span>
                <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900">
                  {match.away_score !== null && match.away_score !== undefined ? match.away_score : '-'}
                </span>
              </div>

              <span
                className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${badge.cls}`}
              >
                {badge.label}
              </span>

              {match.penalty_score && (
                <div className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  Penalties: {match.penalty_score}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-4">
              <div className="text-left md:text-right">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{match.away_team}</h2>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Away</div>
              </div>
              <FootballTeamLogo
                name={match.away_team}
                logoUrl={match.away_logo}
                sizeClass="h-16 w-16 sm:h-20 sm:w-20"
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher: Overview / Stats / Lineups */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Match Overview
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'stats'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Match Statistics
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Match Facts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="h-4 w-4 text-emerald-600" />
                Match Information
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Competition</span>
                  <span className="font-bold text-slate-800">{match.league || 'Football League'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Status</span>
                  <span className="font-bold text-slate-800">{match.status_text}</span>
                </div>

                {match.venue && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                    <span className="text-slate-400 block text-[11px]">Stadium / Venue</span>
                    <span className="font-bold text-slate-800">{match.venue}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Incidents / Match Events */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Zap className="h-4 w-4 text-amber-500" />
                Key Match Events
              </h3>

              {match.events && match.events.length > 0 ? (
                <div className="space-y-2.5">
                  {match.events.map((evt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {evt.minute}
                        </span>
                        <span className="font-bold text-slate-800">{evt.player_name}</span>
                        {evt.assist_name && <span className="text-slate-400">({evt.assist_name})</span>}
                      </div>

                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {evt.event_type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Detailed timeline events will appear during active match play.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Tab Content */}
        {activeTab === 'stats' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Head-to-Head Statistics
            </h3>

            <div className="space-y-4 max-w-xl mx-auto">
              {/* Possession */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>{match.stats?.possession_home ?? 50}%</span>
                  <span className="text-slate-400 font-normal">Ball Possession</span>
                  <span>{match.stats?.possession_away ?? 50}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${match.stats?.possession_home ?? 50}%` }}
                    className="bg-emerald-600 h-full"
                  />
                  <div
                    style={{ width: `${match.stats?.possession_away ?? 50}%` }}
                    className="bg-blue-600 h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
