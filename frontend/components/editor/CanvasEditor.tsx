'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '../../store/editorStore';
import { initSnappingGuides, configureObjectControls } from '../../lib/editor/canvas';
import { ContextActionBar } from './ContextActionBar';
import { FloatingObjectToolbar } from './FloatingObjectToolbar';
import { ContextMenu } from './ContextMenu';
import { FloatingToolDock } from './FloatingToolDock';
import {
  Maximize,
  Grid,
  Hand,
  Undo2,
  Redo2,
  Download,
} from 'lucide-react';

export function CanvasEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const [contextMenuCoords, setContextMenuCoords] = useState<{ x: number; y: number } | null>(null);
  const [dimensionTooltip, setDimensionTooltip] = useState<{ width: number; height: number; x: number; y: number } | null>(null);

  const {
    canvas,
    setCanvas,
    selectedObject,
    setSelectedObject,
    setSelectedObjects,
    refreshLayers,
    pushHistoryState,
    zoom,
    setZoom,
    showGrid,
    setShowGrid,
    project,
    canUndo,
    canRedo,
    undo,
    redo,
    isPanMode,
    setIsPanMode,
  } = useEditorStore();

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setContextMenuCoords(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!canvasElementRef.current || !containerRef.current) return;

    // 0. Configure default Fabric object control aesthetics
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#8b5cf6',
      cornerStrokeColor: '#ffffff',
      borderColor: '#8b5cf6',
      cornerSize: 10,
      cornerStyle: 'circle',
      borderScaleFactor: 1.5,
      padding: 4,
      borderDashArray: [3, 3],
    });

    // 1. Initialize Fabric Canvas
    const fabricCanvas = new fabric.Canvas(canvasElementRef.current, {
      width: project.width,
      height: project.height,
      backgroundColor: project.backgroundColor || '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    setCanvas(fabricCanvas);

    // 2. Selection & Layer Sync Events
    fabricCanvas.on('selection:created', (e) => {
      const selected = e.selected || [];
      selected.forEach((obj) => configureObjectControls(obj));
      setSelectedObjects(selected);
      setSelectedObject(selected.length === 1 ? selected[0] : null);
    });

    fabricCanvas.on('selection:updated', (e) => {
      const selected = e.selected || [];
      selected.forEach((obj) => configureObjectControls(obj));
      setSelectedObjects(selected);
      setSelectedObject(selected.length === 1 ? selected[0] : null);
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setSelectedObjects([]);
      setContextMenuCoords(null);
    });

    // Dimension Tooltip during scaling / resizing (Canva style)
    const handleScaling = (opt: fabric.IEvent) => {
      const target = opt.target;
      if (!target) return;
      const canvasEl = fabricCanvas.getElement();
      if (!canvasEl) return;
      try {
        const bound = target.getBoundingRect();
        const canvasRect = canvasEl.getBoundingClientRect();
        setDimensionTooltip({
          width: Math.round(target.getScaledWidth()),
          height: Math.round(target.getScaledHeight()),
          x: canvasRect.left + bound.left + bound.width + 16,
          y: canvasRect.top + bound.top + bound.height / 2,
        });
      } catch {
        setDimensionTooltip(null);
      }
    };

    fabricCanvas.on('object:scaling', handleScaling);
    fabricCanvas.on('object:resizing', handleScaling);

    fabricCanvas.on('object:modified', () => {
      setDimensionTooltip(null);
      refreshLayers();
      pushHistoryState();
    });

    fabricCanvas.on('mouse:up', () => {
      setDimensionTooltip(null);
    });

    fabricCanvas.on('object:added', (e) => {
      if (e.target) {
        configureObjectControls(e.target);
      }
      refreshLayers();
      if (!useEditorStore.getState().isRestoringHistory) {
        pushHistoryState();
      }
    });

    fabricCanvas.on('object:removed', () => {
      refreshLayers();
      if (!useEditorStore.getState().isRestoringHistory) {
        pushHistoryState();
      }
    });

    fabricCanvas.on('text:changed', () => {
      refreshLayers();
      if (!useEditorStore.getState().isRestoringHistory) {
        pushHistoryState();
      }
    });

    // 3. Snapping Guides
    const cleanupGuides = initSnappingGuides(fabricCanvas);

    // 4. Mouse Wheel Zooming (Exact Canvas Board Scaling)
    const handleWheel = (opt: fabric.IEvent<WheelEvent>) => {
      const delta = opt.e.deltaY;
      let newZoom = fabricCanvas.getZoom();
      newZoom *= 0.999 ** delta;
      newZoom = Math.min(Math.max(0.1, newZoom), 3.0);

      fabricCanvas.setDimensions({
        width: Math.round(project.width * newZoom),
        height: Math.round(project.height * newZoom),
      });
      fabricCanvas.setZoom(newZoom);
      setZoom(newZoom);
      fabricCanvas.renderAll();

      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    fabricCanvas.on('mouse:wheel', handleWheel);

    // 5. Right Click for Context Menu
    fabricCanvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      if (opt.button === 3 || evt.button === 2) {
        // Right Click
        if (opt.target) {
          fabricCanvas.setActiveObject(opt.target);
          setSelectedObject(opt.target);
          fabricCanvas.renderAll();
        }
        setContextMenuCoords({ x: evt.clientX, y: evt.clientY });
      } else {
        setContextMenuCoords(null);
      }
    });

    // 6. Hand Pan Dragging support
    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    fabricCanvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      const panActive = useEditorStore.getState().isPanMode || evt.altKey;
      if (panActive && opt.button === 1) {
        isDragging = true;
        fabricCanvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    fabricCanvas.on('mouse:move', (opt) => {
      if (isDragging) {
        const e = opt.e as MouseEvent;
        const vpt = fabricCanvas.viewportTransform;
        if (vpt) {
          vpt[4] += e.clientX - lastPosX;
          vpt[5] += e.clientY - lastPosY;
          fabricCanvas.requestRenderAll();
          lastPosX = e.clientX;
          lastPosY = e.clientY;
        }
      }
    });

    fabricCanvas.on('mouse:up', () => {
      if (isDragging) {
        isDragging = false;
        fabricCanvas.selection = !useEditorStore.getState().isPanMode;
        fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]);
      }
    });

    // Initial history state & layer refresh
    pushHistoryState();
    refreshLayers();

    // Initial fit to screen with exact canvas dimensions
    let isDisposed = false;
    const fitTimer = setTimeout(() => {
      if (isDisposed || !containerRef.current || !fabricCanvas.getContext()) return;
      try {
        const containerW = containerRef.current.clientWidth - 96;
        const containerH = containerRef.current.clientHeight - 96;
        const fitScale = Math.min(containerW / project.width, containerH / project.height, 0.95);
        if (fitScale > 0 && fabricCanvas.getContext()) {
          fabricCanvas.setDimensions({
            width: Math.round(project.width * fitScale),
            height: Math.round(project.height * fitScale),
          });
          fabricCanvas.setZoom(fitScale);
          setZoom(fitScale);
          fabricCanvas.renderAll();
        }
      } catch {
        // safety ignore if canvas disposed during render
      }
    }, 100);

    return () => {
      isDisposed = true;
      clearTimeout(fitTimer);
      cleanupGuides();
      try {
        fabricCanvas.dispose();
      } catch {
        // ignore
      }
      setCanvas(null);
    };
  }, []);

  // Update canvas background & dimension on project change
  useEffect(() => {
    const canvas = useEditorStore.getState().canvas;
    if (!canvas) return;
    const curZoom = useEditorStore.getState().zoom;
    canvas.setDimensions({
      width: Math.round(project.width * curZoom),
      height: Math.round(project.height * curZoom),
    });
    canvas.setZoom(curZoom);
    if (project.backgroundColor) {
      canvas.backgroundColor = project.backgroundColor;
    }
    canvas.renderAll();
  }, [project.width, project.height, project.backgroundColor]);

  // Update canvas selection mode on panMode toggle
  useEffect(() => {
    if (!canvas) return;
    canvas.selection = !isPanMode;
    canvas.defaultCursor = isPanMode ? 'grab' : 'default';
  }, [canvas, isPanMode]);

  // Handle Drag and Drop Image File onto Canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const canvas = useEditorStore.getState().canvas;
              if (!canvas) return;
              const imgObj = new fabric.Image(img, {
                left: project.width / 2,
                top: project.height / 2,
                originX: 'center',
                originY: 'center',
              });
              (imgObj as unknown as { id: string; customName: string }).id = `img-${Date.now()}`;
              (imgObj as unknown as { customName: string }).customName = file.name;

              const maxW = project.width * 0.85;
              const maxH = project.height * 0.85;
              const scale = Math.min(maxW / (imgObj.width || 1), maxH / (imgObj.height || 1), 1.0);
              imgObj.scale(scale);

              configureObjectControls(imgObj);

              canvas.add(imgObj);
              canvas.setActiveObject(imgObj);
              canvas.renderAll();
              refreshLayers();
              pushHistoryState();
            };
            img.src = ev.target.result as string;
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFitToScreen = () => {
    if (!canvas || !containerRef.current) return;
    const containerW = containerRef.current.clientWidth - 96;
    const containerH = containerRef.current.clientHeight - 96;
    const fitScale = Math.min(containerW / project.width, containerH / project.height, 0.95);
    setZoom(fitScale);
    canvas.setDimensions({
      width: Math.round(project.width * fitScale),
      height: Math.round(project.height * fitScale),
    });
    canvas.setZoom(fitScale);
    canvas.renderAll();
  };

  const handleResetZoom = () => {
    if (!canvas) return;
    setZoom(1.0);
    canvas.setDimensions({
      width: project.width,
      height: project.height,
    });
    canvas.setZoom(1.0);
    canvas.renderAll();
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative flex flex-1 h-full w-full min-w-0 min-h-0 items-center justify-center overflow-auto bg-slate-950/98 select-none p-6"
      style={{
        backgroundImage: showGrid
          ? 'radial-gradient(circle, rgba(255, 255, 255, 0.14) 1px, transparent 1px)'
          : undefined,
        backgroundSize: showGrid ? '24px 24px' : undefined,
      }}
    >
      {/* Top Floating Context Action Bar (when object is selected) */}
      <ContextActionBar />

      {/* Canvas Document Board (Canva clean drop-shadow page without black screen margins) */}
      <div className="relative shadow-2xl rounded-xs ring-1 ring-slate-800/80 shrink-0">
        <canvas ref={canvasElementRef} />
      </div>

      {/* Floating Action Badge Attached Directly to Selected Object */}
      <FloatingObjectToolbar
        onOpenContextMenu={(x, y) => setContextMenuCoords({ x, y })}
      />

      {/* Canva Dimension Tooltip Badge (e.g. w: 329 h: 187) */}
      {dimensionTooltip && (
        <div
          style={{
            position: 'fixed',
            left: dimensionTooltip.x,
            top: dimensionTooltip.y,
            transform: 'translateY(-50%)',
            zIndex: 60,
          }}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950/95 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-200 shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-75"
        >
          <span className="text-slate-400">w:</span>
          <span className="text-purple-300">{dimensionTooltip.width}</span>
          <span className="text-slate-400 ml-1">h:</span>
          <span className="text-purple-300">{dimensionTooltip.height}</span>
        </div>
      )}

      {/* Right-Click Context Menu */}
      {contextMenuCoords && (
        <ContextMenu
          x={contextMenuCoords.x}
          y={contextMenuCoords.y}
          onClose={() => setContextMenuCoords(null)}
        />
      )}

      {/* Left Floating Quick Tools Dock (Canva Whiteboard / Quick Tools) */}
      <FloatingToolDock />

      {/* Floating Bottom Canvas Studio Dock (Canva exact layout) */}
      <div className="absolute bottom-4 z-30 flex items-center gap-3 rounded-2xl border border-slate-800/90 bg-slate-900/95 px-4 py-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200 select-none text-xs">
        {/* Undo & Redo */}
        <div className="flex items-center gap-1 border-r border-slate-800 pr-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded-xl transition ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded-xl transition ${
              canRedo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Pan / Pointer Mode */}
        <div className="flex items-center gap-1 border-r border-slate-800 pr-2">
          <button
            type="button"
            onClick={() => setIsPanMode(!isPanMode)}
            className={`p-1.5 rounded-xl transition ${
              isPanMode
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isPanMode ? 'Pan Mode Active (Drag to pan)' : 'Switch to Hand / Pan Mode (H)'}
          >
            <Hand size={14} />
          </button>
        </div>

        {/* Zoom Slider + Percentage (Canva style) */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center w-28 sm:w-36">
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.05"
              value={zoom}
              onChange={(e) => {
                const newZ = parseFloat(e.target.value);
                setZoom(newZ);
                if (canvas) {
                  canvas.setDimensions({
                    width: Math.round(project.width * newZ),
                    height: Math.round(project.height * newZ),
                  });
                  canvas.setZoom(newZ);
                  canvas.renderAll();
                }
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <button
            type="button"
            onClick={handleResetZoom}
            className="font-mono text-xs font-bold text-white hover:text-purple-400 min-w-[36px] text-right"
            title="Click to reset zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>

        {/* Pages Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 pl-3 text-slate-300 font-bold">
          <span>Pages</span>
          <span className="font-mono text-purple-400">1 / 1</span>
        </div>

        {/* Action icons: Grid, Fit, Fullscreen */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-xl transition ${
              showGrid ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Grid View"
          >
            <Grid size={14} />
          </button>

          <button
            type="button"
            onClick={handleFitToScreen}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Fit to Screen"
          >
            <Maximize size={14} />
          </button>

          {/* Quick Export Trigger */}
          <button
            type="button"
            onClick={() => useEditorStore.getState().setIsExportOpen(true)}
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 text-slate-950 font-bold text-xs shadow hover:opacity-95 transition active:scale-95 ml-1"
            title="Export Image (PNG, JPG, WEBP)"
          >
            <Download size={13} className="stroke-[2.5]" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}
