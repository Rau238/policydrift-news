'use client';

import React, { useState } from 'react';
import { fabric } from 'fabric';
import {
  MousePointer2,
  Pencil,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { configureObjectControls } from '../../lib/editor/canvas';

export function FloatingToolDock() {
  const {
    canvas,
    project,
    activeTool,
    setActiveTool,
    setIsLeftDrawerOpen,
    pushHistoryState,
    refreshLayers,
  } = useEditorStore();

  const [isOpen, setIsOpen] = useState(true);
  const [activeDockItem, setActiveDockItem] = useState<
    'select' | 'pen' | 'shapes' | 'line' | 'note' | 'text' | 'signature' | 'table'
  >('select');

  if (!canvas) return null;

  // 1. SELECT / POINTER
  const handleSelectPointer = () => {
    setActiveDockItem('select');
    if (canvas.isDrawingMode) {
      canvas.isDrawingMode = false;
    }
  };

  // 2. PEN / DRAW
  const handlePen = () => {
    setActiveDockItem('pen');
    canvas.isDrawingMode = true;
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 4;
      canvas.freeDrawingBrush.color = '#ef4444'; // Red marker
    }
  };

  // 3. SHAPES / ELEMENTS
  const handleShapes = () => {
    setActiveDockItem('shapes');
    if (canvas.isDrawingMode) canvas.isDrawingMode = false;
    setActiveTool('elements');
    setIsLeftDrawerOpen(true);
  };

  // 4. LINE
  const handleLine = () => {
    setActiveDockItem('line');
    if (canvas.isDrawingMode) canvas.isDrawingMode = false;

    const line = new fabric.Line([0, 0, 240, 0], {
      left: project.width / 2 - 120,
      top: project.height / 2,
      stroke: '#3b82f6', // Bright Canva Blue
      strokeWidth: 5,
      strokeLineCap: 'round',
      customName: 'Vector Line',
    } as fabric.ILineOptions & { customName: string });

    configureObjectControls(line);
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  // 5. STICKY NOTE (Yellow post-it with soft shadow and editable text)
  const handleStickyNote = () => {
    setActiveDockItem('note');
    if (canvas.isDrawingMode) canvas.isDrawingMode = false;

    const noteSize = 200;
    const bgRect = new fabric.Rect({
      width: noteSize,
      height: noteSize,
      fill: '#fef08a', // Canva Yellow Sticky Note
      rx: 14,
      ry: 14,
      shadow: new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.18)',
        blur: 16,
        offsetX: 0,
        offsetY: 8,
      }),
    });

    const noteText = new fabric.Textbox('Sticky note\nType here...', {
      width: noteSize - 32,
      fontSize: 20,
      fill: '#1e293b',
      fontFamily: 'Inter, sans-serif',
      fontWeight: '600',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0,
    });

    const group = new fabric.Group([bgRect, noteText], {
      left: project.width / 2 - noteSize / 2,
      top: project.height / 2 - noteSize / 2,
      subTargetCheck: true,
      customName: 'Sticky Note',
    } as fabric.IGroupOptions & { customName: string });

    configureObjectControls(group);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  // 6. TEXT 'T'
  const handleText = () => {
    setActiveDockItem('text');
    if (canvas.isDrawingMode) canvas.isDrawingMode = false;

    const textbox = new fabric.Textbox('Add a heading', {
      left: project.width / 2,
      top: project.height / 2,
      originX: 'center',
      originY: 'center',
      width: 380,
      fontSize: 48,
      fontWeight: 'bold',
      fill: '#a855f7', // Canva Purple
      fontFamily: 'Inter, sans-serif',
      textAlign: 'center',
      splitByGrapheme: false,
      customName: 'Heading Text',
    } as fabric.ITextboxOptions & { customName: string });

    configureObjectControls(textbox);
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  // 7. SIGNATURE / CALLIGRAPHY
  const handleSignature = () => {
    setActiveDockItem('signature');
    canvas.isDrawingMode = true;
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 2.5;
      canvas.freeDrawingBrush.color = '#ffffff'; // White signature
    }
  };

  // 8. TABLE / GRID
  const handleTable = () => {
    setActiveDockItem('table');
    if (canvas.isDrawingMode) canvas.isDrawingMode = false;

    const cellW = 90;
    const cellH = 45;
    const rows = 3;
    const cols = 3;
    const elements: fabric.Object[] = [];

    // Background Card
    const cardBg = new fabric.Rect({
      width: cols * cellW,
      height: rows * cellH,
      fill: '#1e293b',
      rx: 12,
      ry: 12,
      stroke: '#475569',
      strokeWidth: 1.5,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.3)',
        blur: 14,
        offsetX: 0,
        offsetY: 6,
      }),
    });
    elements.push(cardBg);

    // Inner Grid Lines & Headings
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isHeader = r === 0;
        const cellText = new fabric.Text(isHeader ? `Col ${c + 1}` : `Data`, {
          left: -((cols * cellW) / 2) + c * cellW + cellW / 2,
          top: -((rows * cellH) / 2) + r * cellH + cellH / 2,
          originX: 'center',
          originY: 'center',
          fontSize: isHeader ? 13 : 11,
          fontWeight: isHeader ? 'bold' : 'normal',
          fill: isHeader ? '#93c5fd' : '#e2e8f0',
          fontFamily: 'Inter, sans-serif',
        });
        elements.push(cellText);
      }
    }

    const tableGroup = new fabric.Group(elements, {
      left: project.width / 2 - (cols * cellW) / 2,
      top: project.height / 2 - (rows * cellH) / 2,
      customName: '3x3 Table Grid',
    } as fabric.IGroupOptions & { customName: string });

    configureObjectControls(tableGroup);
    canvas.add(tableGroup);
    canvas.setActiveObject(tableGroup);
    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute left-3 top-16 z-30 flex items-center gap-1.5 px-2.5 py-2 rounded-2xl bg-[#181920]/90 border border-slate-700/60 shadow-xl text-slate-300 hover:text-white backdrop-blur-md transition group"
        title="Open Canva Quick Tools Dock"
      >
        <Sparkles size={14} className="text-purple-400 group-hover:scale-110 transition" />
        <ChevronRight size={14} className="text-slate-400" />
      </button>
    );
  }

  return (
    <div className="absolute left-3 top-14 z-30 flex flex-col items-center gap-2 select-none animate-in fade-in slide-in-from-left-2 duration-200">
      {/* Close Circular Button */}
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="h-8 w-8 rounded-full bg-[#181920]/90 border border-slate-700/60 shadow-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center backdrop-blur-md transition active:scale-95"
        title="Minimize Quick Toolbar"
      >
        <X size={15} />
      </button>

      {/* Floating Vertical Pill Dock Container */}
      <div className="w-13 bg-[#181920]/95 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-1.5 flex flex-col items-center gap-2 shadow-2xl">
        {/* 1. Pointer / Select Arrow */}
        <button
          type="button"
          onClick={handleSelectPointer}
          className={`h-10 w-10 rounded-2xl flex items-center justify-center transition active:scale-95 ${
            activeDockItem === 'select' && !canvas.isDrawingMode
              ? 'bg-[#7048e8] text-white shadow-lg shadow-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Select / Move Tool (V)"
        >
          <MousePointer2 size={18} className="-rotate-45" />
        </button>

        {/* 2. Red Pencil / Pen Marker */}
        <button
          type="button"
          onClick={handlePen}
          className={`h-10 w-10 rounded-2xl flex flex-col items-center justify-center transition active:scale-95 ${
            activeDockItem === 'pen' && canvas.isDrawingMode
              ? 'bg-red-600/30 border border-red-500/50 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Marker / Pen Draw"
        >
          <Pencil size={17} className="text-red-400" />
          <div className="w-3.5 h-0.5 bg-red-500 rounded-full mt-0.5" />
        </button>

        {/* 3. Elements / Shapes (Overlapping circle and square) */}
        <button
          type="button"
          onClick={handleShapes}
          className="h-10 w-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition active:scale-95"
          title="Elements & Shapes"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-300">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" fill="#64748b" fillOpacity="0.4" />
            <rect x="9" y="9" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2" fill="#94a3b8" />
          </svg>
        </button>

        {/* 4. Line Tool */}
        <button
          type="button"
          onClick={handleLine}
          className="h-10 w-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition active:scale-95"
          title="Add Straight Line"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="20" x2="20" y2="4" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>

        {/* 5. Sticky Note (Yellow square with folded corner) */}
        <button
          type="button"
          onClick={handleStickyNote}
          className="h-10 w-10 rounded-2xl flex items-center justify-center transition active:scale-95 hover:bg-slate-800/80"
          title="Add Sticky Note"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6a3 3 0 013-3h12a3 3 0 013 3v9a3 3 0 01-3 3h-3l-6 6H6a3 3 0 01-3-3V6z"
              fill="#facc15"
            />
            <path
              d="M15 18l6 6h-6v-6z"
              fill="#eab308"
            />
          </svg>
        </button>

        {/* 6. Text 'T' in Vibrant Purple */}
        <button
          type="button"
          onClick={handleText}
          className="h-10 w-10 rounded-2xl flex items-center justify-center transition active:scale-95 hover:bg-slate-800/80"
          title="Add Text Heading"
        >
          <span className="text-lg font-black text-[#c084fc] font-serif">T</span>
        </button>

        {/* 7. Signature / Calligraphy Scribble */}
        <button
          type="button"
          onClick={handleSignature}
          className="h-10 w-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition active:scale-95"
          title="Signature / Freehand Scribble"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 17c3-3 7-7 10-6s-4 7 0 7 6-8 6-8"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="17" y1="19" x2="21" y2="19" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* 8. Table Grid */}
        <button
          type="button"
          onClick={handleTable}
          className="h-10 w-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition active:scale-95"
          title="Add Table Grid"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#ffffff" />
            <line x1="3" y1="9" x2="21" y2="9" stroke="#ffffff" />
            <line x1="3" y1="15" x2="21" y2="15" stroke="#ffffff" />
            <line x1="9" y1="3" x2="9" y2="21" stroke="#ffffff" />
            <line x1="15" y1="3" x2="15" y2="21" stroke="#ffffff" />
          </svg>
        </button>
      </div>
    </div>
  );
}
