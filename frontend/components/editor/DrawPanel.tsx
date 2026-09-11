'use client';

import React from 'react';
import { Paintbrush, Eraser, Circle, Palette } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { fabric } from 'fabric';

export function DrawPanel() {
  const {
    canvas,
    brushColor,
    setBrushColor,
    brushWidth,
    setBrushWidth,
    brushOpacity,
    setBrushOpacity,
    isEraser,
    setIsEraser,
    pushHistoryState,
  } = useEditorStore();

  const enableDrawing = (eraserMode: boolean) => {
    if (!canvas) return;
    setIsEraser(eraserMode);
    canvas.isDrawingMode = true;

    if (eraserMode) {
      // In eraser mode, draw with canvas background color or transparent
      canvas.freeDrawingBrush.color = canvas.backgroundColor?.toString() || '#ffffff';
      canvas.freeDrawingBrush.width = brushWidth * 1.5;
    } else {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushWidth;
    }

    canvas.on('path:created', () => {
      pushHistoryState();
    });
  };

  const handleColorChange = (color: string) => {
    setBrushColor(color);
    if (canvas && canvas.isDrawingMode && !isEraser) {
      canvas.freeDrawingBrush.color = color;
    }
  };

  const handleWidthChange = (width: number) => {
    setBrushWidth(width);
    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.width = isEraser ? width * 1.5 : width;
    }
  };

  const PALETTE = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#ffffff',
    '#000000',
  ];

  return (
    <div className="space-y-4 p-3.5 text-white select-none">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Freehand Drawing
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Draw directly on canvas with brush or eraser
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => enableDrawing(false)}
          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition ${
            canvas?.isDrawingMode && !isEraser
              ? 'border-blue-500 bg-blue-950/60 text-blue-200'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          <Paintbrush size={14} className="text-blue-400" />
          <span>Brush Pen</span>
        </button>

        <button
          type="button"
          onClick={() => enableDrawing(true)}
          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition ${
            canvas?.isDrawingMode && isEraser
              ? 'border-blue-500 bg-blue-950/60 text-blue-200'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          <Eraser size={14} className="text-rose-400" />
          <span>Eraser</span>
        </button>
      </div>

      {/* Brush Size */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Brush Radius</span>
          <span className="font-mono text-teal-400">{brushWidth}px</span>
        </div>
        <input
          type="range"
          min="1"
          max="80"
          value={brushWidth}
          onChange={(e) => handleWidthChange(parseInt(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
      </div>

      {/* Color Picker & Palette */}
      {!isEraser && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span>Brush Color</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={brushColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-[10px] text-slate-400 uppercase">{brushColor}</span>
            </div>
          </label>

          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleColorChange(c)}
                className={`h-8 rounded-xl border transition ${
                  brushColor === c ? 'border-white ring-2 ring-blue-500 shadow-md' : 'border-slate-800'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
