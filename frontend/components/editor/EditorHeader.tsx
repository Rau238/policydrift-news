'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  Download,
  Save,
  Check,
  Wand2,
  FileImage,
  Maximize2,
  X,
  Sparkles,
  LayoutTemplate,
  Bookmark,
  ArrowLeft,
  ChevronDown,
  FolderOpen,
  Plus,
  FileCode,
  Printer,
  Copy,
  Trash2,
  CheckSquare,
  Square,
  Crop,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  RotateCcw,
  Sliders,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Grid,
  HelpCircle,
  Keyboard,
  Type,
  Shapes,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { exportCanvasToDataURL, downloadDataUrl } from '../../lib/editor/export';
import {
  duplicateActiveObject,
  deleteActiveObject,
  bringObjectToFront,
  sendObjectToBack,
  bringObjectForward,
  sendObjectBackward,
  addBottomGradientSplash,
} from '../../lib/editor/canvas';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { fabric } from 'fabric';

interface EditorHeaderProps {
  isModal?: boolean;
  onApply?: (dataUrl: string) => void;
  onClose?: () => void;
  applyLabel?: string;
}

type DropdownKey = 'file' | 'edit' | 'image' | 'layer' | 'view' | 'help' | null;

export function EditorHeader({
  isModal = false,
  onApply,
  onClose,
  applyLabel = 'Apply to Article / Post',
}: EditorHeaderProps) {
  const {
    project,
    setProject,
    canUndo,
    canRedo,
    undo,
    redo,
    isSaving,
    setIsSaving,
    isDirty,
    setIsDirty,
    setIsExportOpen,
    setActiveTool,
    setIsLeftDrawerOpen,
    canvas,
    zoom,
    setZoom,
    showGrid,
    setShowGrid,
    selectedObject,
    refreshLayers,
    pushHistoryState,
    onApplyCallback,
    onCloseCallback,
  } = useEditorStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [appliedToast, setAppliedToast] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (key: DropdownKey) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const closeMenu = () => setActiveDropdown(null);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      setProject({ title: titleInput.trim() });
    } else {
      setTitleInput(project.title);
    }
  };

  const handleSaveProject = async () => {
    if (!canvas) return;
    setIsSaving(true);
    try {
      const projectData = {
        version: 1,
        metadata: project,
        canvas: {
          width: project.width,
          height: project.height,
          background: project.backgroundColor,
        },
        objects: canvas.toJSON(['id', 'customName', 'locked']),
      };

      localStorage.setItem(`editor_project_${project.id}`, JSON.stringify(projectData));

      setIsDirty(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    closeMenu();
    if (!canvas) return;
    const projectData = {
      version: 1,
      metadata: project,
      canvas: {
        width: project.width,
        height: project.height,
        backgroundColor: project.backgroundColor,
      },
      objects: canvas.toJSON(['id', 'customName', 'locked']),
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `${project.title.toLowerCase().replace(/\s+/g, '-')}-project.json`);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    closeMenu();
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.objects) {
          canvas.loadFromJSON(data.objects, () => {
            if (data.metadata) {
              setProject(data.metadata);
            }
            if (data.canvas) {
              setProject({
                width: data.canvas.width || project.width,
                height: data.canvas.height || project.height,
                backgroundColor: data.canvas.background || project.backgroundColor,
              });
            }
            canvas.renderAll();
            pushHistoryState();
            refreshLayers();
          });
        }
      } catch {
        alert('Invalid project JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportSVG = () => {
    closeMenu();
    if (!canvas) return;
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `${project.title.toLowerCase().replace(/\s+/g, '-')}.svg`);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    closeMenu();
    if (!canvas) return;
    const dataUrl = exportCanvasToDataURL(canvas, { format: 'png', multiplier: 2 });
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print - ${project.title}</title></head>
          <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000;">
            <img src="${dataUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
            <script>window.onload = function() { window.print(); window.close(); };<\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleNewCanvas = () => {
    closeMenu();
    if (!canvas) return;
    if (confirm('Create a new blank canvas? All unsaved work on the canvas will be cleared.')) {
      canvas.clear();
      canvas.backgroundColor = project.backgroundColor || '#0b0f19';
      canvas.renderAll();
      pushHistoryState();
      refreshLayers();
    }
  };

  const handleSelectAll = () => {
    closeMenu();
    if (!canvas) return;
    canvas.discardActiveObject();
    const objs = canvas.getObjects().filter((o) => o.selectable !== false);
    if (objs.length > 0) {
      const selection = new fabric.ActiveSelection(objs, { canvas });
      canvas.setActiveObject(selection);
      canvas.requestRenderAll();
    }
  };

  const handleDeselect = () => {
    closeMenu();
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const handleFlipHorizontal = () => {
    closeMenu();
    const active = selectedObject || canvas?.getActiveObject();
    if (!active || !canvas) return;
    active.set('flipX', !active.flipX);
    active.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleFlipVertical = () => {
    closeMenu();
    const active = selectedObject || canvas?.getActiveObject();
    if (!active || !canvas) return;
    active.set('flipY', !active.flipY);
    active.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleRotate = (angle: number) => {
    closeMenu();
    const active = selectedObject || canvas?.getActiveObject();
    if (!active || !canvas) return;
    active.rotate(((active.angle || 0) + angle) % 360);
    active.setCoords();
    canvas.renderAll();
    pushHistoryState();
  };

  const handleToggleLock = () => {
    closeMenu();
    const active = selectedObject || canvas?.getActiveObject();
    if (!active || !canvas) return;
    const isLocked = Boolean(active.lockMovementX && active.lockMovementY);
    active.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockRotation: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
    });
    canvas.renderAll();
    refreshLayers();
  };

  const handleToggleVisibility = () => {
    closeMenu();
    const active = selectedObject || canvas?.getActiveObject();
    if (!active || !canvas) return;
    active.set('visible', active.visible === false);
    canvas.renderAll();
    refreshLayers();
  };

  const handleToggleFullscreen = () => {
    closeMenu();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-950 px-3 sm:px-4 text-white select-none shrink-0 shadow-lg">
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            closeMenu();
            const file = e.target.files?.[0];
            if (!file || !canvas) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
              const url = evt.target?.result as string;
              fabric.Image.fromURL(url, (img) => {
                const maxDim = Math.min(project.width, project.height) * 0.7;
                if ((img.width || 0) > maxDim || (img.height || 0) > maxDim) {
                  const scale = maxDim / Math.max(img.width || 1, img.height || 1);
                  img.scale(scale);
                }
                img.set({
                  left: (project.width - (img.getScaledWidth() || 0)) / 2,
                  top: (project.height - (img.getScaledHeight() || 0)) / 2,
                  cornerColor: '#a855f7',
                  cornerStyle: 'circle',
                  transparentCorners: false,
                });
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                pushHistoryState();
                refreshLayers();
              });
            };
            reader.readAsDataURL(file);
            e.target.value = '';
          }}
        />
        <input
          ref={jsonInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportJSON}
        />

        {/* Left: Brand / Modal Back & Editable Project Name & Studio Menu */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {isModal && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 shrink-0"
              title="Return to Post / Article"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back</span>
            </button>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-md shadow-purple-500/20 text-white shrink-0">
              <Wand2 size={16} className="stroke-[2.5]" />
            </div>
          )}

          {/* Title and Unsaved Dot */}
          <div className="flex items-center gap-1.5 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="h-7 w-28 sm:w-44 md:w-52 rounded-lg border border-purple-500 bg-slate-900 px-2 text-xs font-semibold text-white outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTitleInput(project.title);
                  setIsEditingTitle(true);
                }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-200 hover:bg-slate-900 hover:text-white transition truncate max-w-[110px] sm:max-w-[160px] md:max-w-[220px]"
                title="Click to rename project"
              >
                <FileImage size={13} className="text-purple-400 shrink-0" />
                <span className="truncate">{project.title}</span>
              </button>
            )}

            {isDirty && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
            )}
          </div>

          {/* Desktop Studio Menu Bar: File | Edit | Image | Layer | View | Help */}
          <div ref={dropdownRef} className="hidden xl:flex items-center ml-2 border-l border-slate-800/80 pl-2 text-xs font-medium text-slate-300 relative">
            {/* File Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('file')}
                className={`px-2.5 py-1 rounded-md hover:bg-slate-800 hover:text-white transition ${
                  activeDropdown === 'file' ? 'bg-slate-800 text-white' : ''
                }`}
              >
                File
              </button>
              {activeDropdown === 'file' && (
                <div className="absolute left-0 top-full mt-1 w-48 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-2xl p-1 z-50 text-xs space-y-0.5">
                  <button
                    type="button"
                    onClick={handleNewCanvas}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <Plus size={13} className="text-slate-400" />
                    <span>New Blank Canvas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      fileInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <FolderOpen size={13} className="text-slate-400" />
                    <span>Open / Add Image...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      jsonInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <FileCode size={13} className="text-slate-400" />
                    <span>Import Project (.json)</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={handleSaveProject}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Save size={13} className="text-slate-400" />
                      <span>Save Copy</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+S</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setActiveTool('templates');
                      setIsLeftDrawerOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <LayoutTemplate size={13} className="text-purple-400" />
                    <span>Templates & Save...</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <FileCode size={13} className="text-purple-400" />
                    <span>Save Project (.json)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setIsExportOpen(true);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Download size={13} className="text-teal-400" />
                      <span>Export Image...</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+E</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportSVG}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <Download size={13} className="text-blue-400" />
                    <span>Export Vector (SVG)</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <Printer size={13} className="text-slate-400" />
                    <span>Print Canvas</span>
                  </button>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('edit')}
                className={`px-2.5 py-1 rounded-md hover:bg-slate-800 hover:text-white transition ${
                  activeDropdown === 'edit' ? 'bg-slate-800 text-white' : ''
                }`}
              >
                Edit
              </button>
              {activeDropdown === 'edit' && (
                <div className="absolute left-0 top-full mt-1 w-48 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-2xl p-1 z-50 text-xs space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      undo();
                    }}
                    disabled={!canUndo}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 disabled:opacity-40 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Undo2 size={13} />
                      <span>Undo</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+Z</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      redo();
                    }}
                    disabled={!canRedo}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 disabled:opacity-40 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Redo2 size={13} />
                      <span>Redo</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+Y</kbd>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      if (canvas) duplicateActiveObject(canvas);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Copy size={13} className="text-slate-400" />
                      <span>Duplicate</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+D</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      if (canvas) deleteActiveObject(canvas);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-rose-300 hover:text-rose-200 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 size={13} className="text-rose-400" />
                      <span>Delete Selected</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">Del</kbd>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare size={13} className="text-slate-400" />
                      <span>Select All</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+A</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselect}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Square size={13} className="text-slate-400" />
                      <span>Deselect All</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">Esc</kbd>
                  </button>
                </div>
              )}
            </div>

            {/* Image Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('image')}
                className={`px-2.5 py-1 rounded-md hover:bg-slate-800 hover:text-white transition ${
                  activeDropdown === 'image' ? 'bg-slate-800 text-white' : ''
                }`}
              >
                Image
              </button>
              {activeDropdown === 'image' && (
                <div className="absolute left-0 top-full mt-1 w-52 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-2xl p-1 z-50 text-xs space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setActiveTool('crop');
                      setIsLeftDrawerOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <Crop size={13} className="text-slate-400" />
                    <span>Crop Image...</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={handleFlipHorizontal}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <FlipHorizontal size={13} className="text-slate-400" />
                    <span>Flip Horizontal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFlipVertical}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <FlipVertical size={13} className="text-slate-400" />
                    <span>Flip Vertical</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotate(90)}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <RotateCw size={13} className="text-slate-400" />
                    <span>Rotate 90° Clockwise</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotate(-90)}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <RotateCcw size={13} className="text-slate-400" />
                    <span>Rotate 90° CCW</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setActiveTool('adjust');
                      setIsLeftDrawerOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <Sliders size={13} className="text-purple-400" />
                    <span>Adjustments & Color Tone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setActiveTool('filters');
                      setIsLeftDrawerOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Filter Presets...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setActiveTool('templates');
                      setIsLeftDrawerOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <LayoutTemplate size={13} className="text-teal-400" />
                    <span>Canvas Aspect Ratios</span>
                  </button>
                </div>
              )}
            </div>

            {/* Layer Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('layer')}
                className={`px-2.5 py-1 rounded-md hover:bg-slate-800 hover:text-white transition ${
                  activeDropdown === 'layer' ? 'bg-slate-800 text-white' : ''
                }`}
              >
                Layer
              </button>
              {activeDropdown === 'layer' && (
                <div className="absolute left-0 top-full mt-1 w-52 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-2xl p-1 z-50 text-xs space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setActiveTool('text');
                      setIsLeftDrawerOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <Type size={13} className="text-purple-400" />
                    <span>Add Text Layer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setActiveTool('elements');
                      setIsLeftDrawerOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <Shapes size={13} className="text-teal-400" />
                    <span>Add Shape / Splash</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      if (canvas) bringObjectToFront(canvas);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <span>Bring to Front</span>
                    <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+]</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      if (canvas) sendObjectToBack(canvas);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <span>Send to Back</span>
                    <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+[</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      if (canvas) bringObjectForward(canvas);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <span>Bring Forward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      if (canvas) sendObjectBackward(canvas);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <span>Send Backward</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={handleToggleLock}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <Lock size={13} className="text-amber-400" />
                    <span>Lock / Unlock Layer</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleVisibility}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <Eye size={13} className="text-slate-400" />
                    <span>Toggle Visibility</span>
                  </button>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('view')}
                className={`px-2.5 py-1 rounded-md hover:bg-slate-800 hover:text-white transition ${
                  activeDropdown === 'view' ? 'bg-slate-800 text-white' : ''
                }`}
              >
                View
              </button>
              {activeDropdown === 'view' && (
                <div className="absolute left-0 top-full mt-1 w-48 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-2xl p-1 z-50 text-xs space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setZoom(zoom + 0.1);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <ZoomIn size={13} />
                      <span>Zoom In</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">Ctrl++</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setZoom(zoom - 0.1);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <ZoomOut size={13} />
                      <span>Zoom Out</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+-</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setZoom(1);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <span>Reset Zoom (100%)</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setShowGrid(!showGrid);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Grid size={13} />
                      <span>Smart Snap Guides</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-400">
                      {showGrid ? 'ON' : 'OFF'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Maximize2 size={13} />
                      <span>Fullscreen</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">F11</kbd>
                  </button>
                </div>
              )}
            </div>

            {/* Help Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('help')}
                className={`px-2.5 py-1 rounded-md hover:bg-slate-800 hover:text-white transition ${
                  activeDropdown === 'help' ? 'bg-slate-800 text-white' : ''
                }`}
              >
                Help
              </button>
              {activeDropdown === 'help' && (
                <div className="absolute left-0 top-full mt-1 w-48 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-2xl p-1 z-50 text-xs space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setIsShortcutsOpen(true);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Keyboard size={13} className="text-purple-400" />
                      <span>Keyboard Shortcuts</span>
                    </div>
                    <kbd className="text-[10px] text-slate-500 font-mono">?</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setActiveTool('templates');
                      setIsLeftDrawerOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition"
                  >
                    <HelpCircle size={13} className="text-teal-400" />
                    <span>Quick Templates Guide</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Quick Templates Button & Undo/Redo */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTool('templates');
              setIsLeftDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 hover:border-purple-500/50 transition"
          >
            <LayoutTemplate size={14} className="text-purple-400" />
            <span>Templates & Ratios</span>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={14} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={14} />
            </button>
          </div>
        </div>

        {/* Right: PRIMARY ACTIONS (Apply, Save, Export, Fullscreen, Close) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Shortcuts Quick Help Icon */}
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95 hidden sm:inline-flex"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard size={14} />
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
            title="Toggle Fullscreen"
          >
            <Maximize2 size={14} />
          </button>

          {/* Save Copy / Project Button */}
          <button
            type="button"
            onClick={handleSaveProject}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition active:scale-95"
            title="Save Copy (Ctrl+S)"
          >
            {savedSuccess ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">Saved!</span>
              </>
            ) : (
              <>
                <Save size={13} className={isSaving ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Save Copy</span>
              </>
            )}
          </button>

          {/* Save as Template Quick Button */}
          <button
            type="button"
            onClick={() => {
              setActiveTool('templates');
              setIsLeftDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-900/60 bg-purple-950/30 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900/50 hover:text-white transition active:scale-95"
            title="Save design as reusable template"
          >
            <Bookmark size={13} className="text-purple-400" />
            <span className="hidden md:inline">Save as Template</span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-blue-500/20 hover:opacity-95 active:scale-95 transition"
            title="Export Image (Sizes, Quality & Formats)"
          >
            <Download size={14} className="stroke-[2.5]" />
            <span>Export</span>
          </button>

          {/* Primary Apply to Article Button (Universal) */}
          <button
            type="button"
            onClick={() => {
              if (!canvas || !canvas.getContext()) return;
              const dataUrl = exportCanvasToDataURL(canvas, {
                format: 'png',
                multiplier: 2,
                quality: 1,
              });

              const effectiveApply = onApply || onApplyCallback;
              const effectiveClose = onClose || onCloseCallback;

              if (effectiveApply) {
                effectiveApply(dataUrl);
                if (effectiveClose) effectiveClose();
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
                setAppliedToast('Applied! (Copied)');
                setTimeout(() => setAppliedToast(''), 3000);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-95 transition"
            title="Apply this exact graphic directly to the article or social post"
          >
            <Check size={14} className="stroke-[3]" />
            <span>{appliedToast || (isModal ? 'Apply to Article' : applyLabel)}</span>
          </button>

          {/* Modal Close Button */}
          {(onClose || onCloseCallback) && (
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                else if (onCloseCallback) onCloseCallback();
              }}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-rose-600/80 transition ml-0.5"
              title="Close Editor"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
}
