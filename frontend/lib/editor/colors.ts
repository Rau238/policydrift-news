import { fabric } from 'fabric';

/**
 * Converts any CSS color string (hex, rgb, rgba, hsl, name) or fabric.Gradient to a 6-digit #RRGGBB hex string.
 */
export function colorToHex(
  color: string | fabric.Gradient | fabric.Pattern | undefined | null,
  fallback: string = '#3b82f6'
): string {
  if (!color) return fallback;

  // If it's a fabric.Gradient, extract the first color stop
  if (typeof color === 'object') {
    const grad = color as fabric.Gradient;
    if (grad.colorStops && grad.colorStops.length > 0) {
      return colorToHex(grad.colorStops[0].color, fallback);
    }
    return fallback;
  }

  const str = color.trim().toLowerCase();

  // If already 6 or 8-digit hex:
  if (str.startsWith('#')) {
    if (str.length === 4) {
      // #rgb -> #rrggbb
      return `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`;
    }
    if (str.length >= 7) {
      return str.slice(0, 7);
    }
    return fallback;
  }

  // If rgb(...) or rgba(...)
  if (str.startsWith('rgb')) {
    const match = str.match(/\d+(\.\d+)?/g);
    if (match && match.length >= 3) {
      const r = Math.min(255, Math.max(0, parseInt(match[0], 10)));
      const g = Math.min(255, Math.max(0, parseInt(match[1], 10)));
      const b = Math.min(255, Math.max(0, parseInt(match[2], 10)));
      const hexR = r.toString(16).padStart(2, '0');
      const hexG = g.toString(16).padStart(2, '0');
      const hexB = b.toString(16).padStart(2, '0');
      return `#${hexR}${hexG}${hexB}`;
    }
  }

  // Common named colors fallback
  const NAMED_COLORS: Record<string, string> = {
    white: '#ffffff',
    black: '#000000',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    transparent: '#000000',
  };

  return NAMED_COLORS[str] || fallback;
}

/**
 * Extracts alpha value (0 to 1) from color string.
 */
export function extractAlpha(color: string | undefined | null): number {
  if (!color) return 1;
  const str = color.trim().toLowerCase();

  if (str.startsWith('rgba')) {
    const match = str.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
    if (match && match[1]) {
      const parsed = parseFloat(match[1]);
      return isNaN(parsed) ? 1 : Math.min(1, Math.max(0, parsed));
    }
  }

  if (str.startsWith('#') && str.length === 9) {
    const alphaHex = str.slice(7, 9);
    return Math.round((parseInt(alphaHex, 16) / 255) * 100) / 100;
  }

  return 1;
}

/**
 * Converts a hex string and alpha (0 to 1) to rgba string
 */
export function hexAndAlphaToRgba(hex: string, alpha: number = 1): string {
  const cleanHex = colorToHex(hex);
  const r = parseInt(cleanHex.slice(1, 3), 16);
  const g = parseInt(cleanHex.slice(3, 5), 16);
  const b = parseInt(cleanHex.slice(5, 7), 16);
  const clampedAlpha = Math.min(1, Math.max(0, +(alpha.toFixed(2))));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

/**
 * Checks if a fill is a fabric.Gradient
 */
export function isGradientFill(fill: unknown): fill is fabric.Gradient {
  return Boolean(fill && typeof fill === 'object' && (fill as fabric.Gradient).type !== undefined);
}

export interface GradientColorStop {
  id?: string;
  color: string;
  offset: number; // 0 to 1
}

export type GradientDirection =
  | 'to-top'
  | 'to-bottom'
  | 'to-right'
  | 'to-left'
  | 'diagonal'
  | 'diagonal-alt'
  | 'radial';

/**
 * Creates an advanced multi-stop linear or radial gradient in Fabric.js
 */
export function createFabricMultiGradient(
  colorStops: GradientColorStop[],
  direction: GradientDirection = 'to-top',
  width: number = 400,
  height: number = 400
): fabric.Gradient {
  if (direction === 'radial') {
    return new fabric.Gradient({
      type: 'radial',
      gradientUnits: 'pixels',
      coords: {
        r1: 0,
        r2: Math.max(width, height) / 1.4,
        x1: width / 2,
        y1: height / 2,
        x2: width / 2,
        y2: height / 2,
      },
      colorStops: colorStops.map((s) => ({ offset: s.offset, color: s.color })),
    });
  }

  let coords = { x1: 0, y1: height, x2: 0, y2: 0 }; // default to-top

  if (direction === 'to-bottom') {
    coords = { x1: 0, y1: 0, x2: 0, y2: height };
  } else if (direction === 'to-right') {
    coords = { x1: 0, y1: 0, x2: width, y2: 0 };
  } else if (direction === 'to-left') {
    coords = { x1: width, y1: 0, x2: 0, y2: 0 };
  } else if (direction === 'diagonal') {
    coords = { x1: 0, y1: height, x2: width, y2: 0 };
  } else if (direction === 'diagonal-alt') {
    coords = { x1: width, y1: height, x2: 0, y2: 0 };
  }

  return new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords,
    colorStops: colorStops.map((s) => ({ offset: s.offset, color: s.color })),
  });
}

