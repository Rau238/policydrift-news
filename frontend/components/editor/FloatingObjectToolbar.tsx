'use client';

import React, { useEffect, useState } from 'react';
import {
  Lock,
  Unlock,
  Copy,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  RotateCw,
  Move,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { duplicateActiveObject, deleteActiveObject } from '../../lib/editor/canvas';

interface FloatingObjectToolbarProps {
  onOpenContextMenu: (x: number, y: number) => void;
}

export function FloatingObjectToolbar({ onOpenContextMenu }: FloatingObjectToolbarProps) {
  const { canvas, selectedObject, refreshLayers, pushHistoryState } = useEditorStore();
  const [coords, setCoords] = useState<{
    topX: number;
    topY: number;
    bottomX: number;
    bottomY: number;
  } | null>(null);

  useEffect(() => {
    if (!canvas || !selectedObject) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      if (!selectedObject || !canvas) {
        setCoords(null);
        return;
      }
      try {
        const canvasEl = canvas.getElement();
        if (!canvasEl) return;
        const bound = selectedObject.getBoundingRect();
        const canvasRect = canvasEl.getBoundingClientRect();

        // Top Action Badge (Center top of bounding box)
        const topX = canvasRect.left + bound.left + bound.width / 2;
        const topY = Math.max(60, canvasRect.top + bound.top - 46);

        // Bottom Handles (Center bottom of bounding box)
        const bottomX = canvasRect.left + bound.left + bound.width / 2;
        const bottomY = canvasRect.top + bound.top + bound.height + 14;

        setCoords({ topX, topY, bottomX, bottomY });
      } catch {
        setCoords(null);
      }
    };

    updatePosition();

    canvas.on('object:moving', updatePosition);
    canvas.on('object:scaling', updatePosition);
    canvas.on('object:rotating', updatePosition);
    canvas.on('selection:updated', updatePosition);
    canvas.on('selection:cleared', () => setCoords(null));

    window.addEventListener('resize', updatePosition);

    return () => {
      canvas.off('object:moving', updatePosition);
      canvas.off('object:scaling', updatePosition);
      canvas.off('object:rotating', updatePosition);
      canvas.off('selection:updated', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [canvas, selectedObject]);

  if (!coords || !selectedObject || !canvas) return null;

  const isLocked = Boolean(selectedObject.lockMovementX && selectedObject.lockMovementY);

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateActiveObject(canvas);
    refreshLayers();
    pushHistoryState();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteActiveObject(canvas);
    refreshLayers();
    pushHistoryState();
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenContextMenu(coords.topX, coords.topY);
  };

  const handleRotate90 = (e: React.MouseEvent) => {
    e.stopPropagation();
    const curAngle = selectedObject.angle || 0;
    selectedObject.rotate((curAngle + 90) % 360);
    selectedObject.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  return (
    <>
      {/* Top Floating Action Badge (Exact Canva Pill) */}
      <div
        style={{
          position: 'fixed',
          left: coords.topX,
          top: coords.topY,
          transform: 'translate(-50%, 0)',
          zIndex: 45,
        }}
        className="flex items-center gap-1 rounded-2xl border border-slate-700/90 bg-slate-900/95 px-2 py-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 select-none text-white text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Comment Icon */}
        <button
          type="button"
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Add Note / Comment"
        >
          <MessageSquare size={13} />
        </button>

        {/* Lock Button */}
        <button
          type="button"
          onClick={handleToggleLock}
          className={`p-1.5 rounded-xl transition ${
            isLocked
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={isLocked ? 'Unlock layer' : 'Lock layer'}
        >
          {isLocked ? <Lock size={13} className="text-amber-400" /> : <Unlock size={13} />}
        </button>

        {/* Duplicate Button */}
        <button
          type="button"
          onClick={handleDuplicate}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Duplicate (Ctrl+D)"
        >
          <Copy size={13} />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={handleDelete}
          className="p-1.5 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-rose-950/40 transition"
          title="Delete (Del)"
        >
          <Trash2 size={13} />
        </button>

        {/* More Options Button */}
        <button
          type="button"
          onClick={handleMore}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition border-l border-slate-800 pl-1.5 ml-0.5"
          title="More options (Right-Click)"
        >
          <MoreHorizontal size={13} />
        </button>
      </div>

      {/* Bottom Circular Rotate & Move Buttons (Canva Style) */}
      <div
        style={{
          position: 'fixed',
          left: coords.bottomX,
          top: Math.min(coords.bottomY, window.innerHeight - 55),
          transform: 'translate(-50%, 0)',
          zIndex: 45,
        }}
        className="flex items-center gap-2 pointer-events-auto select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleRotate90}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 shadow-xl backdrop-blur-md transition active:scale-95"
          title="Rotate 90°"
        >
          <RotateCw size={13} />
        </button>

        <div
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-400 shadow-xl backdrop-blur-md cursor-grab active:cursor-grabbing"
          title="Drag to Move"
        >
          <Move size={13} />
        </div>
      </div>
    </>
  );
}
