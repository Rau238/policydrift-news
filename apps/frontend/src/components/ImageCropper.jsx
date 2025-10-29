import { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';

const CROP_MODES = {
  SQUARE: { label: 'Square', ratio: 1, icon: '⬜' },
  CIRCLE: { label: 'Circle', ratio: 1, icon: '⭕' },
  WIDE: { label: '16:9', ratio: 16/9, icon: '🖼️' },
  STANDARD: { label: '4:3', ratio: 4/3, icon: '📷' },
  FREE: { label: 'Free', ratio: null, icon: '✂️' }
};

const ImageCropper = ({ imageFile, onCropComplete, onCancel, defaultMode = 'SQUARE' }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [cropMode, setCropMode] = useState(defaultMode);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImageSrc(e.target.result);
          // Initialize crop area based on mode
          const containerWidth = Math.min(600, window.innerWidth - 32); // Responsive width
          const aspectRatio = CROP_MODES[cropMode].ratio || 1;
          const containerHeight = containerWidth / aspectRatio;
          const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
          const cropWidth = Math.min(img.width * scale * 0.8, containerWidth * 0.8);
          const cropHeight = CROP_MODES[cropMode].ratio 
            ? cropWidth / CROP_MODES[cropMode].ratio 
            : cropWidth * 0.8;
          
          setCrop({
            x: (img.width * scale - cropWidth) / 2,
            y: (img.height * scale - cropHeight) / 2,
            width: cropWidth,
            height: cropHeight
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, cropMode]);

  const handleMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on resize handle (for FREE and CIRCLE modes)
    if (cropMode === 'FREE' || cropMode === 'CIRCLE') {
      const handleSize = 20;
      const handles = {
        topLeft: { x: crop.x, y: crop.y },
        topRight: { x: crop.x + crop.width, y: crop.y },
        bottomLeft: { x: crop.x, y: crop.y + crop.height },
        bottomRight: { x: crop.x + crop.width, y: crop.y + crop.height }
      };
      
      for (const [handle, pos] of Object.entries(handles)) {
        if (Math.abs(x - pos.x) < handleSize && Math.abs(y - pos.y) < handleSize) {
          setIsResizing(true);
          setResizeHandle(handle);
          setDragStart({ x, y });
          return;
        }
      }
    }
    
    // Check if clicking inside crop area for dragging
    if (x >= crop.x && x <= crop.x + crop.width && y >= crop.y && y <= crop.y + crop.height) {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isResizing && resizeHandle) {
      // Handle resizing
      const newCrop = { ...crop };
      const aspectRatio = CROP_MODES[cropMode].ratio;
      
      // For CIRCLE mode, calculate size based on distance from center
      if (cropMode === 'CIRCLE') {
        const centerX = crop.x + crop.width / 2;
        const centerY = crop.y + crop.height / 2;
        
        // Calculate new radius based on distance from center to mouse
        const dx = x - centerX;
        const dy = y - centerY;
        const newRadius = Math.sqrt(dx * dx + dy * dy);
        const newSize = Math.max(50, Math.min(newRadius * 2, rect.width, rect.height));
        
        newCrop.width = newSize;
        newCrop.height = newSize;
        newCrop.x = centerX - newSize / 2;
        newCrop.y = centerY - newSize / 2;
      } else {
        // Original logic for other modes
        switch (resizeHandle) {
          case 'bottomRight':
            newCrop.width = Math.max(50, x - crop.x);
            newCrop.height = aspectRatio ? newCrop.width / aspectRatio : Math.max(50, y - crop.y);
            break;
          case 'bottomLeft':
            const newWidth = Math.max(50, crop.x + crop.width - x);
            newCrop.x = crop.x + crop.width - newWidth;
            newCrop.width = newWidth;
            newCrop.height = aspectRatio ? newWidth / aspectRatio : Math.max(50, y - crop.y);
            break;
          case 'topRight':
            newCrop.width = Math.max(50, x - crop.x);
            const newHeight = aspectRatio ? newCrop.width / aspectRatio : Math.max(50, crop.y + crop.height - y);
            newCrop.y = crop.y + crop.height - newHeight;
            newCrop.height = newHeight;
            break;
          case 'topLeft':
            const nWidth = Math.max(50, crop.x + crop.width - x);
            const nHeight = aspectRatio ? nWidth / aspectRatio : Math.max(50, crop.y + crop.height - y);
            newCrop.x = crop.x + crop.width - nWidth;
            newCrop.y = crop.y + crop.height - nHeight;
            newCrop.width = nWidth;
            newCrop.height = nHeight;
            break;
        }
      }
      
      // Constrain within bounds
      if (newCrop.x < 0) {
        newCrop.width += newCrop.x;
        newCrop.height = cropMode === 'CIRCLE' ? newCrop.width : newCrop.height;
        newCrop.x = 0;
      }
      if (newCrop.y < 0) {
        newCrop.height += newCrop.y;
        newCrop.width = cropMode === 'CIRCLE' ? newCrop.height : newCrop.width;
        newCrop.y = 0;
      }
      if (newCrop.x + newCrop.width > rect.width) {
        newCrop.width = rect.width - newCrop.x;
        newCrop.height = cropMode === 'CIRCLE' ? newCrop.width : newCrop.height;
      }
      if (newCrop.y + newCrop.height > rect.height) {
        newCrop.height = rect.height - newCrop.y;
        newCrop.width = cropMode === 'CIRCLE' ? newCrop.height : newCrop.width;
      }
      
      setCrop(newCrop);
    } else if (isDragging) {
      // Handle dragging
      const newX = x - dragStart.x;
      const newY = y - dragStart.y;
      
      // Constrain within image bounds
      const maxX = rect.width - crop.width;
      const maxY = rect.height - crop.height;
      
      setCrop(prev => ({
        ...prev,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check resize handles for FREE and CIRCLE modes
    if (cropMode === 'FREE' || cropMode === 'CIRCLE') {
      const handleSize = 30; // Larger for touch
      const handles = {
        topLeft: { x: crop.x, y: crop.y },
        topRight: { x: crop.x + crop.width, y: crop.y },
        bottomLeft: { x: crop.x, y: crop.y + crop.height },
        bottomRight: { x: crop.x + crop.width, y: crop.y + crop.height }
      };
      
      for (const [handle, pos] of Object.entries(handles)) {
        if (Math.abs(x - pos.x) < handleSize && Math.abs(y - pos.y) < handleSize) {
          setIsResizing(true);
          setResizeHandle(handle);
          setDragStart({ x, y });
          return;
        }
      }
    }
    
    // Check if touching inside crop area
    if (x >= crop.x && x <= crop.x + crop.width && y >= crop.y && y <= crop.y + crop.height) {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length !== 1 || !containerRef.current) return;
    e.preventDefault(); // Prevent scrolling while dragging
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (isResizing && resizeHandle) {
      // Handle resizing
      const newCrop = { ...crop };
      const aspectRatio = CROP_MODES[cropMode].ratio;
      
      // For CIRCLE mode, calculate size based on distance from center
      if (cropMode === 'CIRCLE') {
        const centerX = crop.x + crop.width / 2;
        const centerY = crop.y + crop.height / 2;
        
        // Calculate new radius based on distance from center to touch point
        const dx = x - centerX;
        const dy = y - centerY;
        const newRadius = Math.sqrt(dx * dx + dy * dy);
        const newSize = Math.max(50, Math.min(newRadius * 2, rect.width, rect.height));
        
        newCrop.width = newSize;
        newCrop.height = newSize;
        newCrop.x = centerX - newSize / 2;
        newCrop.y = centerY - newSize / 2;
      } else {
        // Original logic for other modes
        switch (resizeHandle) {
          case 'bottomRight':
            newCrop.width = Math.max(50, x - crop.x);
            newCrop.height = aspectRatio ? newCrop.width / aspectRatio : Math.max(50, y - crop.y);
            break;
          case 'bottomLeft':
            const newWidth = Math.max(50, crop.x + crop.width - x);
            newCrop.x = crop.x + crop.width - newWidth;
            newCrop.width = newWidth;
            newCrop.height = aspectRatio ? newWidth / aspectRatio : Math.max(50, y - crop.y);
            break;
          case 'topRight':
            newCrop.width = Math.max(50, x - crop.x);
            const newHeight = aspectRatio ? newCrop.width / aspectRatio : Math.max(50, crop.y + crop.height - y);
            newCrop.y = crop.y + crop.height - newHeight;
            newCrop.height = newHeight;
            break;
          case 'topLeft':
            const nWidth = Math.max(50, crop.x + crop.width - x);
            const nHeight = aspectRatio ? nWidth / aspectRatio : Math.max(50, crop.y + crop.height - y);
            newCrop.x = crop.x + crop.width - nWidth;
            newCrop.y = crop.y + crop.height - nHeight;
            newCrop.width = nWidth;
            newCrop.height = nHeight;
            break;
        }
      }
      
      // Constrain within bounds
      if (newCrop.x < 0) {
        newCrop.width += newCrop.x;
        newCrop.height = cropMode === 'CIRCLE' ? newCrop.width : newCrop.height;
        newCrop.x = 0;
      }
      if (newCrop.y < 0) {
        newCrop.height += newCrop.y;
        newCrop.width = cropMode === 'CIRCLE' ? newCrop.height : newCrop.width;
        newCrop.y = 0;
      }
      if (newCrop.x + newCrop.width > rect.width) {
        newCrop.width = rect.width - newCrop.x;
        newCrop.height = cropMode === 'CIRCLE' ? newCrop.width : newCrop.height;
      }
      if (newCrop.y + newCrop.height > rect.height) {
        newCrop.height = rect.height - newCrop.y;
        newCrop.width = cropMode === 'CIRCLE' ? newCrop.height : newCrop.width;
      }
      
      setCrop(newCrop);
    } else if (isDragging) {
      // Handle dragging
      const newX = x - dragStart.x;
      const newY = y - dragStart.y;
      
      const maxX = rect.width - crop.width;
      const maxY = rect.height - crop.height;
      
      setCrop(prev => ({
        ...prev,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const getCroppedImage = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas.getContext('2d');
    
    // Calculate scale factor
    const containerRect = containerRef.current.getBoundingClientRect();
    const scaleX = img.naturalWidth / containerRect.width;
    const scaleY = img.naturalHeight / containerRect.height;
    
    // Set canvas size to desired output
    const outputWidth = 1200;
    const outputHeight = CROP_MODES[cropMode].ratio 
      ? outputWidth / CROP_MODES[cropMode].ratio 
      : (crop.height / crop.width) * outputWidth;
    
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    
    // For circular crop, create a circular mask
    if (cropMode === 'CIRCLE') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }
    
    // Draw cropped image
    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    if (cropMode === 'CIRCLE') {
      ctx.restore();
    }
    
    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], imageFile.name, { type: 'image/jpeg', lastModified: Date.now() });
        onCropComplete(croppedFile);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-5xl my-4 max-h-[98vh] flex flex-col">
        <div className="p-3 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">Crop Image</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {cropMode === 'CIRCLE' 
              ? 'Drag circle to move, drag corners to resize' 
              : cropMode === 'FREE' 
              ? 'Drag to move, corners to resize' 
              : 'Drag to reposition crop area'}
          </p>
        </div>

        <div className="p-3 sm:p-6 space-y-3 sm:space-y-6 overflow-y-auto flex-1">
          {/* Crop Mode Selector */}
          <div className="space-y-2 flex-shrink-0">
            <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Crop Mode</label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
              {Object.entries(CROP_MODES).map(([key, mode]) => (
                <button
                  key={key}
                  onClick={() => setCropMode(key)}
                  className={`flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg border-2 transition-all ${
                    cropMode === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-base sm:text-2xl mb-0.5 sm:mb-1">{mode.icon}</span>
                  <span className="text-[10px] sm:text-sm font-medium leading-tight">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Image with crop overlay */}
          {imageSrc && (
            <div className="relative mx-auto w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-auto flex-shrink-0" style={{ maxHeight: 'calc(70vh - 200px)', maxWidth: '100%' }}>
              <div 
                ref={containerRef}
                className="relative min-w-full cursor-move select-none touch-none inline-block"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img 
                  ref={imageRef}
                  src={imageSrc} 
                  alt="Crop preview"
                  className="block max-w-full h-auto"
                  draggable={false}
                  style={{ minWidth: '300px' }}
                />
                
                {/* Crop overlay */}
                <div 
                  className={`absolute border-4 ${
                    cropMode === 'CIRCLE' ? 'rounded-full border-blue-400' : 'border-blue-500'
                  } ${
                    cropMode === 'CIRCLE' ? 'bg-transparent' : 'bg-blue-500/20'
                  } cursor-move shadow-lg`}
                  style={{
                    left: `${crop.x}px`,
                    top: `${crop.y}px`,
                    width: `${crop.width}px`,
                    height: `${crop.height}px`,
                    boxShadow: cropMode === 'CIRCLE' ? '0 0 0 9999px rgba(0, 0, 0, 0.5)' : 'none'
                  }}
                >
                  {/* Corner handles - visible for CIRCLE and FREE modes */}
                  {(cropMode === 'CIRCLE' || cropMode === 'FREE') && (
                    <>
                      <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-5 sm:h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-nwse-resize"></div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-5 sm:h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-nesw-resize"></div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 sm:w-5 sm:h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-nesw-resize"></div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-5 sm:h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-nwse-resize"></div>
                    </>
                  )}
                  
                  {/* Center indicator and instructions for circular mode */}
                  {cropMode === 'CIRCLE' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
                      <div className="hidden sm:block text-xs font-medium text-white bg-blue-500 px-2 py-1 rounded-full whitespace-nowrap shadow-lg">
                        Drag corners to resize
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={getCroppedImage}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Crop & Upload
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center space-y-1">
            {cropMode === 'CIRCLE' ? (
              <>
                <p className="hidden sm:block">💡 Drag the circle to move it, drag any corner handle to resize</p>
                <p className="sm:hidden">💡 Move: drag center • Resize: drag corners</p>
              </>
            ) : cropMode === 'FREE' ? (
              <>
                <p className="hidden sm:block">💡 Drag to move, drag corners to resize width and height independently</p>
                <p className="sm:hidden">💡 Move: drag center • Resize: drag corners</p>
              </>
            ) : (
              <>
                <p className="hidden sm:block">💡 Drag the highlighted area to reposition the crop</p>
                <p className="sm:hidden">💡 Drag to move crop area</p>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ImageCropper;
