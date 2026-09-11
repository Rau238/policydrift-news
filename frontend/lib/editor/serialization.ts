import type { fabric } from 'fabric';
import type { ProjectJSON, ProjectMetadata } from '../../types/editor';

/**
 * Serialize Fabric canvas state to structured JSON schema
 */
export function serializeProject(
  canvas: fabric.Canvas,
  metadata: ProjectMetadata,
  zoom: number
): ProjectJSON {
  const fabricData = canvas.toJSON([
    'id',
    'customName',
    'selectable',
    'locked',
    'lockMovementX',
    'lockMovementY',
    'lockRotation',
    'lockScalingX',
    'lockScalingY',
    'filters',
  ]);

  return {
    version: 1,
    canvas: {
      width: metadata.width,
      height: metadata.height,
      background: metadata.backgroundColor || '#ffffff',
    },
    objects: (fabricData.objects as unknown) as Record<string, unknown>[],
    settings: {
      zoom: zoom || 1,
    },
  };
}

/**
 * Validate and hydrate JSON schema into Fabric canvas
 */
export function deserializeProject(
  canvas: fabric.Canvas,
  projectData: ProjectJSON,
  onComplete?: () => void
): boolean {
  if (!projectData || !projectData.canvas || !Array.isArray(projectData.objects)) {
    return false;
  }

  canvas.setWidth(projectData.canvas.width || 1200);
  canvas.setHeight(projectData.canvas.height || 800);
  canvas.backgroundColor = projectData.canvas.background || '#ffffff';

  canvas.loadFromJSON(
    {
      version: '5.3.0',
      objects: projectData.objects,
      background: projectData.canvas.background,
    },
    () => {
      canvas.renderAll();
      if (onComplete) onComplete();
    }
  );

  return true;
}
