'use client';

import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, AlertCircle, Plus } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { fabric } from 'fabric';

const SAMPLE_BACKGROUND_CATEGORIES = [
  {
    category: 'Breaking News & Media',
    photos: [
      {
        name: 'Newsroom Studio',
        url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Press Conference',
        url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Live Broadcasting',
        url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    category: 'Cyberpunk & Abstract Neon',
    photos: [
      {
        name: 'Neon Grid Studio',
        url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Dark Cyber City',
        url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Purple Aurora',
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    category: 'Finance & Technology',
    photos: [
      {
        name: 'Market Data Screen',
        url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Modern Silicon Skyscraper',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Digital Neural Network',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    category: 'Editorial Textures & Minimal',
    photos: [
      {
        name: 'Dark Studio Slate',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Luxury Marble Dark',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Atmospheric Fog',
        url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1200&auto=format&fit=crop&q=80',
      },
    ],
  },
];

export function UploadPanel() {
  const { canvas, refreshLayers, pushHistoryState, project } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const addImageToCanvas = (imgElement: HTMLImageElement, customName?: string, asBackground: boolean = false) => {
    if (!canvas) return;

    const imgObj = new fabric.Image(imgElement, {
      originX: 'center',
      originY: 'center',
      left: project.width / 2,
      top: project.height / 2,
    });

    (imgObj as unknown as { id: string; customName: string }).id = `img-${Date.now()}`;
    (imgObj as unknown as { customName: string }).customName = customName || (asBackground ? 'Background Photo' : 'Photo');

    if (asBackground) {
      const scaleW = project.width / (imgObj.width || 1);
      const scaleH = project.height / (imgObj.height || 1);
      const maxScale = Math.max(scaleW, scaleH);
      imgObj.scale(maxScale);
      imgObj.set({
        originX: 'center',
        originY: 'center',
        left: project.width / 2,
        top: project.height / 2,
      });
      imgObj.setCoords();
      canvas.add(imgObj);
      canvas.sendToBack(imgObj);
    } else {
      const maxW = project.width * 0.85;
      const maxH = project.height * 0.85;
      const scale = Math.min(maxW / (imgObj.width || 1), maxH / (imgObj.height || 1), 1.0);
      imgObj.scale(scale);
      canvas.add(imgObj);
      canvas.setActiveObject(imgObj);
    }

    canvas.renderAll();
    refreshLayers();
    pushHistoryState();
  };

  const handleFileUpload = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds 25MB limit.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          addImageToCanvas(img, file.name);
          setIsUploading(false);
        };
        img.onerror = () => {
          setErrorMsg('Failed to load image into canvas.');
          setIsUploading(false);
        };
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading uploaded file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleStockClick = (photo: { name: string; url: string }, asBackground: boolean = false) => {
    setIsUploading(true);
    setErrorMsg(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      addImageToCanvas(img, photo.name, asBackground);
      setIsUploading(false);
    };
    img.onerror = () => {
      setErrorMsg('Failed to load sample image.');
      setIsUploading(false);
    };
    img.src = photo.url;
  };

  const displayedPhotos =
    selectedCategory === 'All'
      ? SAMPLE_BACKGROUND_CATEGORIES.flatMap((c) => c.photos)
      : SAMPLE_BACKGROUND_CATEGORIES.find((c) => c.category === selectedCategory)?.photos || [];

  return (
    <div className="space-y-4 p-3.5 pb-24 text-white select-none overflow-y-auto h-full custom-scrollbar">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Upload & Background Library
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Import local photos or choose high-res curated backgrounds
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs text-rose-300">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-5 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-800/80 transition"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 mb-2 group-hover:scale-110 transition shadow-inner">
          <Upload size={18} />
        </div>
        <p className="text-xs font-bold text-slate-200">
          {isUploading ? 'Loading image...' : 'Click or Drag Image Here'}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Supports PNG, JPG, JPEG, WEBP (or Paste Ctrl+V)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Category Pills */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles size={12} className="text-teal-400" />
            <span>Sample Backgrounds</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-1">
          {['All', ...SAMPLE_BACKGROUND_CATEGORIES.map((c) => c.category)].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'All' ? 'All' : cat.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Photo Grid with Layer & BG actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {displayedPhotos.map((photo) => (
            <div
              key={photo.name}
              className="group relative h-28 rounded-xl overflow-hidden border border-slate-800 hover:border-purple-400 transition shadow-md bg-slate-900"
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-1.5 opacity-90 group-hover:opacity-100 transition">
                <span className="text-[10px] font-bold text-white truncate drop-shadow">{photo.name}</span>
                
                {/* 1-Click Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStockClick(photo, false)}
                    className="flex-1 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[9px] font-bold text-slate-200 hover:text-white transition shadow border border-slate-700"
                    title="Insert as a standard movable layer"
                  >
                    + Layer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStockClick(photo, true)}
                    className="flex-1 py-1 rounded-lg bg-purple-600/90 hover:bg-purple-500 text-[9px] font-bold text-white transition shadow border border-purple-500/50"
                    title="Fit & apply as canvas backdrop"
                  >
                    Set BG
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
