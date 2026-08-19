'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { LiveMatchesOverview, MatchSummary } from '@/lib/cricket-types';
import { parseMatchTeams, getMatchUrl } from '@/lib/cricket-flags';
import { CricketTeamFlag } from '@/components/CricketTeamFlag';

export function LiveCricketTicker() {
  const [overview, setOverview] = useState<LiveMatchesOverview | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLiveScores = useCallback(async () => {
    try {
      const res = await fetch('/api/cricket/overview');
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          setOverview(json.data);
        }
      }
    } catch {
      // Ignore network errors during polling
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveScores();

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
          // ignore heartbeat
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
        fetchLiveScores();
      }
    }, 60000);

    return () => {
      clearInterval(timer);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchLiveScores]);

  const matches: MatchSummary[] = [
    ...(overview?.live_matches || []),
    ...(overview?.recent_matches?.slice(0, 6) || []),
  ];

  useEffect(() => {
    if (matches.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % matches.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [matches.length, isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % matches.length);
  };

  // Loading state
  if (loading && !overview) {
    return (
      <aside
        aria-label="Live Sports Ticker"
        className="relative z-40 w-full border-b border-slate-800/60 bg-slate-950 py-1.5 text-xs text-slate-200 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          {/* Left badge */}
          <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-950 border border-emerald-800/60 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            Live
          </span>
          <span className="text-slate-500 text-[11px] animate-pulse">Connecting to live feed...</span>

          <div className="ml-auto flex items-center gap-1.5">
            <Link href="/sports/football" className="text-[11px] text-slate-400 hover:text-white transition">⚽ Football</Link>
            <span className="text-slate-700">|</span>
            <Link href="/sports/cricket" className="text-[11px] text-emerald-400 hover:text-emerald-300 transition">🏏 Cricket</Link>
          </div>
        </div>
      </aside>
    );
  }

  // No matches
  if (matches.length === 0) {
    return (
      <aside
        aria-label="Live Sports Ticker"
        className="relative z-40 w-full border-b border-slate-800/60 bg-slate-950 py-1.5 text-xs text-slate-200 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-slate-900 border border-slate-700/60 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-slate-500"></span>
            </span>
            Sports
          </span>
          <span className="text-slate-500 text-[11px]">No live matches right now</span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/sports/football" className="inline-flex items-center gap-1 rounded-md bg-slate-900 border border-slate-700/60 px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:text-white transition">⚽ Football</Link>
            <Link href="/sports/cricket" className="inline-flex items-center gap-1 rounded-md bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition">🏏 Cricket</Link>
          </div>
        </div>
      </aside>
    );
  }

  const currentMatch = matches[currentIndex % matches.length];
  const isLive = currentMatch.state === 'LIVE';
  const { team1, team2 } = parseMatchTeams(currentMatch.title);

  return (
    <aside
      aria-label="Live Sports Ticker"
      className="relative z-40 w-full border-b border-slate-800/60 bg-slate-950 py-1.5 text-xs text-slate-200 backdrop-blur-md select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px]">

        {/* LEFT: Live Sports badge */}
        <Link
          href="/sports/cricket"
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-950 border border-emerald-800/60 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-900/80 transition"
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span>Live</span>
          <span className="hidden sm:inline text-emerald-600/80">•</span>
          <span className="hidden sm:inline text-emerald-300/80">Cricket</span>
        </Link>

        {/* DIVIDER */}
        <span className="hidden sm:block shrink-0 h-3.5 w-px bg-slate-700/70" />

        {/* CENTER: Current match card — fills available space */}
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <Link
            key={currentMatch.match_id}
            href={getMatchUrl(currentMatch)}
            className="group flex max-w-full items-center gap-2 rounded-md border border-slate-800/70 bg-slate-900/60 px-3 py-0.5 text-slate-300 hover:border-emerald-700/50 hover:bg-slate-900 hover:text-white transition"
          >
            {/* Status pill */}
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${
                isLive
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
              }`}
            >
              {isLive ? 'LIVE' : 'FT'}
            </span>

            {/* Teams */}
            <div className="flex items-center gap-1.5 font-semibold text-white text-[12px] truncate">
              <CricketTeamFlag team={team1} sizeClass="h-3.5 w-3.5 text-[8px]" />
              <span className="truncate max-w-[80px] sm:max-w-none">{team1.name}</span>
              <span className="text-slate-600 text-[10px] font-normal">vs</span>
              <CricketTeamFlag team={team2} sizeClass="h-3.5 w-3.5 text-[8px]" />
              <span className="truncate max-w-[80px] sm:max-w-none">{team2.name}</span>
            </div>

            {/* Score badge */}
            {(currentMatch.team1_score || currentMatch.team2_score) && (
              <span className="hidden md:inline-block shrink-0 font-mono text-amber-300 font-bold text-[11px] bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800/60">
                {currentMatch.team1_score}{currentMatch.team2_score ? ` / ${currentMatch.team2_score}` : ''}
              </span>
            )}

            {/* Status commentary */}
            <span className="hidden lg:inline-block truncate text-slate-400 text-[11px] max-w-[180px]">
              · {currentMatch.status}
            </span>

            <span className="shrink-0 text-emerald-500 group-hover:translate-x-0.5 transition text-[10px] font-bold hidden sm:inline">
              View →
            </span>
          </Link>
        </div>

        {/* DIVIDER */}
        <span className="hidden sm:block shrink-0 h-3.5 w-px bg-slate-700/70" />

        {/* RIGHT: Nav controls + Sport links */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Match counter + prev/next */}
          {matches.length > 1 && (
            <div className="flex items-center gap-0.5 bg-slate-900/80 border border-slate-800/80 rounded-md p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Match"
                className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="px-1.5 font-mono text-[10px] text-slate-500 tabular-nums">
                {currentIndex + 1}/{matches.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Match"
                className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Sport switcher links */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/sports/football"
              className="inline-flex items-center gap-1 rounded-md bg-slate-900 border border-slate-700/60 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              ⚽ Football
            </Link>
            <Link
              href="/sports/cricket"
              className="inline-flex items-center gap-1 rounded-md bg-emerald-950/70 border border-emerald-800/50 px-2 py-1 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-900/70 hover:text-emerald-300 transition"
            >
              Cricket →
            </Link>
          </div>
        </div>

      </div>
    </aside>
  );
}
