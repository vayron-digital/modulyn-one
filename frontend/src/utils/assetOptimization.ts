/**
 * Asset optimization utilities for the CRM
 */

// Cache control headers for different asset types
export const CACHE_HEADERS = {
  // Static assets - cache for 1 year
  STATIC: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  // Images - cache for 1 month
  IMAGES: {
    'Cache-Control': 'public, max-age=2592000',
  },
  // API responses - cache for 5 minutes
  API: {
    'Cache-Control': 'private, max-age=300',
  },
  // No cache for dynamic content
  NOCACHE: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

// CDN configuration
export const CDN_CONFIG = {
  BASE_URL: import.meta.env.VITE_CDN_URL || 'https://cdn.vayron.com',
  IMAGE_OPTIMIZATION: {
    quality: 85,
    format: 'webp',
    sizes: [320, 640, 1280, 1920],
  },
};

// Image optimization utilities
export const optimizeImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality: number = 85,
  format: string = 'webp'
): string => {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // If using CDN, add optimization parameters
  if (url.includes(CDN_CONFIG.BASE_URL)) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());
    params.append('f', format);
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  return url;
};

// Preload critical assets
export const preloadAssets = (assets: string[]): void => {
  assets.forEach((asset) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = asset.endsWith('.css') ? 'style' : 'script';
    link.href = asset;
    document.head.appendChild(link);
  });
};

// Prefetch non-critical assets
export const prefetchAssets = (assets: string[]): void => {
  assets.forEach((asset) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = asset;
    document.head.appendChild(link);
  });
};

// Service Worker registration
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Cache management
export const clearOldCaches = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      const currentVersion = import.meta.env.VITE_APP_VERSION || 'v1';
      const oldCaches = cacheNames.filter(name => 
        name.startsWith('vayron-crm-') && 
        name !== `vayron-crm-${currentVersion}`
      );
      
      await Promise.all(oldCaches.map(name => caches.delete(name)));
      console.log('Old caches cleared');
    } catch (error) {
      console.error('Failed to clear old caches:', error);
    }
  }
};

// Resource hints for performance
export const addResourceHints = (): void => {
  const hints = [
    { rel: 'dns-prefetch', href: 'https://api.vayron.com' },
    { rel: 'dns-prefetch', href: 'https://supabase.co' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
  ];

  hints.forEach(({ rel, href, crossorigin }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Bundle analysis helper
export const analyzeBundle = (): void => {
  if (import.meta.env.DEV) {
    // Bundle analyzer would be available in build process
    console.log('Bundle analyzer available in build process');
  }
};

// Performance monitoring
export const measurePerformance = (): void => {
  if ('performance' in window) {
    // Measure First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
      }
    });
    
    observer.observe({ entryTypes: ['paint'] });
  }
};

// Lazy loading utilities
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Asset loading strategies
export const loadAsset = async (url: string, type: 'script' | 'style' | 'image'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (type === 'script') {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    } else if (type === 'style') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`));
      document.head.appendChild(link);
    } else if (type === 'image') {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    }
  });
};

// Critical CSS extraction helper
export const extractCriticalCSS = (): string => {
  // This would be implemented with a CSS extraction tool
  // For now, return basic critical styles
  return `
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #root { min-height: 100vh; }
    .loading { opacity: 0.7; transition: opacity 0.3s; }
    .loaded { opacity: 1; }
  `;
}; 