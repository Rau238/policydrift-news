'use client';

import React from 'react';
import { Editor } from './editor/Editor';
import type { SocialAspectRatio } from './SocialCardCanvas';
import { useEditorStore } from '../store/editorStore';

export interface AdvanceEditorSettings {
  // Framing & Canvas Transform
  aspectRatio: SocialAspectRatio;
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  frameShape: 'full' | 'circle' | 'arch' | 'card';

  // Filters & Color Grading
  preset: 'normal' | 'vibrant' | 'cinematic' | 'noir' | 'sunset' | 'midnight' | 'sepia' | 'cyberpunk';
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hueRotate: number;
  sepia: number;

  // Lighting & Overlays
  overlayDarkness: number;
  overlayStyle: 'bottom' | 'radial' | 'full' | 'subtle' | 'none';
  ambientAura: 'teal' | 'emerald' | 'blue' | 'amber' | 'rose' | 'none';
  canvasBgColor: string;

  // Primary Headline Layer
  customTitle: string;
  fontFamily: string;
  fontSizeMultiplier: number;
  fontWeight: '400' | '600' | '700' | '800' | '900';
  isItalic: boolean;
  isUppercase: boolean;
  lineHeightMultiplier: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  textShadow: 'none' | 'soft' | 'cinema' | 'glow' | 'outline';
  textPosition: 'bottom' | 'center' | 'top' | 'custom';
  textCustomXOffset: number;
  textCustomYOffset: number;
  textMaxWidthPct: number;
  maxLines: number;
  textBoxBg: 'none' | 'glass' | 'solid-dark' | 'gradient';

  // Secondary Subtitle
  showSubtitle: boolean;
  subtitleText: string;
  subtitleFontSizeMultiplier: number;
  subtitleColor: string;
  subtitleCustomX: number;
  subtitleCustomY: number;
  subtitleFontWeight: '400' | '600' | '700' | '800' | '900';

  // Body Description
  showDescription: boolean;
  descriptionText: string;
  descriptionColor: string;
  descriptionFontSizeMultiplier: number;
  descriptionCustomX: number;
  descriptionCustomY: number;

  // Bullet Points
  showBullets: boolean;
  bulletItems: string[];
  bulletColor: string;
  bulletCustomX: number;
  bulletCustomY: number;

  // Call To Action (CTA)
  showCTA: boolean;
  ctaText: string;
  ctaBgColor: string;
  ctaTextColor: string;
  ctaCustomX: number;
  ctaCustomY: number;

  // Highlighting
  highlightWords: string;
  highlightColor: string;
  highlightStyle: 'text' | 'box';

  // Badges & Category Pill
  showCategoryBadge: boolean;
  categoryBadgeBg: string;
  categoryBadgeTextColor: string;
  categoryBadgeStyle: 'pill' | 'outline' | 'minimal' | 'banner' | 'tag';

  // Branding & Logo
  showLogo: boolean;
  logoVariant: 'color' | 'white' | 'dark' | 'glass' | 'glow' | 'badge';
  logoSize: number;
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';

  // Domain Watermark
  showWebsite: boolean;
  websiteText: string;
  websiteColor: string;
  websitePosition: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-center';

  // Publish Date Stamp
  showDate: boolean;
  dateColor: string;
  datePosition: 'bottom-left' | 'bottom-right' | 'top-right';

  // Social Handle Icons
  selectedSocialIcon: 'all' | 'custom' | 'x' | 'instagram' | 'facebook' | 'linkedin' | 'youtube';
  customLogoUrl: string | null;
  socialIconColor: string;
}

interface Props {
  isOpen: boolean;
  imageUrl?: string | null;
  initialTitle: string;
  initialCategory: string;
  initialAspectRatio?: SocialAspectRatio;
  onClose: () => void;
  onApply: (customizedDataUrl: string, settings: AdvanceEditorSettings) => void;
}

