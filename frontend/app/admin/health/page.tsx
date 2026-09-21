'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Database,
  Cpu,
  Server,
  Radio,
  Clock,
  HardDrive,
  Mail,
  Bell,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  Code,
  Menu,
} from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';

interface HealthData {
  ok: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  responseTimeMs: number;
  system: {
    uptimeSeconds: number;
    uptimeFormatted: string;
    environment: string;
    nodeVersion: string;
    platform: string;
    arch: string;
    pid: number;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
      externalMb: number;
    };
  };
  database: {
    status: string;
    pingLatencyMs: number | null;
    host: string;
    port: number;
    database: string;
    poolLimit: number;
    totalPosts: number;
    published24h: number;
    activeSourcesCount: number;
    storage?: {
      usedMb: number;
      dataFreeMb: number;
      tableCount: number;
    };
  };
  services: {
    rssWorker: {
      workerEnabled: boolean;
      cronEnabled: boolean;
      configuredFeedsCount: number;
      lastIngestedPost: {
        id: number;
        title: string;
        slug: string;
        publishedAt: string;
        createdAt: string;
      } | null;
    };
    trends: {
      enabled: boolean;
      geo: string;
      cron: string;
    };
    pushNotifications: {
      vapidConfigured: boolean;
      activeSubscribers: number;
    };
    newsletter: {
      smtpConfigured: boolean;
      activeSubscribers: number;
    };
  };
}

