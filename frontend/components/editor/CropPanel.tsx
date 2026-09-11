'use client';

import React from 'react';
import {
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Check,
  X,
  Maximize,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { AspectRatio } from '../../types/editor';

const RATIO_PRESETS: { id: AspectRatio; label: string; ratio: string; w: number; h: number }[] = [
  { id: '1.91:1' as AspectRatio, label: 'News Card (1.91:1)', ratio: 'Facebook / X / Web', w: 1200, h: 630 },
  { id: '1:1', label: 'Square (1:1)', ratio: 'Instagram Post / Feed', w: 1080, h: 1080 },
  { id: '4:5' as AspectRatio, label: 'Portrait (4:5)', ratio: 'Instagram / Pinterest', w: 1080, h: 1350 },
  { id: '9:16', label: 'Story & Reel (9:16)', ratio: 'TikTok / Shorts / Stories', w: 1080, h: 1920 },
  { id: '16:9', label: 'Landscape (16:9)', ratio: 'YouTube Banner / Desktop', w: 1920, h: 1080 },
  { id: '4:3', label: 'Standard (4:3)', ratio: 'Photo Print / Tablet', w: 1200, h: 900 },
];

export function CropPanel() {
  const {
    canvas,
    activeCropRatio,
    setActiveCropRatio,
    project,
    setProject,
    pushHistoryState,
  } = useEditorStore();

  const [customW, setCustomW] = React.useState(project.width);
  const [customH, setCustomH] = React.useState(project.height);

  const handleApplyDimensions = (width: number, height: number, ratioId?: AspectRatio) => {
    if (!canvas) return;
    if (ratioId) setActiveCropRatio(ratioId);
    setCustomW(width);
    setCustomH(height);

    canvas.setWidth(width);
    canvas.setHeight(height);
    setProject({ width, height });
    canvas.renderAll();
    pushHistoryState();
  };

  const handleRotateCanvas = () => {
    if (!canvas) return;
    const currentW = project.width;
    const currentH = project.height;
    handleApplyDimensions(currentH, currentW);
  };

  return (
    <div className="space-y-4 p-3.5 text-white select-none overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Crop & Canvas Framing
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Select standard social ratios or set custom dimensions
        </p>
      </div>

      {/* Custom Dimensions Form */}
      <div className="space-y-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <label className="text-[11px] font-bold text-purple-400">Custom Dimensions (px)</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400">Width</span>
            <input
              type="number"
              min="100"
              max="4000"
              value={customW}
              onChange={(e) => setCustomW(parseInt(e.target.value) || 100)}
              className="w-full h-8 rounded-xl border border-slate-800 bg-slate-950 px-2.5 text-xs font-mono text-white outline-none focus:border-purple-500"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400">Height</span>
            <input
              type="number"
              min="100"
              max="4000"
              value={customH}
              onChange={(e) => setCustomH(parseInt(e.target.value) || 100)}
              className="w-full h-8 rounded-xl border border-slate-800 bg-slate-950 px-2.5 text-xs font-mono text-white outline-none focus:border-purple-500"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleApplyDimensions(customW, customH, 'free')}
          className="w-full mt-1 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow"
        >
          Apply Custom Size
        </button>
      </div>

      {/* Aspect Ratio Preset Cards */}
      <div className="space-y-2 pt-1 border-t border-slate-800">
        <label className="text-[11px] font-bold text-slate-300">Social Aspect Ratios</label>
        <div className="grid grid-cols-1 gap-2">
          {RATIO_PRESETS.map((preset) => {
            const isSelected = project.width === preset.w && project.height === preset.h;

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyDimensions(preset.w, preset.h, preset.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition text-left group ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/40 text-purple-200 ring-1 ring-purple-500'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-purple-300 transition block">
                    {preset.label}
                  </span>
                  <span className="text-[10px] text-slate-500">{preset.ratio}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400">
                    {preset.w}×{preset.h}
                  </span>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Orientation Swap */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="text-[11px] font-bold text-slate-300">Orientation Transform</label>
        <button
          type="button"
          onClick={handleRotateCanvas}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition"
        >
          <RotateCw size={13} className="text-teal-400" />
          <span>Swap Width & Height ({project.height}×{project.width})</span>
        </button>
      </div>
    </div>
  );
}
