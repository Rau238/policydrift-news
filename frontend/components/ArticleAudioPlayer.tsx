'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Gauge,
  Headphones,
} from 'lucide-react';

type Props = {
  title: string;
  excerpt?: string | null;
  takeaways?: string | null;
  body?: string | null;
  category?: string;
};

export function ArticleAudioPlayer({
  title,
  excerpt,
  takeaways,
  body,
  category = 'News',
}: Props) {
  const [supported, setSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<'brief' | 'full'>('brief');
  const [rate, setRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSentence, setCurrentSentence] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentencesRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);

  // Clean text from markdown and HTML
  const cleanText = useCallback((raw: string): string => {
    if (!raw) return '';
    return raw
      .replace(/<[^>]*>/g, ' ')
      .replace(/!\[.*?\]\(.*?\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~`>|]/g, ' ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      .replace(/\$[^$]*\$/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  // Build the script to be read
  const buildScript = useCallback(() => {
    const cleanTitle = cleanText(title);
    const cleanExcerpt = excerpt ? cleanText(excerpt) : '';
    const cleanTakeaways = takeaways ? cleanText(takeaways) : '';
    const cleanBody = body ? cleanText(body) : '';

    let scriptText = '';

    if (mode === 'brief') {
      scriptText = `Story Brief. ${cleanTitle}. ${cleanExcerpt ? `Overview: ${cleanExcerpt}. ` : ''}${
        cleanTakeaways ? `Key Points: ${cleanTakeaways}.` : ''
      }`;
    } else {
      scriptText = `${cleanTitle}. ${cleanExcerpt ? `${cleanExcerpt}. ` : ''}${
        cleanTakeaways ? `Key Takeaways: ${cleanTakeaways}. ` : ''
      }${cleanBody}`;
    }

    const rawSentences = scriptText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    sentencesRef.current = rawSentences.length > 0 ? rawSentences : [scriptText];
    return sentencesRef.current;
  }, [title, excerpt, takeaways, body, mode, cleanText]);

  // Load browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (!available.length) return;
      setVoices(available);

      const preferred =
        available.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Neural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Daniel')),
        ) ||
        available.find((v) => v.lang.startsWith('en')) ||
        available[0];

      if (preferred) setSelectedVoice(preferred);
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakNextSentence = useCallback(() => {
    if (currentIndexRef.current >= sentencesRef.current.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentSentence('Playback complete.');
      return;
    }

    const text = sentencesRef.current[currentIndexRef.current];
    setCurrentSentence(text);
    setProgress(
      Math.round(((currentIndexRef.current + 1) / sentencesRef.current.length) * 100),
    );

    const u = new SpeechSynthesisUtterance(text);
    if (selectedVoice) u.voice = selectedVoice;
    u.rate = rate;
    u.pitch = 1.0;
    u.volume = isMuted ? 0 : 1;

    u.onend = () => {
      currentIndexRef.current += 1;
      speakNextSentence();
    };

    u.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('[AudioPlayer] Synthesis error:', e);
      }
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [selectedVoice, rate, isMuted]);

  const handlePlay = () => {
    if (!supported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    buildScript();
    currentIndexRef.current = 0;
    setIsPlaying(true);
    setIsPaused(false);
    speakNextSentence();
  };

  const handlePause = () => {
    if (!supported || !isPlaying) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    currentIndexRef.current = 0;
    setCurrentSentence('');
  };

  const handleSpeedToggle = () => {
    const nextRate = rate === 1.0 ? 1.25 : rate === 1.25 ? 1.5 : rate === 1.5 ? 2.0 : 1.0;
    setRate(nextRate);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      speakNextSentence();
    }
  };

  const handleModeChange = (newMode: 'brief' | 'full') => {
    if (mode === newMode) return;
    setMode(newMode);
    if (isPlaying || isPaused) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      currentIndexRef.current = 0;
      setCurrentSentence('');
    }
  };

  if (!supported) return null;

  return (
    <div
      aria-label="Listen to article audio player"
      className="group relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-slate-950 via-[#072421] to-slate-950 p-2.5 sm:p-3 text-white shadow-lg shadow-teal-950/25 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/35"
    >
      {/* Subtle dynamic background glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-teal-500/15 blur-2xl transition-all duration-500 group-hover:bg-teal-500/25" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-emerald-500/15 blur-2xl" />

      <div className="relative flex flex-col gap-2">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Play/Pause Button & Title */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {isPlaying ? (
              <button
                type="button"
                onClick={handlePause}
                className="group/btn relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/30 transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
                title="Pause audio"
              >
                <Pause className="h-4 w-4 fill-current transition-transform duration-200" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlay}
                className="group/btn relative inline-flex h-9 items-center gap-2 shrink-0 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 px-3.5 text-xs font-extrabold text-slate-950 shadow-md shadow-teal-500/30 transition-all duration-200 hover:scale-[1.03] hover:brightness-110 active:scale-95"
                title="Listen to story"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isPaused ? 'Resume' : 'Listen'}</span>
              </button>
            )}

            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold tracking-tight text-white">
                  <Headphones className="h-3 w-3 text-teal-300 shrink-0" />
                  <span className="truncate">
                    {isPlaying ? 'Now Playing' : isPaused ? 'Paused' : 'AI Audio Brief'}
                  </span>
                </span>
                {isPlaying && (
                  <span className="flex items-end gap-0.5 h-3.5 shrink-0 px-1">
                    <span className="w-0.5 rounded-full bg-teal-300 h-2 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 rounded-full bg-cyan-300 h-3 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 rounded-full bg-emerald-300 h-3.5 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="w-0.5 rounded-full bg-teal-300 h-2 animate-bounce" style={{ animationDelay: '450ms' }} />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {mode === 'brief' ? '1-Min Summary' : 'Full Story'}
              </span>
            </div>
          </div>

          {/* Right Controls: Mode Toggle, Speed, Restart */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            {/* Pill Mode Switcher */}
            <div className="inline-flex rounded-lg border border-white/10 bg-black/40 p-0.5 text-[10px] font-semibold backdrop-blur-md">
              <button
                type="button"
                onClick={() => handleModeChange('brief')}
                className={`rounded-md px-2 py-1 transition-all ${
                  mode === 'brief'
                    ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="1-Minute Executive Summary"
              >
                Brief
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('full')}
                className={`rounded-md px-2 py-1 transition-all ${
                  mode === 'full'
                    ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Full Article Narration"
              >
                Full
              </button>
            </div>

            {/* Speed Pill */}
            <button
              type="button"
              onClick={handleSpeedToggle}
              className="inline-flex h-7 items-center gap-0.5 rounded-lg border border-white/10 bg-black/40 px-2 text-[10px] font-bold text-teal-300 backdrop-blur-md transition hover:border-teal-400/50 hover:bg-teal-500/10 active:scale-95"
              title="Playback speed"
            >
              <Gauge className="h-3 w-3 opacity-80" />
              <span>{rate}x</span>
            </button>

            {/* Restart Button (When Active) */}
            {(isPlaying || isPaused || progress > 0) && (
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-slate-300 transition hover:border-white/20 hover:text-white active:scale-95"
                title="Restart playback"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}

            {/* Mute Button */}
            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-slate-300 transition hover:border-white/20 hover:text-white"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Live Subtitle / Sentence Tracker (Active State) */}
        {(isPlaying || isPaused) && (
          <div className="space-y-1.5 pt-0.5 animate-fadeIn">
            {currentSentence && (
              <p className="truncate rounded-lg bg-black/40 px-2.5 py-1 text-[11px] font-medium text-teal-200/90 italic border border-teal-500/15">
                &ldquo;{currentSentence}&rdquo;
              </p>
            )}
            <div className="flex items-center gap-2">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="tabular-nums text-[10px] font-bold text-teal-300 shrink-0">
                {progress}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
