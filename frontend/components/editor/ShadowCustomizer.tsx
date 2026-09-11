'use client';

import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import {
  Sparkles,
  RotateCw,
  Sun,
  Flame,
  Layers,
  ChevronDown,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpLeft,
  Zap,
} from 'lucide-react';
import { ColorPickerPopover } from './ColorPickerPopover';
import {
  colorToHex,
  extractAlpha,
  hexAndAlphaToRgba,
  applyFabricShadow,
} from '../../lib/editor/colors';

interface ShadowCustomizerProps {
  canvas: fabric.Canvas | null;
  targetObject: fabric.Object | null;
  onUpdate?: () => void;
}

interface ShadowPreset {
  id: string;
  name: string;
  blur: number;
  distance: number;
  angle: number; // in degrees: 0 = right, 90 = bottom, 180 = left, 270 = top
  color: string;
  alpha: number;
  type?: 'drop' | 'glow' | 'dual';
}

const PRESETS: ShadowPreset[] = [
  { id: 'none', name: 'None', blur: 0, distance: 0, angle: 90, color: '#000000', alpha: 0 },
  { id: 'soft', name: 'Soft Drop', blur: 28, distance: 18, angle: 90, color: '#000000', alpha: 0.5, type: 'drop' },
  { id: 'mega', name: 'Mega Drop', blur: 75, distance: 40, angle: 90, color: '#000000', alpha: 0.8, type: 'drop' },
  { id: '3d', name: '3D Float', blur: 50, distance: 30, angle: 120, color: '#000000', alpha: 0.75, type: 'drop' },
  { id: 'pop', name: 'Pop-Art', blur: 0, distance: 16, angle: 45, color: '#000000', alpha: 1, type: 'drop' },
  { id: 'glow', name: 'Omni Glow', blur: 55, distance: 0, angle: 0, color: '#8b5cf6', alpha: 0.95, type: 'glow' },
  { id: 'neon', name: 'Neon Purple', blur: 70, distance: 0, angle: 0, color: '#d946ef', alpha: 0.95, type: 'glow' },
  { id: 'cyan', name: 'Cyan Electric', blur: 50, distance: 0, angle: 0, color: '#06b6d4', alpha: 0.95, type: 'glow' },
  { id: 'warm', name: 'Sunset Flare', blur: 45, distance: 14, angle: 80, color: '#f59e0b', alpha: 0.9, type: 'drop' },
  { id: 'cinema', name: 'Cinematic Noir', blur: 100, distance: 35, angle: 90, color: '#0f172a', alpha: 0.95, type: 'drop' },
  { id: 'subtle', name: 'Subtle Lift', blur: 14, distance: 8, angle: 90, color: '#000000', alpha: 0.35, type: 'drop' },
  { id: 'void', name: 'Deep Void', blur: 140, distance: 55, angle: 90, color: '#000000', alpha: 0.95, type: 'drop' },
  { id: 'emerald', name: 'Emerald Halo', blur: 60, distance: 0, angle: 0, color: '#10b981', alpha: 0.92, type: 'glow' },
  { id: 'ruby', name: 'Ruby Alert', blur: 55, distance: 12, angle: 90, color: '#ef4444', alpha: 0.9, type: 'drop' },
  { id: 'gold', name: 'Golden Aura', blur: 65, distance: 8, angle: 45, color: '#eab308', alpha: 0.95, type: 'glow' },
  { id: 'frost', name: 'Arctic Ice', blur: 50, distance: 0, angle: 0, color: '#38bdf8', alpha: 0.95, type: 'glow' },
];

const DUAL_COLOR_GLOWS = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    primaryColor: '#06b6d4',
    secondaryColor: '#d946ef',
    blur: 65,
    distance: 6,
    angle: 45,
    alpha: 0.95,
  },
  {
    id: 'sunset_blaze',
    name: 'Sunset Flare',
    primaryColor: '#f59e0b',
    secondaryColor: '#ef4444',
    blur: 60,
    distance: 12,
    angle: 85,
    alpha: 0.92,
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    primaryColor: '#10b981',
    secondaryColor: '#8b5cf6',
    blur: 70,
    distance: 4,
    angle: 315,
    alpha: 0.95,
  },
  {
    id: 'synthwave',
    name: 'Synthwave Glow',
    primaryColor: '#ec4899',
    secondaryColor: '#3b82f6',
    blur: 65,
    distance: 8,
    angle: 120,
    alpha: 0.92,
  },
  {
    id: 'toxic_matrix',
    name: 'Matrix Toxic',
    primaryColor: '#84cc16',
    secondaryColor: '#06b6d4',
    blur: 55,
    distance: 4,
    angle: 45,
    alpha: 0.95,
  },
  {
    id: 'solar_fire',
    name: 'Solar Heatwave',
    primaryColor: '#facc15',
    secondaryColor: '#ea580c',
    blur: 75,
    distance: 10,
    angle: 90,
    alpha: 0.95,
  },
];

