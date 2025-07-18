import React from 'react';
import Skeleton from '../ui/skeleton/Skeleton';
import SkeletonTable from '../ui/skeleton/SkeletonTable';

interface FullScreenLoaderProps {
  type?: 'table' | 'card' | 'form';
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ type = 'table' }) => {
  if (type === 'table') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 gap-6">
        <div className="w-full max-w-4xl">
          <SkeletonTable columns={6} rows={6} />
        </div>
      </div>
    );
  }
  if (type === 'card') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={180} />
          ))}
        </div>
      </div>
    );
  }
  if (type === 'form') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 gap-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton height={32} width="60%" className="mb-2" />
          <Skeleton height={20} width="100%" />
          <Skeleton height={20} width="100%" />
          <Skeleton height={20} width="100%" />
          <Skeleton height={40} width="100%" />
          <Skeleton height={40} width="100%" />
        </div>
      </div>
    );
  }
  // fallback
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 gap-6">
      <div className="w-full max-w-md space-y-4">
        <Skeleton height={32} width="60%" className="mb-2" />
        <Skeleton height={20} width="80%" />
        <Skeleton height={20} width="90%" />
        <Skeleton height={20} width="70%" />
        <Skeleton height={20} width="50%" />
        <div className="flex gap-2 mt-4">
          <Skeleton height={40} width={100} />
          <Skeleton height={40} width={100} />
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader; 