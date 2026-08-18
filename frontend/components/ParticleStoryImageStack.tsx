'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LayoutGrid, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { resolvePostImageUrl } from '@/lib/story-image';
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
  relatedImages = [],
}: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Combine main image + unique related images (up to 4)
  const allImages: StoryImageItem[] = [
    { src: mainImageSrc, alt: decodeHtmlEntities(mainTitle), title: decodeHtmlEntities(mainTitle) },
    ...relatedImages.filter((img) => img.src && img.src !== mainImageSrc),
  ].slice(0, 4);

  const hasMultiple = allImages.length > 1;

  return (
    <>
      <div className="relative w-full">
        {hasMultiple ? (
          /* Signature Particle.news Overlapping 3D Image Fan Stack */
          <div className="relative mx-auto w-full pt-4 pb-6 sm:pb-8">
            <div className="relative h-[260px] w-full sm:h-[380px] md:h-[430px]">
              {/* Back Layer Image 3 (Far right / lowest layer) */}
              {allImages[2] && (
                <div
                  onClick={() => {
                    setActiveImageIndex(2);
                    setLightboxOpen(true);
                  }}
                  className="group absolute right-0 top-2 h-[78%] w-[58%] cursor-pointer overflow-hidden rounded-[20px] border border-white/40 shadow-xl shadow-slate-900/10 transition-all duration-300 hover:scale-[1.03] hover:z-20 sm:right-2 sm:top-3 sm:w-[50%]"
                >
                  <RemoteStoryImage
                    src={allImages[2].src}
                    alt={allImages[2].alt}
                    category={category}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition" />
                </div>
              )}

              {/* Middle Layer Image 2 (Bottom right offset) */}
              {allImages[1] && (
                <div
                  onClick={() => {
                    setActiveImageIndex(1);
                    setLightboxOpen(true);
                  }}
                  className="group absolute right-4 bottom-0 h-[68%] w-[52%] cursor-pointer overflow-hidden rounded-[20px] border-2 border-white shadow-2xl shadow-slate-950/20 transition-all duration-300 hover:scale-[1.03] hover:z-20 sm:right-6 sm:bottom-0 sm:w-[46%]"
                >
                  <RemoteStoryImage
                    src={allImages[1].src}
                    alt={allImages[1].alt}
                    category={category}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/15 group-hover:bg-transparent transition" />
                </div>
              )}

              {/* Front Primary Hero Image (Large main view) */}
              <div
                onClick={() => {
                  setActiveImageIndex(0);
                  setLightboxOpen(true);
                }}
                className="group absolute left-0 top-0 z-10 h-[92%] w-[78%] cursor-pointer overflow-hidden rounded-[22px] border-2 border-white bg-slate-900 shadow-2xl shadow-slate-950/25 transition-all duration-300 hover:scale-[1.01] sm:w-[72%]"
              >
                <RemoteStoryImage
                  src={allImages[0].src}
                  alt={allImages[0].alt}
                  category={category}
                  priority
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-slate-950/40 to-transparent" />
              </div>

              {/* View All Button Pill (Matching Particle.news design) */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute right-3 bottom-2 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-slate-900/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md transition hover:bg-slate-900 hover:scale-105 active:scale-95 sm:right-4 sm:bottom-3 sm:text-xs"
              >
                <LayoutGrid className="h-3.5 w-3.5 opacity-90" />
                <span>View All ({allImages.length})</span>
              </button>
            </div>
          </div>
        ) : (
          /* Single Image Display */
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] bg-slate-900 shadow-md">
            <RemoteStoryImage
              src={allImages[0].src}
              alt={allImages[0].alt}
              category={category}
              priority
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Lightbox / Full Perspective Gallery Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center justify-center rounded-2xl bg-slate-900 p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-3 top-3 z-30 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Active Image */}
            <div className="relative aspect-[16/10] w-full max-h-[70vh] overflow-hidden rounded-xl bg-black">
              <RemoteStoryImage
                src={allImages[activeImageIndex].src}
                alt={allImages[activeImageIndex].alt}
                category={category}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="mt-4 flex items-center gap-3 overflow-x-auto p-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      activeImageIndex === i ? 'border-teal-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <RemoteStoryImage
                      src={img.src}
                      alt={img.alt}
                      category={category}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
