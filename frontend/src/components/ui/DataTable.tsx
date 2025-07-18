import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (item: T) => void;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  idField?: keyof T;
}

export function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onSort,
  sortKey,
  sortDirection,
  onRowClick,
  selectedRows = [],
  onSelectionChange,
  idField = 'id' as keyof T,
}: DataTableProps<T>) {
  console.log('DataTable rendered');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    onSelectionChange(checked ? data.map(item => String(item[idField])) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelection = checked
      ? [...selectedRows, id]
      : selectedRows.filter(rowId => rowId !== id);
    onSelectionChange(newSelection);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {onSelectionChange && (
              <th key="select-all" scope="col" className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-700"
                  checked={selectedRows.length === data.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                  column.sortable && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300',
                  column.width
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && sortKey === column.key && (
                    <span className="inline-block">
                      {sortDirection === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          <AnimatePresence>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const rowKey = item._rowKey;
                console.log('DataTable rowKey:', rowKey, item);
                return (
                  <motion.tr
                    key={rowKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onHoverStart={() => setHoveredRow(rowKey)}
                    onHoverEnd={() => setHoveredRow(null)}
                    className={cn(
                      'transition-colors',
                      hoveredRow === rowKey && 'bg-gray-50 dark:bg-gray-800',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {onSelectionChange && (
                      <td className="w-12 px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-gray-700"
                          checked={selectedRows.includes(rowKey)}
                          onChange={(e) => handleSelectRow(rowKey, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key + '-' + rowKey}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      >
                        {column.render
                          ? column.render(item)
                          : item[column.key]}
                      </td>
                    ))}
                  </motion.tr>
                );
              })
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
} 