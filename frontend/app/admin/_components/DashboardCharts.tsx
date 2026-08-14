'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Eye,
  Radio,
  Clock,
  ArrowRight,
  ExternalLink,
  Flame,
  Star,
  Zap,
  CheckCircle2,
  AlertCircle,
  Layers,
  Activity,
  Calendar,
  Sparkles,
  RefreshCw,
  Loader2,
  Globe2,
  MapPin,
  Trophy,
  Briefcase,
  PiggyBank,
  Landmark,
  LineChart,
  Bitcoin,
} from 'lucide-react';
import { CategoryGlyph, categoryLabel } from '@/lib/category-theme';

export interface DashboardChartsData {
  total: number;
  published: number;
  pending: number;
  draft: number;
  archived: number;
  rejected?: number;
  featured: number;
  breaking: number;
  totalViews: number;
  todayPosts: number;
  totalSources: number;
  activeSources: number;
  totalImported: number;
  categoryDistribution?: { category: string; count: number; views: number }[];
  publishingTrend?: { date: string; count: number; views: number }[];
  topSources?: { name: string; count: number; category?: string; isActive?: boolean }[];
  topArticles?: {
    id: number | string;
    title: string;
    slug: string;
    category: string;
    views: number;
    publishedAt?: string | null;
    isFeatured?: boolean | number;
    isBreaking?: boolean | number;
    is_featured?: boolean | number;
    is_breaking?: boolean | number;
  }[];
}

interface DashboardChartsProps {
  stats: DashboardChartsData;
  onNavigateToArticles: (status?: string) => void;
  onPreviewArticle?: (article: any) => void;
  onTriggerWorker?: (worker: 'ingest' | 'ranking' | 'metrics') => void;
  workerRunning?: string | null;
}

function fmtNum(n: number | undefined | null) {
  if (n === undefined || n === null) return '0';
  return Number(n).toLocaleString();
}

