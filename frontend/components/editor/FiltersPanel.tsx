'use client';

import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { applyImageFilters } from '../../lib/editor/filters';
import { fabric } from 'fabric';
import type { FilterPreset } from '../../types/editor';

const FILTER_PRESETS: { id: FilterPreset; name: string; desc: string; bgGrad: string }[] = [
  { id: 'original', name: 'Original', desc: 'No filters applied', bgGrad: 'from-slate-700 to-slate-900' },
  { id: 'cinematic', name: 'Cinematic', desc: 'Teal & dark drama tone', bgGrad: 'from-teal-900 to-slate-950' },
  { id: 'vintage', name: 'Vintage 80s', desc: 'Warm aged retro style', bgGrad: 'from-amber-800 to-amber-950' },
  { id: 'warm', name: 'Golden Warm', desc: 'Soft sunny glow', bgGrad: 'from-orange-700 to-amber-900' },
  { id: 'cool', name: 'Nordic Cool', desc: 'Crisp blue atmospheric', bgGrad: 'from-blue-700 to-slate-950' },
  { id: 'grayscale', name: 'Grayscale', desc: 'Clean editorial neutral', bgGrad: 'from-slate-500 to-slate-800' },
  { id: 'blackwhite', name: 'High B&W', desc: 'High contrast monochrome', bgGrad: 'from-slate-300 to-black' },
  { id: 'sepia', name: 'Classic Sepia', desc: 'Historical antique brown', bgGrad: 'from-yellow-900 to-stone-950' },
  { id: 'bright', name: 'Vibrant Bright', desc: 'Boosted exposure', bgGrad: 'from-sky-500 to-emerald-700' },
  { id: 'dark', name: 'Moody Dark', desc: 'Shadow and vignette boost', bgGrad: 'from-slate-900 to-black' },
  { id: 'highcontrast', name: 'High Punch', desc: 'Vivid deep colors', bgGrad: 'from-rose-700 to-indigo-950' },
  { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon saturated hue shift', bgGrad: 'from-pink-600 to-purple-950' },
];

export function FiltersPanel() {
  const { canvas, activeFilter, setActiveFilter, adjustments, pushHistoryState } = useEditorStore();

  const handleApplyPreset = async (preset: FilterPreset) => {
    setActiveFilter(preset);
    if (!canvas) return;

    const active = canvas.getActiveObject();
    const imagesToFilter: fabric.Image[] = [];

    if (active && active.type === 'image') {
      imagesToFilter.push(active as fabric.Image);
    } else {
      // Apply to all images on canvas if none is specifically selected
      canvas.getObjects().forEach((obj) => {
        if (obj.type === 'image') imagesToFilter.push(obj as fabric.Image);
      });
    }

    if (imagesToFilter.length === 0) return;

    for (const img of imagesToFilter) {
      await applyImageFilters(img, adjustments, preset, fabric);
    }

    canvas.renderAll();
    pushHistoryState();
  };

  return (
    <div className="space-y-4 p-3.5 text-white select-none">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Preset Photo Filters
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          1-click color grading filters for imported photos
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
        {FILTER_PRESETS.map((filter) => {
          const isSelected = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleApplyPreset(filter.id)}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition group ${
                isSelected
                  ? 'border-blue-500 bg-blue-950/40 text-blue-200 ring-1 ring-blue-500'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              <div
                className={`h-12 w-full rounded-lg bg-gradient-to-tr ${filter.bgGrad} mb-2 flex items-center justify-center shadow-inner relative overflow-hidden`}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center font-bold">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                )}
                <Sparkles size={16} className="text-white/40 group-hover:scale-110 transition" />
              </div>

              <span className="text-xs font-bold text-white group-hover:text-blue-300 transition">
                {filter.name}
              </span>
              <span className="text-[10px] text-slate-500 truncate w-full mt-0.5">
                {filter.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
