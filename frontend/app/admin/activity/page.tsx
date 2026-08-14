'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Loader2,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Database,
  Server,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Terminal,
  Clock,
  Menu,
} from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';

interface ActivityData {
  recentArticles: {
    id: number;
    title: string;
    slug: string;
    status: string;
    category: string;
    created_at: string;
    view_count: number;
    source_name?: string;
  }[];
  recentSources: {
    id: number;
    name: string;
    category: string;
    is_active: number;
    last_fetched_at?: string;
    last_success_at?: string;
    last_error?: string;
    articles_imported: number;
  }[];
  serverTime: string;
}

interface WorkerLog {
  id: number;
  worker: string;
  status: 'success' | 'error';
  time: string;
  result: Record<string, unknown>;
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function AdminActivityPage() {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Worker state
  const [runningWorker, setRunningWorker] = useState<string | null>(null);
  const [workerLogs, setWorkerLogs] = useState<WorkerLog[]>([]);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/activity');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  async function triggerWorker(name: string, endpoint: string) {
    setRunningWorker(name);
    try {
      const start = Date.now();
      const res = await fetch(`/api/admin/${endpoint}`, { method: 'POST' });
      const result = await res.json();
      const duration = Date.now() - start;

      setWorkerLogs((prev) => [
        {
          id: Date.now(),
          worker: name,
          status: res.ok && result.ok !== false ? 'success' : 'error',
          time: new Date().toLocaleTimeString(),
          result: { ...result, durationMs: duration },
        },
        ...prev.slice(0, 19),
      ]);

      await fetchActivity();
    } catch (e) {
      setWorkerLogs((prev) => [
        {
          id: Date.now(),
          worker: name,
          status: 'error',
          time: new Date().toLocaleTimeString(),
          result: { error: e instanceof Error ? e.message : 'Network error' },
        },
        ...prev.slice(0, 19),
      ]);
    } finally {
      setRunningWorker(null);
    }
  }

  return (
    <div className="flex h-full w-full flex-1 min-w-0 overflow-hidden bg-[#070b14] font-sans text-slate-100 antialiased">
      <AdminSidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <main className="flex flex-1 min-w-0 w-full flex-col overflow-y-auto bg-[#070b14]">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#090d16]/95 px-4 sm:px-6 py-4 backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Hamburger Toggle */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
                title="Open Navigation Menu"
              >
                <Menu size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">System & Workers Hub</h1>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                    Healthy
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Pipeline execution logs, scheduler diagnostics & worker console
                </p>
              </div>
            </div>

            <button
              onClick={fetchActivity}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-teal-500/40 hover:bg-slate-800 hover:text-white self-start sm:self-auto"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-teal-400' : ''} />
              Refresh Status
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6">
          {/* Engine Cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Ingestion Worker */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0c1220]/80 p-5 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Sparkles size={20} />
                </div>
                <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                  RSS Cron
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">RSS Ingestion Worker</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Fetches active RSS feeds, deduplicates url hashes, and stores pending/published stories.
                </p>
              </div>
              <button
                onClick={() => triggerWorker('RSS Ingestion', 'ingest')}
                disabled={Boolean(runningWorker)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-500 disabled:opacity-50"
              >
                {runningWorker === 'RSS Ingestion' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Execute Ingest
              </button>
            </div>

            {/* Ranking Pass */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0c1220]/80 p-5 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Zap size={20} />
                </div>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Algorithm
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Ranking Engine</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Calculates velocity score, freshness decay, and trending scores for feed sorting.
                </p>
              </div>
              <button
                onClick={() => triggerWorker('Ranking Engine', 'ranking')}
                disabled={Boolean(runningWorker)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-500 disabled:opacity-50"
              >
                {runningWorker === 'Ranking Engine' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} />
                )}
                Run Ranking Pass
              </button>
            </div>

            {/* Metrics Aggregation */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0c1220]/80 p-5 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <BarChart3 size={20} />
                </div>
                <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                  Metrics
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Metrics Aggregator</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Rolls up engagement events (views, likes, shares) into 1h, 24h, and 7d metric buckets.
                </p>
              </div>
              <button
                onClick={() => triggerWorker('Metrics Aggregator', 'metrics')}
                disabled={Boolean(runningWorker)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-purple-500 disabled:opacity-50"
              >
                {runningWorker === 'Metrics Aggregator' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <BarChart3 size={14} />
                )}
                Aggregate Metrics
              </button>
            </div>

            {/* Background Scheduler */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0c1220]/80 p-5 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Calendar size={20} />
                </div>
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                  Scheduler
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Background Scheduler</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Publishes scheduled articles and expires breaking news / featured stories.
                </p>
              </div>
              <button
                onClick={() => triggerWorker('Background Scheduler', 'scheduler')}
                disabled={Boolean(runningWorker)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {runningWorker === 'Background Scheduler' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Calendar size={14} />
                )}
                Run Scheduler
              </button>
            </div>
          </section>

          {/* Console Logs */}
          {workerLogs.length > 0 && (
            <section className="rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <Terminal size={16} />
                <span>Live Execution Console Logs</span>
              </div>
              <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto custom-scrollbar">
                {workerLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-950 p-3"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-200">{log.worker}</span>
                      <span>{log.time}</span>
                    </div>
                    <pre className="text-teal-300 whitespace-pre-wrap">
                      {JSON.stringify(log.result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent Ingested Articles Stream */}
          <section className="rounded-xl border border-slate-800/80 bg-[#0c1220]/90 shadow-xl backdrop-blur-md">
            <div className="border-b border-slate-800/80 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-teal-400" />
                <h2 className="text-sm font-bold text-white">Recent Ingestion Stream</h2>
              </div>
              <span className="text-xs text-slate-400">Latest 15 records</span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  <Loader2 size={24} className="animate-spin text-teal-500 mx-auto" />
                </div>
              ) : data?.recentArticles && data.recentArticles.length > 0 ? (
                data.recentArticles.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition text-xs"
                  >
                    <div className="space-y-1 max-w-xl">
                      <p className="font-medium text-slate-200">{item.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {item.source_name && (
                          <span className="text-teal-400 font-semibold">{item.source_name}</span>
                        )}
                        <span>•</span>
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </div>
                    <span className="text-slate-400 tabular-nums">{fmtDate(item.created_at)}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">No activity yet.</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
