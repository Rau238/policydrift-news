'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Languages, Search, X, Check, Globe, ChevronDown, Sparkles } from 'lucide-react';
import { CountryFlag } from '@/components/CountryFlag';

const STORAGE_KEY = 'pd_news_lang';
const DISMISSED_KEY = 'pd_lang_floating_dismissed';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  iso: string;
  flag?: string;
  category: 'popular' | 'global' | 'indian' | 'other';
}

export const WORLD_LANGUAGES: LanguageOption[] = [
  // Popular Global
  { code: 'en', name: 'English', nativeName: 'English', iso: 'us', category: 'popular' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', iso: 'in', category: 'popular' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', iso: 'es', category: 'popular' },
  { code: 'fr', name: 'French', nativeName: 'Français', iso: 'fr', category: 'popular' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', iso: 'de', category: 'popular' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', iso: 'sa', category: 'popular' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', iso: 'cn', category: 'popular' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', iso: 'jp', category: 'popular' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', iso: 'ru', category: 'popular' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', iso: 'br', category: 'popular' },

  // Indian Regional
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', iso: 'in', category: 'indian' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', iso: 'in', category: 'indian' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', iso: 'in', category: 'indian' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', iso: 'in', category: 'indian' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', iso: 'in', category: 'indian' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', iso: 'in', category: 'indian' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', iso: 'in', category: 'indian' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', iso: 'in', category: 'indian' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', iso: 'pk', category: 'indian' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', iso: 'in', category: 'indian' },

  // More World Languages
  { code: 'it', name: 'Italian', nativeName: 'Italiano', iso: 'it', category: 'global' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', iso: 'kr', category: 'global' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', iso: 'id', category: 'global' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', iso: 'tr', category: 'global' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', iso: 'nl', category: 'global' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', iso: 'pl', category: 'global' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', iso: 'vn', category: 'global' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', iso: 'th', category: 'global' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', iso: 'se', category: 'global' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', iso: 'gr', category: 'global' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', iso: 'il', category: 'global' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', iso: 'my', category: 'global' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', iso: 'ir', category: 'global' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', iso: 'ua', category: 'global' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', iso: 'ro', category: 'global' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', iso: 'hu', category: 'global' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', iso: 'cz', category: 'global' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', iso: 'dk', category: 'global' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', iso: 'fi', category: 'global' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', iso: 'no', category: 'global' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', iso: 'ph', category: 'global' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', iso: 'ke', category: 'global' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', iso: 'np', category: 'global' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', iso: 'lk', category: 'global' },
];

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'indian' | 'global'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const match = document.cookie.match(/googtrans=\/([^/]+)\/([^;]+)/);
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (match && match[2]) {
        setCurrentLang(match[2]);
      } else if (savedLang) {
        setCurrentLang(savedLang);
      } else {
        setCurrentLang('en');
      }

      if (sessionStorage.getItem(DISMISSED_KEY) === 'true') {
        setDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  const setCookieAll = (name: string, value: string) => {
    const host = window.location.hostname;
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      document.cookie = `${name}=${value};path=/;domain=.${host};max-age=31536000`;
      document.cookie = `${name}=${value};path=/;domain=${host};max-age=31536000`;
    }
  };

  const clearCookieAll = (name: string) => {
    const host = window.location.hostname;
    const epoch = 'Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `${name}=;path=/;expires=${epoch}`;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      document.cookie = `${name}=;path=/;domain=.${host};expires=${epoch}`;
      document.cookie = `${name}=;path=/;domain=${host};expires=${epoch}`;
    }
  };

  const triggerTranslateLive = (lang: string): boolean => {
    try {
      const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  const applyLanguage = useCallback((lang: string) => {
    setCurrentLang(lang);
    setModalOpen(false);

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }

    if (lang === 'en') {
      clearCookieAll('googtrans');
      setCookieAll('googtrans', '/en/en');
    } else {
      setCookieAll('googtrans', `/en/${lang}`);
    }

    // Trigger instant live client-side translation without page reload
    const triggered = triggerTranslateLive(lang);
    if (!triggered) {
      let count = 0;
      const timer = setInterval(() => {
        count++;
        if (triggerTranslateLive(lang) || count >= 6) {
          clearInterval(timer);
        }
      }, 120);
    }
  }, []);

  const activeLanguageObj = useMemo(() => {
    return WORLD_LANGUAGES.find((l) => l.code === currentLang) || {
      code: currentLang,
      name: currentLang.toUpperCase(),
      nativeName: currentLang.toUpperCase(),
      iso: 'global',
      category: 'popular' as const,
    };
  }, [currentLang]);

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return WORLD_LANGUAGES.filter((item) => {
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'popular' && item.category === 'popular') ||
        (activeTab === 'indian' && item.category === 'indian') ||
        (activeTab === 'global' && item.category === 'global');

      if (!matchesTab) return false;
      if (!q) return true;

      return (
        item.name.toLowerCase().includes(q) ||
        item.nativeName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, activeTab]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      <aside
        aria-label="Language switcher"
        suppressHydrationWarning
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center select-none"
      >
        {dismissed ? (
          /* Minimized Discreet Trigger when user dismissed */
          <button
            type="button"
            onClick={() => {
              setDismissed(false);
              try {
                sessionStorage.removeItem(DISMISSED_KEY);
              } catch {}
            }}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-teal-500/40 bg-slate-950/90 text-teal-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl ring-1 ring-white/10 transition-all hover:scale-110 hover:border-teal-400 hover:bg-slate-900 active:scale-95 cursor-pointer"
            title="Open Language Switcher"
            aria-label="Open Language Switcher"
          >
            <Languages className="h-4 w-4 transition-transform group-hover:rotate-12" />
          </button>
        ) : (
          /* Floating Multi-Language Selector Pill with Real SVG/PNG Flags & Dismiss Button */
          <div
            suppressHydrationWarning
            className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-teal-500/40 bg-slate-950/95 p-1 sm:p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.65)] backdrop-blur-2xl ring-1 ring-white/15 transition-all hover:border-teal-400 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Quick English Toggle */}
            <button
              type="button"
              onClick={() => applyLanguage('en')}
              className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Translate to English"
            >
              <CountryFlag iso="us" size={16} className="rounded-[2px]" />
              <span>EN</span>
            </button>

            {/* Quick Hindi Toggle */}
            <button
              type="button"
              onClick={() => applyLanguage('hi')}
              className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                currentLang === 'hi'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Translate to Hindi (हिन्दी)"
            >
              <CountryFlag iso="in" size={16} className="rounded-[2px]" />
              <span>हिन्दी</span>
            </button>

            {/* All World Languages Modal Button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                currentLang !== 'en' && currentLang !== 'hi'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
              title="Choose from 40+ World Languages"
              aria-label="Choose Global Language"
            >
              {currentLang !== 'en' && currentLang !== 'hi' ? (
                <CountryFlag iso={activeLanguageObj.iso} size={16} className="rounded-[2px]" />
              ) : (
                <Globe className="h-3.5 w-3.5 text-teal-300" />
              )}
              <span className="truncate max-w-[70px] sm:max-w-[90px]">
                {currentLang !== 'en' && currentLang !== 'hi' ? activeLanguageObj.nativeName : 'More'}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {/* Dismiss / Close Floating Bar */}
            <button
              type="button"
              onClick={handleDismiss}
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition active:scale-90 cursor-pointer ml-0.5"
              title="Dismiss floating language bar"
              aria-label="Dismiss language switcher"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </aside>

      {/* Global Languages Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-label="Select Country Language"
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl border border-teal-500/40 bg-slate-950 text-white shadow-2xl ring-1 ring-white/10 flex flex-col max-h-[88vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 sm:px-6 sm:py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/40 shrink-0">
                  <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Select Language</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Live translation across 40+ country and regional languages
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition active:scale-95 cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Bar & Category Filters */}
            <div className="border-b border-slate-800 bg-slate-900/40 p-3 sm:p-4 space-y-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search language or country (e.g. Spanish, German, 日本語, বাংলা)..."
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900 py-2 sm:py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pd-scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 font-bold transition whitespace-nowrap cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-teal-500/25 text-teal-200 ring-1 ring-teal-400/50'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({WORLD_LANGUAGES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('popular')}
                  className={`rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    activeTab === 'popular'
                      ? 'bg-teal-500/25 text-teal-200 ring-1 ring-teal-400/50'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Popular World</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('indian')}
                  className={`rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'indian'
                      ? 'bg-teal-500/25 text-teal-200 ring-1 ring-teal-400/50'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <CountryFlag iso="in" size={13} className="rounded-xs shrink-0" />
                  <span>Indian Regional</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('global')}
                  className={`rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    activeTab === 'global'
                      ? 'bg-teal-500/25 text-teal-200 ring-1 ring-teal-400/50'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="h-3 w-3 text-teal-400" />
                  <span>International</span>
                </button>
              </div>
            </div>

            {/* Languages Grid */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {filteredLanguages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                  <Globe className="h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No matching language found</p>
                  <p className="text-xs text-slate-500">Try searching with a different country or spelling</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredLanguages.map((item) => {
                    const isSelected = currentLang === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => applyLanguage(item.code)}
                        className={`group flex items-center justify-between gap-2.5 rounded-xl border p-2 sm:p-2.5 text-left transition-all duration-200 cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'border-teal-400 bg-gradient-to-r from-teal-950/80 to-slate-900 ring-1 ring-teal-400 shadow-md'
                            : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CountryFlag iso={item.iso} size={20} className="rounded-[2.5px] shadow-xs shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-xs sm:text-sm font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                              {item.nativeName}
                            </span>
                            <span className="block text-[10px] sm:text-[10.5px] text-slate-400 truncate">
                              {item.name} ({item.code})
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-400 text-slate-950">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
