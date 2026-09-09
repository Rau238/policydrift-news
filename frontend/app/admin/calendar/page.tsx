'use client';

import { useEffect, useState, useCallback, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Eye,
  EyeOff,
  Landmark,
  Palmtree,
  Building2,
  Rocket,
  Coins,
  Flame,
  Zap,
  Globe,
  SlidersHorizontal,
  Clock,
  Check,
  ChevronRight,
  Table,
  LayoutGrid,
  Menu,
} from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { AdminConfirmModal, type ConfirmDialogState } from '@/components/AdminConfirmModal';
import { CountryFlag } from '@/components/CountryFlag';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  type: 'economy' | 'holiday' | 'commodity';
  category?: string;
  title: string;
  date: string;
  time?: string;
  country: string;
  countryName?: string;
  flag?: string;
  authority?: string;
  impact?: 'high' | 'medium' | 'low';
  forecast?: string | null;
  previous?: string | null;
  actual?: string | null;
  unit?: string | null;
  sessionStatus?: string | null;
  exchanges?: string[];
  description?: string;
  isActive?: boolean;
  isCustom?: boolean;
  sourceUrl?: string | null;
  lastSyncedAt?: string | null;
}

const DESK_TABS = [
  { key: 'all', label: 'All Desks', icon: SlidersHorizontal, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { key: 'economy', label: 'Macro Economy', icon: Landmark, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { key: 'holiday', label: 'Market Holidays', icon: Palmtree, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { key: 'commodity', label: 'Commodities & Energy', icon: Flame, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysDiff(dateStr: string) {
  if (!dateStr) return 0;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 0;
  const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function getCountdownBadge(daysDiff: number) {
  if (daysDiff < 0) {
    return {
      label: `${Math.abs(daysDiff)}d ago`,
      color: 'bg-slate-800/80 text-slate-400 border border-slate-700/60',
    };
  }
  if (daysDiff === 0) {
    return {
      label: 'TODAY',
      color: 'bg-emerald-500 text-white font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse',
    };
  }
  if (daysDiff === 1) {
    return {
      label: 'TOMORROW',
      color: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold',
    };
  }
  if (daysDiff <= 7) {
    return {
      label: `In ${daysDiff} days`,
      color: 'bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold',
    };
  }
  return {
    label: `In ${daysDiff} days`,
    color: 'bg-slate-800/90 text-slate-300 border border-slate-700/60 font-medium',
  };
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminCalendarPage() {
  const router = useRouter();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'upcoming' | 'this_week' | 'this_month' | 'all'>('upcoming');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals & Feedback
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'economy' as CalendarEvent['type'],
    date: new Date().toISOString().split('T')[0],
    time: '12:00 GMT',
    country: 'IN',
    countryName: 'India',
    flag: '🇮🇳',
    authority: 'Reserve Bank of India (RBI)',
    impact: 'medium' as 'high' | 'medium' | 'low',
    category: '',
    description: '',
    forecast: '',
    previous: '',
    actual: '',
    unit: '%',
    sessionStatus: 'Full Day Market Closure',
    exchanges: 'NSE, BSE, MCX',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4050);
  };

  // ─── Fetch Events ──────────────────────────────────────────────────────────

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/calendar?status=all&limit=500');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch calendar events.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ─── Filter Events ─────────────────────────────────────────────────────────

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const diff = getDaysDiff(e.date);

      if (timeframeFilter === 'upcoming' && diff < 0) return false;
      if (timeframeFilter === 'this_week' && (diff < 0 || diff > 7)) return false;
      if (timeframeFilter === 'this_month' && (diff < 0 || diff > 30)) return false;

      if (activeTab !== 'all' && e.type !== activeTab) return false;
      if (countryFilter !== 'all' && e.country !== countryFilter && e.country !== 'GLOBAL') return false;
      if (statusFilter === 'active' && !e.isActive) return false;
      if (statusFilter === 'inactive' && e.isActive) return false;
      if (impactFilter !== 'all' && e.impact !== impactFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.title?.toLowerCase().includes(q);
        const matchesAuth = e.authority?.toLowerCase().includes(q);
        const matchesDesc = e.description?.toLowerCase().includes(q);
        return matchesTitle || matchesAuth || matchesDesc;
      }

      return true;
    });
  }, [events, activeTab, countryFilter, statusFilter, impactFilter, timeframeFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = events.length;
    const active = events.filter((e) => e.isActive).length;
    const upcoming = events.filter((e) => getDaysDiff(e.date) >= 0).length;
    const upcoming7Days = events.filter((e) => {
      const diff = getDaysDiff(e.date);
      return diff >= 0 && diff <= 7;
    }).length;
    const highImpact = events.filter((e) => e.impact === 'high' && getDaysDiff(e.date) >= 0).length;
    return { total, active, upcoming, upcoming7Days, highImpact };
  }, [events]);

  // Chronological Timeline Groups
  const timelineGroups = useMemo(() => {
    const groups: { key: string; label: string; count: number; items: CalendarEvent[] }[] = [
      { key: 'imminent', label: '⚡ Today & Tomorrow (Imminent Action)', count: 0, items: [] },
      { key: 'week', label: '📅 This Week (Next 7 Days)', count: 0, items: [] },
      { key: 'month', label: '📊 This Month (Next 30 Days)', count: 0, items: [] },
      { key: 'later', label: '🔮 Forward Agenda (Q4 2026 - 2027)', count: 0, items: [] },
      { key: 'past', label: '📁 Past Historical Releases', count: 0, items: [] },
    ];

    for (const evt of filteredEvents) {
      const diff = getDaysDiff(evt.date);
      if (diff < 0) {
        groups[4].items.push(evt);
        groups[4].count++;
      } else if (diff <= 1) {
        groups[0].items.push(evt);
        groups[0].count++;
      } else if (diff <= 7) {
        groups[1].items.push(evt);
        groups[1].count++;
      } else if (diff <= 30) {
        groups[2].items.push(evt);
        groups[2].count++;
      } else {
        groups[3].items.push(evt);
        groups[3].count++;
      }
    }

    return groups.filter((g) => g.count > 0);
  }, [filteredEvents]);

  // ─── Live Sync Action ──────────────────────────────────────────────────────

  const handleLiveSync = async (forceSeed = false) => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceSeed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Live synchronization failed');
      showToast('success', data.message || 'Live calendar synchronized successfully!');
      await fetchEvents();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  // ─── Toggle Active ─────────────────────────────────────────────────────────

  const handleToggleActive = async (id: string, currentStatus?: boolean) => {
    try {
      const res = await fetch(`/api/admin/calendar/${id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle status');

      setEvents((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
      );
      showToast('success', `Status changed to ${!currentStatus ? 'Active' : 'Disabled'}`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Toggle failed');
    }
  };

  // ─── Delete Event ──────────────────────────────────────────────────────────

  const handleDelete = (event: CalendarEvent) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Calendar Event',
      message: `Are you sure you want to permanently delete "${event.title}"? This cannot be undone.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      intent: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/calendar/${event.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete event');
          setEvents((prev) => prev.filter((item) => item.id !== event.id));
          showToast('success', `Deleted "${event.title}"`);
        } catch (err) {
          showToast('error', err instanceof Error ? err.message : 'Delete failed');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // ─── Open Add / Edit Modal ─────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      type: 'economy',
      date: new Date().toISOString().split('T')[0],
      time: '12:00 GMT',
      country: 'IN',
      countryName: 'India',
      flag: '🇮🇳',
      authority: 'Reserve Bank of India (RBI)',
      impact: 'high',
      category: 'interest_rate',
      description: '',
      forecast: '',
      previous: '',
      actual: '',
      unit: '%',
      sessionStatus: 'Full Day Market Closure',
      exchanges: 'NSE, BSE, MCX',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      type: event.type || 'economy',
      date: event.date || new Date().toISOString().split('T')[0],
      time: event.time || '12:00 GMT',
      country: event.country || 'IN',
      countryName: event.countryName || 'India',
      flag: event.flag || '🇮🇳',
      authority: event.authority || '',
      impact: event.impact || 'medium',
      category: event.category || '',
      description: event.description || '',
      forecast: event.forecast || '',
      previous: event.previous || '',
      actual: event.actual || '',
      unit: event.unit || '%',
      sessionStatus: event.sessionStatus || 'Full Day Market Closure',
      exchanges: event.exchanges?.join(', ') || 'NSE, BSE',
      isActive: event.isActive !== undefined ? event.isActive : true,
    });
    setShowModal(true);
  };

  // ─── Save / Submit Form ────────────────────────────────────────────────────

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: Record<string, any> = {
        title: formData.title,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        country: formData.country,
        countryName: formData.country === 'IN' ? 'India' : formData.country === 'US' ? 'United States' : 'Global',
        flag: formData.country === 'IN' ? '🇮🇳' : formData.country === 'US' ? '🇺🇸' : '🌐',
        authority: formData.authority,
        impact: formData.impact,
        category: formData.category,
        description: formData.description,
        isActive: formData.isActive,
      };

      if (formData.type === 'economy') {
        payload.forecast = formData.forecast;
        payload.previous = formData.previous;
        payload.actual = formData.actual;
        payload.unit = formData.unit;
      } else if (formData.type === 'holiday') {
        payload.sessionStatus = formData.sessionStatus;
        payload.exchanges = formData.exchanges.split(',').map((s) => s.trim()).filter(Boolean);
      } else if (formData.type === 'commodity') {
        payload.forecast = formData.forecast;
        payload.previous = formData.previous;
      }

      const url = editingEvent ? `/api/admin/calendar/${editingEvent.id}` : '/api/admin/calendar';
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save calendar event');

      showToast('success', editingEvent ? 'Event updated successfully' : 'New event created');
      setShowModal(false);
      await fetchEvents();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100">
      {/* Admin Sidebar */}
      <AdminSidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Sticky Header */}
        <header className="flex-shrink-0 border-b border-slate-800/80 bg-[#090d16] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white shrink-0"
              title="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>

            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <CalendarDays size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Calendar Desk Management
                </h1>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30 uppercase tracking-wide">
                  Live MySQL
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Macroeconomic catalysts, market holidays, and commodities & energy agenda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Sync Live Feeds Button */}
            <button
              type="button"
              onClick={() => handleLiveSync(false)}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
              title="Sync live economic feeds and refresh database records"
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin text-cyan-400' : 'text-slate-400'} />
              <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync Live Feeds'}</span>
            </button>

            {/* Add New Event Button */}
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-500 transition"
            >
              <Plus size={15} />
              <span>Add Event</span>
            </button>
          </div>
        </header>

        {/* Feedback Toast */}
        {feedback && (
          <div
            className={`mx-4 mt-3 sm:mx-6 flex items-center justify-between gap-3 rounded-xl p-3 text-xs font-semibold border transition animate-in fade-in slide-in-from-top-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Top Metric Cards Grid ─────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-slate-800/80 bg-[#080d18] px-4 sm:px-6 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Stat 1: Total Events */}
            <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Total Events
                </span>
                <span className="text-lg font-extrabold text-white font-mono">{stats.total}</span>
                <span className="text-[10px] text-slate-500 block">Across 3 Desks</span>
              </div>
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <CalendarDays size={16} />
              </div>
            </div>

            {/* Stat 2: Upcoming in 7 Days */}
            <div className="rounded-xl border border-cyan-500/20 bg-slate-900/70 p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                  Next 7 Days
                </span>
                <span className="text-lg font-extrabold text-cyan-300 font-mono">{stats.upcoming7Days}</span>
                <span className="text-[10px] text-slate-400 block">Active Catalysts</span>
              </div>
              <div className="h-8 w-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Clock size={16} />
              </div>
            </div>

            {/* Stat 3: High Impact Volatility */}
            <div className="rounded-xl border border-rose-500/20 bg-slate-900/70 p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider block">
                  High Impact
                </span>
                <span className="text-lg font-extrabold text-rose-300 font-mono">{stats.highImpact}</span>
                <span className="text-[10px] text-slate-400 block">Market Movers</span>
              </div>
              <div className="h-8 w-8 rounded-lg bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Zap size={16} className="fill-rose-400" />
              </div>
            </div>

            {/* Stat 4: Active Status */}
            <div className="rounded-xl border border-emerald-500/20 bg-slate-900/70 p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
                  Production Live
                </span>
                <span className="text-lg font-extrabold text-emerald-300 font-mono">{stats.active}</span>
                <span className="text-[10px] text-slate-400 block">100% Published</span>
              </div>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter & Search Control Center ─────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-slate-800/80 bg-[#090e1b] px-4 sm:px-6 py-3 space-y-3">
          {/* Row 1: Search + Timeframe Range + Region Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event title, symbol, authority, notes…"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Timeframe Scope Selector */}
            <div className="flex items-center gap-1 bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Window:</span>
              {(
                [
                  { key: 'upcoming', label: 'Upcoming Only' },
                  { key: 'this_week', label: 'Next 7 Days' },
                  { key: 'this_month', label: 'This Month' },
                  { key: 'all', label: 'All Timeline' },
                ] as const
              ).map((tf) => (
                <button
                  key={tf.key}
                  type="button"
                  onClick={() => setTimeframeFilter(tf.key)}
                  className={`rounded-lg px-2.5 py-1 font-bold transition text-xs ${
                    timeframeFilter === tf.key
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Country Selector */}
            <div className="flex items-center gap-1 bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs shrink-0">
              {(['all', 'IN', 'US', 'GLOBAL'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCountryFilter(c)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1.5 ${
                    countryFilter === c ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c === 'all' ? (
                    <span>All Regions</span>
                  ) : c === 'IN' ? (
                    <>
                      <CountryFlag iso="in" size={13} />
                      <span>India</span>
                    </>
                  ) : c === 'US' ? (
                    <>
                      <CountryFlag iso="us" size={13} />
                      <span>US</span>
                    </>
                  ) : (
                    <>
                      <Globe size={11} className="text-violet-400" />
                      <span>Global</span>
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Impact Filter */}
            <div className="flex items-center gap-1 bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs shrink-0">
              {(['all', 'high'] as const).map((imp) => (
                <button
                  key={imp}
                  type="button"
                  onClick={() => setImpactFilter(imp)}
                  className={`rounded-lg px-2.5 py-1 font-bold capitalize transition ${
                    impactFilter === imp ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {imp === 'all' ? 'All Impact' : '⚡ High Impact Only'}
                </button>
              ))}
            </div>

            {/* View Mode Toggle (Table vs Cards) */}
            <div className="flex items-center gap-1 bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs shrink-0 sm:ml-auto">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Table View (High-Density Financial Terminal)"
              >
                <Table size={13} />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'cards' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Card View (Tile Breakdown)"
              >
                <LayoutGrid size={13} />
                <span>Cards</span>
              </button>
            </div>
          </div>

          {/* Row 2: 6 Desk Category Badges Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {DESK_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.key;
              const count = tab.key === 'all'
                ? events.filter((e) => timeframeFilter !== 'upcoming' || getDaysDiff(e.date) >= 0).length
                : events.filter((e) => e.type === tab.key && (timeframeFilter !== 'upcoming' || getDaysDiff(e.date) >= 0)).length;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {Icon && <Icon size={13} className={isSelected ? 'text-cyan-400' : 'text-slate-400'} />}
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-extrabold ${
                      isSelected ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Chronological Event Timeline ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
              <Loader2 size={32} className="animate-spin text-cyan-400 mb-3" />
              <p className="text-sm font-semibold">Loading calendar workstation…</p>
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 text-center">
              <AlertCircle size={32} className="mx-auto text-rose-400 mb-2" />
              <h3 className="text-base font-bold text-white">Error loading calendar events</h3>
              <p className="text-xs text-rose-300 mt-1">{fetchError}</p>
              <button
                type="button"
                onClick={fetchEvents}
                className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
              <CalendarDays size={36} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white">No calendar events found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No events matched your selected timeframe or filter criteria. You can create a new event or sync live feeds.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={openAddModal}
                  className="rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-500"
                >
                  Create New Event
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframeFilter('all')}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
                >
                  View All Timeline
                </button>
              </div>
            </div>
          ) : (
            timelineGroups.map((group) => (
              <div key={group.key} className="space-y-3">
                {/* Timeline Section Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
                      {group.label}
                    </h2>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300">
                      {group.count}
                    </span>
                  </div>
                </div>

                {/* View Mode: Table (Default High Density) */}
                {viewMode === 'table' ? (
                  <div className="overflow-hidden rounded-xl border border-slate-800/90 bg-[#080d1a] shadow-xl backdrop-blur-xs">
                    {/* Desktop View (>= md): Full 6-Column High-Density Financial Terminal Table */}
                    <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800/90 bg-slate-900/90 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                            <th scope="col" className="py-2.5 px-3.5 whitespace-nowrap min-w-[155px]">
                              Date &amp; Timing
                            </th>
                            <th scope="col" className="py-2.5 px-3.5 min-w-[280px]">
                              Event &amp; Jurisdiction
                            </th>
                            <th scope="col" className="py-2.5 px-3.5 min-w-[230px]">
                              Market Data / Session
                            </th>
                            <th scope="col" className="py-2.5 px-3.5 whitespace-nowrap min-w-[150px]">
                              Authority
                            </th>
                            <th scope="col" className="py-2.5 px-3.5 text-center whitespace-nowrap min-w-[95px]">
                              Status
                            </th>
                            <th scope="col" className="py-2.5 px-3.5 text-right whitespace-nowrap min-w-[125px]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {group.items.map((evt) => {
                            const isEconomy = evt.type === 'economy';
                            const isHoliday = evt.type === 'holiday';
                            const isCommodity = evt.type === 'commodity';
                            const isHighImpact = evt.impact === 'high';

                            const daysDiff = getDaysDiff(evt.date);
                            const countdown = getCountdownBadge(daysDiff);

                            return (
                              <tr
                                key={evt.id}
                                className={`group transition-colors ${
                                  evt.isActive
                                    ? 'hover:bg-slate-900/60'
                                    : 'opacity-60 bg-slate-950/40 hover:bg-slate-900/40'
                                }`}
                              >
                                {/* Col 1: Date & Timing */}
                                <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-mono text-xs font-bold text-white tracking-wide">
                                        {new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        })}
                                      </span>
                                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono text-slate-400">
                                        <span className="font-bold uppercase text-slate-300">
                                          {new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                        <span className="text-slate-600">•</span>
                                        <span className="truncate max-w-[90px]">{evt.time || '12:00 GMT'}</span>
                                      </div>
                                    </div>
                                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${countdown.color}`}>
                                      {countdown.label}
                                    </span>
                                  </div>
                                </td>

                                {/* Col 2: Event & Jurisdiction */}
                                <td className="py-3 px-3.5 align-middle">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {/* Country Flag Badge */}
                                      <span className="inline-flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-1.5 py-0.2 text-[10px] font-semibold text-slate-300">
                                        <CountryFlag iso={evt.country} flag={evt.flag} size={13} />
                                        <span>{evt.countryName || evt.country}</span>
                                      </span>

                                      {/* Desk Badge */}
                                      <span
                                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                          isEconomy
                                            ? 'bg-blue-950/70 text-blue-300 border border-blue-700/50'
                                            : isHoliday
                                            ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/50'
                                            : 'bg-orange-950/70 text-orange-300 border border-orange-700/50'
                                        }`}
                                      >
                                        {isEconomy && <Landmark size={9} />}
                                        {isHoliday && <Palmtree size={9} />}
                                        {isCommodity && <Flame size={9} />}
                                        <span>{evt.type}</span>
                                      </span>

                                      {/* Impact */}
                                      {isHighImpact && (
                                        <span className="inline-flex items-center gap-0.5 rounded bg-rose-950/80 px-1.5 py-0.2 text-[9px] font-black text-rose-300 border border-rose-500/40">
                                          <Zap size={9} className="fill-rose-400 text-rose-400" />
                                          <span>HIGH</span>
                                        </span>
                                      )}

                                      {/* Custom Admin Tag */}
                                      {evt.isCustom && (
                                        <span className="rounded bg-purple-950/70 px-1.5 py-0.2 text-[9px] font-bold text-purple-300 border border-purple-700/50">
                                          Custom
                                        </span>
                                      )}
                                    </div>

                                    {/* Event Title */}
                                    <h3 className="font-bold text-white text-xs sm:text-sm group-hover:text-cyan-300 transition-colors leading-tight">
                                      {evt.title}
                                    </h3>

                                    {/* Description Preview */}
                                    {evt.description && (
                                      <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">
                                        {evt.description}
                                      </p>
                                    )}
                                  </div>
                                </td>

                                {/* Col 3: Market Data / Session */}
                                <td className="py-3 px-3.5 align-middle">
                                  {isEconomy && (
                                    <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
                                      <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-0.5">
                                        <span className="text-[9px] text-slate-500 font-sans font-semibold mr-1">Frc:</span>
                                        <span className="text-cyan-300 font-bold">{evt.forecast || '—'}</span>
                                      </div>
                                      <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-0.5">
                                        <span className="text-[9px] text-slate-500 font-sans font-semibold mr-1">Prev:</span>
                                        <span className="text-slate-300 font-medium">{evt.previous || '—'}</span>
                                      </div>
                                      <div
                                        className={`rounded px-1.5 py-0.5 border ${
                                          evt.actual
                                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/50 font-bold'
                                            : 'bg-slate-900/90 text-slate-500 border-slate-800 italic'
                                        }`}
                                      >
                                        <span className="text-[9px] text-slate-500 font-sans font-semibold mr-1">Act:</span>
                                        <span>{evt.actual || 'Pending'}</span>
                                      </div>
                                    </div>
                                  )}

                                  {isHoliday && (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {evt.sessionStatus?.toLowerCase().includes('full day') || !evt.sessionStatus ? (
                                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                                            <span>Full Day Closed</span>
                                          </span>
                                        ) : evt.title.toLowerCase().includes('muhurat') ? (
                                          <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/50 bg-violet-950/90 px-2 py-0.5 text-[10px] font-extrabold text-violet-200">
                                            <Flame size={10} className="text-violet-400 fill-violet-400" />
                                            <span>Muhurat Trading</span>
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                            <span>{evt.sessionStatus}</span>
                                          </span>
                                        )}
                                      </div>
                                      {evt.exchanges && evt.exchanges.length > 0 && (
                                        <div className="flex items-center gap-1 flex-wrap">
                                          {evt.exchanges.map((ex) => {
                                            const clean = ex.trim();
                                            return (
                                              <span
                                                key={clean}
                                                className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-extrabold border ${
                                                  clean === 'NSE'
                                                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/50'
                                                    : clean === 'BSE'
                                                    ? 'bg-blue-950/70 text-blue-300 border-blue-600/50'
                                                    : clean === 'MCX'
                                                    ? 'bg-cyan-950/70 text-cyan-300 border-cyan-600/50'
                                                    : clean === 'NYSE'
                                                    ? 'bg-indigo-950/70 text-indigo-300 border-indigo-600/50'
                                                    : clean === 'NASDAQ'
                                                    ? 'bg-purple-950/70 text-purple-300 border-purple-600/50'
                                                    : 'bg-slate-850 text-slate-300 border-slate-700'
                                                }`}
                                              >
                                                {clean}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {isCommodity && (
                                    <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
                                      <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-0.5">
                                        <span className="text-[9px] text-slate-500 font-sans font-semibold mr-1">Forecast:</span>
                                        <span className="text-orange-300 font-bold">{evt.forecast || '—'}</span>
                                      </div>
                                      <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-0.5">
                                        <span className="text-[9px] text-slate-500 font-sans font-semibold mr-1">Prior:</span>
                                        <span className="text-slate-300 font-medium">{evt.previous || '—'}</span>
                                      </div>
                                    </div>
                                  )}
                                </td>

                                {/* Col 4: Authority */}
                                <td className="py-3 px-3.5 align-middle whitespace-nowrap text-xs text-slate-400">
                                  <div className="font-medium truncate max-w-[160px]" title={evt.authority || '—'}>
                                    {evt.authority || '—'}
                                  </div>
                                </td>

                                {/* Col 5: Status Toggle */}
                                <td className="py-3 px-3.5 align-middle text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(evt.id, evt.isActive)}
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition touch-manipulation ${
                                      evt.isActive
                                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80 shadow-xs'
                                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800 hover:text-slate-300'
                                    }`}
                                    title={evt.isActive ? 'Click to disable' : 'Click to enable'}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        evt.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                                      }`}
                                    />
                                    <span>{evt.isActive ? 'Active' : 'Disabled'}</span>
                                  </button>
                                </td>

                                {/* Col 6: Actions */}
                                <td className="py-3 px-3.5 align-middle text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(evt)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-xs"
                                      title="Edit event details"
                                    >
                                      <Edit2 size={11} />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(evt)}
                                      className="inline-flex items-center justify-center rounded-lg border border-rose-500/30 bg-rose-950/40 p-1.5 text-rose-300 hover:bg-rose-900/60 hover:text-rose-100 transition shadow-xs"
                                      title="Delete event"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Responsive Stream (< md): 100% Full-Width Non-Horizontally-Scrollable View */}
                    <div className="md:hidden divide-y divide-slate-800/60">
                      {group.items.map((evt) => {
                        const isEconomy = evt.type === 'economy';
                        const isHoliday = evt.type === 'holiday';
                        const isCommodity = evt.type === 'commodity';
                        const isHighImpact = evt.impact === 'high';

                        const daysDiff = getDaysDiff(evt.date);
                        const countdown = getCountdownBadge(daysDiff);

                        return (
                          <div
                            key={evt.id}
                            className={`p-3.5 space-y-2.5 transition-colors ${
                              evt.isActive
                                ? 'hover:bg-slate-900/50'
                                : 'opacity-60 bg-slate-950/40 hover:bg-slate-900/30'
                            }`}
                          >
                            {/* Row 1: Date & Time + Countdown + Type Badge */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono text-xs font-bold text-white whitespace-nowrap">
                                  {new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="font-mono text-[10px] text-slate-400 truncate">
                                  {evt.time || '12:00 GMT'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${countdown.color}`}>
                                  {countdown.label}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                    isEconomy
                                      ? 'bg-blue-950/70 text-blue-300 border border-blue-700/50'
                                      : isHoliday
                                      ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/50'
                                      : 'bg-orange-950/70 text-orange-300 border border-orange-700/50'
                                  }`}
                                >
                                  {isEconomy && <Landmark size={9} />}
                                  {isHoliday && <Palmtree size={9} />}
                                  {isCommodity && <Flame size={9} />}
                                  <span>{evt.type}</span>
                                </span>
                              </div>
                            </div>

                            {/* Row 2: Region + High Impact + Custom + Title */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-1.5 py-0.2 text-[10px] font-semibold text-slate-300">
                                  <CountryFlag iso={evt.country} flag={evt.flag} size={12} />
                                  <span>{evt.countryName || evt.country}</span>
                                </span>
                                {isHighImpact && (
                                  <span className="inline-flex items-center gap-0.5 rounded bg-rose-950/80 px-1.5 py-0.2 text-[9px] font-black text-rose-300 border border-rose-500/40">
                                    <Zap size={9} className="fill-rose-400 text-rose-400" />
                                    <span>HIGH</span>
                                  </span>
                                )}
                                {evt.isCustom && (
                                  <span className="rounded bg-purple-950/70 px-1.5 py-0.2 text-[9px] font-bold text-purple-300 border border-purple-700/50">
                                    Custom
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-white text-xs sm:text-sm leading-snug">
                                {evt.title}
                              </h3>
                              {evt.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                                  {evt.description}
                                </p>
                              )}
                            </div>

                            {/* Row 3: Market Data / Session */}
                            {isEconomy && (
                              <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                                <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-0.5">
                                  <span className="text-[9px] text-slate-500 font-sans font-semibold mr-1">Frc:</span>
                                  <span className="text-cyan-300 font-bold">{evt.forecast || '—'}</span>
                                </div>
                                <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-0.5">
                                  <span className="text-[9px] text-slate-500 font-sans font-semibold mr-1">Prev:</span>
                                  <span className="text-slate-300 font-medium">{evt.previous || '—'}</span>
                                </div>
                                <div
                                  className={`rounded px-1.5 py-0.5 border ${
                                    evt.actual
                                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/50 font-bold'
                                      : 'bg-slate-900/90 text-slate-500 border-slate-800 italic'
                                  }`}
                                >
                                  <span className="text-[9px] text-slate-500 font-sans font-semibold mr-1">Act:</span>
                                  <span>{evt.actual || 'Pending'}</span>
                                </div>
                              </div>
                            )}

                            {isHoliday && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {evt.sessionStatus?.toLowerCase().includes('full day') || !evt.sessionStatus ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-950/80 px-2 py-0.5 text-[9px] font-bold text-rose-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                                    <span>Full Day Closed</span>
                                  </span>
                                ) : evt.title.toLowerCase().includes('muhurat') ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/50 bg-violet-950/90 px-2 py-0.5 text-[9px] font-extrabold text-violet-200">
                                    <Flame size={10} className="text-violet-400 fill-violet-400" />
                                    <span>Muhurat Trading</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-950/80 px-2 py-0.5 text-[9px] font-bold text-indigo-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                    <span>{evt.sessionStatus}</span>
                                  </span>
                                )}
                                {evt.exchanges && evt.exchanges.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {evt.exchanges.map((ex) => (
                                      <span
                                        key={ex.trim()}
                                        className="rounded px-1.5 py-0.2 text-[8px] font-mono font-extrabold border bg-slate-850 text-slate-300 border-slate-700"
                                      >
                                        {ex.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {isCommodity && (
                              <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                                <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-0.5">
                                  <span className="text-[9px] text-slate-500 font-sans font-semibold mr-1">Forecast:</span>
                                  <span className="text-orange-300 font-bold">{evt.forecast || '—'}</span>
                                </div>
                                <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-0.5">
                                  <span className="text-[9px] text-slate-500 font-sans font-semibold mr-1">Prior:</span>
                                  <span className="text-slate-300 font-medium">{evt.previous || '—'}</span>
                                </div>
                              </div>
                            )}

                            {/* Row 4: Authority + Actions */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/50">
                              <span className="text-[10px] text-slate-400 truncate max-w-[140px]" title={evt.authority || '—'}>
                                {evt.authority || '—'}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(evt.id, evt.isActive)}
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border transition ${
                                    evt.isActive
                                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                      : 'bg-slate-900 text-slate-500 border-slate-800'
                                  }`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${evt.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                  <span>{evt.isActive ? 'Active' : 'Off'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditModal(evt)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2 py-1 text-[10px] font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                                >
                                  <Edit2 size={10} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(evt)}
                                  className="inline-flex items-center justify-center rounded-lg border border-rose-500/30 bg-rose-950/40 p-1 text-rose-300 hover:bg-rose-900/60 hover:text-rose-100 transition"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* View Mode: Cards (Visual Tiles with No Amber) */
                  <div className="space-y-2.5">
                    {group.items.map((evt) => {
                      const isEconomy = evt.type === 'economy';
                      const isHoliday = evt.type === 'holiday';
                      const isCommodity = evt.type === 'commodity';
                      const isHighImpact = evt.impact === 'high';

                      const daysDiff = getDaysDiff(evt.date);
                      const countdown = getCountdownBadge(daysDiff);

                      return (
                        <div
                          key={evt.id}
                          className={`rounded-xl border transition-all p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
                            evt.isActive
                              ? isHighImpact
                                ? 'border-blue-500/30 bg-[#0c1220] hover:border-blue-500/60'
                                : 'border-slate-800/80 bg-[#090e1a] hover:border-slate-700'
                              : 'border-slate-800/40 bg-slate-950/60 opacity-60'
                          }`}
                        >
                          {/* Left Column: Date Badge + Details */}
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            {/* Prominent Date Box */}
                            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/90 border border-slate-800 p-2 text-center min-w-[72px] shrink-0">
                              <span className="text-[10px] uppercase font-bold text-cyan-400">
                                {new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                              <span className="text-lg font-black text-white font-mono leading-tight">
                                {new Date(evt.date + 'T00:00:00').getDate()}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">
                                {new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="min-w-0 flex-1 space-y-1.5">
                              {/* Top Meta Line: Countdown Badge + Desk Pill + Flag + Impact */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`rounded-md px-2 py-0.5 text-[10px] ${countdown.color}`}>
                                  {countdown.label}
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                    isEconomy
                                      ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                                      : isHoliday
                                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                                      : 'bg-orange-500/10 text-orange-300 border border-orange-500/30'
                                  }`}
                                >
                                  {isEconomy && <Landmark size={10} />}
                                  {isHoliday && <Palmtree size={10} />}
                                  {isCommodity && <Flame size={10} />}
                                  <span>{evt.type}</span>
                                </span>

                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700/60">
                                  <CountryFlag iso={evt.country} flag={evt.flag} size={13} />
                                  <span>{evt.countryName || evt.country}</span>
                                </span>

                                {isHighImpact && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                                    <Zap size={9} className="fill-rose-400 text-rose-400" />
                                    High Impact
                                  </span>
                                )}

                                {evt.isCustom && (
                                  <span className="rounded-md bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 border border-purple-500/30">
                                    Admin Custom
                                  </span>
                                )}
                              </div>

                              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                                {evt.title}
                              </h3>

                              {evt.description && (
                                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                                  {evt.description}
                                </p>
                              )}

                              {/* Financial Metric Tiles */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
                                {isEconomy && (
                                  <>
                                    <div className="rounded-lg bg-slate-950/80 px-2.5 py-1 border border-slate-800">
                                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Forecast</span>
                                      <span className="text-cyan-300 font-mono font-bold">{evt.forecast || '—'}</span>
                                    </div>
                                    <div className="rounded-lg bg-slate-950/80 px-2.5 py-1 border border-slate-800">
                                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Previous</span>
                                      <span className="text-slate-300 font-mono font-bold">{evt.previous || '—'}</span>
                                    </div>
                                    {evt.actual && (
                                      <div className="rounded-lg bg-emerald-950/60 px-2.5 py-1 border border-emerald-500/30">
                                        <span className="text-[10px] text-emerald-400 uppercase block font-bold">Actual</span>
                                        <span className="text-emerald-300 font-mono font-extrabold">{evt.actual}</span>
                                      </div>
                                    )}
                                    <div className="rounded-lg bg-slate-950/80 px-2.5 py-1 border border-slate-800">
                                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Time</span>
                                      <span className="text-slate-300 font-mono">{evt.time || '12:00 GMT'}</span>
                                    </div>
                                  </>
                                )}

                                {isHoliday && (
                                  <>
                                    <div className="rounded-lg bg-indigo-950/40 px-3 py-1 border border-indigo-500/30 text-indigo-200 font-semibold">
                                      {evt.sessionStatus}
                                    </div>
                                    {evt.exchanges && evt.exchanges.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Closed:</span>
                                        {evt.exchanges.map((ex) => (
                                          <span key={ex} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300">
                                            {ex}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}

                                {isCommodity && (
                                  <>
                                    <div className="rounded-lg bg-slate-950/80 px-2.5 py-1 border border-slate-800">
                                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Forecast</span>
                                      <span className="text-orange-300 font-mono font-bold">{evt.forecast || '—'}</span>
                                    </div>
                                    <div className="rounded-lg bg-slate-950/80 px-2.5 py-1 border border-slate-800">
                                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Previous</span>
                                      <span className="text-slate-300 font-mono font-bold">{evt.previous || '—'}</span>
                                    </div>
                                  </>
                                )}

                                <span className="text-[11px] text-slate-500 ml-auto self-center">
                                  Authority: <strong className="text-slate-400">{evt.authority}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Actions */}
                          <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(evt.id, evt.isActive)}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                                evt.isActive
                                  ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                              }`}
                              title={evt.isActive ? 'Click to disable' : 'Click to enable'}
                            >
                              {evt.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                              <span>{evt.isActive ? 'Active' : 'Disabled'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(evt)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                              title="Edit event details"
                            >
                              <Edit2 size={13} />
                              <span className="hidden sm:inline">Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(evt)}
                              className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition"
                              title="Delete event"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* ── Add / Edit Event Modal ────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-[#090e18] p-6 shadow-2xl text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  {editingEvent ? <Edit2 size={16} /> : <Plus size={18} />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingEvent ? 'Edit Calendar Event' : 'Add New Calendar Event'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live dynamic updates directly persist into the MySQL calendar database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Event Type & Country Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Calendar Desk (Type) *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-hidden"
                  >
                    <option value="economy">Macro Economy Indicator</option>
                    <option value="holiday">Market & Exchange Holiday</option>
                    <option value="commodity">Commodity & Energy Trigger</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Country / Jurisdiction *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-hidden"
                  >
                    <option value="IN">India (IN 🇮🇳)</option>
                    <option value="US">United States (US 🇺🇸)</option>
                    <option value="EU">Eurozone (EU 🇪🇺)</option>
                    <option value="GB">United Kingdom (GB 🇬🇧)</option>
                    <option value="JP">Japan (JP 🇯🇵)</option>
                    <option value="GLOBAL">Global / Multi-lateral (🌐)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. RBI Monetary Policy Committee (MPC) Decision"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Time / Timing Window</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 10:00 IST or After Market"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Impact Level</label>
                  <select
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-hidden"
                  >
                    <option value="high">High Impact (Market Mover)</option>
                    <option value="medium">Medium Impact</option>
                    <option value="low">Low Impact</option>
                  </select>
                </div>
              </div>

              {/* Authority / Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Authority / Publishing Body</label>
                  <input
                    type="text"
                    value={formData.authority}
                    onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                    placeholder="e.g. Reserve Bank of India (RBI)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sub-Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. inflation, interest_rate, banking"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* ── Type-Specific Dynamic Fields ──────────────────────────── */}
              {formData.type === 'economy' && (
                <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-3">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                    Macroeconomic Indicators
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Forecast</label>
                      <input
                        type="text"
                        value={formData.forecast}
                        onChange={(e) => setFormData({ ...formData, forecast: e.target.value })}
                        placeholder="e.g. 6.50%"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Previous</label>
                      <input
                        type="text"
                        value={formData.previous}
                        onChange={(e) => setFormData({ ...formData, previous: e.target.value })}
                        placeholder="e.g. 6.50%"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Actual (Released)</label>
                      <input
                        type="text"
                        value={formData.actual}
                        onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                        placeholder="e.g. 6.25%"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Unit</label>
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="e.g. % YoY, Index"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'holiday' && (
                <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-3">
                  <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                    Market Holiday Schedule
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Session Status</label>
                      <input
                        type="text"
                        value={formData.sessionStatus}
                        onChange={(e) => setFormData({ ...formData, sessionStatus: e.target.value })}
                        placeholder="e.g. Full Day Closure, Muhurat Trading"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Closed Exchanges (comma-separated)</label>
                      <input
                        type="text"
                        value={formData.exchanges}
                        onChange={(e) => setFormData({ ...formData, exchanges: e.target.value })}
                        placeholder="e.g. NSE, BSE, MCX"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}



              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Event Description & Editorial Notes</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed breakdown and market implications..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Enable event immediately on the public calendar hub
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingEvent ? 'Save Changes' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Confirm Dialog */}
      {confirmDialog && (
        <AdminConfirmModal
          dialog={confirmDialog}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
