import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { MoreHorizontal, Settings, X } from 'lucide-react';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  config?: Record<string, any>;
  isVisible?: boolean;
  isCollapsed?: boolean;
}

interface DashboardWidgetProps {
  config: WidgetConfig;
  children: React.ReactNode;
  onConfigChange?: (config: WidgetConfig) => void;
  onRemove?: (id: string) => void;
  className?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  config,
  children,
  onConfigChange,
  onRemove,
  className,
  actions,
  loading = false,
  error = null
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleToggleCollapse = () => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        isCollapsed: !config.isCollapsed
      });
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(config.id);
    }
  };

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
    full: 'col-span-full row-span-1'
  };

  if (!config.isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md',
        sizeClasses[config.size],
        className
      )}
      style={{
        gridColumn: `span ${config.size === 'full' ? -1 : config.size === 'large' ? 2 : 1}`,
        gridRow: `span ${config.size === 'large' ? 2 : 1}`
      }}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {config.title}
          </h3>
          {loading && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {actions}
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={handleToggleCollapse}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {config.isCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleRemove}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Remove Widget
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4">
        {error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        ) : config.isCollapsed ? (
          <div className="flex items-center justify-center h-16">
            <p className="text-sm text-gray-500 dark:text-gray-400">Widget collapsed</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default DashboardWidget; 