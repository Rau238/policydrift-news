'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Check,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Maximize2,
  CheckCircle2,
  Bookmark,
  LayoutTemplate,
  Send,
  Lock,
  Unlock,
  FileCode,
  Copy,
  Layers,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { exportCanvasImage, downloadDataUrl } from '../../lib/editor/export';
import { saveCustomTemplate } from '../../lib/editor/templates';
import type { ExportSettings } from '../../types/editor';

interface DimensionPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  label: string;
  category: string;
}

const DIMENSION_PRESETS: DimensionPreset[] = [
  { id: 'article_banner', name: 'Article Hero Banner', width: 1600, height: 900, label: '16:9 Banner', category: 'Articles' },
  { id: 'social_card', name: 'Social Link Card', width: 1200, height: 628, label: '1.91:1 Card', category: 'Social' },
  { id: 'insta_square', name: 'Instagram / Square Post', width: 1080, height: 1080, label: '1:1 Square', category: 'Social' },
  { id: 'story_reels', name: 'Story / Reels / Vertical', width: 1080, height: 1920, label: '9:16 Vertical', category: 'Mobile' },
  { id: 'full_hd', name: 'Full HD Presentation', width: 1920, height: 1080, label: '1080p Widescreen', category: 'Display' },
  { id: 'twitter_header', name: 'Twitter / X Header', width: 1500, height: 500, label: '3:1 Header', category: 'Social' },
  { id: 'ultra_4k', name: '4K Ultra High-Def', width: 3840, height: 2160, label: '4K UHD', category: 'Ultra HD' },
];

