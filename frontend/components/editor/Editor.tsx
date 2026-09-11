'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { EditorHeader } from './EditorHeader';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { ExportDialog } from './ExportDialog';
import { useEditorStore } from '../../store/editorStore';
import {
  duplicateActiveObject,
  deleteActiveObject,
  configureObjectControls,
} from '../../lib/editor/canvas';
import { fabric } from 'fabric';

// Import CanvasEditor dynamically with ssr: false for Fabric.js window safety
const CanvasEditor = dynamic(
  () => import('./CanvasEditor').then((mod) => mod.CanvasEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center bg-slate-950 text-slate-500 font-mono text-xs">
        Initializing Canvas Editor...
      </div>
    ),
  }
);

export interface EditorProps {
  initialProjectId?: string;
  initialImageUrl?: string | null;
  initialTitle?: string;
  initialCategory?: string;
  initialAspectRatio?: string;
  onApply?: (dataUrl: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function Editor({
  initialProjectId,
  initialImageUrl,
  initialTitle,
  initialCategory,
  initialAspectRatio,
  onApply,
  onClose,
  isModal = false,
}: EditorProps) {
  const {
    canvas,
    undo,
    redo,
    pushHistoryState,
    refreshLayers,
    project,
    setProject,
    setIsDirty,
    setOnApplyCallback,
    setOnCloseCallback,
  } = useEditorStore();

  // Sync modal onApply and onClose callbacks with global editorStore
  useEffect(() => {
    if (onApply) setOnApplyCallback(onApply);
    if (onClose) setOnCloseCallback(onClose);
    return () => {
      setOnApplyCallback(null);
      setOnCloseCallback(null);
    };
  }, [onApply, onClose, setOnApplyCallback, setOnCloseCallback]);

  // Load project from localStorage if initialProjectId is present
  useEffect(() => {
    if (!initialProjectId) return;
    try {
      const saved = localStorage.getItem(`editor_project_${initialProjectId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.metadata) {
          setProject(parsed.metadata);
        }
      }
    } catch {
      // ignore
    }
  }, [initialProjectId, setProject]);

  // Set project title if initialTitle is provided
  useEffect(() => {
    if (initialTitle && initialTitle.trim()) {
      setProject({ title: initialTitle.trim() });
    }
  }, [initialTitle, setProject]);

  // Set project dimensions based on initialAspectRatio
  useEffect(() => {
    if (initialAspectRatio) {
      if (initialAspectRatio === '1:1') {
        setProject({ width: 1080, height: 1080, backgroundColor: '#0b0f19' });
      } else if (initialAspectRatio === '4:5') {
        setProject({ width: 1080, height: 1350, backgroundColor: '#0b0f19' });
      } else if (initialAspectRatio === '9:16') {
        setProject({ width: 1080, height: 1920, backgroundColor: '#0b0f19' });
      } else if (initialAspectRatio === '16:9') {
        setProject({ width: 1920, height: 1080, backgroundColor: '#0b0f19' });
      } else {
        setProject({ width: 1200, height: 628, backgroundColor: '#0b0f19' });
      }
    }
  }, [initialAspectRatio, setProject]);

  // Auto-initialize canvas with initialImageUrl if canvas is loaded and empty
  useEffect(() => {
    if (!canvas || !initialImageUrl) return;
    let isMounted = true;

    // Check if canvas already has objects and is valid
    if (canvas.getContext() && canvas.getObjects().length === 0) {
      useEditorStore.getState().setIsRestoringHistory(true);
      fabric.Image.fromURL(
        initialImageUrl,
        (img) => {
          if (!isMounted || !img || !canvas || !canvas.getContext()) {
            useEditorStore.getState().setIsRestoringHistory(false);
            return;
          }
          try {
            const targetW = project.width;
            const targetH = project.height;

            // Scale image to cover canvas nicely as background
            const scaleX = targetW / (img.width || 1);
            const scaleY = targetH / (img.height || 1);
            const scale = Math.max(scaleX, scaleY);
            img.scale(scale);

            img.set({
              left: (targetW - (img.getScaledWidth() || 0)) / 2,
              top: (targetH - (img.getScaledHeight() || 0)) / 2,
              customName: 'Background Photo',
            } as fabric.IImageOptions & { customName: string });
            configureObjectControls(img);

            canvas.add(img);
            canvas.sendToBack(img);

            // Add title if provided
            if (initialTitle) {
              const headline = new fabric.Textbox(initialTitle, {
                left: 50,
                top: targetH - 220,
                width: Math.min(targetW - 100, 800),
                fontSize: 38,
                fontWeight: 'bold',
                fill: '#ffffff',
                fontFamily: 'Inter',
                lineHeight: 1.25,
                splitByGrapheme: false,
                customName: 'Headline Text',
              } as fabric.ITextboxOptions & { customName: string });
              configureObjectControls(headline);
              canvas.add(headline);
            }

            // Add category badge if provided
            if (initialCategory) {
              const badgeBg = new fabric.Rect({
                left: 50,
                top: targetH - 280,
                width: Math.max(110, initialCategory.length * 11 + 28),
                height: 34,
                rx: 17,
                ry: 17,
                fill: '#3b82f6',
                customName: 'Category Pill BG',
              } as fabric.IRectOptions & { customName: string });

              const badgeLabel = new fabric.Textbox(initialCategory.toUpperCase(), {
                left: 64,
                top: targetH - 272,
                fontSize: 13,
                fontWeight: 'bold',
                fill: '#ffffff',
                fontFamily: 'Inter',
                width: 160,
                customName: 'Category Label',
              } as fabric.ITextboxOptions & { customName: string });

              configureObjectControls(badgeBg);
              configureObjectControls(badgeLabel);
              canvas.add(badgeBg, badgeLabel);
            }

            // Add brand footer
            const footer = new fabric.Textbox('policydrift.com', {
              left: 50,
              top: targetH - 50,
              fontSize: 16,
              fontWeight: '600',
              fill: '#94a3b8',
              fontFamily: 'Inter',
              width: 300,
              customName: 'Brand Watermark',
            } as fabric.ITextboxOptions & { customName: string });
            configureObjectControls(footer);
            canvas.add(footer);

            if (canvas.getContext()) {
              canvas.renderAll();
              refreshLayers();
              useEditorStore.getState().setIsRestoringHistory(false);
              pushHistoryState();
            } else {
              useEditorStore.getState().setIsRestoringHistory(false);
            }
          } catch {
            useEditorStore.getState().setIsRestoringHistory(false);
            // ignore if unmounted during image init
          }
        },
        { crossOrigin: 'anonymous' }
      );
    }

    return () => {
      isMounted = false;
    };
  }, [canvas, initialImageUrl, initialTitle, initialCategory, project.width, project.height, refreshLayers, pushHistoryState]);

  // Global Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (!canvas) return;
      const activeObj = canvas.getActiveObject();

      // 1. Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeObj && !(activeObj as fabric.IText).isEditing) {
          e.preventDefault();
          deleteActiveObject(canvas);
          refreshLayers();
          pushHistoryState();
        }
      }

      // 2. Undo (Ctrl/Cmd + Z)
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }

      // 3. Redo (Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y)
      if ((cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (cmdOrCtrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
      }

      // 4. Duplicate (Ctrl/Cmd + D)
      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateActiveObject(canvas);
        refreshLayers();
        pushHistoryState();
      }

      // 5. Save (Ctrl/Cmd + S)
      if (cmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
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
        } catch {
          // ignore
        }
      }

      // 6. Zoom Shortcuts (Ctrl/Cmd + Plus / Minus / 0)
      if (cmdOrCtrl && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        const curZoom = canvas.getZoom();
        const newZoom = Math.min(5.0, +(curZoom + 0.1).toFixed(1));
        canvas.setZoom(newZoom);
        useEditorStore.getState().setZoom(newZoom);
        canvas.renderAll();
      }
      if (cmdOrCtrl && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        const curZoom = canvas.getZoom();
        const newZoom = Math.max(0.1, +(curZoom - 0.1).toFixed(1));
        canvas.setZoom(newZoom);
        useEditorStore.getState().setZoom(newZoom);
        canvas.renderAll();
      }
      if (cmdOrCtrl && e.key === '0') {
        e.preventDefault();
        canvas.setZoom(1.0);
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        useEditorStore.getState().setZoom(1.0);
        canvas.renderAll();
      }

      // 7. Arrow Keys for Object Nudging
      if (activeObj && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowUp') activeObj.top = (activeObj.top || 0) - step;
        if (e.key === 'ArrowDown') activeObj.top = (activeObj.top || 0) + step;
        if (e.key === 'ArrowLeft') activeObj.left = (activeObj.left || 0) - step;
        if (e.key === 'ArrowRight') activeObj.left = (activeObj.left || 0) + step;
        activeObj.setCoords();
        canvas.renderAll();
        pushHistoryState();
      }
    };

    // Clipboard Paste Listener for Image Paste
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob && canvas) {
              const reader = new FileReader();
              reader.onload = (event) => {
                if (event.target?.result) {
                  const img = new Image();
                  img.crossOrigin = 'anonymous';
                  img.onload = () => {
                    const imgObj = new fabric.Image(img, {
                      left: project.width / 2,
                      top: project.height / 2,
                      originX: 'center',
                      originY: 'center',
                    });
                    (imgObj as unknown as { id: string; customName: string }).id = `img-${Date.now()}`;
                    (imgObj as unknown as { customName: string }).customName = 'Pasted Image';
                    const maxW = project.width * 0.8;
                    const maxH = project.height * 0.8;
                    const scale = Math.min(maxW / (imgObj.width || 1), maxH / (imgObj.height || 1), 1.0);
                    imgObj.scale(scale);
                    canvas.add(imgObj);
                    canvas.setActiveObject(imgObj);
                    canvas.renderAll();
                    refreshLayers();
                    pushHistoryState();
                  };
                  img.src = event.target.result as string;
                }
              };
              reader.readAsDataURL(blob);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [canvas, undo, redo, pushHistoryState, refreshLayers, project, setIsDirty]);

  return (
    <div className="studio-canvas-editor fixed inset-0 flex flex-col overflow-hidden bg-slate-950 font-sans antialiased select-none">
      {/* Top Global Header Bar */}
      <EditorHeader isModal={isModal} onApply={onApply} onClose={onClose} />

      {/* Main Studio Workspace: Left Sidebar + Center Canvas + Right Sidebar */}
      <div className="flex flex-1 w-full min-h-0 min-w-0 overflow-hidden relative">
        <LeftSidebar />
        <CanvasEditor />
        <RightSidebar />
      </div>

      {/* Export Dialog Modal */}
      <ExportDialog />
    </div>
  );
}
