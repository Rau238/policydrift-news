'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, Clock3, ExternalLink, MapPin, Newspaper } from 'lucide-react';
import type { GoogleTrendsBundle, GoogleTrendsTopic } from '@/lib/types';
import { categoryLabel } from '@/lib/category-theme';
import { decodeHtmlEntities } from '@/lib/sanitize';
import { AnimatedTrendingIcon } from '@/components/AnimatedTrendingIcon';

type TabId = '24h' | '7d' | '30d';

function formatRank(rank: number): string {
  return String(rank).padStart(2, '0');
}

function pickInitialTab(d: GoogleTrendsBundle): TabId {
  if ((d.topics24h?.length ?? 0) > 0) return '24h';
  if ((d.topics7d?.length ?? 0) > 0) return '7d';
  return '30d';
}

function rankTone(rank: number) {
  if (rank === 1) return 'bg-amber-400/20 text-amber-100 ring-amber-400/45';
  if (rank === 2) return 'bg-white/10 text-slate-100 ring-white/25';
  if (rank === 3) return 'bg-orange-400/20 text-orange-100 ring-orange-400/40';
  return 'bg-white/5 text-slate-300 ring-white/12';
}

function TrendRow({ topic, rank }: { topic: GoogleTrendsTopic; rank: number }) {
  const matches = (topic.matches ?? []).slice(0, 2);
  const title = decodeHtmlEntities(topic.query).trim() || 'Topic';
  const desk = categoryLabel(topic.category);
  const meta = [desk, topic.label, topic.trafficNote].filter(Boolean);

  return (
    <article className="group rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 py-2.5 transition hover:border-amber-400/30 hover:bg-white/[0.06] sm:px-3.5 sm:py-3">
      <div className="flex gap-2.5 sm:gap-3">
        <span
          className={`mt-0.5 flex h-8 w-9 shrink-0 items-center justify-center rounded-md font-display text-[11px] font-black tabular-nums ring-1 sm:h-8 sm:w-10 sm:text-xs ${rankTone(rank)}`}
          aria-label={`Rank ${rank}`}
        >
          #{formatRank(rank)}
        </span>

        <div className="min-w-0 flex-1">
          <a
            href={topic.exploreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline font-display text-[0.95rem] font-semibold leading-snug text-white transition hover:text-amber-100 sm:text-[1.02rem]"
          >
            {title}
            <ExternalLink
              className="ml-1.5 inline h-3 w-3 align-[-1px] text-slate-500 group-hover:text-amber-300"
              aria-hidden
            />
          </a>

          {meta.length > 0 ? (
            <p className="mt-1 text-[11px] leading-none text-slate-400">
              {meta.map((part, i) => (
                <span key={`${part}-${i}`}>
                  {i > 0 ? <span className="mx-1.5 text-slate-600">·</span> : null}
                  <span className={i === 0 ? 'text-slate-300' : undefined}>{part}</span>
                </span>
              ))}
            </p>
          ) : null}

          {matches.length > 0 ? (
            <ul className="mt-2 space-y-1 border-t border-white/[0.06] pt-2">
              {matches.map((m) => {
                const matchTitle = decodeHtmlEntities(m.title).trim() || 'Matched story';
                return (
                  <li key={m.id}>
                    <Link
                      href={`/news/${m.slug}`}
                      className="flex gap-2 rounded-lg px-1 py-1 text-[12px] leading-snug text-slate-300 transition hover:bg-white/[0.04] hover:text-teal-100 sm:text-[13px]"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-400/70" aria-hidden />
                      <span className="min-w-0 flex-1">{matchTitle}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}

const TABS: { id: TabId; label: string; short: string }[] = [
  { id: '24h', label: 'Last 24 hours', short: '24h' },
  { id: '7d', label: 'Last 7 days', short: '7d' },
  { id: '30d', label: 'Last 30 days', short: '30d' },
];

export function TrendingIndiaPage({ data }: { data: GoogleTrendsBundle }) {
  const t24 = useMemo(() => data.topics24h ?? [], [data.topics24h]);
  const t7 = useMemo(() => data.topics7d ?? [], [data.topics7d]);
  const t30 = useMemo(
    () => (data.topics30d?.length ? data.topics30d : (data.topics ?? [])),
    [data.topics30d, data.topics],
  );

  const total = t24.length + t7.length + t30.length;
  const matchedStories = useMemo(() => {
    const all = [...t24, ...t7, ...t30];
    return all.reduce((n, t) => n + (t.matches?.length ?? 0), 0);
  }, [t24, t7, t30]);

  const disabledEmpty = !data.enabled && total === 0;
  const [tab, setTab] = useState<TabId>(() => pickInitialTab(data));

  const topics = useMemo(() => {
    if (tab === '24h') return t24;
    if (tab === '7d') return t7;
    return t30;
  }, [tab, t24, t7, t30]);

  const countFor = (id: TabId) => (id === '24h' ? t24.length : id === '7d' ? t7.length : t30.length);

  return (
    <div className="min-h-screen w-full bg-[var(--pd-hero-deep)] text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-br from-amber-950/50 via-transparent to-teal-950/30"
        aria-hidden
      />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-amber-950/80 via-slate-950 to-orange-950/40">
        <div className="pointer-events-none absolute -right-8 top-0 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-orange-500/15 blur-3xl max-md:opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex w-[40%] items-end justify-end opacity-[0.12] sm:inset-y-[-6%] sm:right-[-4%] sm:w-[min(48%,32rem)] sm:items-center sm:opacity-[0.28]"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/desk/india-outline.svg"
            alt=""
            draggable={false}
            className="h-[65%] w-full object-contain object-right brightness-0 invert sm:h-full"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/50 sm:from-slate-950/70 sm:via-slate-950/40 sm:to-transparent"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14 lg:pt-8 2xl:max-w-[1440px]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            Home
          </Link>

          <p className="mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/90">
            <AnimatedTrendingIcon className="h-4 w-4" />
            Trending India
          </p>
          <h1 className="mt-2 max-w-xl font-display text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl">
            What India is searching
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base sm:text-slate-300">
            Live topics for India, mapped to PolicyDrift desks — with matched stories when we have coverage.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={<AnimatedTrendingIcon className="h-4 w-4" />} label="Topics" value={total} />
            <StatCard icon={<Newspaper className="h-4 w-4" />} label="Matched" value={matchedStories} />
            <StatCard icon={<MapPin className="h-4 w-4" />} label="Geo" value={data.geo || 'IN'} isText />
            <StatCard
              icon={<Clock3 className="h-4 w-4" />}
              label="Updated"
              value={
                data.fetchedAt
                  ? new Date(data.fetchedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : '—'
              }
              isText
            />
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10 2xl:max-w-[1440px]">
        {disabledEmpty ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-white">Trends are off</p>
            <p className="mt-1 text-xs text-slate-400">Set TRENDS_ENABLED=true on the API and restart.</p>
          </div>
        ) : total === 0 ? (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/5 px-6 py-8">
            <p className="font-display text-base font-semibold text-amber-100">Nothing cached yet</p>
            <p className="mt-2 text-sm text-amber-100/70">{data.hint || 'Run npm run trends:prod from the repo root.'}</p>
          </div>
        ) : (
          <>
            <div className="flex w-full flex-wrap gap-2" role="tablist" aria-label="Trend window">
              {TABS.map(({ id, label, short }) => {
                const active = tab === id;
                const n = countFor(id);
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(id)}
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                      active
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-900/30'
                        : 'bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{short}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                        active ? 'bg-black/20 text-white' : 'bg-black/30 text-slate-400'
                      }`}
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex w-full flex-col gap-2">
              {topics.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/5 py-12 text-center text-sm text-slate-400">
                  No topics in this window. Try another tab.
                </p>
              ) : (
                topics.map((t, idx) => (
                  <TrendRow key={`${tab}-${t.category}-${idx}-${t.query.slice(0, 28)}`} topic={t} rank={idx + 1} />
                ))
              )}
            </div>
          </>
        )}

        {data.disclaimer ? (
          <p className="mx-auto mt-10 max-w-2xl text-center text-[10px] leading-relaxed text-slate-600">{data.disclaimer}</p>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  isText,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  isText?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-3.5 py-3 ring-1 ring-white/5 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200/80">
        <span className="opacity-90">{icon}</span>
        {label}
      </div>
      <p
        className={`mt-1.5 font-display font-bold tracking-tight text-white ${
          isText ? 'truncate text-sm sm:text-base' : 'text-2xl tabular-nums sm:text-3xl'
        }`}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
