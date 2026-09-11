'use client';

import React, { useState } from 'react';
import {
  Type,
  Plus,
  Search,
  Sparkles,
  Check,
  Flame,
  Quote,
  Layers,
  Sliders,
  CaseUpper,
  CaseSensitive,
  AlignLeft,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { CURATED_FONTS, applyFontToCanvas, type FontDefinition } from '../../lib/editor/fonts';
import { configureObjectControls } from '../../lib/editor/canvas';
import { fabric } from 'fabric';

export function TextPanel() {
  const { canvas, refreshLayers, pushHistoryState, project } = useEditorStore();
  const [fontSearch, setFontSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [appliedFontName, setAppliedFontName] = useState<string | null>(null);

  const addTextToCanvas = (
    text: string,
    options: Partial<fabric.ITextboxOptions>,
    customName: string
  ) => {
    if (!canvas) return;

    const defaultWidth = Math.min(Math.round(project.width * 0.75), 650);

    const textObj = new fabric.Textbox(text, {
      left: project.width / 2,
      top: project.height / 2,
      originX: 'center',
      originY: 'center',
      width: options.width || defaultWidth,
      fill: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      splitByGrapheme: false,
      lockUniScaling: false,
      ...options,
    });

    (textObj as unknown as { id: string; customName: string }).id = `text-${Date.now()}`;
    (textObj as unknown as { customName: string }).customName = customName;

    configureObjectControls(textObj);

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  const handleApplyFont = async (font: FontDefinition) => {
    setAppliedFontName(font.name);
    setTimeout(() => setAppliedFontName(null), 1500);

    const active = canvas?.getActiveObject();
    if (active && (active.type === 'i-text' || active.type === 'textbox' || active.type === 'text')) {
      await applyFontToCanvas(font, canvas, active);
      refreshLayers();
      pushHistoryState();
    } else {
      await applyFontToCanvas(font);
      addTextToCanvas(font.name, { fontFamily: font.family, fontSize: 44, fontWeight: 'bold' }, `${font.name} Text`);
    }
  };

  const CATEGORIES = ['All', 'Modern Sans', 'Editorial Serif', 'Bold Display', 'Condensed', 'Monospace', 'Handwriting'];

  const filteredFonts = CURATED_FONTS.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(fontSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(fontSearch.toLowerCase());
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 p-3.5 text-white select-none">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <Type size={14} className="text-purple-400" />
          <span>Add Typography</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Click any preset to add directly or select text on canvas to change font
        </p>
      </div>

      {/* Preset Typography Bundles */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() =>
            addTextToCanvas(
              'BREAKING HEADLINE',
              {
                fontSize: 64,
                fontWeight: '900',
                fontFamily: 'Inter, sans-serif',
                fill: '#ffffff',
                shadow: new fabric.Shadow({
                  color: 'rgba(0,0,0,0.8)',
                  blur: 15,
                  offsetX: 0,
                  offsetY: 4,
                }),
              },
              'Main Headline'
            )
          }
          className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-purple-500 hover:bg-slate-800 transition text-left group shadow-lg"
        >
          <div>
            <span className="block text-base font-black text-white group-hover:text-purple-300 transition">
              Headline Style
            </span>
            <span className="text-[10px] text-slate-400">Bold 64px with Cinema Drop Shadow</span>
          </div>
          <Plus size={16} className="text-slate-500 group-hover:text-purple-400 shrink-0 ml-2" />
        </button>

        <button
          type="button"
          onClick={() =>
            addTextToCanvas(
              'Important Policy Insight & Details',
              {
                fontSize: 34,
                fontWeight: '600',
                fill: '#2dd4bf',
                fontFamily: 'Montserrat, sans-serif',
              },
              'Subheading'
            )
          }
          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-teal-500 hover:bg-slate-800 transition text-left group"
        >
          <div>
            <span className="block text-sm font-semibold text-teal-300 group-hover:text-teal-200 transition">
              Subheading / Deck
            </span>
            <span className="text-[10px] text-slate-400">Medium 34px Highlight</span>
          </div>
          <Plus size={16} className="text-slate-500 group-hover:text-teal-400 shrink-0 ml-2" />
        </button>

        <button
          type="button"
          onClick={() =>
            addTextToCanvas(
              'Add detailed paragraph body text. Double click on canvas to type and edit anywhere.',
              {
                fontSize: 22,
                fontWeight: '400',
                fill: '#cbd5e1',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.35,
              },
              'Body Text'
            )
          }
          className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-blue-500 hover:bg-slate-800 transition text-left group"
        >
          <div>
            <span className="block text-xs text-slate-300 group-hover:text-blue-300 transition">
              Body Paragraph Text
            </span>
            <span className="text-[10px] text-slate-500">Regular 22px</span>
          </div>
          <Plus size={14} className="text-slate-500 group-hover:text-blue-400 shrink-0 ml-2" />
        </button>

        <button
          type="button"
          onClick={() =>
            addTextToCanvas(
              '“This policy shift marks a pivotal transformation.”',
              {
                fontSize: 32,
                fontStyle: 'italic',
                fontWeight: '500',
                fill: '#fcd34d',
                fontFamily: 'Playfair Display, serif',
              },
              'Quote Text'
            )
          }
          className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-amber-500 hover:bg-slate-800 transition text-left group"
        >
          <div>
            <span className="block text-xs font-serif italic text-amber-300 group-hover:text-amber-200 transition">
              Editorial Quote
            </span>
            <span className="text-[10px] text-slate-500">Playfair Serif Italic</span>
          </div>
          <Quote size={14} className="text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
        </button>
      </div>

      {/* Curated Google Fonts Section */}
      <div className="space-y-2.5 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles size={13} className="text-purple-400" />
            <span>Google Font Families ({CURATED_FONTS.length})</span>
          </label>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search fonts (e.g., Poppins, Bebas)..."
            value={fontSearch}
            onChange={(e) => setFontSearch(e.target.value)}
            className="h-8 w-full rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar text-[10px]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Fonts List with Live Preview and Apply Buttons */}
        <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {filteredFonts.map((f) => {
            const isJustApplied = appliedFontName === f.name;

            return (
              <div
                key={f.name}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/90 bg-slate-950/70 hover:border-purple-500/60 hover:bg-slate-900 transition"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <span
                    className="block text-sm font-semibold text-slate-100 truncate"
                    style={{ fontFamily: f.family }}
                  >
                    {f.name}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">{f.category}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyFont(f)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow ${
                    isJustApplied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600/30 text-purple-200 border border-purple-500/40 hover:bg-purple-600 hover:text-white'
                  }`}
                  title="Apply this font to selected text or add to canvas"
                >
                  {isJustApplied ? (
                    <>
                      <Check size={11} className="stroke-[3]" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <span>Apply Font</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
