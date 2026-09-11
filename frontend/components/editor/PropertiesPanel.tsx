'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Type,
  Image as ImageIcon,
  Square,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  AlignCenterHorizontal,
  AlignCenterVertical,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Move,
  Sparkles,
  Palette,
  Layers,
  ChevronDown,
  Monitor,
  Smartphone,
  Bookmark,
  Plus,
  LayoutTemplate,
  Paintbrush,
  Check,
  Download,
  Save,
  Highlighter,
  Maximize,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import {
  centerObjectHorizontally,
  centerObjectVertically,
  duplicateActiveObject,
  deleteActiveObject,
  applyImageFrame,
  applySelectiveTextColor,
  applySelectiveTextHighlight,
  type ImageFrameShape,
} from '../../lib/editor/canvas';
import { CURATED_FONTS, applyFontToCanvas } from '../../lib/editor/fonts';
import { fabric } from 'fabric';
import { ColorPickerPopover } from './ColorPickerPopover';
import { ShadowCustomizer } from './ShadowCustomizer';
import {
  colorToHex,
  isGradientFill,
  applyFabricStyle,
  applyFabricShadow,
} from '../../lib/editor/colors';

const COLOR_SWATCHES = [
  '#ffffff',
  '#000000',
  '#0b0f19',
  '#0f172a',
  '#1e293b',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
];

const ASPECT_RATIOS = [
  { label: 'Social Banner (1.91:1)', w: 1200, h: 628, icon: <Monitor size={13} /> },
  { label: 'Square Post (1:1)', w: 1080, h: 1080, icon: <Square size={13} /> },
  { label: 'Portrait Feed (4:5)', w: 1080, h: 1350, icon: <Bookmark size={13} /> },
  { label: 'Story / Reel (9:16)', w: 1080, h: 1920, icon: <Smartphone size={13} /> },
  { label: 'Landscape HD (16:9)', w: 1920, h: 1080, icon: <Monitor size={13} /> },
];

