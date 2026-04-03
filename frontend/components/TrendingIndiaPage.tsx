'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ExternalLink, MapPin, Sparkles, Terminal, TrendingUp } from 'lucide-react';
import type { GoogleTrendsBundle, GoogleTrendsTopic } from '@/lib/types';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';
import { resolvePostImageUrl } from '@/lib/story-image';
import { decodeHtmlEntities } from '@/lib/sanitize';

type TabId = '24h' | '7d' | '30d';

function trendTypePillClass(label: string | null) {
  if (label === 'Breakout') return 'bg-rose-50 text-rose-800 ring-1 ring-rose-200/80';
  if (label === 'Rising') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80';
  if (label === 'Daily') return 'bg-sky-50 text-sky-900 ring-1 ring-sky-200/80';
  if (label === 'Realtime') return 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80';
  if (label === 'Top') return 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200/80';
  if (label === 'Seed') return 'bg-violet-50 text-violet-900 ring-1 ring-violet-200/80';
  return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200/80';
}

function scoreAccent(label: string | null) {
  if (label === 'Breakout') return { text: 'text-rose-600', bar: 'from-rose-400 to-rose-500' };
  if (label === 'Rising') return { text: 'text-amber-600', bar: 'from-amber-400 to-orange-500' };
  if (label === 'Top') return { text: 'text-indigo-600', bar: 'from-indigo-400 to-violet-500' };
  return { text: 'text-teal-600', bar: 'from-teal-400 to-cyan-500' };
}

/** Indian-style grouping (e.g. 1,61,600). */
function formatScore(n: number | null): string {
  if (n == null) return '--';
  return Number(n).toLocaleString('en-IN');
}

function formatRank(rank: number): string {
  return String(rank).padStart(2, '0');
}

function pickInitialTab(d: GoogleTrendsBundle): TabId {
  if ((d.topics24h?.length ?? 0) > 0) return '24h';
  if ((d.topics7d?.length ?? 0) > 0) return '7d';
  return '30d';
}