const DIRECTION_SNAPS = [
  { label: 'NW', angle: 225, icon: <ArrowUpLeft size={11} /> },
  { label: 'N', angle: 270, icon: <ArrowUp size={11} /> },
  { label: 'NE', angle: 315, icon: <ArrowUpRight size={11} /> },
  { label: 'W', angle: 180, icon: <ArrowLeft size={11} /> },
  { label: 'E', angle: 0, icon: <ArrowRight size={11} /> },
  { label: 'SW', angle: 135, icon: <ArrowDownLeft size={11} /> },
  { label: 'S', angle: 90, icon: <ArrowDown size={11} /> },
  { label: 'SE', angle: 45, icon: <ArrowDownRight size={11} /> },
];

export function ShadowCustomizer({ canvas, targetObject, onUpdate }: ShadowCustomizerProps) {
  const [blur, setBlur] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [angle, setAngle] = useState<number>(90);
  const [baseHex, setBaseHex] = useState<string>('#000000');
  const [alpha, setAlpha] = useState<number>(0.65);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  // Sync state with current Fabric object shadow
  useEffect(() => {
    if (!targetObject) return;

    const rawShadow = targetObject.shadow;
    if (!rawShadow) {
      setBlur(0);
      setDistance(0);
      setAngle(90);
      setBaseHex('#000000');
      setAlpha(0.65);
      return;
    }

    const shadowObj =
      rawShadow instanceof fabric.Shadow
        ? rawShadow
        : typeof rawShadow === 'string'
        ? new fabric.Shadow(rawShadow)
        : (rawShadow as fabric.Shadow);

    const sBlur = shadowObj.blur || 0;
    const sOffsetX = shadowObj.offsetX || 0;
    const sOffsetY = shadowObj.offsetY || 0;
    const sColor = shadowObj.color || '#000000';

    setBlur(sBlur);

    // Calculate distance and angle from offsetX & offsetY
    const dist = Math.round(Math.sqrt(sOffsetX * sOffsetX + sOffsetY * sOffsetY));
    setDistance(dist);

    if (dist > 0) {
      let deg = Math.round((Math.atan2(sOffsetY, sOffsetX) * 180) / Math.PI);
      if (deg < 0) deg += 360;
      setAngle(deg);
    }

    setBaseHex(colorToHex(sColor, '#000000'));
    setAlpha(extractAlpha(sColor));
  }, [targetObject]);

  if (!targetObject || !canvas) return null;

  const hasActiveShadow = blur > 0 || distance > 0;

  // Commit changes to Fabric Canvas object
  const applyShadowToCanvas = (
    newBlur: number,
    newDist: number,
    newAngle: number,
    newHex: string,
    newAlpha: number
  ) => {
    setBlur(newBlur);
    setDistance(newDist);
    setAngle(newAngle);
    setBaseHex(newHex);
    setAlpha(newAlpha);

    let fabricShadow: fabric.Shadow | undefined = undefined;

    if (newBlur > 0 || newDist > 0) {
      const rad = (newAngle * Math.PI) / 180;
      const offsetX = Math.round(newDist * Math.cos(rad));
      const offsetY = Math.round(newDist * Math.sin(rad));
      const colorString = hexAndAlphaToRgba(newHex, newAlpha);

      fabricShadow = new fabric.Shadow({
        color: colorString,
        blur: newBlur,
        offsetX,
        offsetY,
      });
    }

    applyFabricShadow(canvas, targetObject, fabricShadow);
    if (onUpdate) onUpdate();
  };

  const handleApplyPreset = (preset: ShadowPreset) => {
    applyShadowToCanvas(preset.blur, preset.distance, preset.angle, preset.color, preset.alpha);
  };

  const handleApplyDualGlow = (dual: typeof DUAL_COLOR_GLOWS[0]) => {
    applyShadowToCanvas(dual.blur, dual.distance, dual.angle, dual.primaryColor, dual.alpha);
  };

  const handleClearShadow = () => {
    applyShadowToCanvas(0, 0, 90, '#000000', 0.65);
  };

  // Quick Boost: increase blur by 35px and distance by 20px
  const handleBoostShadow = () => {
    const nextBlur = Math.min(200, Math.max(30, blur + 35));
    const nextDist = Math.min(200, Math.max(15, distance + 20));
    applyShadowToCanvas(nextBlur, nextDist, angle, baseHex, Math.min(1, alpha + 0.15));
  };

  // Glow Mode: distance = 0, blur >= 55
  const handleToggleGlowMode = () => {
    const nextBlur = Math.max(55, blur);
    applyShadowToCanvas(nextBlur, 0, 0, baseHex, Math.max(0.85, alpha));
  };

  // Drop Mode: distance >= 25, blur >= 35, angle 90
  const handleToggleDropMode = () => {
    const nextBlur = Math.max(35, blur);
    const nextDist = Math.max(25, distance);
    applyShadowToCanvas(nextBlur, nextDist, 90, baseHex, Math.max(0.7, alpha));
  };

  // Compute CSS box-shadow for preview
  const rad = (angle * Math.PI) / 180;
  const pOffsetX = Math.round((distance / 2) * Math.cos(rad));
  const pOffsetY = Math.round((distance / 2) * Math.sin(rad));
  const pBlur = Math.round(blur / 2.5);
  const pColor = hexAndAlphaToRgba(baseHex, alpha);

  return (
    <div className="space-y-3 text-white select-none">
      {/* Header & Quick Boost Buttons */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Shadow & Glow Studio
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleBoostShadow}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-[10px] font-bold text-white shadow transition active:scale-95"
            title="Intensely increase blur and distance"
          >
            <Flame size={11} className="text-amber-300" />
            <span>+ Boost</span>
          </button>

          {hasActiveShadow && (
            <button
              type="button"
              onClick={handleClearShadow}
              className="text-[10px] text-rose-400 hover:text-rose-300 px-1.5 py-0.5 rounded transition font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
        <div className="min-w-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Shadow Preview
          </span>
          <span
            className="text-sm font-black text-white tracking-wider block mt-0.5 transition-all"
            style={{
              textShadow: hasActiveShadow
                ? `${pOffsetX}px ${pOffsetY}px ${pBlur}px ${pColor}`
                : 'none',
            }}
          >
            PREVIEW TEXT GLOW
          </span>
        </div>
        <div
          className="h-8 w-8 rounded-xl border border-white/10 shrink-0 flex items-center justify-center font-bold text-xs"
          style={{
            backgroundColor: '#1e293b',
            boxShadow: hasActiveShadow
              ? `${pOffsetX}px ${pOffsetY}px ${pBlur}px ${pColor}`
              : 'none',
          }}
        >
          Aa
        </div>
      </div>

      {/* Mode Quick Snap Buttons */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={handleToggleDropMode}
          className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white transition"
        >
          <Layers size={11} className="text-purple-400" />
          <span>↘ Drop Shadow</span>
        </button>

        <button
          type="button"
          onClick={handleToggleGlowMode}
          className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white transition"
        >
          <Sun size={11} className="text-amber-400" />
          <span>☀️ Omni Glow</span>
        </button>

        <button
          type="button"
          onClick={handleBoostShadow}
          className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-xl border border-purple-900/60 bg-purple-950/40 hover:bg-purple-900/50 text-[10px] font-bold text-purple-200 transition"
        >
          <Flame size={11} className="text-amber-300" />
          <span>+ Mega Boost</span>
        </button>
      </div>

      {/* Multi-Color Dual Tone Glow Styles */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Zap size={11} className="text-cyan-400" />
          <span>Multi-Color & Neon Glows</span>
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {DUAL_COLOR_GLOWS.map((dg) => (
            <button
              key={dg.id}
              type="button"
              onClick={() => handleApplyDualGlow(dg)}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-purple-500 transition text-left group"
            >
              <div
                className="h-3.5 rounded-md mb-1 border border-white/10 shadow-sm"
                style={{
                  background: `linear-gradient(to right, ${dg.primaryColor}, ${dg.secondaryColor})`,
                }}
              />
              <span className="text-[9px] font-bold text-slate-300 group-hover:text-purple-300 truncate block">
                {dg.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 16 Presets Grid */}
      <div className="space-y-1 pt-1 border-t border-slate-800/80">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Curated Shadow Presets ({PRESETS.length})
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESETS.map((p) => {
            const isMatch =
              p.id === 'none'
                ? !hasActiveShadow
                : Math.abs(blur - p.blur) <= 6 && Math.abs(distance - p.distance) <= 6;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`py-1.5 px-1 rounded-xl border text-[10px] font-bold transition text-center truncate ${
                  isMatch
                    ? 'border-purple-500 bg-purple-600/30 text-white shadow'
                    : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={`${p.name} (Blur: ${p.blur}px, Dist: ${p.distance}px, Color: ${p.color})`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shadow Color & Opacity Trigger */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400">Shadow Color & Alpha</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-700 bg-slate-900 hover:border-purple-500 transition"
            >
              <div
                className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                style={{ backgroundColor: hexAndAlphaToRgba(baseHex, alpha) }}
              />
              <span className="font-mono text-[10px] text-slate-200 uppercase font-bold">
                {baseHex} ({Math.round(alpha * 100)}%)
              </span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {showColorPicker && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <ColorPickerPopover
                  color={hexAndAlphaToRgba(baseHex, alpha)}
                  onChange={(newCol) => {
                    if (typeof newCol === 'string') {
                      const h = colorToHex(newCol);
                      const a = extractAlpha(newCol);
                      applyShadowToCanvas(blur, distance, angle, h, a);
                    }
                  }}
                  onClose={() => setShowColorPicker(false)}
                  title="Shadow Color"
                  allowGradient={false}
                  canvas={canvas}
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick Color Swatches with multi-color chips */}
        <div className="grid grid-cols-8 gap-1 pt-0.5">
          {[
            { color: '#000000', label: 'Black' },
            { color: '#ffffff', label: 'White' },
            { color: '#8b5cf6', label: 'Violet' },
            { color: '#06b6d4', label: 'Cyan' },
            { color: '#f59e0b', label: 'Amber' },
            { color: '#ef4444', label: 'Red' },
            { color: '#10b981', label: 'Emerald' },
            { color: '#d946ef', label: 'Neon Fuchsia' },
            { color: '#0f172a', label: 'Slate Navy' },
            { color: '#3b82f6', label: 'Cobalt Blue' },
            { color: '#84cc16', label: 'Lime Cyber' },
            { color: '#f43f5e', label: 'Rose Blaze' },
            { color: '#eab308', label: 'Solar Gold' },
            { color: '#ec4899', label: 'Hot Pink' },
            { color: '#6366f1', label: 'Indigo' },
            { color: '#14b8a6', label: 'Teal' },
          ].map((s) => (
            <button
              key={s.color}
              type="button"
              onClick={() => applyShadowToCanvas(blur, distance, angle, s.color, alpha)}
              style={{ backgroundColor: s.color }}
              className={`h-5 rounded-md border transition hover:scale-110 ${
                baseHex.toLowerCase() === s.color.toLowerCase()
                  ? 'border-purple-400 ring-1 ring-purple-400 scale-105'
                  : 'border-slate-800'
              }`}
              title={s.label}
            />
          ))}
        </div>
      </div>

      {/* Blur Radius Slider (0 - 200px) */}
      <div className="space-y-1 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-bold text-slate-300">Blur Radius (Spread)</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyShadowToCanvas(Math.min(200, blur + 25), distance, angle, baseHex, alpha)}
              className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[9px] font-bold text-purple-200 hover:bg-purple-900"
            >
              +25px
            </button>
            <span className="font-mono text-purple-300 font-bold">{blur}px</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          value={blur}
          onChange={(e) => applyShadowToCanvas(parseInt(e.target.value, 10), distance, angle, baseHex, alpha)}
          className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* Distance Slider (0 - 200px) */}
      <div className="space-y-1 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-bold text-slate-300">Distance (Elevation)</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyShadowToCanvas(blur, Math.min(200, distance + 15), angle, baseHex, alpha)}
              className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[9px] font-bold text-purple-200 hover:bg-purple-900"
            >
              +15px
            </button>
            <span className="font-mono text-purple-300 font-bold">{distance}px</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          value={distance}
          onChange={(e) => applyShadowToCanvas(blur, parseInt(e.target.value, 10), angle, baseHex, alpha)}
          className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* Direction / Angle Slider (0° - 360°) & 8 Cardinal Direction Snaps */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-bold text-slate-300 flex items-center gap-1">
            <Compass size={12} className="text-purple-400" />
            <span>Direction / Light Angle</span>
          </span>
          <span className="font-mono text-purple-300 font-bold">{angle}°</span>
        </div>

        <input
          type="range"
          min="0"
          max="360"
          value={angle}
          onChange={(e) => applyShadowToCanvas(blur, distance, parseInt(e.target.value, 10), baseHex, alpha)}
          className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        {/* 8 Direction Compass Quick Snaps */}
        <div className="grid grid-cols-8 gap-1 pt-1">
          {DIRECTION_SNAPS.map((dir) => (
            <button
              key={dir.label}
              type="button"
              onClick={() => applyShadowToCanvas(blur, distance, dir.angle, baseHex, alpha)}
              className={`p-1 rounded-lg border flex flex-col items-center justify-center transition ${
                Math.abs(angle - dir.angle) < 15
                  ? 'border-purple-500 bg-purple-600 text-white font-bold shadow'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
              title={`${dir.label} (${dir.angle}°)`}
            >
              {dir.icon}
              <span className="text-[8px] mt-0.5">{dir.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shadow Opacity Slider (0 - 100%) */}
      <div className="space-y-1 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-bold text-slate-300">Shadow Opacity</span>
          <span className="font-mono text-purple-300 font-bold">{Math.round(alpha * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.05"
          max="1"
          step="0.01"
          value={alpha}
          onChange={(e) => applyShadowToCanvas(blur, distance, angle, baseHex, parseFloat(e.target.value))}
          className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
}
