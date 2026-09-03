'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface NewsletterSubscribeBoxProps {
  variant?: 'card' | 'inline' | 'compact';
  className?: string;
}

export function NewsletterSubscribeBox({
  variant = 'card',
  className = '',
}: NewsletterSubscribeBoxProps) {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'breaking'>('daily');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), frequency }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to subscribe. Please try again.');
      }

      setStatus({
        ok: true,
        message: 'You are subscribed to the NewsFree365 Daily Briefing! Check your inbox.',
      });
      setEmail('');
    } catch (err: any) {
      setStatus({
        ok: false,
        message: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`rounded-xl border border-teal-500/30 bg-teal-950/20 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2 text-teal-300 font-bold text-xs">
          <Mail size={15} />
          <span>Daily News Briefing</span>
        </div>
        <p className="text-[11px] text-slate-300 mb-3">
          Curated top intelligence & policy updates delivered to your inbox every morning.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-500 transition shrink-0"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : 'Join'}
            </button>
          </div>
          {status && (
            <p className={`text-[10px] ${status.ok ? 'text-emerald-400 font-semibold' : 'text-rose-400'}`}>
              {status.message}
            </p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-teal-500/40 bg-gradient-to-br from-slate-950 via-[#071318] to-slate-950 p-6 md:p-8 shadow-2xl ${className}`}
    >
      {/* Background Accent Glow */}
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-bold text-teal-300">
          <Sparkles size={12} />
          <span>Verified Intelligence Newsletter</span>
        </div>

        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
          Stay Ahead With The <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">NewsFree365 Briefing</span>
        </h3>

        <p className="text-xs md:text-sm text-slate-300">
          Join readers who start their day with our curated morning digest. No spam, zero noise, 1-click unsubscribe anytime.
        </p>

        {status && (
          <div
            className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs ${
              status.ok
                ? 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : 'border border-rose-500/40 bg-red-950/40 text-rose-200'
            }`}
          >
            {status.ok ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-rose-400" />}
            <span className="font-semibold">{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-950/50 hover:from-teal-400 hover:to-emerald-500 transition active:scale-95 disabled:opacity-60 shrink-0"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : (
                <Send size={16} className="text-white" />
              )}
              <span>{loading ? 'Subscribing...' : 'Get Free Briefing'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-teal-400" /> Free Forever
            </span>
            <span>&bull;</span>
            <span>Daily Morning Delivery</span>
            <span>&bull;</span>
            <span>No Spam Ever</span>
          </div>
        </form>
      </div>
    </div>
  );
}
