import React, { useState } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Search,
  Calendar,
  Tag,
  User,
  Building,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'input' | 'date' | 'multiselect';
  options?: { value: string; label: string; icon?: React.ReactNode }[];
  placeholder?: string;
  multiple?: boolean;
}

interface FilterBarProps {
  filters: FilterOption[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  onClearFilter?: (key: string) => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  onClearFilter,
  className = ''
}) => {
  const [expandedFilters, setExpandedFilters] = useState<string[]>([]);

  const toggleFilter = (key: string) => {
    setExpandedFilters(prev => 
      prev.includes(key) 
        ? prev.filter(f => f !== key)
        : [...prev, key]
    );
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => 
      activeFilters[key] !== undefined && 
      activeFilters[key] !== '' && 
      activeFilters[key] !== null &&
      (Array.isArray(activeFilters[key]) ? activeFilters[key].length > 0 : true)
    ).length;
  };

  const renderFilterInput = (filter: FilterOption) => {
    const value = activeFilters[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => onFilterChange(filter.key, val)}
          >
            <SelectTrigger className="w-full min-w-[150px]">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <Select
            value={Array.isArray(value) ? value[0] || '' : value || ''}
            onValueChange={(val) => {
              const currentValues = Array.isArray(value) ? value : [];
              const newValues = currentValues.includes(val)
                ? currentValues.filter(v => v !== val)
                : [...currentValues, val];
              onFilterChange(filter.key, newValues);
            }}
          >
            <SelectTrigger className="w-full min-w-[150px]">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'input':
        return (
          <Input
            type="text"
            placeholder={filter.placeholder || `Search ${filter.label}`}
            value={value || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="min-w-[200px]"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="min-w-[150px]"
          />
        );

      default:
        return null;
    }
  };

  const renderActiveFilterBadge = (filter: FilterOption) => {
    const value = activeFilters[filter.key];
    
    if (!value || value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
      return null;
    }

    const displayValue = Array.isArray(value) 
      ? value.join(', ')
      : filter.options?.find(opt => opt.value === value)?.label || value;

    return (
      <Badge 
        variant="secondary" 
        className="flex items-center space-x-1 px-2 py-1"
      >
        <span className="text-xs font-medium">{filter.label}:</span>
        <span className="text-xs">{displayValue}</span>
        {onClearFilter && (
          <button
            onClick={() => onClearFilter(filter.key)}
            className="ml-1 hover:text-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </Badge>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandedFilters(prev => 
            prev.length === filters.length ? [] : filters.map(f => f.key)
          )}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <Badge variant="default" className="ml-1">
              {getActiveFilterCount()}
            </Badge>
          )}
          {expandedFilters.length === filters.length ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {expandedFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg border border-slate-200 p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Badges */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => renderActiveFilterBadge(filter))}
        </div>
      )}
    </div>
  );
};

export default FilterBar; 