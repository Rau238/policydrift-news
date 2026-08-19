'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Radio,
  Trophy,
  Activity,
  MapPin,
  Coins,
  Award,
  RefreshCw,
  Clock,
  Sparkles,
  Flame,
  ShieldAlert,
  TrendingUp,
  Zap,
  Target,
  Users,
  Timer,
} from 'lucide-react';
import type { DetailedLiveMatch } from '@/lib/cricket-types';
import { parseMatchTeams, getTeamMeta } from '@/lib/cricket-flags';
import { CricketTeamFlag } from '@/components/CricketTeamFlag';

function renderBallBadge(ball: string, index: number) {
  const b = ball.trim().toUpperCase();

  if (b === '|' || b === '/') {
    return (
      <span key={index} className="inline-flex items-center px-1 text-slate-300 font-light select-none">
        |
      </span>
    );
  }

  if (b === '...' || b === '..') {
    return (
      <span key={index} className="inline-flex items-center px-1 text-slate-400 font-mono text-[11px]">
        ...
      </span>
    );
  }

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';

  if (b === '6') {
    bgClass = 'bg-purple-100 text-purple-900 border-purple-300 font-black';
  } else if (b === '4') {
    bgClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black';
  } else if (b.includes('W') || b === 'OUT') {
    bgClass = 'bg-rose-600 text-white border-rose-600 font-black shadow-xs';
  } else if (b.includes('NB') || b.includes('WD') || b.includes('LB') || b.includes('B')) {
    bgClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
  } else if (b === '0' || b === '•') {
    bgClass = 'bg-slate-100 text-slate-400 border-slate-200';
  }

  return (
    <span
      key={index}
      className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border px-1.5 text-[11px] font-mono shadow-2xs ${bgClass}`}
    >
      {ball}
    </span>
  );
}

export default function CricketMatchDetailPage({
  params,
}: {
  params: { matchId: string };
}) {
  const rawParam = params.matchId;
  const matchId = rawParam ? (rawParam.match(/(\d+)$/)?.[1] || rawParam) : '';

  const [match, setMatch] = useState<DetailedLiveMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeInningsTab, setActiveInningsTab] = useState<number>(0);

  const fetchMatchDetails = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/cricket/match/${matchId}`);
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
        setError(json.error || `Fetching scorecard for Match #${matchId}...`);
      }
    } catch (err: any) {
      setError(err.message || 'Connecting to cricket service...');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatchDetails();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/cricket/stream/${matchId}`);
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

    // Passive fallback timer only if SSE drops
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
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans animate-pulse">
        {/* Top Breadcrumb Nav Skeleton */}
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
          {/* Match Hero Arena Skeleton */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-lg space-y-6">
            {/* Top Meta Strip Skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-14 bg-slate-200 rounded-full" />
                <div className="h-5 w-10 bg-slate-200 rounded-md" />
                <div className="h-4 w-48 bg-slate-200 rounded-md" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-32 bg-slate-200 rounded-md" />
                <div className="h-4 w-28 bg-slate-200 rounded-md" />
              </div>
            </div>

            {/* Teams Head-to-Head Arena Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-6 py-2">
              {/* Team 1 */}
              <div className="md:col-span-4 flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-slate-200 rounded-md" />
                  <div className="h-7 w-28 bg-slate-200 rounded-md" />
                </div>
              </div>

              {/* VS Center */}
              <div className="md:col-span-3 flex flex-col items-center justify-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div className="h-5 w-36 bg-slate-200 rounded-full" />
              </div>

              {/* Team 2 */}
              <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-4">
                <div className="space-y-2 text-right">
                  <div className="h-5 w-32 bg-slate-200 rounded-md ml-auto" />
                  <div className="h-7 w-28 bg-slate-200 rounded-md ml-auto" />
                </div>
                <div className="h-14 w-14 rounded-full bg-slate-200 shrink-0" />
              </div>
            </div>
          </div>

          {/* Telemetry Dashboard Skeleton (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-3">
                <div className="h-9 w-24 bg-slate-200 rounded-lg" />
                <div className="h-9 w-24 bg-slate-200 rounded-lg" />
                <div className="h-9 w-24 bg-slate-200 rounded-lg" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-36 bg-slate-200 rounded-md" />
                <div className="h-6 w-28 bg-slate-200 rounded-lg" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
                <div className="h-4 w-48 bg-slate-200 rounded-md" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-200 rounded-md" />
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((k) => (
                    <div key={k} className="h-6 w-6 rounded-md bg-slate-200" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* In-play Snapshot Table Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1, 2].map((k) => (
              <div key={k} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md">
                <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 flex justify-between">
                  <div className="h-4 w-32 bg-slate-200 rounded-md" />
                  <div className="h-3 w-16 bg-slate-200 rounded-md" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-6 w-full bg-slate-100 rounded-md" />
                  <div className="h-6 w-full bg-slate-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Full Scorecard Skeleton */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-lg space-y-4 p-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="h-6 w-36 bg-slate-200 rounded-md" />
              <div className="h-6 w-24 bg-slate-200 rounded-md" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((k) => (
                <div key={k} className="h-8 w-full bg-slate-50 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !match) {
    return (
      <div className="min-h-[60vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Scorecard Loading</h2>
          <p className="text-xs text-slate-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setLoading(true);
                fetchMatchDetails();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md shadow-emerald-900/10"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
            <Link
              href="/sports/cricket"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Match Center</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const isLive = match.state === 'LIVE';
  const hasFullScorecard = match.full_scorecard && match.full_scorecard.length > 0;
  const { team1, team2 } = parseMatchTeams(match.title);

  // Find scores matching team1 and team2
  const team1Score = match.innings?.find((inn) => inn.team_name.toLowerCase().includes(team1.name.toLowerCase()) || team1.name.toLowerCase().includes(inn.team_name.toLowerCase()));
  const team2Score = match.innings?.find((inn) => inn.team_name.toLowerCase().includes(team2.name.toLowerCase()) || team2.name.toLowerCase().includes(inn.team_name.toLowerCase()));

  // Split recent balls if formatted
  const recentBallsList = match.recent_overs
    ? match.recent_overs.split(/[\s,]+/).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      {/* Top Breadcrumb Nav - Standard 7xl Grid */}
      <div className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-emerald-600 transition">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link href="/sports/cricket" className="hover:text-emerald-600 transition">
              Cricket Match Center
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-emerald-700 font-semibold truncate max-w-[180px] sm:max-w-xs">
              {match.title}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
                <span>Live Feed</span>
              </span>
            )}
            <button
              onClick={fetchMatchDetails}
              disabled={isRefreshing}
              aria-label="Refresh scorecard"
              className="group flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-emerald-600' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
              <span className="hidden sm:inline text-[11px] font-medium">Sync</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px] py-6 sm:py-8 space-y-6">
        {/* MATCH HEADER HERO ARENA */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-lg">
          {/* Top Series & Match Meta Strip */}
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${
                  isLive
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isLive && <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />}
                {match.state}
              </span>

              {match.match_format && (
                <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-mono font-bold text-purple-700">
                  {match.match_format}
                </span>
              )}

              {match.series && (
                <span className="font-semibold text-slate-700 text-xs truncate max-w-md">
                  {match.series}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
              {match.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{match.venue}</span>
                </span>
              )}
              {match.toss && (
                <span className="flex items-center gap-1 border-l border-slate-200 pl-3">
                  <Coins className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="truncate max-w-[180px]">{match.toss}</span>
                </span>
              )}
            </div>
          </div>

          {/* Teams Arena: Team 1 vs Team 2 Head-to-Head */}
          <div className="relative grid grid-cols-1 md:grid-cols-11 items-center gap-6 py-2">
            {/* Team 1 Side */}
            <div className="md:col-span-4 flex items-center gap-4">
              <CricketTeamFlag team={team1} sizeClass="h-12 w-12 sm:h-14 sm:w-14 text-base shadow-sm ring-2 ring-slate-100" />
              <div className="space-y-1 min-w-0">
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {team1.name}
                </h2>
                <div className="font-mono text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                  {team1Score ? team1Score.score_str : match.innings?.[0]?.team_name.includes(team1.name) ? match.innings[0].score_str : 'Yet to Bat'}
                </div>
              </div>
            </div>

            {/* Center Status & VS Pill */}
            <div className="md:col-span-3 flex flex-col items-center justify-center text-center space-y-2 border-y md:border-y-0 md:border-x border-slate-100 py-3 md:py-0 md:px-4">
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 bg-slate-100 text-xs font-black text-slate-500">
                VS
              </div>
              <div className={`text-xs sm:text-sm font-extrabold px-3.5 py-1 rounded-full ${
                isLive
                  ? 'bg-rose-50 border border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}>
                {match.status_text}
              </div>
              {match.player_of_the_match && (
                <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-900 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <Award className="h-3 w-3 text-amber-600" />
                  <span className="truncate max-w-[140px]">POTM: {match.player_of_the_match}</span>
                </div>
              )}
            </div>

            {/* Team 2 Side */}
            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-4 text-left md:text-right">
              <div className="space-y-1 min-w-0 order-2 md:order-1">
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {team2.name}
                </h2>
                <div className="font-mono text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                  {team2Score ? team2Score.score_str : match.innings?.[1]?.team_name.includes(team2.name) ? match.innings[1].score_str : 'Yet to Bat'}
                </div>
              </div>
              <div className="order-1 md:order-2">
                <CricketTeamFlag team={team2} sizeClass="h-12 w-12 sm:h-14 sm:w-14 text-base shadow-sm ring-2 ring-slate-100" />
              </div>
            </div>
          </div>
        </div>

        {/* UNIFIED BALANCED TELEMETRY DASHBOARD */}
        {(match.crr != null || match.rrr != null || match.target != null || match.partnership || match.recent_overs || match.last_wicket) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Key Match Rates & Current Partnership */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                {match.crr != null && (
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200/70">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Current RR</span>
                      <span className="font-mono text-base font-black text-slate-900">{match.crr}</span>
                    </div>
                  </div>
                )}

                {match.rrr != null && (
                  <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700 border border-rose-200/70">
                      <Zap className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Req RR</span>
                      <span className="font-mono text-base font-black text-rose-600">{match.rrr}</span>
                    </div>
                  </div>
                )}

                {match.target != null && (
                  <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70">
                      <Target className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Target</span>
                      <span className="font-mono text-base font-black text-amber-800">{match.target}</span>
                    </div>
                  </div>
                )}
              </div>

              {match.partnership ? (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-500 uppercase text-[10.5px] tracking-wider">
                    <Users className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Current Partnership</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                    {match.partnership}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Card 2: Last Wicket & Recent Balls Timeline */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3">
              {match.last_wicket ? (
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200/70 mt-0.5">
                    <Flame className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-600">Last Wicket</span>
                    <p className="text-xs font-medium text-slate-800 truncate mt-0.5">{match.last_wicket}</p>
                  </div>
                </div>
              ) : null}

              {recentBallsList.length > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-500 uppercase text-[10.5px] tracking-wider shrink-0">
                    <Timer className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Recent Overs</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
                    {recentBallsList.map((ball, i) => renderBallBadge(ball, i))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* LIVE IN-PLAY SNAPSHOT (BATTERS & BOWLERS) */}
        {isLive && (match.current_batsmen.length > 0 || match.current_bowlers.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Active Batsmen */}
            {match.current_batsmen.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md">
                <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Active Batsmen</span>
                  </div>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">* on strike</span>
                </div>
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                    <tr>
                      <th className="p-3 pl-4">Batter</th>
                      <th className="p-3 text-right">R</th>
                      <th className="p-3 text-right">B</th>
                      <th className="p-3 text-right">4s</th>
                      <th className="p-3 text-right">6s</th>
                      <th className="p-3 text-right pr-4">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {match.current_batsmen.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="p-3 pl-4 font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{b.name}</span>
                          {b.is_striker && (
                            <span className="rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-mono px-1 py-0.5">
                              *
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-black text-amber-700 text-sm font-mono">{b.runs}</td>
                        <td className="p-3 text-right text-slate-500 font-mono">{b.balls}</td>
                        <td className="p-3 text-right font-mono text-emerald-700 font-semibold">{b.fours}</td>
                        <td className="p-3 text-right font-mono text-purple-700 font-semibold">{b.sixes}</td>
                        <td className="p-3 text-right pr-4 font-mono text-slate-600">{b.strike_rate.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Current Bowlers */}
            {match.current_bowlers.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md">
                <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-600" />
                  <span>Current Bowlers</span>
                </div>
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                    <tr>
                      <th className="p-3 pl-4">Bowler</th>
                      <th className="p-3 text-right">O</th>
                      <th className="p-3 text-right">M</th>
                      <th className="p-3 text-right">R</th>
                      <th className="p-3 text-right">W</th>
                      <th className="p-3 text-right pr-4">Econ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {match.current_bowlers.map((bw, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="p-3 pl-4 font-bold text-slate-900">{bw.name}</td>
                        <td className="p-3 text-right font-mono text-slate-600">{bw.overs.toFixed(1)}</td>
                        <td className="p-3 text-right text-slate-500 font-mono">{bw.maidens}</td>
                        <td className="p-3 text-right text-slate-600 font-mono">{bw.runs}</td>
                        <td className="p-3 text-right font-black text-rose-600 text-sm font-mono">{bw.wickets}</td>
                        <td className="p-3 text-right pr-4 font-mono text-slate-600">{bw.economy.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* FULL SCORECARD SECTION (ALL INNINGS) */}
        {hasFullScorecard ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-600" />
                <span>Full Scorecard</span>
              </h2>

              {/* Innings Tabs Switcher */}
              {match.full_scorecard!.length > 1 && (
                <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-200/80 p-1 border border-slate-300/60">
                  {match.full_scorecard!.map((inn, idx) => {
                    const innTeam = getTeamMeta(inn.team_name);
                    const isActive = activeInningsTab === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveInningsTab(idx)}
                        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                          isActive
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <CricketTeamFlag team={innTeam} sizeClass="h-4 w-4 text-[9px]" />
                        <span>{inn.team_name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {match.full_scorecard!.map((inn, idx) => {
              if (match.full_scorecard!.length > 1 && activeInningsTab !== idx) {
                return null;
              }

              const innTeam = getTeamMeta(inn.team_name);

              return (
                <div
                  key={inn.innings_id || idx}
                  className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-lg"
                >
                  {/* Innings Summary Bar */}
                  <div className="bg-slate-100/90 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CricketTeamFlag team={innTeam} sizeClass="h-6 w-6 text-xs" />
                      <span className="text-base font-extrabold text-slate-900">{inn.team_name} Innings</span>
                      {inn.run_rate != null && (
                        <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                          (RR: {inn.run_rate.toFixed(2)})
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-lg font-black text-emerald-700">
                      {inn.score_str}
                    </span>
                  </div>

                  {/* Batting Scorecard Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3.5 pl-5">Batter</th>
                          <th className="p-3.5">Dismissal</th>
                          <th className="p-3.5 text-right">Runs</th>
                          <th className="p-3.5 text-right">Balls</th>
                          <th className="p-3.5 text-right">4s</th>
                          <th className="p-3.5 text-right">6s</th>
                          <th className="p-3.5 text-right pr-5">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inn.batsmen.map((b, bIdx) => (
                          <tr key={bIdx} className="hover:bg-slate-50 transition">
                            <td className="p-3.5 pl-5 font-bold text-slate-900 whitespace-nowrap">{b.name}</td>
                            <td className="p-3.5 text-slate-500 text-xs">{b.out_desc}</td>
                            <td className="p-3.5 text-right font-black text-amber-700 text-sm font-mono">{b.runs}</td>
                            <td className="p-3.5 text-right text-slate-500 font-mono">{b.balls}</td>
                            <td className="p-3.5 text-right text-emerald-700 font-mono font-semibold">{b.fours}</td>
                            <td className="p-3.5 text-right text-purple-700 font-mono font-semibold">{b.sixes}</td>
                            <td className="p-3.5 text-right pr-5 font-mono text-slate-600">
                              {b.strike_rate.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Extras Info Bar */}
                  {inn.extras && (
                    <div className="bg-slate-50 px-5 py-2.5 border-t border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Extras</span>
                      <span className="font-mono text-slate-700">{inn.extras}</span>
                    </div>
                  )}

                  {/* Bowling Scorecard Table */}
                  {inn.bowlers.length > 0 && (
                    <div className="overflow-x-auto">
                      <div className="bg-slate-100/70 px-5 py-2 border-b border-slate-200 font-bold text-[11px] text-slate-600 uppercase tracking-wider">
                        Bowling Analysis
                      </div>
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="p-3.5 pl-5">Bowler</th>
                            <th className="p-3.5 text-right">O</th>
                            <th className="p-3.5 text-right">M</th>
                            <th className="p-3.5 text-right">R</th>
                            <th className="p-3.5 text-right">W</th>
                            <th className="p-3.5 text-right pr-5">Econ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {inn.bowlers.map((bw, bwIdx) => (
                            <tr key={bwIdx} className="hover:bg-slate-50 transition">
                              <td className="p-3.5 pl-5 font-bold text-slate-900 whitespace-nowrap">{bw.name}</td>
                              <td className="p-3.5 text-right font-mono text-slate-600">{bw.overs.toFixed(1)}</td>
                              <td className="p-3.5 text-right text-slate-500 font-mono">{bw.maidens}</td>
                              <td className="p-3.5 text-right text-slate-600 font-mono">{bw.runs}</td>
                              <td className="p-3.5 text-right font-black text-rose-600 text-sm font-mono">{bw.wickets}</td>
                              <td className="p-3.5 text-right pr-5 font-mono text-slate-600">
                                {bw.economy.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* LIVE COMMENTARY TIMELINE */}
        {match.recent_commentary && match.recent_commentary.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Live Commentary & Ball-by-Ball Feed</span>
            </h3>
            <div className="space-y-2.5">
              {match.recent_commentary.map((comm, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-xs text-slate-700 leading-relaxed font-sans flex items-start gap-3"
                >
                  <span className="rounded bg-white text-emerald-700 border border-slate-200 text-[10px] font-mono font-bold px-1.5 py-0.5 shrink-0 mt-0.5 shadow-2xs">
                    #{match.recent_commentary!.length - idx}
                  </span>
                  <p className="flex-1">{comm}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
