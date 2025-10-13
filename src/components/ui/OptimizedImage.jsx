import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Optimized Image component with lazy loading and WebP support
 * Implements Intersection Observer for better performance
 * Automatically generates proper alt text and handles loading states
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  title,
  className = '', 
  aspectRatio = 'aspect-video',
  priority = false,
  onLoad,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageSrc, setImageSrc] = useState(priority ? src : null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = (e) => {
    console.error('Image failed to load:', src);
    // Set a placeholder or default image on error
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
    setIsLoaded(true);
  };

  // Generate WebP source if original is not WebP
  const getWebPSource = (originalSrc) => {
    if (!originalSrc || originalSrc.endsWith('.webp')) return null;
    
    // For Unsplash images, add format parameter
    if (originalSrc.includes('unsplash.com')) {
      const url = new URL(originalSrc);
      url.searchParams.set('fm', 'webp');
      url.searchParams.set('q', '80'); // Quality optimization
      return url.toString();
    }
    
    return null;
  };

  const webpSrc = getWebPSource(src);

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${aspectRatio} ${className}`}
    >
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700" />
      )}

      {/* Image with picture element for WebP support */}
      {(isInView || priority) && imageSrc && (
        <picture>
          {webpSrc && (
            <source 
              srcSet={webpSrc} 
              type="image/webp"
            />
          )}
          <img
            src={imageSrc}
            alt={alt || title || 'Article image'}
            title={title || alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            {...props}
          />
        </picture>
      )}

      {/* Loading indicator */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
  aspectRatio: PropTypes.string,
  priority: PropTypes.bool,
  onLoad: PropTypes.func,
};

export default OptimizedImage;