function TrendCard({
  topic,
  rank,
  scoreWidthPct,
  showScoreBar,
}: {
  topic: GoogleTrendsTopic;
  rank: number;
  scoreWidthPct: number;
  showScoreBar: boolean;
}) {
  const matches = topic.matches ?? [];
  const matchN = matches.length;
  const accent = scoreAccent(topic.label);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white pl-3 pr-3.5 pb-3.5 pt-3.5 shadow-sm transition hover:border-teal-200/70 hover:shadow-md sm:pl-3.5 sm:pr-4 sm:pb-4 sm:pt-4">
      <div className="absolute inset-y-2.5 left-0 w-1 rounded-full bg-gradient-to-b from-teal-400 to-cyan-500 opacity-70 transition group-hover:opacity-100" aria-hidden />
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex gap-3">
          <div
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-50 ring-1 ring-teal-100/90"
            aria-label={`Rank ${rank}`}
          >
            <span className="text-[9px] font-bold uppercase leading-none tracking-wider text-teal-600/90">#</span>
            <span className="font-display text-lg font-black tabular-nums leading-none text-teal-800">{formatRank(rank)}</span>
          </div>
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <CategoryGlyph name={topic.category} className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {categoryLabel(topic.category)}
              </span>
              <span className="text-slate-300">·</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${trendTypePillClass(topic.label)}`}
              >
                {topic.label ?? '--'}
              </span>
              {topic.trafficNote ? (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="font-semibold tabular-nums tracking-tight text-slate-600">{topic.trafficNote}</span>
                </>
              ) : null}
            </div>

            <a
              href={topic.exploreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-1.5 text-[15px] font-bold leading-snug text-slate-900 transition hover:text-teal-700"
            >
              <span className="line-clamp-2 min-w-0">{topic.query}</span>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2.25} aria-hidden />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] items-center gap-2 rounded-lg bg-slate-50/90 px-3 py-2.5 ring-1 ring-slate-100 sm:gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Interest</p>
            <p className={`mt-0.5 font-display text-xl font-black tabular-nums tracking-tight sm:text-2xl ${accent.text}`}>
              {formatScore(topic.valueScore)}
            </p>
          </div>
          {showScoreBar ? (
            <div className="min-w-0 self-center pt-1 sm:pt-0">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200/90">
                <div className={`h-full rounded-full bg-gradient-to-r ${accent.bar}`} style={{ width: `${scoreWidthPct}%` }} />
              </div>
            </div>
          ) : (
            <p className="self-center text-xs text-slate-500">No score</p>
          )}
        </div>

        {matchN > 0 ? (
          <div className="mt-auto border-t border-slate-100 pt-3">
            <p className="mb-2 flex items-baseline justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Matched on site</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-sm font-black tabular-nums text-slate-800">{matchN}</span>
            </p>
            <ul className="flex flex-col gap-2">
              {matches.slice(0, 3).map((m) => {
                const matchThumb = decodeHtmlEntities(m.title).trim() || 'Matched story';
                return (
                <li key={m.id}>
                  <Link
                    href={`/news/${m.slug}`}
                    className="flex gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2 transition hover:border-teal-200/70 hover:bg-teal-50/50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvePostImageUrl(m.image_url)}
                      alt={matchThumb}
                      title={matchThumb}
                      className="h-10 w-14 shrink-0 rounded-md object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <span className="min-w-0 self-center text-xs font-medium leading-snug text-slate-800 line-clamp-2">{m.title}</span>
                  </Link>
                </li>
              );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

const TABS: { id: TabId; short: string; full: string }[] = [
  { id: '24h', short: '24h', full: 'Last 24 hours' },
  { id: '7d', short: '7d', full: 'Last 7 days' },
  { id: '30d', short: '30d', full: 'Last 30 days' },
];

export function TrendingIndiaPage({ data }: { data: GoogleTrendsBundle }) {
  const t24 = useMemo(() => data.topics24h ?? [], [data.topics24h]);
  const t7 = useMemo(() => data.topics7d ?? [], [data.topics7d]);
  const t30 = useMemo(
    () => (data.topics30d?.length ? data.topics30d : (data.topics ?? [])),
    [data.topics30d, data.topics],
  );

  const total = t24.length + t7.length + t30.length;
  const disabledEmpty = !data.enabled && total === 0;

  const [tab, setTab] = useState<TabId>(() => pickInitialTab(data));

  const topics = useMemo(() => {
    if (tab === '24h') return t24;
    if (tab === '7d') return t7;
    return t30;
  }, [tab, t24, t7, t30]);

  const maxScore = Math.max(1, ...topics.map((t) => t.valueScore ?? 0));
  const showScoreBar = topics.some((t) => t.valueScore != null);

  const countFor = (id: TabId) => (id === '24h' ? t24.length : id === '7d' ? t7.length : t30.length);

  return (
    <div className="min-h-screen w-full bg-[#f4f6f9] text-slate-900">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_360px_at_50%_-60px,rgba(13,148,136,0.06),transparent)]" aria-hidden />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-5 sm:px-6 sm:pb-16 sm:pt-6 lg:px-8">
        <nav className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
          <Link href="/" className="hover:text-teal-700">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-600">India trends</span>
        </nav>

        <header className="mt-5 grid gap-4 border-b border-slate-200/90 pb-6 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-8">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Google Trends
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl sm:leading-tight">
              What India is searching
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">Three ranges · Google scores · not sidebar trending.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-teal-600" aria-hidden />
              <span className="tabular-nums">{data.geo}</span>
            </span>
            {data.fetchedAt ? (
              <time
                className="text-xs tabular-nums text-slate-400"
                dateTime={data.fetchedAt}
              >
                {new Date(data.fetchedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
              </time>
            ) : null}
            <a
              href={`https://trends.google.com/trends/?geo=${encodeURIComponent(data.geo)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-teal-800 shadow-sm transition hover:bg-teal-50"
            >
              Explore
              <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
            </a>
          </div>
        </header>

        {disabledEmpty ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Sparkles className="mx-auto h-8 w-8 text-slate-300" strokeWidth={1.5} aria-hidden />
            <p className="mt-3 text-sm font-semibold text-slate-800">Trends off</p>
            <p className="mt-1 text-xs text-slate-500">Enable TRENDS_ENABLED on the API.</p>
          </div>
        ) : total === 0 ? (
          <div className="mt-8 rounded-xl border border-amber-200/80 bg-amber-50/40 p-6 shadow-sm">
            <p className="font-display text-base font-semibold text-amber-950">Nothing cached yet</p>
            <p className="mt-2 text-xs text-amber-950/80 sm:text-sm">{data.hint || 'Run npm run trends from the repo root.'}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[11px] text-slate-600">
              <Terminal className="h-3.5 w-3.5" aria-hidden />
              npm run trends
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {TABS.map(({ id, short, full }) => {
                const n = countFor(id);
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left shadow-sm transition sm:flex-col sm:items-stretch sm:px-4 sm:py-3.5 ${
                      active
                        ? 'border-teal-300 bg-white text-slate-900 ring-2 ring-teal-200/80'
                        : 'border-slate-200/90 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">{short}</span>
                      <span className="mt-0.5 block text-sm font-semibold text-slate-800">{full}</span>
                    </div>
                    <span
                      className={`flex h-10 min-w-[2.75rem] shrink-0 items-center justify-center rounded-lg text-lg font-black tabular-nums sm:h-11 sm:min-w-0 sm:w-full sm:text-xl ${
                        active ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-800'
                      }`}
                      aria-label={`${n} topics`}
                    >
                      {n.toLocaleString('en-IN')}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <p className="text-sm font-semibold text-slate-800">
                <span className="tabular-nums text-teal-700">{topics.length.toLocaleString('en-IN')}</span>
                <span className="text-slate-500"> topics</span>
              </p>
              <p className="text-xs tabular-nums text-slate-500">
                Total cached: <span className="font-semibold text-slate-700">{total.toLocaleString('en-IN')}</span>
              </p>
            </div>

            {topics.length === 0 ? (
              <p className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Empty for this window. Try another tab.</p>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                {topics.map((t, idx) => (
                  <TrendCard
                    key={`${tab}-${t.category}-${idx}-${t.query.slice(0, 36)}`}
                    topic={t}
                    rank={idx + 1}
                    scoreWidthPct={Math.round(((t.valueScore ?? 0) / maxScore) * 100)}
                    showScoreBar={showScoreBar}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {data.disclaimer ? (
          <p className="mx-auto mt-10 max-w-3xl text-center text-[10px] leading-relaxed text-slate-400">{data.disclaimer}</p>
        ) : null}
      </div>
    </div>
  );
}
