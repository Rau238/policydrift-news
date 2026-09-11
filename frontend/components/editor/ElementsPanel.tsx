'use client';

import React, { useState, useEffect } from 'react';
import {
  Square,
  Circle,
  Triangle,
  Star,
  Minus,
  Hexagon,
  Sparkles,
  Layers,
  Flame,
  Plus,
  Trash2,
  Sliders,
  Search,
  Check,
  Bookmark,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ArrowDownRight,
  ArrowDownLeft,
  Disc,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import {
  configureObjectControls,
  addBottomGradientSplash,
  addCustomGradientOverlay,
  BOTTOM_SPLASH_PRESETS,
  type BottomSplashPreset,
} from '../../lib/editor/canvas';
import {
  GradientColorStop,
  GradientDirection,
  colorToHex,
  extractAlpha,
  hexAndAlphaToRgba,
} from '../../lib/editor/colors';
import { fabric } from 'fabric';

interface SavedGradientPreset {
  id: string;
  name: string;
  stops: GradientColorStop[];
  direction: GradientDirection;
  coverage: 'bottom' | 'full';
}

const QUICK_STARTER_PALETTES = [
  {
    name: 'Black to Transparent Shadow',
    direction: 'to-top' as GradientDirection,
    stops: [
      { id: '1', color: 'rgba(0, 0, 0, 0.95)', offset: 0 },
      { id: '2', color: 'rgba(0, 0, 0, 0.50)', offset: 0.5 },
      { id: '3', color: 'rgba(0, 0, 0, 0)', offset: 1 },
    ],
  },
  {
    name: 'Cyber Purple to Transparent',
    direction: 'to-top' as GradientDirection,
    stops: [
      { id: '1', color: 'rgba(88, 28, 135, 0.95)', offset: 0 },
      { id: '2', color: 'rgba(168, 85, 247, 0.50)', offset: 0.5 },
      { id: '3', color: 'rgba(147, 51, 234, 0)', offset: 1 },
    ],
  },
  {
    name: 'Ocean Teal to Transparent',
    direction: 'to-top' as GradientDirection,
    stops: [
      { id: '1', color: 'rgba(15, 23, 42, 0.95)', offset: 0 },
      { id: '2', color: 'rgba(6, 182, 212, 0.50)', offset: 0.5 },
      { id: '3', color: 'rgba(6, 182, 212, 0)', offset: 1 },
    ],
  },
  {
    name: 'Sunset Gold to Transparent',
    direction: 'to-top' as GradientDirection,
    stops: [
      { id: '1', color: 'rgba(28, 25, 23, 0.95)', offset: 0 },
      { id: '2', color: 'rgba(234, 88, 12, 0.55)', offset: 0.5 },
      { id: '3', color: 'rgba(250, 204, 21, 0)', offset: 1 },
    ],
  },
  {
    name: 'Crimson Alert to Transparent',
    direction: 'to-top' as GradientDirection,
    stops: [
      { id: '1', color: 'rgba(69, 10, 10, 0.98)', offset: 0 },
      { id: '2', color: 'rgba(220, 38, 38, 0.50)', offset: 0.5 },
      { id: '3', color: 'rgba(220, 38, 38, 0)', offset: 1 },
    ],
  },
  {
    name: 'Radial Spotlight Vignette',
    direction: 'radial' as GradientDirection,
    stops: [
      { id: '1', color: 'rgba(0, 0, 0, 0)', offset: 0 },
      { id: '2', color: 'rgba(2, 6, 23, 0.60)', offset: 0.6 },
      { id: '3', color: 'rgba(2, 6, 23, 0.98)', offset: 1 },
    ],
  },
];

export function ElementsPanel() {
  const { canvas, refreshLayers, pushHistoryState, project } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'splashes' | 'custom-gradient' | 'shapes'>('splashes');

  // Search filter for presets
  const [searchQuery, setSearchQuery] = useState('');

  // Coverage toggle for splashes tab
  const [splashCoverage, setSplashCoverage] = useState<'bottom' | 'full'>('bottom');

  // ==========================================
  // CUSTOM GRADIENT MAKER STATE
  // ==========================================
  const [customStops, setCustomStops] = useState<GradientColorStop[]>([
    { id: 'stop-1', color: '#020617', offset: 0 },
    { id: 'stop-2', color: '#7c3aed', offset: 0.5 },
    { id: 'stop-3', color: '#06b6d4', offset: 1 },
  ]);
  const [customDirection, setCustomDirection] = useState<GradientDirection>('to-top');
  const [customCoverage, setCustomCoverage] = useState<'bottom' | 'full'>('bottom');
  const [customName, setCustomName] = useState('Custom Vivid Overlay');
  const [savedCustomPresets, setSavedCustomPresets] = useState<SavedGradientPreset[]>([]);

  // Load saved custom gradients from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('my_custom_gradient_presets');
      if (saved) {
        setSavedCustomPresets(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveCurrentPreset = () => {
    const newPreset: SavedGradientPreset = {
      id: `custom-grad-${Date.now()}`,
      name: customName || `Gradient ${savedCustomPresets.length + 1}`,
      stops: [...customStops],
      direction: customDirection,
      coverage: customCoverage,
    };
    const updated = [newPreset, ...savedCustomPresets];
    setSavedCustomPresets(updated);
    try {
      localStorage.setItem('my_custom_gradient_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeSavedPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedCustomPresets.filter((p) => p.id !== id);
    setSavedCustomPresets(updated);
    try {
      localStorage.setItem('my_custom_gradient_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const loadSavedPreset = (preset: SavedGradientPreset) => {
    setCustomStops([...preset.stops]);
    setCustomDirection(preset.direction);
    setCustomCoverage(preset.coverage);
    setCustomName(preset.name);
  };

  // Add new stop to custom gradient
  const handleAddStop = () => {
    if (customStops.length >= 6) return;
    const lastStop = customStops[customStops.length - 1];
    const prevStop = customStops[customStops.length - 2] || { offset: 0 };
    const midOffset = +(
      ((prevStop.offset + lastStop.offset) / 2).toFixed(2)
    );
    const newStop: GradientColorStop = {
      id: `stop-${Date.now()}`,
      color: '#ec4899',
      offset: midOffset,
    };
    const newStops = [...customStops, newStop].sort((a, b) => a.offset - b.offset);
    setCustomStops(newStops);
  };

  // Remove stop
  const handleRemoveStop = (id: string | undefined) => {
    if (customStops.length <= 2) return;
    setCustomStops(customStops.filter((s) => s.id !== id));
  };

  // Update stop base color while preserving alpha
  const handleUpdateStopColor = (id: string | undefined, newHex: string) => {
    setCustomStops(
      customStops.map((s) => {
        if (s.id !== id) return s;
        const curAlpha = extractAlpha(s.color);
        const col = hexAndAlphaToRgba(newHex, curAlpha);
        return { ...s, color: col };
      })
    );
  };

  // Update stop opacity / alpha (0 to 1)
  const handleUpdateStopAlpha = (id: string | undefined, alphaVal: number) => {
    setCustomStops(
      customStops.map((s) => {
        if (s.id !== id) return s;
        const baseHex = colorToHex(s.color);
        const col = hexAndAlphaToRgba(baseHex, alphaVal);
        return { ...s, color: col };
      })
    );
  };

  // Update stop offset
  const handleUpdateStopOffset = (id: string | undefined, offset: number) => {
    setCustomStops(
      customStops
        .map((s) => (s.id === id ? { ...s, offset } : s))
        .sort((a, b) => a.offset - b.offset)
    );
  };

  // Build CSS gradient string for live preview
  const getCssGradientPreview = () => {
    const sorted = [...customStops].sort((a, b) => a.offset - b.offset);
    const stopsStr = sorted
      .map((s) => `${s.color} ${Math.round(s.offset * 100)}%`)
      .join(', ');

    if (customDirection === 'radial') {
      return `radial-gradient(circle at center, ${stopsStr})`;
    }

    const dirMap: Record<string, string> = {
      'to-top': 'to top',
      'to-bottom': 'to bottom',
      'to-right': 'to right',
      'to-left': 'to left',
      diagonal: 'to bottom right',
      'diagonal-alt': 'to top left',
    };

    return `linear-gradient(${dirMap[customDirection] || 'to top'}, ${stopsStr})`;
  };

  // Insert custom gradient into canvas
  const handleInsertCustomGradient = (coverageOverride?: 'bottom' | 'full') => {
    if (!canvas) return;
    const coverage = coverageOverride || customCoverage;
    const isFull = coverage === 'full';
    addCustomGradientOverlay(
      canvas,
      project.width,
      project.height,
      customStops,
      customDirection,
      isFull,
      customName
    );
    refreshLayers();
    pushHistoryState();
  };

  // Insert bottom splash preset into canvas
  const handleAddSplash = (preset: BottomSplashPreset, coverageOverride?: 'bottom' | 'full') => {
    if (!canvas) return;
    const coverage = coverageOverride || splashCoverage;
    const heightPct = coverage === 'full' ? 1.0 : 0.68;
    addBottomGradientSplash(canvas, project.width, project.height, preset, heightPct);
    refreshLayers();
    pushHistoryState();
  };

  // Add geometric shape
  const addShape = (shapeType: string) => {
    if (!canvas) return;

    let shapeObj: fabric.Object | null = null;
    const centerX = project.width / 2;
    const centerY = project.height / 2;

    switch (shapeType) {
      case 'rect':
        shapeObj = new fabric.Rect({
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          width: 260,
          height: 180,
          fill: '#3b82f6',
          stroke: '#1d4ed8',
          strokeWidth: 2,
        });
        break;

      case 'rounded-rect':
        shapeObj = new fabric.Rect({
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          width: 280,
          height: 180,
          rx: 24,
          ry: 24,
          fill: '#0f766e',
          stroke: '#14b8a6',
          strokeWidth: 2,
        });
        break;

      case 'circle':
        shapeObj = new fabric.Circle({
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          radius: 100,
          fill: '#8b5cf6',
          stroke: '#7c3aed',
          strokeWidth: 2,
        });
        break;

      case 'triangle':
        shapeObj = new fabric.Triangle({
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          width: 220,
          height: 190,
          fill: '#f59e0b',
          stroke: '#d97706',
          strokeWidth: 2,
        });
        break;

      case 'star': {
        const points = [
          { x: 100, y: 10 },
          { x: 125, y: 80 },
          { x: 200, y: 80 },
          { x: 140, y: 125 },
          { x: 160, y: 195 },
          { x: 100, y: 150 },
          { x: 40, y: 195 },
          { x: 60, y: 125 },
          { x: 0, y: 80 },
          { x: 75, y: 80 },
        ];
        shapeObj = new fabric.Polygon(points, {
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          fill: '#ec4899',
          stroke: '#db2777',
          strokeWidth: 2,
        });
        break;
      }

      case 'line':
        shapeObj = new fabric.Line([centerX - 160, centerY, centerX + 160, centerY], {
          stroke: '#ffffff',
          strokeWidth: 4,
          originX: 'center',
          originY: 'center',
        });
        break;

      case 'hexagon': {
        const hexPoints = [
          { x: 50, y: 0 },
          { x: 150, y: 0 },
          { x: 200, y: 86 },
          { x: 150, y: 172 },
          { x: 50, y: 172 },
          { x: 0, y: 86 },
        ];
        shapeObj = new fabric.Polygon(hexPoints, {
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          fill: '#06b6d4',
          stroke: '#0891b2',
          strokeWidth: 2,
        });
        break;
      }
    }

    if (shapeObj) {
      (shapeObj as unknown as { id: string; customName: string }).id = `shape-${Date.now()}`;
      (shapeObj as unknown as { customName: string }).customName = shapeType.replace('-', ' ');
      configureObjectControls(shapeObj);
      canvas.add(shapeObj);
      canvas.setActiveObject(shapeObj);
      canvas.renderAll();
      refreshLayers();
      pushHistoryState();
    }
  };

  const filteredPresets = BOTTOM_SPLASH_PRESETS.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  const SHAPE_BUTTONS = [
    { id: 'rect', label: 'Rectangle', icon: <Square size={20} className="text-blue-400" /> },
    { id: 'rounded-rect', label: 'Rounded Box', icon: <Square size={20} className="text-teal-400 rounded-lg" /> },
    { id: 'circle', label: 'Circle', icon: <Circle size={20} className="text-purple-400" /> },
    { id: 'triangle', label: 'Triangle', icon: <Triangle size={20} className="text-amber-400" /> },
    { id: 'star', label: '5-Point Star', icon: <Star size={20} className="text-pink-400" /> },
    { id: 'hexagon', label: 'Hexagon', icon: <Hexagon size={20} className="text-cyan-400" /> },
    { id: 'line', label: 'Divider Line', icon: <Minus size={20} className="text-white stroke-[3]" /> },
  ];

  return (
    <div className="space-y-3.5 p-3.5 text-white select-none">
      {/* Header */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <Sparkles size={14} className="text-purple-400" />
          <span>Elements & Overlays</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Custom multi-stop gradients, shadow vignettes, and geometric shapes
        </p>
      </div>

      {/* 3 Main Tabs: Splashes | Custom Gradient Maker | Shapes */}
      <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('splashes')}
          className={`flex-1 py-1.5 px-1 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'splashes'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Curated Gradient Splashes"
        >
          <Flame size={13} />
          <span>Splashes ({BOTTOM_SPLASH_PRESETS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom-gradient')}
          className={`flex-1 py-1.5 px-1 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'custom-gradient'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Custom Multi-Stop Gradient Studio"
        >
          <Sliders size={13} />
          <span>Gradient Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shapes')}
          className={`py-1.5 px-2.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 ${
            activeTab === 'shapes'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Geometric Shapes"
        >
          <Square size={13} />
          <span>Shapes</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. COLOR SPLASHES TAB (16 Presets with Search & Direct 1-Click Buttons)  */}
      {/* ========================================================================= */}
      {activeTab === 'splashes' && (
        <div className="space-y-2.5">
          {/* Search input */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by color (e.g. dark, cyan, gold, neon)..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Coverage Selector */}
          <div className="flex items-center justify-between bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1 pl-1">
              <Sparkles size={12} className="text-purple-400" />
              <span>Default Coverage:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSplashCoverage('bottom')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  splashCoverage === 'bottom'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
                title="Covers bottom 68% of canvas as readable shadow vignette"
              >
                Bottom (68%)
              </button>
              <button
                type="button"
                onClick={() => setSplashCoverage('full')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  splashCoverage === 'full'
                    ? 'bg-blue-600 text-white shadow ring-1 ring-blue-400'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
                title="Covers 100% full canvas from top to bottom"
              >
                Full Canvas (100%)
              </button>
            </div>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-1 gap-2 max-h-[460px] overflow-y-auto custom-scrollbar pr-0.5">
            {filteredPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleAddSplash(preset)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-800/90 bg-slate-900/80 hover:border-purple-500/60 hover:bg-slate-800/90 transition text-left group shadow cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <div
                    className="h-10 w-10 rounded-xl shrink-0 border border-slate-700/80 shadow-md flex items-end justify-center pb-1 overflow-hidden"
                    style={{
                      background: `linear-gradient(to top, ${preset.startColor} 0%, ${preset.midColor || preset.endColor} 65%, transparent 100%)`,
                    }}
                  >
                    <span className="text-[10px] font-bold text-white/90">Aa</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-100 group-hover:text-purple-300 transition truncate">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {preset.description}
                    </span>
                  </div>
                </div>

                {/* Direct 1-click insert options */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleAddSplash(preset, 'bottom')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500 hover:bg-slate-900 text-[10px] font-bold text-slate-300 hover:text-white transition"
                    title="Insert as bottom 68% shadow vignette"
                  >
                    Bottom
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSplash(preset, 'full')}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-[10px] font-bold text-white transition shadow shadow-blue-950"
                    title="Insert as 100% full canvas atmospheric overlay"
                  >
                    Full
                  </button>
                </div>
              </div>
            ))}

            {filteredPresets.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-xs">
                No matching gradient overlays found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CUSTOM GRADIENT MAKER (Multi-Stop, Direction, Live Preview, Preset Save) */}
      {/* ========================================================================= */}
      {activeTab === 'custom-gradient' && (
        <div className="space-y-3">
          {/* Live Interactive Preview Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
            <div
              className="h-28 w-full transition-all duration-300 flex flex-col justify-end p-3 relative"
              style={{ background: getCssGradientPreview() }}
            >
              {/* Overlay simulation of headline text for immediate feedback */}
              <div className="relative z-10 drop-shadow-md">
                <span className="inline-block px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs text-[8px] font-black uppercase text-amber-300 tracking-wider mb-1">
                  Live Preview • {customDirection}
                </span>
                <h4 className="text-xs font-black text-white leading-tight uppercase truncate">
                  {customName || 'Custom Gradient'}
                </h4>
                <p className="text-[9px] text-white/80 line-clamp-1">
                  High-contrast background overlay for breaking news headlines
                </p>
              </div>
            </div>

            {/* Quick action bar right on the preview card */}
            <div className="flex items-center justify-between bg-slate-950 px-3 py-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400">
                {customStops.length} Color Stops
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={saveCurrentPreset}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500 text-[10px] font-bold text-purple-300 transition"
                  title="Save to My Presets"
                >
                  <Bookmark size={11} />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertCustomGradient()}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-[10px] font-bold text-white shadow-md transition active:scale-95"
                  title="Insert into Canvas"
                >
                  <Plus size={12} />
                  <span>Insert to Canvas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Palette Inspirations */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Starter Palettes
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {QUICK_STARTER_PALETTES.map((pal) => (
                <button
                  key={pal.name}
                  type="button"
                  onClick={() => {
                    setCustomStops(pal.stops.map((s, i) => ({ ...s, id: `stop-${i}-${Date.now()}` })));
                    setCustomDirection(pal.direction);
                    setCustomName(pal.name);
                  }}
                  className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-purple-500 transition text-left group"
                >
                  <div
                    className="h-5 rounded-lg mb-1 shadow-inner border border-white/10"
                    style={{
                      background: `linear-gradient(to right, ${pal.stops.map((s) => s.color).join(', ')})`,
                    }}
                  />
                  <span className="text-[9px] font-bold text-slate-300 group-hover:text-white truncate block">
                    {pal.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gradient Direction Selector */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Compass size={12} className="text-purple-400" />
                <span>Direction / Flow</span>
              </span>
              <span className="text-purple-300 font-mono text-[9px] uppercase">
                {customDirection}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'to-top', label: 'Bottom ↑', icon: <ArrowUp size={11} /> },
                { id: 'to-bottom', label: 'Top ↓', icon: <ArrowDown size={11} /> },
                { id: 'to-right', label: 'Right →', icon: <ArrowRight size={11} /> },
                { id: 'to-left', label: 'Left ←', icon: <ArrowLeft size={11} /> },
                { id: 'diagonal', label: 'Diag ↘', icon: <ArrowDownRight size={11} /> },
                { id: 'diagonal-alt', label: 'Diag ↙', icon: <ArrowDownLeft size={11} /> },
                { id: 'radial', label: 'Radial ◉', icon: <Disc size={11} /> },
              ].map((dir) => (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() => setCustomDirection(dir.id as GradientDirection)}
                  className={`py-1.5 px-1 rounded-xl border flex items-center justify-center gap-1 text-[10px] font-bold transition ${
                    customDirection === dir.id
                      ? 'border-purple-500 bg-purple-600 text-white shadow'
                      : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-white'
                  }`}
                >
                  {dir.icon}
                  <span>{dir.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Coverage Switcher: Bottom Vignette vs Full Canvas */}
          <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-300 pl-1">
              Coverage Size:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCustomCoverage('bottom')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  customCoverage === 'bottom'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                Bottom Vignette (68%)
              </button>
              <button
                type="button"
                onClick={() => setCustomCoverage('full')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  customCoverage === 'full'
                    ? 'bg-blue-600 text-white shadow ring-1 ring-blue-400'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                Full Canvas (100%)
              </button>
            </div>
          </div>

          {/* Color Stops Manager (2, 3, 4+ stops) */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Multi-Color Stops ({customStops.length})
              </span>
              {customStops.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500 text-[10px] font-bold text-purple-300 hover:text-white transition"
                >
                  <Plus size={11} />
                  <span>+ Add Stop</span>
                </button>
              )}
            </div>

            {/* Individual Stop Rows */}
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-0.5">
              {customStops.map((stop, idx) => {
                const stopAlpha = extractAlpha(stop.color);
                const isTransparent = stopAlpha === 0;

                return (
                  <div
                    key={stop.id || idx}
                    className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 space-y-1.5"
                  >
                    {/* Top Row: Color + Hex + Offset + Delete */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-slate-500 w-3">
                        #{idx + 1}
                      </span>

                      {/* Color Picker trigger */}
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          value={colorToHex(stop.color)}
                          onChange={(e) => handleUpdateStopColor(stop.id, e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div
                          className="h-6 w-6 rounded-lg border border-white/20 shadow-sm relative overflow-hidden"
                          style={{
                            backgroundColor: stop.color,
                            backgroundImage: isTransparent
                              ? 'repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%)'
                              : 'none',
                            backgroundSize: '6px 6px',
                          }}
                        />
                      </div>

                      {/* Hex Text */}
                      <input
                        type="text"
                        value={colorToHex(stop.color)}
                        onChange={(e) => handleUpdateStopColor(stop.id, e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-[10px] font-mono font-bold text-slate-200 uppercase outline-none focus:border-purple-500"
                      />

                      {/* Position / Offset Slider (0% - 100%) */}
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <span className="text-[8px] font-semibold text-slate-400">Pos</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={stop.offset}
                          onChange={(e) => handleUpdateStopOffset(stop.id, parseFloat(e.target.value))}
                          className="flex-1 accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                          title="Position across gradient (0% - 100%)"
                        />
                        <span className="text-[9px] font-mono text-purple-300 w-7 text-right">
                          {Math.round(stop.offset * 100)}%
                        </span>
                      </div>

                      {/* Delete button (only if > 2 stops) */}
                      {customStops.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(stop.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition shrink-0"
                          title="Delete Stop"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Bottom Row: Opacity / Transparency Slider & Quick 0% Trans Button */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 pl-5">
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <span className="text-[8px] font-semibold text-slate-400">Opacity</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={stopAlpha}
                          onChange={(e) => handleUpdateStopAlpha(stop.id, parseFloat(e.target.value))}
                          className="flex-1 accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                          title="Opacity / Transparency (0% = transparent shadow)"
                        />
                        <span
                          className={`text-[9px] font-mono w-10 text-right font-bold ${
                            isTransparent ? 'text-amber-400' : 'text-slate-300'
                          }`}
                        >
                          {isTransparent ? '0% Trans' : `${Math.round(stopAlpha * 100)}%`}
                        </span>
                      </div>

                      {/* Quick 0% Trans toggle */}
                      <button
                        type="button"
                        onClick={() => handleUpdateStopAlpha(stop.id, isTransparent ? 1 : 0)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition border ${
                          isTransparent
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                        title="Toggle 0% Transparent vs 100% Solid"
                      >
                        {isTransparent ? 'Make Solid' : 'Fade to 0%'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Name & Insert Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Name your custom overlay..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInsertCustomGradient('bottom')}
                className="py-2 px-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 text-xs font-bold text-purple-200 hover:text-white transition shadow"
              >
                + Insert Bottom Overlay
              </button>
              <button
                type="button"
                onClick={() => handleInsertCustomGradient('full')}
                className="py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow shadow-blue-950"
              >
                + Insert Full Canvas
              </button>
            </div>
          </div>

          {/* Saved Custom Presets */}
          {savedCustomPresets.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                My Saved Presets ({savedCustomPresets.length})
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {savedCustomPresets.map((sp) => (
                  <div
                    key={sp.id}
                    onClick={() => loadSavedPreset(sp)}
                    className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-purple-500 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="h-6 w-6 rounded-lg shrink-0 border border-white/10"
                        style={{
                          background: `linear-gradient(to right, ${sp.stops.map((s) => s.color).join(', ')})`,
                        }}
                      />
                      <span className="text-[10px] font-bold text-slate-200 group-hover:text-purple-300 truncate">
                        {sp.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => removeSavedPreset(sp.id, e)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Remove"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GEOMETRIC SHAPES GRID                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'shapes' && (
        <div className="grid grid-cols-2 gap-2">
          {SHAPE_BUTTONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addShape(item.id)}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-purple-500/50 hover:bg-slate-800/80 transition group"
            >
              <div className="mb-2 p-2 rounded-xl bg-slate-950 group-hover:scale-110 transition">
                {item.icon}
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
