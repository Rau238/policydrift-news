'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutTemplate,
  Sparkles,
  Bookmark,
  Smartphone,
  Monitor,
  Square,
  Check,
  Save,
  Plus,
  Trash2,
  Download,
  Upload,
  Clock,
  FolderHeart,
  Tag,
  Search,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import {
  configureObjectControls,
  addBottomGradientSplash,
  BOTTOM_SPLASH_PRESETS,
} from '../../lib/editor/canvas';
import {
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  loadTemplateOntoCanvas,
  exportTemplateToJson,
  importTemplateFromJson,
  type CustomTemplate,
} from '../../lib/editor/templates';
import { exportCanvasToDataURL } from '../../lib/editor/export';
import { fabric } from 'fabric';

interface PreMadeTemplate {
  id: string;
  name: string;
  category: string;
  ratio: string;
  width: number;
  height: number;
  badge: string;
  icon: React.ReactNode;
  bgGradient: string;
  apply: (canvas: fabric.Canvas, project: { width: number; height: number; title: string }) => void;
}

export function TemplatesPanel() {
  const {
    canvas,
    project,
    setProject,
    pushHistoryState,
    refreshLayers,
    setZoom,
    onApplyCallback,
    onCloseCallback,
  } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'premade' | 'saved' | 'ratios'>('premade');
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Social Media');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom templates from localStorage
  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);

  const refreshTemplates = () => {
    setCustomTemplates(getCustomTemplates());
  };

  const handleSaveCurrentAsTemplate = () => {
    if (!canvas) return;
    const name = newTemplateName.trim() || project.title || 'Custom Template';

    let thumb: string | undefined = undefined;
    try {
      thumb = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.6,
        multiplier: 0.25,
      });
    } catch {
      // ignore
    }

    const canvasJson = canvas.toJSON([
      'id',
      'customName',
      'locked',
      'selectable',
      'rx',
      'ry',
      'strokeDashArray',
      'stroke',
      'strokeWidth',
      'shadow',
      'lineHeight',
      'charSpacing',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'fontStyle',
      'textAlign',
      'fill',
      'opacity',
    ]);

    saveCustomTemplate({
      name,
      category: newTemplateCategory,
      width: project.width,
      height: project.height,
      backgroundColor: project.backgroundColor,
      thumbnailUrl: thumb,
      canvasData: canvasJson,
    });

    refreshTemplates();
    setIsSavingModalOpen(false);
    setNewTemplateName('');
    setSavedSuccessMsg('Template saved successfully!');
    setTimeout(() => setSavedSuccessMsg(''), 2500);
    setActiveTab('saved');
  };

  const handleLoadCustomTemplate = async (tmpl: CustomTemplate) => {
    if (!canvas) return;
    await loadTemplateOntoCanvas(canvas, tmpl, setProject, setZoom, refreshLayers, pushHistoryState);
  };

  const handleApplyCurrentToArticle = () => {
    if (!canvas) return;
    try {
      const dataUrl = exportCanvasToDataURL(canvas, {
        format: 'png',
        multiplier: 2,
        quality: 1,
      });

      if (onApplyCallback) {
        onApplyCallback(dataUrl);
      } else {
        try {
          localStorage.setItem('article_applied_image', dataUrl);
          localStorage.setItem('article_applied_timestamp', Date.now().toString());
          if (typeof navigator !== 'undefined') {
            navigator.clipboard?.writeText(dataUrl).catch(() => {});
          }
        } catch {
          // ignore
        }
      }

      setSavedSuccessMsg('Applied to Article! Returning...');
      setTimeout(() => {
        setSavedSuccessMsg('');
        if (onCloseCallback) {
          onCloseCallback();
        }
      }, 500);
    } catch (err) {
      console.error('Failed to apply graphic to article:', err);
    }
  };

  const handleLoadAndApplyTemplate = async (tmpl: CustomTemplate) => {
    if (!canvas) return;
    await loadTemplateOntoCanvas(canvas, tmpl, setProject, setZoom, refreshLayers, pushHistoryState);
    setTimeout(() => {
      handleApplyCurrentToArticle();
    }, 200);
  };

  const handleApplyPreMadeToArticle = (tmpl: PreMadeTemplate) => {
    applyPreMadeTemplate(tmpl);
    setTimeout(() => {
      handleApplyCurrentToArticle();
    }, 200);
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this template?')) {
      deleteCustomTemplate(id);
      refreshTemplates();
    }
  };

  const handleExportTemplate = (tmpl: CustomTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    exportTemplateToJson(tmpl);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        importTemplateFromJson(text);
        refreshTemplates();
        setActiveTab('saved');
        setSavedSuccessMsg('Template imported successfully!');
        setTimeout(() => setSavedSuccessMsg(''), 2500);
      } catch (err) {
        alert('Invalid template JSON file: ' + (err instanceof Error ? err.message : ''));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const applyAspectRatio = (w: number, h: number) => {
    if (!canvas) return;
    setProject({ width: w, height: h });
    canvas.setWidth(w);
    canvas.setHeight(h);

    const parent = canvas.getElement()?.parentElement;
    if (parent) {
      const containerW = parent.clientWidth - 48;
      const containerH = parent.clientHeight - 48;
      const scale = Math.min(containerW / w, containerH / h, 1.0);
      setZoom(scale);
      canvas.setZoom(scale);
    }

    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  const applyPreMadeTemplate = (tmpl: PreMadeTemplate) => {
    if (!canvas) return;

    setProject({
      width: tmpl.width,
      height: tmpl.height,
    });
    canvas.setWidth(tmpl.width);
    canvas.setHeight(tmpl.height);

    canvas.clear();
    canvas.backgroundColor = '#0f172a';

    tmpl.apply(canvas, {
      width: tmpl.width,
      height: tmpl.height,
      title: project.title || 'Breaking Headline News & Analysis',
    });

    const parent = canvas.getElement()?.parentElement;
    if (parent) {
      const scale = Math.min(
        (parent.clientWidth - 48) / tmpl.width,
        (parent.clientHeight - 48) / tmpl.height,
        1.0
      );
      setZoom(scale);
      canvas.setZoom(scale);
    }

    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  const PRE_MADE_TEMPLATES: PreMadeTemplate[] = [
    {
      id: 'modern_news',
      name: 'Modern News Card',
      category: 'Social Media',
      ratio: '1.91:1',
      width: 1200,
      height: 628,
      badge: 'Popular',
      icon: <LayoutTemplate size={15} className="text-blue-400" />,
      bgGradient: 'from-blue-600/30 to-indigo-950',
      apply: (c, p) => {
        c.backgroundColor = '#0b0f19';
        addBottomGradientSplash(c, p.width, p.height, BOTTOM_SPLASH_PRESETS[0], 0.75);

        const badgeBg = new fabric.Rect({
          left: 60,
          top: 60,
          width: 140,
          height: 36,
          rx: 18,
          ry: 18,
          fill: '#ef4444',
          customName: 'Category Pill',
        } as fabric.IRectOptions & { customName: string });
        c.add(badgeBg);

        const badgeText = new fabric.IText('POLITICS', {
          left: 130,
          top: 78,
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#ffffff',
          fontFamily: 'Inter',
          originX: 'center',
          originY: 'center',
          customName: 'Category Label',
        } as fabric.ITextOptions & { customName: string });
        c.add(badgeText);

        const headline = new fabric.Textbox(p.title || 'Global Climate Policy Shift Signals Clean Energy Era', {
          left: 60,
          top: 130,
          width: p.width - 120,
          fontSize: 52,
          fontWeight: 'bold',
          fill: '#ffffff',
          fontFamily: 'Inter',
          lineHeight: 1.15,
          customName: 'Headline Text',
        } as fabric.ITextboxOptions & { customName: string });
        configureObjectControls(headline);
        c.add(headline);

        const footerText = new fabric.IText('NEWSFREE365 • BREAKING INSIGHTS', {
          left: 60,
          top: p.height - 70,
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#94a3b8',
          fontFamily: 'Inter',
          customName: 'Footer Brand',
        } as fabric.ITextOptions & { customName: string });
        c.add(footerText);
      },
    },
    {
      id: 'sports_matchday',
      name: 'Sports Matchday Poster',
      category: 'Sports',
      ratio: '4:5',
      width: 1080,
      height: 1350,
      badge: 'Matchday',
      icon: <Sparkles size={15} className="text-emerald-400" />,
      bgGradient: 'from-emerald-600/30 to-teal-950',
      apply: (c, p) => {
        c.backgroundColor = '#064e3b';
        addBottomGradientSplash(c, p.width, p.height, BOTTOM_SPLASH_PRESETS[2], 0.85);

        // Center circular badge with hash
        const circle = new fabric.Circle({
          left: p.width / 2,
          top: 400,
          radius: 120,
          fill: 'rgba(20, 184, 166, 0.45)',
          stroke: '#14b8a6',
          strokeWidth: 4,
          originX: 'center',
          originY: 'center',
          customName: 'Center Emblem Circle',
        } as fabric.ICircleOptions & { customName: string });
        c.add(circle);

        const hash = new fabric.IText('#', {
          left: p.width / 2,
          top: 400,
          fontSize: 140,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: 'Inter',
          originX: 'center',
          originY: 'center',
          customName: 'Matchday Emblem Hash',
        } as fabric.ITextOptions & { customName: string });
        c.add(hash);

        // Category Tag
        const tag = new fabric.Rect({
          left: 80,
          top: 600,
          width: 130,
          height: 38,
          rx: 19,
          ry: 19,
          fill: '#3b82f6',
          customName: 'Sports Tag Pill',
        } as fabric.IRectOptions & { customName: string });
        c.add(tag);

        const tagText = new fabric.IText('SPORTS', {
          left: 145,
          top: 619,
          fontSize: 15,
          fontWeight: 'bold',
          fill: '#ffffff',
          fontFamily: 'Inter',
          originX: 'center',
          originY: 'center',
          customName: 'Tag Text',
        } as fabric.ITextOptions & { customName: string });
        c.add(tagText);

        const sub = new fabric.IText('News desk coverage', {
          left: p.width / 2,
          top: 690,
          fontSize: 26,
          fontWeight: '600',
          fill: '#94a3b8',
          fontFamily: 'Inter',
          originX: 'center',
          originY: 'center',
          customName: 'Desk Coverage',
        } as fabric.ITextOptions & { customName: string });
        c.add(sub);

        const matchTitle = new fabric.Textbox('Gillingham v Tranmere Rovers', {
          left: 80,
          top: 760,
          width: p.width - 160,
          fontSize: 58,
          fontWeight: 'bold',
          fill: '#ffffff',
          fontFamily: 'Georgia',
          customName: 'Matchday Teams',
        } as fabric.ITextboxOptions & { customName: string });
        configureObjectControls(matchTitle);
        c.add(matchTitle);

        const domain = new fabric.IText('policydrift.com', {
          left: 80,
          top: 860,
          fontSize: 22,
          fontWeight: 'bold',
          fill: '#64748b',
          fontFamily: 'Inter',
          customName: 'Website Domain',
        } as fabric.ITextOptions & { customName: string });
        c.add(domain);
      },
    },
    {
      id: 'breaking_alert',
      name: 'Breaking News Alert',
      category: 'Breaking',
      ratio: '1:1',
      width: 1080,
      height: 1080,
      badge: 'Hot',
      icon: <Sparkles size={15} className="text-red-400" />,
      bgGradient: 'from-red-600/30 to-slate-950',
      apply: (c, p) => {
        c.backgroundColor = '#0a0a0c';
        addBottomGradientSplash(c, p.width, p.height, BOTTOM_SPLASH_PRESETS[4], 0.8);

        const bar = new fabric.Rect({
          left: 0,
          top: 0,
          width: p.width,
          height: 80,
          fill: '#dc2626',
          customName: 'Breaking Banner Bar',
        } as fabric.IRectOptions & { customName: string });
        c.add(bar);

        const barText = new fabric.IText('BREAKING NEWS ALERT', {
          left: p.width / 2,
          top: 40,
          fontSize: 28,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: 'Inter',
          originX: 'center',
          originY: 'center',
          customName: 'Breaking Label',
        } as fabric.ITextOptions & { customName: string });
        c.add(barText);

        const title = new fabric.Textbox(p.title || 'Urgent Developments: Supreme Court Delivers Landmark Ruling', {
          left: 70,
          top: 170,
          width: p.width - 140,
          fontSize: 64,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: 'Inter',
          lineHeight: 1.1,
          customName: 'Headline Text',
        } as fabric.ITextboxOptions & { customName: string });
        configureObjectControls(title);
        c.add(title);
      },
    },
    {
      id: 'quote_card',
      name: 'Executive Quote Card',
      category: 'Editorial',
      ratio: '1.91:1',
      width: 1200,
      height: 628,
      badge: 'Editorial',
      icon: <Bookmark size={15} className="text-amber-400" />,
      bgGradient: 'from-amber-600/30 to-slate-950',
      apply: (c, p) => {
        c.backgroundColor = '#0f172a';
        addBottomGradientSplash(c, p.width, p.height, BOTTOM_SPLASH_PRESETS[3], 0.7);

        const quoteSymbol = new fabric.IText('“', {
          left: 60,
          top: 60,
          fontSize: 160,
          fontWeight: 'bold',
          fill: 'rgba(245, 158, 11, 0.3)',
          fontFamily: 'Georgia',
          selectable: false,
          customName: 'Quote Symbol',
        } as fabric.ITextOptions & { customName: string });
        c.add(quoteSymbol);

        const quoteBody = new fabric.Textbox(
          '"The decisions made in this policy cycle will define the next decade of public governance and digital rights."',
          {
            left: 70,
            top: 240,
            width: p.width - 140,
            fontSize: 38,
            fontStyle: 'italic',
            fill: '#f8fafc',
            fontFamily: 'Georgia',
            lineHeight: 1.35,
            customName: 'Quote Body',
          } as fabric.ITextboxOptions & { customName: string }
        );
        configureObjectControls(quoteBody);
        c.add(quoteBody);

        const author = new fabric.IText('— Chief Policy Director, Global Forum', {
          left: 70,
          top: 480,
          fontSize: 20,
          fontWeight: 'bold',
          fill: '#f59e0b',
          fontFamily: 'Inter',
          customName: 'Quote Author',
        } as fabric.ITextOptions & { customName: string });
        c.add(author);
      },
    },
    {
      id: 'tech_alert',
      name: 'Tech & AI Trend Story',
      category: 'Technology',
      ratio: '9:16',
      width: 1080,
      height: 1920,
      badge: 'Reel/Story',
      icon: <Smartphone size={15} className="text-purple-400" />,
      bgGradient: 'from-purple-600/30 to-slate-950',
      apply: (c, p) => {
        c.backgroundColor = '#090d16';
        addBottomGradientSplash(c, p.width, p.height, BOTTOM_SPLASH_PRESETS[1], 0.85);

        const pill = new fabric.Rect({
          left: 80,
          top: 160,
          width: 220,
          height: 48,
          rx: 24,
          ry: 24,
          fill: '#a855f7',
          customName: 'Tech Pill',
        } as fabric.IRectOptions & { customName: string });
        c.add(pill);

        const pillText = new fabric.IText('AI & TECHNOLOGY', {
          left: 190,
          top: 184,
          fontSize: 18,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: 'Inter',
          originX: 'center',
          originY: 'center',
          customName: 'Tech Pill Text',
        } as fabric.ITextOptions & { customName: string });
        c.add(pillText);

        const title = new fabric.Textbox(p.title || 'Next-Gen Models Transform Enterprise Automation Worldwide', {
          left: 80,
          top: 280,
          width: p.width - 160,
          fontSize: 72,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: 'Inter',
          lineHeight: 1.15,
          customName: 'Story Headline',
        } as fabric.ITextboxOptions & { customName: string });
        configureObjectControls(title);
        c.add(title);
      },
    },
  ];

  const ASPECT_PRESETS = [
    { label: 'Social Banner (1.91:1)', w: 1200, h: 628, icon: <Monitor size={14} /> },
    { label: 'Square Post (1:1)', w: 1080, h: 1080, icon: <Square size={14} /> },
    { label: 'Portrait Feed (4:5)', w: 1080, h: 1350, icon: <Bookmark size={14} /> },
    { label: 'Story / Reel (9:16)', w: 1080, h: 1920, icon: <Smartphone size={14} /> },
    { label: 'Landscape HD (16:9)', w: 1920, h: 1080, icon: <Monitor size={14} /> },
  ];

  const filteredCustom = customTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3.5 space-y-4 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Sparkles size={14} className="text-purple-400" />
            <span>Templates Studio</span>
          </h3>
          <p className="text-[10px] text-slate-400">Save custom templates & instant layouts</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setNewTemplateName(project.title || 'My Design Template');
              setIsSavingModalOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl border border-purple-800/80 bg-purple-950/70 hover:bg-purple-900 text-purple-200 text-[11px] font-bold shadow transition active:scale-95"
            title="Save current design as a reusable custom template"
          >
            <Save size={12} />
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={handleApplyCurrentToArticle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:opacity-95 text-white text-[11px] font-bold shadow-md transition active:scale-95"
            title="Apply current graphic directly to article and return to article modal"
          >
            <Send size={12} />
            <span>Apply to Article</span>
          </button>
        </div>
      </div>

      {savedSuccessMsg && (
        <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
          <Check size={14} />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Save Template Modal / Dropdown Box */}
      {isSavingModalOpen && (
        <div className="p-3 rounded-2xl border border-purple-500/40 bg-slate-900 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <Save size={13} className="text-purple-400" />
              <span>Save Current Canvas as Template</span>
            </span>
            <button
              type="button"
              onClick={() => setIsSavingModalOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block">Template Name</label>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="e.g. Breaking News Instagram Card"
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-white outline-none focus:border-purple-500"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block">Category</label>
            <select
              value={newTemplateCategory}
              onChange={(e) => setNewTemplateCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-white outline-none focus:border-purple-500"
            >
              <option value="Social Media">Social Media</option>
              <option value="Breaking News">Breaking News</option>
              <option value="Sports">Sports</option>
              <option value="Quote Card">Quote Card</option>
              <option value="Technology">Technology</option>
              <option value="YouTube Thumbnail">YouTube Thumbnail</option>
              <option value="Banner">Banner</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>
              Canvas: {project.width}×{project.height}px
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsSavingModalOpen(false)}
                className="px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsTemplate}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold shadow"
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800 gap-0.5">
        <button
          type="button"
          onClick={() => setActiveTab('premade')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${
            activeTab === 'premade' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Pre-made ({PRE_MADE_TEMPLATES.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 ${
            activeTab === 'saved' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderHeart size={11} />
          <span>My Templates ({customTemplates.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ratios')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${
            activeTab === 'ratios' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sizes
        </button>
      </div>

      {/* ==================== PRE-MADE TEMPLATES TAB ==================== */}
      {activeTab === 'premade' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 gap-2">
            {PRE_MADE_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => applyPreMadeTemplate(tmpl)}
                className="group relative flex flex-col p-3 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-purple-500/50 hover:bg-slate-900 transition shadow-md text-left overflow-hidden cursor-pointer active:scale-98"
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tmpl.bgGradient} opacity-30 blur-2xl group-hover:opacity-60 transition pointer-events-none`}
                />

                <div className="flex items-center justify-between mb-1 z-10">
                  <div className="flex items-center gap-1.5">
                    {tmpl.icon}
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">
                      {tmpl.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/30">
                    {tmpl.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 z-10">
                  <span>{tmpl.category}</span>
                  <span>•</span>
                  <span>{tmpl.ratio}</span>
                  <span>•</span>
                  <span>
                    {tmpl.width}×{tmpl.height}px
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 z-10">
                  <span className="text-[9px] font-bold text-purple-400 group-hover:underline">
                    Click to Load →
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyPreMadeToArticle(tmpl);
                    }}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-90 text-white text-[10px] font-bold shadow transition active:scale-95"
                    title="Load template & apply directly to article"
                  >
                    <Send size={10} />
                    <span>Apply to Article</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== USER SAVED CUSTOM TEMPLATES TAB ==================== */}
      {activeTab === 'saved' && (
        <div className="space-y-3">
          {/* Action Bar: Save button, Import JSON, Search */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search my templates..."
                className="w-full pl-7 pr-2 py-1 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Import Template JSON File"
            >
              <Upload size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          {/* Empty State */}
          {filteredCustom.length === 0 && (
            <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 text-center space-y-2">
              <FolderHeart size={28} className="mx-auto text-purple-400 opacity-60" />
              <h4 className="text-xs font-bold text-slate-200">No Saved Templates Yet</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Design your canvas and click <strong>&quot;Save As Template&quot;</strong> above to save custom reusable layouts for future posts.
              </p>
              <button
                type="button"
                onClick={() => {
                  setNewTemplateName(project.title || 'My First Template');
                  setIsSavingModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition"
              >
                <Plus size={12} />
                <span>Save Current Canvas</span>
              </button>
            </div>
          )}

          {/* Saved Templates Grid */}
          {filteredCustom.length > 0 && (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredCustom.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleLoadCustomTemplate(t)}
                  className="group relative flex gap-2.5 p-2.5 rounded-2xl border border-slate-800 bg-slate-950 hover:border-purple-500/50 hover:bg-slate-900 transition shadow-md cursor-pointer text-left"
                >
                  {/* Thumbnail Preview */}
                  <div className="h-16 w-20 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {t.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.thumbnailUrl}
                        alt={t.name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <LayoutTemplate size={20} className="text-purple-400/40" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate block">
                          {t.name}
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 shrink-0">
                          {t.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                        <span>
                          {t.width}×{t.height}px
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={9} />
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 mt-1">
                      <span className="text-[9px] font-bold text-purple-400 group-hover:underline">
                        Click to Load →
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadAndApplyTemplate(t);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-90 text-white text-[9px] font-bold shadow transition active:scale-95"
                          title="Load and Apply template directly to article"
                        >
                          <Send size={9} />
                          <span>Apply</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleExportTemplate(t, e)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="Export Template JSON"
                        >
                          <Download size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTemplate(t.id, e)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Template"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== CANVAS SIZES & RATIOS TAB ==================== */}
      {activeTab === 'ratios' && (
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Popular Canvas Formats
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {ASPECT_PRESETS.map((preset) => {
              const isCurrent = project.width === preset.w && project.height === preset.h;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyAspectRatio(preset.w, preset.h)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                    isCurrent
                      ? 'bg-purple-600/20 border-purple-500/50 text-purple-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {preset.icon}
                    <span>{preset.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <span>
                      {preset.w}×{preset.h}
                    </span>
                    {isCurrent && <Check size={12} className="text-purple-400 ml-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