export function AdvancedImageEditorModal({
  isOpen,
  imageUrl,
  initialTitle,
  initialCategory,
  initialAspectRatio = '1.91:1',
  onClose,
  onApply,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex flex-col bg-slate-950 text-white font-sans antialiased animate-in fade-in duration-150"
    >
      <Editor
        isModal={true}
        initialImageUrl={imageUrl}
        initialTitle={initialTitle}
        initialCategory={initialCategory}
        initialAspectRatio={initialAspectRatio}
        onClose={onClose}
        onApply={(dataUrl) => {
          const project = useEditorStore.getState().project;
          let matchedRatio: SocialAspectRatio = initialAspectRatio || '1:1';
          if (project.width === 1080 && project.height === 1920) matchedRatio = '9:16';
          else if (project.width === 1200 && project.height === 630) matchedRatio = '1.91:1';
          else if (project.width === 1200 && project.height === 675) matchedRatio = '16:9';
          else if (project.width === 1080 && project.height === 1080) matchedRatio = '1:1';
          else if (Math.abs(project.width / project.height - 1) < 0.1) matchedRatio = '1:1';
          else if (Math.abs(project.width / project.height - 9 / 16) < 0.1) matchedRatio = '9:16';
          else if (Math.abs(project.width / project.height - 16 / 9) < 0.1) matchedRatio = '16:9';
          else if (Math.abs(project.width / project.height - 1.91) < 0.15) matchedRatio = '1.91:1';

          onApply(dataUrl, {
            aspectRatio: matchedRatio,
            zoom: 1,
            panX: 0,
            panY: 0,
            rotation: 0,
            flipH: false,
            flipV: false,
            frameShape: 'full',
            preset: 'normal',
            brightness: 0,
            contrast: 0,
            saturation: 0,
            blur: 0,
            hueRotate: 0,
            sepia: 0,
            overlayDarkness: 0.5,
            overlayStyle: 'bottom',
            ambientAura: 'none',
            canvasBgColor: '#000000',
            customTitle: initialTitle,
            fontFamily: 'Inter',
            fontSizeMultiplier: 1.0,
            fontWeight: '700',
            isItalic: false,
            isUppercase: false,
            lineHeightMultiplier: 1.25,
            letterSpacing: 0,
            textAlign: 'left',
            textColor: '#ffffff',
            textShadow: 'soft',
            textPosition: 'bottom',
            textCustomXOffset: 0,
            textCustomYOffset: 0,
            textMaxWidthPct: 90,
            maxLines: 4,
            textBoxBg: 'none',
            showSubtitle: false,
            subtitleText: '',
            subtitleFontSizeMultiplier: 1.0,
            subtitleColor: '#e2e8f0',
            subtitleCustomX: 50,
            subtitleCustomY: 60,
            subtitleFontWeight: '600',
            showDescription: false,
            descriptionText: '',
            descriptionColor: '#cbd5e1',
            descriptionFontSizeMultiplier: 1.0,
            descriptionCustomX: 50,
            descriptionCustomY: 70,
            showBullets: false,
            bulletItems: [],
            bulletColor: '#cbd5e1',
            bulletCustomX: 50,
            bulletCustomY: 80,
            showCTA: false,
            ctaText: '',
            ctaBgColor: '#2563eb',
            ctaTextColor: '#ffffff',
            ctaCustomX: 85,
            ctaCustomY: 85,
            highlightWords: '',
            highlightColor: '#facc15',
            highlightStyle: 'text',
            showCategoryBadge: Boolean(initialCategory),
            categoryBadgeBg: '#2563eb',
            categoryBadgeTextColor: '#ffffff',
            categoryBadgeStyle: 'pill',
            showLogo: true,
            logoVariant: 'color',
            logoSize: 42,
            logoPosition: 'top-left',
            showWebsite: true,
            websiteText: 'policydrift.com',
            websiteColor: '#94a3b8',
            websitePosition: 'bottom-left',
            showDate: false,
            dateColor: '#94a3b8',
            datePosition: 'bottom-left',
            selectedSocialIcon: 'all',
            customLogoUrl: null,
            socialIconColor: '#94a3b8',
          });
          onClose();
        }}
      />
    </div>
  );
}
