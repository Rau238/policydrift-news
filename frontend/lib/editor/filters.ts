import type { fabric } from 'fabric';
import type { FilterPreset, ImageAdjustments } from '../../types/editor';

/**
 * Apply non-destructive adjustments and preset filters to an active Fabric.js Image object
 */
export async function applyImageFilters(
  imgObject: fabric.Image,
  adjustments: ImageAdjustments,
  preset: FilterPreset,
  fabricInstance: typeof fabric
): Promise<void> {
  if (!imgObject || imgObject.type !== 'image') return;

  const filters: fabric.IBaseFilter[] = [];

  // 1. Basic Adjustments
  if (adjustments.brightness !== 0) {
    filters.push(new fabricInstance.Image.filters.Brightness({ brightness: adjustments.brightness }));
  }

  if (adjustments.contrast !== 0) {
    filters.push(new fabricInstance.Image.filters.Contrast({ contrast: adjustments.contrast }));
  }

  if (adjustments.saturation !== 0) {
    filters.push(new fabricInstance.Image.filters.Saturation({ saturation: adjustments.saturation }));
  }

  if (adjustments.hue !== 0) {
    filters.push(new fabricInstance.Image.filters.HueRotation({ rotation: adjustments.hue }));
  }

  if (adjustments.blur > 0) {
    filters.push(new fabricInstance.Image.filters.Blur({ blur: adjustments.blur }));
  }

  // 2. Preset Filters
  switch (preset) {
    case 'grayscale':
    case 'blackwhite':
      filters.push(new fabricInstance.Image.filters.Grayscale());
      if (preset === 'blackwhite') {
        filters.push(new fabricInstance.Image.filters.Contrast({ contrast: 0.35 }));
      }
      break;

    case 'sepia':
      filters.push(new fabricInstance.Image.filters.Sepia());
      break;

    case 'vintage':
      filters.push(new fabricInstance.Image.filters.Sepia());
      filters.push(new fabricInstance.Image.filters.Contrast({ contrast: 0.15 }));
      filters.push(new fabricInstance.Image.filters.Brightness({ brightness: 0.05 }));
      break;

    case 'warm':
      filters.push(
        new fabricInstance.Image.filters.BlendColor({
          color: '#f59e0b',
          mode: 'tint',
          alpha: 0.15,
        })
      );
      break;

    case 'cool':
      filters.push(
        new fabricInstance.Image.filters.BlendColor({
          color: '#3b82f6',
          mode: 'tint',
          alpha: 0.15,
        })
      );
      break;

    case 'cinematic':
      filters.push(new fabricInstance.Image.filters.Contrast({ contrast: 0.25 }));
      filters.push(new fabricInstance.Image.filters.Saturation({ saturation: -0.15 }));
      filters.push(
        new fabricInstance.Image.filters.BlendColor({
          color: '#0f766e',
          mode: 'tint',
          alpha: 0.12,
        })
      );
      break;

    case 'bright':
      filters.push(new fabricInstance.Image.filters.Brightness({ brightness: 0.2 }));
      filters.push(new fabricInstance.Image.filters.Contrast({ contrast: 0.1 }));
      break;

    case 'dark':
      filters.push(new fabricInstance.Image.filters.Brightness({ brightness: -0.25 }));
      filters.push(new fabricInstance.Image.filters.Contrast({ contrast: 0.2 }));
      break;

    case 'highcontrast':
      filters.push(new fabricInstance.Image.filters.Contrast({ contrast: 0.5 }));
      filters.push(new fabricInstance.Image.filters.Saturation({ saturation: 0.2 }));
      break;

    case 'cyberpunk':
      filters.push(new fabricInstance.Image.filters.Contrast({ contrast: 0.3 }));
      filters.push(new fabricInstance.Image.filters.Saturation({ saturation: 0.4 }));
      filters.push(new fabricInstance.Image.filters.HueRotation({ rotation: 0.35 }));
      break;

    case 'original':
    default:
      break;
  }

  imgObject.filters = filters;
  imgObject.opacity = adjustments.opacity ?? 1;

  await new Promise<void>((resolve) => {
    imgObject.applyFilters();
    resolve();
  });
}