function fmtDateShort(dStr: string) {
  try {
    const d = new Date(dStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dStr;
  }
}

/** High-contrast, dark-theme badges with vibrant colored borders and clear text */
export function getDarkCategoryBadge(category: string): string {
  const norm = (category || '').toLowerCase().trim();
  if (norm.includes('break')) return 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs';
  if (norm.includes('world')) return 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs';
  if (norm.includes('india')) return 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs';
  if (norm.includes('sport')) return 'bg-lime-500/20 text-lime-300 border border-lime-500/40 shadow-xs';
  if (norm.includes('busin')) return 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs';
  if (norm.includes('bank') || norm.includes('econ')) return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs';
  if (norm.includes('polit')) return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs';
  if (norm.includes('market') || norm.includes('stock')) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs';
  if (norm.includes('crypt') || norm.includes('coin')) return 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-xs';
  return 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs';
}

export function DashboardCharts({
  stats,
  onNavigateToArticles,
  onPreviewArticle,
  onTriggerWorker,
  workerRunning,
}: DashboardChartsProps) {
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);
  const [trendMetric, setTrendMetric] = useState<'count' | 'views'>('count');

  const categoryDistribution = stats.categoryDistribution || [];
  const topSources = stats.topSources || [];
  const topArticles = stats.topArticles || [];

  // Generate continuous 14-day trend so bars are always evenly proportioned & sleek
  const trendDays = useMemo(() => {
    const rawMap = new Map<string, { count: number; views: number }>();
    (stats.publishingTrend || []).forEach((item) => {
      const key = item.date ? item.date.slice(0, 10) : '';
      if (key) {
        rawMap.set(key, item);
      }
    });

    const days: { date: string; count: number; views: number; label: string }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const entry = rawMap.get(iso) || { count: 0, views: 0 };
      days.push({
        date: iso,
        count: entry.count,
        views: entry.views,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    return days;
  }, [stats.publishingTrend]);

  // Max value for scaling
  const maxTrendValue = Math.max(
    1,
    ...trendDays.map((d) => (trendMetric === 'count' ? d.count : d.views))
  );

  const totalCatCount = categoryDistribution.reduce((sum, c) => sum + c.count, 0) || stats.published || 1;

  // Donut/funnel percentages
  const publishedPct = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0;
  const pendingPct = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;
  const draftPct = stats.total > 0 ? Math.round((stats.draft / stats.total) * 100) : 0;

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* ─── Hero KPI Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {/* Total Published */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-lg backdrop-blur-md transition hover:border-emerald-500/40 hover:shadow-emerald-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Published</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {fmtNum(stats.published)}
            </span>
            <span className="text-xs font-medium text-emerald-400">
              {publishedPct}% of feed
            </span>
          </div>
          <button
            onClick={() => onNavigateToArticles('published')}
            className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>View published stories</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Review Queue */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-[#0c1220]/90 p-5 shadow-lg backdrop-blur-md transition hover:border-amber-500/60 hover:shadow-amber-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">Review Queue</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
              <Clock size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-amber-300 sm:text-3xl">
              {fmtNum(stats.pending)}
            </span>
            <span className="text-xs font-semibold text-amber-400/80">Pending Action</span>
          </div>
          <button
            onClick={() => onNavigateToArticles('pending')}
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition"
          >
            <span>Review {stats.pending} pending stories</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* 24h Ingested */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-lg backdrop-blur-md transition hover:border-teal-500/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ingested Today</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {fmtNum(stats.todayPosts)}
            </span>
            <span className="text-xs font-medium text-teal-400">Past 24 hours</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Active RSS Feeds:</span>
            <strong className="text-slate-200">{stats.activeSources} / {stats.totalSources}</strong>
          </div>
        </div>

        {/* Total Reader Engagement */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-lg backdrop-blur-md transition hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reader Views</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Eye size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {fmtNum(stats.totalViews)}
            </span>
            <span className="text-xs font-medium text-purple-400">Across all desks</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Featured / Breaking:</span>
            <strong className="text-slate-200">{stats.featured} / {stats.breaking}</strong>
          </div>
        </div>
      </div>

      {/* ─── Row 1: Publishing Velocity Timeline & Status Funnel ───────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        {/* 14-Day Ingestion Velocity Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl backdrop-blur-md min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/30">
                <BarChart3 size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">Ingestion & Publishing Velocity</h3>
                <p className="text-[11px] text-slate-400">14-Day rolling throughput across RSS pipelines</p>
              </div>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setTrendMetric('count')}
                className={`rounded-md px-2.5 py-1 transition ${
                  trendMetric === 'count' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Articles Ingested
              </button>
              <button
                onClick={() => setTrendMetric('views')}
                className={`rounded-md px-2.5 py-1 transition ${
                  trendMetric === 'views' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Reader Views
              </button>
            </div>
          </div>

          {/* Interactive 14-Day Bar Chart */}
          <div className="mt-6 pt-2">
            <div className="space-y-4">
              {/* SVG Chart Area */}
              <div className="relative h-56 w-full">
                <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity="0.35" />
                    </linearGradient>
                    <linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity="1" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0.2, 0.4, 0.6, 0.8].map((pct, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={pct * 85}
                      x2="100"
                      y2={pct * 85}
                      stroke="#1e293b"
                      strokeDasharray="2 2"
                      strokeWidth="0.5"
                    />
                  ))}

                  {/* 14 Rolling Daily Bars */}
                  {trendDays.map((item, idx) => {
                    const totalBars = 14;
                    const val = trendMetric === 'count' ? item.count : item.views;
                    const barHeight = val > 0 ? Math.max(4, (val / maxTrendValue) * 78) : 2;
                    const barWidth = 4.2; // slender, elegant bar width
                    const xPos = idx * (100 / totalBars) + 1.5;
                    const yPos = 85 - barHeight;
                    const isHovered = hoveredTrendIdx === idx;

                    return (
                      <g key={item.date} className="cursor-pointer">
                        {/* Interactive Click/Hover Hitbox */}
                        <rect
                          x={idx * (100 / totalBars)}
                          y="0"
                          width={100 / totalBars}
                          height="95"
                          fill="transparent"
                          onMouseEnter={() => setHoveredTrendIdx(idx)}
                          onMouseLeave={() => setHoveredTrendIdx(null)}
                        />

                        {/* Visible Rounded Bar */}
                        <rect
                          x={xPos}
                          y={yPos}
                          width={barWidth}
                          height={barHeight}
                          rx="1.2"
                          fill={
                            val === 0
                              ? '#1e293b'
                              : isHovered
                                ? 'url(#barHoverGradient)'
                                : 'url(#barGradient)'
                          }
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip Overlay */}
                {hoveredTrendIdx !== null && trendDays[hoveredTrendIdx] && (
                  <div
                    className="pointer-events-none absolute -top-4 z-30 -translate-x-1/2 rounded-lg border border-teal-500/40 bg-slate-950/95 px-3 py-2 shadow-2xl backdrop-blur-md"
                    style={{
                      left: `${((hoveredTrendIdx + 0.5) / 14) * 100}%`,
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      {trendDays[hoveredTrendIdx].label}
                    </p>
                    <p className="text-sm font-black text-white mt-0.5">
                      {fmtNum(trendDays[hoveredTrendIdx].count)} Articles
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
                      {fmtNum(trendDays[hoveredTrendIdx].views)} Reader Views
                    </p>
                  </div>
                )}
              </div>

              {/* X-Axis Date Labels (Every 2 days for crisp readability) */}
              <div className="flex justify-between px-1 text-[10px] font-medium text-slate-500">
                {trendDays.map((d, i) =>
                  i % 2 === 0 || i === trendDays.length - 1 ? (
                    <span key={d.date} className={i === trendDays.length - 1 ? 'text-teal-400 font-bold' : ''}>
                      {i === trendDays.length - 1 ? 'Today' : d.label}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Pipeline Status Breakdown (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <PieChart size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">Editorial Workflow Funnel</h3>
                <p className="text-[11px] text-slate-400">Article lifecycle states</p>
              </div>
            </div>

            {/* Visual Status Progress Segments */}
            <div className="mt-5 space-y-4">
              {/* Published */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Published Live
                  </span>
                  <span className="text-white font-mono">{fmtNum(stats.published)} ({publishedPct}%)</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-900">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${publishedPct}%` }} />
                </div>
              </div>

              {/* Pending Review */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Review Queue
                  </span>
                  <span className="text-amber-300 font-mono">{fmtNum(stats.pending)} ({pendingPct}%)</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-900">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400" style={{ width: `${Math.max(stats.pending > 0 ? 5 : 0, pendingPct)}%` }} />
                </div>
              </div>

              {/* Drafts */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    Drafts & Scheduled
                  </span>
                  <span className="text-slate-300 font-mono">{fmtNum(stats.draft)}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-900">
                  <div className="h-full rounded-full bg-slate-600" style={{ width: `${Math.max(stats.draft > 0 ? 3 : 0, draftPct)}%` }} />
                </div>
              </div>

              {/* Archived / Rejected */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Archived / Rejected
                  </span>
                  <span className="text-slate-400 font-mono">{fmtNum(stats.archived + (stats.rejected || 0))}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-900">
                  <div className="h-full rounded-full bg-rose-600/70" style={{ width: `${stats.archived > 0 ? 2 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800/80 pt-4">
            <button
              onClick={() => onNavigateToArticles('pending')}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-950/40 hover:from-teal-500 hover:to-emerald-500 transition"
            >
              <span>Manage Review Queue ({stats.pending})</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Category Distribution & Top RSS Feeds ─────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        {/* Category Breakdown (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl backdrop-blur-md min-w-0">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Layers size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">Desk & Category Volume</h3>
                <p className="text-[11px] text-slate-400">Distribution of published stories by desk</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToArticles('all')}
              className="text-[11px] font-semibold text-teal-400 hover:underline"
            >
              View Articles
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {categoryDistribution.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No category distribution data.</p>
            ) : (
              categoryDistribution.map((cat) => {
                const pct = Math.round((cat.count / totalCatCount) * 100);
                return (
                  <div key={cat.category} className="group rounded-lg p-2 transition hover:bg-slate-900/60">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* High-Contrast Category Pill */}
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDarkCategoryBadge(cat.category)}`}>
                          <CategoryGlyph name={cat.category} className="h-3 w-3 shrink-0" />
                          <span>{categoryLabel(cat.category)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-slate-400 font-mono">{fmtNum(cat.views)} views</span>
                        <strong className="text-white font-mono text-xs">{fmtNum(cat.count)} ({pct}%)</strong>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top RSS Source Volume (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl backdrop-blur-md min-w-0">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <Radio size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">Top Ingestion Feeds</h3>
                <p className="text-[11px] text-slate-400">Highest volume active RSS publishers</p>
              </div>
            </div>
            <Link href="/admin/sources" className="text-[11px] font-semibold text-teal-400 hover:underline">
              Manage Feeds ({stats.totalSources})
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {topSources.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No source telemetry available.</p>
            ) : (
              topSources.map((source, idx) => {
                const maxSource = Math.max(1, topSources[0]?.count || 1);
                const barWidth = Math.round((source.count / maxSource) * 100);

                return (
                  <div key={source.name} className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-2.5 transition hover:border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white truncate max-w-[220px]">{source.name}</span>
                        {source.category && (
                          <span className="text-[10px] font-medium text-slate-300 px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                            {source.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Active" />
                        <span className="font-mono text-xs font-bold text-teal-300">
                          {fmtNum(source.count)} stories
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── Row 3: Top Read Stories Leaderboard & Worker Pipeline Actions ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        {/* Top Read Stories Leaderboard (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl backdrop-blur-md min-w-0">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Flame size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">Top Read Stories Leaderboard</h3>
                <p className="text-[11px] text-slate-400">Highest reader engagement and velocity</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToArticles('all')}
              className="text-[11px] font-semibold text-teal-400 hover:underline"
            >
              Full Article Table
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-800/60">
            {topArticles.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No top articles recorded.</p>
            ) : (
              topArticles.map((article, idx) => (
                <div
                  key={article.id}
                  className="flex items-start gap-3 py-3 transition hover:bg-slate-900/40 rounded-lg px-2 group"
                >
                  {/* Rank Number Pill */}
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-black ${
                    idx === 0
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : idx === 1
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    {/* High-Contrast Category & Status Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${getDarkCategoryBadge(article.category)}`}>
                        <CategoryGlyph name={article.category} className="h-2.5 w-2.5" />
                        <span>{categoryLabel(article.category)}</span>
                      </span>
                      {Boolean(article.isFeatured || article.is_featured) && (
                        <span className="rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.2 text-[9px] font-bold border border-amber-500/35 shadow-xs">
                          Featured
                        </span>
                      )}
                      {Boolean(article.isBreaking || article.is_breaking) && (
                        <span className="rounded bg-rose-500/20 text-rose-300 px-1.5 py-0.2 text-[9px] font-bold border border-rose-500/35 shadow-xs">
                          Breaking
                        </span>
                      )}
                    </div>

                    {/* Article Title */}
                    <a
                      href={`/news/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-100 line-clamp-1 group-hover:text-teal-300 transition"
                    >
                      {article.title}
                    </a>
                  </div>

                  {/* Views Count Pill */}
                  <div className="flex items-center gap-1 text-xs font-bold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded shrink-0 whitespace-nowrap pt-0.5">
                    <Eye size={12} className="text-teal-400" />
                    <span>{fmtNum(article.views)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live System Workers & Pipeline Controls (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/30">
                <Activity size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">Pipeline Workers & Health</h3>
                <p className="text-[11px] text-slate-400">Automated ingestion & ranking engines</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {/* Ingestion Worker */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-white">RSS Ingestion Worker</p>
                    <p className="text-[10px] text-slate-400">Cron active every 15 mins</p>
                  </div>
                </div>
                {onTriggerWorker && (
                  <button
                    onClick={() => onTriggerWorker('ingest')}
                    disabled={Boolean(workerRunning)}
                    className="flex items-center gap-1.5 rounded-md border border-teal-500/30 bg-teal-950/40 px-2.5 py-1 text-xs font-semibold text-teal-300 hover:bg-teal-900/50 transition disabled:opacity-50"
                  >
                    {workerRunning === 'ingest' ? (
                      <Loader2 size={12} className="animate-spin text-teal-400" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    <span>Run</span>
                  </button>
                )}
              </div>

              {/* Ranking Pass */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Ranking & Scoring Engine</p>
                    <p className="text-[10px] text-slate-400">Calculates velocity & trending</p>
                  </div>
                </div>
                {onTriggerWorker && (
                  <button
                    onClick={() => onTriggerWorker('ranking')}
                    disabled={Boolean(workerRunning)}
                    className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-950/40 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-900/50 transition disabled:opacity-50"
                  >
                    {workerRunning === 'ranking' ? (
                      <Loader2 size={12} className="animate-spin text-amber-400" />
                    ) : (
                      <Zap size={12} />
                    )}
                    <span>Score</span>
                  </button>
                )}
              </div>

              {/* Metrics Aggregation */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Telemetry & Metrics Worker</p>
                    <p className="text-[10px] text-slate-400">Hourly aggregation passes</p>
                  </div>
                </div>
                {onTriggerWorker && (
                  <button
                    onClick={() => onTriggerWorker('metrics')}
                    disabled={Boolean(workerRunning)}
                    className="flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-950/40 px-2.5 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-900/50 transition disabled:opacity-50"
                  >
                    {workerRunning === 'metrics' ? (
                      <Loader2 size={12} className="animate-spin text-sky-400" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    <span>Sync</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>MySQL Storage: 58 MB</span>
            <Link href="/admin/activity" className="text-teal-400 hover:underline flex items-center gap-1">
              <span>View System Logs</span>
              <ExternalLink size={10} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
