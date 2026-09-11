'use client';

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Layers,
  Edit2,
  Check,
  GripVertical,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { LayerItem } from '../../types/editor';

export function LayersPanel() {
  const { canvas, layers, refreshLayers, pushHistoryState, setSelectedObject } = useEditorStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!canvas) {
    return (
      <div className="p-4 text-center text-xs text-slate-500">
        Canvas not initialized
      </div>
    );
  }

  const objects = canvas.getObjects();

  const handleSelectLayer = (layer: LayerItem) => {
    const target = objects[layer.zIndex];
    if (target) {
      canvas.setActiveObject(target);
      setSelectedObject(target);
      canvas.renderAll();
    }
  };

  const handleToggleVisibility = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = objects[layer.zIndex];
    if (target) {
      target.visible = !target.visible;
      if (!target.visible && canvas.getActiveObject() === target) {
        canvas.discardActiveObject();
      }
      canvas.renderAll();
      refreshLayers();
      pushHistoryState();
    }
  };

  const handleToggleLock = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = objects[layer.zIndex];
    if (target) {
      const isLocked = !layer.locked;
      target.lockMovementX = isLocked;
      target.lockMovementY = isLocked;
      target.lockRotation = isLocked;
      target.lockScalingX = isLocked;
      target.lockScalingY = isLocked;
      target.selectable = !isLocked;
      if (isLocked && canvas.getActiveObject() === target) {
        canvas.discardActiveObject();
      }
      canvas.renderAll();
      refreshLayers();
      pushHistoryState();
    }
  };

  const handleDeleteLayer = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = objects[layer.zIndex];
    if (target) {
      canvas.remove(target);
      canvas.discardActiveObject();
      canvas.renderAll();
      refreshLayers();
      pushHistoryState();
    }
  };

  const handleDuplicateLayer = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = objects[layer.zIndex];
    if (target) {
      target.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (target.left || 0) + 20,
          top: (target.top || 0) + 20,
          evented: true,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
        refreshLayers();
        pushHistoryState();
      });
    }
  };

  const handleMoveUp = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = objects[layer.zIndex];
    if (target) {
      canvas.bringForward(target);
      canvas.renderAll();
      refreshLayers();
      pushHistoryState();
    }
  };

  const handleMoveDown = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = objects[layer.zIndex];
    if (target) {
      canvas.sendBackwards(target);
      canvas.renderAll();
      refreshLayers();
      pushHistoryState();
    }
  };

  const handleRenameSubmit = (layer: LayerItem) => {
    const target = objects[layer.zIndex];
    if (target && nameInput.trim()) {
      (target as unknown as { customName?: string }).customName = nameInput.trim();
      refreshLayers();
    }
    setEditingId(null);
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'i-text':
      case 'textbox':
      case 'text':
        return <Type size={13} className="text-purple-400" />;
      case 'image':
        return <ImageIcon size={13} className="text-blue-400" />;
      case 'rect':
        return <Square size={13} className="text-amber-400" />;
      case 'circle':
        return <Circle size={13} className="text-teal-400" />;
      default:
        return <Layers size={13} className="text-slate-400" />;
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex || !canvas) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const total = objects.length;
    if (total <= 1) return;

    const sourceLayer = layers[draggedIndex];
    if (!sourceLayer) return;

    const targetObj = objects[sourceLayer.zIndex];
    if (targetObj) {
      const targetFabricIndex = Math.max(0, Math.min(total - 1, total - 1 - targetIndex));
      canvas.moveTo(targetObj, targetFabricIndex);
      canvas.setActiveObject(targetObj);
      canvas.renderAll();
      refreshLayers();
      pushHistoryState();
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const activeObject = canvas.getActiveObject();

  return (
    <div className="flex flex-col h-full space-y-2 p-3 text-white select-none">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Layers size={14} className="text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Layers</h3>
        </div>
        <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
          {layers.length} {layers.length === 1 ? 'layer' : 'layers'}
        </span>
      </div>

      {layers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
          <Layers size={32} className="mb-2 opacity-30 stroke-[1.5]" />
          <p className="text-xs font-semibold">No layers on canvas</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Add an image, text, or shape to start</p>
        </div>
      ) : (
        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
          {layers.map((layer, index) => {
            const isSelected = activeObject && objects[layer.zIndex] === activeObject;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={layer.id}
                draggable={editingId !== layer.id}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                  setDraggedIndex(index);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverIndex !== index) setDragOverIndex(index);
                }}
                onDragLeave={() => {
                  if (dragOverIndex === index) setDragOverIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(index);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onClick={() => handleSelectLayer(layer)}
                className={`group flex items-center justify-between gap-1.5 rounded-xl border px-2 py-1.5 text-xs transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500/80 bg-blue-950/40 text-blue-200 shadow-sm'
                    : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70'
                } ${isDragging ? 'opacity-30 scale-[0.98]' : ''} ${
                  isDragOver ? 'border-t-2 border-t-blue-400 bg-blue-900/30' : ''
                }`}
              >
                {/* Left: Drag Handle, Icon & Name */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <div
                    className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-0.5 shrink-0"
                    title="Drag to reorder layer z-index"
                  >
                    <GripVertical size={13} />
                  </div>
                  <div className="shrink-0">{getLayerIcon(layer.type)}</div>

                  {editingId === layer.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onBlur={() => handleRenameSubmit(layer)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(layer)}
                        autoFocus
                        className="h-6 w-full rounded border border-blue-500 bg-slate-950 px-1.5 text-[11px] text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRenameSubmit(layer)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate text-xs font-medium text-slate-200">
                      {layer.name}
                    </span>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                  {/* Visibility */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleVisibility(layer, e)}
                    className={`p-1 rounded hover:bg-slate-800 ${
                      layer.visible ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                    }`}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>

                  {/* Lock */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleLock(layer, e)}
                    className={`p-1 rounded hover:bg-slate-800 ${
                      layer.locked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                    }`}
                    title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                  >
                    {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>

                  {/* Move Up / Down */}
                  <button
                    type="button"
                    onClick={(e) => handleMoveUp(layer, e)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Bring Forward"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleMoveDown(layer, e)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Send Backward"
                  >
                    <ChevronDown size={12} />
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={(e) => handleDuplicateLayer(layer, e)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Duplicate Layer"
                  >
                    <Copy size={12} />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteLayer(layer, e)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete Layer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
