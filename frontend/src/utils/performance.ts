import React from 'react';

/**
 * Performance optimization utilities for the CRM
 */

/**
 * Creates a stable key for list items
 * @param id - The item's unique identifier
 * @param prefix - Optional prefix for the key
 * @param fallback - Fallback value if id is not available
 * @returns A stable key string
 */
export const createStableKey = (id: string | number | undefined, prefix?: string, fallback?: string): string => {
  if (id !== undefined && id !== null) {
    return prefix ? `${prefix}-${id}` : String(id);
  }
  return fallback || `item-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Memoized component wrapper with proper display name
 * @param Component - The component to memoize
 * @param displayName - Optional display name
 * @returns Memoized component
 */
export const memoizeComponent = <P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
): React.MemoExoticComponent<React.ComponentType<P>> => {
  const MemoizedComponent = React.memo(Component);
  if (displayName) {
    MemoizedComponent.displayName = displayName;
  }
  return MemoizedComponent;
};

/**
 * Creates a memoized callback that only changes when dependencies change
 * @param callback - The callback function
 * @param deps - Dependencies array
 * @returns Memoized callback
 */
export const createStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return React.useCallback(callback, deps) as T;
};

/**
 * Creates a memoized value that only recalculates when dependencies change
 * @param factory - The value factory function
 * @param deps - Dependencies array
 * @returns Memoized value
 */
export const createStableValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return React.useMemo(factory, deps);
};

/**
 * Debounced state setter to prevent excessive updates
 * @param setState - The state setter function
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced setter function
 */
export const createDebouncedSetter = <T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  delay: number
): React.Dispatch<React.SetStateAction<T>> => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  return React.useCallback((value: React.SetStateAction<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setState(value);
    }, delay);
  }, [setState, delay]);
};

/**
 * Optimized list rendering with stable keys and memoization
 * @param items - Array of items to render
 * @param renderItem - Function to render each item
 * @param getKey - Function to get unique key for each item
 * @returns Array of memoized React elements
 */
export const createOptimizedList = <T>(
  items: T[],
  renderItem: (item: T, index: number) => React.ReactElement,
  getKey: (item: T, index: number) => string
): React.ReactElement[] => {
  return React.useMemo(() => {
    return items.map((item, index) => {
      const key = getKey(item, index);
      return React.cloneElement(renderItem(item, index), { key });
    });
  }, [items, renderItem, getKey]);
};

/**
 * Prevents unnecessary re-renders by comparing props deeply
 * @param prevProps - Previous props
 * @param nextProps - Next props
 * @returns True if props are equal
 */
export const arePropsEqual = <T extends object>(
  prevProps: T,
  nextProps: T
): boolean => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);
  
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  
  return prevKeys.every(key => {
    const prevValue = (prevProps as any)[key];
    const nextValue = (nextProps as any)[key];
    
    if (prevValue === nextValue) {
      return true;
    }
    
    if (typeof prevValue === 'object' && typeof nextValue === 'object') {
      return JSON.stringify(prevValue) === JSON.stringify(nextValue);
    }
    
    return false;
  });
};

/**
 * Creates a memoized component with custom comparison
 * @param Component - The component to memoize
 * @param areEqual - Custom comparison function
 * @param displayName - Optional display name
 * @returns Memoized component
 */
export const createMemoizedComponent = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean,
  displayName?: string
): React.MemoExoticComponent<React.ComponentType<P>> => {
  const MemoizedComponent = React.memo(Component, areEqual);
  if (displayName) {
    MemoizedComponent.displayName = displayName;
  }
  return MemoizedComponent;
};

/**
 * Batch state updates to prevent multiple re-renders
 * @param setState - The state setter function
 * @param updates - Array of state updates
 */
export const batchStateUpdates = <T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  updates: Array<React.SetStateAction<T>>
): void => {
  React.useCallback(() => {
    setState(prevState => {
      let currentState = prevState;
      updates.forEach(update => {
        if (typeof update === 'function') {
          currentState = (update as (prev: T) => T)(currentState);
        } else {
          currentState = update;
        }
      });
      return currentState;
    });
  }, [setState, updates])();
};

/**
 * Creates a stable ref that doesn't cause re-renders
 * @param initialValue - Initial value for the ref
 * @returns Stable ref object
 */
export const createStableRef = <T>(initialValue: T): React.MutableRefObject<T> => {
  return React.useRef<T>(initialValue);
};

/**
 * Optimized event handler that prevents default and stops propagation
 * @param handler - The event handler function
 * @returns Optimized event handler
 */
export const createOptimizedHandler = <T extends Event>(
  handler: (event: T) => void
): (event: T) => void => {
  return React.useCallback((event: T) => {
    event.preventDefault();
    event.stopPropagation();
    handler(event);
  }, [handler]);
}; 