'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import {
  Pipette,
  X,
  Sparkles,
  Check,
  Copy,
  Plus,
  Search,
  Sliders,
  Palette,
  Layers,
  Flame,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ArrowDownRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  colorToHex,
  extractAlpha,
  hexAndAlphaToRgba,
  isGradientFill,
  createFabricLinearGradient,
  hsvToHex,
  hexToHsv,
  extractCanvasColors,
  GradientDirection,
  createFabricMultiGradient,
  GradientColorStop,
} from '../../lib/editor/colors';

interface ColorPickerPopoverProps {
  color: string | fabric.Gradient | fabric.Pattern | undefined;
  onChange: (colorValue: string | fabric.Gradient) => void;
  onClose: () => void;
  title?: string;
  allowGradient?: boolean;
  canvas?: fabric.Canvas | null;
}

// 42 Canva-style default solid circular swatches (7 rows x 6 cols)
const CANVA_SOLID_PALETTE = [
  // Greys & Neutrals
  '#000000', '#262626', '#525252', '#737373', '#a3a3a3', '#ffffff',
  // Reds & Pinks
  '#ef4444', '#f87171', '#f43f5e', '#fb7185', '#e11d48', '#881337',
  // Oranges & Ambers
  '#f97316', '#fb923c', '#fdba74', '#f59e0b', '#fbbf24', '#fef08a',
  // Greens & Limes
  '#10b981', '#34d399', '#86efac', '#84cc16', '#a3e635', '#14532d',
  // Teals & Cyans
  '#06b6d4', '#22d3ee', '#67e8f9', '#14b8a6', '#2dd4bf', '#0e7490',
  // Blues & Indigos
  '#3b82f6', '#60a5fa', '#93c5fd', '#6366f1', '#818cf8', '#1e3a8a',
  // Purples & Fuchsias
  '#8b5cf6', '#a855f7', '#c084fc', '#d946ef', '#e879f9', '#ec4899',
];

// 18 Canva-style circular multi-stop gradients
const CANVA_GRADIENT_PALETTE = [
  { name: 'Dark Slate', from: '#020617', to: '#334155' },
  { name: 'Monochrome', from: '#1e293b', to: '#94a3b8' },
  { name: 'Silver Pearl', from: '#64748b', to: '#ffffff' },
  { name: 'Cyber Neon', from: '#a855f7', to: '#3b82f6' },
  { name: 'Sunset Flare', from: '#ea580c', to: '#facc15' },
  { name: 'Twilight Purple', from: '#7c3aed', to: '#ec4899' },
  { name: 'Toxic Lime', from: '#84cc16', to: '#10b981' },
  { name: 'Ocean Cyan', from: '#0284c7', to: '#06b6d4' },
  { name: 'Royal Gold', from: '#ca8a04', to: '#fef08a' },
  { name: 'Crimson Fire', from: '#dc2626', to: '#f97316' },
  { name: 'Northern Aurora', from: '#10b981', to: '#06b6d4' },
  { name: 'Deep Space', from: '#0f172a', to: '#1e1b4b' },
  { name: 'Electric Berry', from: '#be185d', to: '#f472b6' },
  { name: 'Solar Heat', from: '#eab308', to: '#ef4444' },
  { name: 'Mint Dream', from: '#059669', to: '#6ee7b7' },
  { name: 'Peachy Sunrise', from: '#f43f5e', to: '#fb923c' },
  { name: 'Cosmic Violet', from: '#4c1d95', to: '#c084fc' },
  { name: 'Aqua Marine', from: '#0891b2', to: '#a5f3fc' },
];

