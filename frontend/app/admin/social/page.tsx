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
  Bell,
  Settings2,
  History,
  Trash2,
  AlertTriangle,
  Key,
  ShieldCheck,
  Check,
  X,
  Eye,
  ArrowRight,
  Info,
} from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import {
  SocialPublishModal,
  TelegramIcon,
  WhatsAppIcon,
  LinkedInIcon,
  XIcon,
  FacebookIcon,
  InstagramIcon,
} from '@/components/SocialPublishModal';
import { PushBroadcastModal } from '@/components/PushBroadcastModal';
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
  configured?: boolean;
  name: string;
  method: string;
  tokenMasked?: string;
  chatId?: string;
  webhookUrl?: string;
}

interface SocialLogItem {
  id: number;
  articleId?: number | string;
  title: string;
  slug?: string;
  category?: string;
  channels: string[];
  captions?: Record<string, string>;
  imageUrl?: string;
  status: 'success' | 'failed' | 'partial';
  results?: Record<string, any>;
  createdAt?: string;
  timestamp?: string;
}

export default function AdminSocialPage() {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Tabs: 'stories' | 'history' | 'settings'
  const [activeTab, setActiveTab] = useState<'stories' | 'history' | 'settings'>('stories');

  // Articles state
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Channels status & logs state
  const [channels, setChannels] = useState<Record<string, SocialChannelStatus>>({});
  const [logs, setLogs] = useState<SocialLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<SocialLogItem | null>(null);

  // Modals
  const [selectedArticle, setSelectedArticle] = useState<SocialArticleInput | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pushArticle, setPushArticle] = useState<ArticleItem | null>(null);

  // Channel Settings Editing State
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [configCredentials, setConfigCredentials] = useState({
    telegramBotToken: '',
    telegramChatId: '',
    whatsappWebhookUrl: '',
    whatsappApiToken: '',
    whatsappPhoneId: '',
    whatsappRecipient: '',
    socialWebhookUrl: '',
    twitterApiKey: '',
    linkedinAccessToken: '',
    metaAccessToken: '',
  });

  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ channel: string; ok: boolean; message: string } | null>(null);

  // Toast feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const fetchArticlesAndStatus = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch published articles
      const artRes = await fetch('/api/admin/articles?status=published&limit=30');
      if (artRes.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (artRes.ok) {
        const artData = await artRes.json();
        setArticles(artData.posts || artData.articles || artData.data || []);
      }

      // 2. Fetch social accounts telemetry
      const socRes = await fetch('/api/admin/social/status');
      if (socRes.ok) {
        const socData = await socRes.json();
        if (socData.channels) {
          setChannels(socData.channels);
        }
        if (socData.config) {
          setConfigCredentials({
            telegramBotToken: socData.config.telegramBotToken || '',
            telegramChatId: socData.config.telegramChatId || '-1004347892038',
            whatsappWebhookUrl: socData.config.whatsappWebhookUrl || '',
            whatsappApiToken: socData.config.whatsappApiToken || '',
            whatsappPhoneId: socData.config.whatsappPhoneId || '',
            whatsappRecipient: socData.config.whatsappRecipient || '',
            socialWebhookUrl: socData.config.socialWebhookUrl || '',
            linkedinAccessToken: socData.config.linkedinAccessToken || '',
            twitterApiKey: socData.config.twitterApiKey || '',
            metaAccessToken: socData.config.metaAccessToken || '',
          });
        }
        if (socData.logs) setLogs(socData.logs);
      }
    } catch {
      showToast('error', 'Failed to load social desk telemetry.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/admin/social/logs?limit=50');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
      }
    } catch {
      // ignore
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticlesAndStatus();
  }, [fetchArticlesAndStatus]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchLogs();
    }
  }, [activeTab, fetchLogs]);

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

  const handleRebroadcastFromLog = (log: SocialLogItem) => {
    setSelectedArticle({
      id: log.articleId || 0,
      title: log.title,
      slug: log.slug || `article-${log.articleId || Date.now()}`,
      category: log.category || 'news',
      image_url: log.imageUrl || '',
    });
    setSelectedLogForDetail(null);
    setModalOpen(true);
  };

  const handleDeleteLog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dispatch log?')) return;
    try {
      const res = await fetch(`/api/admin/social/logs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
        showToast('success', 'Log removed successfully.');
      }
    } catch {
      showToast('error', 'Failed to delete log.');
    }
  };

  const handleClearAllLogs = async () => {
    if (!confirm('Are you sure you want to clear all dispatch logs? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/social/logs', { method: 'DELETE' });
      if (res.ok) {
        setLogs([]);
        showToast('success', 'All social logs cleared.');
      }
    } catch {
      showToast('error', 'Failed to clear logs.');
    }
  };

  const handleTestConnection = async (channelName: string, credentialsOverride?: any) => {
    setTestingChannel(channelName);
    setTestFeedback(null);
    try {
      const creds: Record<string, any> = credentialsOverride ? { ...credentialsOverride } : {};
      if (!credentialsOverride) {
        if (channelName === 'telegram') {
          if (configCredentials.telegramBotToken) creds.token = configCredentials.telegramBotToken;
          if (configCredentials.telegramChatId) creds.chatId = configCredentials.telegramChatId;
        } else if (channelName === 'whatsapp') {
          if (configCredentials.whatsappWebhookUrl) creds.webhookUrl = configCredentials.whatsappWebhookUrl;
        } else if (channelName === 'webhook') {
          if (configCredentials.socialWebhookUrl) creds.webhookUrl = configCredentials.socialWebhookUrl;
        } else if (channelName === 'linkedin') {
          if (configCredentials.linkedinAccessToken) creds.token = configCredentials.linkedinAccessToken;
        } else if (channelName === 'twitter') {
          if (configCredentials.twitterApiKey) creds.apiKey = configCredentials.twitterApiKey;
        } else if (channelName === 'facebook' || channelName === 'instagram') {
          if (configCredentials.metaAccessToken) creds.token = configCredentials.metaAccessToken;
        }
      }

      const res = await fetch('/api/admin/social/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: channelName, credentials: creds }),
      });

      const data = await res.json();
      setTestFeedback({
        channel: channelName,
        ok: Boolean(data.ok),
        message: data.message || (data.ok ? 'Connection verified!' : 'Connection test failed.'),
      });
    } catch (err: any) {
      setTestFeedback({
        channel: channelName,
        ok: false,
        message: err.message || 'Network error reaching test server.',
      });
    } finally {
      setTestingChannel(null);
    }
  };

  const handleSaveCredentials = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/social/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials: configCredentials }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        if (data.channels) setChannels(data.channels);
        showToast('success', 'Channel credentials updated and saved to .env!');
        setEditingChannel(null);
      } else {
        showToast('error', data.error || 'Failed to save credentials.');
      }
    } catch {
      showToast('error', 'Network error saving settings.');
    } finally {
      setSavingSettings(false);
    }
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
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Social & Messaging Hub</h1>
                  <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20">
                    Automated & Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Direct Telegram Bots, WhatsApp Channels, LinkedIn, X, and Meta Studio
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchArticlesAndStatus}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-teal-500/40 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin text-teal-400' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-4 flex items-center gap-2 border-t border-slate-800/60 pt-3">
            {[
              { id: 'stories', label: '1. Select Story to Broadcast', icon: Share2, count: articles.length },
              { id: 'history', label: '2. Persistent History & Logs', icon: History, count: logs.length },
              { id: 'settings', label: '3. Channels & API Keys Manager', icon: Settings2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${active
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20 ring-1 ring-teal-400/30'
                      : 'border border-slate-800/80 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`rounded-md px-1.5 py-0.2 text-[10px] font-mono ${active ? 'bg-teal-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 space-y-6 p-4 sm:p-6 w-full min-w-0">
          {/* Channel Integration Status Overview Strip (Only on Stories & History tabs to avoid duplicate rows) */}
          {activeTab !== 'settings' && (
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                {
                  id: 'telegram',
                  name: 'Telegram',
                  desc: channels.telegram?.chatId ? `Channel: ${channels.telegram.chatId}` : 'Direct Bot API',
                  connected: Boolean(channels.telegram?.connected),
                  badge: channels.telegram?.connected ? 'Connected' : 'Not Connected',
                  icon: <TelegramIcon className="w-4 h-4 text-sky-400" />,
                },
                {
                  id: 'whatsapp',
                  name: 'WhatsApp',
                  desc: channels.whatsapp?.connected ? 'Automated Webhook' : '1-Click Share Ready',
                  connected: Boolean(channels.whatsapp?.connected),
                  isReady: true,
                  badge: channels.whatsapp?.connected ? 'Connected' : '1-Click Ready',
                  icon: <WhatsAppIcon className="w-4 h-4 text-emerald-400" />,
                },
                {
                  id: 'linkedin',
                  name: 'LinkedIn',
                  desc: 'Company Page',
                  connected: Boolean(channels.linkedin?.connected),
                  badge: channels.linkedin?.connected ? 'Connected' : 'Not Connected',
                  icon: <LinkedInIcon className="w-4 h-4 text-blue-400" />,
                },
                {
                  id: 'twitter',
                  name: 'X (Twitter)',
                  desc: 'Broadcast & Cards',
                  connected: Boolean(channels.twitter?.connected),
                  badge: channels.twitter?.connected ? 'Connected' : 'Not Connected',
                  icon: <XIcon className="w-3.5 h-3.5 text-white" />,
                },
                {
                  id: 'facebook',
                  name: 'Facebook',
                  desc: 'Page Feed Cards',
                  connected: Boolean(channels.facebook?.connected),
                  badge: channels.facebook?.connected ? 'Connected' : 'Not Connected',
                  icon: <FacebookIcon className="w-4 h-4 text-blue-500" />,
                },
                {
                  id: 'instagram',
                  name: 'Instagram',
                  desc: '1:1 & Story Cards',
                  connected: Boolean(channels.instagram?.connected),
                  badge: channels.instagram?.connected ? 'Connected' : 'Not Connected',
                  icon: <InstagramIcon className="w-4 h-4 text-pink-400" />,
                },
              ].map((item) => {
                const isConn = item.connected;
                const isRdy = item.isReady && !isConn;

                return (
                  <div
                    key={item.id}
                    className={`group relative rounded-xl border p-3.5 shadow-lg backdrop-blur-md transition cursor-pointer ${isConn
                        ? 'border-emerald-500/40 bg-[#0c181f]/90 hover:border-emerald-400'
                        : isRdy
                          ? 'border-teal-500/30 bg-[#0c1524]/90 hover:border-teal-400'
                          : 'border-rose-900/40 bg-[#160c14]/90 hover:border-rose-500/50'
                      }`}
                    onClick={() => {
                      setActiveTab('settings');
                      setEditingChannel(item.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-950/80 border border-slate-800 shrink-0">
                          {item.icon}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">{item.name}</span>
                      </div>
                      <span
                        className={`flex h-2.5 w-2.5 rounded-full ${isConn
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse'
                            : isRdy
                              ? 'bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.6)]'
                              : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                          }`}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400 truncate">{item.desc}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold border truncate max-w-full ${isConn
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isRdy
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                      >
                        <span className="text-[8px]">{isConn ? '●' : isRdy ? '⚡' : '○'}</span>
                        <span>{item.badge}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-teal-400 opacity-0 group-hover:opacity-100 transition">
                        Setup →
                      </span>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* TAB 1: Published Articles to Broadcast */}
          {activeTab === 'stories' && (
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

              {/* Articles List */}
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

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => setPushArticle(art)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3.5 py-2 text-xs font-bold text-amber-200 shadow-md transition hover:border-amber-400 hover:bg-amber-900/60 active:scale-95"
                          title="Broadcast Push Alert to Subscribers"
                        >
                          <Bell size={13} className="text-amber-400" />
                          <span>Push Alert</span>
                        </button>

                        <button
                          onClick={() => handleOpenPublishModal(art)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-teal-950/40 transition hover:from-teal-500 hover:to-emerald-500 active:scale-95"
                        >
                          <Share2 size={13} />
                          <span>Social Studio</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Persistent History & MySQL Logs */}
          {activeTab === 'history' && (
            <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 shadow-xl backdrop-blur-md overflow-hidden space-y-4">
              <div className="border-b border-slate-800/80 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <History size={16} className="text-teal-400" />
                    <span>Persistent Social Publishing History (MySQL)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Full log of every dispatched article, custom image card, and delivery status
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchLogs}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Refresh
                  </button>
                  {logs.length > 0 && (
                    <button
                      onClick={handleClearAllLogs}
                      className="rounded-lg border border-rose-900/60 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/60"
                    >
                      Clear All Logs
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-800/60">
                {logsLoading ? (
                  <div className="py-16 text-center text-slate-400">
                    <Loader2 size={28} className="animate-spin text-teal-400 mx-auto" />
                    <p className="mt-2 text-xs">Loading database records...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <History size={32} className="mx-auto text-slate-600" />
                    <p className="text-sm font-semibold text-slate-300">No dispatch history recorded yet</p>
                    <p className="text-xs text-slate-500">
                      When you approve stories from the Studio, their live records and preview cards will appear here.
                    </p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-800/30 transition"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {log.imageUrl ? (
                          <img
                            src={log.imageUrl}
                            alt={log.title}
                            className="h-14 w-20 shrink-0 rounded-xl object-cover border border-slate-700/60 shadow-sm"
                          />
                        ) : (
                          <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-600 border border-slate-700/60">
                            <ImageIcon size={18} />
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm line-clamp-1">{log.title}</h4>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.createdAt || log.timestamp || '').toLocaleString()}
                            </span>
                            <span className="text-slate-600">•</span>
                            {log.channels.map((ch) => (
                              <span
                                key={ch}
                                className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-teal-300 uppercase border border-slate-700"
                              >
                                {ch === 'telegram' ? '✈️ Telegram' : ch === 'whatsapp' ? '💬 WhatsApp' : ch}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${log.status === 'success'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : log.status === 'partial'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                        >
                          {log.status}
                        </span>

                        <button
                          onClick={() => handleRebroadcastFromLog(log)}
                          className="rounded-lg border border-teal-500/40 bg-teal-950/60 px-2.5 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-900/60 hover:text-white transition flex items-center gap-1.5"
                          title="Open in Studio to edit or re-broadcast"
                        >
                          <Share2 size={13} />
                          <span className="hidden md:inline">Open in Studio</span>
                        </button>

                        <button
                          onClick={() => setSelectedLogForDetail(log)}
                          className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
                          title="View Details & Card Preview"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-rose-400 hover:bg-rose-950/60 hover:text-rose-300"
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Channels & API Credentials Manager (Direct .env sync) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Help & Diagnostic Header */}
              <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900/90 to-[#0c1220]/90 p-5 shadow-xl backdrop-blur-md">
                <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 shrink-0 shadow-md">
                      <Key size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Channel Connection & Environment (.env) Manager</h3>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        Select a social media channel below to view its active connection status and configure multiple integration methods (Direct Bot API, Automation Webhooks, or 1-Click Instant Broadcast). Changes are automatically saved to backend <code className="text-teal-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono">.env</code> and activated in real time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={fetchArticlesAndStatus}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                    >
                      <RefreshCw size={13} className={loading ? 'animate-spin text-teal-400' : ''} />
                      <span>Re-check Telemetry</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Platform Selector Bar (Select ONE channel to configure at a time) */}
              <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-3 shadow-xl backdrop-blur-md">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Select Channel to Configure:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[
                    { id: 'telegram', label: 'Telegram', icon: '✈️', connected: Boolean(channels.telegram?.connected) },
                    { id: 'whatsapp', label: 'WhatsApp', icon: '💬', connected: Boolean(channels.whatsapp?.connected), isReady: true },
                    { id: 'linkedin', label: 'LinkedIn', icon: '💼', connected: Boolean(channels.linkedin?.connected) },
                    { id: 'twitter', label: 'X (Twitter)', icon: '🐦', connected: Boolean(channels.twitter?.connected) },
                    { id: 'facebook', label: 'Facebook', icon: '📘', connected: Boolean(channels.facebook?.connected) },
                    { id: 'instagram', label: 'Instagram', icon: '📸', connected: Boolean(channels.instagram?.connected) },
                    { id: 'webhook', label: 'Universal Webhook', icon: '⚡', connected: Boolean(channels.webhook?.connected) },
                  ].map((plat) => {
                    const isSelected = editingChannel === plat.id || (!editingChannel && plat.id === 'telegram');
                    const isConn = plat.connected;
                    const isRdy = plat.isReady && !isConn;

                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => {
                          setEditingChannel(plat.id);
                          setTestFeedback(null);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${isSelected
                            ? 'border-teal-400 bg-gradient-to-b from-teal-950/60 to-slate-900 shadow-lg shadow-teal-500/10 ring-2 ring-teal-500/30'
                            : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-700'
                          }`}
                      >
                        <span className="text-xl mb-1">{plat.icon}</span>
                        <span className={`text-xs font-bold truncate max-w-full ${isSelected ? 'text-teal-300' : 'text-slate-300'}`}>
                          {plat.label}
                        </span>
                        <span
                          className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[9px] font-bold border ${isConn
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isRdy
                                ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                        >
                          <span className="text-[7px]">{isConn ? '●' : isRdy ? '⚡' : '○'}</span>
                          <span>{isConn ? 'Connected' : isRdy ? '1-Click' : 'Offline'}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SINGLE SELECTED CHANNEL WORKSPACE WITH MULTIPLE CONNECTION METHODS */}
              {/* 1. TELEGRAM WORKSPACE */}
              {(!editingChannel || editingChannel === 'telegram') && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Status Banner */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 shadow-xl ${channels.telegram?.connected
                      ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0c1220]'
                      : 'border-rose-900/40 bg-gradient-to-r from-rose-950/30 via-slate-900 to-[#0c1220]'
                    }`}>
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
                        <TelegramIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">Telegram Channel Broadcast Hub</h4>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${channels.telegram?.connected
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                            <span>{channels.telegram?.connected ? '● Connected & Configured' : '○ Missing Token / Chat ID'}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Publish rich branded cards with HTML captions & one-click read buttons directly to your Telegram channel subscribers.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestConnection('telegram')}
                      disabled={testingChannel === 'telegram'}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-500/20 hover:bg-teal-500 disabled:opacity-50 shrink-0"
                    >
                      {testingChannel === 'telegram' ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                      <span>Test Telegram Connection</span>
                    </button>
                  </div>

                  {testFeedback && testFeedback.channel === 'telegram' && (
                    <div className={`rounded-xl border p-4 text-xs font-medium ${testFeedback.ok ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300' : 'border-rose-500/40 bg-rose-950/40 text-rose-300'}`}>
                      <p className="font-bold mb-1">{testFeedback.ok ? '✓ Test Passed Successfully' : '⚠ Connection Diagnostic Notice'}</p>
                      <p>{testFeedback.message}</p>
                    </div>
                  )}

                  {/* Multiple Ways to Connect Telegram */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Method 1: Official Bot API (Direct Automation) */}
                    <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-4 lg:col-span-2">
                      <div className="border-b border-slate-800/80 pb-3">
                        <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                          Way 1 • Direct Automation (Recommended)
                        </span>
                        <h5 className="font-bold text-white text-sm mt-1">Official Telegram Bot API</h5>
                        <p className="text-xs text-slate-400">Directly post news stories & photos to your channel via Telegram Bot token</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Telegram Bot Token (TELEGRAM_BOT_TOKEN)
                          </label>
                          <input
                            type="password"
                            placeholder="e.g. 8812419326:AAHq9BmIhYhi..."
                            value={configCredentials.telegramBotToken}
                            onChange={(e) => setConfigCredentials((p) => ({ ...p, telegramBotToken: e.target.value }))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-teal-500 font-mono"
                          />
                          {channels.telegram?.tokenMasked && (
                            <p className="mt-1 text-[10px] text-teal-400 font-mono">Active token in memory: {channels.telegram.tokenMasked}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Telegram Channel Username / Chat ID (TELEGRAM_CHAT_ID)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. @newsfree365 or -100123456789"
                            value={configCredentials.telegramChatId}
                            onChange={(e) => setConfigCredentials((p) => ({ ...p, telegramChatId: e.target.value }))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-teal-500 font-mono"
                          />
                          {channels.telegram?.chatId && (
                            <p className="mt-1 text-[10px] text-teal-400 font-mono">Active channel target: {channels.telegram.chatId}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleSaveCredentials}
                            disabled={savingSettings}
                            className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 disabled:opacity-50 shadow-md shadow-teal-500/20"
                          >
                            {savingSettings ? 'Saving to .env…' : 'Save Telegram Config to .env'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Method 2 & 3: Webhook & 1-Click Share */}
                    <div className="space-y-6">
                      {/* Method 2: Automation Webhook */}
                      <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-3">
                        <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                          Way 2 • Automation Webhook
                        </span>
                        <h5 className="font-bold text-white text-sm">Make.com / n8n / Zapier Scenario</h5>
                        <p className="text-xs text-slate-400">
                          Route Telegram posts through your universal webhook pipeline. Whenever you publish, the payload is delivered to your workflow.
                        </p>
                        <div className="rounded-xl bg-slate-900/60 p-2.5 border border-slate-800 text-[11px] text-slate-300 font-mono">
                          Webhook: {channels.webhook?.connected ? 'Connected' : 'Not configured'}
                        </div>
                      </div>

                      {/* Method 3: 1-Click Instant Share */}
                      <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-3">
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                          Way 3 • Zero Config (1-Click)
                        </span>
                        <h5 className="font-bold text-white text-sm">Direct Web / App Launcher</h5>
                        <p className="text-xs text-slate-400">
                          In the Social Studio for any story, click <b>&quot;Open in Telegram&quot;</b> to instantly launch Telegram with the news pre-formatted and ready to forward to any group or channel.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Telegram Setup Guide */}
                  <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-3">
                    <h5 className="font-bold text-white text-sm flex items-center gap-2">
                      <Info size={16} className="text-teal-400" />
                      <span>Telegram Bot 3-Step Setup Checklist</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
                        <p className="font-bold text-teal-300">Step 1: Get Token from @BotFather</p>
                        <p className="text-slate-400 leading-relaxed">
                          Open Telegram & chat with <code className="text-teal-300">@BotFather</code>. Send <code className="text-teal-300">/newbot</code>, choose a name (e.g. NewsFree365 Bot) and copy the API HTTP token.
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
                        <p className="font-bold text-teal-300">Step 2: Add Bot as Administrator</p>
                        <p className="text-slate-400 leading-relaxed">
                          In your channel <code className="text-teal-300">@newsfree365</code> &rarr; Channel Info &rarr; <b>Administrators</b> &rarr; <b>Add Administrator</b> &rarr; search <code className="text-teal-300">@NewsFree365Official_bot</code> &rarr; enable &quot;Post Messages&quot;.
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
                        <p className="font-bold text-teal-300">Step 3: Click Test Connection</p>
                        <p className="text-slate-400 leading-relaxed">
                          Enter your bot token and channel username above, click <b>Save to .env</b>, and click <b>Test Telegram Connection</b> to verify real-time status.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. WHATSAPP WORKSPACE */}
              {editingChannel === 'whatsapp' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0c1220] p-5 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                        <WhatsAppIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">WhatsApp Channels & Broadcast Hub</h4>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                            <span>● 1-Click Broadcast Ready</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Broadcast breaking news stories and formatted cards to WhatsApp Channels, Groups, or Communities.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestConnection('whatsapp')}
                      disabled={testingChannel === 'whatsapp'}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-500/20 hover:bg-teal-500 disabled:opacity-50 shrink-0"
                    >
                      {testingChannel === 'whatsapp' ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                      <span>Test WhatsApp Connection</span>
                    </button>
                  </div>

                  {testFeedback && testFeedback.channel === 'whatsapp' && (
                    <div className={`rounded-xl border p-4 text-xs font-medium ${testFeedback.ok ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300' : 'border-rose-500/40 bg-rose-950/40 text-rose-300'}`}>
                      <p className="font-bold mb-1">{testFeedback.ok ? '✓ Connection Verified' : '⚠ Notice'}</p>
                      <p>{testFeedback.message}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Method 1: 1-Click Broadcast (Active & Zero Config) */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-[#0c181f]/90 p-5 shadow-xl space-y-3">
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                        Way 1 • 1-Click Direct (Active)
                      </span>
                      <h5 className="font-bold text-white text-sm">Instant Desktop & Mobile Launcher</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        No API keys or meta business approvals needed! In any article&apos;s Studio, clicking <b>&quot;Open in WhatsApp&quot;</b> immediately launches WhatsApp Web or WhatsApp Mobile with pre-formatted markdown headings, key takeaways, and branded card link ready to broadcast.
                      </p>
                      <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
                        <Check size={14} />
                        <span>Ready to use across all stories right now</span>
                      </div>
                    </div>

                    {/* Method 2: Automated Webhook (Make.com, UltraMsg, Evolution API, n8n) */}
                    <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-4 lg:col-span-2">
                      <div className="border-b border-slate-800/80 pb-3">
                        <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                          Way 2 • Background Automated Webhook
                        </span>
                        <h5 className="font-bold text-white text-sm mt-1">Webhook Automation Gateway</h5>
                        <p className="text-xs text-slate-400">Connect Make.com, n8n, UltraMsg, or Evolution API to automatically publish to WhatsApp in the background</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            WhatsApp Webhook URL (WHATSAPP_WEBHOOK_URL)
                          </label>
                          <input
                            type="text"
                            placeholder="https://hook.make.com/... or https://api.ultramsg.com/..."
                            value={configCredentials.whatsappWebhookUrl}
                            onChange={(e) => setConfigCredentials((p) => ({ ...p, whatsappWebhookUrl: e.target.value }))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-teal-500 font-mono"
                          />
                          {channels.whatsapp?.webhookUrl && (
                            <p className="mt-1 text-[10px] text-teal-400 font-mono">Active Webhook: {channels.whatsapp.webhookUrl}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleSaveCredentials}
                            disabled={savingSettings}
                            className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 disabled:opacity-50 shadow-md shadow-teal-500/20"
                          >
                            {savingSettings ? 'Saving…' : 'Save WhatsApp Config to .env'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. LINKEDIN WORKSPACE */}
              {editingChannel === 'linkedin' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 shadow-xl ${channels.linkedin?.connected
                      ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0c1220]'
                      : 'border-slate-800/80 bg-[#0c1220]'
                    }`}>
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                        <LinkedInIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">LinkedIn Company Page & Personal Desk</h4>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${channels.linkedin?.connected
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-700 text-slate-300 border-slate-600'
                            }`}>
                            <span>{channels.linkedin?.connected ? '● Connected via Webhook / API' : '○ Ready for Setup'}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Publish executive policy briefings, sized landscape (1.91:1) cards, and news links directly to LinkedIn.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Method 1: Webhook via Make.com / Buffer / Zapier */}
                    <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-3">
                      <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                        Way 1 • Universal Webhook (Recommended)
                      </span>
                      <h5 className="font-bold text-white text-sm">Make.com / Buffer / Zapier Integration</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Route LinkedIn broadcasts through the Universal Webhook. The webhook automatically passes LinkedIn-tailored markdown copy, hashtags, and the CDN-hosted image card directly to your LinkedIn Company Page.
                      </p>
                      <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 text-xs text-slate-300">
                        Status: <span className="font-bold text-teal-300">{channels.webhook?.connected ? 'Active & Ready' : 'Configure in Universal Webhook tab'}</span>
                      </div>
                    </div>

                    {/* Method 2: Direct LinkedIn OAuth Token */}
                    <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-4">
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                        Way 2 • Direct Developer API
                      </span>
                      <h5 className="font-bold text-white text-sm">LinkedIn REST API Access Token</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            LinkedIn Access Token (LINKEDIN_ACCESS_TOKEN)
                          </label>
                          <input
                            type="password"
                            placeholder="AQV..."
                            value={configCredentials.linkedinAccessToken}
                            onChange={(e) => setConfigCredentials((p) => ({ ...p, linkedinAccessToken: e.target.value }))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-teal-500 font-mono"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveCredentials}
                            disabled={savingSettings}
                            className="rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-500 disabled:opacity-50"
                          >
                            Save to .env
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. X (TWITTER) WORKSPACE */}
              {editingChannel === 'twitter' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#0c1220] p-5 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20 shrink-0">
                        <XIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">X (Twitter) Broadcast Desk</h4>
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-bold text-teal-300 border border-teal-500/30">
                            <span>● Studio & Webhook Ready</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Broadcast 16:9 news summary cards, character-optimized tweets, and trending hashtags.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-3">
                      <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                        Way 1 • Universal Webhook
                      </span>
                      <h5 className="font-bold text-white text-sm">Make.com / Buffer / Zapier X Pipeline</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Publishes tweets and 16:9 summary graphics automatically through your webhook integration without paying for high-tier Twitter Developer API tiers.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-4">
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                        Way 2 • Direct Twitter API v2
                      </span>
                      <h5 className="font-bold text-white text-sm">Twitter API Keys</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Twitter API Key / Bearer (TWITTER_API_KEY)
                          </label>
                          <input
                            type="password"
                            placeholder="API Key..."
                            value={configCredentials.twitterApiKey}
                            onChange={(e) => setConfigCredentials((p) => ({ ...p, twitterApiKey: e.target.value }))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-teal-500 font-mono"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveCredentials}
                            disabled={savingSettings}
                            className="rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-500 disabled:opacity-50"
                          >
                            Save to .env
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. FACEBOOK & INSTAGRAM WORKSPACE */}
              {(editingChannel === 'facebook' || editingChannel === 'instagram') && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#0c1220] p-5 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20 text-white border border-slate-700 shrink-0">
                        {editingChannel === 'facebook' ? <FacebookIcon className="w-6 h-6 text-blue-500" /> : <InstagramIcon className="w-6 h-6 text-pink-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{editingChannel === 'facebook' ? 'Facebook News Page' : 'Instagram Feed & Stories'}</h4>
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-bold text-teal-300 border border-teal-500/30">
                            <span>● Studio & Webhook Ready</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Publish square (1:1), vertical story (9:16), or landscape image cards with full journalistic summaries.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-3">
                      <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                        Way 1 • Universal Webhook
                      </span>
                      <h5 className="font-bold text-white text-sm">Make.com / Buffer Meta Automation</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Delivers formatted story cards and captions to your Meta Business Suite or Buffer channels automatically.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-4">
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                        Way 2 • Direct Meta Graph API
                      </span>
                      <h5 className="font-bold text-white text-sm">Page & Instagram Access Tokens</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Meta Graph Access Token (META_ACCESS_TOKEN)
                          </label>
                          <input
                            type="password"
                            placeholder="EAA..."
                            value={configCredentials.metaAccessToken}
                            onChange={(e) => setConfigCredentials((p) => ({ ...p, metaAccessToken: e.target.value }))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-teal-500 font-mono"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveCredentials}
                            disabled={savingSettings}
                            className="rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-500 disabled:opacity-50"
                          >
                            Save to .env
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. UNIVERSAL WEBHOOK WORKSPACE */}
              {editingChannel === 'webhook' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 shadow-xl ${channels.webhook?.connected
                      ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0c1220]'
                      : 'border-slate-800/80 bg-[#0c1220]'
                    }`}>
                    <div className="flex items-center gap-3.5">
                      <span className="text-3xl">⚡</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">Universal Webhook Automation Dispatcher</h4>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${channels.webhook?.connected
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                            <span>{channels.webhook?.connected ? '● Connected & Active' : '○ Not Configured'}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Broadcasts all approved stories and branded CDN graphics simultaneously to Make.com, n8n, Zapier, or custom microservices.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestConnection('webhook')}
                      disabled={testingChannel === 'webhook'}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-500/20 hover:bg-teal-500 disabled:opacity-50 shrink-0"
                    >
                      {testingChannel === 'webhook' ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                      <span>Send Test Ping</span>
                    </button>
                  </div>

                  {testFeedback && testFeedback.channel === 'webhook' && (
                    <div className={`rounded-xl border p-4 text-xs font-medium ${testFeedback.ok ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300' : 'border-rose-500/40 bg-rose-950/40 text-rose-300'}`}>
                      <p className="font-bold mb-1">{testFeedback.ok ? '✓ Webhook Response OK' : '⚠ Webhook Notice'}</p>
                      <p>{testFeedback.message}</p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 p-5 shadow-xl space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Universal Webhook URL (SOCIAL_WEBHOOK_URL)
                      </label>
                      <input
                        type="text"
                        placeholder="https://hooks.zapier.com/... or https://hook.eu2.make.com/..."
                        value={configCredentials.socialWebhookUrl}
                        onChange={(e) => setConfigCredentials((p) => ({ ...p, socialWebhookUrl: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-teal-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveCredentials}
                        disabled={savingSettings}
                        className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 disabled:opacity-50 shadow-md shadow-teal-500/20"
                      >
                        {savingSettings ? 'Saving…' : 'Save Webhook URL to .env'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal 1: Social Publishing Studio Modal */}
        <SocialPublishModal
          isOpen={modalOpen}
          article={selectedArticle}
          onClose={() => setModalOpen(false)}
          onPostSuccess={(msg) => {
            showToast('success', msg);
            fetchArticlesAndStatus();
            if (activeTab === 'history') fetchLogs();
          }}
        />

        {/* Modal 2: Push Notification Broadcast Modal */}
        <PushBroadcastModal
          isOpen={Boolean(pushArticle)}
          article={pushArticle}
          onClose={() => setPushArticle(null)}
          onSuccess={(res) => {
            showToast('success', `Push alert broadcasted to ${res.recipients} subscriber(s)!`);
          }}
        />

        {/* Modal 3: Historical Post Detail Modal */}
        {selectedLogForDetail && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
            onClick={() => setSelectedLogForDetail(null)}
          >
            <div
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#0d1424] p-6 shadow-2xl space-y-4 text-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base">Social Post Dispatch Detail</h3>
                  <p className="text-xs text-slate-400">
                    Dispatched on {new Date(selectedLogForDetail.createdAt || selectedLogForDetail.timestamp || '').toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLogForDetail(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Article Title</span>
                  <p className="font-semibold text-white mt-0.5">{selectedLogForDetail.title}</p>
                </div>

                {selectedLogForDetail.imageUrl && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Branded Sized Card Graphic</span>
                    <div className="mt-1 overflow-hidden rounded-xl border border-slate-700 max-h-60 flex items-center justify-center bg-slate-950">
                      <img
                        src={selectedLogForDetail.imageUrl}
                        alt={selectedLogForDetail.title}
                        className="max-h-60 w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Channels Dispatched</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedLogForDetail.channels.map((ch) => (
                      <span key={ch} className="rounded bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-xs font-bold text-teal-300 uppercase">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedLogForDetail.captions && Object.keys(selectedLogForDetail.captions).length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Captions Delivered</span>
                    <div className="mt-1 space-y-2">
                      {Object.entries(selectedLogForDetail.captions).map(([plat, cap]) => (
                        <div key={plat} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
                          <span className="font-bold text-teal-400 uppercase tracking-wider block mb-1">{plat}:</span>
                          <p className="whitespace-pre-wrap font-mono text-[11px] text-slate-300 leading-relaxed">{cap}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => selectedLogForDetail && handleRebroadcastFromLog(selectedLogForDetail)}
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition flex items-center gap-1.5"
                >
                  <Share2 size={13} />
                  <span>Open in Studio to Edit / Re-send</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLogForDetail(null)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {feedback && (
          <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
            <div
              className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 ${feedback.type === 'success'
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

