import React from 'react';
import { cn } from '../../lib/utils';

interface WidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ title, actions, children, className, ...props }) => (
  <div
    className={cn(
      'bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4 flex flex-col transition-all',
      className
    )}
    {...props}
  >
    {(title || actions) && (
      <div className="flex items-center justify-between mb-2">
        {title && <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>}
        {actions && <div>{actions}</div>}
      </div>
    )}
    <div className="flex-1">{children}</div>
  </div>
);

export default Widget; 