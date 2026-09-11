'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Download, Copy, Check, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { categoryLabel } from '@/lib/category-theme';

export type SocialAspectRatio = '1:1' | '9:16' | '1.91:1' | '16:9';

export interface SocialCardProps {
  title: string;
  category: string;
  imageUrl?: string | null;
  aspectRatio?: SocialAspectRatio;
  isCustomComposite?: boolean;
  onImageGenerated?: (dataUrl: string) => void;
  onOpenStudio?: () => void;
  className?: string;
}

export const DIMENSIONS: Record<SocialAspectRatio, { width: number; height: number; label: string; tag: string }> = {
  '1:1': { width: 1080, height: 1080, label: '1:1 Square', tag: 'Instagram / LinkedIn' },
  '9:16': { width: 1080, height: 1920, label: '9:16 Story', tag: 'Instagram Stories / Reels' },
  '1.91:1': { width: 1200, height: 630, label: '1.91:1 Banner', tag: 'LinkedIn / Facebook' },
  '16:9': { width: 1200, height: 675, label: '16:9 Card', tag: 'X (Twitter)' },
};

export interface ImageEditSettings {
  zoom: number; // 1.0 to 2.5
  panX: number; // -50 to 50
  panY: number; // -50 to 50
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  saturation: number; // -100 to 100
  blur: number; // 0 to 16
  overlayDarkness: number; // 0.3 to 1.0
  preset: 'normal' | 'vibrant' | 'cinematic' | 'noir' | 'sunset' | 'midnight';
  showLogo: boolean;
  showCategoryBadge: boolean;
  badgeTheme: 'teal' | 'emerald' | 'blue' | 'purple' | 'rose' | 'amber';
}

export const DEFAULT_EDIT_SETTINGS: ImageEditSettings = {
  zoom: 1.0,
  panX: 0,
  panY: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  overlayDarkness: 0.92,
  preset: 'normal',
  showLogo: true,
  showCategoryBadge: false,
  badgeTheme: 'teal',
};

const FILTER_PRESETS: Record<
  ImageEditSettings['preset'],
  { label: string; icon: string; settings: Partial<ImageEditSettings> }
> = {
  normal: {
    label: 'Normal',
    icon: '✨',
    settings: { brightness: 0, contrast: 0, saturation: 0, blur: 0 },
  },
  vibrant: {
    label: 'Vibrant',
    icon: '🔥',
    settings: { brightness: 4, contrast: 18, saturation: 35, blur: 0 },
  },
  cinematic: {
    label: 'Cinematic',
    icon: '🎬',
    settings: { brightness: -4, contrast: 24, saturation: -8, blur: 0 },
  },
  noir: {
    label: 'Noir B&W',
    icon: '🕶️',
    settings: { brightness: 5, contrast: 32, saturation: -100, blur: 0 },
  },
  sunset: {
    label: 'Warm Tone',
    icon: '🌅',
    settings: { brightness: 6, contrast: 12, saturation: 22, blur: 0 },
  },
  midnight: {
    label: 'Midnight',
    icon: '🌌',
    settings: { brightness: -10, contrast: 28, saturation: -15, blur: 0 },
  },
};

const BADGE_COLORS: Record<ImageEditSettings['badgeTheme'], { bg: string; border: string; glow: string }> = {
  teal: { bg: '#0f766e', border: '#2dd4bf', glow: 'rgba(20, 184, 166, 0.45)' },
  emerald: { bg: '#065f46', border: '#34d399', glow: 'rgba(16, 185, 129, 0.45)' },
  blue: { bg: '#1e40af', border: '#60a5fa', glow: 'rgba(59, 130, 246, 0.45)' },
  purple: { bg: '#6b21a8', border: '#c084fc', glow: 'rgba(168, 85, 247, 0.45)' },
  rose: { bg: '#9f1239', border: '#fb7185', glow: 'rgba(244, 63, 94, 0.45)' },
  amber: { bg: '#92400e', border: '#fbbf24', glow: 'rgba(245, 158, 11, 0.45)' },
};