/**
 * Creates a two-color linear gradient in fabric
 */
export function createFabricLinearGradient(
  startColor: string,
  endColor: string,
  direction: 'to-bottom' | 'to-right' | 'diagonal' | 'diagonal-alt' = 'to-bottom',
  width: number = 200,
  height: number = 200
): fabric.Gradient {
  let coords = { x1: 0, y1: 0, x2: 0, y2: height }; // default to-bottom

  if (direction === 'to-right') {
    coords = { x1: 0, y1: 0, x2: width, y2: 0 };
  } else if (direction === 'diagonal') {
    coords = { x1: 0, y1: 0, x2: width, y2: height };
  } else if (direction === 'diagonal-alt') {
    coords = { x1: width, y1: 0, x2: 0, y2: height };
  }

  return new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords,
    colorStops: [
      { offset: 0, color: startColor },
      { offset: 1, color: endColor },
    ],
  });
}

// ----------------------------------------------------
// HSV & RGB COLOR SPACE CONVERSION MATH
// ----------------------------------------------------

export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  v = Math.max(0, Math.min(1, v));

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (h < 60) {
    r1 = c;
    g1 = x;
    b1 = 0;
  } else if (h < 120) {
    r1 = x;
    g1 = c;
    b1 = 0;
  } else if (h < 180) {
    r1 = 0;
    g1 = c;
    b1 = x;
  } else if (h < 240) {
    r1 = 0;
    g1 = x;
    b1 = c;
  } else if (h < 300) {
    r1 = x;
    g1 = 0;
    b1 = c;
  } else {
    r1 = c;
    g1 = 0;
    b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r = Math.max(0, Math.min(255, r)) / 255;
  g = Math.max(0, Math.min(255, g)) / 255;
  b = Math.max(0, Math.min(255, b)) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return { h, s, v };
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = colorToHex(hex).slice(1);
  return {
    r: parseInt(cleanHex.slice(0, 2), 16) || 0,
    g: parseInt(cleanHex.slice(2, 4), 16) || 0,
    b: parseInt(cleanHex.slice(4, 6), 16) || 0,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

export function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

/**
 * Extracts distinct solid hex colors present across canvas objects
 */
export function extractCanvasColors(canvas: fabric.Canvas | null | undefined): string[] {
  if (!canvas) return [];
  const colors = new Set<string>();

  canvas.getObjects().forEach((obj) => {
    if (obj.fill && typeof obj.fill === 'string') {
      const hex = colorToHex(obj.fill);
      if (hex) colors.add(hex.toLowerCase());
    }
    if (obj.stroke && typeof obj.stroke === 'string') {
      const hex = colorToHex(obj.stroke);
      if (hex) colors.add(hex.toLowerCase());
    }
  });

  return Array.from(colors).slice(0, 12);
}

/**
 * Robustly applies a style property to an object, group, or activeSelection
 */
export function applyFabricStyle(
  canvas: fabric.Canvas,
  target: fabric.Object,
  prop: string,
  value: unknown
): void {
  if (target.type === 'activeSelection' || target.type === 'group') {
    (target as fabric.Group).getObjects().forEach((child) => {
      child.set(prop as keyof fabric.Object, value as never);
      child.dirty = true;
      child.setCoords();
    });
  }

  target.set(prop as keyof fabric.Object, value as never);
  target.dirty = true;
  target.setCoords();
  canvas.renderAll();
}

/**
 * Robustly applies a shadow to an object, group, or activeSelection
 */
export function applyFabricShadow(
  canvas: fabric.Canvas,
  target: fabric.Object,
  shadow: fabric.Shadow | undefined
): void {
  if (target.type === 'activeSelection' || target.type === 'group') {
    (target as fabric.Group).getObjects().forEach((child) => {
      child.set('shadow', shadow ? new fabric.Shadow(shadow) : undefined);
      child.dirty = true;
      child.setCoords();
    });
  }

  target.set('shadow', shadow);
  target.dirty = true;
  target.setCoords();
  canvas.renderAll();
}

