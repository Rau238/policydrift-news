'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Download, Copy, Check, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { categoryLabel } from '@/lib/category-theme';

export type SocialAspectRatio = '1:1' | '9:16' | '1.91:1' | '16:9';

interface SocialCardProps {
  title: string;
  category: string;
  imageUrl?: string | null;
  aspectRatio?: SocialAspectRatio;
  onImageGenerated?: (dataUrl: string) => void;
  className?: string;
}

const DIMENSIONS: Record<SocialAspectRatio, { width: number; height: number; label: string; tag: string }> = {
  '1:1': { width: 1080, height: 1080, label: '1:1 Square', tag: 'Instagram / LinkedIn' },
  '9:16': { width: 1080, height: 1920, label: '9:16 Story', tag: 'Instagram Stories / Reels' },
  '1.91:1': { width: 1200, height: 630, label: '1.91:1 Banner', tag: 'LinkedIn / Facebook' },
  '16:9': { width: 1200, height: 675, label: '16:9 Card', tag: 'X (Twitter)' },
};

export function SocialCardCanvas({
  title,
  category,
  imageUrl,
  aspectRatio = '1:1',
  onImageGenerated,
  className = '',
}: SocialCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      // 1. Dark Base Background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Background Photo with High-Quality Cover Scaling
      if (bgImage && bgImage.width > 0 && bgImage.height > 0) {
        const hRatio = width / bgImage.width;
        const vRatio = height / bgImage.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (width - bgImage.width * ratio) / 2;
        const centerShiftY = (height - bgImage.height * ratio) / 2;

        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          bgImage,
          0,
          0,
          bgImage.width,
          bgImage.height,
          centerShiftX,
          centerShiftY,
          bgImage.width * ratio,
          bgImage.height * ratio
        );
        ctx.restore();
      }

      // 3. Crisp, Cinematic Lighting Overlays (Clear Top/Middle, Focused Bottom Fade)
      // Top subtle vignette just for brand logo visibility
      const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.28);
      topGrad.addColorStop(0, 'rgba(5, 9, 19, 0.7)');
      topGrad.addColorStop(0.6, 'rgba(5, 9, 19, 0.25)');
      topGrad.addColorStop(1, 'rgba(5, 9, 19, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, height * 0.28);

      // Bottom dynamic contrast gradient for headline legibility
      const bottomGrad = ctx.createLinearGradient(0, height * 0.38, 0, height);
      bottomGrad.addColorStop(0, 'rgba(5, 9, 19, 0)');
      bottomGrad.addColorStop(0.3, 'rgba(5, 9, 19, 0.55)');
      bottomGrad.addColorStop(0.65, 'rgba(5, 9, 19, 0.92)');
      bottomGrad.addColorStop(1, 'rgba(5, 9, 19, 0.98)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, height * 0.38, width, height * 0.62);

      // Subtle Teal Ambient Glow in Top Right
      const aura = ctx.createRadialGradient(width * 0.9, height * 0.08, 10, width * 0.9, height * 0.08, width * 0.5);
      aura.addColorStop(0, 'rgba(20, 184, 166, 0.35)');
      aura.addColorStop(1, 'rgba(20, 184, 166, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, width, height);

      const padding = Math.round(width * 0.038);
      const topY = Math.round(height * (aspectRatio === '9:16' ? 0.038 : 0.035));

      // 4. Draw Official PolicyDrift BrandMark Directly on Canvas (Top-Left)
      const brandFontSize = Math.round(width * (aspectRatio === '9:16' ? 0.04 : 0.036));
      const logoRadius = Math.round(width * (aspectRatio === '9:16' ? 0.034 : 0.03));
      const logoX = padding + logoRadius;
      const logoY = topY + logoRadius;
      const logoGap = Math.round(width * 0.016);

      ctx.save();
      // Drop shadow behind logo
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;

      // Circle Gradient Background (#0f9f8f -> #0f766e -> #031f1d)
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
      ctx.rotate((-8 * Math.PI) / 180); // -8 deg slant

      const hashScale = logoRadius / 256;
      ctx.scale(hashScale, hashScale);
      ctx.fillStyle = '#ffffff';

      // 2 Upright Bars
      ctx.beginPath();
      ctx.roundRect(168 - 256, 112 - 256, 48, 288, 14);
      ctx.roundRect(296 - 256, 112 - 256, 48, 288, 14);
      // 2 Horizontal Crossbars
      ctx.roundRect(120 - 256, 176 - 256, 272, 48, 14);
      ctx.roundRect(120 - 256, 288 - 256, 272, 48, 14);
      ctx.fill();
      ctx.restore();

      // Brand Wordmark (Clean typography with drop shadow for legibility)
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
      ctx.fillText('PolicyDrift', textStartX, logoY);
      ctx.restore();

      // 5. Calculate Dynamic Bottom-Anchored Typography Layout (Closer to Bottom Edge)
      const titleFontSize = Math.round(
        width * (aspectRatio === '9:16' ? 0.056 : aspectRatio === '1:1' ? 0.052 : 0.045)
      );
      const lineHeight = Math.round(titleFontSize * 1.24);
      const maxTextWidth = width - padding * 2;
      const maxLines = aspectRatio === '9:16' ? 6 : aspectRatio === '1:1' ? 5 : 4;

      // Word wrapping
      ctx.save();
      ctx.font = `800 ${titleFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const words = title.split(' ');
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

      // Calculate start position so the headline anchors cleanly toward the bottom
      const titleStartY = height - bottomMargin - totalTitleHeight;
      const badgeY = titleStartY - badgeHeight - badgeToTitleGap;

      // 6. Draw Category Badge Pill
      const catText = categoryLabel(category).toUpperCase();
      ctx.save();
      ctx.font = `800 ${badgeFontSize}px system-ui, sans-serif`;
      const textMetrics = ctx.measureText(catText);
      const badgePaddingX = Math.round(width * 0.024);
      const badgeWidth = textMetrics.width + badgePaddingX * 2;

      // Glow behind badge
      ctx.shadowColor = 'rgba(20, 184, 166, 0.45)';
      ctx.shadowBlur = 14;

      // Pill Background
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.roundRect(padding, badgeY, badgeWidth, badgeHeight, 8);
      ctx.fill();

      // Pill Border
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pill Text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillText(catText, padding + badgeWidth / 2, badgeY + badgeHeight / 2 + 1);
      ctx.restore();

      // 7. Draw Article Headline
      ctx.save();
      ctx.font = `800 ${titleFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      // Drop shadow for ultra-sharp legibility
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

      // (Bottom text and lines have been completely removed for clean edge-to-edge aesthetic)

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
  }, [title, category, imageUrl, aspectRatio, onImageGenerated]);

  useEffect(() => {
    drawCard();
  }, [drawCard]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = `policydrift-${category}-${aspectRatio.replace(':', '-')}.png`;
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
          setTimeout(() => setCopied(false), 3000);
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
          className="max-h-[420px] w-auto max-w-full rounded-xl object-contain shadow-inner"
        />

        {/* Aspect Ratio Badge */}
        <span className="absolute bottom-3 left-3 rounded-md bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-teal-300 backdrop-blur-md border border-white/15 shadow-sm">
          {DIMENSIONS[aspectRatio].label} • {DIMENSIONS[aspectRatio].tag}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={loading || downloading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-950/60 px-3.5 py-2 text-xs font-bold text-teal-200 transition hover:bg-teal-900/60 hover:text-white shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Download size={13} />
          <span>Download PNG</span>
        </button>

        <button
          type="button"
          onClick={handleCopyImage}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-95 disabled:opacity-50"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copied!' : 'Copy Image'}</span>
        </button>

        <button
          type="button"
          onClick={drawCard}
          disabled={loading}
          title="Re-render card"
          className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-teal-400' : ''} />
        </button>
      </div>
    </div>
  );
}
