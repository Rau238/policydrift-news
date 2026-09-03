'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Send,
  Users,
  CheckCircle2,
  Search,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { NewsletterBroadcastModal } from '@/components/NewsletterBroadcastModal';

interface Subscriber {
  id: number;
  email: string;
  name?: string | null;
  frequency: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export default function AdminNewsletterPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ subscribersCount: number; smtpConfigured: boolean } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(page), limit: '25', search });
      const res = await fetch(`/api/admin/newsletter/subscribers?${q}`);
      const data = await res.json();
      if (data.ok) {
        setSubscribers(data.subscribers || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      showToast('error', 'Failed to load subscribers.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/newsletter/stats');
      const data = await res.json();
      if (data.ok) {
        setStats(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchStats();
    fetchSubscribers();
  }, [fetchStats, fetchSubscribers]);

  return (
    <div className="flex h-full w-full flex-1 min-w-0 overflow-hidden bg-[#070b14] font-sans text-slate-100 antialiased">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <main className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-xl px-4 py-4 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white lg:hidden"
              >
                <Menu size={18} />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner">
                <Mail size={20} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Email Newsletter Hub</h1>
                  <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20">
                    Direct Subscribers
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Manage self-hosted newsletter subscriptions and broadcast verified news digests.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchStats();
                  fetchSubscribers();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin text-teal-400' : ''} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-teal-950/60 hover:from-teal-400 hover:to-emerald-500 transition active:scale-95"
              >
                <Send size={14} />
                <span>Broadcast Newsletter</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-6 max-w-7xl">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Active Subscribers</span>
                <Users size={18} className="text-teal-400" />
              </div>
              <p className="mt-2 text-2xl font-black text-white">{stats?.subscribersCount ?? total}</p>
              <p className="mt-1 text-[11px] text-slate-400">Stored in your secure MySQL database</p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Delivery Gateway</span>
                <ShieldCheck size={18} className="text-emerald-400" />
              </div>
              <p className="mt-2 text-base font-bold text-white">
                {stats?.smtpConfigured ? 'Custom SMTP Active' : 'Self-Hosted Standard'}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {stats?.smtpConfigured ? 'Live email transmission enabled' : 'Ready to configure custom SMTP host'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Format & Frequency</span>
                <Sparkles size={18} className="text-amber-400" />
              </div>
              <p className="mt-2 text-base font-bold text-white">Responsive HTML Digest</p>
              <p className="mt-1 text-[11px] text-slate-400">Automated top stories compilation</p>
            </div>
          </div>

          {/* Broadcast Action Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/40 bg-gradient-to-r from-teal-950/40 via-slate-900/90 to-slate-950 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="rounded bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                  Automated Intelligence Digest
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Ready to Send Today&apos;s Verified News Briefing?
              </h3>
              <p className="text-xs text-slate-300">
                Click below to compose your headline, review the top 5 stories automatically selected from your published feeds, and dispatch the digest to all email subscribers.
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-teal-950/60 hover:from-teal-400 hover:to-emerald-500 transition active:scale-95"
            >
              <Send size={15} />
              <span>Broadcast Newsletter Now</span>
            </button>
          </div>

          {/* Subscribers Table Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-800/80">
              <h2 className="text-sm font-bold text-white">Subscribers List ({total})</h2>

              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search subscriber email..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Email Address</th>
                    <th className="px-5 py-3">Frequency</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Subscribed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <Loader2 size={24} className="animate-spin text-teal-500 mx-auto" />
                        <p className="mt-2 text-xs">Loading subscribers...</p>
                      </td>
                    </tr>
                  ) : subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 space-y-2">
                        <Mail size={28} className="mx-auto text-slate-600" />
                        <p className="font-semibold text-slate-300">No subscribers found</p>
                        <p className="text-[11px] text-slate-500">
                          Readers can join using the newsletter signup box on your site.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-3.5 font-semibold text-white">{sub.email}</td>
                        <td className="px-5 py-3.5 capitalize text-slate-300">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold border border-slate-700">
                            {sub.frequency}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {sub.is_active ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/20">
                              <CheckCircle2 size={11} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                              Unsubscribed
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(sub.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-800/80 text-xs text-slate-400">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-800 text-white"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-800 text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Newsletter Broadcast Modal */}
        <NewsletterBroadcastModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={(msg) => {
            showToast('success', msg);
            fetchStats();
            fetchSubscribers();
          }}
        />

        {/* Feedback Toast */}
        {feedback && (
          <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
            <div
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border p-4 text-xs font-semibold shadow-2xl backdrop-blur-xl ${
                feedback.type === 'success'
                  ? 'border-emerald-500/40 bg-slate-900/95 text-emerald-300'
                  : 'border-rose-500/40 bg-slate-900/95 text-rose-300'
              }`}
            >
              <span>{feedback.message}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
