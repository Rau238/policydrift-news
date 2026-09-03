'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Eye,
  Settings,
} from 'lucide-react';
import { siteName } from '@/lib/site';

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

  const [subscribersCount, setSubscribersCount] = useState<number | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean>(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; sent?: number } | null>(null);

  useEffect(() => {
    fetch('/api/admin/newsletter/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setSubscribersCount(data.subscribersCount);
          setSmtpConfigured(data.smtpConfigured);
        }
      })
      .catch(() => {});
  }, []);

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-inner">
              <Mail size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Broadcast Email Newsletter</h2>
                {subscribersCount !== null && (
                  <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30">
                    {subscribersCount} Active Subscribers
                  </span>
                )}
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                    smtpConfigured
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {smtpConfigured ? 'SMTP Live' : 'Simulated / Log Mode'}
                </span>
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

        <form onSubmit={handleBroadcast} className="p-6 space-y-5">
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

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Subject Line</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Digest Main Headline</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Editorial Intro / Note</label>
              <textarea
                rows={3}
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
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

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-teal-400" />
              Automatic Story Compilation
            </p>
            <p className="text-[11px]">
              This digest will automatically bundle the top 5 latest published stories with photos, summaries, and tracking links into a responsive mobile-friendly HTML email.
            </p>
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
              disabled={sending || !subject.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-950/60 hover:from-teal-400 hover:to-emerald-500 transition active:scale-95 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 size={15} className="animate-spin text-white" />
              ) : (
                <Send size={15} className="text-white" />
              )}
              <span>{sending ? 'Dispatching...' : 'Send Newsletter Digest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
