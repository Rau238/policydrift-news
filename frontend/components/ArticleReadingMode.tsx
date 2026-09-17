'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  BookOpen,
  Sun,
  Moon,
  Coffee,
  ArrowLeft,
  Glasses,
  Home,
} from 'lucide-react';

type ReadingTheme = 'light' | 'sepia' | 'dark';
type FontFamily = 'sans' | 'serif' | 'mono';

type Props = {
  title: string;
  category?: string;
};

export function ArticleReadingMode({ title, category }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<ReadingTheme>('light');
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans');
  const [readingProgress, setReadingProgress] = useState(0);
  const [mobileDockOpen, setMobileDockOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut: Pressing Escape closes Reading Mode
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll reading progress calculation
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setReadingProgress(0);
        return;
      }
      const scrolled = (window.scrollY / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, Math.round(scrolled))));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  // Sync settings with article body container and body class
  useEffect(() => {
    const articleContainer =
      document.querySelector<HTMLElement>('article.pd-main-article') ||
      document.querySelector<HTMLElement>('article');
    if (!articleContainer) return;

    if (isOpen) {
      document.body.classList.add('pd-reading-mode-active');
      document.body.setAttribute('data-reading-body-theme', theme);
      articleContainer.setAttribute('data-reading-theme', theme);
      articleContainer.setAttribute('data-reading-font', fontFamily);
      articleContainer.style.setProperty('--pd-reader-font-size', `${fontSize}px`);
    } else {
      document.body.classList.remove('pd-reading-mode-active');
      document.body.removeAttribute('data-reading-body-theme');
      articleContainer.removeAttribute('data-reading-theme');
      articleContainer.removeAttribute('data-reading-font');
      articleContainer.style.removeProperty('--pd-reader-font-size');
    }

    return () => {
      document.body.classList.remove('pd-reading-mode-active');
      document.body.removeAttribute('data-reading-body-theme');
      if (articleContainer) {
        articleContainer.removeAttribute('data-reading-theme');
        articleContainer.removeAttribute('data-reading-font');
        articleContainer.style.removeProperty('--pd-reader-font-size');
      }
    };
  }, [isOpen, fontSize, theme, fontFamily]);

  return (
    <>
      {/* In-page Reader View Toggle Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group inline-flex h-9 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 active:scale-95 shadow-xs ${
          isOpen
            ? 'border border-teal-500/80 bg-gradient-to-r from-teal-500/15 to-emerald-500/15 text-teal-800 ring-2 ring-teal-400/30 font-bold'
            : 'border border-slate-200/90 bg-slate-50/80 text-slate-700 hover:border-teal-400 hover:bg-teal-50/60 hover:text-teal-900'
        }`}
        title="Toggle Distraction-Free Reading Mode"
        aria-label="Distraction-Free Reading Mode"
      >
        <BookOpen
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? 'text-teal-600 scale-110' : 'text-slate-500 group-hover:text-teal-600'
          }`}
          strokeWidth={2.25}
        />
        <span className="hidden xs:inline">{isOpen ? 'Reading View' : 'Reader View'}</span>
      </button>

      {/* Floating Elements (Rendered via React Portal directly on body for zero clipping/interference) */}
      {mounted &&
        createPortal(
          <>
            {/* Top Fixed Reading Progress Bar (Visible during active reading mode or scrolling) */}
            <div
              className={`fixed inset-x-0 top-0 z-[10000] h-1.5 bg-slate-300/60 dark:bg-slate-800/80 backdrop-blur-xs transition-opacity duration-300 pointer-events-none ${
                isOpen || readingProgress > 1 ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            >
              <div
                className="h-full bg-gradient-to-r from-teal-700 via-teal-500 to-emerald-400 transition-all duration-100 ease-out shadow-[0_0_14px_rgba(13,148,136,0.95)]"
                style={{ width: `${Math.max(readingProgress, 2)}%` }}
              />
            </div>

            {isOpen && (
              <>
                {/* Top-Left Floating Exit Banner (Responsive positioning) */}
                <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-[9999] animate-in fade-in slide-in-from-top-3 duration-200">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="group inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-teal-500/50 bg-slate-950/95 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-slate-100 shadow-2xl backdrop-blur-2xl ring-1 ring-white/15 transition-all hover:border-teal-400 hover:bg-slate-900 hover:text-teal-300 hover:scale-105 active:scale-95"
                    title="Exit Reading Mode (Esc)"
                    aria-label="Exit Reading Mode"
                  >
                    <ArrowLeft
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-400 transition-transform group-hover:-translate-x-1"
                      strokeWidth={2.5}
                    />
                    <span className="text-[11px] sm:text-xs">Exit Reading Mode</span>
                    <kbd className="hidden sm:inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400">
                      Esc
                    </kbd>
                  </button>
                </div>

                {/* Desktop: Vertical Floating Customizer Dock on Right (Hidden on mobile) */}
                <div className="hidden md:flex fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-[9999] flex-col items-center animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-teal-500/30 bg-slate-950/95 p-2 text-white shadow-2xl shadow-black/80 backdrop-blur-2xl ring-1 ring-white/10">
                    {/* Header with Live Progress % */}
                    <div className="flex flex-col items-center pt-0.5 pb-1 border-b border-white/10 w-full">
                      <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
                        <Glasses className="h-3 w-3" />
                        <span>Aa</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 tabular-nums">
                        {readingProgress}%
                      </span>
                    </div>

                    {/* Font Size Scaling */}
                    <div className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-1 w-full">
                      <button
                        type="button"
                        onClick={() => setFontSize((s) => Math.min(26, s + 2))}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-300 transition hover:bg-white/15 hover:text-white active:scale-95"
                        title="Larger font size"
                      >
                        A+
                      </button>
                      <span className="tabular-nums text-[10px] font-bold text-teal-300 text-center py-0.5">
                        {fontSize}px
                      </span>
                      <button
                        type="button"
                        onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-300 transition hover:bg-white/15 hover:text-white active:scale-95"
                        title="Smaller font size"
                      >
                        A-
                      </button>
                    </div>

                    {/* Font Family Selector (Sans / Serif / Mono) */}
                    <div className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-1 w-full">
                      <button
                        type="button"
                        onClick={() => setFontFamily('sans')}
                        className={`w-full rounded-lg py-1 px-1.5 text-[10px] font-sans transition-all text-center ${
                          fontFamily === 'sans'
                            ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Sans-Serif Font"
                      >
                        Sans
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontFamily('serif')}
                        className={`w-full rounded-lg py-1 px-1.5 text-[10px] font-serif transition-all text-center ${
                          fontFamily === 'serif'
                            ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Serif Book Font"
                      >
                        Serif
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontFamily('mono')}
                        className={`w-full rounded-lg py-1 px-1.5 text-[10px] font-mono transition-all text-center ${
                          fontFamily === 'mono'
                            ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Monospace Font"
                      >
                        Mono
                      </button>
                    </div>

                    {/* Theme Selector (Day / Sepia / Dark) */}
                    <div className="flex flex-col items-center gap-1.5 bg-white/5 rounded-xl p-1.5 w-full">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                          theme === 'light'
                            ? 'bg-amber-100 text-slate-950 ring-2 ring-teal-400 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Day Paper Theme"
                      >
                        <Sun className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('sepia')}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                          theme === 'sepia'
                            ? 'bg-[#f4ecd8] text-[#433422] ring-2 ring-teal-400 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Warm Sepia Theme"
                      >
                        <Coffee className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                          theme === 'dark'
                            ? 'bg-slate-800 text-teal-300 ring-2 ring-teal-400 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Slate Dark Theme"
                      >
                        <Moon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile: Floating Bottom-Right Control Pill (Hidden on desktop) */}
                <div className="flex md:hidden fixed bottom-4 right-4 z-[9999] flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
                  {mobileDockOpen && (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-teal-500/40 bg-slate-950/98 p-3 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-2xl animate-in zoom-in-95 duration-150 w-48">
                      {/* Font Size Scaling */}
                      <div className="flex items-center justify-between w-full bg-white/5 rounded-xl p-1.5">
                        <button
                          type="button"
                          onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-300 bg-white/10 active:scale-95"
                        >
                          A-
                        </button>
                        <span className="tabular-nums text-xs font-bold text-teal-300">
                          {fontSize}px
                        </span>
                        <button
                          type="button"
                          onClick={() => setFontSize((s) => Math.min(26, s + 2))}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-300 bg-white/10 active:scale-95"
                        >
                          A+
                        </button>
                      </div>

                      {/* Font Family Selector */}
                      <div className="grid grid-cols-3 gap-1 w-full bg-white/5 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => setFontFamily('sans')}
                          className={`rounded-lg py-1 text-[11px] font-sans text-center ${
                            fontFamily === 'sans'
                              ? 'bg-teal-400 text-slate-950 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          Sans
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontFamily('serif')}
                          className={`rounded-lg py-1 text-[11px] font-serif text-center ${
                            fontFamily === 'serif'
                              ? 'bg-teal-400 text-slate-950 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          Serif
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontFamily('mono')}
                          className={`rounded-lg py-1 text-[11px] font-mono text-center ${
                            fontFamily === 'mono'
                              ? 'bg-teal-400 text-slate-950 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          Mono
                        </button>
                      </div>

                      {/* Theme Selector */}
                      <div className="grid grid-cols-3 gap-1.5 w-full bg-white/5 rounded-xl p-1.5">
                        <button
                          type="button"
                          onClick={() => setTheme('light')}
                          className={`flex items-center justify-center h-8 rounded-lg ${
                            theme === 'light' ? 'bg-amber-100 text-slate-950 ring-2 ring-teal-400' : 'text-slate-400'
                          }`}
                        >
                          <Sun className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('sepia')}
                          className={`flex items-center justify-center h-8 rounded-lg ${
                            theme === 'sepia' ? 'bg-[#f4ecd8] text-[#433422] ring-2 ring-teal-400' : 'text-slate-400'
                          }`}
                        >
                          <Coffee className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('dark')}
                          className={`flex items-center justify-center h-8 rounded-lg ${
                            theme === 'dark' ? 'bg-slate-800 text-teal-300 ring-2 ring-teal-400' : 'text-slate-400'
                          }`}
                        >
                          <Moon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mobile FAB Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setMobileDockOpen((prev) => !prev)}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-teal-500/60 bg-slate-950/95 px-4 text-xs font-bold text-slate-100 shadow-2xl backdrop-blur-2xl ring-2 ring-white/10 active:scale-95"
                    aria-label="Reading Mode Settings"
                  >
                    <Glasses className="h-4 w-4 text-teal-400" />
                    <span className="font-mono text-[11px] text-teal-300 font-bold">{readingProgress}%</span>
                  </button>
                </div>
              </>
            )}
          </>,
          document.body
        )}
    </>
  );
}
