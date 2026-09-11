'use client';

import { useState, useEffect, useRef } from 'react';
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
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
  RefreshCw,
  FolderUp,
} from 'lucide-react';
import { SocialCardCanvas, type SocialAspectRatio } from './SocialCardCanvas';
import { AdvancedImageEditorModal, type AdvanceEditorSettings } from './AdvancedImageEditorModal';
import {
  generateAllSocialBundles,
  type SocialArticleInput,
  type SocialPlatformCopy,
} from '@/lib/social-copy';
import { categoryLabel } from '@/lib/category-theme';
import { extractArticleImages } from '@/lib/story-image';

// Official Social Platform Icons (Pixel-perfect SVGs)
export function TelegramIcon({ className = 'w-4 h-4', fill = 'currentColor' }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.847-1.107 4.743-1.579 6.772-.2.86-.518 1.147-.824 1.176-.667.06-1.173-.44-1.819-.863-1.01-.663-1.58-1.077-2.56-1.723-1.133-.746-.399-1.156.247-1.828.169-.175 3.109-2.85 3.165-3.09.007-.03.014-.143-.053-.202-.066-.059-.164-.039-.234-.023-.1.023-1.685 1.07-4.757 3.143-.45.31-.857.462-1.222.453-.402-.009-1.176-.228-1.752-.415-.706-.23-1.267-.352-1.218-.743.025-.204.307-.413.844-.627 3.309-1.44 5.518-2.39 6.627-2.85 3.153-1.31 3.808-1.538 4.234-1.545.094-.002.303.022.439.133.114.093.146.22.161.309.015.09.034.293.019.453z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = 'w-4 h-4', fill = 'currentColor' }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill}>
      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.677.15-.2.301-.777.978-.953 1.178-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.633-.928-2.237-.244-.588-.493-.508-.677-.518-.175-.009-.376-.011-.577-.011s-.527.075-.803.376c-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.912 1.23 3.113.15.2 2.124 3.243 5.145 4.549.719.31 1.28.496 1.718.636.722.23 1.379.197 1.9-.12.58-.354 1.78-1.455 2.031-2.864.25-1.409.25-2.618.175-2.744-.075-.125-.276-.2-.577-.35zM12.042 21.947c-1.802 0-3.567-.484-5.114-1.402l-.367-.218-3.799.996 1.014-3.702-.239-.38a9.92 9.92 0 0 1-1.522-5.263C2.015 6.467 6.51 1.972 12.042 1.972c2.678 0 5.196 1.044 7.089 2.937a10.003 10.003 0 0 1 2.936 7.088c0 5.534-4.495 10.029-10.025 10.029v-.079zM12.042 0C5.402 0 0 5.402 0 12.042c0 2.12.553 4.186 1.605 6.008L0 24l6.115-1.605a12.008 12.008 0 0 0 5.927 1.572c6.64 0 12.042-5.402 12.042-12.042C24.084 5.402 18.682 0 12.042 0z" />
    </svg>
  );
}

