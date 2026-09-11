'use client';

import React from 'react';
import {
  LayoutTemplate,
  Upload,
  Type,
  Shapes,
  Paintbrush,
  Sparkles,
  Sliders,
  Crop,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { TemplatesPanel } from './TemplatesPanel';
import { UploadPanel } from './UploadPanel';
import { TextPanel } from './TextPanel';
import { ElementsPanel } from './ElementsPanel';
import { FiltersPanel } from './FiltersPanel';
import { AdjustmentsPanel } from './AdjustmentsPanel';
import { CropPanel } from './CropPanel';
import { DrawPanel } from './DrawPanel';
import { PositionPanel } from './PositionPanel';
import type { ActiveTool } from '../../types/editor';

const TOOL_TABS: { id: ActiveTool; label: string; icon: React.ReactNode }[] = [
  { id: 'templates', label: 'Templates', icon: <LayoutTemplate size={18} /> },
  { id: 'upload', label: 'Upload', icon: <Upload size={18} /> },
  { id: 'text', label: 'Text', icon: <Type size={18} /> },
  { id: 'elements', label: 'Elements', icon: <Shapes size={18} /> },
  { id: 'draw', label: 'Draw', icon: <Paintbrush size={18} /> },
  { id: 'filters', label: 'Filters', icon: <Sparkles size={18} /> },
  { id: 'adjust', label: 'Adjust', icon: <Sliders size={18} /> },
  { id: 'crop', label: 'Crop', icon: <Crop size={18} /> },
];

export function LeftSidebar() {
  const {
    activeTool,
    setActiveTool,
    canvas,
    isLeftDrawerOpen,
    setIsLeftDrawerOpen,
    toggleLeftDrawer,
  } = useEditorStore();

  const handleTabClick = (tool: ActiveTool) => {
    if (canvas && tool !== 'draw' && canvas.isDrawingMode) {
      canvas.isDrawingMode = false;
    }
    if (activeTool === tool && isLeftDrawerOpen) {
      // Toggle drawer if clicking same tool
      setIsLeftDrawerOpen(false);
    } else {
      setActiveTool(tool);
      setIsLeftDrawerOpen(true);
    }
  };

  return (
    <aside className="relative flex h-full border-r border-slate-800/90 bg-slate-950 text-white select-none shrink-0 z-20 transition-all duration-200">
      {/* Primary Vertical Icon Dock */}
      <div className="flex w-15 sm:w-16 flex-col items-center justify-start border-r border-slate-800/80 bg-slate-950 py-2.5 sm:py-3 gap-1 shrink-0 z-10">
        {TOOL_TABS.map((tab) => {
          const isActive = activeTool === tab.id && isLeftDrawerOpen;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`group relative flex flex-col items-center justify-center h-13 w-12 sm:h-14 sm:w-13 rounded-2xl transition active:scale-95 ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50 shadow-md shadow-purple-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] sm:text-[10px] font-semibold mt-1 tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 sm:h-6 rounded-r bg-purple-500 shadow-lg shadow-purple-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Drawer / Active Tool Content (Overlay on mobile/tablet, inline on large screens) */}
      {isLeftDrawerOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            onClick={() => setIsLeftDrawerOpen(false)}
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-xs xl:hidden"
          />

          <div className="absolute left-15 sm:left-16 top-0 bottom-0 z-30 w-88 sm:w-96 md:w-[420px] xl:w-[440px] xl:relative xl:left-0 h-full bg-slate-900/98 backdrop-blur-xl overflow-y-auto border-r border-slate-800/80 shadow-2xl xl:shadow-none custom-scrollbar animate-in slide-in-from-left-4 duration-150">
            {/* Top Drawer Header with Close Button */}
            {activeTool !== 'position' && (
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/95 px-3.5 py-2.5 backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <span>{TOOL_TABS.find((t) => t.id === activeTool)?.label || 'Tool Drawer'}</span>
                </span>
                <button
                  type="button"
                  onClick={toggleLeftDrawer}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Close Drawer"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}

            <div className="p-1">
              {activeTool === 'templates' && <TemplatesPanel />}
              {activeTool === 'upload' && <UploadPanel />}
              {activeTool === 'text' && <TextPanel />}
              {activeTool === 'elements' && <ElementsPanel />}
              {activeTool === 'draw' && <DrawPanel />}
              {activeTool === 'filters' && <FiltersPanel />}
              {activeTool === 'adjust' && <AdjustmentsPanel />}
              {activeTool === 'crop' && <CropPanel />}
              {activeTool === 'position' && <PositionPanel />}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
