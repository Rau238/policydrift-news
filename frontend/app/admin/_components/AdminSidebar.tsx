'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
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
} from 'lucide-react';

interface AdminSidebarProps {
  onIngest?: () => void;
  ingestLoading?: boolean;
  ingestResult?: string | null;
  pendingCount?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  onIngest,
  ingestLoading,
  ingestResult,
  pendingCount,
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams?.get('status');
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingResult, setRankingResult] = useState<string | null>(null);

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
      icon: <LayoutDashboard size={18} />,
      badge: null,
    },
    {
      label: 'Articles',
      href: '/admin/dashboard?status=all',
      icon: <Newspaper size={18} />,
      badge: null,
    },
    {
      label: 'Review Queue',
      href: '/admin/dashboard?status=pending',
      icon: <Clock size={18} />,
      badge: pendingCount && pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      label: 'RSS Sources',
      href: '/admin/sources',
      icon: <Radio size={18} />,
      badge: null,
    },
    {
      label: 'System & Workers',
      href: '/admin/activity',
      icon: <Activity size={18} />,
      badge: null,
    },
  ];

  const sidebarContent = (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-slate-800/80 bg-[#090d16] text-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
        <Link
          href="/admin/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-500/20 ring-1 ring-teal-400/30 transition group-hover:scale-105">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">PolicyDrift</span>
              <span className="rounded bg-teal-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-teal-300 border border-teal-500/30">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Editorial & Pipeline Desk</p>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Management
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-teal-600/90 to-teal-700 text-white shadow-sm shadow-teal-900/40 ring-1 ring-teal-500/40'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
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
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick Actions
          </p>
          <div className="space-y-1.5">
            {onIngest && (
              <button
                onClick={onIngest}
                disabled={ingestLoading}
                className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-teal-500/40 hover:bg-slate-800/80 hover:text-teal-300 disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {ingestLoading ? (
                    <Loader2 size={14} className="animate-spin text-teal-400" />
                  ) : (
                    <RefreshCw size={14} className="text-teal-400" />
                  )}
                  <span>Ingest RSS Feeds</span>
                </span>
                <span className="text-[10px] text-slate-400">Run</span>
              </button>
            )}

            <button
              onClick={handleQuickRanking}
              disabled={rankingLoading}
              className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-amber-500/40 hover:bg-slate-800/80 hover:text-amber-300 disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {rankingLoading ? (
                  <Loader2 size={14} className="animate-spin text-amber-400" />
                ) : (
                  <Zap size={14} className="text-amber-400" />
                )}
                <span>Run Ranking Pass</span>
              </span>
              <span className="text-[10px] text-slate-400">Score</span>
            </button>

            {ingestResult && (
              <div className="rounded border border-teal-500/30 bg-teal-950/40 px-2.5 py-1.5 text-[11px] text-teal-300">
                {ingestResult}
              </div>
            )}
            {rankingResult && (
              <div className="rounded border border-amber-500/30 bg-amber-950/40 px-2.5 py-1.5 text-[11px] text-amber-300">
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
            className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/40 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <Layers size={14} />
              <span>View Public Portal</span>
            </span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="border-t border-slate-800/80 bg-[#060911] p-3 space-y-2">
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>API Online</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">v2.0</span>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-500/30 hover:bg-red-950/30 hover:text-red-300 disabled:opacity-50"
        >
          {loggingOut ? <Loader2 size={14} className="animate-spin text-red-400" /> : <LogOut size={14} />}
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:flex h-screen flex-shrink-0">
        {sidebarContent}
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
          <div className="relative z-10 flex h-full w-64 max-w-[80vw] shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
