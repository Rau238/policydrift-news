import { fabric } from 'fabric';
import {
  createFabricMultiGradient,
  type GradientColorStop,
  type GradientDirection,
} from './colors';

/**
 * Center an active object horizontally within canvas bounds
 */
export function centerObjectHorizontally(canvas: fabric.Canvas, obj?: fabric.Object): void {
  const target = obj || canvas.getActiveObject();
  if (!target) return;
  target.centerH();
  target.setCoords();
  canvas.renderAll();
  canvas.fire('object:modified', { target });
}

/**
 * Center an active object vertically within canvas bounds
 */
export function centerObjectVertically(canvas: fabric.Canvas, obj?: fabric.Object): void {
  const target = obj || canvas.getActiveObject();
  if (!target) return;
  target.centerV();
  target.setCoords();
  canvas.renderAll();
  canvas.fire('object:modified', { target });
}

/**
 * Duplicate the currently active object with an offset
 */
export function duplicateActiveObject(canvas: fabric.Canvas): void {
  const active = canvas.getActiveObject();
  if (!active) return;

  active.clone((cloned: fabric.Object) => {
    canvas.discardActiveObject();
    cloned.set({
      left: (active.left || 0) + 24,
      top: (active.top || 0) + 24,
      evented: true,
    });

    if (cloned.type === 'activeSelection') {
      // active selection needs a reference to the canvas
      (cloned as fabric.ActiveSelection).canvas = canvas;
      (cloned as fabric.ActiveSelection).forEachObject((obj: fabric.Object) => {
        canvas.add(obj);
      });
      cloned.setCoords();
    } else {
      canvas.add(cloned);
    }

    canvas.setActiveObject(cloned);
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: cloned });
  });
}

/**
 * Delete currently active object or selection
 */
export function deleteActiveObject(canvas: fabric.Canvas): void {
  const active = canvas.getActiveObject();
  if (!active) return;

  if (active.type === 'activeSelection') {
    (active as fabric.ActiveSelection).forEachObject((obj) => {
      canvas.remove(obj);
    });
  } else {
    canvas.remove(active);
  }

  canvas.discardActiveObject();
  canvas.requestRenderAll();
  canvas.fire('object:modified');
}

/**
 * Layer order management
 */
export function bringObjectToFront(canvas: fabric.Canvas): void {
  const active = canvas.getActiveObject();
  if (!active) return;
  canvas.bringToFront(active);
  canvas.renderAll();
  canvas.fire('object:modified', { target: active });
}

export function sendObjectToBack(canvas: fabric.Canvas): void {
  const active = canvas.getActiveObject();
  if (!active) return;
  canvas.sendToBack(active);
  canvas.renderAll();
  canvas.fire('object:modified', { target: active });
}

export function bringObjectForward(canvas: fabric.Canvas): void {
  const active = canvas.getActiveObject();
  if (!active) return;
  canvas.bringForward(active);
  canvas.renderAll();
  canvas.fire('object:modified', { target: active });
}

export function sendObjectBackward(canvas: fabric.Canvas): void {
  const active = canvas.getActiveObject();
  if (!active) return;
  canvas.sendBackwards(active);
  canvas.renderAll();
  canvas.fire('object:modified', { target: active });
}

/**
 * Alignment & Snapping Guides with Visual Smart Lines
 */
