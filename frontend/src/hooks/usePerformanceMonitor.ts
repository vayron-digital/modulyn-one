import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  dataFetchTime: number;
  memoryUsage: number;
  componentMounts: number;
  reRenders: number;
}

interface UsePerformanceMonitorOptions {
  componentName?: string;
  trackRenders?: boolean;
  trackMemory?: boolean;
  trackDataFetch?: boolean;
  logToConsole?: boolean;
  threshold?: {
    renderTime?: number;
    dataFetchTime?: number;
    memoryUsage?: number;
  };
}

export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions = {}) => {
  const {
    componentName = 'Component',
    trackRenders = true,
    trackMemory = true,
    trackDataFetch = true,
    logToConsole = import.meta.env.DEV,
    threshold = {
      renderTime: 16, // 16ms = 60fps
      dataFetchTime: 1000, // 1 second
      memoryUsage: 50 * 1024 * 1024 // 50MB
    }
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    dataFetchTime: 0,
    memoryUsage: 0,
    componentMounts: 0,
    reRenders: 0
  });

  const renderStartTimeRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);

  // Track component mount
  useEffect(() => {
    const mountTime = performance.now();
    mountTimeRef.current = mountTime;
    metricsRef.current.componentMounts++;

    if (logToConsole) {
      console.log(`🚀 ${componentName} mounted in ${mountTime.toFixed(2)}ms`);
    }

    return () => {
      const unmountTime = performance.now();
      const totalTime = unmountTime - mountTime;
      
      if (logToConsole) {
        console.log(`🔚 ${componentName} unmounted after ${totalTime.toFixed(2)}ms`);
      }
    };
  }, [componentName, logToConsole]);

  // Track render performance
  useEffect(() => {
    if (!trackRenders) return;

    const renderTime = performance.now() - renderStartTimeRef.current;
    metricsRef.current.renderTime = renderTime;
    metricsRef.current.reRenders++;

    if (logToConsole && renderTime > (threshold.renderTime || 16)) {
      console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms (threshold: ${threshold.renderTime}ms)`);
    }
  });

  // Track memory usage
  useEffect(() => {
    if (!trackMemory || !('memory' in performance)) return;

    const memoryInfo = (performance as any).memory;
    const memoryUsage = memoryInfo.usedJSHeapSize;
    metricsRef.current.memoryUsage = memoryUsage;

    if (logToConsole && memoryUsage > (threshold.memoryUsage || 50 * 1024 * 1024)) {
      console.warn(`⚠️ High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
  });

  // Start render timing
  const startRender = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  // Track data fetch performance
  const trackDataFetchOperation = useCallback(async <T>(
    fetchPromise: Promise<T>,
    operationName: string = 'data fetch'
  ): Promise<T> => {
    if (!trackDataFetch) return fetchPromise;

    const startTime = performance.now();
    
    try {
      const result = await fetchPromise;
      const fetchTime = performance.now() - startTime;
      metricsRef.current.dataFetchTime = fetchTime;

      if (logToConsole) {
        if (fetchTime > (threshold.dataFetchTime || 1000)) {
          console.warn(`⚠️ ${componentName} ${operationName} took ${fetchTime.toFixed(2)}ms (threshold: ${threshold.dataFetchTime}ms)`);
        } else {
          console.log(`✅ ${componentName} ${operationName} completed in ${fetchTime.toFixed(2)}ms`);
        }
      }

      return result;
    } catch (error) {
      const fetchTime = performance.now() - startTime;
      
      if (logToConsole) {
        console.error(`❌ ${componentName} ${operationName} failed after ${fetchTime.toFixed(2)}ms:`, error);
      }
      
      throw error;
    }
  }, [componentName, trackDataFetch, logToConsole, threshold.dataFetchTime]);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderTime: 0,
      dataFetchTime: 0,
      memoryUsage: 0,
      componentMounts: 0,
      reRenders: 0
    };
  }, []);

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    const metrics = metricsRef.current;

    if (metrics.renderTime > (threshold.renderTime || 16)) {
      suggestions.push('Consider using React.memo() to prevent unnecessary re-renders');
      suggestions.push('Use useCallback() and useMemo() for expensive computations');
      suggestions.push('Implement virtualization for large lists');
    }

    if (metrics.dataFetchTime > (threshold.dataFetchTime || 1000)) {
      suggestions.push('Implement caching with React Query or SWR');
      suggestions.push('Use pagination or infinite scrolling');
      suggestions.push('Optimize database queries');
    }

    if (metrics.memoryUsage > (threshold.memoryUsage || 50 * 1024 * 1024)) {
      suggestions.push('Check for memory leaks in useEffect cleanup');
      suggestions.push('Use weak references for large objects');
      suggestions.push('Implement proper cleanup for event listeners');
    }

    if (metrics.reRenders > 10) {
      suggestions.push('Review component dependencies in useEffect');
      suggestions.push('Consider using React.memo() for child components');
      suggestions.push('Optimize state updates to prevent cascading re-renders');
    }

    return suggestions;
  }, [threshold]);

  return {
    startRender,
    trackDataFetch: trackDataFetchOperation,
    getMetrics,
    resetMetrics,
    getOptimizationSuggestions
  };
};

// Hook for monitoring specific operations
export const useOperationMonitor = (operationName: string) => {
  const startTimeRef = useRef<number>(0);
  const operationCountRef = useRef<number>(0);

  const startOperation = useCallback(() => {
    startTimeRef.current = performance.now();
    operationCountRef.current++;
  }, []);

  const endOperation = useCallback(() => {
    const duration = performance.now() - startTimeRef.current;
    
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${operationName} #${operationCountRef.current} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }, [operationName]);

  const trackOperation = useCallback(async <T>(operation: Promise<T>): Promise<T> => {
    startOperation();
    try {
      const result = await operation;
      endOperation();
      return result;
    } catch (error) {
      endOperation();
      throw error;
    }
  }, [startOperation, endOperation]);

  return {
    startOperation,
    endOperation,
    trackOperation,
    operationCount: operationCountRef.current
  };
};

// Hook for monitoring list performance
export const useListPerformanceMonitor = (listName: string, itemCount: number) => {
  const { startRender, trackDataFetch } = usePerformanceMonitor({
    componentName: `${listName} List`,
    logToConsole: import.meta.env.DEV
  });

  const getPerformanceReport = useCallback(() => {
    const metrics = {
      itemCount,
      estimatedRenderTime: itemCount * 0.1, // Rough estimate: 0.1ms per item
      shouldVirtualize: itemCount > 100,
      shouldPaginate: itemCount > 1000,
      shouldInfiniteScroll: itemCount > 500
    };

    if (import.meta.env.DEV) {
      console.log(`📊 ${listName} Performance Report:`, metrics);
    }

    return metrics;
  }, [listName, itemCount]);

  return {
    startRender,
    trackDataFetch,
    getPerformanceReport
  };
}; 