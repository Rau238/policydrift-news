'use client';

import { useEffect, useState, useCallback, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
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
  Flame,
  Zap,
  Target,
  Clock,
  Check,
  ChevronRight,
  Menu,
  Lightbulb,
  Sparkles,
  Calendar,
  Layers,
  HelpCircle,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Copy,
  ArrowUpRight,
} from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { AdminConfirmModal, type ConfirmDialogState } from '@/components/AdminConfirmModal';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: number;
  editionDate: string;
  category: string;
  categorySlug: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  audienceVotes: number[];
  keyTerm: string;
  orderNum: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORY_OPTIONS = [
  { label: 'All Categories', slug: 'all', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  { label: 'World Policy & Geopolitics', slug: 'world-news', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { label: 'Global Markets & Banking', slug: 'banking-economics', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { label: 'Technology & AI', slug: 'technology', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { label: 'Space & Defense', slug: 'world-news', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { label: 'Sports & Athletics', slug: 'sports', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { label: 'India National & Governance', slug: 'india-news', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
];

export default function AdminQuizPage() {
  const router = useRouter();

  // Data state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters & View modes
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Mobile sidebar
  const [mobileOpen, setMobileOpen] = useState(false);

  // Form Fields
  const [formEditionDate, setFormEditionDate] = useState(new Date().toISOString().slice(0, 10));
  const [formCategory, setFormCategory] = useState(CATEGORY_OPTIONS[1].label);
  const [formCategorySlug, setFormCategorySlug] = useState(CATEGORY_OPTIONS[1].slug);
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formKeyTerm, setFormKeyTerm] = useState('');
  const [formOrderNum, setFormOrderNum] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // ── Fetch Questions ─────────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (selectedDate) params.set('date', selectedDate);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '100');

      const res = await fetch(`/api/admin/quiz?${params.toString()}`);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load quiz questions');
      }
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching quiz questions');
    } finally {
      setLoading(false);
    }
  }, [router, search, selectedDate, statusFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Toast auto-clear
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => setActionSuccess(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  // ── Form Helpers ───────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormEditionDate(selectedDate || new Date().toISOString().slice(0, 10));
    setFormCategory(CATEGORY_OPTIONS[1].label);
    setFormCategorySlug(CATEGORY_OPTIONS[1].slug);
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormKeyTerm('');
    setFormOrderNum(Math.min(5, (questions.length % 5) + 1));
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setFormEditionDate(q.editionDate || new Date().toISOString().slice(0, 10));
    setFormCategory(q.category || CATEGORY_OPTIONS[1].label);
    setFormCategorySlug(q.categorySlug || CATEGORY_OPTIONS[1].slug);
    setFormQuestion(q.question || '');
    setFormOptions(q.options?.length === 4 ? [...q.options] : [q.options[0] || '', q.options[1] || '', q.options[2] || '', q.options[3] || '']);
    setFormCorrectIndex(q.correctIndex ?? 0);
    setFormExplanation(q.explanation || '');
    setFormKeyTerm(q.keyTerm || '');
    setFormOrderNum(q.orderNum || 1);
    setFormIsActive(q.isActive ?? true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOptionChange = (index: number, val: string) => {
    setFormOptions((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = CATEGORY_OPTIONS.find((c) => c.label === e.target.value);
    if (selected) {
      setFormCategory(selected.label);
      setFormCategorySlug(selected.slug);
    }
  };

  // ── Submit Form ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    // Validation
    if (!formQuestion.trim()) {
      setFormError('Question text cannot be empty.');
      setFormLoading(false);
      return;
    }

    const cleanedOptions = formOptions.map((opt) => opt.trim());
    if (cleanedOptions.some((opt) => !opt)) {
      setFormError('All 4 answer options must be filled.');
      setFormLoading(false);
      return;
    }

    if (!formExplanation.trim()) {
      setFormError('Editorial Dossier Explanation is required.');
      setFormLoading(false);
      return;
    }

    const payload = {
      editionDate: formEditionDate,
      category: formCategory,
      categorySlug: formCategorySlug,
      question: formQuestion.trim(),
      options: cleanedOptions,
      correctIndex: formCorrectIndex,
      explanation: formExplanation.trim(),
      keyTerm: formKeyTerm.trim(),
      orderNum: Number(formOrderNum),
      isActive: formIsActive,
      audienceVotes: [70, 10, 10, 10],
    };

    try {
      const url = editingQuestion ? `/api/admin/quiz/${editingQuestion.id}` : '/api/admin/quiz';
      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save quiz question');
      }

      setActionSuccess(editingQuestion ? 'Quiz question updated successfully!' : 'Quiz question created successfully!');
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error saving question');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Toggle Active ──────────────────────────────────────────────────────────
  const handleToggle = async (q: QuizQuestion) => {
    try {
      const res = await fetch(`/api/admin/quiz/${q.id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Toggle failed');
      setActionSuccess(`Question #${q.id} status updated.`);
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, isActive: !item.isActive } : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  };

  // ── Delete Question ────────────────────────────────────────────────────────
  const handleDelete = (q: QuizQuestion) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Question #${q.id}`,
      message: `Are you sure you want to permanently delete this quiz question: "${q.question.slice(0, 80)}..."? This action cannot be undone.`,
      confirmText: 'Delete Question',
      cancelText: 'Cancel',
      intent: 'danger',
      onConfirm: async () => {
        setConfirmDialog((prev) => (prev ? { ...prev, isLoading: true } : null));
        try {
          const res = await fetch(`/api/admin/quiz/${q.id}`, { method: 'DELETE' });
          const data = await res.json();
          if (!res.ok || !data.ok) throw new Error(data.error || 'Delete failed');
          setActionSuccess(`Question #${q.id} deleted permanently.`);
          setQuestions((prev) => prev.filter((item) => item.id !== q.id));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Delete failed');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // ── Seed Defaults ──────────────────────────────────────────────────────────
  const handleSeedDefaults = async () => {
    setConfirmDialog({
      isOpen: true,
      title: "Seed Today's Default 5-Question Challenge",
      message:
        'This will create standard high-engagement 5-question daily challenge items for today. Would you like to proceed?',
      confirmText: 'Seed Now',
      cancelText: 'Cancel',
      intent: 'primary',
      onConfirm: async () => {
        setConfirmDialog((prev) => (prev ? { ...prev, isLoading: true } : null));
        try {
          const res = await fetch('/api/admin/quiz/seed-defaults', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: selectedDate || new Date().toISOString().slice(0, 10) }),
          });
          const data = await res.json();
          if (!res.ok || !data.ok) throw new Error(data.error || 'Seed failed');
          setActionSuccess('Default questions seeded successfully!');
          fetchQuestions();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Seed failed');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // ── Metrics Calculations ───────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const total = questions.length;
    const active = questions.filter((q) => q.isActive).length;
    const categories = new Set(questions.map((q) => q.category)).size;
    const dates = new Set(questions.map((q) => q.editionDate)).size;
    return { total, active, categories, dates };
  }, [questions]);

  // ── Filtered Questions ─────────────────────────────────────────────────────
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return questions;
    return questions.filter((q) => q.category === selectedCategory || q.categorySlug === selectedCategory);
  }, [questions, selectedCategory]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#060910] text-slate-100">
      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Full-Width Content View */}
      <div className="flex flex-1 flex-col overflow-y-auto w-full min-w-0">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800/90 bg-[#090d16]/95 px-4 sm:px-6 lg:px-8 2xl:px-10 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 lg:hidden hover:bg-slate-700 transition"
              title="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs">
                <Trophy size={20} />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Daily Quiz Arena Console</span>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE ENGINE
                  </span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Curate, schedule, and dynamically publish 5-question intelligence sprints.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-xl border border-slate-700/80 bg-slate-900/90 p-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === 'table' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <TableIcon size={13} />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === 'cards' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Cards View"
              >
                <LayoutGrid size={13} />
                <span>Cards</span>
              </button>
            </div>

            <button
              type="button"
              onClick={fetchQuestions}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleSeedDefaults}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition active:scale-95 shadow-2xs"
            >
              <Sparkles size={14} />
              <span className="hidden md:inline">Seed Defaults</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-xs font-black text-white shadow-xs hover:from-teal-500 hover:to-emerald-500 transition active:scale-95 ring-2 ring-teal-500/20"
            >
              <Plus size={15} />
              <span>New Question</span>
            </button>
          </div>
        </header>

        {/* Alerts & Notifications */}
        {actionSuccess && (
          <div className="mx-4 mt-3 sm:mx-6 lg:mx-8 2xl:mx-10 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/60 px-4 py-3 text-xs font-bold text-emerald-300 shadow-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-400 hover:text-emerald-200"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {error && (
          <div className="mx-4 mt-3 sm:mx-6 lg:mx-8 2xl:mx-10 flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-950/60 px-4 py-3 text-xs font-bold text-rose-300 shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Main Content Body - Full Width Optimized */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 2xl:px-10 py-5 space-y-5">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#0c121e] to-[#090d16] p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Questions</span>
                <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <HelpCircle size={15} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{metrics.total}</div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium">In database archive</div>
            </div>

            <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#0c121e] to-[#090d16] p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Active Live</span>
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{metrics.active}</div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium">Visible to players</div>
            </div>

            <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#0c121e] to-[#090d16] p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">Desks Tested</span>
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Target size={15} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{metrics.categories}</div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium">Categories covered</div>
            </div>

            <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#0c121e] to-[#090d16] p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">Editions</span>
                <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Calendar size={15} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">{metrics.dates}</div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium">Scheduled daily sets</div>
            </div>
          </div>

          {/* Filter & Desk Category Ribbon */}
          <div className="space-y-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = selectedCategory === (cat.slug === 'all' ? 'all' : cat.label);
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug === 'all' ? 'all' : cat.label)}
                    className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-400/40 font-black'
                        : 'border border-slate-800 bg-[#0c121e] text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-3xl border border-slate-800/90 bg-[#0c121e] p-3.5 shadow-xs">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions, categories, answers, or key terms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Date Filter & Status */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-2xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-mono font-bold text-white focus:border-teal-500 focus:outline-none"
                    title="Filter by Edition Date"
                  />
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate('')}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition"
                    >
                      Clear Date
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayStr)}
                    className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition ${
                      selectedDate === todayStr
                        ? 'bg-cyan-600 text-white'
                        : 'border border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center rounded-2xl border border-slate-700/80 bg-slate-900/90 p-1">
                  {(['all', 'active', 'inactive'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-xl px-3 py-1 text-[11px] font-black uppercase transition ${
                        statusFilter === s
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Questions Container: Table View or Cards View */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3 rounded-3xl border border-slate-800 bg-[#090d16]">
              <Loader2 size={32} className="animate-spin text-teal-500" />
              <span className="text-sm font-bold">Loading quiz dataset...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-24 text-center text-slate-400 space-y-4 rounded-3xl border border-slate-800 bg-[#090d16]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800 text-slate-500">
                <HelpCircle size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-white">No quiz questions found matching criteria.</p>
                <p className="text-xs text-slate-400">Try clearing filters or seed default challenge questions.</p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-500"
                >
                  <Plus size={14} />
                  <span>Create Question</span>
                </button>
                <button
                  type="button"
                  onClick={handleSeedDefaults}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
                >
                  <Sparkles size={14} />
                  <span>Seed Today&apos;s 5</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            /* ── FULL-WIDTH DENSE TABLE VIEW ────────────────────────────── */
            <div className="w-full rounded-3xl border border-slate-800/90 bg-[#090d16] overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead className="border-b border-slate-800 bg-slate-900/80 text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-4 w-16 text-center">#</th>
                      <th className="px-5 py-4 min-w-[320px]">Category & Question</th>
                      <th className="px-5 py-4 min-w-[320px]">Options & Answer Matrix</th>
                      <th className="px-5 py-4 min-w-[140px]">Edition Date</th>
                      <th className="px-5 py-4 min-w-[100px] text-center">Status</th>
                      <th className="px-5 py-4 min-w-[120px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-800/40 transition-colors group">
                        {/* Order Capsule */}
                        <td className="px-5 py-4 align-top text-center">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-800 text-xs font-black text-amber-400 border border-slate-700 shadow-2xs">
                            Q{q.orderNum || 1}
                          </span>
                        </td>

                        {/* Category & Question Context */}
                        <td className="px-5 py-4 align-top space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[10.5px] font-black uppercase tracking-wider text-teal-300">
                              {q.category}
                            </span>
                            {q.keyTerm && (
                              <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                                🔑 {q.keyTerm}
                              </span>
                            )}
                          </div>
                          <p className="font-black text-sm text-white leading-snug">
                            {q.question}
                          </p>
                          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-[11px] text-slate-400 leading-relaxed">
                            <strong className="text-teal-400 font-bold uppercase text-[9.5px] block mb-0.5">Dossier Context:</strong>
                            {q.explanation}
                          </div>
                        </td>

                        {/* 4 Options Matrix */}
                        <td className="px-5 py-4 align-top space-y-1.5">
                          {q.options?.map((opt, idx) => {
                            const isCorrect = idx === q.correctIndex;
                            return (
                              <div
                                key={idx}
                                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium border transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 font-bold shadow-xs'
                                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                                }`}
                              >
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="truncate leading-tight">{opt}</span>
                                {isCorrect && (
                                  <span className="ml-auto inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-black text-emerald-300 uppercase shrink-0">
                                    <Check size={10} className="stroke-[3]" />
                                    Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </td>

                        {/* Edition Date Badge */}
                        <td className="px-5 py-4 align-top whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-1.5 text-xs font-mono font-bold text-slate-200">
                              <Calendar size={12} className="text-cyan-400" />
                              <span>{q.editionDate || 'Standard'}</span>
                            </span>
                            {q.editionDate === todayStr && (
                              <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-wider pl-1">
                                • TODAY&apos;S EDITION
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-5 py-4 align-top text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggle(q)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase transition-all active:scale-95 ${
                              q.isActive
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {q.isActive ? (
                              <>
                                <Eye size={12} className="text-emerald-400" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff size={12} className="text-slate-400" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(q)}
                              className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-teal-600 hover:text-white transition active:scale-95 shadow-2xs"
                              title="Edit Question"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(q)}
                              className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-rose-400 hover:bg-rose-600 hover:text-white transition active:scale-95 shadow-2xs"
                              title="Delete Question"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ── FULL-WIDTH CARDS GRID VIEW ──────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-3xl border border-slate-800 bg-[#0c121e] p-5 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-2.5">
                    {/* Header: Order, Category, Date, Status */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-xs font-black text-amber-400 border border-amber-500/30">
                          Q{q.orderNum || 1}
                        </span>
                        <span className="rounded-md border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-teal-300 truncate max-w-[150px]">
                          {q.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle(q)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                          q.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {q.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-sm font-black text-white leading-snug">
                      {q.question}
                    </h3>

                    {/* Options */}
                    <div className="space-y-1.5 pt-1">
                      {q.options?.map((opt, idx) => {
                        const isCorrect = idx === q.correctIndex;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium border ${
                              isCorrect
                                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 font-bold'
                                : 'bg-slate-900/70 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="font-mono text-[10px] uppercase">{String.fromCharCode(65 + idx)}:</span>
                            <span className="truncate">{opt}</span>
                            {isCorrect && <Check size={11} className="ml-auto text-emerald-400 stroke-[3]" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Bottom: Date & Action buttons */}
                  <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
                    <span className="font-mono text-[11px]">{q.editionDate || 'Standard'}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(q)}
                        className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-teal-600 hover:text-white transition"
                        title="Edit Question"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(q)}
                        className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-rose-400 hover:bg-rose-600 hover:text-white transition"
                        title="Delete Question"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── FULL-WIDTH CREATE / EDIT MODAL ────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-700 bg-[#0b101c] p-6 sm:p-8 text-white shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Trophy size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {editingQuestion ? `Edit Quiz Question #${editingQuestion.id}` : 'Create Dynamic Quiz Question'}
                  </h2>
                  <p className="text-xs text-slate-400">Configure question prompt, 4 choices, and verified answer.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error in modal */}
            {formError && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-xs font-bold text-rose-300 flex items-center gap-2.5">
                <AlertCircle size={17} className="shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Row 1: Edition Date, Order #, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Edition Date</label>
                  <input
                    type="date"
                    required
                    value={formEditionDate}
                    onChange={(e) => setFormEditionDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Order in Challenge (1-5)</label>
                  <select
                    value={formOrderNum}
                    onChange={(e) => setFormOrderNum(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white focus:border-teal-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        Question #{num} of 5
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">News Desk Category</label>
                  <select
                    value={formCategory}
                    onChange={handleCategorySelect}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white focus:border-teal-500 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.filter((c) => c.slug !== 'all').map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Question Prompt</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Which global treaty or framework was recently highlighted by international trade ministries...?"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* 4 Options with Correct Answer Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300">
                    4 Multiple Choice Options (Select radio for Correct Answer)
                  </label>
                  <span className="text-xs font-black text-emerald-400">
                    Correct Option: {String.fromCharCode(65 + formCorrectIndex)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {formOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 rounded-2xl border p-2.5 transition-all ${
                        formCorrectIndex === idx
                          ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctOption"
                        id={`opt_${idx}`}
                        checked={formCorrectIndex === idx}
                        onChange={() => setFormCorrectIndex(idx)}
                        className="h-4 w-4 accent-emerald-500 cursor-pointer"
                      />
                      <label
                        htmlFor={`opt_${idx}`}
                        className="font-mono text-xs font-black text-slate-400 w-5 cursor-pointer"
                      >
                        {String.fromCharCode(65 + idx)}:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dossier Explanation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Newsroom Dossier Explanation (Verified Context)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Provide background analytical context on why this answer is correct..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Row 3: Key Term & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Key Term Tag (e.g. DEPA Accord)</label>
                  <input
                    type="text"
                    placeholder="e.g. DEPA Digital Trade Accord"
                    value={formKeyTerm}
                    onChange={(e) => setFormKeyTerm(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="h-4 w-4 rounded accent-teal-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-200">Active & Published in Arena</span>
                  </label>
                </div>
              </div>

              {/* Modal Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-2.5 text-xs font-black text-white shadow-xs hover:from-teal-500 hover:to-emerald-500 transition active:scale-95 disabled:opacity-50"
                >
                  {formLoading && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingQuestion ? 'Update Question' : 'Publish Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && <AdminConfirmModal dialog={confirmDialog} onClose={() => setConfirmDialog(null)} />}
    </div>
  );
}
