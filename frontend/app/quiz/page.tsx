'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Share2,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Trophy,
  Flame,
  Home,
  ChevronRight,
  Users,
  Target,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Medal,
  Calendar,
  Check,
  Lightbulb,
  BarChart2,
  Copy,
  Clock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PollOfTheDayWidget } from '@/components/PollOfTheDayWidget';

// ==========================================
// PURE CLIENT-SIDE WEB AUDIO SYNTHESIZER
// ==========================================
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playCorrect() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Note 1 (E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Note 2 (B5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(987.77, now + 0.1);
      gain2.gain.setValueAtTime(0.2, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.45);
    } catch {
      // Ignore audio failure if not allowed by browser
    }
  }

  playWrong() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.28);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Audio fallback
    }
  }

  playLifeline() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Fallback
    }
  }

  playFanfare() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      });
    } catch {
      // Fallback
    }
  }
}

const sfx = new SoundFX();

interface QuizQuestion {
  id: number;
  category: string;
  categorySlug: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  audienceVotes: number[]; // % of audience choices
  keyTerm: string;
}

const DAILY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'World Policy & Geopolitics',
    categorySlug: 'world-news',
    question: 'Which global treaty or framework was recently highlighted by international trade ministries for standardizing cross-border digital economy regulations?',
    options: [
      'Digital Economy Partnership Agreement (DEPA)',
      'Kyoto Protocol Annex B',
      'Bretton Woods Monetary Accord',
      'Maritime Border Safety Treaty',
    ],
    correctIndex: 0,
    explanation: 'The Digital Economy Partnership Agreement (DEPA) is pioneering international digital trade rules, data flow safeguards, and AI governance standards.',
    audienceVotes: [74, 11, 9, 6],
    keyTerm: 'DEPA Digital Trade Accord',
  },
  {
    id: 2,
    category: 'Global Markets & Banking',
    categorySlug: 'banking-economics',
    question: 'What is the primary indicator monitored by central banks when assessing underlying consumer inflation excluding volatile food and energy costs?',
    options: [
      'Gross Capital Expenditure Ratio',
      'Core Consumer Price Index (Core CPI)',
      'Producer Inventory Velocity',
      'Composite PMI Manufacturing Index',
    ],
    correctIndex: 1,
    explanation: 'Core CPI strips out food and energy volatility to give monetary policy committees a cleaner measure of persistent inflationary pressures.',
    audienceVotes: [8, 81, 6, 5],
    keyTerm: 'Core CPI Benchmark',
  },
  {
    id: 3,
    category: 'Technology & AI',
    categorySlug: 'technology',
    question: 'In modern generative AI and chip architecture, what specialized hardware accelerator design is predominantly used to compute matrix tensor operations at high speed?',
    options: [
      'FPGA Floating Units',
      'Tensor Processing Units / GPU Tensor Cores',
      'Electromechanical Relays',
      'Serial Magnetic Bubble Memory',
    ],
    correctIndex: 1,
    explanation: 'Tensor Cores and TPUs optimize low-precision matrix multiply-accumulate operations, the fundamental math engine powering modern LLMs.',
    audienceVotes: [14, 76, 4, 6],
    keyTerm: 'TPU & Matrix Accelerators',
  },
  {
    id: 4,
    category: 'Space & Defense',
    categorySlug: 'world-news',
    question: 'Which sovereign multi-satellite constellation is Europe currently developing to ensure sovereign secure satellite connectivity (similar to Starlink)?',
    options: [
      'Galileo Sentinel-9',
      'IRIS² (Infrastructure for Resilience, Interconnectivity and Security)',
      'Artemis Deep Orbit Grid',
      'Copernicus Solar Array',
    ],
    correctIndex: 1,
    explanation: 'IRIS² is the European Union flagship multi-orbital secure satellite connectivity initiative built in collaboration with European aerospace leaders.',
    audienceVotes: [12, 69, 13, 6],
    keyTerm: 'IRIS² European Constellation',
  },
  {
    id: 5,
    category: 'Sports & Athletics',
    categorySlug: 'sports',
    question: 'In international cricket, what is the standard maximum number of overs allotted to a single bowler in a standard 50-over One Day International (ODI) match?',
    options: [
      '8 Overs',
      '10 Overs',
      '12 Overs',
      '15 Overs',
    ],
    correctIndex: 1,
    explanation: 'Under ICC regulations for 50-over ODIs, no bowler may bowl more than 10 overs in an uninterrupted innings.',
    audienceVotes: [3, 89, 5, 3],
    keyTerm: 'ICC 10-Over Limit Rule',
  },
];

