export type ActiveTool =
  | 'select'
  | 'templates'
  | 'upload'
  | 'images'
  | 'text'
  | 'elements'
  | 'draw'
  | 'filters'
  | 'adjust'
  | 'crop'
  | 'position';

export type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '3:4' | '9:16';

export type FilterPreset =
  | 'original'
  | 'grayscale'
  | 'vintage'
  | 'warm'
  | 'cool'
  | 'cinematic'
  | 'blackwhite'
  | 'sepia'
  | 'bright'
  | 'dark'
  | 'highcontrast'
  | 'cyberpunk';

export interface ImageAdjustments {
  brightness: number; // -1 to 1 (0 default)
  contrast: number; // -1 to 1 (0 default)
  saturation: number; // -1 to 1 (0 default)
  hue: number; // -1 to 1 (0 default)
  blur: number; // 0 to 1 (0 default)
  opacity: number; // 0 to 1 (1 default)
  temperature: number; // -1 to 1 (0 default)
  tint: number; // -1 to 1 (0 default)
}

export interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
}

export interface ProjectMetadata {
  id: string;
  title: string;
  width: number;
  height: number;
  backgroundColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectJSON {
  version: number;
  canvas: {
    width: number;
    height: number;
    background: string;
  };
  objects: Record<string, unknown>[];
  settings: {
    zoom: number;
  };
}

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'webp' | 'svg';
  quality: number; // 0.1 to 1.0
  scale: number; // multiplier e.g. 1, 1.5, 2, 3, 4
  width?: number;
  height?: number;
}
