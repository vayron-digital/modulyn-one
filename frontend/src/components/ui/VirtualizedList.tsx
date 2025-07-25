import React, { forwardRef, useCallback, useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { cn } from '../../lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  height?: number | string;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  onScroll?: (scrollOffset: number) => void;
  overscanCount?: number;
  estimatedItemSize?: number;
}

interface VirtualizedItemProps extends ListChildComponentProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemClassName?: string;
}

const VirtualizedItem = React.memo<VirtualizedItemProps>(({ 
  index, 
  style, 
  items, 
  renderItem, 
  itemClassName 
}) => {
  const item = items[index];
  
  return (
    <div 
      style={style} 
      className={cn('virtualized-item', itemClassName)}
    >
      {renderItem(item, index)}
    </div>
  );
});

VirtualizedItem.displayName = 'VirtualizedItem';

export const VirtualizedList = forwardRef<List, VirtualizedListProps<any>>(
  ({ 
    items, 
    height = '100%', 
    itemHeight, 
    renderItem, 
    className,
    itemClassName,
    onScroll,
    overscanCount = 5,
    estimatedItemSize
  }, ref) => {
    
    const itemData = useMemo(() => ({
      items,
      renderItem,
      itemClassName
    }), [items, renderItem, itemClassName]);

    const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
      onScroll?.(scrollOffset);
    }, [onScroll]);

    const renderVirtualizedItem = useCallback((props: ListChildComponentProps) => (
      <VirtualizedItem {...props} {...itemData} />
    ), [itemData]);

    return (
      <div 
        className={cn('virtualized-list-container', className)}
        style={{ height, width: '100%' }}
      >
        <AutoSizer>
          {({ height: autoHeight, width }) => (
            <List
              ref={ref}
              height={autoHeight}
              width={width}
              itemCount={items.length}
              itemSize={itemHeight}
              itemData={itemData}
              overscanCount={overscanCount}
              estimatedItemSize={estimatedItemSize}
              onScroll={handleScroll}
            >
              {renderVirtualizedItem}
            </List>
          )}
        </AutoSizer>
      </div>
    );
  }
);

VirtualizedList.displayName = 'VirtualizedList';

// Hook for infinite scrolling with virtualization
export const useInfiniteVirtualization = <T,>(
  items: T[],
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void,
  threshold = 5
) => {
  const handleScroll = useCallback((scrollOffset: number) => {
    if (!hasNextPage || isFetchingNextPage) return;
    
    // Calculate if we're near the end
    const containerHeight = 600; // Approximate container height
    const itemHeight = 50; // Approximate item height
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const currentIndex = Math.floor(scrollOffset / itemHeight);
    
    if (currentIndex + visibleItems >= items.length - threshold) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length, threshold]);

  return { handleScroll };
}; 