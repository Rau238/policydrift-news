import type { fabric } from 'fabric';
import type { ExportSettings } from '../../types/editor';

/**
 * Export Fabric canvas content as high quality Blob / Data URL without UI artifacts
 */
export function exportCanvasImage(
  canvas: fabric.Canvas,
  settings: ExportSettings
): { dataUrl: string; width: number; height: number; filename: string } {
  const originalZoom = canvas.getZoom();
  const originalWidth = canvas.getWidth();
  const originalHeight = canvas.getHeight();

  // Reset zoom temporarily for clean rasterization at exact pixel bounds
  canvas.setZoom(1);

  let multiplier = settings.scale || 1;
  if (settings.width && originalWidth > 0) {
    multiplier = settings.width / originalWidth;
  }

  const mimeType =
    settings.format === 'jpeg' ? 'image/jpeg' : settings.format === 'webp' ? 'image/webp' : 'image/png';

  const dataUrl = canvas.toDataURL({
    format: settings.format,
    quality: settings.quality,
    multiplier: multiplier,
  });

  // Restore original canvas zoom & viewport
  canvas.setZoom(originalZoom);
  canvas.renderAll();

  const outputWidth = Math.round(originalWidth * multiplier);
  const outputHeight = Math.round(originalHeight * multiplier);
  const ext = settings.format === 'jpeg' ? 'jpg' : settings.format;
  const filename = `photo-edit-${Date.now()}.${ext}`;

  return {
    dataUrl,
    width: outputWidth,
    height: outputHeight,
    filename,
  };
}

/**
 * Export canvas to data URL helper
 */
export function exportCanvasToDataURL(
  canvas: fabric.Canvas,
  options?: { format?: 'png' | 'jpeg' | 'webp'; quality?: number; multiplier?: number }
): string {
  const format = options?.format || 'png';
  const quality = options?.quality ?? 0.95;
  const scale = (options?.multiplier ?? 2) as 1 | 2 | 3;

  const res = exportCanvasImage(canvas, {
    format,
    quality,
    scale,
  });

  return res.dataUrl;
}

/**
 * Trigger direct file download in browser
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
