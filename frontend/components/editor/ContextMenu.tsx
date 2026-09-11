'use client';

import React, { useState } from 'react';
import {
  Copy,
  Clipboard,
  Trash2,
  Lock,
  Unlock,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  FlipHorizontal,
  FlipVertical,
  ChevronRight,
  Info,
  Maximize2,
  Paintbrush,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import {
  duplicateActiveObject,
  deleteActiveObject,
  bringObjectToFront,
  sendObjectToBack,
  bringObjectForward,
  sendObjectBackward,
} from '../../lib/editor/canvas';
import { fabric } from 'fabric';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const { canvas, selectedObject, refreshLayers, pushHistoryState, project } = useEditorStore();
  const [activeSubmenu, setActiveSubmenu] = useState<'layer' | 'align' | null>(null);

  if (!selectedObject && !canvas) return null;

  const isLocked = Boolean(selectedObject?.lockMovementX && selectedObject?.lockMovementY);

  const handleCopy = () => {
    if (!canvas || !selectedObject) return;
    selectedObject.clone((cloned: fabric.Object) => {
      (window as unknown as { _editorClipboard?: fabric.Object })._editorClipboard = cloned;
    });
    onClose();
  };

  const handlePaste = () => {
    if (!canvas) return;
    const clipboard = (window as unknown as { _editorClipboard?: fabric.Object })._editorClipboard;
    if (clipboard) {
      clipboard.clone((cloned: fabric.Object) => {
        canvas.discardActiveObject();
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20,
          evented: true,
        });
        if (cloned.type === 'activeSelection') {
          (cloned as fabric.ActiveSelection).canvas = canvas;
          (cloned as fabric.ActiveSelection).forEachObject((obj) => canvas.add(obj));
          cloned.setCoords();
        } else {
          canvas.add(cloned);
        }
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        refreshLayers();
        pushHistoryState();
      });
    }
    onClose();
  };

  const handleDuplicate = () => {
    if (canvas) {
      duplicateActiveObject(canvas);
      refreshLayers();
      pushHistoryState();
    }
    onClose();
  };

  const handleDelete = () => {
    if (canvas) {
      deleteActiveObject(canvas);
      refreshLayers();
      pushHistoryState();
    }
    onClose();
  };

  const handleToggleLock = () => {
    if (!selectedObject || !canvas) return;
    const nextLocked = !isLocked;
    selectedObject.set({
      lockMovementX: nextLocked,
      lockMovementY: nextLocked,
      lockRotation: nextLocked,
      lockScalingX: nextLocked,
      lockScalingY: nextLocked,
    });
    canvas.renderAll();
    refreshLayers();
    onClose();
  };

  const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!selectedObject || !canvas) return;
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
    onClose();
  };

  const handleFlip = (dir: 'h' | 'v') => {
    if (!selectedObject || !canvas) return;
    if (dir === 'h') selectedObject.set('flipX', !selectedObject.flipX);
    if (dir === 'v') selectedObject.set('flipY', !selectedObject.flipY);
    selectedObject.setCoords();
    canvas.renderAll();
    pushHistoryState();
    onClose();
  };

  const handleSendToBackground = () => {
    if (!selectedObject || !canvas) return;
    const targetW = project.width;
    const targetH = project.height;
    const scaleX = targetW / (selectedObject.width || 1);
    const scaleY = targetH / (selectedObject.height || 1);
    const scale = Math.max(scaleX, scaleY);
    selectedObject.scale(scale);
    selectedObject.set({
      left: (targetW - (selectedObject.getScaledWidth() || 0)) / 2,
      top: (targetH - (selectedObject.getScaledHeight() || 0)) / 2,
    });
    selectedObject.setCoords();
    canvas.sendToBack(selectedObject);
    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
    onClose();
  };

  // Keep menu within viewport bounds
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 220),
    top: Math.min(y, window.innerHeight - 340),
    zIndex: 100,
  };

  return (
    <div
      style={menuStyle}
      className="w-56 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-1.5 text-xs text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-0.5">
        {/* Copy */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white transition"
        >
          <div className="flex items-center gap-2">
            <Copy size={14} className="text-slate-400" />
            <span>Copy</span>
          </div>
          <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+C</kbd>
        </button>

        {/* Paste */}
        <button
          type="button"
          onClick={handlePaste}
          className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white transition"
        >
          <div className="flex items-center gap-2">
            <Clipboard size={14} className="text-slate-400" />
            <span>Paste</span>
          </div>
          <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+V</kbd>
        </button>

        {/* Duplicate */}
        <button
          type="button"
          onClick={handleDuplicate}
          className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white transition"
        >
          <div className="flex items-center gap-2">
            <Copy size={14} className="text-purple-400" />
            <span>Duplicate</span>
          </div>
          <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+D</kbd>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 hover:bg-rose-950/60 text-rose-300 hover:text-rose-200 transition"
        >
          <div className="flex items-center gap-2">
            <Trash2 size={14} className="text-rose-400" />
            <span>Delete</span>
          </div>
          <kbd className="text-[10px] text-slate-500 font-mono">Del</kbd>
        </button>

        <div className="my-1 border-t border-slate-800" />

        {/* Layer Submenu */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('layer')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white transition"
          >
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-blue-400" />
              <span>Layer</span>
            </div>
            <ChevronRight size={14} className="text-slate-500" />
          </button>

          {activeSubmenu === 'layer' && (
            <div className="absolute left-full top-0 ml-1 w-44 rounded-xl border border-slate-700/80 bg-slate-900/95 p-1 text-xs text-white shadow-2xl backdrop-blur-xl space-y-0.5 z-50">
              <button
                type="button"
                onClick={() => {
                  if (canvas) bringObjectToFront(canvas);
                  onClose();
                }}
                className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                <span>Bring to front</span>
                <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+]</kbd>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (canvas) bringObjectForward(canvas);
                  onClose();
                }}
                className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                <span>Bring forward</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (canvas) sendObjectBackward(canvas);
                  onClose();
                }}
                className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                <span>Send backward</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (canvas) sendObjectToBack(canvas);
                  onClose();
                }}
                className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                <span>Send to back</span>
                <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+[</kbd>
              </button>
            </div>
          )}
        </div>

        {/* Align to Page Submenu */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('align')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white transition"
          >
            <div className="flex items-center gap-2">
              <AlignHorizontalJustifyCenter size={14} className="text-teal-400" />
              <span>Align to page</span>
            </div>
            <ChevronRight size={14} className="text-slate-500" />
          </button>

          {activeSubmenu === 'align' && (
            <div className="absolute left-full top-0 ml-1 w-40 rounded-xl border border-slate-700/80 bg-slate-900/95 p-1 text-xs text-white shadow-2xl backdrop-blur-xl space-y-0.5 z-50">
              <button
                type="button"
                onClick={() => handleAlign('top')}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                <span>Top</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlign('middle')}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                <span>Middle</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlign('bottom')}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                <span>Bottom</span>
              </button>
              <div className="my-1 border-t border-slate-800" />
              <button
                type="button"
                onClick={() => handleAlign('left')}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                <span>Left</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlign('center')}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                <span>Center</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlign('right')}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                <span>Right</span>
              </button>
            </div>
          )}
        </div>

        <div className="my-1 border-t border-slate-800" />

        {/* Lock / Unlock */}
        <button
          type="button"
          onClick={handleToggleLock}
          className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white transition"
        >
          <div className="flex items-center gap-2">
            {isLocked ? (
              <Unlock size={14} className="text-amber-400" />
            ) : (
              <Lock size={14} className="text-amber-400" />
            )}
            <span>{isLocked ? 'Unlock' : 'Lock'}</span>
          </div>
          <kbd className="text-[10px] text-slate-500 font-mono">Alt+Shift+L</kbd>
        </button>

        {/* Set as Background (for Image) */}
        {selectedObject?.type === 'image' && (
          <button
            type="button"
            onClick={handleSendToBackground}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-slate-800 text-teal-300 hover:text-teal-200 transition"
          >
            <Maximize2 size={14} />
            <span>Set image as background</span>
          </button>
        )}
      </div>
    </div>
  );
}
