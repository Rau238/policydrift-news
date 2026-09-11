'use client';

import type { fabric } from 'fabric';

export interface FontDefinition {
  name: string;
  family: string;
  category: 'Modern Sans' | 'Editorial Serif' | 'Bold Display' | 'Condensed' | 'Monospace' | 'Handwriting';
  googleFontName: string;
}

export const CURATED_FONTS: FontDefinition[] = [
  { name: 'Inter', family: 'Inter, sans-serif', category: 'Modern Sans', googleFontName: 'Inter:wght@400;600;700;800;900' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'Modern Sans', googleFontName: 'Montserrat:wght@400;600;700;800;900' },
  { name: 'Poppins', family: 'Poppins, sans-serif', category: 'Modern Sans', googleFontName: 'Poppins:wght@400;600;700;800;900' },
  { name: 'Outfit', family: 'Outfit, sans-serif', category: 'Modern Sans', googleFontName: 'Outfit:wght@400;600;700;800;900' },
  { name: 'Plus Jakarta Sans', family: '"Plus Jakarta Sans", sans-serif', category: 'Modern Sans', googleFontName: 'Plus+Jakarta+Sans:wght@400;600;700;800' },
  { name: 'Roboto', family: 'Roboto, sans-serif', category: 'Modern Sans', googleFontName: 'Roboto:wght@400;500;700;900' },
  { name: 'Playfair Display', family: '"Playfair Display", serif', category: 'Editorial Serif', googleFontName: 'Playfair+Display:ital,wght@0,400;0,700;0,900;1,400' },
  { name: 'Merriweather', family: 'Merriweather, serif', category: 'Editorial Serif', googleFontName: 'Merriweather:wght@400;700;900' },
  { name: 'Cinzel', family: 'Cinzel, serif', category: 'Editorial Serif', googleFontName: 'Cinzel:wght@600;700;900' },
  { name: 'Lora', family: 'Lora, serif', category: 'Editorial Serif', googleFontName: 'Lora:ital,wght@0,400;0,600;0,700;1,400' },
  { name: 'Bebas Neue', family: '"Bebas Neue", sans-serif', category: 'Bold Display', googleFontName: 'Bebas+Neue' },
  { name: 'Oswald', family: 'Oswald, sans-serif', category: 'Condensed', googleFontName: 'Oswald:wght@500;600;700' },
  { name: 'Anton', family: 'Anton, sans-serif', category: 'Bold Display', googleFontName: 'Anton' },
  { name: 'Syne', family: 'Syne, sans-serif', category: 'Bold Display', googleFontName: 'Syne:wght@700;800' },
  { name: 'Righteous', family: 'Righteous, sans-serif', category: 'Bold Display', googleFontName: 'Righteous' },
  { name: 'Fira Code', family: '"Fira Code", monospace', category: 'Monospace', googleFontName: 'Fira+Code:wght@400;600;700' },
  { name: 'Space Mono', family: '"Space Mono", monospace', category: 'Monospace', googleFontName: 'Space+Mono:wght@400;700' },
  { name: 'Pacifico', family: 'Pacifico, cursive', category: 'Handwriting', googleFontName: 'Pacifico' },
  { name: 'Caveat', family: 'Caveat, cursive', category: 'Handwriting', googleFontName: 'Caveat:wght@600;700' },
];

const loadedFontsSet = new Set<string>();

/**
 * Dynamically loads a Google Web Font into document head and applies it to Fabric.js text
 */
export async function applyFontToCanvas(
  font: FontDefinition | string,
  canvas?: fabric.Canvas | null,
  targetObject?: fabric.Object | null
): Promise<void> {
  const fontDef = typeof font === 'string'
    ? CURATED_FONTS.find((f) => f.name.toLowerCase() === font.toLowerCase() || f.family.toLowerCase().includes(font.toLowerCase())) || {
        name: font,
        family: font,
        category: 'Modern Sans' as const,
        googleFontName: font.replace(/\s+/g, '+'),
      }
    : font;

  if (typeof window !== 'undefined' && !loadedFontsSet.has(fontDef.name)) {
    const linkId = `google-font-${fontDef.name.toLowerCase().replace(/\s+/g, '-')}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontDef.googleFontName}&display=swap`;
      document.head.appendChild(link);
    }
    loadedFontsSet.add(fontDef.name);

    if (document.fonts) {
      try {
        await document.fonts.load(`16px ${fontDef.family}`);
      } catch {
        // Continue if document.fonts.load fails
      }
    }
  }

  // Apply to target object or active object on canvas
  const obj = targetObject || canvas?.getActiveObject();
  if (obj && (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text')) {
    const textObj = obj as fabric.IText;
    textObj.set('fontFamily', fontDef.family);
    textObj.setCoords();
    canvas?.renderAll();
  }
}