export function initSnappingGuides(canvas: fabric.Canvas): () => void {
  const snapThreshold = 10;
  let guideLineX: fabric.Line | null = null;
  let guideLineY: fabric.Line | null = null;

  const createGuide = (coords: [number, number, number, number]) => {
    return new fabric.Line(coords, {
      stroke: '#a855f7', // purple-500 smart guide
      strokeWidth: 1.5,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
  };

  const onObjectMoving = (e: fabric.IEvent) => {
    const obj = e.target;
    if (!obj) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const objCenter = obj.getCenterPoint();

    const PointClass = fabric?.Point || (window as unknown as { fabric?: { Point: typeof fabric.Point } })?.fabric?.Point;

    // Snap Horizontally (Center X)
    if (Math.abs(objCenter.x - canvasWidth / 2) < snapThreshold) {
      if (PointClass) {
        obj.setPositionByOrigin(new PointClass(canvasWidth / 2, objCenter.y), 'center', 'center');
      } else {
        obj.set({ left: (canvasWidth - (obj.getScaledWidth() || 0)) / 2 });
      }
      obj.setCoords();

      if (!guideLineX) {
        guideLineX = createGuide([canvasWidth / 2, 0, canvasWidth / 2, canvasHeight]);
        canvas.add(guideLineX);
      }
    } else if (guideLineX) {
      canvas.remove(guideLineX);
      guideLineX = null;
    }

    // Snap Vertically (Center Y)
    if (Math.abs(objCenter.y - canvasHeight / 2) < snapThreshold) {
      if (PointClass) {
        obj.setPositionByOrigin(new PointClass(objCenter.x, canvasHeight / 2), 'center', 'center');
      } else {
        obj.set({ top: (canvasHeight - (obj.getScaledHeight() || 0)) / 2 });
      }
      obj.setCoords();

      if (!guideLineY) {
        guideLineY = createGuide([0, canvasHeight / 2, canvasWidth, canvasHeight / 2]);
        canvas.add(guideLineY);
      }
    } else if (guideLineY) {
      canvas.remove(guideLineY);
      guideLineY = null;
    }
  };

  const clearGuides = () => {
    if (guideLineX) {
      canvas.remove(guideLineX);
      guideLineX = null;
    }
    if (guideLineY) {
      canvas.remove(guideLineY);
      guideLineY = null;
    }
    canvas.requestRenderAll();
  };

  canvas.on('object:moving', onObjectMoving);
  canvas.on('object:modified', clearGuides);
  canvas.on('mouse:up', clearGuides);

  return () => {
    canvas.off('object:moving', onObjectMoving);
    canvas.off('object:modified', clearGuides);
    canvas.off('mouse:up', clearGuides);
    clearGuides();
  };
}

/**
 * Framing and Masking Shapes for Canvas Images
 */
export type ImageFrameShape =
  | 'none'
  | 'rounded'
  | 'circle'
  | 'pill'
  | 'arch'
  | 'hexagon'
  | 'star'
  | 'diamond'
  | 'heart';

export function applyImageFrame(
  img: fabric.Image,
  frameType: ImageFrameShape,
  cornerRadius: number = 32
): void {
  const w = img.width || 400;
  const h = img.height || 400;
  const minDim = Math.min(w, h);

  if (frameType === 'none') {
    img.clipPath = undefined;
    return;
  }

  if (frameType === 'rounded') {
    img.clipPath = new fabric.Rect({
      width: w,
      height: h,
      rx: cornerRadius,
      ry: cornerRadius,
      originX: 'center',
      originY: 'center',
    });
    return;
  }

  if (frameType === 'circle') {
    img.clipPath = new fabric.Circle({
      radius: minDim / 2,
      originX: 'center',
      originY: 'center',
    });
    return;
  }

  if (frameType === 'pill') {
    img.clipPath = new fabric.Rect({
      width: w,
      height: h,
      rx: minDim / 2,
      ry: minDim / 2,
      originX: 'center',
      originY: 'center',
    });
    return;
  }

  if (frameType === 'arch') {
    const r = w / 2;
    const pathStr = `M ${-r} ${h / 2} L ${-r} ${-h / 2 + r} A ${r} ${r} 0 0 1 ${r} ${-h / 2 + r} L ${r} ${h / 2} Z`;
    img.clipPath = new fabric.Path(pathStr, {
      originX: 'center',
      originY: 'center',
    });
    return;
  }

  if (frameType === 'hexagon') {
    const points = [
      { x: 0, y: -minDim / 2 },
      { x: (minDim * Math.sqrt(3)) / 4, y: -minDim / 4 },
      { x: (minDim * Math.sqrt(3)) / 4, y: minDim / 4 },
      { x: 0, y: minDim / 2 },
      { x: -(minDim * Math.sqrt(3)) / 4, y: minDim / 4 },
      { x: -(minDim * Math.sqrt(3)) / 4, y: -minDim / 4 },
    ];
    img.clipPath = new fabric.Polygon(points, {
      originX: 'center',
      originY: 'center',
    });
    return;
  }

  if (frameType === 'diamond') {
    const points = [
      { x: 0, y: -h / 2 },
      { x: w / 2, y: 0 },
      { x: 0, y: h / 2 },
      { x: -w / 2, y: 0 },
    ];
    img.clipPath = new fabric.Polygon(points, {
      originX: 'center',
      originY: 'center',
    });
    return;
  }

  if (frameType === 'star') {
    const starPoints: { x: number; y: number }[] = [];
    const outerR = minDim / 2;
    const innerR = outerR * 0.45;
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      starPoints.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
    }
    img.clipPath = new fabric.Polygon(starPoints, {
      originX: 'center',
      originY: 'center',
    });
    return;
  }

  if (frameType === 'heart') {
    const s = minDim / 32;
    const pathStr = `M 0 ${-8 * s} C ${-8 * s} ${-20 * s} ${-20 * s} ${-4 * s} 0 ${16 * s} C ${20 * s} ${-4 * s} ${8 * s} ${-20 * s} 0 ${-8 * s} Z`;
    img.clipPath = new fabric.Path(pathStr, {
      originX: 'center',
      originY: 'center',
    });
    return;
  }
}

/**
 * Per-Word / Per-Character Text Color & Styling
 * If user has selected/highlighted a substring in IText, only that selection is updated!
 */
export function applySelectiveTextColor(
  canvas: fabric.Canvas,
  textObj: fabric.IText,
  color: string
): void {
  if (
    typeof textObj.selectionStart === 'number' &&
    typeof textObj.selectionEnd === 'number' &&
    textObj.selectionStart !== textObj.selectionEnd
  ) {
    textObj.setSelectionStyles({ fill: color });
  } else {
    textObj.set({ fill: color });
    textObj.styles = {};
  }
  canvas.renderAll();
  canvas.fire('object:modified', { target: textObj });
}

export function applySelectiveTextHighlight(
  canvas: fabric.Canvas,
  textObj: fabric.IText,
  bgColor: string | undefined
): void {
  if (
    typeof textObj.selectionStart === 'number' &&
    typeof textObj.selectionEnd === 'number' &&
    textObj.selectionStart !== textObj.selectionEnd
  ) {
    textObj.setSelectionStyles({ textBackgroundColor: bgColor || '' });
  } else {
    textObj.set({ textBackgroundColor: bgColor || '' });
  }
  canvas.renderAll();
  canvas.fire('object:modified', { target: textObj });
}

const renderCanvaSidePill = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: unknown,
  fabricObject: fabric.Object
) => {
  const size = 22;
  const thickness = 6;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
  ctx.fillStyle = '#8b5cf6';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (typeof (ctx as unknown as { roundRect?: unknown }).roundRect === 'function') {
    (ctx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(
      -thickness / 2,
      -size / 2,
      thickness,
      size,
      3
    );
  } else {
    ctx.rect(-thickness / 2, -size / 2, thickness, size);
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

const renderCanvaCorner = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: unknown,
  fabricObject: fabric.Object
) => {
  const radius = 5.5;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

/**
 * Configure object controls to ensure Canva-style aesthetics:
 * 1. Solid vibrant purple bounding border.
 * 2. Side vertical pill handles (ml, mr) for text wrapping/truncation.
 * 3. Sleek corner control circles.
 * 4. Middle vertical handles (mt, mb) hidden on text.
 */
export function configureObjectControls(obj: fabric.Object): void {
  obj.set({
    transparentCorners: false,
    cornerColor: '#ffffff',
    cornerStrokeColor: '#8b5cf6',
    borderColor: '#8b5cf6',
    cornerSize: 10,
    cornerStyle: 'circle',
    borderScaleFactor: 2,
    padding: 0,
    borderDashArray: [], // Solid Canva bounding box
  });

  // Assign Canva custom handle renderers
  if (obj.controls) {
    if (obj.controls.ml) obj.controls.ml.render = renderCanvaSidePill;
    if (obj.controls.mr) obj.controls.mr.render = renderCanvaSidePill;
    if (obj.controls.tl) obj.controls.tl.render = renderCanvaCorner;
    if (obj.controls.tr) obj.controls.tr.render = renderCanvaCorner;
    if (obj.controls.bl) obj.controls.bl.render = renderCanvaCorner;
    if (obj.controls.br) obj.controls.br.render = renderCanvaCorner;
  }

  if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
    obj.setControlsVisibility({
      mt: false, // hide top-middle handle
      mb: false, // hide bottom-middle handle
      ml: true,  // middle-left truncates / reflows wrap width
      mr: true,  // middle-right truncates / reflows wrap width
      tl: true,  // corner increases height & width
      tr: true,  // corner increases height & width
      bl: true,  // corner increases height & width
      br: true,  // corner increases height & width
      mtr: true, // rotation handle
    });
  }
}

export interface BottomSplashPreset {
  id: string;
  name: string;
  description: string;
  startColor: string;
  midColor?: string;
  endColor: string;
  iconColor: string;
}

export const BOTTOM_SPLASH_PRESETS: BottomSplashPreset[] = [
  {
    id: 'dark_cinema',
    name: 'Dark Cinematic Shadow',
    description: 'Deep black-to-transparent vignette for maximum text contrast',
    startColor: 'rgba(0, 0, 0, 0.95)',
    midColor: 'rgba(0, 0, 0, 0.65)',
    endColor: 'rgba(0, 0, 0, 0)',
    iconColor: '#000000',
  },
  {
    id: 'cyber_purple',
    name: 'Cyber Purple Neon Splash',
    description: 'Vibrant neon purple atmospheric gradient glow',
    startColor: 'rgba(109, 40, 217, 0.92)',
    midColor: 'rgba(147, 51, 234, 0.55)',
    endColor: 'rgba(88, 28, 135, 0)',
    iconColor: '#a855f7',
  },
  {
    id: 'ocean_cyan',
    name: 'Ocean Teal & Cyan Splash',
    description: 'Electric cyan to deep teal oceanic splash',
    startColor: 'rgba(15, 118, 110, 0.92)',
    midColor: 'rgba(6, 182, 212, 0.55)',
    endColor: 'rgba(8, 145, 178, 0)',
    iconColor: '#06b6d4',
  },
  {
    id: 'sunset_amber',
    name: 'Sunset Gold & Amber Flare',
    description: 'Warm gold-to-amber sunset flare for breaking editorial cards',
    startColor: 'rgba(180, 83, 9, 0.92)',
    midColor: 'rgba(245, 158, 11, 0.55)',
    endColor: 'rgba(217, 119, 6, 0)',
    iconColor: '#f59e0b',
  },
  {
    id: 'crimson_wire',
    name: 'Crimson Red / Breaking Wire',
    description: 'Urgent red alert gradient for high-priority news cards',
    startColor: 'rgba(159, 18, 57, 0.92)',
    midColor: 'rgba(225, 29, 72, 0.55)',
    endColor: 'rgba(190, 18, 60, 0)',
    iconColor: '#f43f5e',
  },
  {
    id: 'midnight_navy',
    name: 'Midnight Navy Studio',
    description: 'Polished deep slate-navy shadow for financial and corporate cards',
    startColor: 'rgba(15, 23, 42, 0.96)',
    midColor: 'rgba(30, 41, 59, 0.65)',
    endColor: 'rgba(15, 23, 42, 0)',
    iconColor: '#334155',
  },
  {
    id: 'emerald_mint',
    name: 'Emerald Luxury Glow',
    description: 'Lush green-to-mint gradient splash',
    startColor: 'rgba(6, 78, 59, 0.92)',
    midColor: 'rgba(16, 185, 129, 0.55)',
    endColor: 'rgba(5, 150, 105, 0)',
    iconColor: '#10b981',
  },
  {
    id: 'neon_magenta',
    name: 'Neon Pink & Hot Magenta',
    description: 'Dynamic pop-culture hot pink glow',
    startColor: 'rgba(157, 23, 77, 0.92)',
    midColor: 'rgba(236, 72, 153, 0.55)',
    endColor: 'rgba(190, 24, 93, 0)',
    iconColor: '#ec4899',
  },
  {
    id: 'cyberpunk_dualtone',
    name: 'Cyberpunk Neon Pink & Cyan',
    description: 'Electric magenta to cyan contrast flare for high-energy cards',
    startColor: 'rgba(236, 72, 153, 0.95)',
    midColor: 'rgba(6, 182, 212, 0.60)',
    endColor: 'rgba(30, 27, 75, 0)',
    iconColor: '#06b6d4',
  },
  {
    id: 'tokyo_synthwave',
    name: 'Tokyo Synthwave Violet & Coral',
    description: '80s retro grid dusk glow for pop culture and trends',
    startColor: 'rgba(88, 28, 135, 0.95)',
    midColor: 'rgba(244, 63, 94, 0.65)',
    endColor: 'rgba(251, 146, 60, 0)',
    iconColor: '#f43f5e',
  },
  {
    id: 'luxury_gold',
    name: 'Royal Obsidian & Imperial Gold',
    description: 'Deep gold luxury aura for awards and prime releases',
    startColor: 'rgba(20, 20, 20, 0.98)',
    midColor: 'rgba(217, 119, 6, 0.60)',
    endColor: 'rgba(251, 191, 36, 0)',
    iconColor: '#fbbf24',
  },
  {
    id: 'matrix_digital',
    name: 'Matrix Digital Cyber Green',
    description: 'Cyber terminal acid green data glow for tech and AI',
    startColor: 'rgba(5, 46, 22, 0.96)',
    midColor: 'rgba(34, 197, 94, 0.60)',
    endColor: 'rgba(20, 83, 45, 0)',
    iconColor: '#22c55e',
  },
  {
    id: 'solar_flare',
    name: 'Solar Flare Orange & Crimson',
    description: 'Intense solar explosion gradient for urgent breaking alerts',
    startColor: 'rgba(153, 27, 27, 0.96)',
    midColor: 'rgba(234, 88, 12, 0.65)',
    endColor: 'rgba(251, 146, 60, 0)',
    iconColor: '#ea580c',
  },
  {
    id: 'ice_frost',
    name: 'Arctic Ice & Frozen Cobalt',
    description: 'Crystal cold blue frost vignette for tech and weather',
    startColor: 'rgba(15, 23, 42, 0.95)',
    midColor: 'rgba(14, 165, 233, 0.55)',
    endColor: 'rgba(186, 230, 253, 0)',
    iconColor: '#38bdf8',
  },
  {
    id: 'smoke_charcoal',
    name: 'Smoky Charcoal & Velvet Black',
    description: 'Ultra-clean dark studio shadow for minimalist editorial',
    startColor: 'rgba(15, 15, 18, 0.98)',
    midColor: 'rgba(39, 39, 42, 0.65)',
    endColor: 'rgba(0, 0, 0, 0)',
    iconColor: '#27272a',
  },
  {
    id: 'party_aurora',
    name: 'Northern Aurora Borealis',
    description: 'Multi-spectral emerald to violet cosmic radiance',
    startColor: 'rgba(15, 23, 42, 0.96)',
    midColor: 'rgba(16, 185, 129, 0.60)',
    endColor: 'rgba(139, 92, 246, 0)',
    iconColor: '#8b5cf6',
  },
];

/**
 * Add a Bottom Gradient / Color Shadow Splash or Full Canvas Atmospheric Glow
 * over background/image layers and under text layers
 */
export function addBottomGradientSplash(
  canvas: fabric.Canvas,
  projectWidth: number,
  projectHeight: number,
  preset: BottomSplashPreset,
  splashHeightPct: number = 0.65
): fabric.Rect {
  const isFull = splashHeightPct >= 0.98;
  const height = isFull ? projectHeight : Math.round(projectHeight * splashHeightPct);
  const top = isFull ? 0 : projectHeight - height;

  const colorStops = preset.midColor
    ? [
        { offset: 0, color: preset.startColor },
        { offset: isFull ? 0.45 : 0.5, color: preset.midColor },
        { offset: 1, color: preset.endColor },
      ]
    : [
        { offset: 0, color: preset.startColor },
        { offset: 1, color: preset.endColor },
      ];

  const gradient = new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords: {
      x1: 0,
      y1: height, // bottom of rect
      x2: 0,
      y2: 0,      // top of rect (transparent)
    },
    colorStops,
  });

  const splashRect = new fabric.Rect({
    left: 0,
    top: top,
    width: projectWidth,
    height: height,
    fill: gradient,
    selectable: true,
    evented: true,
    opacity: 0.95,
  });

  (splashRect as unknown as { id: string; customName: string; isSplash: boolean }).id = `splash-${Date.now()}`;
  (splashRect as unknown as { customName: string }).customName = isFull
    ? `${preset.name} (Full Canvas)`
    : `${preset.name} (Bottom Overlay)`;
  (splashRect as unknown as { isSplash: boolean }).isSplash = true;

  configureObjectControls(splashRect);

  // Determine insertion point: place right above images/backgrounds and below text layers
  const objs = canvas.getObjects();
  let insertIndex = 0;
  for (let i = 0; i < objs.length; i++) {
    const type = objs[i].type;
    const isText = type === 'i-text' || type === 'textbox' || type === 'text';
    if (!isText) {
      insertIndex = i + 1;
    }
  }

  canvas.insertAt(splashRect, insertIndex, false);
  canvas.setActiveObject(splashRect);
  canvas.renderAll();
  return splashRect;
}

