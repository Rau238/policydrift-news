'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  ArrowUpToLine,
  ArrowDownToLine,
  AlignLeft,
  AlignRight,
  AlignCenter,
  AlignVerticalJustifyCenter,
  Lock,
  Unlock,
  RotateCw,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Layers as LayersIcon,
  LayoutGrid,
  GripVertical,
  Maximize2,
  Edit2,
  Check,
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Sparkles,
  MousePointer,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import {
  bringObjectToFront,
  sendObjectToBack,
  bringObjectForward,
  sendObjectBackward,
  fitObjectToCanvas,
} from '../../lib/editor/canvas';
import type { LayerItem } from '../../types/editor';

export function PositionPanel() {
  const {
    canvas,
    selectedObject,
    layers,
    refreshLayers,
    pushHistoryState,
    project,
    setIsLeftDrawerOpen,
    setSelectedObject,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'arrange' | 'layers'>('arrange');
  const [ratioLocked, setRatioLocked] = useState(false);

  // Advanced coordinates & dimension state
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [posX, setPosX] = useState<number>(0);
  const [posY, setPosY] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0);

  // Drag & drop state for Layers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Inline rename state for Layers
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState<string>('');

  // Sync inputs with selected object
  useEffect(() => {
    if (!selectedObject) return;
    setWidth(Math.round(selectedObject.getScaledWidth() * 10) / 10);
    setHeight(Math.round(selectedObject.getScaledHeight() * 10) / 10);
    setPosX(Math.round((selectedObject.left || 0) * 10) / 10);
    setPosY(Math.round((selectedObject.top || 0) * 10) / 10);
    setAngle(Math.round((selectedObject.angle || 0) % 360));
  }, [selectedObject]);

  const handleWidthChange = (newW: number) => {
    if (!selectedObject || !canvas || isNaN(newW) || newW <= 0) return;
    setWidth(newW);
    const currentW = selectedObject.getScaledWidth();
    const currentH = selectedObject.getScaledHeight();
    const scaleFactor = newW / (selectedObject.width || 1);

    if (ratioLocked && currentW > 0) {
      const newH = (newW * currentH) / currentW;
      setHeight(Math.round(newH * 10) / 10);
      selectedObject.scale(scaleFactor);
    } else {
      selectedObject.set('scaleX', scaleFactor);
    }
    selectedObject.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleHeightChange = (newH: number) => {
    if (!selectedObject || !canvas || isNaN(newH) || newH <= 0) return;
    setHeight(newH);
    const currentW = selectedObject.getScaledWidth();
    const currentH = selectedObject.getScaledHeight();
    const scaleFactor = newH / (selectedObject.height || 1);

    if (ratioLocked && currentH > 0) {
      const newW = (newH * currentW) / currentH;
      setWidth(Math.round(newW * 10) / 10);
      selectedObject.scale(scaleFactor);
    } else {
      selectedObject.set('scaleY', scaleFactor);
    }
    selectedObject.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handlePosXChange = (newX: number) => {
    if (!selectedObject || !canvas || isNaN(newX)) return;
    setPosX(newX);
    selectedObject.set('left', newX);
    selectedObject.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handlePosYChange = (newY: number) => {
    if (!selectedObject || !canvas || isNaN(newY)) return;
    setPosY(newY);
    selectedObject.set('top', newY);
    selectedObject.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleRotateChange = (deg: number) => {
    if (!selectedObject || !canvas || isNaN(deg)) return;
    setAngle(deg);
    selectedObject.rotate(deg);
    selectedObject.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleAlign = (type: 'top' | 'left' | 'middle' | 'centre' | 'bottom' | 'right') => {
    if (!selectedObject || !canvas) return;
    const w = selectedObject.getScaledWidth();
    const h = selectedObject.getScaledHeight();

    if (type === 'top') selectedObject.set({ top: 0 });
    if (type === 'left') selectedObject.set({ left: 0 });
    if (type === 'middle') selectedObject.set({ top: (project.height - h) / 2 });
    if (type === 'centre') selectedObject.set({ left: (project.width - w) / 2 });
    if (type === 'bottom') selectedObject.set({ top: project.height - h });
    if (type === 'right') selectedObject.set({ left: project.width - w });

    selectedObject.setCoords();
    canvas.renderAll();
    pushHistoryState();

    setPosX(Math.round((selectedObject.left || 0) * 10) / 10);
    setPosY(Math.round((selectedObject.top || 0) * 10) / 10);
  };

  const handleFitFullCanvas = () => {
    if (!selectedObject || !canvas) return;
    fitObjectToCanvas(canvas, selectedObject, project.width, project.height);
    pushHistoryState();
    setWidth(Math.round(selectedObject.getScaledWidth() * 10) / 10);
    setHeight(Math.round(selectedObject.getScaledHeight() * 10) / 10);
    setPosX(Math.round((selectedObject.left || 0) * 10) / 10);
    setPosY(Math.round((selectedObject.top || 0) * 10) / 10);
  };

  // --- HTML5 DRAG AND DROP REORDERING ---
  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex || !canvas) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const objects = canvas.getObjects();
    const total = objects.length;
    if (total <= 1) return;

    const sourceLayer = layers[draggedIndex];
    if (!sourceLayer) return;

    const fabricObj = objects.find(
      (o, idx) => (o as unknown as { id?: string }).id === sourceLayer.id || idx === sourceLayer.zIndex
    );

    if (fabricObj) {
      // In Fabric.js, index 0 is bottom-most, total-1 is top-most
      // In layers list, index 0 is top-most, total-1 is bottom-most
      const targetFabricIndex = Math.max(0, Math.min(total - 1, total - 1 - targetIndex));
      canvas.moveTo(fabricObj, targetFabricIndex);
      canvas.setActiveObject(fabricObj);
      canvas.renderAll();
      refreshLayers();
      pushHistoryState();
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDuplicateLayer = (fabricObj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    fabricObj.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (fabricObj.left || 0) + 24,
        top: (fabricObj.top || 0) + 24,
        evented: true,
        selectable: true,
      });
      (cloned as unknown as { id: string; customName: string }).id = `layer-${Date.now()}`;
      (cloned as unknown as { customName: string }).customName = `${
        (fabricObj as unknown as { customName?: string }).customName || fabricObj.type || 'Layer'
      } (Copy)`;
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      setSelectedObject(cloned);
      canvas.renderAll();
      refreshLayers();
      pushHistoryState();
    });
  };

  const handleDeleteLayer = (fabricObj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    canvas.remove(fabricObj);
    if (canvas.getActiveObject() === fabricObj) {
      canvas.discardActiveObject();
      setSelectedObject(null);
    }
    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  const handleMoveStep = (fabricObj: fabric.Object, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    if (direction === 'up') {
      canvas.bringForward(fabricObj);
    } else {
      canvas.sendBackwards(fabricObj);
    }
    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  const handleStartRename = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLayerId(layer.id);
    setEditingLayerName(layer.name);
  };

  const handleSaveRename = (fabricObj: fabric.Object) => {
    if (editingLayerName.trim()) {
      (fabricObj as unknown as { customName: string }).customName = editingLayerName.trim();
      refreshLayers();
      pushHistoryState();
    }
    setEditingLayerId(null);
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'i-text':
      case 'textbox':
      case 'text':
        return <Type size={13} className="text-purple-400 shrink-0" />;
      case 'image':
        return <ImageIcon size={13} className="text-blue-400 shrink-0" />;
      case 'rect':
        return <Square size={13} className="text-amber-400 shrink-0" />;
      case 'circle':
        return <Circle size={13} className="text-teal-400 shrink-0" />;
      default:
        return <LayersIcon size={13} className="text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="flex h-full flex-col text-white select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <LayersIcon size={16} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white">Position & Layers</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsLeftDrawerOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Close Position Drawer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs: Arrange & Layers (Canva Style Full-width Pills) */}
      <div className="flex border-b border-slate-800 bg-slate-900/80 p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('arrange')}
          className={`flex-1 py-2 text-xs font-bold text-center rounded-xl transition ${
            activeTab === 'arrange'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          Arrange
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 text-xs font-bold text-center rounded-xl transition ${
            activeTab === 'layers'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          Layers ({layers.length})
        </button>
      </div>

      {/* ARRANGE TAB CONTENT */}
      {activeTab === 'arrange' && (
        <div className="p-3.5 space-y-4">
          {!selectedObject ? (
            <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400 text-xs space-y-3">
              <MousePointer size={28} className="text-slate-600" />
              <p className="font-semibold text-slate-300">No element selected</p>
              <p className="text-[11px] text-slate-500">
                Click any element on canvas to adjust its position and dimensions, or switch to the Layers tab to organize your project.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('layers')}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition"
              >
                View All Layers ({layers.length})
              </button>
            </div>
          ) : (
            <>
              {/* Layer Order 2x2 Grid */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Layer Order
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (canvas) bringObjectForward(canvas);
                      refreshLayers();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition"
                  >
                    <ArrowUp size={14} className="text-purple-400" />
                    <span>Forward</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (canvas) sendObjectBackward(canvas);
                      refreshLayers();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition"
                  >
                    <ArrowDown size={14} className="text-purple-400" />
                    <span>Backward</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (canvas) bringObjectToFront(canvas);
                      refreshLayers();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition"
                  >
                    <ChevronsUp size={14} className="text-blue-400" />
                    <span>To front</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (canvas) sendObjectToBack(canvas);
                      refreshLayers();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition"
                  >
                    <ChevronsDown size={14} className="text-blue-400" />
                    <span>To back</span>
                  </button>
                </div>
              </div>

              {/* Align to Page 2-Column Grid */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Align to page
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAlign('top')}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition"
                  >
                    <ArrowUpToLine size={14} className="text-teal-400" />
                    <span>Top</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAlign('left')}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition"
                  >
                    <AlignLeft size={14} className="text-teal-400" />
                    <span>Left</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAlign('middle')}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition"
                  >
                    <AlignVerticalJustifyCenter size={14} className="text-teal-400" />
                    <span>Middle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAlign('centre')}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition"
                  >
                    <AlignCenter size={14} className="text-teal-400" />
                    <span>Centre</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAlign('bottom')}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition"
                  >
                    <ArrowDownToLine size={14} className="text-teal-400" />
                    <span>Bottom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAlign('right')}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition"
                  >
                    <AlignRight size={14} className="text-teal-400" />
                    <span>Right</span>
                  </button>
                </div>

                {/* Fit Full Canvas 1-Click Action */}
                <button
                  type="button"
                  onClick={handleFitFullCanvas}
                  className="w-full mt-2 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-blue-500/50 bg-blue-950/50 hover:bg-blue-900/70 text-blue-200 hover:text-white text-xs font-bold transition shadow-md"
                  title="Expand selected element to cover full canvas (100% width and height)"
                >
                  <Maximize2 size={14} className="text-blue-400" />
                  <span>Fit Full Canvas (100% W & H)</span>
                </button>
              </div>

              {/* Advanced Coordinates & Dimensions Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Advanced Dimensions
                </div>

                {/* Width, Height, Ratio Lock */}
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Width</label>
                    <div className="relative mt-0.5">
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
                        className="w-full h-8 rounded-xl border border-slate-800 bg-slate-900 px-2 text-xs font-mono font-bold text-white outline-none focus:border-purple-500"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono">px</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Height</label>
                    <div className="relative mt-0.5">
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
                        className="w-full h-8 rounded-xl border border-slate-800 bg-slate-900 px-2 text-xs font-mono font-bold text-white outline-none focus:border-purple-500"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono">px</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Ratio</label>
                    <button
                      type="button"
                      onClick={() => setRatioLocked(!ratioLocked)}
                      className={`flex h-8 w-full items-center justify-center rounded-xl border transition mt-0.5 ${
                        ratioLocked
                          ? 'border-purple-500 bg-purple-950/60 text-purple-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                      title={ratioLocked ? 'Lock Aspect Ratio (Active)' : 'Unlock Aspect Ratio'}
                    >
                      {ratioLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                  </div>
                </div>

                {/* X, Y, Rotate */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">X</label>
                    <div className="relative mt-0.5">
                      <input
                        type="number"
                        value={posX}
                        onChange={(e) => handlePosXChange(parseFloat(e.target.value))}
                        className="w-full h-8 rounded-xl border border-slate-800 bg-slate-900 px-2 text-xs font-mono font-bold text-white outline-none focus:border-purple-500"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono">px</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Y</label>
                    <div className="relative mt-0.5">
                      <input
                        type="number"
                        value={posY}
                        onChange={(e) => handlePosYChange(parseFloat(e.target.value))}
                        className="w-full h-8 rounded-xl border border-slate-800 bg-slate-900 px-2 text-xs font-mono font-bold text-white outline-none focus:border-purple-500"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono">px</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Rotate</label>
                    <div className="relative mt-0.5">
                      <input
                        type="number"
                        value={angle}
                        onChange={(e) => handleRotateChange(parseFloat(e.target.value))}
                        className="w-full h-8 rounded-xl border border-slate-800 bg-slate-900 px-2 text-xs font-mono font-bold text-white outline-none focus:border-purple-500"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono">°</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* LAYERS TAB CONTENT (DRAG & DROP, COPY, DELETE, RENAME, LOCK, VISIBILITY) */}
      {activeTab === 'layers' && (
        <div className="p-3.5 space-y-2.5">
          {/* Quick Info & Drag Hint */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="font-bold text-slate-300">
              {layers.length} {layers.length === 1 ? 'Layer' : 'Layers'}
            </span>
            <span className="text-[10px] text-slate-500">
              Drag handles to reorder stacking
            </span>
          </div>

          {layers.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10 text-slate-500 space-y-2">
              <LayersIcon size={32} className="opacity-30 stroke-[1.5]" />
              <p className="text-xs font-semibold">No layers on canvas</p>
              <p className="text-[10px] text-slate-600">Add an image, headline, or shape to get started</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {layers.map((layer, index) => {
                const fabricObj = canvas?.getObjects().find(
                  (o, idx) => (o as unknown as { id?: string }).id === layer.id || idx === layer.zIndex
                );
                const isSelected = fabricObj && canvas?.getActiveObject() === fabricObj;
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                return (
                  <div
                    key={layer.id || index}
                    draggable={editingLayerId !== layer.id}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index.toString());
                      setDraggedIndex(index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverIndex !== index) {
                        setDragOverIndex(index);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverIndex === index) {
                        setDragOverIndex(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(index);
                    }}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    onClick={() => {
                      if (fabricObj && canvas) {
                        canvas.setActiveObject(fabricObj);
                        setSelectedObject(fabricObj);
                        canvas.renderAll();
                      }
                    }}
                    className={`group relative flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/50 text-white ring-1 ring-purple-500 shadow-md'
                        : 'border-slate-800/90 bg-slate-900/80 text-slate-300 hover:bg-slate-800/90 hover:text-white hover:border-slate-700'
                    } ${isDragging ? 'opacity-30 scale-[0.98]' : ''} ${
                      isDragOver ? 'border-t-2 border-t-purple-400 bg-purple-900/30' : ''
                    }`}
                  >
                    {/* Left: Drag Handle, Z-Index, Icon & Name */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
                      {/* Drag Handle */}
                      <div
                        className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-200 p-0.5 -ml-0.5 shrink-0"
                        title="Drag to reorder layer z-index"
                      >
                        <GripVertical size={13} />
                      </div>

                      {/* Z-index / Layer Number */}
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 w-3.5 text-center">
                        {layers.length - index}
                      </span>

                      {/* Layer Type Icon */}
                      <div className="shrink-0">{getLayerIcon(layer.type)}</div>

                      {/* Inline Rename or Name Display */}
                      {editingLayerId === layer.id && fabricObj ? (
                        <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingLayerName}
                            onChange={(e) => setEditingLayerName(e.target.value)}
                            onBlur={() => handleSaveRename(fabricObj)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(fabricObj);
                              if (e.key === 'Escape') setEditingLayerId(null);
                            }}
                            autoFocus
                            className="h-6 w-full rounded border border-purple-500 bg-slate-950 px-1.5 text-[11px] text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(fabricObj)}
                            className="p-1 text-emerald-400 hover:text-emerald-300 shrink-0"
                          >
                            <Check size={13} />
                          </button>
                        </div>
                      ) : (
                        <span
                          onDoubleClick={(e) => handleStartRename(layer, e)}
                          className="font-bold truncate max-w-[100px] hover:text-purple-300 transition"
                          title="Double-click to rename layer"
                        >
                          {layer.name}
                        </span>
                      )}
                    </div>

                    {/* Right: Actions Cluster (Step, Copy, Delete, Visibility, Lock) */}
                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Step Up / Down */}
                      {fabricObj && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleMoveStep(fabricObj, 'up', e)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Move forward"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleMoveStep(fabricObj, 'down', e)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Move backward"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </>
                      )}

                      {/* Copy / Duplicate Button */}
                      {fabricObj && (
                        <button
                          type="button"
                          onClick={(e) => handleDuplicateLayer(fabricObj, e)}
                          className="p-1 rounded text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition"
                          title="Duplicate / Copy layer"
                        >
                          <Copy size={12} />
                        </button>
                      )}

                      {/* Delete Button */}
                      {fabricObj && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteLayer(fabricObj, e)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete layer"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (fabricObj && canvas) {
                            fabricObj.set('visible', fabricObj.visible === false);
                            canvas.renderAll();
                            refreshLayers();
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                      >
                        {layer.visible ? <Eye size={13} /> : <EyeOff size={13} className="text-rose-400" />}
                      </button>

                      {/* Lock Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (fabricObj && canvas) {
                            const isLocked = Boolean(fabricObj.lockMovementX && fabricObj.lockMovementY);
                            fabricObj.set({
                              lockMovementX: !isLocked,
                              lockMovementY: !isLocked,
                              lockRotation: !isLocked,
                              lockScalingX: !isLocked,
                              lockScalingY: !isLocked,
                              selectable: isLocked, // unlocked means selectable
                            });
                            canvas.renderAll();
                            refreshLayers();
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                      >
                        {layer.locked ? <Lock size={13} className="text-amber-400" /> : <Unlock size={13} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
