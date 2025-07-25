import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';
import LazyImage from '../common/LazyImage';

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

// Memoized table row component to prevent unnecessary re-renders
const TableRow = React.memo<{
  item: any;
  columns: Column<any>[];
  rowKey: string;
  selectedRows: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (item: any) => void;
  idField: string;
  hoveredRow: string | null;
  setHoveredRow: (key: string | null) => void;
}>(({ 
  item, 
  columns, 
  rowKey, 
  selectedRows, 
  onSelectionChange, 
  onRowClick, 
  idField, 
  hoveredRow, 
  setHoveredRow 
}) => {
  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelection = checked
      ? [...selectedRows, id]
      : selectedRows.filter(rowId => rowId !== id);
    onSelectionChange(newSelection);
  }, [onSelectionChange, selectedRows]);

  const handleRowClick = useCallback(() => {
    onRowClick?.(item);
  }, [onRowClick, item]);

  const handleHoverStart = useCallback(() => {
    setHoveredRow(rowKey);
  }, [setHoveredRow, rowKey]);

  const handleHoverEnd = useCallback(() => {
    setHoveredRow(null);
  }, [setHoveredRow]);

  return (
    <motion.tr
      key={rowKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      className={cn(
        'transition-colors',
        hoveredRow === rowKey && 'bg-gray-50 dark:bg-gray-800',
        onRowClick && 'cursor-pointer'
      )}
      onClick={handleRowClick}
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
          key={`${column.key}-${rowKey}`}
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
        >
          {column.render
            ? column.render(item)
            : item[column.key]}
        </td>
      ))}
    </motion.tr>
  );
});

TableRow.displayName = 'TableRow';

// Memoized table header component
const TableHeader = React.memo<{
  columns: Column<any>[];
  onSelectionChange?: (ids: string[]) => void;
  selectedRows: string[];
  data: any[];
  idField: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}>(({ 
  columns, 
  onSelectionChange, 
  selectedRows, 
  data, 
  idField, 
  onSort, 
  sortKey, 
  sortDirection 
}) => {
  const handleSelectAll = useCallback((checked: boolean) => {
    if (!onSelectionChange) return;
    onSelectionChange(checked ? data.map(item => String(item[idField])) : []);
  }, [onSelectionChange, data, idField]);

  const handleSort = useCallback((key: string) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  }, [onSort, sortKey, sortDirection]);

  return (
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
  );
});

TableHeader.displayName = 'TableHeader';

// Memoized loading skeleton component
const LoadingSkeleton = React.memo(() => (
  <div className="animate-pulse">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" />
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export const DataTable = React.memo(<T extends { [key: string]: any }>({
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
}: DataTableProps<T>) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Memoize the data with stable row keys
  const dataWithKeys = useMemo(() => {
    return data.map((item) => ({
      ...item,
      _rowKey: item[idField] ? String(item[idField]) : uuidv4(),
    }));
  }, [data, idField]);

  // Memoize the setHoveredRow function
  const setHoveredRowCallback = useCallback((key: string | null) => {
    setHoveredRow(key);
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <TableHeader
            columns={columns}
            onSelectionChange={onSelectionChange}
            selectedRows={selectedRows}
            data={dataWithKeys}
            idField={String(idField)}
            onSort={onSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          <AnimatePresence>
            {dataWithKeys.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              dataWithKeys.map((item) => (
                <TableRow
                  key={item._rowKey}
                  item={item}
                  columns={columns}
                  rowKey={item._rowKey}
                  selectedRows={selectedRows}
                  onSelectionChange={onSelectionChange}
                  onRowClick={onRowClick}
                  idField={String(idField)}
                  hoveredRow={hoveredRow}
                  setHoveredRow={setHoveredRowCallback}
                />
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
});

DataTable.displayName = 'DataTable'; 