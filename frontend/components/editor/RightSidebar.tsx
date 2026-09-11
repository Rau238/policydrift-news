'use client';

import React from 'react';
import { Sliders, ChevronRight, PanelRightOpen } from 'lucide-react';
import { PropertiesPanel } from './PropertiesPanel';
import { useEditorStore } from '../../store/editorStore';

export function RightSidebar() {
  const { isRightSidebarOpen, setIsRightSidebarOpen, toggleRightSidebar } = useEditorStore();

  if (!isRightSidebarOpen) {
    return (
      <aside className="relative flex flex-col items-center justify-start border-l border-slate-800/80 bg-slate-950 py-3 px-1.5 gap-2 select-none shrink-0 z-20">
        <button
          type="button"
          onClick={toggleRightSidebar}
          className="flex flex-col items-center justify-center h-12 w-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition shadow"
          title="Expand Properties Panel"
        >
          <PanelRightOpen size={16} />
        </button>

        <button
          type="button"
          onClick={() => setIsRightSidebarOpen(true)}
          className="flex flex-col items-center justify-center h-12 w-10 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-purple-400 transition"
          title="Inspect Properties"
        >
          <Sliders size={15} />
        </button>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      <div
        onClick={() => setIsRightSidebarOpen(false)}
        className="fixed inset-0 z-20 bg-black/50 backdrop-blur-xs xl:hidden"
      />

      <aside className="absolute right-0 top-0 bottom-0 z-30 w-72 sm:w-80 md:w-84 xl:relative xl:right-0 h-full border-l border-slate-800/90 bg-slate-950/98 text-white select-none shrink-0 flex flex-col shadow-2xl xl:shadow-none animate-in slide-in-from-right-4 duration-150">
        {/* Top Header & Collapse Handle */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-3.5 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Properties</h3>
          </div>

          <button
            type="button"
            onClick={toggleRightSidebar}
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Collapse Panel"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Properties Content */}
        <div className="flex-1 overflow-y-auto bg-slate-900/40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <PropertiesPanel />
        </div>
      </aside>
    </>
  );
}