export function ExportDialog() {
  const {
    canvas,
    isExportOpen,
    setIsExportOpen,
    project,
    onApplyCallback,
    onCloseCallback,
  } = useEditorStore();

  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'svg'>('png');
  const [scaleMode, setScaleMode] = useState<'multiplier' | 'preset' | 'custom'>('multiplier');
  const [multiplier, setMultiplier] = useState<number>(2);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [customWidth, setCustomWidth] = useState<number>(project.width);
  const [customHeight, setCustomHeight] = useState<number>(project.height);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [quality, setQuality] = useState(0.92);
  const [isExporting, setIsExporting] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Template saver sub-state
  const [isTemplateSaverOpen, setIsTemplateSaverOpen] = useState(false);
  const [templateName, setTemplateName] = useState(project.title || 'My News Template');
  const [templateCategory, setTemplateCategory] = useState('News & Articles');
  const [templateSavedMsg, setTemplateSavedMsg] = useState('');

  // Sync initial custom dims when project changes
  useEffect(() => {
    setCustomWidth(project.width);
    setCustomHeight(project.height);
  }, [project.width, project.height]);

  if (!isExportOpen || !canvas) return null;

  // Calculate output dimensions
  let outputWidth = project.width;
  let outputHeight = project.height;

  if (scaleMode === 'multiplier') {
    outputWidth = Math.round(project.width * multiplier);
    outputHeight = Math.round(project.height * multiplier);
  } else if (scaleMode === 'preset') {
    const p = DIMENSION_PRESETS.find((d) => d.id === selectedPresetId);
    if (p) {
      outputWidth = p.width;
      outputHeight = p.height;
    } else {
      outputWidth = Math.round(project.width * multiplier);
      outputHeight = Math.round(project.height * multiplier);
    }
  } else if (scaleMode === 'custom') {
    outputWidth = Math.max(100, Math.round(customWidth));
    outputHeight = Math.max(100, Math.round(customHeight));
  }

  const megapixels = ((outputWidth * outputHeight) / 1000000).toFixed(1);

  // Estimated file size
  const estimatedKb = Math.round(
    (outputWidth * outputHeight * (format === 'png' ? 1.8 : quality * 0.45)) / 1024
  );

  const getEffectiveExportSettings = (): ExportSettings => {
    return {
      format,
      quality,
      scale: outputWidth / project.width,
      width: outputWidth,
      height: outputHeight,
    };
  };

  // 1. Download to computer
  const handleDownload = () => {
    setIsExporting(true);
    try {
      if (format === 'svg') {
        const svg = canvas.toSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        downloadDataUrl(url, `${project.title.toLowerCase().replace(/\s+/g, '-')}.svg`);
        URL.revokeObjectURL(url);
      } else {
        const settings = getEffectiveExportSettings();
        const result = exportCanvasImage(canvas, settings);
        downloadDataUrl(
          result.dataUrl,
          `${project.title.toLowerCase().replace(/\s+/g, '-')}-${outputWidth}x${outputHeight}-${result.filename}`
        );
      }
      setIsExportOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Apply directly to Article or Post
  const handleApplyToArticle = () => {
    setIsExporting(true);
    try {
      const settings = getEffectiveExportSettings();
      const result = exportCanvasImage(canvas, settings);

      if (onApplyCallback) {
        onApplyCallback(result.dataUrl);
      } else {
        // Fallback for standalone editor: save to localStorage and copy image
        try {
          localStorage.setItem('article_applied_image', result.dataUrl);
          localStorage.setItem('article_applied_timestamp', Date.now().toString());
          if (typeof navigator !== 'undefined') {
            navigator.clipboard?.writeText(result.dataUrl).catch(() => {});
          }
        } catch {
          // ignore
        }
      }

      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        setIsExportOpen(false);
        if (onCloseCallback) {
          onCloseCallback();
        }
      }, 700);
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Save as Template
  const handleSaveAsTemplate = () => {
    if (!canvas) return;
    const name = templateName.trim() || project.title || 'Saved Custom Template';

    let thumb: string | undefined = undefined;
    try {
      thumb = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.6,
        multiplier: 0.25,
      });
    } catch {
      // ignore
    }

    const canvasJson = canvas.toJSON([
      'id',
      'customName',
      'locked',
      'rx',
      'ry',
      'strokeDashArray',
      'stroke',
      'strokeWidth',
      'shadow',
    ]);

    saveCustomTemplate({
      name,
      category: templateCategory,
      width: outputWidth,
      height: outputHeight,
      backgroundColor: project.backgroundColor,
      thumbnailUrl: thumb,
      canvasData: canvasJson,
    });

    setTemplateSavedMsg('Template saved to your library!');
    setTimeout(() => {
      setTemplateSavedMsg('');
      setIsTemplateSaverOpen(false);
    }, 2000);
  };

  const handleCustomWidthChange = (w: number) => {
    setCustomWidth(w);
    if (lockAspectRatio && project.width > 0) {
      const ratio = project.height / project.width;
      setCustomHeight(Math.round(w * ratio));
    }
  };

  const handleCustomHeightChange = (h: number) => {
    setCustomHeight(h);
    if (lockAspectRatio && project.height > 0) {
      const ratio = project.width / project.height;
      setCustomWidth(Math.round(h * ratio));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-150 select-none overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsExportOpen(false);
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-700/90 bg-slate-900/98 shadow-2xl p-5 text-white space-y-4 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 shadow-md text-slate-950 font-bold">
              <Download size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Export & Apply Graphic</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {outputWidth} × {outputHeight} px
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose format, export size, compression quality, or apply directly to articles
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExportOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* 1. Format Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">1. Image File Format</label>
          <div className="grid grid-cols-4 gap-2">
            {(['png', 'jpeg', 'webp', 'svg'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold uppercase transition ${
                  format === fmt
                    ? 'border-blue-400 bg-blue-950/70 text-white ring-2 ring-blue-500/40 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{fmt}</span>
                <span className="text-[9px] text-slate-400 normal-case font-medium mt-0.5">
                  {fmt === 'png'
                    ? 'Lossless Alpha'
                    : fmt === 'jpeg'
                    ? 'Standard JPG'
                    : fmt === 'webp'
                    ? 'Modern WebP'
                    : 'Vector SVG'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Export Resolution & Target Size */}
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Maximize2 size={13} className="text-teal-400" />
              <span>2. Export Size & Target Resolution</span>
            </label>
            <span className="text-[11px] font-mono text-teal-400 font-bold">
              {outputWidth} × {outputHeight} px ({megapixels} MP • ~{estimatedKb} KB)
            </span>
          </div>

          {/* Size Mode Switcher: Multiplier Scale | Preset Sizes | Custom Dims */}
          <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setScaleMode('multiplier')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                scaleMode === 'multiplier' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Scale Multipliers
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('preset')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                scaleMode === 'preset' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard Targets
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('custom')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                scaleMode === 'custom' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom Dimensions
            </button>
          </div>

          {/* Scale Multipliers (0.5x, 1x, 1.5x, 2x, 3x, 4x) */}
          {scaleMode === 'multiplier' && (
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { scale: 0.5, label: '0.5x (Fast)' },
                { scale: 1, label: '1x (Standard)' },
                { scale: 1.5, label: '1.5x (Web)' },
                { scale: 2, label: '2x (2K Retina)' },
                { scale: 3, label: '3x (4K Ultra)' },
              ].map((s) => (
                <button
                  key={s.scale}
                  type="button"
                  onClick={() => setMultiplier(s.scale)}
                  className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition ${
                    multiplier === s.scale
                      ? 'border-teal-400 bg-teal-950/60 text-white ring-1 ring-teal-400 shadow'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="block text-xs">{s.scale}x</span>
                  <span className="text-[9px] font-normal text-slate-400 block truncate">{s.label.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Standard Target Presets */}
          {scaleMode === 'preset' && (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
              {DIMENSION_PRESETS.map((dp) => (
                <button
                  key={dp.id}
                  type="button"
                  onClick={() => setSelectedPresetId(dp.id)}
                  className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedPresetId === dp.id
                      ? 'border-teal-400 bg-teal-950/60 text-white ring-1 ring-teal-400 shadow'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <span className="text-xs font-bold block truncate">{dp.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {dp.width} × {dp.height} px ({dp.label})
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                    {dp.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Custom Dimension Inputs */}
          {scaleMode === 'custom' && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Width (px)</span>
                <input
                  type="number"
                  min="100"
                  max="8000"
                  value={customWidth}
                  onChange={(e) => handleCustomWidthChange(parseInt(e.target.value, 10) || 100)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-teal-400"
                />
              </div>

              <button
                type="button"
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`p-2 rounded-xl border mt-4 transition ${
                  lockAspectRatio
                    ? 'border-teal-500 bg-teal-950 text-teal-300'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
                title={lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
              >
                {lockAspectRatio ? <Lock size={14} /> : <Unlock size={14} />}
              </button>

              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Height (px)</span>
                <input
                  type="number"
                  min="100"
                  max="8000"
                  value={customHeight}
                  onChange={(e) => handleCustomHeightChange(parseInt(e.target.value, 10) || 100)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Compression Quality Slider (JPEG & WEBP) */}
        {(format === 'jpeg' || format === 'webp') && (
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <Sliders size={12} className="text-blue-400" />
                <span>3. Compression Quality</span>
              </span>
              <span className="font-mono text-teal-400 font-bold">{Math.round(quality * 100)}%</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.02"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex items-center gap-1">
                {[
                  { q: 1.0, label: 'Max' },
                  { q: 0.92, label: 'High' },
                  { q: 0.8, label: 'Web' },
                  { q: 0.6, label: 'Min' },
                ].map((qp) => (
                  <button
                    key={qp.label}
                    type="button"
                    onClick={() => setQuality(qp.q)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition border ${
                      Math.abs(quality - qp.q) < 0.05
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Template Saver Drawer inside Export Dialog */}
        <div className="pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsTemplateSaverOpen(!isTemplateSaverOpen)}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition"
            >
              <LayoutTemplate size={13} />
              <span>{isTemplateSaverOpen ? '▲ Hide Template Saver' : '▼ Save this layout as reusable template'}</span>
            </button>
            {templateSavedMsg && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Check size={12} /> {templateSavedMsg}
              </span>
            )}
          </div>

          {isTemplateSaverOpen && (
            <div className="mt-2 p-3 rounded-xl border border-purple-900/60 bg-purple-950/20 space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block mb-1">Template Name</span>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g. Breaking News Headline"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block mb-1">Category</span>
                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="News & Articles">News & Articles</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Breaking News">Breaking News</option>
                    <option value="Quote Cards">Quote Cards</option>
                    <option value="Sports">Sports</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveAsTemplate}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow transition"
                >
                  <Bookmark size={12} />
                  <span>Save Template to Library</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Primary Action Buttons: Apply to Article vs Download Image */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => setIsExportOpen(false)}
            className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Direct Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition active:scale-95 shadow"
              title="Download file to your local computer"
            >
              <Download size={14} className="stroke-[2.5]" />
              <span>{isExporting ? 'Exporting...' : 'Download Image'}</span>
            </button>

            {/* Apply to Article / Post Button */}
            <button
              type="button"
              onClick={handleApplyToArticle}
              disabled={isExporting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-95 transition"
              title="Apply this exact graphic directly to the article or social post"
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-300 stroke-[3]" />
                  <span>Applied to Article!</span>
                </>
              ) : (
                <>
                  <Send size={14} className="stroke-[2.5]" />
                  <span>Apply to Article</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
