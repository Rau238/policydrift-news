'use client';

import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'General' | 'Selection & Layers' | 'Transform & Canvas' | 'Navigation';
}

const SHORTCUTS: ShortcutItem[] = [
  // General
  { keys: ['Ctrl', 'Z'], description: 'Undo last action', category: 'General' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo last action', category: 'General' },
  { keys: ['Ctrl', 'S'], description: 'Save project copy locally', category: 'General' },
  { keys: ['Ctrl', 'E'], description: 'Open export dialog', category: 'General' },
  { keys: ['?'], description: 'Open keyboard shortcuts', category: 'General' },

  // Selection & Layers
  { keys: ['Ctrl', 'D'], description: 'Duplicate active object', category: 'Selection & Layers' },
  { keys: ['Del', 'Backspace'], description: 'Delete active object', category: 'Selection & Layers' },
  { keys: ['Ctrl', 'A'], description: 'Select all canvas objects', category: 'Selection & Layers' },
  { keys: ['Esc'], description: 'Deselect all objects', category: 'Selection & Layers' },
  { keys: ['Ctrl', ']'], description: 'Bring layer forward / to front', category: 'Selection & Layers' },
  { keys: ['Ctrl', '['], description: 'Send layer backward / to back', category: 'Selection & Layers' },

  // Transform & Canvas
  { keys: ['↑', '↓', '←', '→'], description: 'Nudge object by 1 pixel', category: 'Transform & Canvas' },
  { keys: ['Shift', 'Arrows'], description: 'Nudge object by 10 pixels', category: 'Transform & Canvas' },
  { keys: ['Side Handles (ML/MR)'], description: 'Wrap & resize text bounding box', category: 'Transform & Canvas' },
  { keys: ['Corner Handles'], description: 'Proportionally scale width & height', category: 'Transform & Canvas' },

  // Navigation
  { keys: ['Space', 'Drag'], description: 'Pan viewport across canvas', category: 'Navigation' },
  { keys: ['Ctrl', '+ / -'], description: 'Zoom canvas in or out', category: 'Navigation' },
  { keys: ['Mouse Wheel'], description: 'Zoom with scroll wheel', category: 'Navigation' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const categories = ['General', 'Selection & Layers', 'Transform & Canvas', 'Navigation'] as const;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-5 text-white space-y-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
              <Keyboard size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Keyboard Shortcuts & Gestures</h3>
              <p className="text-[11px] text-slate-400">Master studio editing with speed shortcuts</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts List by Category */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs">
          {categories.map((cat) => {
            const items = SHORTCUTS.filter((s) => s.category === cat);
            return (
              <div key={cat} className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  {cat}
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 divide-y divide-slate-800/60">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-800/40 transition"
                    >
                      <span className="text-xs">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, ki) => (
                          <kbd
                            key={ki}
                            className="px-1.5 py-0.5 rounded-md border border-slate-700 bg-slate-800 text-[10px] font-mono font-bold text-slate-200 shadow-sm"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
