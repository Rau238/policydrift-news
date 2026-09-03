'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Send,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Search,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { categoryLabel } from '@/lib/category-theme';

interface StoryOption {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  image_url?: string | null;
  category?: string;
  published_at?: string;
}

interface NewsletterBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function NewsletterBroadcastModal({
  isOpen,
  onClose,
  onSuccess,
}: NewsletterBroadcastModalProps) {
  if (!isOpen) return null;

  const [subject, setSubject] = useState(
    `NewsFree365 Daily Intelligence Briefing: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  );
  const [headline, setHeadline] = useState("Today's Top Policy, Market & Breaking Headlines");
  const [intro, setIntro] = useState(
    'Here is your curated morning intelligence briefing with verified reports and in-depth coverage from the NewsFree365 news desk.'
  );
  const [frequency, setFrequency] = useState('all');

  // Story Selection Mode: 'auto' (Top 5 automatically) vs 'custom' (Admin manually picks stories)
  const [selectionMode, setSelectionMode] = useState<'auto' | 'custom'>('auto');
  const [availableStories, setAvailableStories] = useState<StoryOption[]>([]);
  const [selectedStoryIds, setSelectedStoryIds] = useState<number[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [storySearch, setStorySearch] = useState('');

  const [subscribersCount, setSubscribersCount] = useState<number | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean>(false);
  const [todayDispatched, setTodayDispatched] = useState<boolean>(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; sent?: number } | null>(null);

  useEffect(() => {
    fetch('/api/admin/newsletter/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setSubscribersCount(data.subscribersCount);
          setSmtpConfigured(data.smtpConfigured);
          setTodayDispatched(Boolean(data.todayDispatched));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch recent published stories for custom picker
  useEffect(() => {
    if (selectionMode === 'custom' && availableStories.length === 0) {
      setLoadingStories(true);
      fetch('/api/admin/newsletter/stories?limit=35')
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && Array.isArray(data.stories)) {
            setAvailableStories(data.stories);
            // Default select first 5
            if (selectedStoryIds.length === 0) {
              setSelectedStoryIds(data.stories.slice(0, 5).map((s: StoryOption) => s.id));
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingStories(false));
    }
  }, [selectionMode, availableStories.length, selectedStoryIds.length]);

  function toggleStory(id: number) {
    setSelectedStoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedStoryIds(availableStories.map((s) => s.id));
  }

  function clearSelection() {
    setSelectedStoryIds([]);
  }

  const filteredStories = useMemo(() => {
    if (!storySearch.trim()) return availableStories;
    const q = storySearch.toLowerCase();
    return availableStories.filter(
      (s) => s.title.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q)
    );
  }, [availableStories, storySearch]);

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;

    if (selectionMode === 'custom' && selectedStoryIds.length === 0) {
      setResult({ ok: false, message: 'Please select at least 1 story for your custom digest.' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          headline: headline.trim(),
          intro: intro.trim(),
          frequency,
          postIds: selectionMode === 'custom' ? selectedStoryIds : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to dispatch newsletter.');
      }

      setResult({
        ok: true,
        message: data.message || `Dispatched to ${data.sent} subscriber(s)!`,
        sent: data.sent,
      });

      setTodayDispatched(true);

      if (onSuccess) {
        onSuccess(`Newsletter broadcasted to ${data.sent} subscriber(s)!`);
      }
    } catch (err: any) {
      setResult({
        ok: false,
        message: err.message || 'Error communicating with newsletter server.',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/70 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-inner">
              <Mail size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white">Broadcast Email Newsletter</h2>
                {subscribersCount !== null && (
                  <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30">
                    {subscribersCount} Active Subscribers
                  </span>
                )}
                {todayDispatched ? (
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                    ✓ Sent Today
                  </span>
                ) : (
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                    Auto-Sends at 10 AM if not sent manually
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Send curated news digest to all email subscribers in your MySQL database.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleBroadcast} className="p-5 md:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {result && (
            <div
              className={`flex items-start gap-3 rounded-xl p-4 text-xs ${
                result.ok
                  ? 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                  : 'border border-red-500/40 bg-red-950/40 text-red-200'
              }`}
            >
              {result.ok ? (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold">{result.ok ? 'Broadcast Successful!' : 'Broadcast Failed'}</p>
                <p className="mt-0.5 text-slate-300">{result.message}</p>
              </div>
            </div>
          )}

          {/* Story Selection Mode Tabs */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectionMode('auto')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                selectionMode === 'auto'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              <span>Auto (Top 5 Latest Published)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectionMode('custom')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                selectionMode === 'custom'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare size={14} />
              <span>Custom Pick Stories ({selectedStoryIds.length})</span>
            </button>
          </div>

          {/* Custom Story Selector Panel */}
          {selectionMode === 'custom' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Select Stories To Include:</span>
                  <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30">
                    {selectedStoryIds.length} Selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-[11px] font-semibold text-teal-400 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">&bull;</span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-[11px] font-semibold text-slate-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Story Search Filter */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={storySearch}
                  onChange={(e) => setStorySearch(e.target.value)}
                  placeholder="Filter published stories..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
                />
              </div>

              {/* Stories Checkbox List */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                {loadingStories ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={20} className="animate-spin text-teal-500" />
                    <span className="mt-2 text-xs">Loading published stories...</span>
                  </div>
                ) : filteredStories.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-500">No matching stories found.</p>
                ) : (
                  filteredStories.map((story) => {
                    const isSelected = selectedStoryIds.includes(story.id);
                    return (
                      <div
                        key={story.id}
                        onClick={() => toggleStory(story.id)}
                        className={`flex items-start gap-3 rounded-lg border p-2.5 cursor-pointer transition select-none ${
                          isSelected
                            ? 'border-teal-500/60 bg-teal-950/30'
                            : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="mt-0.5 text-teal-400">
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-600" />}
                        </div>

                        {story.image_url ? (
                          <img
                            src={story.image_url}
                            alt=""
                            className="h-11 w-14 rounded object-cover border border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="h-11 w-14 rounded bg-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                            <ImageIcon size={14} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-bold text-teal-300 uppercase border border-slate-700">
                              {categoryLabel(story.category || 'news')}
                            </span>
                            {story.published_at && (
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(story.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-white line-clamp-1">{story.title}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Subject Line</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Digest Main Headline</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Editorial Intro / Note</label>
              <textarea
                rows={2}
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-teal-500 capitalize"
              >
                <option value="all">All Active Subscribers</option>
                <option value="daily">Daily Briefing Subscribers Only</option>
                <option value="breaking">Breaking News Alerts Only</option>
              </select>
            </div>
          </div>

          {/* 10:00 AM Auto-Send Info Banner */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-400 flex items-start gap-2.5">
            <Sparkles size={16} className="text-teal-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold text-white">Daily 10:00 AM Automated Backup: </span>
              If you don&apos;t send a manual digest today by 10:00 AM, the server will automatically compile today&apos;s top 5 verified stories and dispatch the morning briefing to all subscribers.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !subject.trim() || (selectionMode === 'custom' && selectedStoryIds.length === 0)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-950/60 hover:from-teal-400 hover:to-emerald-500 transition active:scale-95 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 size={15} className="animate-spin text-white" />
              ) : (
                <Send size={15} className="text-white" />
              )}
              <span>
                {sending
                  ? 'Dispatching...'
                  : selectionMode === 'custom'
                  ? `Send Digest (${selectedStoryIds.length} Stories)`
                  : 'Send Newsletter Digest'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
