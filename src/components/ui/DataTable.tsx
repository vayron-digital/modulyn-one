import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const DataTable = ({ data, columns, idField = 'id', onRowClick, onSelectionChange }) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const getRowId = (item, index) => {
    if (idField && item[idField] !== undefined) {
      return String(item[idField]);
    }
    const uniqueProps = ['email', 'phone', 'name', 'first_name', 'last_name'];
    for (const prop of uniqueProps) {
      if (item[prop]) {
        return `${prop}-${item[prop]}-${index}`;
      }
    }
    return `row-${index}`;
  };

  const renderTableHeader = () => (
    <tr className="bg-gray-50 dark:bg-gray-800">
      {onSelectionChange && (
        <th 
          key="select-all-header"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-gray-700"
            checked={selectedRows.length === data.length}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows(data.map((item, index) => getRowId(item, index)));
              } else {
                setSelectedRows([]);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </th>
      )}
      {columns.map((column, index) => (
        <th
          key={`header-${column.key}-${index}`}
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {column.header}
        </th>
      ))}
    </tr>
  );

  const renderTableRow = (item, index) => {
    const rowId = getRowId(item, index);
    return (
      <motion.tr
        key={rowId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onHoverStart={() => setHoveredRow(rowId)}
        onHoverEnd={() => setHoveredRow(null)}
        className={cn(
          'transition-colors',
          hoveredRow === rowId && 'bg-gray-50 dark:bg-gray-800',
          onRowClick && 'cursor-pointer'
        )}
        onClick={() => onRowClick?.(item)}
      >
        {onSelectionChange && (
          <td key={`${rowId}-select`} className="w-12 px-6 py-4">
            <input
              type="checkbox"
              className="rounded border-gray-300 dark:border-gray-700"
              checked={selectedRows.includes(rowId)}
              onChange={(e) => handleSelectRow(rowId, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
          </td>
        )}
        {columns.map((column, colIndex) => (
          <td
            key={`${rowId}-${column.key}-${colIndex}`}
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
          >
            {column.render
              ? column.render(item)
              : item[column.key]}
          </td>
        ))}
      </motion.tr>
    );
  };

  return (
    <div className="overflow-hidden border rounded-lg">
      <table className="w-full">
        <thead>
          {renderTableHeader()}
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {data.map((item, index) => renderTableRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable; 