export function LinkedInIcon({ className = 'w-4 h-4', fill = 'currentColor' }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export function XIcon({ className = 'w-4 h-4', fill = 'currentColor' }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-4 h-4', fill = 'currentColor' }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'w-4 h-4', fill = 'currentColor' }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

interface Props {
  isOpen: boolean;
  article: SocialArticleInput | null;
  onClose: () => void;
  onPostSuccess?: (message: string) => void;
}

const RATIO_CONFIG: Record<
  SocialAspectRatio,
  { label: string; ratio: string; dims: string; badge: string }
> = {
  '1.91:1': {
    label: 'Landscape',
    ratio: '1.91:1',
    dims: '1200 × 630',
    badge: '1.91:1',
  },
  '1:1': {
    label: 'Square',
    ratio: '1:1',
    dims: '1080 × 1080',
    badge: '1:1',
  },
  '9:16': {
    label: 'Story / Reel',
    ratio: '9:16',
    dims: '1080 × 1920',
    badge: '9:16',
  },
  '16:9': {
    label: 'Wide 16:9',
    ratio: '16:9',
    dims: '1200 × 675',
    badge: '16:9',
  },
};

const PLATFORM_RECOMMENDED_RATIO: Record<string, SocialAspectRatio> = {
  telegram: '1.91:1',
  whatsapp: '1:1',
  linkedin: '1.91:1',
  twitter: '16:9',
  facebook: '1.91:1',
  instagram: '1:1',
};

export function SocialPublishModal({
  isOpen,
  article,
  onClose,
  onPostSuccess,
}: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<'linkedin' | 'instagram' | 'facebook' | 'twitter' | 'telegram' | 'whatsapp'>('telegram');
  const [aspectRatio, setAspectRatio] = useState<SocialAspectRatio>('1.91:1');
  const [bundles, setBundles] = useState<Record<string, SocialPlatformCopy>>({});
  const [customCaptions, setCustomCaptions] = useState<Record<string, string>>({});
  const [targetChannels, setTargetChannels] = useState<Record<string, boolean>>({
    telegram: true,
    whatsapp: true,
    linkedin: true,
    facebook: false,
    twitter: true,
    instagram: false,
  });

  // Image source state (article photos vs upload vs direct URL)
  const [imageSourceMode, setImageSourceMode] = useState<'article' | 'upload' | 'url'>('article');
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [availableImages, setAvailableImages] = useState<Array<{ src: string; title: string }>>([]);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string | null>(null);
  const [channelStatus, setChannelStatus] = useState<Record<string, any>>({});

  // Advance Studio Modal State
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioCustomizedUrl, setStudioCustomizedUrl] = useState<string | null>(null);
  const [studioSettings, setStudioSettings] = useState<AdvanceEditorSettings | null>(null);

  // 1. Fetch real-time channel connection status & restore user preferences from localStorage
  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/social/status')
        .then((r) => r.json())
        .then((d) => {
          if (d.channels) setChannelStatus(d.channels);
        })
        .catch(() => {});

      // Restore last selected channels & ratio from localStorage
      try {
        const savedChannels = localStorage.getItem('nf365_social_target_channels');
        if (savedChannels) {
          const parsed = JSON.parse(savedChannels);
          if (parsed && typeof parsed === 'object') {
            setTargetChannels((prev) => ({ ...prev, ...parsed }));
          }
        }
        const savedRatio = localStorage.getItem('nf365_social_aspect_ratio') as SocialAspectRatio | null;
        if (savedRatio && ['1.91:1', '1:1', '9:16', '16:9'].includes(savedRatio)) {
          setAspectRatio(savedRatio);
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  // Generate bundles on article change
  useEffect(() => {
    if (article) {
      const generated = generateAllSocialBundles(article);
      setBundles(generated);
      setCustomCaptions({
        telegram: generated.telegram?.caption || '',
        whatsapp: generated.whatsapp?.caption || '',
        linkedin: generated.linkedin?.caption || '',
        instagram: generated.instagram?.caption || '',
        facebook: generated.facebook?.caption || '',
        twitter: generated.twitter?.caption || '',
      });
      setPublishStatus(null);

      // Extract high-res candidate images
      const extracted = extractArticleImages(article.image_url, article.title, article.category, article.body);
      setAvailableImages(extracted);
      setActiveImageUrl(extracted[0]?.src || article.image_url || null);
      setCustomUrlInput(article.image_url || '');
      setUploadedFileName(null);
      setUploadedFileSize(null);
    }
  }, [article]);

  if (!isOpen || !article) return null;

  const currentBundle = bundles[selectedPlatform];
  const currentCaption = customCaptions[selectedPlatform] || '';

  const handlePlatformTabChange = (plat: 'linkedin' | 'instagram' | 'facebook' | 'twitter' | 'telegram' | 'whatsapp') => {
    setSelectedPlatform(plat);
    const recRatio = PLATFORM_RECOMMENDED_RATIO[plat] || bundles[plat]?.suggestedAspectRatio;
    if (recRatio) {
      handleAspectRatioChange(recRatio);
    }
  };

  const handleCaptionChange = (val: string) => {
    setCustomCaptions((prev) => ({ ...prev, [selectedPlatform]: val }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const sizeKb = (file.size / 1024).toFixed(1);
    setUploadedFileSize(file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKb} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setActiveImageUrl(dataUrl);
        setStudioCustomizedUrl(null);
        setPublishStatus(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToArticleImage = () => {
    const original = availableImages[0]?.src || article?.image_url || null;
    setActiveImageUrl(original);
    setStudioCustomizedUrl(null);
    setImageSourceMode('article');
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setCustomUrlInput(article?.image_url || '');
  };

  const handleApplyCustomUrl = () => {
    const url = customUrlInput.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/'))) {
      setActiveImageUrl(url);
      setStudioCustomizedUrl(null);
    }
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

  const handleDirectShare = () => {
    if (selectedPlatform === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(currentCaption)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (selectedPlatform === 'telegram') {
      const articleUrl = `https://www.newsfree365.live/news/${article.slug}`;
      const url = `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (selectedPlatform === 'twitter') {
      const articleUrl = `https://www.newsfree365.live/news/${article.slug}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(currentCaption)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (selectedPlatform === 'linkedin') {
      const articleUrl = `https://www.newsfree365.live/news/${article.slug}`;
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (selectedPlatform === 'facebook') {
      const articleUrl = `https://www.newsfree365.live/news/${article.slug}`;
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleTargetChannel = (plat: string) => {
    setTargetChannels((prev) => {
      const updated = { ...prev, [plat]: !prev[plat] };
      try {
        localStorage.setItem('nf365_social_target_channels', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const selectAllChannels = (selectAll: boolean) => {
    setTargetChannels((prev) => {
      const updated: Record<string, boolean> = {};
      Object.keys(prev).forEach((k) => {
        updated[k] = selectAll;
      });
      try {
        localStorage.setItem('nf365_social_target_channels', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleAspectRatioChange = (ratio: SocialAspectRatio) => {
    setAspectRatio(ratio);
    try {
      localStorage.setItem('nf365_social_aspect_ratio', ratio);
    } catch {}
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

    // Persist current channel selection and aspect ratio preferences
    try {
      localStorage.setItem('nf365_social_target_channels', JSON.stringify(targetChannels));
      localStorage.setItem('nf365_social_aspect_ratio', aspectRatio);
    } catch {}

    setPublishing(true);
    setPublishStatus(null);

    try {
      const selectedBg = activeImageUrl || article.image_url || '';
      const params = new URLSearchParams({
        title: article.title,
        category: article.category,
        ratio: aspectRatio,
      });
      if (selectedBg && selectedBg.startsWith('http')) params.set('image', selectedBg);

      // Full public URL for the branded card (both /social-card and /api/social/card)
      const brandedCardUrl = `https://www.newsfree365.live/social-card?${params.toString()}`;
      const primaryCaption = customCaptions[selectedPlatform] || customCaptions.telegram || customCaptions.whatsapp || customCaptions.linkedin || currentCaption || article.title;

      const payload = {
        articleId: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        channels: selectedChannels,
        caption: primaryCaption,
        content: primaryCaption,
        text: primaryCaption,
        telegramCaption: customCaptions.telegram || primaryCaption,
        whatsappCaption: customCaptions.whatsapp || primaryCaption,
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
        const successMessage = data.message || `Successfully dispatched post to: ${selectedChannels.join(', ')}`;
        setPublishStatus({
          type: 'success',
          message: `${successMessage} — Closing modal...`,
        });
        if (onPostSuccess) onPostSuccess(successMessage);

        // Auto close the modal after brief success presentation
        setTimeout(() => {
          onClose();
        }, 1200);
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

  const activeRatioConfig = RATIO_CONFIG[aspectRatio] || RATIO_CONFIG['1.91:1'];

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
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
                  Social & Messaging Automation Studio
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  1. Format & Dimensions
                </p>
                <span className="text-[10px] font-mono font-semibold text-teal-300 bg-teal-950/70 px-2 py-0.5 rounded-full border border-teal-500/30">
                  {activeRatioConfig.dims} px
                </span>
              </div>

              {/* Clean Modern Aspect Ratio Selector */}
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(RATIO_CONFIG) as SocialAspectRatio[]).map((ratio) => {
                  const cfg = RATIO_CONFIG[ratio];
                  const isSelected = aspectRatio === ratio;
                  const isRecForCurrent = PLATFORM_RECOMMENDED_RATIO[selectedPlatform] === ratio;

                  return (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => handleAspectRatioChange(ratio)}
                      className={`relative flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-teal-400/90 bg-teal-950/60 text-white shadow-sm ring-1 ring-teal-500/30'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {ratio === '1.91:1' && <LinkedInIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                          {ratio === '1:1' && <InstagramIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
                          {ratio === '9:16' && <InstagramIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
                          {ratio === '16:9' && <XIcon className="w-3.5 h-3.5 text-slate-200 shrink-0" />}
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-teal-300' : 'text-white'}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-mono text-slate-400">{cfg.dims}</span>
                          <span className="text-[9px] font-mono px-1 rounded bg-slate-950 border border-slate-800 text-slate-400">
                            {cfg.ratio}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-slate-950 font-black text-[10px] shrink-0 ml-1.5">
                          ✓
                        </span>
                      ) : isRecForCurrent ? (
                        <span className="rounded-full bg-teal-500/20 px-1.5 py-0.5 text-[8px] font-bold text-teal-300 border border-teal-500/30 shrink-0 ml-1.5">
                          Rec
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Choice Modes: Article Images / Custom Upload / Direct Link */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 shrink-0">
                  <ImageIcon size={13} className="text-teal-400" />
                  <span>Graphic Source</span>
                </p>
                <div className="flex items-center gap-1 rounded-xl bg-slate-950/90 p-0.5 border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setImageSourceMode('article')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold transition whitespace-nowrap ${
                      imageSourceMode === 'article'
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm ring-1 ring-teal-400/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <ImageIcon size={11} />
                    <span>Story HD ({availableImages.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceMode('upload')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold transition whitespace-nowrap ${
                      imageSourceMode === 'upload'
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm ring-1 ring-teal-400/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Upload size={11} />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceMode('url')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold transition whitespace-nowrap ${
                      imageSourceMode === 'url'
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm ring-1 ring-teal-400/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <LinkIcon size={11} />
                    <span>Paste Link</span>
                  </button>
                </div>
              </div>

              {/* Mode 1: Article Photos Picker */}
              {imageSourceMode === 'article' && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {availableImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveImageUrl(img.src);
                          setStudioCustomizedUrl(null);
                        }}
                        className={`group relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          activeImageUrl === img.src
                            ? 'border-teal-400 shadow-md shadow-teal-500/20 ring-2 ring-teal-500/40 scale-105'
                            : 'border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-600'
                        }`}
                        title={img.title}
                      >
                        <img src={img.src} alt={img.title} className="h-full w-full object-cover transition duration-200 group-hover:scale-105" />
                        {activeImageUrl === img.src && (
                          <div className="absolute inset-0 bg-teal-500/25 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-slate-950">
                              <Check size={12} className="font-black" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode 2: Custom Local File Upload */}
              {imageSourceMode === 'upload' && (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {activeImageUrl && activeImageUrl.startsWith('data:image/') ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-teal-500/40 bg-teal-950/30 p-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={activeImageUrl}
                          alt="Uploaded Graphic"
                          className="h-11 w-14 rounded-lg object-cover border border-teal-500/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-teal-200 truncate">
                            {uploadedFileName || 'Custom uploaded image'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {uploadedFileSize && (
                              <span className="text-[9px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.2 rounded border border-slate-700">
                                {uploadedFileSize}
                              </span>
                            )}
                            <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle size={10} />
                              <span>Active</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg bg-teal-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-teal-500 transition"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleResetToArticleImage}
                          className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
                          title="Reset to article photo"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-3.5 hover:border-teal-400 hover:bg-slate-900/80 transition text-center"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 mb-1.5 group-hover:scale-110 transition">
                        <Upload size={16} />
                      </div>
                      <p className="text-xs font-semibold text-slate-200">Click to upload image file</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, or WebP (HD)</p>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 3: Direct URL Link Input */}
              {imageSourceMode === 'url' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <LinkIcon size={12} className="absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or direct image URL"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-teal-500 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-500 transition shrink-0"
                    >
                      Apply
                    </button>
                    {activeImageUrl !== (availableImages[0]?.src || article.image_url) && (
                      <button
                        type="button"
                        onClick={handleResetToArticleImage}
                        className="rounded-xl bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition shrink-0"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {activeImageUrl && activeImageUrl.startsWith('http') && (
                    <div className="flex items-center justify-between text-[10px] text-teal-400 px-1">
                      <span className="truncate max-w-[220px] font-mono">Loaded: {activeImageUrl}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                        <Check size={10} /> Active
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Custom Studio Artwork Indicator */}
            {studioCustomizedUrl && (
              <div className="flex items-center justify-between rounded-xl border border-teal-500/40 bg-teal-950/40 p-2.5 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 shrink-0">
                    <Check size={12} className="stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-teal-200 truncate">
                      Custom Studio Artwork Active
                    </p>
                    <p className="text-[9px] text-slate-400">
                      Studio layers & styling preserved
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsStudioOpen(true)}
                    className="rounded-lg bg-teal-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-teal-500 transition"
                  >
                    Edit Studio
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioCustomizedUrl(null)}
                    className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
                    title="Reset to default dynamic template"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Renderer */}
            <SocialCardCanvas
              title={article.title}
              category={article.category}
              imageUrl={studioCustomizedUrl || activeImageUrl || article.image_url}
              aspectRatio={aspectRatio}
              isCustomComposite={Boolean(studioCustomizedUrl)}
              onImageGenerated={(url) => setGeneratedDataUrl(url)}
              onOpenStudio={() => setIsStudioOpen(true)}
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
                <div className="flex items-center gap-3">
                  {selectedPlatform === 'whatsapp' && (
                    <button
                      type="button"
                      onClick={handleDirectShare}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      <WhatsAppIcon className="w-3 h-3" />
                      <span>Open in WhatsApp</span>
                      <ExternalLink size={11} className="opacity-70" />
                    </button>
                  )}
                  {selectedPlatform === 'telegram' && (
                    <button
                      type="button"
                      onClick={handleDirectShare}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      <TelegramIcon className="w-3 h-3" />
                      <span>Open in Telegram</span>
                      <ExternalLink size={11} className="opacity-70" />
                    </button>
                  )}
                  {selectedPlatform === 'twitter' && (
                    <button
                      type="button"
                      onClick={handleDirectShare}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:underline"
                    >
                      <XIcon className="w-3 h-3" />
                      <span>Share on X</span>
                      <ExternalLink size={11} className="opacity-70" />
                    </button>
                  )}
                  {selectedPlatform === 'linkedin' && (
                    <button
                      type="button"
                      onClick={handleDirectShare}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      <LinkedInIcon className="w-3 h-3" />
                      <span>Share on LinkedIn</span>
                      <ExternalLink size={11} className="opacity-70" />
                    </button>
                  )}
                  {selectedPlatform === 'facebook' && (
                    <button
                      type="button"
                      onClick={handleDirectShare}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      <FacebookIcon className="w-3 h-3" />
                      <span>Share on Facebook</span>
                      <ExternalLink size={11} className="opacity-70" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:underline"
                  >
                    {copiedCaption ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
                  </button>
                </div>
              </div>

              {/* Platform Switcher with Official SVGs */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
                {[
                  { id: 'telegram', label: 'Telegram', icon: <TelegramIcon className="w-3.5 h-3.5 text-sky-400" /> },
                  { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" /> },
                  { id: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon className="w-3.5 h-3.5 text-blue-400" /> },
                  { id: 'twitter', label: 'X', icon: <XIcon className="w-3 h-3 text-slate-200" /> },
                  { id: 'facebook', label: 'Facebook', icon: <FacebookIcon className="w-3.5 h-3.5 text-blue-500" /> },
                  { id: 'instagram', label: 'Instagram', icon: <InstagramIcon className="w-3.5 h-3.5 text-pink-400" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePlatformTabChange(item.id as any)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-1 text-xs font-bold transition text-center ${
                      selectedPlatform === item.id
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-sm ring-1 ring-teal-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Only show suggestion if ratio differs from platform default */}
              {aspectRatio !== PLATFORM_RECOMMENDED_RATIO[selectedPlatform] && (
                <div className="mt-2 flex items-center justify-between rounded-xl bg-teal-950/40 px-3 py-1.5 border border-teal-500/30 text-xs">
                  <span className="text-teal-300 text-[11px]">
                    💡 Recommended size for <strong className="capitalize text-white">{selectedPlatform}</strong> is {RATIO_CONFIG[PLATFORM_RECOMMENDED_RATIO[selectedPlatform]].label} ({RATIO_CONFIG[PLATFORM_RECOMMENDED_RATIO[selectedPlatform]].dims})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAspectRatioChange(PLATFORM_RECOMMENDED_RATIO[selectedPlatform])}
                    className="rounded-lg bg-teal-500/20 hover:bg-teal-500/30 px-2.5 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/40 transition shrink-0 ml-2"
                  >
                    Switch
                  </button>
                </div>
              )}
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  3. Dispatch Channels
                </p>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400 font-mono">
                    {Object.values(targetChannels).filter(Boolean).length} of {Object.keys(targetChannels).length} active
                  </span>
                  <button
                    type="button"
                    onClick={() => selectAllChannels(true)}
                    className="text-teal-400 hover:underline font-semibold"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => selectAllChannels(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { key: 'telegram', label: 'Telegram', icon: <TelegramIcon className="w-4 h-4 text-sky-400" /> },
                  { key: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon className="w-4 h-4 text-emerald-400" /> },
                  { key: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon className="w-4 h-4 text-blue-400" /> },
                  { key: 'twitter', label: 'X (Twitter)', icon: <XIcon className="w-3.5 h-3.5 text-slate-200" /> },
                  { key: 'facebook', label: 'Facebook', icon: <FacebookIcon className="w-4 h-4 text-blue-500" /> },
                  { key: 'instagram', label: 'Instagram', icon: <InstagramIcon className="w-4 h-4 text-pink-400" /> },
                ].map((ch) => {
                  const active = targetChannels[ch.key];
                  const statusInfo = channelStatus[ch.key];
                  const isConnected = statusInfo ? Boolean(statusInfo.connected) : (ch.key === 'whatsapp');

                  return (
                    <button
                      key={ch.key}
                      type="button"
                      onClick={() => toggleTargetChannel(ch.key)}
                      className={`flex items-center justify-between rounded-xl border p-2.5 transition-all text-left ${
                        active
                          ? 'border-teal-400/80 bg-teal-950/50 shadow-sm ring-1 ring-teal-500/30'
                          : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                          {ch.icon}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block truncate ${active ? 'text-teal-200' : 'text-slate-200'}`}>
                            {ch.label}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isConnected
                                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                                  : 'bg-slate-500'
                              }`}
                            />
                            <span className="text-[9px] font-semibold text-slate-400">
                              {isConnected ? 'Connected' : 'Ready'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-md border text-[10px] shrink-0 ml-1.5 transition ${
                          active
                            ? 'border-teal-400 bg-teal-500 text-slate-950 font-black'
                            : 'border-slate-700 bg-slate-800 text-transparent'
                        }`}
                      >
                        ✓
                      </div>
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

    {/* Dedicated High-Definition Image Editor Studio Modal */}
    <AdvancedImageEditorModal
      isOpen={isStudioOpen}
      imageUrl={studioCustomizedUrl || activeImageUrl || article.image_url}
      initialTitle={article.title}
      initialCategory={article.category}
      initialAspectRatio={aspectRatio}
      onClose={() => setIsStudioOpen(false)}
      onApply={(customizedDataUrl, newSettings) => {
        setStudioCustomizedUrl(customizedDataUrl);
        setStudioSettings(newSettings);
        setGeneratedDataUrl(customizedDataUrl);
        if (newSettings.aspectRatio) {
          setAspectRatio(newSettings.aspectRatio);
        }
      }}
    />
  </>
);
}

