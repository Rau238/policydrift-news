/**
 * Core Web Vitals Optimization Utilities
 * Implements performance monitoring and optimization for Google's Core Web Vitals
 * - Largest Contentful Paint (LCP): < 2.5s
 * - Interaction to Next Paint (INP): < 200ms
 * - Cumulative Layout Shift (CLS): < 0.1
 * - First Contentful Paint (FCP): < 1.8s
 * - Time to First Byte (TTFB): < 800ms
 */

/**
 * Report Web Vitals metrics to analytics
 */
export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
      onINP(onPerfEntry);
    }).catch(err => {
      console.warn('Web Vitals not available:', err);
    });
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  const criticalResources = [
    { href: '/src/main.jsx', as: 'script', type: 'module' },
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
}

/**
 * Prefetch next page for faster navigation
 */
export function prefetchPage(url) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Optimize images for better LCP
 */
export function optimizeImages() {
  // Add fetchpriority="high" to hero images
  const heroImages = document.querySelectorAll('img[data-hero="true"]');
  heroImages.forEach(img => {
    img.setAttribute('fetchpriority', 'high');
  });

  // Add loading="lazy" to below-fold images
  const belowFoldImages = document.querySelectorAll('img:not([data-hero="true"])');
  belowFoldImages.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
}

/**
 * Reduce layout shifts by reserving space for dynamic content
 */
export function preventLayoutShifts() {
  // Add explicit dimensions to images without them
  const images = document.querySelectorAll('img:not([width]):not([height])');
  images.forEach(img => {
    const { naturalWidth, naturalHeight } = img;
    if (naturalWidth && naturalHeight) {
      img.setAttribute('width', naturalWidth);
      img.setAttribute('height', naturalHeight);
    }
  });
}

/**
 * Debounce function for optimizing event handlers (improves FID/INP)
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle function for scroll/resize handlers
 */
export function throttle(func, limit = 200) {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Request Idle Callback polyfill for non-urgent tasks
 */
export function requestIdleCallback(callback, options = {}) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback for browsers without requestIdleCallback
  return setTimeout(() => {
    const start = Date.now();
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, 1);
}

/**
 * Cancel idle callback
 */
export function cancelIdleCallback(id) {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Code splitting helper - dynamically import components
 */
export function lazyLoadComponent(importFunc, fallback = null) {
  return {
    component: importFunc,
    fallback
  };
}

/**
 * Monitor and log performance metrics
 */
export function logPerformanceMetrics() {
  if (!('performance' in window)) return;

  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  const connectTime = perfData.responseEnd - perfData.requestStart;
  const renderTime = perfData.domComplete - perfData.domLoading;

  console.log('Performance Metrics:', {
    'Page Load Time': `${pageLoadTime}ms`,
    'Server Response Time': `${connectTime}ms`,
    'DOM Render Time': `${renderTime}ms`,
    'DNS Lookup': `${perfData.domainLookupEnd - perfData.domainLookupStart}ms`,
    'TCP Connection': `${perfData.connectEnd - perfData.connectStart}ms`,
  });

  // Navigation Timing Level 2
  if ('getEntriesByType' in performance) {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      console.log('Navigation Timing:', {
        'DNS': `${nav.domainLookupEnd - nav.domainLookupStart}ms`,
        'TCP': `${nav.connectEnd - nav.connectStart}ms`,
        'Request': `${nav.responseStart - nav.requestStart}ms`,
        'Response': `${nav.responseEnd - nav.responseStart}ms`,
        'DOM Processing': `${nav.domComplete - nav.domInteractive}ms`,
        'Load Complete': `${nav.loadEventEnd - nav.loadEventStart}ms`,
      });
    }
  }
}

/**
 * Send Web Vitals to Google Analytics
 */
export function sendToGoogleAnalytics({ name, delta, value, id }) {
  if (typeof gtag !== 'undefined') {
    gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      event_label: id,
      non_interaction: true,
    });
  }
}

/**
 * Initialize Core Web Vitals monitoring
 */
export function initWebVitals() {
  // Report web vitals to analytics
  reportWebVitals(sendToGoogleAnalytics);

  // Log performance metrics on page load
  if (document.readyState === 'complete') {
    logPerformanceMetrics();
  } else {
    window.addEventListener('load', logPerformanceMetrics);
  }

  // Optimize images after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeImages);
  } else {
    optimizeImages();
  }

  // Prevent layout shifts
  window.addEventListener('load', preventLayoutShifts);
}