export function PropertiesPanel() {
  const {
    canvas,
    selectedObject,
    setSelectedObject,
    refreshLayers,
    pushHistoryState,
    project,
    setProject,
    setZoom,
    layers,
    setActiveTool,
    setIsLeftDrawerOpen,
  } = useEditorStore();
  const [activeFontDropdown, setActiveFontDropdown] = useState(false);
  const [imageSubTab, setImageSubTab] = useState<'transform' | 'framing' | 'shadow'>('transform');
  const [textSubTab, setTextSubTab] = useState<'typography' | 'color' | 'shadow'>('typography');
  const [shapeSubTab, setShapeSubTab] = useState<'geometry' | 'style' | 'shadow'>('style');
  const [canvasSubTab, setCanvasSubTab] = useState<'ratio' | 'background' | 'layers'>('ratio');
  const [shadowRevision, setShadowRevision] = useState(0);
  const [activeColorPicker, setActiveColorPicker] = useState<'fill' | 'stroke' | 'text' | 'bg' | null>(null);

  if (!canvas) return null;

  const activeObj = selectedObject || canvas.getActiveObject();

  // ----------------------------------------------------
  // NO OBJECT SELECTED: DISPLAY CANVAS & DOCUMENT CONTROLS
  // ----------------------------------------------------
  if (!activeObj) {
    const handleSetRatio = (w: number, h: number) => {
      setProject({ width: w, height: h });
      canvas.setWidth(w);
      canvas.setHeight(h);

      const parent = canvas.getElement()?.parentElement;
      if (parent) {
        const scale = Math.min((parent.clientWidth - 48) / w, (parent.clientHeight - 48) / h, 1.0);
        setZoom(scale);
        canvas.setZoom(scale);
      }
      canvas.renderAll();
      pushHistoryState();
    };

    return (
      <div className="space-y-3 p-3 text-white select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Document Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0">
            <LayoutTemplate size={14} className="text-purple-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Canvas Settings
            </span>
          </div>
          <span className="font-mono text-[11px] text-purple-300 font-bold">
            {project.width}×{project.height}px
          </span>
        </div>

        {/* Canvas Sub-Tab Switcher */}
        <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-800 gap-0.5">
          <button
            type="button"
            onClick={() => setCanvasSubTab('ratio')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              canvasSubTab === 'ratio' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ratios
          </button>
          <button
            type="button"
            onClick={() => setCanvasSubTab('background')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              canvasSubTab === 'background' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Background
          </button>
          <button
            type="button"
            onClick={() => setCanvasSubTab('layers')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              canvasSubTab === 'layers' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Layers ({layers.length})
          </button>
        </div>

        {/* Canvas Background Color */}
        {canvasSubTab === 'background' && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Palette size={12} className="text-purple-400" />
                <span>Canvas Color</span>
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveColorPicker(activeColorPicker === 'bg' ? null : 'bg')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-700 bg-slate-900 hover:border-purple-500 transition"
                >
                  <div
                    className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: project.backgroundColor || '#ffffff' }}
                  />
                  <span className="font-mono text-[10px] text-slate-200 uppercase font-bold">
                    {colorToHex(project.backgroundColor || '#ffffff')}
                  </span>
                  <ChevronDown size={11} className="text-slate-400" />
                </button>

                {activeColorPicker === 'bg' && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <ColorPickerPopover
                      color={project.backgroundColor || '#ffffff'}
                      onChange={(newCol) => {
                        const val = typeof newCol === 'string' ? newCol : '#ffffff';
                        setProject({ backgroundColor: val });
                        canvas.backgroundColor = val;
                        canvas.renderAll();
                        pushHistoryState();
                      }}
                      onClose={() => setActiveColorPicker(null)}
                      title="Canvas Background"
                      allowGradient={false}
                      canvas={canvas}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {COLOR_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    setProject({ backgroundColor: hex });
                    canvas.backgroundColor = hex;
                    canvas.renderAll();
                    pushHistoryState();
                  }}
                  style={{ backgroundColor: hex }}
                  className={`h-5 rounded-md border transition ${
                    project.backgroundColor === hex
                      ? 'border-purple-400 scale-110 shadow'
                      : 'border-slate-800 hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Aspect Ratio Presets */}
        {canvasSubTab === 'ratio' && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-1 gap-1.5">
              {ASPECT_RATIOS.map((ratio) => {
                const isSelected = project.width === ratio.w && project.height === ratio.h;
                return (
                  <button
                    key={ratio.label}
                    type="button"
                    onClick={() => handleSetRatio(ratio.w, ratio.h)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition text-left ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500/60 text-purple-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {ratio.icon}
                      <span>{ratio.label}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">
                      {ratio.w}×{ratio.h}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Canvas Layers Overview */}
        {canvasSubTab === 'layers' && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {layers.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-2 text-center">Canvas is empty</p>
              ) : (
                layers.map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => {
                      const objs = canvas.getObjects();
                      const target = objs.find(
                        (o) => (o as unknown as { id: string }).id === layer.id
                      );
                      if (target) {
                        canvas.setActiveObject(target);
                        setSelectedObject(target);
                        canvas.renderAll();
                      }
                    }}
                    className="flex items-center justify-between p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-purple-500/50 transition text-left group"
                  >
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                      {layer.name}
                    </span>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
                      {layer.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // OBJECT SELECTED: DISPLAY COMPREHENSIVE PROPERTIES
  // ----------------------------------------------------
  const isText = activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text';
  const isImage = activeObj.type === 'image';
  const isShape =
    activeObj.type === 'rect' ||
    activeObj.type === 'circle' ||
    activeObj.type === 'triangle' ||
    activeObj.type === 'polygon';

  const updateActiveProp = (key: string, value: unknown) => {
    applyFabricStyle(canvas, activeObj, key, value);
    refreshLayers();
    pushHistoryState();
  };

  const handleApplyShadow = (
    shadowData: {
      color?: string;
      blur?: number;
      offsetX?: number;
      offsetY?: number;
    } | null
  ) => {
    if (!shadowData) {
      applyFabricShadow(canvas, activeObj, undefined);
    } else {
      const cur =
        activeObj.shadow instanceof fabric.Shadow
          ? activeObj.shadow
          : typeof activeObj.shadow === 'string'
          ? new fabric.Shadow(activeObj.shadow)
          : null;

      const newShadow = new fabric.Shadow({
        color: shadowData.color ?? (cur?.color as string) ?? 'rgba(0,0,0,0.65)',
        blur: shadowData.blur !== undefined ? shadowData.blur : (cur?.blur ?? 16),
        offsetX: shadowData.offsetX !== undefined ? shadowData.offsetX : (cur?.offsetX ?? 0),
        offsetY: shadowData.offsetY !== undefined ? shadowData.offsetY : (cur?.offsetY ?? 8),
      });
      applyFabricShadow(canvas, activeObj, newShadow);
    }
    refreshLayers();
    pushHistoryState();
    setShadowRevision((r) => r + 1);
  };

  const textObj = isText ? (activeObj as fabric.IText) : null;
  const posX = Math.round(activeObj.left || 0);
  const posY = Math.round(activeObj.top || 0);
  const width = Math.round((activeObj.width || 0) * (activeObj.scaleX || 1));
  const height = Math.round((activeObj.height || 0) * (activeObj.scaleY || 1));
  const rotation = Math.round(activeObj.angle || 0);
  const opacity = +(activeObj.opacity ?? 1).toFixed(2);
  const isLocked = Boolean(activeObj.lockMovementX);

  return (
    <div className="space-y-3 p-3 text-white select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Object Header & Action Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 min-w-0">
          {isText && <Type size={14} className="text-purple-400 shrink-0" />}
          {isImage && <ImageIcon size={14} className="text-blue-400 shrink-0" />}
          {isShape && <Square size={14} className="text-amber-400 shrink-0" />}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 truncate">
            {isText ? 'Text Inspector' : isImage ? 'Image Inspector' : isShape ? 'Shape Inspector' : 'Object Inspector'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              const lockVal = !isLocked;
              activeObj.set({
                lockMovementX: lockVal,
                lockMovementY: lockVal,
                lockRotation: lockVal,
                lockScalingX: lockVal,
                lockScalingY: lockVal,
                selectable: !lockVal,
              });
              if (lockVal) canvas.discardActiveObject();
              canvas.renderAll();
              refreshLayers();
              pushHistoryState();
            }}
            className={`p-1.5 rounded-lg border transition ${
              isLocked
                ? 'border-amber-500/50 bg-amber-500/20 text-amber-400'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title={isLocked ? 'Unlock Object' : 'Lock Object'}
          >
            {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>

          <button
            type="button"
            onClick={() => duplicateActiveObject(canvas)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition"
            title="Duplicate (Ctrl+D)"
          >
            <Copy size={12} />
          </button>

          <button
            type="button"
            onClick={() => deleteActiveObject(canvas)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 transition"
            title="Delete (Del)"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation Switchers for Selected Object */}
      {isImage && (
        <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-800 gap-0.5">
          <button
            type="button"
            onClick={() => setImageSubTab('transform')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              imageSubTab === 'transform' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Transform
          </button>
          <button
            type="button"
            onClick={() => setImageSubTab('framing')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              imageSubTab === 'framing' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Framing
          </button>
          <button
            type="button"
            onClick={() => setImageSubTab('shadow')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              imageSubTab === 'shadow' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Shadow & Glow
          </button>
        </div>
      )}

      {isText && (
        <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-800 gap-0.5">
          <button
            type="button"
            onClick={() => setTextSubTab('typography')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              textSubTab === 'typography' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Typography
          </button>
          <button
            type="button"
            onClick={() => setTextSubTab('color')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              textSubTab === 'color' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Color & Words
          </button>
          <button
            type="button"
            onClick={() => setTextSubTab('shadow')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              textSubTab === 'shadow' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Shadow & Glow
          </button>
        </div>
      )}

      {isShape && (
        <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-800 gap-0.5">
          <button
            type="button"
            onClick={() => setShapeSubTab('geometry')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              shapeSubTab === 'geometry' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Transform
          </button>
          <button
            type="button"
            onClick={() => setShapeSubTab('style')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              shapeSubTab === 'style' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fill & Stroke
          </button>
          <button
            type="button"
            onClick={() => setShapeSubTab('shadow')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
              shapeSubTab === 'shadow' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Shadow
          </button>
        </div>
      )}
      {/* ==================== TRANSFORM & GEOMETRY (Images: transform tab; Shapes: geometry tab; Generic objects) ==================== */}
      {((isImage && imageSubTab === 'transform') || (isShape && shapeSubTab === 'geometry') || (!isImage && !isText && !isShape)) && (
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
            <Move size={12} className="text-blue-400" />
            <span>Position & Dimensions</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-2 py-1">
              <span className="text-[10px] text-slate-400 font-bold">X</span>
              <input
                type="number"
                value={posX}
                onChange={(e) => updateActiveProp('left', parseInt(e.target.value) || 0)}
                className="w-14 text-right bg-transparent text-xs font-mono text-white outline-none"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-2 py-1">
              <span className="text-[10px] text-slate-400 font-bold">Y</span>
              <input
                type="number"
                value={posY}
                onChange={(e) => updateActiveProp('top', parseInt(e.target.value) || 0)}
                className="w-14 text-right bg-transparent text-xs font-mono text-white outline-none"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-2 py-1">
              <span className="text-[10px] text-slate-400 font-bold">W</span>
              <span className="text-xs font-mono text-slate-300">{width}px</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-2 py-1">
              <span className="text-[10px] text-slate-400 font-bold">H</span>
              <span className="text-xs font-mono text-slate-300">{height}px</span>
            </div>
          </div>

          {/* Quick Align to Center */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => centerObjectHorizontally(canvas)}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <AlignCenterHorizontal size={12} />
              <span>Center H</span>
            </button>
            <button
              type="button"
              onClick={() => centerObjectVertically(canvas)}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <AlignCenterVertical size={12} />
              <span>Center V</span>
            </button>
          </div>

          {/* Opacity & Rotation */}
          <div className="space-y-2 pt-1 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Opacity</span>
              <span className="font-mono text-[10px] text-slate-300">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => updateActiveProp('opacity', parseFloat(e.target.value))}
              className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <RotateCw size={11} />
                <span>Rotation</span>
              </span>
              <span className="font-mono text-[10px] text-slate-300">{rotation}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => updateActiveProp('angle', parseInt(e.target.value))}
              className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Image Transform Actions (Flip / As BG) */}
          {isImage && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  activeObj.set('flipX', !activeObj.flipX);
                  canvas.renderAll();
                  pushHistoryState();
                }}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Flip Horizontal"
              >
                <FlipHorizontal size={13} />
                <span>Flip H</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  activeObj.set('flipY', !activeObj.flipY);
                  canvas.renderAll();
                  pushHistoryState();
                }}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Flip Vertical"
              >
                <FlipVertical size={13} />
                <span>Flip V</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const img = activeObj as fabric.Image;
                  const scaleW = project.width / (img.width || 1);
                  const scaleH = project.height / (img.height || 1);
                  const maxScale = Math.max(scaleW, scaleH);
                  img.set({
                    scaleX: maxScale,
                    scaleY: maxScale,
                    left: project.width / 2,
                    top: project.height / 2,
                    originX: 'center',
                    originY: 'center',
                  });
                  canvas.sendToBack(img);
                  canvas.renderAll();
                  pushHistoryState();
                }}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900 py-1.5 text-xs font-semibold text-teal-300 hover:text-white hover:bg-slate-800 transition"
                title="Fit & Send to Background"
              >
                <Maximize size={13} />
                <span>As BG</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== ADVANCED TEXT: TYPOGRAPHY TAB ==================== */}
      {isText && textObj && textSubTab === 'typography' && (
        <div className="space-y-3 pt-1">
          {/* Font Family Selector Dropdown with Google Fonts */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400">Font Family</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveFontDropdown(!activeFontDropdown)}
                className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-white hover:border-purple-500 transition"
              >
                <span className="truncate" style={{ fontFamily: textObj.fontFamily || 'Inter, sans-serif' }}>
                  {textObj.fontFamily?.split(',')[0]?.replace(/"/g, '') || 'Inter'}
                </span>
                <ChevronDown size={14} className="text-slate-400 shrink-0 ml-2" />
              </button>

              {activeFontDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-slate-700 bg-slate-950 p-1.5 shadow-2xl max-h-56 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-1">
                  {CURATED_FONTS.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={async () => {
                        await applyFontToCanvas(f, canvas, activeObj);
                        setActiveFontDropdown(false);
                        pushHistoryState();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-purple-600/30 text-xs text-slate-200 hover:text-white transition"
                    >
                      <span style={{ fontFamily: f.family }}>{f.name}</span>
                      <span className="text-[9px] text-slate-500">{f.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Font Size & Stepper */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Font Size</span>
              <span className="font-mono text-[10px] text-purple-300 font-bold">
                {Math.round(textObj.fontSize || 40)}px
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateActiveProp('fontSize', Math.max(8, (textObj.fontSize || 40) - 4))}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                -
              </button>
              <input
                type="range"
                min="10"
                max="160"
                value={textObj.fontSize || 40}
                onChange={(e) => updateActiveProp('fontSize', parseInt(e.target.value))}
                className="flex-1 accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => updateActiveProp('fontSize', Math.min(240, (textObj.fontSize || 40) + 4))}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                +
              </button>
            </div>
          </div>

          {/* Style Buttons & Alignment */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => {
                  const current = textObj.fontWeight;
                  updateActiveProp('fontWeight', current === 'bold' || current === '900' || current === '800' ? 'normal' : 'bold');
                }}
                className={`p-1.5 rounded transition ${
                  textObj.fontWeight === 'bold' || textObj.fontWeight === '800' || textObj.fontWeight === '900'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bold"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const current = textObj.fontStyle;
                  updateActiveProp('fontStyle', current === 'italic' ? 'normal' : 'italic');
                }}
                className={`p-1.5 rounded transition ${
                  textObj.fontStyle === 'italic' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Italic"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const current = textObj.underline;
                  updateActiveProp('underline', !current);
                }}
                className={`p-1.5 rounded transition ${
                  textObj.underline ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Underline"
              >
                <Underline size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const current = textObj.linethrough;
                  updateActiveProp('linethrough', !current);
                }}
                className={`p-1.5 rounded transition ${
                  textObj.linethrough ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Strikethrough"
              >
                <Strikethrough size={13} />
              </button>
            </div>

            <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => updateActiveProp('textAlign', 'left')}
                className={`p-1.5 rounded transition ${
                  textObj.textAlign === 'left' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Align Left"
              >
                <AlignLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => updateActiveProp('textAlign', 'center')}
                className={`p-1.5 rounded transition ${
                  textObj.textAlign === 'center' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Align Center"
              >
                <AlignCenter size={13} />
              </button>
              <button
                type="button"
                onClick={() => updateActiveProp('textAlign', 'right')}
                className={`p-1.5 rounded transition ${
                  textObj.textAlign === 'right' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Align Right"
              >
                <AlignRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => updateActiveProp('textAlign', 'justify')}
                className={`p-1.5 rounded transition ${
                  textObj.textAlign === 'justify' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Justify"
              >
                <AlignJustify size={13} />
              </button>
            </div>
          </div>

          {/* Quick Center Horizontal & Vertical */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => centerObjectHorizontally(canvas)}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <AlignCenterHorizontal size={12} />
              <span>Center H</span>
            </button>
            <button
              type="button"
              onClick={() => centerObjectVertically(canvas)}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <AlignCenterVertical size={12} />
              <span>Center V</span>
            </button>
          </div>

          {/* Line Height & Letter Spacing */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Line Height</span>
                <span className="font-mono text-slate-300">{(textObj.lineHeight || 1.25).toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.05"
                value={textObj.lineHeight || 1.25}
                onChange={(e) => updateActiveProp('lineHeight', parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Letter Spacing</span>
                <span className="font-mono text-slate-300">{textObj.charSpacing || 0}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="300"
                step="10"
                value={textObj.charSpacing || 0}
                onChange={(e) => updateActiveProp('charSpacing', parseInt(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADVANCED TEXT: COLOR & WORDS TAB ==================== */}
      {isText && textObj && textSubTab === 'color' && (
        <div className="space-y-3 pt-1">
          {/* Text Color & Palette Swatches (Selective per-word or whole text) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-300 block">Text / Word Color</span>
                <span className="text-[9px] text-purple-400">Select any word to color just that word</span>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveColorPicker(activeColorPicker === 'text' ? null : 'text')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-700 bg-slate-900 hover:border-purple-500 transition"
                >
                  <div
                    className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: (textObj.fill as string) || '#ffffff' }}
                  />
                  <span className="font-mono text-[10px] text-slate-200 uppercase font-bold">
                    {colorToHex(textObj.fill as string)}
                  </span>
                  <ChevronDown size={11} className="text-slate-400" />
                </button>

                {activeColorPicker === 'text' && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <ColorPickerPopover
                      color={(textObj.fill as string) || '#ffffff'}
                      onChange={(newColor) => {
                        if (!canvas) return;
                        if (typeof newColor === 'string') {
                          applySelectiveTextColor(canvas, textObj, newColor);
                          pushHistoryState();
                        }
                      }}
                      onClose={() => setActiveColorPicker(null)}
                      title="Text Color"
                      allowGradient={false}
                      canvas={canvas}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Word & Text Swatches */}
            <div className="grid grid-cols-6 gap-1.5 pt-0.5">
              {COLOR_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    if (!canvas) return;
                    applySelectiveTextColor(canvas, textObj, hex);
                    pushHistoryState();
                  }}
                  style={{ backgroundColor: hex }}
                  className={`h-5 rounded-md border transition ${
                    textObj.fill === hex ? 'border-purple-400 scale-110 shadow' : 'border-slate-800 hover:scale-105'
                  }`}
                  title={`Apply ${hex} to selected word or text`}
                />
              ))}
            </div>

            {/* Word Highlight Background */}
            <div className="space-y-1 pt-1.5 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-bold text-amber-300">
                  <Highlighter size={11} />
                  <span>Word Highlight Background</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!canvas) return;
                    applySelectiveTextHighlight(canvas, textObj, undefined);
                    pushHistoryState();
                  }}
                  className="text-[9px] text-slate-500 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {['#facc15', '#06b6d4', '#ec4899', '#10b981', '#a855f7', '#0f172a'].map((bgHex) => (
                  <button
                    key={bgHex}
                    type="button"
                    onClick={() => {
                      if (!canvas) return;
                      applySelectiveTextHighlight(canvas, textObj, bgHex);
                      pushHistoryState();
                    }}
                    style={{ backgroundColor: bgHex }}
                    className="h-4 flex-1 rounded border border-slate-700/80 hover:scale-105 transition"
                    title={`Highlight background ${bgHex}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Opacity & Rotation */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Opacity</span>
              <span className="font-mono text-[10px] text-slate-300">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => updateActiveProp('opacity', parseFloat(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <RotateCw size={11} />
                <span>Rotation</span>
              </span>
              <span className="font-mono text-[10px] text-slate-300">{rotation}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => updateActiveProp('angle', parseInt(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ==================== IMAGE SPECIFIC: FRAMING TAB ==================== */}
      {isImage && imageSubTab === 'framing' && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
              <ImageIcon size={13} />
              <span>Image Framing Shapes</span>
            </label>
            <span className="text-[10px] text-slate-500">8 Frame Shapes</span>
          </div>

          {/* Frame Shape Selector */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'none', label: 'Normal', icon: '🔲' },
              { id: 'rounded', label: 'Rounded', icon: '▢' },
              { id: 'circle', label: 'Circle', icon: '🔘' },
              { id: 'arch', label: 'Arch', icon: '🏛️' },
              { id: 'pill', label: 'Pill', icon: '💊' },
              { id: 'hexagon', label: 'Hexagon', icon: '⬡' },
              { id: 'star', label: 'Star', icon: '⭐' },
              { id: 'heart', label: 'Heart', icon: '💖' },
            ].map((frame) => (
              <button
                key={frame.id}
                type="button"
                onClick={() => {
                  applyImageFrame(activeObj as fabric.Image, frame.id as ImageFrameShape, 32);
                  canvas.renderAll();
                  pushHistoryState();
                }}
                className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-blue-500/50 text-[10px] font-bold text-slate-300 hover:text-white transition flex flex-col items-center gap-0.5"
                title={`Apply ${frame.label} frame`}
              >
                <span className="text-xs">{frame.icon}</span>
                <span>{frame.label}</span>
              </button>
            ))}
          </div>

          {/* Corner Radius Slider for Image */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold text-slate-300">Corner Radius / Roundness</span>
              <span className="font-mono text-blue-300">Custom px</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  applyImageFrame(activeObj as fabric.Image, 'none');
                  canvas.renderAll();
                  pushHistoryState();
                }}
                className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[10px] text-slate-400 hover:text-white"
              >
                0px
              </button>
              <input
                type="range"
                min="0"
                max="160"
                defaultValue="32"
                onChange={(e) => {
                  const r = parseInt(e.target.value);
                  if (r === 0) {
                    applyImageFrame(activeObj as fabric.Image, 'none');
                  } else {
                    applyImageFrame(activeObj as fabric.Image, 'rounded', r);
                  }
                  canvas.renderAll();
                  pushHistoryState();
                }}
                className="flex-1 accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => {
                  applyImageFrame(activeObj as fabric.Image, 'circle');
                  canvas.renderAll();
                  pushHistoryState();
                }}
                className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[10px] text-blue-300 hover:text-white"
              >
                Full
              </button>
            </div>
          </div>

          {/* Quick Flip & Send to Background */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                activeObj.set('flipX', !activeObj.flipX);
                canvas.renderAll();
                pushHistoryState();
              }}
              className="flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Flip Horizontal"
            >
              <FlipHorizontal size={13} />
              <span>Flip H</span>
            </button>

            <button
              type="button"
              onClick={() => {
                activeObj.set('flipY', !activeObj.flipY);
                canvas.renderAll();
                pushHistoryState();
              }}
              className="flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Flip Vertical"
            >
              <FlipVertical size={13} />
              <span>Flip V</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const img = activeObj as fabric.Image;
                const scaleW = project.width / (img.width || 1);
                const scaleH = project.height / (img.height || 1);
                const maxScale = Math.max(scaleW, scaleH);
                img.set({
                  scaleX: maxScale,
                  scaleY: maxScale,
                  left: project.width / 2,
                  top: project.height / 2,
                  originX: 'center',
                  originY: 'center',
                });
                canvas.sendToBack(img);
                canvas.renderAll();
                pushHistoryState();
              }}
              className="flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900 py-1.5 text-xs font-semibold text-teal-300 hover:text-white hover:bg-slate-800 transition"
              title="Fit & Send to Background"
            >
              <Maximize size={13} />
              <span>As BG</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== SHAPE SPECIFIC: STYLE TAB ==================== */}
      {isShape && shapeSubTab === 'style' && (
        <div className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Square size={14} />
              <span>Fill & Border Styling</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              {isGradientFill(activeObj.fill) ? 'Gradient Fill' : 'Solid Fill'}
            </span>
          </div>

          {/* Fill & Stroke Color Triggers */}
          <div className="grid grid-cols-2 gap-2">
            {/* Fill Color Trigger */}
            <div className="relative">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Fill</span>
              <button
                type="button"
                onClick={() => setActiveColorPicker(activeColorPicker === 'fill' ? null : 'fill')}
                className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 hover:border-amber-500 transition"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-5 w-5 rounded-lg border border-white/20 shadow-sm shrink-0"
                    style={{
                      background: isGradientFill(activeObj.fill)
                        ? `linear-gradient(135deg, ${(activeObj.fill as fabric.Gradient).colorStops?.[0]?.color || '#3b82f6'}, ${(activeObj.fill as fabric.Gradient).colorStops?.[1]?.color || '#8b5cf6'})`
                        : (activeObj.fill as string) || '#3b82f6',
                    }}
                  />
                  <span className="text-[11px] text-slate-200 font-bold font-mono uppercase truncate">
                    {isGradientFill(activeObj.fill) ? 'Gradient' : colorToHex(activeObj.fill as string)}
                  </span>
                </div>
                <ChevronDown size={12} className="text-slate-500 shrink-0" />
              </button>

              {activeColorPicker === 'fill' && (
                <div className="pt-2 z-50">
                  <ColorPickerPopover
                    color={activeObj.fill}
                    onChange={(newFill) => {
                      updateActiveProp('fill', newFill);
                    }}
                    onClose={() => setActiveColorPicker(null)}
                    title="Shape Fill Color"
                    allowGradient={true}
                    canvas={canvas}
                  />
                </div>
              )}
            </div>

            {/* Stroke Color Trigger */}
            <div className="relative">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Border / Stroke</span>
              <button
                type="button"
                onClick={() => setActiveColorPicker(activeColorPicker === 'stroke' ? null : 'stroke')}
                className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 hover:border-amber-500 transition"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-5 w-5 rounded-lg border-2 shrink-0 shadow-sm"
                    style={{
                      borderColor: (activeObj.stroke as string) || '#000000',
                      backgroundColor: 'transparent',
                    }}
                  />
                  <span className="text-[11px] text-slate-200 font-bold font-mono uppercase truncate">
                    {colorToHex(activeObj.stroke as string, '#000000')}
                  </span>
                </div>
                <ChevronDown size={12} className="text-slate-500 shrink-0" />
              </button>

              {activeColorPicker === 'stroke' && (
                <div className="pt-2 z-50">
                  <ColorPickerPopover
                    color={activeObj.stroke}
                    onChange={(newCol) => {
                      if (typeof newCol === 'string') {
                        updateActiveProp('stroke', newCol);
                        if (!activeObj.strokeWidth) {
                          updateActiveProp('strokeWidth', 2);
                        }
                      }
                    }}
                    onClose={() => setActiveColorPicker(null)}
                    title="Border Stroke Color"
                    allowGradient={false}
                    canvas={canvas}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stroke Width Slider */}
          <div className="space-y-1 pt-1 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold text-slate-300">Border Thickness</span>
              <span className="font-mono text-amber-300 font-bold">{activeObj.strokeWidth || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={activeObj.strokeWidth || 0}
              onChange={(e) => updateActiveProp('strokeWidth', parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Stroke Style: Solid, Dashed, Dotted */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-slate-400 font-bold">Border Style</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => updateActiveProp('strokeDashArray', null)}
                className={`py-1.5 rounded-xl border text-[10px] font-bold transition ${
                  !activeObj.strokeDashArray
                    ? 'border-amber-500 bg-amber-600/30 text-white'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Solid ──
              </button>
              <button
                type="button"
                onClick={() => updateActiveProp('strokeDashArray', [12, 6])}
                className={`py-1.5 rounded-xl border text-[10px] font-bold transition ${
                  activeObj.strokeDashArray && (activeObj.strokeDashArray as number[])[0] === 12
                    ? 'border-amber-500 bg-amber-600/30 text-white'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Dashed ╌╌
              </button>
              <button
                type="button"
                onClick={() => updateActiveProp('strokeDashArray', [3, 5])}
                className={`py-1.5 rounded-xl border text-[10px] font-bold transition ${
                  activeObj.strokeDashArray && (activeObj.strokeDashArray as number[])[0] === 3
                    ? 'border-amber-500 bg-amber-600/30 text-white'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Dotted •••
              </button>
            </div>
          </div>

          {/* Corner Radius (for Rectangles) */}
          {(activeObj.type === 'rect' || (activeObj as fabric.Rect).rx !== undefined) && (
            <div className="space-y-1 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-slate-300">Corner Radius</span>
                <span className="font-mono text-amber-300 font-bold">{(activeObj as fabric.Rect).rx || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={(activeObj as fabric.Rect).rx || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const rectObj = activeObj as fabric.Rect;
                  rectObj.set({ rx: val, ry: val });
                  rectObj.setCoords();
                  canvas.renderAll();
                  refreshLayers();
                  pushHistoryState();
                }}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* ==================== UNIVERSAL SHADOW & GLOW EFFECTS ==================== */}
      {((isImage && imageSubTab === 'shadow') || (isText && textSubTab === 'shadow') || (isShape && shapeSubTab === 'shadow') || (!isImage && !isText && !isShape)) && (
        <div className="pt-1">
          <ShadowCustomizer
            canvas={canvas}
            targetObject={activeObj}
            onUpdate={() => {
              setShadowRevision((r) => r + 1);
              refreshLayers();
              pushHistoryState();
            }}
          />
        </div>
      )}
    </div>
  );
}
