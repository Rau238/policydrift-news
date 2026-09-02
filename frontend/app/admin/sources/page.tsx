'use client';

import { useEffect, useState, useCallback, FormEvent, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Radio,
  Loader2,
  RefreshCw,
  Plus,
  X,
  FlaskConical,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Sliders,
  ShieldCheck,
  Globe,
  Sparkles,
  Download,
  AlertTriangle,
  Menu,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { CategoryGlyph, categoryLabel } from '@/lib/category-theme';
import { getDarkCategoryBadge } from '../_components/DashboardCharts';
import { AdminConfirmModal, type ConfirmDialogState } from '@/components/AdminConfirmModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Source {
  id: number | string;
  name: string;
  source_type?: string;
  rss_url?: string;
  rssUrl?: string;
  url?: string;
  category: string;
  trust_score?: number;
  trustScore?: number;
  is_active?: number | boolean;
  enabled?: number | boolean;
  country?: string;
  language?: string;
  fetch_interval_minutes?: number;
  last_fetched_at?: string | null;
  lastFetched?: string | null;
  last_success_at?: string | null;
  lastSuccess?: string | null;
  articles_imported?: number;
  articlesImported?: number;
  last_error?: string | null;
  lastError?: string | null;
}

interface TestFeedResult {
  ok: boolean;
  message?: string;
  itemCount?: number;
  sample?: {
    title: string;
    link: string;
    pubDate?: string;
    hasImage?: boolean;
    imageUrl?: string | null;
    excerpt?: string | null;
  }[];
  error?: string;
}

const DESK_CATEGORIES = [
  'all',
  'Breaking',
  'World News',
  'India',
  'Politics',
  'Business',
  'Banking & Economics',
  'Stocks & Markets',
  'Sports',
  'Crypto',
  'General',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
  if (!iso) return 'Never';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Never';
  }
}