/**
 * Resize and fit any selected element/object to cover the full canvas (100% width and height)
 */
export function fitObjectToCanvas(
  canvas: fabric.Canvas,
  obj: fabric.Object,
  projectWidth: number,
  projectHeight: number
) {
  if (obj.type === 'image') {
    const scaleW = projectWidth / (obj.width || 1);
    const scaleH = projectHeight / (obj.height || 1);
    const maxScale = Math.max(scaleW, scaleH);
    obj.set({
      originX: 'center',
      originY: 'center',
      left: projectWidth / 2,
      top: projectHeight / 2,
      scaleX: maxScale,
      scaleY: maxScale,
      angle: 0,
    });
  } else {
    // For rect, shapes, color splash overlays
    obj.set({
      originX: 'left',
      originY: 'top',
      left: 0,
      top: 0,
      width: projectWidth,
      height: projectHeight,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
    });
  }
  obj.setCoords();
  canvas.renderAll();
}

/**
 * Add a Custom Multi-Stop Gradient Shadow / Overlay to Canvas
 */
export function addCustomGradientOverlay(
  canvas: fabric.Canvas,
  projectWidth: number,
  projectHeight: number,
  colorStops: GradientColorStop[],
  direction: GradientDirection = 'to-top',
  isFullCanvas: boolean = false,
  customName: string = 'Custom Gradient Overlay'
): fabric.Rect {
  const height = isFullCanvas ? projectHeight : Math.round(projectHeight * 0.68);
  const top = isFullCanvas ? 0 : projectHeight - height;

  const gradient = createFabricMultiGradient(colorStops, direction, projectWidth, height);

  const rect = new fabric.Rect({
    left: 0,
    top: top,
    width: projectWidth,
    height: height,
    fill: gradient,
    selectable: true,
    evented: true,
    opacity: 0.95,
  });

  (rect as unknown as { id: string; customName: string; isSplash: boolean }).id = `overlay-${Date.now()}`;
  (rect as unknown as { customName: string }).customName = customName;
  (rect as unknown as { isSplash: boolean }).isSplash = true;

  configureObjectControls(rect);

  // Insert above backgrounds/images and below text layers
  const objs = canvas.getObjects();
  let insertIndex = 0;
  for (let i = 0; i < objs.length; i++) {
    const isText = objs[i].type === 'i-text' || objs[i].type === 'textbox' || objs[i].type === 'text';
    if (!isText) {
      insertIndex = i + 1;
    }
  }

  canvas.insertAt(rect, insertIndex, false);
  canvas.setActiveObject(rect);
  canvas.renderAll();
  return rect;
}



