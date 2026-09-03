'use client';

import { useState } from 'react';
import {
  Bell,
  Send,
  Loader2,
  X,
  Sparkles,
  ExternalLink,
  Smartphone,
  Globe,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { siteName } from '@/lib/site';

export interface PushArticleInput {
  id?: number | string;
  slug: string;
  title: string;
  excerpt?: string | null;
  image_url?: string | null;
  category?: string;
}

interface PushBroadcastModalProps {
  article: PushArticleInput | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: { recipients: number; id: string }) => void;
}

export function PushBroadcastModal({
  article,
  isOpen,
  onClose,
  onSuccess,
}: PushBroadcastModalProps) {
  if (!isOpen || !article) return null;

  const initialUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/news/${article.slug}`
    : `https://www.newsfree365.live/news/${article.slug}`;

  const [title, setTitle] = useState(article.title || '');
  const [message, setMessage] = useState(
    article.excerpt ? article.excerpt.slice(0, 160) : article.title
  );
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [imageUrl, setImageUrl] = useState(article.image_url || '');

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; recipients?: number; sent?: number } | null>(null);
  const [subscribersCount, setSubscribersCount] = useState<number | null>(null);

  // Fetch current subscriber count from backend MySQL
  useState(() => {
    fetch('/api/admin/push/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && typeof data.subscribersCount === 'number') {
          setSubscribersCount(data.subscribersCount);
        }
      })
      .catch(() => {});
  });

  async function handleSendPush(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: article?.id,
          title: title.trim(),
          message: message.trim(),
          url: targetUrl.trim(),
          imageUrl: imageUrl.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to broadcast notification.');
      }

      setResult({
        ok: true,
        message: data.message || 'Push notification sent successfully!',
        recipients: data.sent ?? data.recipients ?? 0,
        sent: data.sent,
      });

      if (onSuccess) {
        onSuccess({ recipients: data.sent ?? data.recipients ?? 0, id: data.id });
      }
    } catch (err: any) {
      setResult({
        ok: false,
        message: err.message || 'Error communicating with push server.',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Bell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Broadcast Web Push Alert</h2>
                <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30">
                  Native VAPID
                </span>
                {subscribersCount !== null && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
                    {subscribersCount} Active Subscribers
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Send real-time breaking news notification directly to all subscribed devices from your database.
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

        <form onSubmit={handleSendPush} className="p-6 space-y-5">
          {/* Result Banner */}
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
                {typeof result.recipients === 'number' && result.recipients > 0 && (
                  <p className="mt-1 font-semibold text-emerald-300">
                    Delivered to {result.recipients} active subscriber device(s).
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Notification Headline</label>
                <span className="text-[10px] text-slate-500">{title.length}/80 chars</span>
              </div>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                placeholder="Catchy breaking news headline..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Message / Summary</label>
                <span className="text-[10px] text-slate-500">{message.length}/180 chars</span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                placeholder="Short summary of key details..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destination URL</label>
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Story Image URL (Optional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Live Device Notification Preview */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Smartphone size={13} className="text-amber-400" />
              Live Reader Preview (Chrome & Mobile)
            </p>

            <div className="rounded-xl border border-slate-800/90 bg-slate-950 p-3.5 shadow-md flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-teal-600/30 border border-teal-500/40 flex items-center justify-center shrink-0 text-teal-300 font-bold text-xs">
                #
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{siteName}</span>
                  <span>now</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-0.5">{title || 'Headline'}</h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{message || 'Summary text...'}</p>
              </div>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="preview"
                  className="h-12 w-12 rounded-lg object-cover border border-slate-800 shrink-0"
                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                />
              )}
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
              disabled={sending || !title.trim() || !message.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-950/60 hover:from-amber-400 hover:to-orange-500 transition active:scale-95 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 size={15} className="animate-spin text-white" />
              ) : (
                <Send size={15} className="text-white" />
              )}
              <span>{sending ? 'Broadcasting...' : 'Send Push Alert to Subscribers'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
