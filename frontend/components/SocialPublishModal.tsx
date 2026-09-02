'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Share2,
  ExternalLink,
  Layers,
  Calendar,
} from 'lucide-react';
import { SocialCardCanvas, type SocialAspectRatio } from './SocialCardCanvas';
import {
  generateAllSocialBundles,
  type SocialArticleInput,
  type SocialPlatformCopy,
} from '@/lib/social-copy';
import { categoryLabel } from '@/lib/category-theme';
import { extractArticleImages } from '@/lib/story-image';

interface Props {
  isOpen: boolean;
  article: SocialArticleInput | null;
  onClose: () => void;
  onPostSuccess?: (message: string) => void;
}

export function SocialPublishModal({
  isOpen,
  article,
  onClose,
  onPostSuccess,
}: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<'linkedin' | 'instagram' | 'facebook' | 'twitter'>('linkedin');
  const [aspectRatio, setAspectRatio] = useState<SocialAspectRatio>('1.91:1');
  const [bundles, setBundles] = useState<Record<string, SocialPlatformCopy>>({});
  const [customCaptions, setCustomCaptions] = useState<Record<string, string>>({});
  const [targetChannels, setTargetChannels] = useState<Record<string, boolean>>({
    linkedin: true,
    facebook: true,
    twitter: true,
    instagram: false,
  });

  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [availableImages, setAvailableImages] = useState<Array<{ src: string; title: string }>>([]);

  const [publishing, setPublishing] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string | null>(null);

  // Generate bundles on article change
  useEffect(() => {
    if (article) {
      const generated = generateAllSocialBundles(article);
      setBundles(generated);
      setCustomCaptions({
        linkedin: generated.linkedin?.caption || '',
        instagram: generated.instagram?.caption || '',
        facebook: generated.facebook?.caption || '',
        twitter: generated.twitter?.caption || '',
      });
      setAspectRatio(generated[selectedPlatform]?.suggestedAspectRatio || '1.91:1');
      setPublishStatus(null);

      // Extract high-res candidate images
      const extracted = extractArticleImages(article.image_url, article.title, article.category, article.body);
      setAvailableImages(extracted);
      setActiveImageUrl(extracted[0]?.src || article.image_url || null);
    }
  }, [article, selectedPlatform]);

  if (!isOpen || !article) return null;

  const currentBundle = bundles[selectedPlatform];
  const currentCaption = customCaptions[selectedPlatform] || '';

  const handlePlatformTabChange = (plat: 'linkedin' | 'instagram' | 'facebook' | 'twitter') => {
    setSelectedPlatform(plat);
    if (bundles[plat]?.suggestedAspectRatio) {
      setAspectRatio(bundles[plat].suggestedAspectRatio);
    }
  };

  const handleCaptionChange = (val: string) => {
    setCustomCaptions((prev) => ({ ...prev, [selectedPlatform]: val }));
  };

  const handleCopyCaption = async () => {
    if (!currentCaption || typeof window === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(currentCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 3050);
    } catch {
      // ignore
    }
  };

  const toggleTargetChannel = (plat: string) => {
    setTargetChannels((prev) => ({ ...prev, [plat]: !prev[plat] }));
  };

  const handlePublishNow = async () => {
    const selectedChannels = Object.entries(targetChannels)
      .filter(([, active]) => active)
      .map(([ch]) => ch);

    if (selectedChannels.length === 0) {
      setPublishStatus({
        type: 'error',
        message: 'Please select at least one social media channel to publish to.',
      });
      return;
    }

    setPublishing(true);
    setPublishStatus(null);

    try {
      const selectedBg = activeImageUrl || article.image_url || '';
      const params = new URLSearchParams({
        title: article.title,
        category: article.category,
        ratio: aspectRatio,
      });
      if (selectedBg) params.set('image', selectedBg);

      // Full public URL for the branded card (both /social-card and /api/social/card)
      const brandedCardUrl = `https://www.newsfree365.live/social-card?${params.toString()}`;
      const primaryCaption = customCaptions[selectedPlatform] || customCaptions.linkedin || currentCaption || article.title;

      const payload = {
        articleId: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        channels: selectedChannels,
        caption: primaryCaption,
        content: primaryCaption,
        text: primaryCaption,
        linkedinCaption: customCaptions.linkedin || primaryCaption,
        instagramCaption: customCaptions.instagram || primaryCaption,
        facebookCaption: customCaptions.facebook || primaryCaption,
        twitterCaption: customCaptions.twitter || primaryCaption,
        captions: customCaptions,
        aspectRatio,
        sourceName: article.source_name,
        imageUrl: brandedCardUrl,
        cardImageUrl: brandedCardUrl,
        mediaUrl: brandedCardUrl,
        directImageUrl: selectedBg,
        rawImageUrl: selectedBg,
        cardDataUrl: generatedDataUrl,
      };

      const res = await fetch('/api/admin/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.ok !== false) {
        setPublishStatus({
          type: 'success',
          message: data.message || `Successfully dispatched post to: ${selectedChannels.join(', ')}`,
        });
        if (onPostSuccess) onPostSuccess(data.message);
      } else {
        setPublishStatus({
          type: 'error',
          message: data.error || 'Failed to publish to selected channels.',
        });
      }
    } catch {
      setPublishStatus({
        type: 'error',
        message: 'Network error publishing social media post.',
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-b from-[#11192a] via-[#0d1424] to-[#090e1a] shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-500/20 ring-1 ring-teal-400/40 text-white">
              <Share2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-white tracking-tight">
                  Social Media Publishing Studio
                </h2>
                <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30">
                  {categoryLabel(article.category).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-lg">
                {article.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-12 custom-scrollbar">
          {/* Left Column: Image Canvas & Aspect Ratio Switcher (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Sized Image Template
              </p>
              {/* Aspect Ratio Buttons */}
              <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
                {(['1.91:1', '1:1', '9:16', '16:9'] as SocialAspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${aspectRatio === ratio
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {ratio === '1.91:1' && 'Landscape (1.91:1)'}
                    {ratio === '1:1' && 'Square (1:1)'}
                    {ratio === '9:16' && 'Story (9:16)'}
                    {ratio === '16:9' && 'Twitter (16:9)'}
                  </button>
                ))}
              </div>
            </div>

            {/* High-Res Photo Selector (if multiple available) */}
            {availableImages.length > 1 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>HD Photo Choice</span>
                  <span className="text-teal-400 font-normal">{availableImages.length} available</span>
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {availableImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageUrl(img.src)}
                      className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${activeImageUrl === img.src
                          ? 'border-teal-400 shadow-md shadow-teal-500/20 ring-2 ring-teal-500/40 scale-105'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      title={img.title}
                    >
                      <img src={img.src} alt={img.title} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Canvas Renderer */}
            <SocialCardCanvas
              title={article.title}
              category={article.category}
              imageUrl={activeImageUrl || article.image_url}
              aspectRatio={aspectRatio}
              onImageGenerated={(url) => setGeneratedDataUrl(url)}
            />
          </div>

          {/* Right Column: Platform Copy, Channels & Approval Controls (7 cols) */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            {/* Platform Copy Tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Platform Caption & Copy
                </p>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:underline"
                >
                  {copiedCaption ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCaption ? 'Copied to Clipboard!' : 'Copy Caption'}</span>
                </button>
              </div>

              {/* Platform Switcher */}
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
                {(['linkedin', 'instagram', 'facebook', 'twitter'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => handlePlatformTabChange(plat)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold capitalize transition ${selectedPlatform === plat
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-sm ring-1 ring-teal-500/30'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    {plat === 'twitter' ? 'X (Twitter)' : plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Caption Textarea */}
            <div className="relative flex-1">
              <textarea
                value={currentCaption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                rows={9}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40 font-mono leading-relaxed"
                placeholder="Write customized post caption..."
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
                <span>{currentCaption.length}</span>
                {currentBundle && <span>/ {currentBundle.charLimit} chars</span>}
              </div>
            </div>

            {/* Target Distribution Channels */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                3. Dispatch Channels
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { key: 'linkedin', label: 'LinkedIn', desc: 'Company Page' },
                  { key: 'instagram', label: 'Instagram', desc: 'Feed & Stories' },
                  { key: 'facebook', label: 'Facebook', desc: 'Official Desk' },
                  { key: 'twitter', label: 'X (Twitter)', desc: 'Broadcast' },
                ].map((ch) => {
                  const active = targetChannels[ch.key];
                  return (
                    <button
                      key={ch.key}
                      type="button"
                      onClick={() => toggleTargetChannel(ch.key)}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${active
                          ? 'border-teal-500/60 bg-teal-950/30 ring-1 ring-teal-500/30'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`text-xs font-bold ${active ? 'text-teal-300' : 'text-slate-300'}`}>
                          {ch.label}
                        </span>
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-md border text-[10px] ${active
                              ? 'border-teal-400 bg-teal-500 text-slate-950 font-black'
                              : 'border-slate-700 bg-slate-800'
                            }`}
                        >
                          {active && '✓'}
                        </div>
                      </div>
                      <span className="mt-1 text-[10px] text-slate-400">{ch.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Alert */}
            {publishStatus && (
              <div
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs font-medium ${publishStatus.type === 'success'
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                    : 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                  }`}
              >
                {publishStatus.type === 'success' ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
                )}
                <span>{publishStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 bg-[#070b14] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePublishNow}
              disabled={publishing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 px-6 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:from-teal-400 hover:to-emerald-400 active:scale-95 disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 size={15} className="animate-spin text-slate-950" />
              ) : (
                <Send size={15} className="text-slate-950" />
              )}
              <span>{publishing ? 'Publishing Across Channels…' : 'Approve & Post Live'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
