import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'number';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: Filter[];
  activeFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({
      ...activeFilters,
      [key]: value,
    });
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium',
            'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
            'hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
          )}
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear all
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-1">
                  <label
                    htmlFor={filter.key}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {filter.label}
                  </label>
                  {filter.type === 'select' && filter.options ? (
                    <select
                      id={filter.key}
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-900"
                    >
                      <option value="">All</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'date' ? (
                    <input
                      type="date"
                      id={filter.key}
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-900"
                    />
                  ) : (
                    <input
                      type={filter.type}
                      id={filter.key}
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-900"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 