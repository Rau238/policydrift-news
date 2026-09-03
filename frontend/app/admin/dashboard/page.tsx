'use client';

import { useEffect, useState, useCallback, useMemo, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Newspaper,
  CheckCircle2,
  Clock,
  Radio,
  Loader2,
  RefreshCw,
  Star,
  Zap,
  Eye,
  Search,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  X,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Archive,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpDown,
  Tag,
  CheckSquare,
  Square,
  MinusSquare,
  Trash2,
  Check,
  ChevronDown,
  Menu,
  Plus,
  Share2,
  Bell,
  Mail,
} from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { DashboardCharts } from '../_components/DashboardCharts';
import { AdminConfirmModal, type ConfirmDialogState } from '@/components/AdminConfirmModal';
import { SocialPublishModal } from '@/components/SocialPublishModal';
import { PushBroadcastModal } from '@/components/PushBroadcastModal';
import { NewsletterBroadcastModal } from '@/components/NewsletterBroadcastModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Article {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  key_takeaways?: string | null;
  image_url?: string | null;
  category: string;
  status: 'published' | 'draft' | 'pending' | 'archived' | 'rejected';
  published_at?: string | null;
  created_at?: string | null;
  view_count?: number;
  views?: number;
  is_featured?: number | boolean;
  is_breaking?: number | boolean;
  editorial_priority?: 'normal' | 'high' | 'pinned';
  source_id?: number | null;
  source_name?: string | null;
  original_url?: string | null;
  trending_score?: number;
  top_score?: number;
}

interface StatsData {
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

type ArticleAction = 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'breaking' | 'unbreaking';

const CATEGORIES = [
  'all',
  'politics',
  'india',
  'world',
  'business',
  'economy',
  'technology',
  'sports',
  'entertainment',
  'science',
  'health',
  'opinion',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function fmtNum(n: number | undefined | null) {
  if (n === undefined || n === null) return '0';
  return Number(n).toLocaleString();
}

function StatusBadge({ status }: { status: Article['status'] }) {
  const map: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    published: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      border: 'border-emerald-500/30',
    },
    pending: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      border: 'border-amber-500/30',
    },
    draft: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      dot: 'bg-slate-400',
      border: 'border-slate-500/30',
    },
    archived: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      dot: 'bg-rose-400',
      border: 'border-rose-500/30',
    },
    rejected: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      dot: 'bg-red-400',
      border: 'border-red-500/30',
    },
  };

  const style = map[status] || map.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize tracking-wide ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

