'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle2, Share2, TrendingUp } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollData {
  id: number;
  question: string;
  category: string;
  options: PollOption[];
  total_votes: number;
  is_active: number;
}

interface PollWidgetProps {
  className?: string;
  compact?: boolean;
}

export function PollOfTheDayWidget({ className = '', compact = false }: PollWidgetProps) {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadActivePoll = async () => {
      try {
        const res = await fetch('/api/polls/active');
        if (res.ok) {
          const data = await res.json();
          if (data?.poll) {
            setPoll(data.poll);
            const votedPolls = JSON.parse(localStorage.getItem('newsfree365_voted_polls') || '{}');
            if (votedPolls[data.poll.id]) {
              setHasVoted(true);
              setSelectedOption(votedPolls[data.poll.id]);
            }
          }
        }
      } catch {
        // Ignore fallback
      }
    };

    loadActivePoll();
  }, []);

  const handleVote = async () => {
    if (!poll || !selectedOption || isSubmitting || hasVoted) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption }),
      });

      const data = await res.json();
      if (data?.poll) {
        setPoll(data.poll);
      }
      setHasVoted(true);

      const votedPolls = JSON.parse(localStorage.getItem('newsfree365_voted_polls') || '{}');
      votedPolls[poll.id] = selectedOption;
      localStorage.setItem('newsfree365_voted_polls', JSON.stringify(votedPolls));
    } catch {
      // Ignore network fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSharePoll = () => {
    if (!poll) return;
    const url = typeof window !== 'undefined' ? window.location.href : 'https://www.newsfree365.live';
    const text = encodeURIComponent(`📊 *NewsFree365 Opinion Pulse*\n\n"${poll.question}"\n\nCast your vote here:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (!poll) return null;

  const totalVotes = Math.max(1, poll.total_votes);

  return (
    <aside
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
    >
      {/* Header section matching TrendingAside exactly */}
      <div className="relative border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-700 ring-1 ring-teal-400/30">
              <BarChart3 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-sm font-bold tracking-tight text-slate-900">
                Opinion Pulse
              </h2>
              <p className="text-[10.5px] font-medium text-slate-500">
                Daily Public Consensus
              </p>
            </div>
          </div>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs">
            {poll.category}
          </span>
        </div>
      </div>

      {/* Poll Body */}
      <div className="p-4 sm:p-5 space-y-4">
        <h3 className="text-xs sm:text-sm font-bold leading-snug text-slate-900">
          {poll.question}
        </h3>

        {/* Options */}
        <div className="space-y-2">
          {poll.options.map((option) => {
            const voteCount = option.votes || 0;
            const percentage = Math.round((voteCount / totalVotes) * 100);
            const isSelected = selectedOption === option.id;

            if (hasVoted) {
              return (
                <div
                  key={option.id}
                  className={`relative overflow-hidden rounded-xl border p-2.5 sm:p-3 transition-all ${
                    isSelected
                      ? 'border-teal-400 bg-teal-50/70 text-teal-950 font-bold'
                      : 'border-slate-200 bg-slate-50/40 text-slate-800'
                  }`}
                >
                  <div
                    className={`absolute top-0 bottom-0 left-0 transition-all duration-700 ${
                      isSelected ? 'bg-teal-200/70' : 'bg-slate-200/60'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                      )}
                      <span className="font-medium truncate">{option.text}</span>
                    </div>
                    <span className="font-black tabular-nums text-slate-900 shrink-0">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOption(option.id)}
                className={`w-full text-left rounded-xl border p-2.5 sm:p-3 text-xs font-medium transition-all flex items-center justify-between gap-2 active:scale-[0.98] ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="line-clamp-2">{option.text}</span>
                <span
                  className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-teal-700 bg-teal-700' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <span className="h-1 w-1 rounded-full bg-white" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-500 text-[11px]">
            <TrendingUp className="h-3.5 w-3.5 text-teal-700" />
            <span>{totalVotes.toLocaleString()} votes</span>
          </div>

          {!hasVoted ? (
            <button
              type="button"
              disabled={!selectedOption || isSubmitting}
              onClick={handleVote}
              className="inline-flex items-center gap-1 rounded-xl bg-teal-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <span>{isSubmitting ? 'Voting...' : 'Vote'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSharePoll}
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95 shadow-2xs"
            >
              <Share2 className="h-3 w-3 text-emerald-700" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
