import { create } from 'zustand';
import type { fabric } from 'fabric';
import type {
  ActiveTool,
  AspectRatio,
  FilterPreset,
  ImageAdjustments,
  LayerItem,
  ProjectMetadata,
} from '../types/editor';

interface EditorState {
  // Fabric Canvas Instance
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;

  // Active Tool & Navigation
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;

  // Selection & Object Inspection
  selectedObject: fabric.Object | null;
  selectedObjects: fabric.Object[];
  setSelectedObject: (obj: fabric.Object | null) => void;
  setSelectedObjects: (objs: fabric.Object[]) => void;

  // Layer Stack
  layers: LayerItem[];
  setLayers: (layers: LayerItem[]) => void;
  refreshLayers: () => void;

  // Viewport Zoom & Pan
  zoom: number;
  setZoom: (zoom: number) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;

  // History & Undo / Redo
  history: string[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  isRestoringHistory: boolean;
  setIsRestoringHistory: (restoring: boolean) => void;
  pushHistoryState: () => void;
  undo: () => void;
  redo: () => void;

  // Active Project Info
  project: ProjectMetadata;
  setProject: (project: Partial<ProjectMetadata>) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;

  // Adjustments & Filters
  adjustments: ImageAdjustments;
  setAdjustment: (key: keyof ImageAdjustments, value: number) => void;
  resetAdjustments: () => void;
  activeFilter: FilterPreset;
  setActiveFilter: (filter: FilterPreset) => void;

  // Cropping
  activeCropRatio: AspectRatio;
  setActiveCropRatio: (ratio: AspectRatio) => void;
  isCropping: boolean;
  setIsCropping: (cropping: boolean) => void;

  // Freehand Drawing
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushWidth: number;
  setBrushWidth: (width: number) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
  isEraser: boolean;
  setIsEraser: (eraser: boolean) => void;

  // Sidebar Visibility & Pan Mode
  isLeftDrawerOpen: boolean;
  setIsLeftDrawerOpen: (open: boolean) => void;
  toggleLeftDrawer: () => void;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
  isPanMode: boolean;
  setIsPanMode: (pan: boolean) => void;

  // Modals & Application Handlers
  isExportOpen: boolean;
  setIsExportOpen: (open: boolean) => void;
  onApplyCallback: ((dataUrl: string) => void) | null;
  setOnApplyCallback: (cb: ((dataUrl: string) => void) | null) => void;
  onCloseCallback: (() => void) | null;
  setOnCloseCallback: (cb: (() => void) | null) => void;
}

const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  opacity: 1,
  temperature: 0,
  tint: 0,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),

  activeTool: 'upload',
  setActiveTool: (tool) => set({ activeTool: tool }),

  selectedObject: null,
  selectedObjects: [],
  setSelectedObject: (obj) => set({ selectedObject: obj }),
  setSelectedObjects: (objs) => set({ selectedObjects: objs }),

  layers: [],
  setLayers: (layers) => set({ layers }),
  refreshLayers: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const objects = canvas.getObjects();
    const newLayers: LayerItem[] = objects.map((obj, idx) => ({
      id: (obj as unknown as { id?: string }).id || `layer-${idx}`,
      name:
        (obj as unknown as { customName?: string }).customName ||
        (obj.type === 'i-text' || obj.type === 'textbox'
          ? (obj as fabric.IText).text?.slice(0, 16) || 'Text'
          : obj.type === 'image'
          ? 'Photo'
          : obj.type || 'Object'),
      type: obj.type || 'object',
      visible: obj.visible !== false,
      locked: Boolean(obj.lockMovementX && obj.lockMovementY),
      opacity: obj.opacity ?? 1,
      zIndex: idx,
    }));
    set({ layers: newLayers.reverse() });
  },

  zoom: 1,
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5.0, zoom)) }),
  showGrid: false,
  setShowGrid: (show) => set({ showGrid: show }),

  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  isRestoringHistory: false,
  setIsRestoringHistory: (restoring) => set({ isRestoringHistory: restoring }),
  pushHistoryState: () => {
    const canvas = get().canvas;
    if (!canvas || get().isRestoringHistory) return;
    const json = JSON.stringify(
      canvas.toJSON([
        'id',
        'customName',
        'selectable',
        'locked',
        'rx',
        'ry',
        'stroke',
        'strokeWidth',
        'strokeDashArray',
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
      ])
    );
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory[newHistory.length - 1] === json) return; // avoid duplicate snapshots

    newHistory.push(json);
    // Keep maximum 40 history steps
    if (newHistory.length > 40) newHistory.shift();

    const newIndex = newHistory.length - 1;
    set({
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
      isDirty: true,
    });
  },

  undo: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas || historyIndex <= 0) return;
    const targetIndex = historyIndex - 1;
    const json = history[targetIndex];
    set({ isRestoringHistory: true });
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      set({
        historyIndex: targetIndex,
        canUndo: targetIndex > 0,
        canRedo: targetIndex < history.length - 1,
        isRestoringHistory: false,
      });
      get().refreshLayers();
    });
  },

  redo: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas || historyIndex >= history.length - 1) return;
    const targetIndex = historyIndex + 1;
    const json = history[targetIndex];
    set({ isRestoringHistory: true });
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      set({
        historyIndex: targetIndex,
        canUndo: true,
        canRedo: targetIndex < history.length - 1,
        isRestoringHistory: false,
      });
      get().refreshLayers();
    });
  },

  project: {
    id: 'project-new',
    title: 'Untitled Photo',
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  setProject: (update) =>
    set((state) => ({
      project: { ...state.project, ...update, updatedAt: new Date().toISOString() },
      isDirty: true,
    })),

  isSaving: false,
  setIsSaving: (saving) => set({ isSaving: saving }),
  isDirty: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),

  adjustments: DEFAULT_ADJUSTMENTS,
  setAdjustment: (key, value) =>
    set((state) => ({
      adjustments: { ...state.adjustments, [key]: value },
    })),
  resetAdjustments: () => set({ adjustments: DEFAULT_ADJUSTMENTS, activeFilter: 'original' }),
  activeFilter: 'original',
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  activeCropRatio: 'free',
  setActiveCropRatio: (ratio) => set({ activeCropRatio: ratio }),
  isCropping: false,
  setIsCropping: (cropping) => set({ isCropping: cropping }),

  brushColor: '#3b82f6',
  setBrushColor: (color) => set({ brushColor: color }),
  brushWidth: 10,
  setBrushWidth: (width) => set({ brushWidth: width }),
  brushOpacity: 1,
  setBrushOpacity: (opacity) => set({ brushOpacity: opacity }),
  isEraser: false,
  setIsEraser: (eraser) => set({ isEraser: eraser }),

  isLeftDrawerOpen: true,
  setIsLeftDrawerOpen: (open) => set({ isLeftDrawerOpen: open }),
  toggleLeftDrawer: () => set((s) => ({ isLeftDrawerOpen: !s.isLeftDrawerOpen })),
  isRightSidebarOpen: true,
  setIsRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
  toggleRightSidebar: () => set((s) => ({ isRightSidebarOpen: !s.isRightSidebarOpen })),
  isPanMode: false,
  setIsPanMode: (pan) => set({ isPanMode: pan }),

  isExportOpen: false,
  setIsExportOpen: (open) => set({ isExportOpen: open }),
  onApplyCallback: null,
  setOnApplyCallback: (cb) => set({ onApplyCallback: cb }),
  onCloseCallback: null,
  setOnCloseCallback: (cb) => set({ onCloseCallback: cb }),
}));
