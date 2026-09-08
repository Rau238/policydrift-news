'use client';

import { useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { decodeHtmlEntities } from '@/lib/sanitize';

type StoryImageItem = {
  src: string;
  alt: string;
  title: string;
  sourceName?: string;
};

type Props = {
  mainImageSrc: string;
  mainTitle: string;
  category: string;
  relatedImages?: StoryImageItem[];
};

export function ParticleStoryImageStack({
  mainImageSrc,
  mainTitle,
  category,
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const cleanTitle = decodeHtmlEntities(mainTitle);

  return (
    <>
      <div className="relative w-full max-w-lg sm:max-w-xl mx-auto overflow-hidden rounded-xl sm:rounded-2xl bg-slate-950 shadow-xs group">
        <div className="relative h-[150px] xs:h-[180px] sm:h-[210px] md:h-[240px] w-full overflow-hidden bg-slate-950">
          <RemoteStoryImage
            src={mainImageSrc}
            alt={cleanTitle}
            title={cleanTitle}
            category={category}
            priority
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.01]"
          />
          {/* Subtle gradient vignette at the bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          {/* Fullscreen Expand Button on Hover */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute right-3 bottom-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-black/60 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/80"
            aria-label="View full image"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="text-[11px] font-semibold">Expand</span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col items-center justify-center rounded-2xl bg-black p-2 sm:p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-3 top-3 z-30 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30 active:scale-95"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[16/10] w-full max-h-[80vh] overflow-hidden rounded-xl">
              <RemoteStoryImage
                src={mainImageSrc}
                alt={cleanTitle}
                title={cleanTitle}
                category={category}
                className="h-full w-full object-contain"
              />
            </div>
            {cleanTitle ? (
              <p className="mt-3 text-center text-xs sm:text-sm font-medium text-slate-300 px-4 line-clamp-2">
                {cleanTitle}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