export function ColorPickerPopover({
  color,
  onChange,
  onClose,
  title = 'Color Palette',
  allowGradient = true,
  canvas,
}: ColorPickerPopoverProps) {
  const initialIsGrad = isGradientFill(color);
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'hsv'>(
    initialIsGrad ? 'gradient' : 'solid'
  );

  // Search input: e.g. "blue", "#00c4cc"
  const [searchQuery, setSearchQuery] = useState('');

  // Solid color state
  const [hexColor, setHexColor] = useState<string>(() => colorToHex(color, '#3b82f6'));
  const [alpha, setAlpha] = useState<number>(() => extractAlpha(typeof color === 'string' ? color : undefined));
  const [hsv, setHsv] = useState<{ h: number; s: number; v: number }>(() => hexToHsv(colorToHex(color, '#3b82f6')));
  const [copied, setCopied] = useState(false);

  // Gradient state
  const [gradStart, setGradStart] = useState<string>(() =>
    initialIsGrad && (color as fabric.Gradient).colorStops?.[0]?.color
      ? colorToHex((color as fabric.Gradient).colorStops![0].color)
      : '#3b82f6'
  );
  const [gradEnd, setGradEnd] = useState<string>(() =>
    initialIsGrad && (color as fabric.Gradient).colorStops?.[1]?.color
      ? colorToHex((color as fabric.Gradient).colorStops![1].color)
      : '#8b5cf6'
  );
  const [gradDir, setGradDir] = useState<GradientDirection>('to-bottom');
  const [activeGradStop, setActiveGradStop] = useState<'start' | 'end'>('start');

  const satValRef = useRef<HTMLDivElement>(null);
  const isDraggingSatVal = useRef<boolean>(false);

  // Sync external color changes
  useEffect(() => {
    if (typeof color === 'string') {
      const hex = colorToHex(color);
      setHexColor(hex);
      setAlpha(extractAlpha(color));
      setHsv(hexToHsv(hex));
    }
  }, [color]);

  // Apply solid color to canvas
  const applySolid = useCallback(
    (newHex: string, newAlpha: number = alpha) => {
      setHexColor(newHex);
      setAlpha(newAlpha);
      if (newAlpha < 1) {
        onChange(hexAndAlphaToRgba(newHex, newAlpha));
      } else {
        onChange(newHex);
      }
    },
    [onChange, alpha]
  );

  // Apply gradient to canvas
  const applyGradient = useCallback(
    (start: string, end: string, dir: GradientDirection = gradDir) => {
      setGradStart(start);
      setGradEnd(end);
      setGradDir(dir);
      const stops: GradientColorStop[] = [
        { offset: 0, color: start },
        { offset: 1, color: end },
      ];
      const grad = createFabricMultiGradient(stops, dir, 300, 300);
      onChange(grad);
    },
    [onChange, gradDir]
  );

  // 2D Sat/Val pointer tracking
  const updateSatValFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!satValRef.current) return;
    const rect = satValRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const s = x / rect.width;
    const v = 1 - y / rect.height;

    const newHsv = { ...hsv, s, v };
    setHsv(newHsv);
    const newHex = hsvToHex(newHsv.h, s, v);

    if (activeTab === 'gradient') {
      if (activeGradStop === 'start') {
        applyGradient(newHex, gradEnd, gradDir);
      } else {
        applyGradient(gradStart, newHex, gradDir);
      }
    } else {
      applySolid(newHex, alpha);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingSatVal.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSatValFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSatVal.current) {
      updateSatValFromPointer(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingSatVal.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Hue slider change
  const handleHueChange = (newHue: number) => {
    const newHsv = { ...hsv, h: newHue };
    setHsv(newHsv);
    const newHex = hsvToHex(newHue, newHsv.s, newHsv.v);

    if (activeTab === 'gradient') {
      if (activeGradStop === 'start') {
        applyGradient(newHex, gradEnd, gradDir);
      } else {
        applyGradient(gradStart, newHex, gradDir);
      }
    } else {
      applySolid(newHex, alpha);
    }
  };

  // Eyedropper API
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const picked = result.sRGBHex;
          setHexColor(picked);
          setHsv(hexToHsv(picked));
          if (activeTab === 'gradient') {
            if (activeGradStop === 'start') {
              applyGradient(picked, gradEnd, gradDir);
            } else {
              applyGradient(gradStart, picked, gradDir);
            }
          } else {
            applySolid(picked, alpha);
          }
        }
      } catch {
        // user cancelled
      }
    }
  };

  // Copy Hex
  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(hexColor);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Extract canvas colors
  const canvasColors = extractCanvasColors(canvas);

  // Search filter handler
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const trimmed = query.trim();
    if (trimmed.startsWith('#') && (trimmed.length === 4 || trimmed.length === 7)) {
      const hex = colorToHex(trimmed);
      setHexColor(hex);
      setHsv(hexToHsv(hex));
      applySolid(hex, alpha);
    }
  };

  // Filter swatches based on query
  const filteredSolidPalette = CANVA_SOLID_PALETTE.filter((hex) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    if (hex.toLowerCase().includes(q)) return true;
    const colorNames: Record<string, string[]> = {
      blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#6366f1', '#818cf8', '#1e3a8a', '#0ea5e9'],
      cyan: ['#06b6d4', '#22d3ee', '#67e8f9', '#14b8a6', '#2dd4bf'],
      red: ['#ef4444', '#f87171', '#f43f5e', '#fb7185', '#e11d48', '#881337'],
      green: ['#10b981', '#34d399', '#86efac', '#84cc16', '#a3e635', '#14532d'],
      yellow: ['#f59e0b', '#fbbf24', '#fef08a'],
      orange: ['#f97316', '#fb923c', '#fdba74'],
      purple: ['#8b5cf6', '#a855f7', '#c084fc', '#d946ef', '#e879f9', '#ec4899'],
      black: ['#000000', '#262626', '#525252'],
      white: ['#ffffff', '#a3a3a3'],
    };
    for (const [name, list] of Object.entries(colorNames)) {
      if (name.includes(q) && list.includes(hex)) return true;
    }
    return false;
  });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-84 sm:w-92 rounded-2xl border border-slate-700/90 bg-slate-950/98 p-3.5 shadow-2xl text-white select-none backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 z-50 space-y-3"
      style={{ width: '350px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="h-5 w-5 rounded-full border border-white/20 shadow shrink-0"
            style={{
              background:
                activeTab === 'gradient'
                  ? `linear-gradient(135deg, ${gradStart}, ${gradEnd})`
                  : hexColor,
            }}
          />
          <span className="text-xs font-bold text-slate-200 truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          {typeof window !== 'undefined' && 'EyeDropper' in window && (
            <button
              type="button"
              onClick={handleEyeDropper}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Eyedropper (Pick color from screen)"
            >
              <Pipette size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Canva-style Search Input: Try "blue" or "#00c4cc" */}
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder='Try "blue" or "#00c4cc"'
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {/* Canva-Style Active Color Row */}
      <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className="h-7 w-7 rounded-full border-2 border-white/30 shadow-md shrink-0 ring-2 ring-purple-500/50"
            style={{
              background:
                activeTab === 'gradient'
                  ? `linear-gradient(135deg, ${gradStart}, ${gradEnd})`
                  : hexColor,
            }}
          />
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              {activeTab === 'gradient' ? 'Active Gradient' : 'Active Solid'}
            </span>
            <span className="font-mono text-xs font-bold text-white uppercase">
              {activeTab === 'gradient' ? `${gradStart} → ${gradEnd}` : hexColor}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'hsv' ? 'solid' : 'hsv')}
            className={`p-1.5 rounded-lg border transition flex items-center gap-1 text-[10px] font-bold ${
              activeTab === 'hsv'
                ? 'border-purple-500 bg-purple-600 text-white'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
            }`}
            title="Toggle Custom HSV Spectrum Studio"
          >
            <Sliders size={12} />
            <span>Spectrum</span>
          </button>

          {typeof window !== 'undefined' && 'EyeDropper' in window && (
            <button
              type="button"
              onClick={handleEyeDropper}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
              title="Pick color"
            >
              <Pipette size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher: Solid vs Gradient */}
      {allowGradient && (
        <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('solid');
              applySolid(hexColor, alpha);
            }}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'solid'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Solid Colours
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('gradient');
              applyGradient(gradStart, gradEnd, gradDir);
            }}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'gradient'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gradient Colours
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2D INTERACTIVE SATURATION / VALUE GRADIENT BOX (Spectrum Studio)          */}
      {/* ========================================================================= */}
      {activeTab === 'hsv' && (
        <div className="space-y-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800 animate-in fade-in duration-150">
          <div
            ref={satValRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative h-28 w-full rounded-xl overflow-hidden cursor-crosshair border border-slate-800 shadow-inner select-none touch-none"
            style={{
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, #ffffff 0%, transparent 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, #000000 100%)',
              }}
            />
            <div
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none ring-1 ring-black/40"
              style={{
                left: `${hsv.s * 100}%`,
                top: `${(1 - hsv.v) * 100}%`,
                backgroundColor: hexColor,
              }}
            />
          </div>

          {/* Rainbow Hue Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold">
              <span>Hue Spectrum</span>
              <span className="font-mono text-purple-300 font-bold">{hsv.h}°</span>
            </div>
            <div className="relative h-3 w-full rounded-lg overflow-hidden border border-slate-700/80 shadow-inner">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                }}
              />
              <input
                type="range"
                min="0"
                max="360"
                value={hsv.h}
                onChange={(e) => handleHueChange(parseInt(e.target.value, 10))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold">
              <span>Opacity</span>
              <span className="font-mono text-purple-300 font-bold">{Math.round(alpha * 100)}%</span>
            </div>
            <div className="relative h-3 w-full rounded-lg overflow-hidden border border-slate-700/80 bg-[repeating-conic-gradient(#334155_0_25%,#1e293b_0_50%)] [background-size:8px_8px]">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent, ${hexColor})`,
                }}
              />
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.01"
                value={alpha}
                onChange={(e) => applySolid(hexColor, parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Hex Input & Copy */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 focus-within:border-purple-500">
              <span className="text-[10px] text-slate-400 font-mono">HEX</span>
              <input
                type="text"
                value={hexColor}
                onChange={(e) => {
                  const val = e.target.value;
                  setHexColor(val);
                  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
                    setHsv(hexToHsv(val));
                    applySolid(val, alpha);
                  }
                }}
                className="w-24 text-right bg-transparent text-xs font-mono font-bold text-white outline-none uppercase"
                placeholder="#000000"
              />
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Copy HEX Code"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SOLID TAB: CANVA-STYLE CIRCULAR PALETTES                                  */}
      {/* ========================================================================= */}
      {activeTab === 'solid' && (
        <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-0.5">
          {/* Document / Canvas Extracted Colours */}
          {canvasColors.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Photo & Document Colours
              </span>
              <div className="flex flex-wrap gap-1.5">
                {canvasColors.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => {
                      setHexColor(hex);
                      setHsv(hexToHsv(hex));
                      applySolid(hex, alpha);
                    }}
                    style={{ backgroundColor: hex }}
                    className="h-6 w-6 rounded-full border-2 border-slate-700/80 hover:scale-110 transition shadow-sm"
                    title={hex}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Default Solid Colours Grid (Circular Swatches) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Default Solid Colours ({filteredSolidPalette.length})
            </span>
            <div className="grid grid-cols-6 gap-2">
              {filteredSolidPalette.map((swatch) => {
                const isSelected = hexColor.toLowerCase() === swatch.toLowerCase();
                return (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => {
                      setHexColor(swatch);
                      setHsv(hexToHsv(swatch));
                      applySolid(swatch, alpha);
                    }}
                    style={{ backgroundColor: swatch }}
                    className={`h-7 w-7 rounded-full border transition hover:scale-110 flex items-center justify-center shadow-sm ${
                      isSelected
                        ? 'border-purple-400 ring-2 ring-purple-400 scale-105'
                        : 'border-white/10 hover:border-white/40'
                    }`}
                    title={swatch}
                  >
                    {isSelected && (
                      <Check
                        size={12}
                        className={swatch === '#ffffff' ? 'text-black' : 'text-white'}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GRADIENT TAB: MULTI-STOP CANVA-STYLE CIRCULAR GRADIENTS & CONTROLS        */}
      {/* ========================================================================= */}
      {activeTab === 'gradient' && (
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-0.5">
          {/* Gradient Color Stops (Start / End) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Gradient Stops
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveGradStop('start');
                  setHexColor(gradStart);
                  setHsv(hexToHsv(gradStart));
                }}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                  activeGradStop === 'start'
                    ? 'border-purple-500 bg-purple-950/40 text-white shadow'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <div
                  className="h-5 w-5 rounded-full border border-white/20 shadow-sm shrink-0"
                  style={{ backgroundColor: gradStart }}
                />
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 block">Start Stop</span>
                  <span className="font-mono text-[10px] font-bold uppercase truncate block">
                    {gradStart}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveGradStop('end');
                  setHexColor(gradEnd);
                  setHsv(hexToHsv(gradEnd));
                }}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                  activeGradStop === 'end'
                    ? 'border-purple-500 bg-purple-950/40 text-white shadow'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <div
                  className="h-5 w-5 rounded-full border border-white/20 shadow-sm shrink-0"
                  style={{ backgroundColor: gradEnd }}
                />
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 block">End Stop</span>
                  <span className="font-mono text-[10px] font-bold uppercase truncate block">
                    {gradEnd}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Direction Buttons */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Gradient Direction
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'to-bottom', label: 'Top ↓', icon: <ArrowDown size={11} /> },
                { id: 'to-top', label: 'Bottom ↑', icon: <ArrowUp size={11} /> },
                { id: 'to-right', label: 'Right →', icon: <ArrowRight size={11} /> },
                { id: 'to-left', label: 'Left ←', icon: <ArrowLeft size={11} /> },
                { id: 'diagonal', label: 'Diag ↘', icon: <ArrowDownRight size={11} /> },
                { id: 'diagonal-alt', label: 'Diag ↙', icon: <ArrowDownLeft size={11} /> },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => applyGradient(gradStart, gradEnd, d.id as GradientDirection)}
                  className={`py-1 px-1 text-[9px] font-bold rounded-lg border flex items-center justify-center gap-1 transition ${
                    gradDir === d.id
                      ? 'border-purple-500 bg-purple-600 text-white shadow'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {d.icon}
                  <span>{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Default Gradient Colours Grid (Canva Circular Spheres) */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Default Gradient Colours ({CANVA_GRADIENT_PALETTE.length})
            </span>
            <div className="grid grid-cols-6 gap-2">
              {CANVA_GRADIENT_PALETTE.map((gp) => (
                <button
                  key={gp.name}
                  type="button"
                  onClick={() => {
                    setGradStart(gp.from);
                    setGradEnd(gp.to);
                    setHexColor(activeGradStop === 'start' ? gp.from : gp.to);
                    setHsv(hexToHsv(activeGradStop === 'start' ? gp.from : gp.to));
                    applyGradient(gp.from, gp.to, gradDir);
                  }}
                  className="h-7 w-7 rounded-full border border-white/20 hover:scale-110 hover:border-white/60 transition shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${gp.from}, ${gp.to})`,
                  }}
                  title={gp.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
