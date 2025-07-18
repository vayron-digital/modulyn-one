import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, className = '', style, ...props }) => (
  <div
    className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden ${className}`}
    style={{ width, height, ...style }}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/60 to-transparent animate-shimmer" />
  </div>
);

export default Skeleton; 