function MetricCard({
  title,
  value,
  subtext,
  icon,
  accentColor,
  onClick,
  active,
}: {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  accentColor: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${active
          ? 'border-teal-500/60 bg-teal-950/20 shadow-lg shadow-teal-950/40 ring-1 ring-teal-500/30'
          : 'border-slate-800/80 bg-[#0c1220]/80 hover:border-slate-700/80 hover:bg-[#0f172a]/80'
        } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-white tabular-nums">{value}</p>
          {subtext && <p className="mt-0.5 text-xs text-slate-400">{subtext}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentColor} shadow-inner`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get('status');

  // State
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    published: 0,
    pending: 0,
    draft: 0,
    archived: 0,
    featured: 0,
    breaking: 0,
    totalViews: 0,
    todayPosts: 0,
    totalSources: 0,
    activeSources: 0,
    totalImported: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>(searchParams?.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('created_at_desc');

  // Multi-Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkExecuting, setBulkExecuting] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('politics');

  // Floating Toast Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [workerRunning, setWorkerRunning] = useState<string | null>(null);

  // Article Modal Preview
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  // Publish All Pending Review Articles state
  const [publishingAllPending, setPublishingAllPending] = useState(false);

  // Social Publishing Studio modal state
  const [socialModalArticle, setSocialModalArticle] = useState<Article | null>(null);

  // Push Notification Broadcast modal state
  const [pushModalArticle, setPushModalArticle] = useState<Article | null>(null);

  // Newsletter Broadcast modal state
  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);

  // Custom Admin Confirmation Modal state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync URL status param with state
  useEffect(() => {
    const urlStatus = searchParams?.get('status') || 'all';
    if (urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
      setPage(1);
      clearSelection();
    }
  }, [searchParams]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
    clearSelection();
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newStatus && newStatus !== 'all') {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    const query = params.toString();
    router.replace(`/admin/dashboard${query ? `?${query}` : ''}`, { scroll: false });
  };

  // Floating Toast Helper (never causes layout shift)
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4050);
  };

  // ─── Fetch Stats ─────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Background stat sync
    }
  }, []);

  // ─── Fetch Articles ──────────────────────────────────────────────────────────

  const fetchArticles = useCallback(
    async (isBackground = false) => {
      if (isBackground) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          sort: sortOption,
        });

        if (statusFilter && statusFilter !== 'all') {
          params.set('status', statusFilter);
        }
        if (categoryFilter && categoryFilter !== 'all') {
          params.set('category', categoryFilter);
        }
        if (debouncedSearch) {
          params.set('search', debouncedSearch);
        }

        const res = await fetch(`/api/admin/articles?${params.toString()}`);
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to load articles (${res.status})`);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.articles || data.posts || data.data || [];
        const count = typeof data.total === 'number' ? data.total : list.length;
        const pages = typeof data.totalPages === 'number' ? data.totalPages : Math.ceil(count / limit) || 1;

        setArticles(list);
        setTotal(count);
        setTotalPages(pages);
      } catch (err) {
        showFeedback('error', err instanceof Error ? err.message : 'Error fetching articles');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, sortOption, statusFilter, categoryFilter, debouncedSearch, router]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // ─── Selection Logic ────────────────────────────────────────────────────────

  const isAllSelected = useMemo(() => {
    if (!articles.length) return false;
    return articles.every((a) => selectedIds.includes(Number(a.id)));
  }, [articles, selectedIds]);

  const isPartiallySelected = useMemo(() => {
    if (!articles.length || isAllSelected) return false;
    return articles.some((a) => selectedIds.includes(Number(a.id)));
  }, [articles, selectedIds, isAllSelected]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect visible articles
      const visibleIds = new Set(articles.map((a) => Number(a.id)));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      // Select all visible articles
      const visibleIds = articles.map((a) => Number(a.id));
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // ─── Single Article Actions ─────────────────────────────────────────────────

  async function handleSingleAction(id: number | string, action: ArticleAction, params: Record<string, unknown> = {}) {
    const key = `${id}:${action}`;
    setActionLoading(key);

    // Optimistic Update
    setArticles((prev) =>
      prev.map((a) => {
        if (Number(a.id) !== Number(id)) return a;
        if (action === 'publish') return { ...a, status: 'published' };
        if (action === 'unpublish') return { ...a, status: 'draft' };
        if (action === 'feature') return { ...a, is_featured: 1 };
        if (action === 'unfeature') return { ...a, is_featured: 0 };
        if (action === 'breaking') return { ...a, is_breaking: 1 };
        if (action === 'unbreaking') return { ...a, is_breaking: 0 };
        return a;
      })
    );

    try {
      const res = await fetch(`/api/admin/articles/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (res.ok && data.ok !== false) {
        showFeedback('success', data.message || `Action "${action}" succeeded`);
        fetchStats();
        fetchArticles(true);
      } else {
        showFeedback('error', data.error || `Failed to perform action "${action}"`);
        fetchArticles(true);
      }
    } catch {
      showFeedback('error', `Network error performing "${action}"`);
      fetchArticles(true);
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePriorityChange(id: number | string, priority: 'normal' | 'high' | 'pinned') {
    const key = `${id}:priority`;
    setActionLoading(key);

    setArticles((prev) =>
      prev.map((a) => (Number(a.id) === Number(id) ? { ...a, editorial_priority: priority } : a))
    );

    try {
      const res = await fetch(`/api/admin/articles/${id}/priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      const data = await res.json();
      if (res.ok && data.ok !== false) {
        showFeedback('success', `Priority set to ${priority}`);
        fetchArticles(true);
      } else {
        showFeedback('error', data.error || 'Failed to update priority');
        fetchArticles(true);
      }
    } catch {
      showFeedback('error', 'Network error setting priority');
      fetchArticles(true);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteArticle(id: number | string) {
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Article',
      message: 'Are you sure you want to archive this article? It will be removed from the public live feed.',
      confirmText: 'Archive Article',
      cancelText: 'Cancel',
      intent: 'danger',
      onConfirm: async () => {
        setConfirmDialog((prev) => (prev ? { ...prev, isLoading: true } : null));
        const key = `${id}:delete`;
        setActionLoading(key);

        try {
          const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok && data.ok !== false) {
            showFeedback('success', data.message || 'Article archived');
            setArticles((prev) => prev.filter((a) => Number(a.id) !== Number(id)));
            setTotal((t) => Math.max(0, t - 1));
            fetchStats();
            fetchArticles(true);
            if (previewArticle?.id === id) setPreviewArticle(null);
          } else {
            showFeedback('error', data.error || 'Failed to archive article');
            fetchArticles(true);
          }
        } catch {
          showFeedback('error', 'Network error deleting article');
          fetchArticles(true);
        } finally {
          setActionLoading(null);
          setConfirmDialog(null);
        }
      },
    });
  }

  // ─── Bulk Operations ────────────────────────────────────────────────────────

  async function executeBulkAction(action: string, extraParams: Record<string, unknown> = {}) {
    if (!selectedIds.length) return;
    setBulkExecuting(true);

    try {
      const res = await fetch('/api/admin/articles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ids: selectedIds,
          ...extraParams,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok !== false) {
        showFeedback('success', data.message || `Bulk action completed on ${selectedIds.length} items`);
        clearSelection();
        fetchStats();
        fetchArticles(true);
      } else {
        showFeedback('error', data.error || 'Bulk action failed');
      }
    } catch {
      showFeedback('error', 'Network error executing bulk action');
    } finally {
      setBulkExecuting(false);
    }
  }

  // ─── Publish All Pending Review Articles ────────────────────────────────────

  async function handlePublishAllPending() {
    if (stats.pending <= 0) {
      showFeedback('error', 'No pending articles in the review queue to publish');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Publish All Review Articles',
      message: `Are you sure you want to publish all ${stats.pending.toLocaleString()} review articles to the live site immediately? This will push all pending RSS articles live to the public website.`,
      confirmText: `Publish ${stats.pending.toLocaleString()} Articles Live`,
      cancelText: 'Keep in Queue',
      intent: 'success',
      onConfirm: async () => {
        setConfirmDialog((prev) => (prev ? { ...prev, isLoading: true } : null));
        setPublishingAllPending(true);
        try {
          const res = await fetch('/api/admin/articles/publish-all-pending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await res.json();
          if (res.ok && data.ok !== false) {
            showFeedback(
              'success',
              data.message || `Published ${data.affected || 0} review articles live`
            );
            fetchStats();
            fetchArticles(true);
          } else {
            showFeedback('error', data.error || 'Failed to publish review articles');
          }
        } catch {
          showFeedback('error', 'Network error publishing review articles');
        } finally {
          setPublishingAllPending(false);
          setConfirmDialog(null);
        }
      },
    });
  }

  // ─── Worker Pipelines ───────────────────────────────────────────────────────

  async function handleTriggerWorker(worker: 'ingest' | 'ranking' | 'metrics' | 'scheduler') {
    setWorkerRunning(worker);
    try {
      const res = await fetch(`/api/admin/${worker}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok !== false) {
        showFeedback('success', data.message || `Pipeline trigger "${worker}" executed`);
        fetchStats();
        fetchArticles(true);
      } else {
        showFeedback('error', data.error || `Worker "${worker}" failed`);
      }
    } catch {
      showFeedback('error', `Failed to trigger worker "${worker}"`);
    } finally {
      setWorkerRunning(null);
    }
  }

  return (
    <div className="flex h-full w-full flex-1 min-w-0 overflow-hidden bg-[#070b14] font-sans text-slate-100 antialiased">
      <AdminSidebar
        pendingCount={stats.pending}
        onIngest={() => handleTriggerWorker('ingest')}
        ingestLoading={workerRunning === 'ingest'}
        onPublishAllReview={handlePublishAllPending}
        isPublishingReview={publishingAllPending}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Container */}
      <main className="flex flex-1 min-w-0 w-full flex-col overflow-y-auto bg-[#070b14]">
        {/* Header Bar */}
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
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Editorial Dashboard</h1>
                  <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20">
                    Live Operations
                  </span>
                  {refreshing && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 animate-pulse">
                      <RefreshCw size={11} className="animate-spin text-teal-400" />
                      Syncing...
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Curate published feeds, manage review queues, and execute pipeline workers
                </p>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1 overflow-x-auto max-w-full no-scrollbar shrink-0">
              <button
                onClick={() => router.push('/admin/dashboard', { scroll: false })}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${!statusParam
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <BarChart3 size={14} />
                <span>Executive Charts</span>
              </button>
              <button
                onClick={() => handleStatusChange('all')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${statusParam && statusParam !== 'pending'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Newspaper size={14} />
                <span>Articles Table</span>
              </button>
              <button
                onClick={() => handleStatusChange('pending')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${statusParam === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Clock size={14} />
                <span>Review Queue</span>
                {stats.pending > 0 && (
                  <span className="rounded-full bg-amber-400/30 px-1.5 py-0.2 text-[10px] font-bold text-amber-200">
                    {stats.pending}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Worker Triggers */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 no-scrollbar sm:flex-wrap">
              {stats.pending > 0 && (
                <button
                  onClick={handlePublishAllPending}
                  disabled={publishingAllPending}
                  title={`Publish all ${stats.pending} review articles immediately`}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50"
                >
                  {publishingAllPending ? (
                    <Loader2 size={13} className="animate-spin text-white" />
                  ) : (
                    <CheckCircle2 size={13} className="text-emerald-200" />
                  )}
                  <span>Publish All Review ({stats.pending})</span>
                </button>
              )}

              <button
                onClick={() => handleTriggerWorker('ingest')}
                disabled={Boolean(workerRunning)}
                title="Fetch all active RSS feeds immediately"
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-teal-500/40 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                {workerRunning === 'ingest' ? (
                  <Loader2 size={13} className="animate-spin text-teal-400" />
                ) : (
                  <Sparkles size={13} className="text-teal-400" />
                )}
                Ingest RSS
              </button>

              <button
                onClick={() => handleTriggerWorker('ranking')}
                disabled={Boolean(workerRunning)}
                title="Re-calculate velocity and trending scores"
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-amber-500/40 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                {workerRunning === 'ranking' ? (
                  <Loader2 size={13} className="animate-spin text-amber-400" />
                ) : (
                  <Flame size={13} className="text-amber-400" />
                )}
                Run Ranking
              </button>

              <button
                onClick={() => handleTriggerWorker('metrics')}
                disabled={Boolean(workerRunning)}
                title="Roll up engagement metrics"
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                {workerRunning === 'metrics' ? (
                  <Loader2 size={13} className="animate-spin text-purple-400" />
                ) : (
                  <BarChart3 size={13} className="text-purple-400" />
                )}
                Metrics
              </button>

              <button
                onClick={() => {
                  fetchStats();
                  fetchArticles(true);
                }}
                title="Refresh dashboard data"
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-teal-500/40 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw size={13} className={loading || refreshing ? 'animate-spin text-teal-400' : ''} />
                Refresh
              </button>

              <button
                onClick={() => setNewsletterModalOpen(true)}
                title="Broadcast Email Newsletter Digest to Subscribers"
                className="flex items-center gap-1.5 rounded-lg border border-teal-500/40 bg-teal-950/40 px-3.5 py-1.5 text-xs font-bold text-teal-200 shadow-md transition hover:border-teal-400 hover:bg-teal-900/60 active:scale-95"
              >
                <Mail size={13} className="text-teal-400" />
                <span>Newsletter Digest</span>
              </button>

              <Link
                href="/admin/sources?action=new"
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-teal-900/30 transition hover:from-teal-500 hover:to-emerald-500 active:scale-95"
              >
                <Plus size={13} />
                <span>Add RSS Source</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 space-y-6 p-4 sm:p-6">
          {!statusParam ? (
            /* Main Dashboard: Charts & Operations Hub */
            <DashboardCharts
              stats={stats}
              onNavigateToArticles={(st) => handleStatusChange(st || 'all')}
              onPreviewArticle={(art) => setPreviewArticle(art)}
              onTriggerWorker={handleTriggerWorker}
              workerRunning={workerRunning}
              onPublishAllReview={handlePublishAllPending}
              isPublishingReview={publishingAllPending}
            />
          ) : (
            <>
              {/* Stat Cards Row */}
              <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <MetricCard
                  title="Total Articles"
                  value={fmtNum(stats.total)}
                  subtext={`${fmtNum(stats.todayPosts)} today`}
                  icon={<Newspaper size={20} className="text-teal-400" />}
                  accentColor="bg-teal-500/10 border border-teal-500/20"
                  onClick={() => handleStatusChange('all')}
                  active={statusFilter === 'all'}
                />
                <MetricCard
                  title="Published"
                  value={fmtNum(stats.published)}
                  subtext="Live on website"
                  icon={<CheckCircle2 size={20} className="text-emerald-400" />}
                  accentColor="bg-emerald-500/10 border border-emerald-500/20"
                  onClick={() => handleStatusChange('published')}
                  active={statusFilter === 'published'}
                />
                <MetricCard
                  title="Review Queue"
                  value={fmtNum(stats.pending)}
                  subtext="Awaiting editorial"
                  icon={<Clock size={20} className="text-amber-400" />}
                  accentColor="bg-amber-500/10 border border-amber-500/20"
                  onClick={() => handleStatusChange('pending')}
                  active={statusFilter === 'pending'}
                />
                <MetricCard
                  title="RSS Sources"
                  value={fmtNum(stats.totalSources)}
                  subtext={`${stats.activeSources} active feeds`}
                  icon={<Radio size={20} className="text-blue-400" />}
                  accentColor="bg-blue-500/10 border border-blue-500/20"
                  onClick={() => router.push('/admin/sources')}
                />
                <MetricCard
                  title="Total Views"
                  value={fmtNum(stats.totalViews)}
                  subtext="Across all articles"
                  icon={<Eye size={20} className="text-purple-400" />}
                  accentColor="bg-purple-500/10 border border-purple-500/20"
                />
                <MetricCard
                  title="Featured / Breaking"
                  value={`${stats.featured} / ${stats.breaking}`}
                  subtext="Promoted stories"
                  icon={<Star size={20} className="text-rose-400" />}
                  accentColor="bg-rose-500/10 border border-rose-500/20"
                />
              </section>

              {/* Table Container */}
              <section className="relative rounded-xl border border-slate-800/80 bg-[#0c1220]/90 shadow-xl backdrop-blur-md min-h-[500px]">
                {/* Filter Toolbar */}
                <div className="border-b border-slate-800/80 p-4 space-y-3">
                  {/* Top Row: Search & Filters */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search by title, excerpt, or slug..."
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

                    {/* Dropdown Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={categoryFilter}
                        onChange={(e) => {
                          setCategoryFilter(e.target.value);
                          setPage(1);
                        }}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-teal-500 capitalize"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c} className="capitalize">
                            {c === 'all' ? 'All Categories' : c}
                          </option>
                        ))}
                      </select>

                      <select
                        value={sortOption}
                        onChange={(e) => {
                          setSortOption(e.target.value);
                          setPage(1);
                        }}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-teal-500"
                      >
                        <option value="created_at_desc">Newest Ingested</option>
                        <option value="published_at_desc">Latest Published</option>
                        <option value="views">Most Views</option>
                        <option value="trending">Trending Score</option>
                        <option value="top">Top Ranked</option>
                        <option value="oldest">Oldest First</option>
                      </select>

                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-teal-500"
                      >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                        <option value={100}>100 / page</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { key: 'all', label: 'All Articles', count: stats.total },
                        { key: 'published', label: 'Published', count: stats.published },
                        { key: 'pending', label: 'Review Queue', count: stats.pending },
                        { key: 'draft', label: 'Drafts', count: stats.draft },
                        { key: 'archived', label: 'Archived', count: stats.archived },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => handleStatusChange(tab.key)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === tab.key
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                            }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${statusFilter === tab.key ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-400'
                              }`}
                          >
                            {fmtNum(tab.count)}
                          </span>
                        </button>
                      ))}
                    </div>

                    {stats.pending > 0 && statusFilter !== 'pending' && (
                      <button
                        onClick={handlePublishAllPending}
                        disabled={publishingAllPending}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 hover:text-emerald-200 transition shadow-sm active:scale-95 disabled:opacity-50"
                        title={`Publish all ${stats.pending} review queue articles`}
                      >
                        {publishingAllPending ? (
                          <Loader2 size={13} className="animate-spin text-emerald-400" />
                        ) : (
                          <CheckCircle2 size={13} className="text-emerald-400" />
                        )}
                        <span>Publish All Review ({stats.pending})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Review Queue Banner when filtering by pending */}
                {statusFilter === 'pending' && stats.pending > 0 && (
                  <div className="m-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-emerald-950/30 p-4 shadow-lg">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner">
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">Editorial Review Queue</h3>
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                            {stats.pending} Pending Articles
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Articles from RSS feeds awaiting editorial clearance. Click to publish all {stats.pending} articles to the public site in one click.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handlePublishAllPending}
                        disabled={publishingAllPending || stats.pending === 0}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-950/60 transition hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50"
                      >
                        {publishingAllPending ? (
                          <Loader2 size={15} className="animate-spin text-white" />
                        ) : (
                          <CheckCircle2 size={15} className="text-white" />
                        )}
                        <span>Publish All {stats.pending} Review Articles</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Stable Table Container */}
                <div className="relative overflow-x-auto">
                  <table className="w-full min-w-[1020px] table-fixed border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-slate-900/60 font-bold uppercase tracking-wider text-slate-400">
                        {/* Checkbox Column */}
                        <th className="w-12 px-4 py-3.5 text-center">
                          <button
                            onClick={toggleSelectAll}
                            title={isAllSelected ? 'Deselect all' : 'Select all on this page'}
                            className="inline-flex items-center justify-center text-slate-400 hover:text-teal-400 transition"
                          >
                            {isAllSelected ? (
                              <CheckSquare size={16} className="text-teal-400" />
                            ) : isPartiallySelected ? (
                              <MinusSquare size={16} className="text-teal-400" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </th>
                        <th className="w-80 px-4 py-3.5">Article Details</th>
                        <th className="w-28 px-3 py-3.5">Category</th>
                        <th className="w-24 px-3 py-3.5">Status</th>
                        <th className="w-28 px-3 py-3.5">Engagement</th>
                        <th className="w-28 px-3 py-3.5">Promotions</th>
                        <th className="w-24 px-3 py-3.5">Priority</th>
                        <th className="w-36 px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {loading ? (
                        // Stable Skeleton Rows (prevents layout collapse)
                        Array.from({ length: 8 }).map((_, idx) => (
                          <tr key={idx} className="h-16 animate-pulse bg-slate-900/20">
                            <td className="px-4 py-3 text-center">
                              <div className="mx-auto h-4 w-4 rounded bg-slate-800" />
                            </td>
                            <td className="px-4 py-3">
                              <div className="h-4 w-3/4 rounded bg-slate-800 mb-1.5" />
                              <div className="h-3 w-1/2 rounded bg-slate-800/60" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-5 w-16 rounded bg-slate-800" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-5 w-20 rounded bg-slate-800" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-4 w-12 rounded bg-slate-800" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-5 w-16 rounded bg-slate-800" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-5 w-14 rounded bg-slate-800" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-block h-6 w-24 rounded bg-slate-800" />
                            </td>
                          </tr>
                        ))
                      ) : articles.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-20 text-center text-slate-400">
                            <Newspaper size={36} className="mx-auto mb-2 text-slate-600" />
                            <p className="text-sm font-semibold text-slate-300">No articles found</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Try adjusting your search query, status filters, or category.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        articles.map((item) => {
                          const isSelected = selectedIds.includes(Number(item.id));
                          const isRowLoading = actionLoading?.startsWith(`${item.id}:`);

                          return (
                            <tr
                              key={item.id}
                              className={`group transition-colors ${isSelected ? 'bg-teal-950/20' : 'hover:bg-slate-800/40'
                                }`}
                            >
                              {/* Checkbox */}
                              <td className="px-4 py-3.5 text-center">
                                <button
                                  onClick={() => toggleSelectRow(Number(item.id))}
                                  className="inline-flex items-center justify-center text-slate-400 hover:text-teal-400 transition"
                                >
                                  {isSelected ? (
                                    <CheckSquare size={16} className="text-teal-400" />
                                  ) : (
                                    <Square size={16} />
                                  )}
                                </button>
                              </td>

                              {/* Article Title & Source */}
                              <td className="px-4 py-3.5">
                                <div className="space-y-1">
                                  <button
                                    onClick={() => setPreviewArticle(item)}
                                    className="text-left font-semibold text-slate-100 hover:text-teal-300 transition-colors line-clamp-1"
                                    title={item.title}
                                  >
                                    {item.title}
                                  </button>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                    {item.source_name && (
                                      <span className="font-medium text-teal-400/90 truncate max-w-[120px]">
                                        {item.source_name}
                                      </span>
                                    )}
                                    <span>•</span>
                                    <span className="tabular-nums">{fmtDate(item.created_at)}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="px-3 py-3.5 whitespace-nowrap">
                                <span className="inline-flex items-center rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-300">
                                  {item.category}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-3 py-3.5 whitespace-nowrap">
                                <StatusBadge status={item.status} />
                              </td>

                              {/* Engagement */}
                              <td className="px-3 py-3.5 whitespace-nowrap text-slate-300 tabular-nums">
                                <div className="flex items-center gap-1.5">
                                  <Eye size={12} className="text-slate-400" />
                                  <span>{fmtNum(item.view_count || item.views)}</span>
                                </div>
                              </td>

                              {/* Featured & Breaking Pills */}
                              <td className="px-3 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  {/* Featured Toggle */}
                                  <button
                                    onClick={() =>
                                      handleSingleAction(
                                        item.id,
                                        item.is_featured ? 'unfeature' : 'feature',
                                        { hours: 24 }
                                      )
                                    }
                                    disabled={isRowLoading}
                                    title={item.is_featured ? 'Click to unfeature' : 'Feature for 24h'}
                                    className={`rounded p-1 transition ${item.is_featured
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'text-slate-600 hover:text-slate-300'
                                      }`}
                                  >
                                    <Star size={13} className={item.is_featured ? 'fill-amber-400 text-amber-400' : ''} />
                                  </button>

                                  {/* Breaking Toggle */}
                                  <button
                                    onClick={() =>
                                      handleSingleAction(
                                        item.id,
                                        item.is_breaking ? 'unbreaking' : 'breaking',
                                        { hours: 2 }
                                      )
                                    }
                                    disabled={isRowLoading}
                                    title={item.is_breaking ? 'Click to unmark breaking' : 'Mark breaking for 2h'}
                                    className={`rounded p-1 transition ${item.is_breaking
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : 'text-slate-600 hover:text-slate-300'
                                      }`}
                                  >
                                    <Zap size={13} className={item.is_breaking ? 'fill-rose-400 text-rose-400' : ''} />
                                  </button>
                                </div>
                              </td>

                              {/* Priority */}
                              <td className="px-3 py-3.5 whitespace-nowrap">
                                <select
                                  value={item.editorial_priority || 'normal'}
                                  onChange={(e) =>
                                    handlePriorityChange(
                                      item.id,
                                      e.target.value as 'normal' | 'high' | 'pinned'
                                    )
                                  }
                                  disabled={isRowLoading}
                                  className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300 outline-none capitalize"
                                >
                                  <option value="normal">Normal</option>
                                  <option value="high">High</option>
                                  <option value="pinned">Pinned</option>
                                </select>
                              </td>

                              {/* Action Buttons */}
                              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Publish / Unpublish Toggle */}
                                  {item.status === 'published' ? (
                                    <button
                                      onClick={() => handleSingleAction(item.id, 'unpublish')}
                                      disabled={isRowLoading}
                                      title="Unpublish to Draft"
                                      className="rounded border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] font-semibold text-slate-300 transition hover:bg-slate-700"
                                    >
                                      Draft
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleSingleAction(item.id, 'publish')}
                                      disabled={isRowLoading}
                                      title="Publish article live"
                                      className="rounded border border-emerald-500/30 bg-emerald-950/30 px-2 py-1 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-900/50"
                                    >
                                      Publish
                                    </button>
                                  )}

                                  {/* Create Social Post */}
                                  <button
                                    onClick={() => setSocialModalArticle(item)}
                                    title="Create Branded Social Media Post"
                                    className="rounded p-1 text-teal-400 hover:bg-teal-950/50 hover:text-teal-300 transition"
                                  >
                                    <Share2 size={13} />
                                  </button>

                                  {/* Send Web Push Notification */}
                                  <button
                                    onClick={() => setPushModalArticle(item)}
                                    title="Broadcast Web Push Alert to Subscribers"
                                    className="rounded p-1 text-amber-400 hover:bg-amber-950/50 hover:text-amber-300 transition"
                                  >
                                    <Bell size={13} />
                                  </button>

                                  {/* View Details Modal */}
                                  <button
                                    onClick={() => setPreviewArticle(item)}
                                    title="Preview article"
                                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                                  >
                                    <Eye size={13} />
                                  </button>

                                  {/* Archive / Delete */}
                                  <button
                                    onClick={() => handleDeleteArticle(item.id)}
                                    disabled={isRowLoading}
                                    title="Archive article"
                                    className="rounded p-1 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Toolbar */}
                <div className="flex flex-col gap-3 border-t border-slate-800/80 p-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>
                      Showing <strong className="text-white">{articles.length ? (page - 1) * limit + 1 : 0}</strong> to{' '}
                      <strong className="text-white">{Math.min(page * limit, total)}</strong> of{' '}
                      <strong className="text-white">{fmtNum(total)}</strong> articles
                    </span>
                    {selectedIds.length > 0 && (
                      <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[11px] font-bold text-teal-300 border border-teal-500/30">
                        {selectedIds.length} Selected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || loading}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </button>
                    <span className="px-2 font-medium text-slate-300">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages || loading}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* ─── Floating Bulk Actions Command Bar (Full-Size Enterprise Dock with Scrolling) ─── */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 md:left-64 z-40 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-3">
          <div className="pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-slate-700/90 bg-[#090d16]/95 px-4 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl ring-1 ring-slate-600/40 custom-scrollbar">
            {/* Selected Count Pill */}
            <div className="flex items-center gap-2 pr-3 border-r border-slate-800 shrink-0">
              <span className="flex h-6 min-w-[24px] px-1.5 items-center justify-center rounded-full bg-teal-500 text-xs font-black text-slate-950 shadow-sm">
                {selectedIds.length}
              </span>
              <span className="text-xs font-bold text-white tracking-wide whitespace-nowrap">Selected</span>
            </div>

            {/* Action Buttons Group */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Bulk Publish */}
              <button
                onClick={() => executeBulkAction('publish')}
                disabled={bulkExecuting}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-md shadow-emerald-950/40 transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                {bulkExecuting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                <span>Publish All</span>
              </button>

              {/* Bulk Move to Drafts */}
              <button
                onClick={() => executeBulkAction('unpublish')}
                disabled={bulkExecuting}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/90 px-3 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                <span>Drafts</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-0.5" />

              {/* Feature 24h */}
              <button
                onClick={() => executeBulkAction('feature', { hours: 24 })}
                disabled={bulkExecuting}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20 active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                <Star size={13} className="fill-amber-400/30 text-amber-400" />
                <span>Feature (24h)</span>
              </button>

              {/* Breaking 2h */}
              <button
                onClick={() => executeBulkAction('breaking', { hours: 2 })}
                disabled={bulkExecuting}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                <Zap size={13} className="fill-rose-400/30 text-rose-400" />
                <span>Breaking (2h)</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-0.5" />

              {/* Priority Select */}
              <div className="relative flex items-center">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      executeBulkAction('priority', { priority: e.target.value });
                      e.target.value = '';
                    }
                  }}
                  disabled={bulkExecuting}
                  className="h-9 appearance-none rounded-lg border border-slate-700/80 bg-slate-800/90 pl-3 pr-8 text-xs font-medium text-slate-200 outline-none hover:border-slate-600 hover:bg-slate-700/80 cursor-pointer transition disabled:opacity-50 whitespace-nowrap"
                >
                  <option value="" disabled>Set Priority...</option>
                  <option value="normal" className="bg-slate-900 text-white">Priority: Normal</option>
                  <option value="high" className="bg-slate-900 text-white">Priority: High</option>
                  <option value="pinned" className="bg-slate-900 text-white">Priority: Pinned</option>
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2.5 text-slate-400" />
              </div>

              {/* Category Select */}
              <div className="relative flex items-center">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      executeBulkAction('category', { category: e.target.value });
                      e.target.value = '';
                    }
                  }}
                  disabled={bulkExecuting}
                  className="h-9 appearance-none rounded-lg border border-slate-700/80 bg-slate-800/90 pl-3 pr-8 text-xs font-medium text-slate-200 outline-none hover:border-slate-600 hover:bg-slate-700/80 cursor-pointer capitalize transition disabled:opacity-50 whitespace-nowrap"
                >
                  <option value="" disabled>Move Category...</option>
                  {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                    <option key={c} value={c} className="capitalize bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2.5 text-slate-400" />
              </div>

              <div className="h-4 w-px bg-slate-800 mx-0.5" />

              {/* Archive Button */}
              <button
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Archive Selected Articles',
                    message: `Are you sure you want to archive ${selectedIds.length} selected articles? They will be removed from the active live feed.`,
                    confirmText: `Archive ${selectedIds.length} Articles`,
                    cancelText: 'Cancel',
                    intent: 'danger',
                    onConfirm: async () => {
                      setConfirmDialog(null);
                      executeBulkAction('archive');
                    },
                  });
                }}
                disabled={bulkExecuting}
                title="Archive selected articles"
                className="flex h-9 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-rose-300 transition hover:bg-rose-500/20 active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                <Archive size={14} />
              </button>

              {/* Clear Selection */}
              <button
                onClick={clearSelection}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition shrink-0"
                title="Clear selection"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Zero-Layout-Shift Floating Toaster ──────────────────────────────── */}
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

      {/* ─── Article Preview Modal ──────────────────────────────────────────── */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-[#0c1220] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div className="flex items-center gap-2">
                <StatusBadge status={previewArticle.status} />
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold capitalize text-slate-300">
                  {previewArticle.category}
                </span>
                {previewArticle.is_featured ? (
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
                    Featured
                  </span>
                ) : null}
                {previewArticle.is_breaking ? (
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300 border border-rose-500/30">
                    Breaking
                  </span>
                ) : null}
              </div>
              <button onClick={() => setPreviewArticle(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <h2 className="text-lg font-bold text-white leading-snug">{previewArticle.title}</h2>

              {previewArticle.image_url && (
                <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
                  <img
                    src={previewArticle.image_url}
                    alt={previewArticle.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {previewArticle.excerpt && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Summary Excerpt
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed">{previewArticle.excerpt}</p>
                </div>
              )}

              {previewArticle.key_takeaways && (
                <div className="rounded-xl border border-teal-900/30 bg-teal-950/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
                    Key Takeaways
                  </p>
                  <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed whitespace-pre-line">
                    {previewArticle.key_takeaways}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5">
                  <p className="text-[11px] text-slate-400">Total Views</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {fmtNum(previewArticle.view_count || previewArticle.views)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5">
                  <p className="text-[11px] text-slate-400">Editorial Priority</p>
                  <p className="text-sm font-bold text-teal-300 mt-0.5 capitalize">
                    {previewArticle.editorial_priority || 'normal'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5">
                  <p className="text-[11px] text-slate-400">Published At</p>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">
                    {fmtDate(previewArticle.published_at)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5">
                  <p className="text-[11px] text-slate-400">Ingested At</p>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">
                    {fmtDate(previewArticle.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="border-t border-slate-800 bg-[#080c16] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {previewArticle.status === 'published' ? (
                  <button
                    onClick={() => {
                      handleSingleAction(previewArticle.id, 'unpublish');
                      setPreviewArticle({ ...previewArticle, status: 'draft' });
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    Move to Draft
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleSingleAction(previewArticle.id, 'publish');
                      setPreviewArticle({ ...previewArticle, status: 'published' });
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    <CheckCircle2 size={14} />
                    Publish Live
                  </button>
                )}

                <button
                  onClick={() =>
                    handleSingleAction(
                      previewArticle.id,
                      previewArticle.is_featured ? 'unfeature' : 'feature',
                      { hours: 24 }
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-950/60"
                >
                  <Star size={14} />
                  {previewArticle.is_featured ? 'Unmark Featured' : 'Feature (24h)'}
                </button>

                <button
                  onClick={() =>
                    handleSingleAction(
                      previewArticle.id,
                      previewArticle.is_breaking ? 'unbreaking' : 'breaking',
                      { hours: 2 }
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/60"
                >
                  <Zap size={14} />
                  {previewArticle.is_breaking ? 'Unmark Breaking' : 'Mark Breaking'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const art = previewArticle;
                    setPreviewArticle(null);
                    setSocialModalArticle(art);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-teal-500/40 bg-gradient-to-r from-teal-950/60 to-emerald-950/60 px-3 py-2 text-xs font-bold text-teal-200 hover:bg-teal-900/60 hover:text-white transition"
                >
                  <Share2 size={14} className="text-teal-400" />
                  <span>Social Studio</span>
                </button>

                <button
                  onClick={() => handleDeleteArticle(previewArticle.id)}
                  className="rounded-lg border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30"
                >
                  Archive
                </button>
                <button
                  onClick={() => setPreviewArticle(null)}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Studio Publishing Modal */}
      <SocialPublishModal
        isOpen={Boolean(socialModalArticle)}
        article={socialModalArticle ? {
          id: socialModalArticle.id,
          title: socialModalArticle.title,
          slug: socialModalArticle.slug,
          excerpt: socialModalArticle.excerpt,
          body: socialModalArticle.body,
          key_takeaways: socialModalArticle.key_takeaways,
          category: socialModalArticle.category,
          image_url: socialModalArticle.image_url,
        } : null}
        onClose={() => setSocialModalArticle(null)}
        onPostSuccess={(msg) => showFeedback('success', msg)}
      />

      {/* Push Notification Broadcast Modal */}
      <PushBroadcastModal
        isOpen={Boolean(pushModalArticle)}
        article={pushModalArticle ? {
          id: pushModalArticle.id,
          title: pushModalArticle.title,
          slug: pushModalArticle.slug,
          excerpt: pushModalArticle.excerpt,
          image_url: pushModalArticle.image_url,
          category: pushModalArticle.category,
        } : null}
        onClose={() => setPushModalArticle(null)}
        onSuccess={(res) => showFeedback('success', `Push notification broadcasted to ${res.recipients} subscriber(s)!`)}
      />

      {/* Newsletter Email Broadcast Modal */}
      <NewsletterBroadcastModal
        isOpen={newsletterModalOpen}
        onClose={() => setNewsletterModalOpen(false)}
        onSuccess={(msg) => showFeedback('success', msg)}
      />

      {/* Custom Theme Admin Confirmation Modal */}
      <AdminConfirmModal
        dialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="flex h-full w-full flex-1 min-w-0 overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center bg-[#070b14]">
            <Loader2 size={32} className="animate-spin text-teal-500" />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
