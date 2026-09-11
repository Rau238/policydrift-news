'use client';

import React from 'react';
import { Sliders, RotateCcw, Sun, Contrast, Droplet, Eye, EyeOff } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { applyImageFilters } from '../../lib/editor/filters';
import { fabric } from 'fabric';

export function AdjustmentsPanel() {
  const {
    canvas,
    adjustments,
    setAdjustment,
    resetAdjustments,
    activeFilter,
    pushHistoryState,
  } = useEditorStore();

  const handleSliderChange = async (key: keyof typeof adjustments, value: number) => {
    setAdjustment(key, value);
    if (!canvas) return;

    const newAdjustments = { ...adjustments, [key]: value };
    const active = canvas.getActiveObject();
    const imagesToFilter: fabric.Image[] = [];

    if (active && active.type === 'image') {
      imagesToFilter.push(active as fabric.Image);
    } else {
      canvas.getObjects().forEach((obj) => {
        if (obj.type === 'image') imagesToFilter.push(obj as fabric.Image);
      });
    }

    for (const img of imagesToFilter) {
      await applyImageFilters(img, newAdjustments, activeFilter, fabric);
    }

    canvas.renderAll();
  };

  const handleSliderCommit = () => {
    pushHistoryState();
  };

  return (
    <div className="space-y-4 p-3.5 text-white select-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Image Adjustments
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Non-destructive photo adjustments
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetAdjustments();
            if (canvas) {
              canvas.getObjects().forEach((obj) => {
                if (obj.type === 'image') {
                  const img = obj as fabric.Image;
                  img.filters = [];
                  img.applyFilters();
                }
              });
              canvas.renderAll();
              pushHistoryState();
            }
          }}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white"
          title="Reset all adjustments"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      <div className="space-y-3.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sun size={13} className="text-amber-400" />
              <span>Brightness</span>
            </span>
            <span className="font-mono text-teal-400">
              {Math.round(adjustments.brightness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.02"
            value={adjustments.brightness}
            onChange={(e) => handleSliderChange('brightness', parseFloat(e.target.value))}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Contrast size={13} className="text-blue-400" />
              <span>Contrast</span>
            </span>
            <span className="font-mono text-teal-400">
              {Math.round(adjustments.contrast * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.02"
            value={adjustments.contrast}
            onChange={(e) => handleSliderChange('contrast', parseFloat(e.target.value))}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Droplet size={13} className="text-rose-400" />
              <span>Saturation</span>
            </span>
            <span className="font-mono text-teal-400">
              {Math.round(adjustments.saturation * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.02"
            value={adjustments.saturation}
            onChange={(e) => handleSliderChange('saturation', parseFloat(e.target.value))}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Blur */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Blur</span>
            <span className="font-mono text-teal-400">
              {Math.round(adjustments.blur * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={adjustments.blur}
            onChange={(e) => handleSliderChange('blur', parseFloat(e.target.value))}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Hue Rotation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Hue Rotation</span>
            <span className="font-mono text-teal-400">
              {Math.round(adjustments.hue * 180)}°
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.02"
            value={adjustments.hue}
            onChange={(e) => handleSliderChange('hue', parseFloat(e.target.value))}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Layer Opacity</span>
            <span className="font-mono text-teal-400">
              {Math.round(adjustments.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.02"
            value={adjustments.opacity}
            onChange={(e) => handleSliderChange('opacity', parseFloat(e.target.value))}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