export function SocialCardCanvas({
  title,
  category,
  imageUrl,
  aspectRatio = '1:1',
  isCustomComposite = false,
  onImageGenerated,
  onOpenStudio,
  className = '',
}: SocialCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editSettings, setEditSettings] = useState<ImageEditSettings>(DEFAULT_EDIT_SETTINGS);

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setLoading(true);
    const { width, height } = DIMENSIONS[aspectRatio];
    canvas.width = width;
    canvas.height = height;

    const renderGraphics = (bgImage?: HTMLImageElement | null) => {
      // 0. If a custom composite from Advance Studio Editor is applied, draw it directly with exact fit and preserve
      if (isCustomComposite && bgImage && bgImage.width > 0 && bgImage.height > 0) {
        ctx.clearRect(0, 0, width, height);

        const hRatio = width / bgImage.width;
        const vRatio = height / bgImage.height;
        const ratio = Math.max(hRatio, vRatio);
        const shiftX = (width - bgImage.width * ratio) / 2;
        const shiftY = (height - bgImage.height * ratio) / 2;

        ctx.drawImage(bgImage, shiftX, shiftY, bgImage.width * ratio, bgImage.height * ratio);

        setLoading(false);

        if (onImageGenerated) {
          try {
            const dataUrl = canvas.toDataURL('image/png');
            onImageGenerated(dataUrl);
          } catch {
            // CORS fallback
          }
        }
        return;
      }

      // 1. Dark Base Background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Background Photo with Custom Filters, Zoom, Pan & Transformations
      if (bgImage && bgImage.width > 0 && bgImage.height > 0) {
        const baseHRatio = width / bgImage.width;
        const baseVRatio = height / bgImage.height;
        const baseRatio = Math.max(baseHRatio, baseVRatio);
        const finalRatio = baseRatio * editSettings.zoom;

        const panPixelX = (editSettings.panX / 100) * width;
        const panPixelY = (editSettings.panY / 100) * height;

        const centerShiftX = (width - bgImage.width * finalRatio) / 2 + panPixelX;
        const centerShiftY = (height - bgImage.height * finalRatio) / 2 + panPixelY;

        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Apply Image Filters (CSS standard filter strings on canvas context)
        const bVal = 100 + editSettings.brightness;
        const cVal = 100 + editSettings.contrast;
        const sVal = 100 + editSettings.saturation;
        const blurPx = editSettings.blur;

        ctx.filter = `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%) blur(${blurPx}px)`;

        ctx.drawImage(
          bgImage,
          0,
          0,
          bgImage.width,
          bgImage.height,
          centerShiftX,
          centerShiftY,
          bgImage.width * finalRatio,
          bgImage.height * finalRatio
        );
        ctx.restore();
      }

      // Reset filter for UI layers
      ctx.filter = 'none';

      // 3. Crisp, Cinematic Lighting Overlays
      // Top subtle vignette for brand logo visibility
      if (editSettings.showLogo) {
        const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.28);
        topGrad.addColorStop(0, 'rgba(5, 9, 19, 0.7)');
        topGrad.addColorStop(0.6, 'rgba(5, 9, 19, 0.25)');
        topGrad.addColorStop(1, 'rgba(5, 9, 19, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, width, height * 0.28);
      }

      // Bottom dynamic contrast gradient for headline legibility with user-controlled darkness
      const darkness = editSettings.overlayDarkness;
      const bottomGrad = ctx.createLinearGradient(0, height * 0.36, 0, height);
      bottomGrad.addColorStop(0, 'rgba(5, 9, 19, 0)');
      bottomGrad.addColorStop(0.3, `rgba(5, 9, 19, ${0.55 * darkness})`);
      bottomGrad.addColorStop(0.65, `rgba(5, 9, 19, ${0.92 * darkness})`);
      bottomGrad.addColorStop(1, `rgba(5, 9, 19, ${0.98 * darkness})`);
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, height * 0.36, width, height * 0.64);

      // Subtle Ambient Glow in Top Right
      const aura = ctx.createRadialGradient(width * 0.9, height * 0.08, 10, width * 0.9, height * 0.08, width * 0.5);
      aura.addColorStop(0, 'rgba(20, 184, 166, 0.35)');
      aura.addColorStop(1, 'rgba(20, 184, 166, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, width, height);

      const padding = Math.round(width * 0.038);
      const topY = Math.round(height * (aspectRatio === '9:16' ? 0.038 : 0.035));

      // 4. Draw Official NewsFree365 BrandMark (Top-Left) if Enabled
      if (editSettings.showLogo) {
        const brandFontSize = Math.round(width * (aspectRatio === '9:16' ? 0.04 : 0.036));
        const logoRadius = Math.round(width * (aspectRatio === '9:16' ? 0.034 : 0.03));
        const logoX = padding + logoRadius;
        const logoY = topY + logoRadius;
        const logoGap = Math.round(width * 0.016);

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        // Circle Gradient Background
        const logoGrad = ctx.createLinearGradient(logoX - logoRadius, logoY - logoRadius, logoX + logoRadius, logoY + logoRadius);
        logoGrad.addColorStop(0, '#0f9f8f');
        logoGrad.addColorStop(0.42, '#0f766e');
        logoGrad.addColorStop(1, '#031f1d');

        ctx.beginPath();
        ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
        ctx.fillStyle = logoGrad;
        ctx.fill();

        // Inner highlight ring
        ctx.strokeStyle = 'rgba(204, 251, 241, 0.4)';
        ctx.lineWidth = Math.max(1.5, Math.round(logoRadius * 0.08));
        ctx.stroke();
        ctx.restore();

        // Draw Slanted 4-Bar Hash (#) Inside Logo
        ctx.save();
        ctx.translate(logoX, logoY);
        ctx.rotate((-8 * Math.PI) / 180);

        const hashScale = logoRadius / 256;
        ctx.scale(hashScale, hashScale);
        ctx.fillStyle = '#ffffff';

        ctx.beginPath();
        ctx.roundRect(168 - 256, 112 - 256, 48, 288, 14);
        ctx.roundRect(296 - 256, 112 - 256, 48, 288, 14);
        ctx.roundRect(120 - 256, 176 - 256, 272, 48, 14);
        ctx.roundRect(120 - 256, 288 - 256, 272, 48, 14);
        ctx.fill();
        ctx.restore();

        // Brand Wordmark
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${brandFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const textStartX = logoX + logoRadius + logoGap;
        ctx.fillText('NewsFree365', textStartX, logoY);
        ctx.restore();
      }

      // 5. Dynamic Bottom-Anchored Typography Layout
      const titleFontSize = Math.round(
        width * (aspectRatio === '9:16' ? 0.056 : aspectRatio === '1:1' ? 0.052 : 0.045)
      );
      const lineHeight = Math.round(titleFontSize * 1.24);
      const maxTextWidth = width - padding * 2;
      const maxLines = aspectRatio === '9:16' ? 6 : aspectRatio === '1:1' ? 5 : 4;

      ctx.save();
      ctx.font = `800 ${titleFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const displayTitle = (title || '')
        .replace(/\s*-\s*[a-zA-Z0-9.-]+\.[a-z]{2,}(\/.*)?$/i, '')
        .trim();
      const words = displayTitle.split(' ');
      let currentLine = '';
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          lines.push(currentLine.trim());
          currentLine = words[n] + ' ';
          if (lines.length >= maxLines) break;
        } else {
          currentLine = testLine;
        }
      }
      if (lines.length < maxLines && currentLine) {
        lines.push(currentLine.trim());
      }
      ctx.restore();

      const totalTitleHeight = lines.length * lineHeight;
      const badgeFontSize = Math.round(width * (aspectRatio === '9:16' ? 0.024 : 0.021));
      const badgeHeight = Math.round(width * 0.044);
      const badgeToTitleGap = Math.round(width * 0.022);
      const bottomMargin = Math.round(height * (aspectRatio === '9:16' ? 0.055 : 0.048));

      const titleStartY = height - bottomMargin - totalTitleHeight;
      const badgeY = titleStartY - badgeHeight - badgeToTitleGap;

      // 6. Draw Category Badge Pill with Selected Theme if Enabled
      if (editSettings.showCategoryBadge) {
        const catText = categoryLabel(category).toUpperCase();
        const themeColors = BADGE_COLORS[editSettings.badgeTheme] || BADGE_COLORS.teal;

        ctx.save();
        ctx.font = `800 ${badgeFontSize}px system-ui, sans-serif`;
        const textMetrics = ctx.measureText(catText);
        const badgePaddingX = Math.round(width * 0.024);
        const badgeWidth = textMetrics.width + badgePaddingX * 2;

        ctx.shadowColor = themeColors.glow;
        ctx.shadowBlur = 14;

        ctx.fillStyle = themeColors.bg;
        ctx.beginPath();
        ctx.roundRect(padding, badgeY, badgeWidth, badgeHeight, 8);
        ctx.fill();

        ctx.strokeStyle = themeColors.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(catText, padding + badgeWidth / 2, badgeY + badgeHeight / 2 + 1);
        ctx.restore();
      }

      // 7. Draw Article Headline
      ctx.save();
      ctx.font = `800 ${titleFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      let lineY = titleStartY;
      lines.forEach((line) => {
        ctx.fillText(line, padding, lineY);
        lineY += lineHeight;
      });
      ctx.restore();

      setLoading(false);

      if (onImageGenerated) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          onImageGenerated(dataUrl);
        } catch {
          // Canvas tainted (CORS)
        }
      }
    };

    // Load background image with CORS fallback
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => renderGraphics(img);
      img.onerror = () => renderGraphics(null);
      img.src = imageUrl;
    } else {
      renderGraphics(null);
    }
  }, [title, category, imageUrl, aspectRatio, isCustomComposite, onImageGenerated, editSettings]);

  useEffect(() => {
    drawCard();
  }, [drawCard]);

  const handleApplyPreset = (presetKey: ImageEditSettings['preset']) => {
    const preset = FILTER_PRESETS[presetKey];
    if (!preset) return;
    setEditSettings((prev) => ({
      ...prev,
      preset: presetKey,
      ...preset.settings,
    }));
  };

  const handleResetSettings = () => {
    setEditSettings(DEFAULT_EDIT_SETTINGS);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = `newsfree365-${category}-${aspectRatio.replace(':', '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined' || !navigator.clipboard) return;

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 3050);
        }
      });
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-3.5 ${className}`}>
      {/* Preview Container with Glass Frame */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 p-1 shadow-2xl ring-1 ring-white/10 max-w-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <RefreshCw className="h-6 w-6 animate-spin text-teal-400" />
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="max-h-[380px] w-auto max-w-full rounded-xl object-contain shadow-inner"
        />
      </div>

      {/* Action Toolbar - Unified Single Row */}
      <div className="flex items-center gap-1.5 w-full">
        {onOpenStudio && (
          <button
            type="button"
            onClick={onOpenStudio}
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 h-9 px-2.5 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:opacity-90 active:scale-95 transition whitespace-nowrap truncate"
            title="Open Full Image Studio Modal"
          >
            <span>🎨</span>
            <span className="truncate">Advance Studio</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={loading || downloading}
          className="shrink-0 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 h-9 px-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white shadow-sm active:scale-95 disabled:opacity-50"
          title="Download PNG"
        >
          <Download size={13} />
          <span>PNG</span>
        </button>

        <button
          type="button"
          onClick={handleCopyImage}
          disabled={loading}
          className="shrink-0 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 h-9 px-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-95 disabled:opacity-50"
          title="Copy to Clipboard"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <button
          type="button"
          onClick={drawCard}
          disabled={loading}
          title="Re-render card"
          className="shrink-0 inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 h-9 w-9 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-teal-400' : ''} />
        </button>
      </div>
    </div>
  );
}
