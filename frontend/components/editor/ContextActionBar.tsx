'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Crop,
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  Layers,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  ChevronDown,
  Percent,
  List,
  MoveHorizontal,
  Type,
  Maximize2,
  Paintbrush,
  X,
  Copy,
  Trash2,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import {
  bringObjectToFront,
  sendObjectToBack,
  bringObjectForward,
  sendObjectBackward,
  duplicateActiveObject,
  deleteActiveObject,
  fitObjectToCanvas,
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

export function ContextActionBar() {
  const {
    canvas,
    selectedObject,
    activeTool,
    setActiveTool,
    isLeftDrawerOpen,
    setIsLeftDrawerOpen,
    refreshLayers,
    pushHistoryState,
    project,
  } = useEditorStore();

  const [activeDropdown, setActiveDropdown] = useState<
    'font' | 'flip' | 'position' | 'opacity' | 'align' | 'spacing' | 'color' | 'border' | 'effects' | null
  >(null);
  const [fontSizeInput, setFontSizeInput] = useState<string>('');
  const [isEditingFontSize, setIsEditingFontSize] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (
    key: 'font' | 'flip' | 'position' | 'opacity' | 'align' | 'spacing' | 'color' | 'border' | 'effects'
  ) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const closeDropdown = () => setActiveDropdown(null);

  useEffect(() => {
    const handlePointerDownOutside = (e: MouseEvent) => {
      if (activeDropdown && barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDownOutside);
    return () => document.removeEventListener('mousedown', handlePointerDownOutside);
  }, [activeDropdown]);

  if (!selectedObject || !canvas) return null;

  const isText = selectedObject.type === 'i-text' || selectedObject.type === 'textbox';
  const isImage = selectedObject.type === 'image';
  const isShape =
    selectedObject.type === 'rect' ||
    selectedObject.type === 'circle' ||
    selectedObject.type === 'triangle' ||
    selectedObject.type === 'polygon' ||
    selectedObject.type === 'path';
  const isMultiSelect = selectedObject.type === 'activeSelection';
  const isGroup = selectedObject.type === 'group';

  const textObj = isText ? (selectedObject as fabric.Textbox) : null;

  const handleApplyShadow = (shadowConfig: { color?: string; blur?: number; offsetX?: number; offsetY?: number } | null) => {
    if (!selectedObject) return;
    if (!shadowConfig) {
      selectedObject.set('shadow', undefined);
    } else {
      const cur =
        selectedObject.shadow instanceof fabric.Shadow
          ? selectedObject.shadow
          : typeof selectedObject.shadow === 'string'
          ? new fabric.Shadow(selectedObject.shadow)
          : null;

      const newShadow = new fabric.Shadow({
        color: shadowConfig.color ?? (cur?.color as string) ?? 'rgba(0,0,0,0.65)',
        blur: shadowConfig.blur !== undefined ? shadowConfig.blur : (cur?.blur ?? 16),
        offsetX: shadowConfig.offsetX !== undefined ? shadowConfig.offsetX : (cur?.offsetX ?? 0),
        offsetY: shadowConfig.offsetY !== undefined ? shadowConfig.offsetY : (cur?.offsetY ?? 8),
      });
      selectedObject.set('shadow', newShadow);
    }
    selectedObject.dirty = true;
    selectedObject.setCoords();
    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  const handleFlip = (dir: 'h' | 'v') => {
    if (dir === 'h') selectedObject.set('flipX', !selectedObject.flipX);
    if (dir === 'v') selectedObject.set('flipY', !selectedObject.flipY);
    selectedObject.setCoords();
    canvas.renderAll();
    pushHistoryState();
    closeDropdown();
  };

  const handleOpacityChange = (val: number) => {
    selectedObject.set('opacity', val);
    canvas.renderAll();
    pushHistoryState();
  };

  const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const w = selectedObject.getScaledWidth();
    const h = selectedObject.getScaledHeight();

    if (type === 'left') selectedObject.set({ left: 0 });
    if (type === 'center') selectedObject.set({ left: (project.width - w) / 2 });
    if (type === 'right') selectedObject.set({ left: project.width - w });
    if (type === 'top') selectedObject.set({ top: 0 });
    if (type === 'middle') selectedObject.set({ top: (project.height - h) / 2 });
    if (type === 'bottom') selectedObject.set({ top: project.height - h });

    selectedObject.setCoords();
    canvas.renderAll();
    pushHistoryState();
    closeDropdown();
  };

  const handleFontSizeChange = (delta: number) => {
    if (!textObj) return;
    const curSize = textObj.fontSize || 32;
    const newSize = Math.max(8, Math.min(300, curSize + delta));
    textObj.set({ fontSize: newSize });
    textObj.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleFontSizeDirect = (val: number) => {
    if (!textObj || isNaN(val)) return;
    const newSize = Math.max(8, Math.min(300, val));
    textObj.set({ fontSize: newSize });
    textObj.setCoords();
    canvas.renderAll();
    pushHistoryState();
    setIsEditingFontSize(false);
  };

  const handleToggleStyle = (style: 'bold' | 'italic' | 'underline' | 'linethrough') => {
    if (!textObj) return;
    if (style === 'bold') {
      textObj.set({ fontWeight: textObj.fontWeight === 'bold' ? 'normal' : 'bold' });
    } else if (style === 'italic') {
      textObj.set({ fontStyle: textObj.fontStyle === 'italic' ? 'normal' : 'italic' });
    } else if (style === 'underline') {
      textObj.set({ underline: !textObj.underline });
    } else if (style === 'linethrough') {
      textObj.set({ linethrough: !textObj.linethrough });
    }
    textObj.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleToggleCase = () => {
    if (!textObj || !textObj.text) return;
    const isAllUpper = textObj.text === textObj.text.toUpperCase();
    textObj.set({
      text: isAllUpper ? textObj.text.toLowerCase() : textObj.text.toUpperCase(),
    });
    textObj.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (!textObj) return;
    textObj.set({ textAlign: align });
    textObj.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleFontSelect = async (fontFamily: string) => {
    if (!textObj) return;
    const fontDef = CURATED_FONTS.find((f) => f.family.includes(fontFamily) || f.name.includes(fontFamily));
    if (fontDef) {
      await applyFontToCanvas(fontDef, canvas, textObj);
    } else {
      textObj.set({ fontFamily });
      textObj.setCoords();
      canvas.renderAll();
    }
    refreshLayers();
    pushHistoryState();
    closeDropdown();
  };

  const handleLineHeight = (val: number) => {
    if (!textObj) return;
    textObj.set({ lineHeight: val });
    textObj.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleCharSpacing = (val: number) => {
    if (!textObj) return;
    textObj.set({ charSpacing: val });
    textObj.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const QUICK_COLORS = [
    '#ffffff', '#000000', '#f87171', '#fb923c', '#fbbf24', '#4ade80',
    '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#94a3b8'
  ];

  return (
    <div
      ref={barRef}
      className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-2xl border border-slate-700/90 bg-slate-900/95 px-2.5 py-1 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 select-none text-xs text-white overflow-visible whitespace-nowrap"
    >
      {/* IMAGE CONTEXT ACTIONS (Canva style) */}
      {isImage && (
        <>
          <button
            type="button"
            onClick={() => {
              setActiveTool('adjust');
              setIsLeftDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition"
          >
            <Sliders size={13} className="text-purple-400" />
            <span>Edit photo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('crop');
              setIsLeftDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <Crop size={13} className="text-teal-400" />
            <span>Crop</span>
          </button>

          {/* Flip Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('flip')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition ${
                activeDropdown === 'flip' ? 'bg-slate-800 text-white' : ''
              }`}
            >
              <FlipHorizontal size={13} />
              <span>Flip</span>
              <ChevronDown size={12} className="text-slate-500" />
            </button>
            {activeDropdown === 'flip' && (
              <div className="absolute left-0 top-full mt-1.5 w-36 rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl space-y-0.5 z-50">
                <button
                  type="button"
                  onClick={() => handleFlip('h')}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
                >
                  <FlipHorizontal size={13} />
                  <span>Flip horizontal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFlip('v')}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
                >
                  <FlipVertical size={13} />
                  <span>Flip vertical</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleDropdown('effects')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition ${
              activeDropdown === 'effects' ? 'bg-purple-600 text-white shadow font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Effects</span>
          </button>
        </>
      )}

      {/* TEXT CONTEXT ACTIONS (Exact Canva Layout) */}
      {isText && textObj && (
        <>
          {/* Font Family Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('font')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 max-w-[130px] truncate"
              title="Change Font Family"
            >
              <span className="truncate">{textObj.fontFamily || 'Inter'}</span>
              <ChevronDown size={12} className="text-slate-400 shrink-0" />
            </button>

            {activeDropdown === 'font' && (
              <div className="absolute left-0 top-full mt-1.5 w-48 max-h-60 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl space-y-0.5 z-50">
                {CURATED_FONTS.slice(0, 15).map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => handleFontSelect(f.family)}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 text-left text-xs"
                    style={{ fontFamily: f.family }}
                  >
                    <span>{f.name}</span>
                    <span className="text-[10px] text-slate-500">{f.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Stepper */}
          <div className="flex items-center rounded-xl bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => handleFontSizeChange(-2)}
              className="px-2 py-0.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 font-bold"
              title="Decrease Font Size"
            >
              -
            </button>

            {isEditingFontSize ? (
              <input
                type="number"
                value={fontSizeInput}
                onChange={(e) => setFontSizeInput(e.target.value)}
                onBlur={() => handleFontSizeDirect(parseInt(fontSizeInput, 10))}
                onKeyDown={(e) => e.key === 'Enter' && handleFontSizeDirect(parseInt(fontSizeInput, 10))}
                autoFocus
                className="w-10 bg-slate-950 text-center font-mono text-xs font-bold text-purple-300 rounded border border-purple-500 outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFontSizeInput(String(Math.round(textObj.fontSize || 32)));
                  setIsEditingFontSize(true);
                }}
                className="px-2 font-mono text-xs font-bold text-purple-300 hover:bg-slate-700/50 rounded"
                title="Click to edit size"
              >
                {Math.round(textObj.fontSize || 32)}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleFontSizeChange(2)}
              className="px-2 py-0.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 font-bold"
              title="Increase Font Size"
            >
              +
            </button>
          </div>

          {/* Text Color Button with Rainbow Underline (Canva A icon) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('color');
              }}
              className={`flex flex-col items-center justify-center h-7 w-7 rounded-xl transition ${
                activeDropdown === 'color' ? 'bg-purple-600/40 ring-1 ring-purple-400' : 'hover:bg-slate-800'
              }`}
              title="Text Color"
            >
              <span className="font-serif font-black text-xs leading-none">A</span>
              <div
                className="h-1 w-4 rounded-full shadow-sm mt-0.5"
                style={{
                  backgroundColor:
                    typeof textObj.fill === 'string' ? textObj.fill : '#8b5cf6',
                }}
              />
            </button>

            {activeDropdown === 'color' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-2 z-50 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <ColorPickerPopover
                  color={textObj.fill}
                  onChange={(newColor) => {
                    if (typeof newColor === 'string') {
                      applyFabricStyle(canvas, textObj, 'fill', newColor);
                      pushHistoryState();
                    }
                  }}
                  onClose={() => setActiveDropdown(null)}
                  title="Text Color"
                  allowGradient={false}
                  canvas={canvas}
                />
              </div>
            )}
          </div>

          {/* Formatting: Bold, Italic, Underline, Strikethrough, Case */}
          <div className="flex items-center rounded-xl bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => handleToggleStyle('bold')}
              className={`p-1 rounded-lg transition ${
                textObj.fontWeight === 'bold' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Bold"
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleToggleStyle('italic')}
              className={`p-1 rounded-lg transition ${
                textObj.fontStyle === 'italic' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Italic"
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleToggleStyle('underline')}
              className={`p-1 rounded-lg transition ${
                textObj.underline ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Underline"
            >
              <Underline size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleToggleStyle('linethrough')}
              className={`p-1 rounded-lg transition ${
                textObj.linethrough ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Strikethrough"
            >
              <Strikethrough size={13} />
            </button>
            <button
              type="button"
              onClick={handleToggleCase}
              className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Toggle Uppercase / Lowercase"
            >
              aA
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center rounded-xl bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => handleTextAlign('left')}
              className={`p-1 rounded-lg transition ${
                textObj.textAlign === 'left' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Align Left"
            >
              <AlignLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleTextAlign('center')}
              className={`p-1 rounded-lg transition ${
                textObj.textAlign === 'center' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Align Center"
            >
              <AlignCenter size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleTextAlign('right')}
              className={`p-1 rounded-lg transition ${
                textObj.textAlign === 'right' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Align Right"
            >
              <AlignRight size={13} />
            </button>
          </div>

          {/* Spacing Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('spacing')}
              className={`p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition ${
                activeDropdown === 'spacing' ? 'bg-slate-800 text-white' : ''
              }`}
              title="Letter & Line Spacing"
            >
              <MoveHorizontal size={13} />
            </button>

            {activeDropdown === 'spacing' && (
              <div className="absolute left-0 top-full mt-1.5 w-48 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl space-y-3 z-50">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span>Letter Spacing</span>
                    <span className="font-mono text-purple-400">{textObj.charSpacing || 0}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="500"
                    step="10"
                    value={textObj.charSpacing || 0}
                    onChange={(e) => handleCharSpacing(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span>Line Spacing</span>
                    <span className="font-mono text-purple-400">{textObj.lineHeight?.toFixed(2) || '1.20'}</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.05"
                    value={textObj.lineHeight || 1.2}
                    onChange={(e) => handleLineHeight(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Effects & Shadow Trigger */}
          <button
            type="button"
            onClick={() => toggleDropdown('effects')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition ${
              activeDropdown === 'effects' ? 'bg-purple-600 text-white shadow font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Effects</span>
          </button>
        </>
      )}

      {/* SHAPE & MULTI-OBJECT CONTEXT ACTIONS */}
      {(isShape || isMultiSelect || isGroup) && (
        <div className="flex items-center gap-1.5">
          {/* Fill Color Swatch */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('color');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition whitespace-nowrap ${
                activeDropdown === 'color' ? 'bg-purple-600 text-white shadow' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title="Change Fill Color or Gradient"
            >
              <div
                className="h-4 w-4 rounded-md border border-white/20 shadow-sm shrink-0"
                style={{
                  background: isGradientFill(selectedObject.fill)
                    ? `linear-gradient(135deg, ${(selectedObject.fill as fabric.Gradient).colorStops?.[0]?.color || '#3b82f6'}, ${(selectedObject.fill as fabric.Gradient).colorStops?.[1]?.color || '#8b5cf6'})`
                    : (selectedObject.fill as string) || '#3b82f6',
                }}
              />
              <span className="text-[11px] font-bold font-mono uppercase">Color</span>
              <ChevronDown size={11} className="text-slate-400 shrink-0" />
            </button>

            {activeDropdown === 'color' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-2 z-50 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <ColorPickerPopover
                  color={selectedObject.fill}
                  onChange={(newFill) => {
                    applyFabricStyle(canvas, selectedObject, 'fill', newFill);
                    pushHistoryState();
                  }}
                  onClose={() => setActiveDropdown(null)}
                  title={isMultiSelect ? 'Selection Color' : 'Shape Color'}
                  allowGradient={true}
                  canvas={canvas}
                />
              </div>
            )}
          </div>

          {/* Border / Stroke Styling */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('border')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${
                activeDropdown === 'border' ? 'bg-purple-600 text-white shadow' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title="Border & Stroke"
            >
              <div
                className="h-4 w-4 rounded-md border-2 border-white/80 shrink-0"
                style={{
                  borderColor: (selectedObject.stroke as string) || '#ffffff',
                }}
              />
              <span className="text-[11px] font-bold">Border</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {activeDropdown === 'border' && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900/98 p-3 shadow-2xl space-y-3 z-50 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[11px] font-bold text-white">Border Styling</span>
                  <button
                    type="button"
                    onClick={() => {
                      applyFabricStyle(canvas, selectedObject, 'strokeWidth', 0);
                      pushHistoryState();
                    }}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    No border
                  </button>
                </div>

                {/* Border Color Swatches */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">Border Color</span>
                  <div className="grid grid-cols-6 gap-1">
                    {['#ffffff', '#000000', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#475569'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          applyFabricStyle(canvas, selectedObject, 'stroke', c);
                          if (!selectedObject.strokeWidth) {
                            applyFabricStyle(canvas, selectedObject, 'strokeWidth', 2);
                          }
                          pushHistoryState();
                        }}
                        style={{ backgroundColor: c }}
                        className="h-5 rounded-md border border-slate-700 hover:scale-110 transition"
                      />
                    ))}
                  </div>
                </div>

                {/* Border Thickness Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Thickness</span>
                    <span className="font-mono text-purple-300 font-bold">{selectedObject.strokeWidth || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedObject.strokeWidth || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      applyFabricStyle(canvas, selectedObject, 'strokeWidth', val);
                      if (val > 0 && !selectedObject.stroke) {
                        applyFabricStyle(canvas, selectedObject, 'stroke', '#ffffff');
                      }
                      pushHistoryState();
                    }}
                    className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Border Style Buttons */}
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      applyFabricStyle(canvas, selectedObject, 'strokeDashArray', null);
                      pushHistoryState();
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg border transition ${
                      !selectedObject.strokeDashArray
                        ? 'border-purple-500 bg-purple-600 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    Solid ──
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyFabricStyle(canvas, selectedObject, 'strokeDashArray', [10, 5]);
                      pushHistoryState();
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg border transition ${
                      selectedObject.strokeDashArray && (selectedObject.strokeDashArray as number[])[0] === 10
                        ? 'border-purple-500 bg-purple-600 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    Dashed ╌╌
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyFabricStyle(canvas, selectedObject, 'strokeDashArray', [3, 4]);
                      pushHistoryState();
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg border transition ${
                      selectedObject.strokeDashArray && (selectedObject.strokeDashArray as number[])[0] === 3
                        ? 'border-purple-500 bg-purple-600 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    Dotted •••
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Effects & Shadow Trigger */}
          <button
            type="button"
            onClick={() => toggleDropdown('effects')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition ${
              activeDropdown === 'effects' ? 'bg-purple-600 text-white shadow font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Effects</span>
          </button>
        </div>
      )}

      {/* COMMON ACTIONS: Position & Opacity (Canva style) */}
      <div className="h-4 border-r border-slate-700 mx-0.5" />

      {/* Position Button (Opens Canva Position Drawer) */}
      <button
        type="button"
        onClick={() => {
          if (activeTool === 'position' && isLeftDrawerOpen) {
            setIsLeftDrawerOpen(false);
          } else {
            setActiveTool('position');
            setIsLeftDrawerOpen(true);
          }
        }}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition whitespace-nowrap shrink-0 ${
          activeTool === 'position' && isLeftDrawerOpen
            ? 'bg-purple-600 text-white shadow-md font-bold'
            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
        }`}
        title="Position & Layer Order"
      >
        <Layers size={13} className="text-blue-400 shrink-0" />
        <span className="whitespace-nowrap font-bold">Position</span>
      </button>

      {/* Full Canvas Quick Fit (Fit 100% Canvas W & H) */}
      <button
        type="button"
        onClick={() => {
          if (!selectedObject || !canvas) return;
          fitObjectToCanvas(canvas, selectedObject, project.width, project.height);
          refreshLayers();
          pushHistoryState();
        }}
        className="flex items-center gap-1 px-2 py-1 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition whitespace-nowrap shrink-0"
        title="Expand element to cover 100% full canvas"
      >
        <Maximize2 size={13} className="text-teal-400 shrink-0" />
        <span className="whitespace-nowrap font-bold">Full Canvas</span>
      </button>

      {/* Opacity / Transparency Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleDropdown('opacity')}
          className={`flex items-center gap-1 p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition ${
            activeDropdown === 'opacity' ? 'bg-slate-800 text-white' : ''
          }`}
          title="Transparency / Opacity"
        >
          <Percent size={13} />
        </button>

        {activeDropdown === 'opacity' && (
          <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl space-y-2 z-50">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Transparency</span>
              <span className="font-mono text-purple-400">{Math.round((selectedObject.opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedObject.opacity ?? 1}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Universal Canva Effects Dropdown Popover (Complete Studio) */}
      {activeDropdown === 'effects' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[340px] max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700/90 bg-slate-950/98 p-3.5 shadow-2xl z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-1 duration-150 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>Effects & Shadow Studio</span>
            </span>
            <button
              type="button"
              onClick={closeDropdown}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={13} />
            </button>
          </div>

          <ShadowCustomizer
            canvas={canvas}
            targetObject={selectedObject}
            onUpdate={() => {
              refreshLayers();
              pushHistoryState();
            }}
          />
        </div>
      )}
    </div>
  );
}
