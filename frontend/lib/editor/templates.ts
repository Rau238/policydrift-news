import { fabric } from 'fabric';
import { configureObjectControls } from './canvas';

export interface CustomTemplate {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  backgroundColor?: string;
  thumbnailUrl?: string;
  createdAt: number;
  updatedAt: number;
  canvasData: Record<string, unknown>;
}

const STORAGE_KEY = 'editor_custom_templates';

/**
 * Retrieves all custom templates from localStorage
 */
export function getCustomTemplates(): CustomTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.createdAt - a.createdAt);
    }
    return [];
  } catch (err) {
    console.error('Failed to load custom templates from localStorage', err);
    return [];
  }
}

/**
 * Saves a new custom template
 */
export function saveCustomTemplate(
  data: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt'>
): CustomTemplate {
  const templates = getCustomTemplates();
  const id = `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const newTemplate: CustomTemplate = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newTemplate, ...templates];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage full, removing oldest thumbnail to save space', err);
    // If quota exceeded, strip thumbnails from oldest templates
    const stripped = updated.map((t, idx) => (idx > 3 ? { ...t, thumbnailUrl: undefined } : t));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
  }

  return newTemplate;
}

/**
 * Deletes a custom template by id
 */
export function deleteCustomTemplate(id: string): void {
  const templates = getCustomTemplates();
  const updated = templates.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

import { useEditorStore } from '../../store/editorStore';

/**
 * Loads a custom template onto the canvas
 */
export function loadTemplateOntoCanvas(
  canvas: fabric.Canvas,
  template: CustomTemplate,
  setProject: (p: { width: number; height: number; title?: string; backgroundColor?: string }) => void,
  setZoom: (z: number) => void,
  refreshLayers: () => void,
  pushHistoryState: () => void
): Promise<void> {
  return new Promise((resolve) => {
    // 0. Protect undo/redo history during batch restoration
    useEditorStore.getState().setIsRestoringHistory(true);

    // 1. Update project dimensions
    setProject({
      width: template.width,
      height: template.height,
      backgroundColor: template.backgroundColor || '#0f172a',
    });

    canvas.setWidth(template.width);
    canvas.setHeight(template.height);

    // 2. Auto-fit zoom to workspace parent
    const parent = canvas.getElement()?.parentElement;
    if (parent) {
      const containerW = parent.clientWidth - 48;
      const containerH = parent.clientHeight - 48;
      const scale = Math.min(containerW / template.width, containerH / template.height, 1.0);
      setZoom(scale);
      canvas.setZoom(scale);
    }

    // 3. Clear existing objects
    canvas.clear();
    canvas.backgroundColor = template.backgroundColor || '#0f172a';

    // 4. Load from JSON
    canvas.loadFromJSON(template.canvasData, () => {
      // Re-configure controls on each restored object
      canvas.getObjects().forEach((obj) => {
        configureObjectControls(obj);
      });

      if (template.backgroundColor) {
        canvas.backgroundColor = template.backgroundColor;
      }

      canvas.renderAll();
      refreshLayers();
      useEditorStore.getState().setIsRestoringHistory(false);
      pushHistoryState();
      resolve();
    });
  });
}

/**
 * Exports a template as a downloadable JSON file
 */
export function exportTemplateToJson(template: CustomTemplate): void {
  const jsonStr = JSON.stringify(template, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-template.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a template from JSON text
 */
export function importTemplateFromJson(jsonText: string): CustomTemplate {
  const data = JSON.parse(jsonText);
  if (!data.name || !data.width || !data.height || !data.canvasData) {
    throw new Error('Invalid template file structure');
  }

  return saveCustomTemplate({
    name: data.name,
    category: data.category || 'Imported',
    width: data.width,
    height: data.height,
    backgroundColor: data.backgroundColor,
    thumbnailUrl: data.thumbnailUrl,
    canvasData: data.canvasData,
  });
}
