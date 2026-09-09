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
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 sm:bg-slate-950/80 backdrop-blur-xl px-5 py-6 sm:px-8 sm:py-7 md:px-10 md:py-8 shadow-2xl text-center flex flex-col items-center justify-center ${className}`}
    >
      {/* Top subtle highlight hairline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 via-50% to-transparent"
        aria-hidden
      />
      {/* Subtle ambient glows for full rich background */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-96 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center">
        {/* Headline & Description Centered */}
        <div className="w-full mb-5 sm:mb-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
            Stay Ahead With The <span className="text-teal-400">NewsFree365 Briefing</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-lg mx-auto">
            Curated daily intelligence & policy updates. No spam, 1-click unsubscribe anytime.
          </p>
        </div>

        {/* Centered Input Form & Micro Trust Row */}
        <div className="w-full max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
              <div className="relative w-full flex-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full rounded-xl border border-white/15 bg-slate-950/90 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-950/50 transition active:scale-95 disabled:opacity-60 shrink-0"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin text-white" />
                ) : (
                  <Send size={15} className="text-white" />
                )}
                <span>{loading ? 'Subscribing...' : 'Get Free Briefing'}</span>
              </button>
            </div>

            <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-xs text-slate-400 pt-1">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <ShieldCheck size={13} className="text-teal-400 shrink-0" /> Free Forever
              </span>
              <span className="text-slate-600 hidden sm:inline" aria-hidden>·</span>
              <span className="whitespace-nowrap">Daily Morning Delivery</span>
              <span className="text-slate-600 hidden sm:inline" aria-hidden>·</span>
              <span className="whitespace-nowrap">No Spam Ever</span>
            </div>
          </form>

          {status && (
            <div
              className={`mt-3 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs text-center ${status.ok
                  ? 'border border-emerald-500/40 bg-emerald-950/60 text-emerald-200'
                  : 'border border-rose-500/40 bg-red-950/60 text-rose-200'
                }`}
            >
              {status.ok ? (
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={14} className="text-rose-400 shrink-0" />
              )}
              <span className="text-xs font-medium">{status.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