const LEADERBOARD_PREVIEW = [
  { rank: 1, name: 'Aarav S.', score: '5/5', time: '1m 12s', flag: '🇮🇳', xp: '820 XP', badge: '🥇 Gold' },
  { rank: 2, name: 'Elena R.', score: '5/5', time: '1m 24s', flag: '🇬🇧', xp: '790 XP', badge: '🥈 Silver' },
  { rank: 3, name: 'Dev M.', score: '5/5', time: '1m 38s', flag: '🇮🇳', xp: '760 XP', badge: '🥉 Bronze' },
  { rank: 4, name: 'Marcus K.', score: '5/5', time: '1m 45s', flag: '🇺🇸', xp: '720 XP', badge: 'Top 1%' },
];

export default function DailyNewsQuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(DAILY_QUIZ_QUESTIONS);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: number }>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [earnedXpDelta, setEarnedXpDelta] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Lifelines: 50:50 and Audience Poll
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [usedAudiencePoll, setUsedAudiencePoll] = useState(false);
  const [showAudienceStats, setShowAudienceStats] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Timer per question (30s)
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch dynamic questions from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicQuiz() {
      try {
        const res = await fetch('/api/quiz');
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.questions) && data.questions.length > 0) {
            if (isMounted) {
              setQuestions(data.questions);
            }
          }
        }
      } catch {
        // Retain fallback
      } finally {
        if (isMounted) setIsLoadingQuestions(false);
      }
    }
    loadDynamicQuiz();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalQuestions = questions.length || 1;
  const currentQ = questions[currentQuestionIndex] || questions[0] || DAILY_QUIZ_QUESTIONS[0];

  // Toggle Sound State
  const toggleSound = () => {
    sfx.enabled = !sfx.enabled;
    setIsSoundMuted(!sfx.enabled);
  };

  // Countdown timer effect
  useEffect(() => {
    if (isAnswered || quizCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, isAnswered, quizCompleted]);

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered || quizCompleted || eliminatedOptions.includes(optionIndex)) return;

    const isCorrect = optionIndex === currentQ.correctIndex;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));
    setIsAnswered(true);

    if (isCorrect) {
      sfx.playCorrect();
      const speedBonus = timeLeft > 20 ? 60 : timeLeft > 10 ? 30 : 15;
      const streakBonus = streak * 25;
      const questionXp = 100 + speedBonus + streakBonus;

      setEarnedXpDelta(questionXp);
      setTimeout(() => setEarnedXpDelta(null), 1800);

      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setTotalXp((prev) => prev + questionXp);
    } else {
      sfx.playWrong();
      setStreak(0);
      setEarnedXpDelta(null);
    }
  };

  // Keyboard shortcut listener (A, B, C, D or 1, 2, 3, 4, and Enter)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isAnswered || quizCompleted) {
        if (e.key === 'Enter') {
          handleNextQuestion();
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'A' || key === '1') handleSelectOption(0);
      else if (key === 'B' || key === '2') handleSelectOption(1);
      else if (key === 'C' || key === '3') handleSelectOption(2);
      else if (key === 'D' || key === '4') handleSelectOption(3);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleFiftyFifty = () => {
    if (usedFiftyFifty || isAnswered || quizCompleted) return;
    sfx.playLifeline();
    setUsedFiftyFifty(true);

    // Pick 2 incorrect options to eliminate
    const incorrectIndices = [0, 1, 2, 3].filter((i) => i !== currentQ.correctIndex);
    const toEliminate = incorrectIndices.slice(0, 2);
    setEliminatedOptions(toEliminate);
  };

  const handleAudiencePoll = () => {
    if (usedAudiencePoll || isAnswered || quizCompleted) return;
    sfx.playLifeline();
    setUsedAudiencePoll(true);
    setShowAudienceStats(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsAnswered(false);
      setEliminatedOptions([]);
      setShowAudienceStats(false);
    } else {
      setQuizCompleted(true);
      sfx.playFanfare();
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalXp(0);
    setUsedFiftyFifty(false);
    setUsedAudiencePoll(false);
    setEliminatedOptions([]);
    setShowAudienceStats(false);
    setQuizCompleted(false);
    setCopiedLink(false);
    setEarnedXpDelta(null);
  };

  const getRankTitle = (finalScore: number) => {
    if (finalScore === 5) {
      return {
        title: 'Global Intelligence Master',
        badge: 'TOP 1% GRANDMASTER',
        desc: 'Flawless 100% accuracy! You command an elite level of awareness on international policy, macroeconomic catalysts, and tech frontiers.',
      };
    }
    if (finalScore >= 4) {
      return {
        title: 'Senior Policy Strategist',
        badge: 'EXPERT 4/5',
        desc: 'Superior current affairs acumen. You possess a strong analytical grasp of complex world news.',
      };
    }
    if (finalScore >= 3) {
      return {
        title: 'Informed Global Citizen',
        badge: 'SOLID 3/5',
        desc: 'Solid daily news comprehension! Keep tracking our daily 60-Second Fast Takes to hit the top rank tomorrow.',
      };
    }
    return {
      title: 'News Explorer',
      badge: 'RISING CANDIDATE',
      desc: 'Good effort! Check our real-time newsroom feeds daily to master tomorrow\'s morning challenge.',
    };
  };

  const rank = getRankTitle(score);

  const handleShareScore = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/quiz` : 'https://www.newsfree365.live/quiz';
    const text = encodeURIComponent(
      `🎯 *NewsFree365 Daily Intelligence Arena*\n\nRank: *${rank.title}*\nScore: *${score}/${totalQuestions} Correct* (${totalXp} XP) 🏆\nCombo Streak: *${maxStreak}x*\n\nCan you beat my current affairs intelligence score today? Play here:\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/quiz` : 'https://www.newsfree365.live/quiz';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Timer SVG circumference calculations
  const timerRadius = 14;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerStrokeDashoffset = timerCircumference - (timeLeft / 30) * timerCircumference;
  const timerColor = timeLeft > 15 ? 'text-emerald-500' : timeLeft > 7 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Dynamic Animated Ambient Mesh Backdrop */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[450px] w-[800px] rounded-full bg-gradient-to-tr from-teal-500/10 via-emerald-400/8 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-96 right-[-5%] h-[350px] w-[350px] rounded-full bg-amber-400/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-[-5%] h-[300px] w-[300px] rounded-full bg-cyan-500/8 blur-3xl" />

      {/* Top Breadcrumb & Live Station Banner */}
      <div className="relative z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-teal-700 transition-colors">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-teal-700 font-bold">Daily Intelligence Quiz</span>
          </nav>
          
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE EDITION #091
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={toggleSound}
              title={isSoundMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 shadow-2xs"
            >
              {isSoundMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-500" /> : <Volume2 className="h-3.5 w-3.5 text-teal-600" />}
              <span className="hidden sm:inline">{isSoundMuted ? 'Muted' : 'Sound On'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Arena */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 2xl:max-w-[1440px]">
        {/* Engaging Hero Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 pb-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-800">5 Questions • 30s Speed Timer</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-950 flex items-center gap-2.5">
              <span>Daily</span>
              <span className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 bg-clip-text text-transparent">
                News Intelligence
              </span>
              <span>Arena</span>
            </h1>
          </div>

          {/* Real-time XP & Live Players Capsule */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live XP Counter with Floating Popups */}
            <div className="relative flex items-center gap-2.5 rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50 to-emerald-50/70 px-3.5 py-2 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-2xs">
                <Zap className="h-4 w-4 fill-amber-300 text-amber-300" />
              </div>
              <div className="text-left">
                <div className="text-[9.5px] uppercase font-black tracking-wider text-teal-800">Current XP</div>
                <div className="text-sm font-black text-slate-950 font-mono">{totalXp} XP</div>
              </div>

              {/* Floating +XP Notification */}
              <AnimatePresence>
                {earnedXpDelta !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -26, scale: 1.15 }}
                    exit={{ opacity: 0, y: -36 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="pointer-events-none absolute -top-1 right-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-black text-white shadow-md ring-2 ring-white"
                  >
                    +{earnedXpDelta} XP!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Active Readers */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Users className="h-4 w-4 text-slate-700" />
              </div>
              <div className="text-left">
                <div className="text-[9.5px] uppercase font-bold tracking-wider text-slate-400">Players Today</div>
                <div className="text-sm font-black text-slate-900 font-mono">16,480</div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Main Quiz Arena (8 Cols on Desktop) */}
          <div className="lg:col-span-8 space-y-4">
            {!quizCompleted ? (
              <div className={`relative overflow-hidden rounded-3xl border bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 ${
                streak >= 2 ? 'border-amber-400/90 shadow-md shadow-amber-500/10 ring-2 ring-amber-400/20' : 'border-slate-200/90'
              }`}>
                {/* Arena Top Toolbar: Step Pills, Timer Ring, Lifelines & Combo */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-100">
                  {/* Step Capsules */}
                  <div className="flex items-center gap-1.5">
                    {questions.map((q, idx) => {
                      const ans = selectedAnswers[q.id];
                      const isCurrent = idx === currentQuestionIndex;
                      const isPast = typeof ans === 'number';
                      const wasCorrect = isPast && ans === q.correctIndex;

                      return (
                        <motion.div
                          key={q.id}
                          whileHover={{ scale: 1.1 }}
                          className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-xs font-black transition-all duration-200 ${
                            isCurrent
                              ? 'bg-gradient-to-br from-teal-700 to-emerald-700 text-white shadow-md ring-2 ring-teal-400/60 scale-105'
                              : isPast && wasCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isPast && !wasCorrect
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 text-slate-400 border border-slate-200/70'
                          }`}
                        >
                          {isPast && wasCorrect ? (
                            <Check className="h-4 w-4 stroke-[3]" />
                          ) : isPast && !wasCorrect ? (
                            <span className="text-xs">✕</span>
                          ) : (
                            idx + 1
                          )}
                          {isCurrent && (
                            <span className="absolute -bottom-1 h-1 w-3 rounded-full bg-teal-300" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Timer & Lifelines Bar */}
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* SVG Circular Radial Countdown Timer */}
                    {!isAnswered && (
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-2.5 py-1 text-xs font-mono font-bold text-slate-800 shadow-2xs">
                        <div className="relative flex h-7 w-7 items-center justify-center">
                          <svg className="h-7 w-7 -rotate-90 transform" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r={timerRadius}
                              className="stroke-slate-200"
                              strokeWidth="3.5"
                              fill="transparent"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r={timerRadius}
                              className={`${timerColor} transition-all duration-1000 ease-linear`}
                              strokeWidth="3.5"
                              strokeDasharray={timerCircumference}
                              strokeDashoffset={timerStrokeDashoffset}
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>
                          <span className={`absolute text-[10px] font-black ${timeLeft <= 7 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                            {timeLeft}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Sec</span>
                      </div>
                    )}

                    {/* Lifeline: 50:50 */}
                    {!isAnswered && (
                      <button
                        type="button"
                        disabled={usedFiftyFifty}
                        onClick={handleFiftyFifty}
                        title="50:50 Lifeline: Eliminate 2 incorrect options"
                        className={`group inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-black transition-all ${
                          usedFiftyFifty
                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-40'
                            : 'border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100/70 text-amber-900 hover:border-amber-400 hover:shadow-xs active:scale-95 shadow-2xs'
                        }`}
                      >
                        <Lightbulb className="h-3.5 w-3.5 text-amber-600 group-hover:rotate-12 transition-transform" />
                        <span>50:50</span>
                      </button>
                    )}

                    {/* Lifeline: Audience Consensus */}
                    {!isAnswered && (
                      <button
                        type="button"
                        disabled={usedAudiencePoll}
                        onClick={handleAudiencePoll}
                        title="Audience Poll: View crowd breakdown statistics"
                        className={`group inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-black transition-all ${
                          usedAudiencePoll
                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-40'
                            : 'border-sky-300 bg-gradient-to-r from-sky-50 to-sky-100/70 text-sky-900 hover:border-sky-400 hover:shadow-xs active:scale-95 shadow-2xs'
                        }`}
                      >
                        <BarChart2 className="h-3.5 w-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Audience</span>
                        <span className="sm:hidden">Poll</span>
                      </button>
                    )}

                    {/* Combo Streak Flame Multiplier */}
                    {streak >= 2 && (
                      <motion.div
                        initial={{ scale: 0.8, rotate: -5 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-[11px] font-black text-white shadow-xs ring-2 ring-amber-300/40"
                      >
                        <Flame className="h-3.5 w-3.5 fill-yellow-200 text-yellow-200 animate-pulse" />
                        <span>{streak}x COMBO!</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Animated Question Content Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQ.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {/* Category Pill & Question Text */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-teal-800">
                          <Target className="h-3 w-3 text-teal-600" />
                          <span>{currentQ.category}</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          Question {currentQuestionIndex + 1} of {totalQuestions}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black leading-snug text-slate-950">
                        {currentQ.question}
                      </h2>
                    </div>

                    {/* Interactive Option Cards */}
                    <div className="space-y-2.5">
                      {currentQ.options.map((option, idx) => {
                        const isSelected = selectedAnswers[currentQ.id] === idx;
                        const isCorrect = idx === currentQ.correctIndex;
                        const isEliminated = eliminatedOptions.includes(idx);
                        const audiencePct = currentQ.audienceVotes[idx] || 0;

                        let cardStyle = 'border-slate-200/90 bg-slate-50/70 text-slate-800 hover:border-teal-500 hover:bg-teal-50/40 hover:shadow-2xs';
                        if (isEliminated) {
                          cardStyle = 'border-slate-100 bg-slate-50/30 text-slate-300 line-through opacity-30 cursor-not-allowed';
                        } else if (isAnswered) {
                          if (isCorrect) {
                            cardStyle = 'border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-400/90 font-bold shadow-xs';
                          } else if (isSelected) {
                            cardStyle = 'border-rose-400 bg-rose-50/90 text-rose-950 ring-2 ring-rose-300 font-semibold';
                          } else {
                            cardStyle = 'border-slate-200/60 bg-slate-50/30 text-slate-400 opacity-60';
                          }
                        }

                        return (
                          <motion.button
                            key={idx}
                            type="button"
                            disabled={isAnswered || isEliminated}
                            whileHover={!isAnswered && !isEliminated ? { x: 3, scale: 1.006 } : undefined}
                            whileTap={!isAnswered && !isEliminated ? { scale: 0.99 } : undefined}
                            onClick={() => handleSelectOption(idx)}
                            className={`group relative w-full overflow-hidden text-left rounded-2xl border px-3.5 py-3 text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${cardStyle}`}
                          >
                            {/* Option Letter Icon & Label */}
                            <div className="flex items-center gap-3 min-w-0 flex-1 z-10">
                              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors ${
                                isAnswered && isCorrect
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : isAnswered && isSelected && !isCorrect
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-white border border-slate-200 text-slate-700 shadow-2xs group-hover:border-teal-400 group-hover:text-teal-800'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="leading-snug font-semibold">{option}</span>
                            </div>

                            {/* Audience Consensus Bar Indicator */}
                            {showAudienceStats && !isAnswered && (
                              <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-lg border border-sky-300 z-10">
                                <BarChart2 className="h-3 w-3 text-sky-600" />
                                <span>{audiencePct}%</span>
                              </div>
                            )}

                            {/* Correct / Incorrect Status Badges */}
                            {isAnswered && isCorrect && (
                              <div className="flex items-center gap-1 text-xs font-black text-emerald-700 shrink-0 z-10">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                <span className="hidden sm:inline">CORRECT</span>
                              </div>
                            )}
                            {isAnswered && isSelected && !isCorrect && (
                              <div className="flex items-center gap-1 text-xs font-black text-rose-700 shrink-0 z-10">
                                <XCircle className="h-5 w-5 text-rose-600" />
                                <span className="hidden sm:inline">INCORRECT</span>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Editorial Dossier Key Context Box */}
                    <AnimatePresence>
                      {isAnswered && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -6, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="mt-4 overflow-hidden rounded-2xl border border-teal-300 bg-gradient-to-br from-teal-50/95 via-emerald-50/80 to-teal-50/95 p-3.5 text-xs sm:text-[13px] shadow-xs"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5 text-teal-950 font-black text-[11px] uppercase tracking-wider">
                              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
                              <span>Newsroom Intelligence Dossier</span>
                            </div>
                            <span className="rounded bg-teal-200/70 px-2 py-0.5 text-[10px] font-bold text-teal-900">
                              {currentQ.keyTerm}
                            </span>
                          </div>
                          <p className="text-slate-800 leading-relaxed m-0 font-medium">
                            {currentQ.explanation}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bottom Action / Next Question Button */}
                    {isAnswered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5"
                      >
                        <span className="text-xs font-bold text-slate-600">
                          Score: <strong className="text-teal-800 font-black">{score} / {currentQuestionIndex + 1} Correct</strong>
                        </span>
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-sm transition hover:from-teal-800 hover:to-emerald-800 active:scale-95 cursor-pointer ring-2 ring-teal-500/20"
                        >
                          <span>{currentQuestionIndex + 1 === totalQuestions ? 'Reveal Intelligence Certificate' : 'Next Question'}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              /* Final Certificate Scorecard Card */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xl space-y-5"
              >
                <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-44 w-80 rounded-full bg-amber-400/20 blur-3xl" />

                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-200 to-yellow-100 text-amber-800 shadow-md ring-8 ring-amber-100/60">
                  <Trophy className="h-8 w-8" />
                </div>

                <div className="relative z-10 space-y-1.5">
                  <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-black text-amber-900 shadow-2xs">
                    {rank.badge}
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-950">
                    {rank.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {rank.desc}
                  </p>
                </div>

                {/* Score Number Display Matrix */}
                <div className="relative z-10 grid grid-cols-3 gap-3 max-w-md mx-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
                    <span className="text-xl sm:text-2xl font-black text-teal-800">{score} / {totalQuestions}</span>
                  </div>
                  <div className="border-x border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">XP Earned</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-600">+{totalXp} XP</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Top Combo</span>
                    <span className="text-xl sm:text-2xl font-black text-orange-600">{maxStreak}x</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleShareScore}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Challenge on WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                    <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Play Again</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar Column (4 Cols on Desktop) */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Module 1: Live Daily Leaderboard */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">
                    Today&apos;s Leaderboard
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9.5px] font-black text-emerald-800 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  REAL-TIME
                </span>
              </div>

              <div className="space-y-2">
                {LEADERBOARD_PREVIEW.map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between rounded-xl bg-slate-50/90 px-3 py-2 text-xs font-medium border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-700 shadow-2xs">
                        {user.rank}
                      </span>
                      <span className="text-sm">{user.flag}</span>
                      <span className="font-bold text-slate-900 truncate text-xs">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-teal-800 text-xs">{user.score}</span>
                      <span className="text-[10px] text-amber-600 font-bold font-mono">{user.xp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module 2: 7-Day Challenge Streak Tracker */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-700" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">
                    7-Day Streak Tracker
                  </h3>
                </div>
                <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                  Active
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center rounded-xl p-2 text-center transition-all ${
                      i === 3
                        ? 'bg-teal-700 text-white font-black shadow-xs ring-2 ring-teal-400/40'
                        : i < 3
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                        : 'bg-slate-50 text-slate-400 border border-slate-100 font-medium'
                    }`}
                  >
                    <span className="text-[10px]">{day}</span>
                    <span className="text-xs mt-0.5">{i === 3 ? '🎯' : i < 3 ? '✓' : '•'}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Play every morning at 06:00 AM to maintain your streak multiplier badge.
              </p>
            </div>

            {/* Module 3: Live Opinion Pulse Poll of the Day */}
            <PollOfTheDayWidget />
          </aside>
        </div>
      </main>
    </div>
  );
}
