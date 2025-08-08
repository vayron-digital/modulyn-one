import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Maximize2, Minimize2, Settings, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface EnhancedWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  expandable?: boolean;
  collapsible?: boolean;
  refreshable?: boolean;
  customizable?: boolean;
  onRefresh?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  onCustomize?: () => void;
  variant?: 'default' | 'gradient' | 'glass' | 'minimal';
  size?: 'small' | 'medium' | 'large' | 'full';
  priority?: 'low' | 'medium' | 'high';
  realTime?: boolean;
}

const EnhancedWidget: React.FC<EnhancedWidgetProps> = ({
  title,
  subtitle,
  actions,
  children,
  className,
  loading = false,
  error = null,
  expandable = false,
  collapsible = false,
  refreshable = false,
  customizable = false,
  onRefresh,
  onExpand,
  onCollapse,
  onCustomize,
  variant = 'default',
  size = 'medium',
  priority = 'medium',
  realTime = false,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand?.();
  };

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse?.();
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const variantClasses = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 border-blue-200 dark:border-blue-700',
    glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50',
    minimal: 'bg-transparent border border-gray-100 dark:border-gray-800'
  };

  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
    full: 'p-6'
  };

  const priorityClasses = {
    low: 'shadow-sm',
    medium: 'shadow-md',
    high: 'shadow-lg'
  };

  if (isCollapsed) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 cursor-pointer transition-all duration-300 hover:shadow-md',
          priorityClasses[priority],
          className
        )}
        onClick={handleCollapse}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {realTime && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            {subtitle && (
              <span className="text-xs text-gray-500 dark:text-gray-400">({subtitle})</span>
            )}
          </div>
          <Minimize2 className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300 hover:shadow-lg',
        variantClasses[variant],
        sizeClasses[size],
        priorityClasses[priority],
        isExpanded ? 'col-span-full row-span-full z-50' : '',
        className
      )}
      {...props}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {realTime && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Custom Actions */}
          {actions}
          
          {/* Widget Controls */}
          <div className="flex items-center space-x-1">
            {refreshable && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </button>
            )}
            
            {customizable && (
              <button
                onClick={onCustomize}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Customize"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
            
            {expandable && (
              <button
                onClick={handleExpand}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            )}
            
            {collapsible && (
              <button
                onClick={handleCollapse}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Collapse"
              >
                <EyeOff className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Widget Content */}
      <div className={cn("transition-all duration-300", isExpanded ? "h-full" : "")}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={cn("transition-all duration-300", isExpanded ? "h-full overflow-auto" : "")}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedWidget; 