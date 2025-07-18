import React from 'react';
import Skeleton from './Skeleton';

interface SkeletonTableProps {
  columns?: number;
  rows?: number;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ columns = 5, rows = 5 }) => (
  <div className="overflow-x-auto w-full">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-6 py-3">
              <Skeleton height={16} width={80} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx} className="px-6 py-4">
                <Skeleton height={20} width="100%" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SkeletonTable; 