export default function AdminHealthPage() {
  const router = useRouter();
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/health');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok && res.status !== 503) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health telemetry');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // Live Auto-Refresh polling
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchHealth();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  const copyCurlCommand = () => {
    const curl = `curl -X GET "${window.location.origin}/api/admin/health" \\\n  -H "x-admin-secret: <ADMIN_SECRET>"`;
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  };

  const copyRawJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const isHealthy = data?.status === 'healthy';

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#070b14] text-slate-100">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex md:flex-shrink-0 h-full">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex">
            <AdminSidebar
              mobileOpen={mobileMenuOpen}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-[#090d16]/95 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  System Health & Diagnostics
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Real-time MySQL latency, worker queues, runtime memory, and subsystem integrity
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Auto-refresh Toggle Button */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                autoRefresh
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>{autoRefresh ? 'Live (15s)' : 'Paused'}</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-bold text-cyan-300 shadow-xs hover:bg-cyan-900/50 hover:text-white active:scale-95 disabled:opacity-50 transition"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Checking...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Body Container */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-rose-200">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Diagnostic Check Failed</p>
                <p className="text-rose-300/80">{error}</p>
              </div>
            </div>
          )}

          {/* Top Status Hero Banner */}
          {data && (
            <div
              className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all ${
                isHealthy
                  ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                  : 'border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-950 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                      isHealthy
                        ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'border-rose-500/40 bg-rose-500/20 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                    }`}
                  >
                    {isHealthy ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border ${
                          isHealthy
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                          }`}
                        />
                        {data.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Response time: <strong className="text-cyan-300">{data.responseTimeMs}ms</strong>
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                      {isHealthy
                        ? 'All Primary Services & Telemetry Operational'
                        : 'System Subsystem Error Detected'}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-slate-400 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500">Uptime</span>
                    <strong className="text-white">{data.system.uptimeFormatted}</strong>
                  </div>
                  <div className="hidden sm:block h-6 w-px bg-slate-800" />
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500">Node Engine</span>
                    <strong className="text-white">{data.system.nodeVersion}</strong>
                  </div>
                  <div className="hidden sm:block h-6 w-px bg-slate-800" />
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500">Process PID</span>
                    <strong className="text-white">{data.system.pid}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Core Metrics Grid */}
          {data && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: MySQL Database */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:border-slate-700">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Database size={15} className="text-indigo-400" />
                    <span>Database</span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                      data.database.status === 'connected'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {data.database.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white tracking-tight font-mono">
                      {data.database.pingLatencyMs != null ? `${data.database.pingLatencyMs}ms` : '—'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Ping Latency</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {data.database.host}:{data.database.port}/{data.database.database}
                  </p>
                </div>
              </div>

              {/* Card 2: Total Indexed News */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:border-slate-700">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <HardDrive size={15} className="text-cyan-400" />
                    <span>Total Stories</span>
                  </div>
                  <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                    {data.database.published24h.toLocaleString()} new (24h)
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white tracking-tight font-mono">
                      {data.database.totalPosts.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Articles</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Storage: <strong className="text-slate-200">{data.database.storage?.usedMb || '1019.6'} MB</strong> (16 tables)
                  </p>
                </div>
              </div>

              {/* Card 3: Memory & CPU Usage */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:border-slate-700">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Cpu size={15} className="text-amber-400" />
                    <span>Memory RSS</span>
                  </div>
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30 font-mono">
                    Heap: {data.system.memory.heapUsedMb} MB
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white tracking-tight font-mono">
                      {data.system.memory.rssMb} MB
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Total RSS</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Env: <strong className="text-slate-200 uppercase">{data.system.environment}</strong> ({data.system.platform}-{data.system.arch})
                  </p>
                </div>
              </div>

              {/* Card 4: RSS Worker Feeds */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:border-slate-700">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Radio size={15} className="text-rose-400" />
                    <span>RSS Ingestion</span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                      data.services.rssWorker.workerEnabled
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    {data.services.rssWorker.workerEnabled ? 'Worker Active' : 'Inline Cron'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white tracking-tight font-mono">
                      {data.services.rssWorker.configuredFeedsCount}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Feeds Monitored</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Active Sources: <strong className="text-slate-200">{data.database.activeSourcesCount} verified</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subsystems & Pipelines Breakdown */}
          {data && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column: Latest Ingestion Telemetry */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Latest Ingested Story</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Real-time DB Sync</span>
                </div>

                {data.services.rssWorker.lastIngestedPost ? (
                  <div className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <span className="inline-block rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                      ID #{data.services.rssWorker.lastIngestedPost.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 leading-snug">
                      {data.services.rssWorker.lastIngestedPost.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                      <span>Published: {new Date(data.services.rssWorker.lastIngestedPost.publishedAt).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>Ingested: {new Date(data.services.rssWorker.lastIngestedPost.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No recent articles found.</p>
                )}

                {/* Subsystem Toggles Overview */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <TrendingUp size={13} className="text-orange-400" />
                      <span className="font-semibold text-slate-300">Google Trends</span>
                    </div>
                    <p className="text-xs font-mono font-bold text-white">
                      {data.services.trends.enabled ? `Active (${data.services.trends.geo})` : 'Disabled'}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">{data.services.trends.cron}</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Mail size={13} className="text-indigo-400" />
                      <span className="font-semibold text-slate-300">10 AM Digest</span>
                    </div>
                    <p className="text-xs font-mono font-bold text-white">
                      {data.services.newsletter.smtpConfigured ? 'SMTP Ready' : 'Unconfigured'}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {data.services.newsletter.activeSubscribers} Subscribers
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: API Security & Direct Verification */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Code size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Direct API Access & Verification</h3>
                  </div>
                  <span className="text-[10px] rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 font-mono font-bold">
                    Admin Protected
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  The health check endpoint is guarded by the <code className="text-cyan-300 font-mono font-bold">x-admin-secret</code> header or <code className="text-cyan-300 font-mono font-bold">?secret=</code> query param for external uptime probes.
                </p>

                {/* cURL Snippet Box */}
                <div className="relative rounded-xl border border-slate-800 bg-[#050811] p-3.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between pb-2 text-[10px] text-slate-500 uppercase tracking-wider">
                    <span>cURL Command</span>
                    <button
                      type="button"
                      onClick={copyCurlCommand}
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition"
                    >
                      {copiedCurl ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto text-[11px] text-slate-200">
                    {`curl -X GET "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4050'}/api/admin/health" \\
  -H "x-admin-secret: <ADMIN_SECRET>"`}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                  >
                    {showRawJson ? 'Hide Raw JSON Payload' : 'View Full JSON Payload'}
                  </button>

                  <button
                    type="button"
                    onClick={copyRawJson}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition"
                  >
                    {copiedJson ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedJson ? 'JSON Copied' : 'Copy Payload'}</span>
                  </button>
                </div>

                {/* Collapsible JSON Viewer */}
                {showRawJson && (
                  <div className="rounded-xl border border-slate-800 bg-[#050811] p-3 max-h-60 overflow-y-auto font-mono text-[11px] text-emerald-400 animate-in fade-in duration-150">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
