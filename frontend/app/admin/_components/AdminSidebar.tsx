'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  Clock,
  Radio,
  Activity,
  RefreshCw,
  Zap,
  LogOut,
  Loader2,
  ExternalLink,
  Shield,
  Layers,
  X,
  Plus,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';
import { AdminConfirmModal, type ConfirmDialogState } from '@/components/AdminConfirmModal';

interface AdminSidebarProps {
  onIngest?: () => void;
  ingestLoading?: boolean;
  ingestResult?: string | null;
  pendingCount?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onPublishAllReview?: () => void;
  isPublishingReview?: boolean;
}

export function AdminSidebar({
  onIngest,
  ingestLoading,
  ingestResult,
  pendingCount,
  mobileOpen = false,
  onCloseMobile,
  onPublishAllReview,
  isPublishingReview,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams?.get('status');
  const router = useRouter();

  // Collapsed mini-sidebar state (desktop only)
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingResult, setRankingResult] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Load collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pd_admin_sidebar_collapsed');
      if (saved === 'true') setCollapsed(true);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pd_admin_sidebar_collapsed', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  function isItemActive(itemHref: string) {
    if (itemHref === '/admin/dashboard') {
      return pathname === '/admin/dashboard' && (!status || status === '');
    }
    if (itemHref === '/admin/dashboard?status=all') {
      return (
        pathname === '/admin/dashboard' &&
        (status === 'all' || (!!status && status !== 'pending'))
      );
    }
    if (itemHref === '/admin/dashboard?status=pending') {
      return pathname === '/admin/dashboard' && status === 'pending';
    }
    if (itemHref === '/admin/sources') {
      return pathname.startsWith('/admin/sources');
    }
    if (itemHref === '/admin/activity') {
      return pathname.startsWith('/admin/activity');
    }
    return pathname === itemHref;
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  }

  function confirmSignOut() {
    setConfirmDialog({
      isOpen: true,
      title: 'Sign Out of Admin Console',
      message:
        'Are you sure you want to end your administrative session? You will need your admin key to sign in again.',
      confirmText: 'Sign Out Now',
      cancelText: 'Stay Signed In',
      intent: 'warning',
      onConfirm: async () => {
        setConfirmDialog((prev) => (prev ? { ...prev, isLoading: true } : null));
        await handleLogout();
      },
    });
  }

  async function handleQuickRanking() {
    setRankingLoading(true);
    setRankingResult(null);
    try {
      const res = await fetch('/api/admin/ranking', { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; message?: string; ranked?: number };
      setRankingResult(data.message || `Ranked ${data.ranked || 0} articles`);
      setTimeout(() => setRankingResult(null), 4000);
    } catch {
      setRankingResult('Failed');
      setTimeout(() => setRankingResult(null), 3000);
    } finally {
      setRankingLoading(false);
    }
  }

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard size={20} />,
      badge: null,
    },
    {
      label: 'Articles',
      href: '/admin/dashboard?status=all',
      icon: <Newspaper size={20} />,
      badge: null,
    },
    {
      label: 'Review Queue',
      href: '/admin/dashboard?status=pending',
      icon: <Clock size={20} />,
      badge: pendingCount && pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      label: 'RSS Sources',
      href: '/admin/sources',
      icon: <Radio size={20} />,
      badge: null,
    },
    {
      label: 'System & Workers',
      href: '/admin/activity',
      icon: <Activity size={20} />,
      badge: null,
    },
  ];

  function renderSidebar(isMobile = false) {
    const isCollapsed = !isMobile && collapsed;

    return (
      <aside
        className={`flex h-full flex-shrink-0 flex-col border-r border-slate-800/80 bg-[#090d16] text-slate-200 transition-all duration-300 ease-in-out ${
          isMobile ? 'w-72 max-w-[85vw]' : isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`flex border-b border-slate-800/80 transition-all ${
            isCollapsed
              ? 'flex-col items-center justify-center gap-2.5 px-2 py-3.5'
              : 'items-center justify-between px-4 py-3.5'
          }`}
        >
          <Link
            href="/admin/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center gap-2.5 group min-w-0 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="PolicyDrift Admin"
          >
            {/* Official Website Brand Mark */}
            <BrandMark sizeClass={isCollapsed ? 'h-9 w-9' : 'h-8 w-8'} />
            {!isCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-white truncate">
                    PolicyDrift
                  </span>
                  <span className="rounded bg-teal-500/20 px-1.5 py-0.2 text-[9px] font-bold text-teal-300 border border-teal-500/30 shrink-0">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Editorial & Feed Desk</p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          {!isMobile && (
            <button
              type="button"
              onClick={toggleCollapsed}
              className={`hidden md:flex items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white ${
                isCollapsed
                  ? 'h-6 w-6 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-teal-300 hover:border-teal-500/50 hover:bg-slate-700 shadow-sm'
                  : 'h-7 w-7'
              }`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={16} />}
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6 custom-scrollbar">
          <div>
            {!isCollapsed && (
              <p className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Management
              </p>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex items-center rounded-xl p-2.5 text-sm font-medium transition-all ${
                      isCollapsed ? 'justify-center' : 'justify-between px-3'
                    } ${
                      active
                        ? 'bg-gradient-to-r from-teal-600/90 to-teal-700 text-white shadow-sm shadow-teal-900/40 ring-1 ring-teal-500/40'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <span
                        className={
                          active ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                        }
                      >
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {/* Badge */}
                    {item.badge !== null && (
                      <span
                        className={`font-bold tabular-nums ${
                          isCollapsed
                            ? 'absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] text-slate-950 font-black shadow-md'
                            : `rounded-full px-2 py-0.5 text-[11px] ${
                                item.badgeColor || 'bg-slate-800 text-slate-300'
                              }`
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions */}
          <div>
            {!isCollapsed && (
              <p className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Actions
              </p>
            )}
            <div className="space-y-1.5">
              <Link
                href="/admin/sources?action=new"
                onClick={onCloseMobile}
                title={isCollapsed ? 'Add RSS Source' : undefined}
                className={`flex items-center rounded-xl border border-teal-500/40 bg-gradient-to-r from-teal-950/60 to-emerald-950/60 p-2 text-xs font-bold text-teal-200 transition hover:border-teal-400 hover:bg-teal-900/60 hover:text-white shadow-sm ${
                  isCollapsed ? 'justify-center' : 'justify-between px-3'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Plus size={16} className="text-teal-400 shrink-0" />
                  {!isCollapsed && <span>Add RSS Source</span>}
                </span>
                {!isCollapsed && (
                  <span className="rounded bg-teal-500/20 px-1.5 py-0.2 text-[9px] font-bold text-teal-300">
                    NEW
                  </span>
                )}
              </Link>

              {pendingCount !== undefined && pendingCount > 0 && onPublishAllReview && (
                <button
                  onClick={onPublishAllReview}
                  disabled={isPublishingReview}
                  title={isCollapsed ? `Publish All (${pendingCount})` : undefined}
                  className={`flex w-full items-center rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/70 to-teal-950/70 p-2 text-xs font-bold text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-900/70 hover:text-white shadow-sm disabled:opacity-50 ${
                    isCollapsed ? 'justify-center' : 'justify-between px-3'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isPublishingReview ? (
                      <Loader2 size={16} className="animate-spin text-emerald-400 shrink-0" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    )}
                    {!isCollapsed && <span>Publish All Review</span>}
                  </span>
                  {!isCollapsed && (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )}

              {onIngest && (
                <button
                  onClick={onIngest}
                  disabled={ingestLoading}
                  title={isCollapsed ? 'Ingest RSS Feeds' : undefined}
                  className={`flex w-full items-center rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-xs font-medium text-slate-300 transition hover:border-teal-500/40 hover:bg-slate-800/80 hover:text-teal-300 disabled:opacity-50 ${
                    isCollapsed ? 'justify-center' : 'justify-between px-3'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {ingestLoading ? (
                      <Loader2 size={16} className="animate-spin text-teal-400 shrink-0" />
                    ) : (
                      <RefreshCw size={16} className="text-teal-400 shrink-0" />
                    )}
                    {!isCollapsed && <span>Ingest Feeds</span>}
                  </span>
                  {!isCollapsed && <span className="text-[10px] text-slate-400">Run</span>}
                </button>
              )}

              <button
                onClick={handleQuickRanking}
                disabled={rankingLoading}
                title={isCollapsed ? 'Run Ranking Pass' : undefined}
                className={`flex w-full items-center rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-xs font-medium text-slate-300 transition hover:border-amber-500/40 hover:bg-slate-800/80 hover:text-amber-300 disabled:opacity-50 ${
                  isCollapsed ? 'justify-center' : 'justify-between px-3'
                }`}
              >
                <span className="flex items-center gap-2">
                  {rankingLoading ? (
                    <Loader2 size={16} className="animate-spin text-amber-400 shrink-0" />
                  ) : (
                    <Zap size={16} className="text-amber-400 shrink-0" />
                  )}
                  {!isCollapsed && <span>Run Ranking</span>}
                </span>
                {!isCollapsed && <span className="text-[10px] text-slate-400">Score</span>}
              </button>

              {!isCollapsed && ingestResult && (
                <div className="rounded-lg border border-teal-500/30 bg-teal-950/40 px-2.5 py-1.5 text-[11px] text-teal-300">
                  {ingestResult}
                </div>
              )}
              {!isCollapsed && rankingResult && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-950/40 px-2.5 py-1.5 text-[11px] text-amber-300">
                  {rankingResult}
                </div>
              )}
            </div>
          </div>

          {/* Public Site Link */}
          <div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title={isCollapsed ? 'View Public Portal' : undefined}
              className={`flex items-center rounded-xl border border-slate-800/60 bg-slate-900/40 p-2 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 ${
                isCollapsed ? 'justify-center' : 'justify-between px-3'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers size={16} className="shrink-0" />
                {!isCollapsed && <span>Public Portal</span>}
              </span>
              {!isCollapsed && <ExternalLink size={12} />}
            </a>
          </div>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="border-t border-slate-800/80 bg-[#060911] p-2.5 space-y-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span>API Online</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">v2.0</span>
            </div>
          )}

          <button
            type="button"
            onClick={confirmSignOut}
            disabled={loggingOut}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`flex w-full items-center rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs font-semibold text-slate-300 transition hover:border-red-500/40 hover:bg-red-950/40 hover:text-red-300 active:scale-95 disabled:opacity-50 ${
              isCollapsed ? 'justify-center' : 'justify-center gap-2'
            }`}
          >
            {loggingOut ? (
              <Loader2 size={16} className="animate-spin text-red-400 shrink-0" />
            ) : (
              <LogOut size={16} className="shrink-0" />
            )}
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Sign Out Confirmation Modal */}
        <AdminConfirmModal
          dialog={confirmDialog}
          onClose={() => setConfirmDialog(null)}
        />
      </aside>
    );
  }

  return (
    <>
      {/* Desktop Fixed Collapsible Sidebar */}
      <div className="hidden md:flex h-screen flex-shrink-0">
        {renderSidebar(false)}
      </div>

      {/* Mobile Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-out Sidebar */}
          <div className="relative z-10 flex h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {renderSidebar(true)}
          </div>
        </div>
      )}
    </>
  );
}