function TrustScoreBadge({ score }: { score: number }) {
  const s = Math.min(100, Math.max(0, score || 70));
  let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (s < 50) color = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  else if (s < 75) color = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tabular-nums ${color}`}>
        {s}
      </span>
      <div className="hidden sm:block h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${s >= 75 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
          style={{ width: `${s}%` }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSourcesPage() {
  const router = useRouter();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingCurated, setSyncingCurated] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Toast feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled' | 'error'>('all');

  // Modals & Actions
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [showLiveTesterModal, setShowLiveTesterModal] = useState(false);

  // Live Inspector Modal State
  const [testResult, setTestResult] = useState<{ sourceName: string; data: TestFeedResult } | null>(null);
  const [testingId, setTestingId] = useState<string | number | null>(null);
  const [fetchingId, setFetchingId] = useState<string | number | null>(null);
  const [rowAction, setRowAction] = useState<string | null>(null);

  // Add / Edit Form State
  const [form, setForm] = useState({
    name: '',
    rss_url: '',
    category: 'Politics',
    trust_score: 75,
    country: 'IN',
    language: 'en',
    fetch_interval_minutes: 15,
    enabled: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [urlTesting, setUrlTesting] = useState(false);
  const [urlTestSuccess, setUrlTestSuccess] = useState<string | null>(null);

  // Standalone Tester Modal State
  const [testerUrl, setTesterUrl] = useState('');
  const [testerCategory, setTesterCategory] = useState('Politics');
  const [testerLoading, setTesterLoading] = useState(false);
  const [testerResult, setTesterResult] = useState<TestFeedResult | null>(null);

  // Custom Admin Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4050);
  };

  // ─── Fetch Sources ──────────────────────────────────────────────────────────

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/sources?all=true');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to load sources (${res.status})`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.sources || data.data || [];
      setSources(list);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load sources.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const searchParams = useSearchParams();

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  // Auto-open modal if navigated with ?action=new
  useEffect(() => {
    const action = searchParams?.get('action');
    if (action === 'new') {
      setEditingSource(null);
      setUrlTestSuccess(null);
      setForm({
        name: '',
        rss_url: '',
        category: 'Politics',
        trust_score: 75,
        country: 'IN',
        language: 'en',
        fetch_interval_minutes: 15,
        enabled: true,
      });
      setShowAddModal(true);
    }
  }, [searchParams]);

  // ─── Sync All Curated Feeds ─────────────────────────────────────────────────

  async function handleSyncCuratedFeeds() {
    setSyncingCurated(true);
    try {
      const res = await fetch('/api/admin/sources/sync-curated', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast('success', data.message || `Synced ${data.total} curated feeds into database!`);
        await fetchSources();
      } else {
        showToast('error', data.error || 'Failed to sync curated feeds');
      }
    } catch {
      showToast('error', 'Network error syncing curated feeds');
    } finally {
      setSyncingCurated(false);
    }
  }

  // ─── Toggle Enable / Disable ────────────────────────────────────────────────

  async function handleToggleSource(source: Source) {
    const isCurrentlyActive = source.is_active === 1 || source.enabled === 1 || source.enabled === true || source.is_active === true;
    const nextState = !isCurrentlyActive;
    const key = `${source.id}:toggle`;
    setRowAction(key);

    try {
      const res = await fetch(`/api/admin/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState ? 1 : 0, enabled: nextState }),
      });
      const data = await res.json();
      if (res.ok && data.ok !== false) {
        showToast('success', `Source "${source.name}" ${nextState ? 'enabled' : 'disabled'}`);
        await fetchSources();
      } else {
        showToast('error', data.error || 'Failed to update source status');
      }
    } catch {
      showToast('error', 'Network error toggling source');
    } finally {
      setRowAction(null);
    }
  }

  // ─── Test Feed In-Place ─────────────────────────────────────────────────────

  async function handleTestSource(source: Source) {
    setTestingId(source.id);
    try {
      const res = await fetch(`/api/admin/sources/${source.id}/test`, { method: 'POST' });
      const data = (await res.json()) as TestFeedResult;
      if (res.ok && data.ok) {
        setTestResult({ sourceName: source.name, data });
      } else {
        showToast('error', data.error || data.message || 'Feed test failed');
      }
    } catch {
      showToast('error', 'Network error testing RSS feed');
    } finally {
      setTestingId(null);
    }
  }

  // ─── Test URL in Add/Edit Form ──────────────────────────────────────────────

  async function handleTestFormUrl() {
    if (!form.rss_url.trim()) return;
    setUrlTesting(true);
    setUrlTestSuccess(null);

    try {
      const res = await fetch('/api/admin/sources/test-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.rss_url.trim(), category: form.category }),
      });
      const data = (await res.json()) as TestFeedResult;
      if (res.ok && data.ok) {
        setUrlTestSuccess(`Verified: ${data.itemCount || 0} articles detected`);
        if (!form.name.trim() && data.sample?.[0]?.title) {
          // Auto-suggest name from URL domain
          try {
            const host = new URL(form.rss_url).hostname.replace(/^www\./, '');
            setForm((f) => ({ ...f, name: `${host} (${form.category})` }));
          } catch { }
        }
      } else {
        showToast('error', data.error || 'Feed test failed');
      }
    } catch {
      showToast('error', 'Network error verifying URL');
    } finally {
      setUrlTesting(false);
    }
  }

  // ─── Standalone Live Feed Tester ────────────────────────────────────────────

  async function handleRunLiveTester() {
    if (!testerUrl.trim()) return;
    setTesterLoading(true);
    setTesterResult(null);

    try {
      const res = await fetch('/api/admin/sources/test-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testerUrl.trim(), category: testerCategory }),
      });
      const data = (await res.json()) as TestFeedResult;
      if (res.ok && data.ok) {
        setTesterResult(data);
      } else {
        showToast('error', data.error || 'Feed test failed');
      }
    } catch {
      showToast('error', 'Network error running feed test');
    } finally {
      setTesterLoading(false);
    }
  }

  // ─── Trigger Targeted Fetch ─────────────────────────────────────────────────

  async function handleFetchSource(source: Source) {
    setFetchingId(source.id);
    try {
      const res = await fetch(`/api/admin/sources/${source.id}/fetch`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok !== false) {
        showToast('success', data.message || `Ingested feed for "${source.name}"`);
        await fetchSources();
      } else {
        showToast('error', data.error || 'Fetch failed');
      }
    } catch {
      showToast('error', 'Network error fetching feed');
    } finally {
      setFetchingId(null);
    }
  }

  // ─── Delete Source ──────────────────────────────────────────────────────────

  async function handleDeleteSource(source: Source) {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Feed Source',
      message: `Are you sure you want to permanently delete the feed source "${source.name}"? Ingestion will stop for this RSS endpoint.`,
      confirmText: 'Delete Source',
      cancelText: 'Cancel',
      intent: 'danger',
      onConfirm: async () => {
        setConfirmDialog((prev) => (prev ? { ...prev, isLoading: true } : null));
        const key = `${source.id}:delete`;
        setRowAction(key);

        try {
          const res = await fetch(`/api/admin/sources/${source.id}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok && data.ok !== false) {
            showToast('success', data.message || 'Source deleted');
            await fetchSources();
          } else {
            showToast('error', data.error || 'Failed to delete source');
          }
        } catch {
          showToast('error', 'Network error deleting source');
        } finally {
          setRowAction(null);
          setConfirmDialog(null);
        }
      },
    });
  }

  // ─── Add / Edit Submit ──────────────────────────────────────────────────────

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.rss_url.trim()) return;

    setFormLoading(true);
    try {
      const url = editingSource
        ? `/api/admin/sources/${editingSource.id}`
        : '/api/admin/sources';
      const method = editingSource ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.ok !== false) {
        showToast('success', data.message || (editingSource ? 'Source updated' : 'Source created'));
        setShowAddModal(false);
        setEditingSource(null);
        setUrlTestSuccess(null);
        setForm({
          name: '',
          rss_url: '',
          category: 'Politics',
          trust_score: 75,
          country: 'IN',
          language: 'en',
          fetch_interval_minutes: 15,
          enabled: true,
        });
        await fetchSources();
      } else {
        showToast('error', data.error || 'Failed to save source');
      }
    } catch {
      showToast('error', 'Network error saving source');
    } finally {
      setFormLoading(false);
    }
  }

  // ─── Open Edit Modal ────────────────────────────────────────────────────────

  function openEditModal(src: Source) {
    setEditingSource(src);
    const feedUrl = src.rss_url || src.rssUrl || src.url || '';
    const active = src.is_active === 1 || src.enabled === 1 || src.enabled === true || src.is_active === true;
    setForm({
      name: src.name || '',
      rss_url: feedUrl,
      category: src.category || 'Politics',
      trust_score: src.trust_score ?? src.trustScore ?? 75,
      country: src.country || 'IN',
      language: src.language || 'en',
      fetch_interval_minutes: src.fetch_interval_minutes || 5,
      enabled: active,
    });
    setUrlTestSuccess(null);
    setShowAddModal(true);
  }

  function copyToClipboard(text: string, id: string | number) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ─── Category Counts & Filters ──────────────────────────────────────────────

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sources.length };
    for (const s of sources) {
      const cat = s.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [sources]);

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const feedUrl = s.rss_url || s.rssUrl || s.url || '';
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feedUrl.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' ||
        (s.category || '').toLowerCase() === categoryFilter.toLowerCase();

      const isActive = s.is_active === 1 || s.enabled === 1 || s.enabled === true || s.is_active === true;
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = isActive;
      else if (statusFilter === 'disabled') matchesStatus = !isActive;
      else if (statusFilter === 'error') matchesStatus = Boolean(s.last_error || s.lastError);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [sources, searchQuery, categoryFilter, statusFilter]);

  const sourceMetrics = useMemo(() => {
    const total = sources.length;
    let active = 0;
    let errors = 0;
    let totalImported = 0;

    for (const s of sources) {
      const isActive = s.is_active === 1 || s.enabled === 1 || s.enabled === true || s.is_active === true;
      if (isActive) active++;
      if (s.last_error || s.lastError) errors++;
      totalImported += Number(s.articles_imported || s.articlesImported || 0);
    }

    return { total, active, errors, totalImported };
  }, [sources]);

  return (
    <div className="flex h-full w-full flex-1 min-w-0 overflow-hidden bg-[#070b14] font-sans text-slate-100 antialiased">
      <AdminSidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content */}
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
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">RSS Feed Sources</h1>
                  <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20">
                    {sources.length} Configured
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Curate publishers across desks (BBC, NYT, Guardian, Livemint), test live feeds & execute syncs
                </p>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 no-scrollbar sm:flex-wrap">
              {/* Sync Curated Feeds Button */}
              <button
                onClick={handleSyncCuratedFeeds}
                disabled={syncingCurated}
                title="Sync all verified curated feeds from RSS_FEEDS_BY_CATEGORY into database"
                className="flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-950/40 px-3 py-2 text-xs font-semibold text-teal-300 shadow-sm transition hover:bg-teal-900/60 hover:text-white disabled:opacity-50"
              >
                {syncingCurated ? (
                  <Loader2 size={13} className="animate-spin text-teal-400" />
                ) : (
                  <Sparkles size={13} className="text-teal-400" />
                )}
                Sync Curated Feeds (70+)
              </button>

              {/* Live Tester Modal Button */}
              <button
                onClick={() => {
                  setTesterUrl('');
                  setTesterResult(null);
                  setShowLiveTesterModal(true);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
              >
                <FlaskConical size={13} className="text-blue-400" />
                Live RSS Tester
              </button>

              <button
                onClick={fetchSources}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-teal-500/40 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin text-teal-400' : ''} />
                Refresh
              </button>

              <button
                onClick={() => {
                  setEditingSource(null);
                  setUrlTestSuccess(null);
                  setForm({
                    name: '',
                    rss_url: '',
                    category: categoryFilter !== 'all' ? categoryFilter : 'Politics',
                    trust_score: 75,
                    country: 'IN',
                    language: 'en',
                    fetch_interval_minutes: 15,
                    enabled: true,
                  });
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-teal-900/50 ring-1 ring-teal-400/40 transition hover:from-teal-400 hover:to-emerald-400 active:scale-95"
              >
                <Plus size={15} className="text-white stroke-[3]" />
                <span>Add RSS Source</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 space-y-6 p-4 sm:p-6 w-full min-w-0">
          {/* Floating Toast Notification */}
          {feedback && (
            <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
              <div
                className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 ${feedback.type === 'success'
                    ? 'border-emerald-500/40 bg-slate-900/95 text-emerald-300'
                    : 'border-rose-500/40 bg-slate-900/95 text-rose-300'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  {feedback.type === 'success' ? (
                    <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle size={17} className="text-rose-400 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
                <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Metric Cards */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 w-full">
            <div className="rounded-xl border border-slate-800/80 bg-[#0c1220]/80 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sources</p>
              <p className="mt-1 text-2xl font-black text-white tabular-nums">{sourceMetrics.total}</p>
              <p className="mt-1 text-xs text-slate-400">Monitored publishers</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[#0c1220]/80 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Feeds</p>
              <p className="mt-1 text-2xl font-black text-emerald-400 tabular-nums">{sourceMetrics.active}</p>
              <p className="mt-1 text-xs text-slate-400">Ingesting on cron</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[#0c1220]/80 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Imported</p>
              <p className="mt-1 text-2xl font-black text-teal-300 tabular-nums">
                {Number(sourceMetrics.totalImported).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">Articles processed</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[#0c1220]/80 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Errors</p>
              <p className={`mt-1 text-2xl font-black tabular-nums ${sourceMetrics.errors > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {sourceMetrics.errors}
              </p>
              <p className="mt-1 text-xs text-slate-400">Needs review</p>
            </div>
          </section>

          {/* Category Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {DESK_CATEGORIES.map((cat) => {
              const count = cat === 'all' ? sources.length : (categoryCounts[cat] || 0);
              const isActive = categoryFilter.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                >
                  {cat !== 'all' && <CategoryGlyph name={cat} className="h-3 w-3" />}
                  <span>{cat === 'all' ? 'All Feeds' : cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table Container */}
          <section className="rounded-xl border border-slate-800/80 bg-[#0c1220]/90 shadow-xl backdrop-blur-md w-full min-w-0">
            {/* Filter Toolbar */}
            <div className="border-b border-slate-800/80 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by source name (e.g. BBC News) or feed URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Status Dropdown & Add Button */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disabled' | 'error')}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-teal-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="disabled">Disabled Only</option>
                    <option value="error">With Errors</option>
                  </select>

                  <button
                    onClick={() => {
                      setEditingSource(null);
                      setUrlTestSuccess(null);
                      setForm({
                        name: '',
                        rss_url: '',
                        category: categoryFilter !== 'all' ? categoryFilter : 'Politics',
                        trust_score: 75,
                        country: 'IN',
                        language: 'en',
                        fetch_interval_minutes: 15,
                        enabled: true,
                      });
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-teal-500 transition"
                  >
                    <Plus size={13} />
                    <span>Add RSS Source</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto w-full">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 size={32} className="animate-spin text-teal-500" />
                  <p className="mt-3 text-xs font-medium">Loading sources...</p>
                </div>
              ) : fetchError ? (
                <div className="p-12 text-center text-sm text-red-400">
                  <AlertCircle size={28} className="mx-auto mb-2 text-red-400" />
                  <p>{fetchError}</p>
                </div>
              ) : filteredSources.length === 0 ? (
                <div className="p-16 text-center text-slate-400 space-y-3">
                  <Radio size={32} className="mx-auto text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-300">No sources found in this view</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Sync verified curated feeds or add a custom RSS URL to begin ingesting articles.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncCuratedFeeds}
                    disabled={syncingCurated}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-teal-500"
                  >
                    <Sparkles size={13} />
                    Sync Curated Feeds (70+)
                  </button>
                </div>
              ) : (
                <table className="w-full min-w-[950px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/60 font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3.5">Source & Feed URL</th>
                      <th className="px-4 py-3.5">Category Desk</th>
                      <th className="px-4 py-3.5">Trust Score</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Last Sync</th>
                      <th className="px-4 py-3.5">Imported</th>
                      <th className="px-4 py-3.5">Health</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredSources.map((src) => {
                      const feedUrl = src.rss_url || src.rssUrl || src.url || '';
                      const isActive = src.is_active === 1 || src.enabled === 1 || src.enabled === true || src.is_active === true;
                      const trustScore = src.trust_score ?? src.trustScore ?? 70;
                      const importedCount = src.articles_imported ?? src.articlesImported ?? 0;
                      const lastFetched = src.last_fetched_at ?? src.lastFetched;
                      const lastError = src.last_error ?? src.lastError;

                      const isToggling = rowAction === `${src.id}:toggle`;
                      const isTesting = testingId === src.id;
                      const isFetching = fetchingId === src.id;
                      const isDeleting = rowAction === `${src.id}:delete`;

                      return (
                        <tr key={src.id} className="group transition-colors hover:bg-slate-800/40">
                          {/* Name & URL */}
                          <td className="max-w-xs px-5 py-3.5">
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
                                {src.name}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="max-w-[220px] truncate font-mono text-[11px] text-slate-400"
                                  title={feedUrl}
                                >
                                  {feedUrl}
                                </span>
                                {feedUrl && (
                                  <button
                                    onClick={() => copyToClipboard(feedUrl, src.id)}
                                    title="Copy RSS URL"
                                    className="text-slate-400 hover:text-white"
                                  >
                                    {copiedId === src.id ? (
                                      <Check size={11} className="text-emerald-400" />
                                    ) : (
                                      <Copy size={11} />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDarkCategoryBadge(src.category)}`}>
                              <CategoryGlyph name={src.category} className="h-2.5 w-2.5 shrink-0" />
                              <span>{categoryLabel(src.category)}</span>
                            </span>
                          </td>

                          {/* Trust Score */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <TrustScoreBadge score={trustScore} />
                          </td>

                          {/* Active Toggle */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleSource(src)}
                              disabled={isToggling}
                              className="flex items-center gap-1.5 text-xs font-semibold transition disabled:opacity-50"
                            >
                              {isToggling ? (
                                <Loader2 size={18} className="animate-spin text-slate-400" />
                              ) : isActive ? (
                                <ToggleRight size={22} className="text-emerald-400" />
                              ) : (
                                <ToggleLeft size={22} className="text-slate-600" />
                              )}
                              <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                                {isActive ? 'Active' : 'Disabled'}
                              </span>
                            </button>
                          </td>

                          {/* Last Sync */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 tabular-nums">
                            {fmtDate(lastFetched)}
                          </td>

                          {/* Imported Count */}
                          <td className="px-4 py-3.5 whitespace-nowrap tabular-nums text-teal-300 font-bold font-mono">
                            {Number(importedCount).toLocaleString()}
                          </td>

                          {/* Error Status */}
                          <td className="max-w-[150px] px-4 py-3.5">
                            {lastError ? (
                              <span
                                className="inline-flex items-center gap-1 truncate text-xs text-rose-400"
                                title={lastError}
                              >
                                <AlertTriangle size={12} className="shrink-0" />
                                <span className="truncate">{lastError}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-400/80">
                                <CheckCircle2 size={12} />
                                Healthy
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Test */}
                              <button
                                onClick={() => handleTestSource(src)}
                                disabled={isTesting}
                                title="Test live RSS feed items"
                                className="flex items-center gap-1 rounded border border-blue-500/30 bg-blue-950/30 px-2 py-1 text-[11px] font-semibold text-blue-300 transition hover:bg-blue-900/50 disabled:opacity-50"
                              >
                                {isTesting ? (
                                  <Loader2 size={11} className="animate-spin" />
                                ) : (
                                  <FlaskConical size={11} />
                                )}
                                Test
                              </button>

                              {/* Fetch */}
                              <button
                                onClick={() => handleFetchSource(src)}
                                disabled={isFetching}
                                title="Ingest this feed now"
                                className="flex items-center gap-1 rounded border border-teal-500/30 bg-teal-950/30 px-2 py-1 text-[11px] font-semibold text-teal-300 transition hover:bg-teal-900/50 disabled:opacity-50"
                              >
                                {isFetching ? (
                                  <Loader2 size={11} className="animate-spin" />
                                ) : (
                                  <Download size={11} />
                                )}
                                Ingest
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => openEditModal(src)}
                                title="Edit source settings"
                                className="rounded p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteSource(src)}
                                disabled={isDeleting}
                                title="Delete source"
                                className="rounded p-1.5 text-slate-400 transition hover:bg-red-950/40 hover:text-red-400 disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Add / Edit Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative flex w-full max-w-lg flex-col rounded-2xl border border-slate-800 bg-[#0c1220] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Radio size={16} />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingSource ? `Edit Source: ${editingSource.name}` : 'Add New RSS Source'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSource(null);
                  setUrlTestSuccess(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Publisher / Source Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BBC News - Politics"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-teal-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    RSS Feed URL *
                  </label>
                  {urlTestSuccess && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 size={12} />
                      {urlTestSuccess}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://feeds.bbci.co.uk/news/politics/rss.xml"
                    value={form.rss_url}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, rss_url: e.target.value }));
                      setUrlTestSuccess(null);
                    }}
                    required
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-teal-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestFormUrl}
                    disabled={urlTesting || !form.rss_url.trim()}
                    className="flex items-center gap-1 rounded-lg border border-blue-500/40 bg-blue-950/40 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-900/50 transition disabled:opacity-40"
                  >
                    {urlTesting ? <Loader2 size={13} className="animate-spin" /> : <FlaskConical size={13} />}
                    <span>Test URL</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Category Desk
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none capitalize"
                  >
                    {DESK_CATEGORIES.filter((c) => c !== 'all').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Trust Score (0–100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.trust_score}
                    onChange={(e) => setForm((f) => ({ ...f, trust_score: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Region Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="IN / GLOBAL"
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Fetch Interval (Min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={form.fetch_interval_minutes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fetch_interval_minutes: Number(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSource(null);
                  }}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !form.name.trim() || !form.rss_url.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50"
                >
                  {formLoading && <Loader2 size={13} className="animate-spin" />}
                  {editingSource ? 'Save Changes' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Feed Test Inspector Modal */}
      {testResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-[#0c1220] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FlaskConical size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Live Feed Inspection</h2>
                  <p className="text-xs text-slate-400">{testResult.sourceName}</p>
                </div>
              </div>
              <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-300">Feed is Active & Valid</p>
                    <p className="text-xs text-emerald-400/80">
                      Successfully parsed {testResult.data.itemCount || 0} articles from RSS channel.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Sample Extracted Headlines:
                </p>
                <div className="space-y-2">
                  {testResult.data.sample?.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1.5"
                    >
                      <p className="font-semibold text-slate-100">{item.title}</p>
                      {item.excerpt && (
                        <p className="text-[11px] text-slate-400 line-clamp-2">{item.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:underline"
                          >
                            <span className="max-w-md truncate">{item.link}</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {item.pubDate && (
                          <span className="text-[10px] text-slate-500">{fmtDate(item.pubDate)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 bg-[#080c16] p-4 flex justify-end">
              <button
                onClick={() => setTestResult(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Live RSS Tester Modal */}
      {showLiveTesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-[#0c1220] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FlaskConical size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Live RSS Feed Tester</h2>
                  <p className="text-xs text-slate-400">Test and inspect any RSS feed URL before adding to DB</p>
                </div>
              </div>
              <button onClick={() => setShowLiveTesterModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    RSS Feed URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="e.g. https://feeds.bbci.co.uk/news/politics/rss.xml"
                      value={testerUrl}
                      onChange={(e) => setTesterUrl(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-teal-500 font-mono"
                    />
                    <select
                      value={testerCategory}
                      onChange={(e) => setTesterCategory(e.target.value)}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                    >
                      {DESK_CATEGORIES.filter((c) => c !== 'all').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleRunLiveTester}
                      disabled={testerLoading || !testerUrl.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition disabled:opacity-50"
                    >
                      {testerLoading ? <Loader2 size={13} className="animate-spin" /> : <FlaskConical size={13} />}
                      <span>Test Feed</span>
                    </button>
                  </div>
                </div>
              </div>

              {testerResult && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-300">Feed is Live & Valid</p>
                        <p className="text-xs text-emerald-400/80">
                          Parsed {testerResult.itemCount || 0} articles successfully.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowLiveTesterModal(false);
                        setEditingSource(null);
                        setForm({
                          name: `Feed (${testerCategory})`,
                          rss_url: testerUrl.trim(),
                          category: testerCategory,
                          trust_score: 75,
                          country: 'IN',
                          language: 'en',
                          fetch_interval_minutes: 15,
                          enabled: true,
                        });
                        setShowAddModal(true);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                    >
                      <span>Add as Source</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Parsed Headlines:
                    </p>
                    <div className="space-y-2">
                      {testerResult.sample?.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1.5"
                        >
                          <p className="font-semibold text-slate-100">{item.title}</p>
                          {item.excerpt && (
                            <p className="text-[11px] text-slate-400 line-clamp-2">{item.excerpt}</p>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:underline"
                              >
                                <span className="max-w-md truncate">{item.link}</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                            {item.pubDate && (
                              <span className="text-[10px] text-slate-500">{fmtDate(item.pubDate)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 bg-[#080c16] p-4 flex justify-end">
              <button
                onClick={() => setShowLiveTesterModal(false)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Theme Admin Confirmation Modal */}
      <AdminConfirmModal
        dialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />
    </div>
  );
}
