'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Share2,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Radio,
  RefreshCw,
  Loader2,
  ExternalLink,
  Search,
  Filter,
  Image as ImageIcon,
  Layers,
  Flame,
  Globe2,
  Menu,
} from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { SocialPublishModal } from '@/components/SocialPublishModal';
import type { SocialArticleInput } from '@/lib/social-copy';
import { categoryLabel } from '@/lib/category-theme';

interface ArticleItem {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  key_takeaways?: string | null;
  image_url?: string | null;
  category: string;
  status: string;
  source_name?: string | null;
  published_at?: string | null;
  view_count?: number;
}

interface SocialChannelStatus {
  connected: boolean;
  name: string;
  method: string;
}

interface SocialLog {
  id: number;
  articleId: number | string;
  title: string;
  channels: string[];
  timestamp: string;
  status: string;
}

export default function AdminSocialPage() {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Channels status & logs
  const [channels, setChannels] = useState<Record<string, SocialChannelStatus>>({});
  const [logs, setLogs] = useState<SocialLog[]>([]);

  // Selected article for Social Publishing Modal
  const [selectedArticle, setSelectedArticle] = useState<SocialArticleInput | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchArticlesAndStatus = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch published articles for social conversion
      const artRes = await fetch('/api/admin/articles?status=published&limit=30');
      if (artRes.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (artRes.ok) {
        const artData = await artRes.json();
        setArticles(artData.articles || artData.data || []);
      }

      // 2. Fetch social accounts telemetry
      const socRes = await fetch('/api/admin/social/status');
      if (socRes.ok) {
        const socData = await socRes.json();
        if (socData.channels) setChannels(socData.channels);
        if (socData.logs) setLogs(socData.logs);
      }
    } catch {
      showToast('error', 'Failed to load articles for social desk.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchArticlesAndStatus();
  }, [fetchArticlesAndStatus]);

  const handleOpenPublishModal = (art: ArticleItem) => {
    setSelectedArticle({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      body: art.body,
      key_takeaways: art.key_takeaways,
      category: art.category,
      image_url: art.image_url,
      source_name: art.source_name,
    });
    setModalOpen(true);
  };

  const filteredArticles = articles.filter((art) => {
    const matchesCat = categoryFilter === 'all' || (art.category || '').toLowerCase() === categoryFilter.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (art.title || '').toLowerCase().includes(q) || (art.excerpt || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex h-full w-full flex-1 min-w-0 overflow-hidden bg-[#070b14] font-sans text-slate-100 antialiased">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Container */}
      <main className="flex flex-1 min-w-0 w-full flex-col overflow-y-auto bg-[#070b14]">
        {/* Top Header */}
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
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Social Media Automation Hub</h1>
                  <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20">
                    Multi-Channel
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Auto-format sized images & tailored captions for LinkedIn, Instagram, Facebook, and X
                </p>
              </div>
            </div>

            <button
              onClick={fetchArticlesAndStatus}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-teal-500/40 hover:bg-slate-800 hover:text-white self-start sm:self-auto"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-teal-400' : ''} />
              Refresh Feed
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 space-y-6 p-4 sm:p-6 w-full min-w-0">
          {/* Channel Integration Status Cards */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                id: 'linkedin',
                name: 'LinkedIn',
                desc: '1.91:1 Landscape & 1:1',
                active: true,
                badge: 'Active & Verified',
              },
              {
                id: 'instagram',
                name: 'Instagram',
                desc: '1:1 Square & 9:16 Story',
                active: true,
                badge: 'Studio Ready',
              },
              {
                id: 'facebook',
                name: 'Facebook',
                desc: '1200x630 Feed Cards',
                active: true,
                badge: 'Active & Verified',
              },
              {
                id: 'twitter',
                name: 'X (Twitter)',
                desc: '16:9 Summary Cards',
                active: true,
                badge: 'Active & Verified',
              },
            ].map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800/80 bg-[#0c1220]/90 p-4 shadow-lg backdrop-blur-md transition hover:border-teal-500/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{item.name}</span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{item.desc}</p>
                <span className="mt-3 inline-block rounded-md bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/20">
                  {item.badge}
                </span>
              </div>
            ))}
          </section>

          {/* Published Articles Available for Social Posting */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 shadow-xl backdrop-blur-md overflow-hidden">
            {/* Table Header & Search Filter */}
            <div className="border-b border-slate-800/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Select Published Story to Create Social Post</h3>
                <p className="text-xs text-slate-400">Click any article to open the Studio, customize image sizes, and approve</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-teal-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 outline-none transition focus:border-teal-500 capitalize"
                >
                  <option value="all">All Categories</option>
                  <option value="politics">Politics</option>
                  <option value="business">Business</option>
                  <option value="economy">Economy</option>
                  <option value="markets">Markets</option>
                  <option value="india">India</option>
                  <option value="world">World</option>
                  <option value="tech">Tech</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
            </div>

            {/* Articles List / Grid */}
            <div className="divide-y divide-slate-800/60">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Loader2 size={32} className="animate-spin text-teal-500" />
                  <p className="mt-3 text-xs font-medium">Loading stories...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Share2 size={32} className="mx-auto text-slate-600" />
                  <p className="text-sm font-semibold text-slate-300">No published articles found</p>
                  <p className="text-xs text-slate-500">Publish articles from the Review Queue first to create social posts.</p>
                </div>
              ) : (
                filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-800/30 group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {art.image_url ? (
                        <img
                          src={art.image_url}
                          alt={art.title}
                          className="h-16 w-20 shrink-0 rounded-xl object-cover border border-slate-700/60 shadow-sm"
                        />
                      ) : (
                        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-600 border border-slate-700/60">
                          <ImageIcon size={20} />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/20 capitalize">
                            {categoryLabel(art.category)}
                          </span>
                          {art.source_name && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              via {art.source_name}
                            </span>
                          )}
                        </div>

                        <h4 className="font-semibold text-white text-sm group-hover:text-teal-300 transition-colors line-clamp-1">
                          {art.title}
                        </h4>

                        {art.excerpt && (
                          <p className="text-xs text-slate-400 line-clamp-1">{art.excerpt}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenPublishModal(art)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-950/40 transition hover:from-teal-500 hover:to-emerald-500 active:scale-95 self-end sm:self-center"
                    >
                      <Share2 size={13} />
                      <span>Create & Publish Post</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Social Dispatch Activity Logs */}
          {logs.length > 0 && (
            <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-teal-400" />
                  <h3 className="text-sm font-bold text-white">Recent Social Publishing Dispatches</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{logs.length} logged</span>
              </div>

              <div className="space-y-2.5">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-white line-clamp-1">{log.title}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-500">Channels:</span>
                        {log.channels.map((ch) => (
                          <span
                            key={ch}
                            className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-semibold text-teal-300 capitalize border border-slate-700"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Social Publishing Studio Modal */}
        <SocialPublishModal
          isOpen={modalOpen}
          article={selectedArticle}
          onClose={() => setModalOpen(false)}
          onPostSuccess={(msg) => {
            showToast('success', msg);
            fetchArticlesAndStatus();
          }}
        />

        {/* Floating Toast Notification */}
        {feedback && (
          <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
            <div
              className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 ${
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
