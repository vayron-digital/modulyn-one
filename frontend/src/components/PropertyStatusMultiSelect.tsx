import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { PropertyStatus, PROPERTY_STATUSES, getStatusBadgeColor } from '../utils/propertyStatuses';

interface PropertyStatusMultiSelectProps {
  value: PropertyStatus[];
  onChange: (value: PropertyStatus[]) => void;
  className?: string;
}

export const PropertyStatusMultiSelect: React.FC<PropertyStatusMultiSelectProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const toggleStatus = (status: PropertyStatus) => {
    if (value.includes(status)) {
      onChange(value.filter((s) => s !== status));
    } else {
      onChange([...value, status]);
    }
  };

  const allStatuses = [
    ...PROPERTY_STATUSES.CORE,
    ...PROPERTY_STATUSES.DEVELOPMENT,
    ...PROPERTY_STATUSES.TRANSACTIONAL,
    ...PROPERTY_STATUSES.RENTAL,
    ...PROPERTY_STATUSES.MARKET,
  ];

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span>
            {value.length === 0 ? (
              <span className="text-gray-400">Select status</span>
            ) : (
              value.map((status) => (
                <span
                  key={status}
                  className={cn("inline-block mr-1 px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}
                >
                  {status}
                </span>
              ))
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 min-w-[16rem] rounded-md border border-gray-200 bg-white p-2 shadow-md">
          <div className="max-h-64 overflow-y-auto">
            <div className="mb-2 text-xs font-semibold text-gray-500">Core Statuses</div>
            {PROPERTY_STATUSES.CORE.map((status) => (
              <label key={status} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="accent-indigo-500"
                />
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}>{status}</span>
              </label>
            ))}
            <div className="mt-2 mb-2 text-xs font-semibold text-gray-500">Development Statuses</div>
            {PROPERTY_STATUSES.DEVELOPMENT.map((status) => (
              <label key={status} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="accent-indigo-500"
                />
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}>{status}</span>
              </label>
            ))}
            <div className="mt-2 mb-2 text-xs font-semibold text-gray-500">Transactional Statuses</div>
            {PROPERTY_STATUSES.TRANSACTIONAL.map((status) => (
              <label key={status} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="accent-indigo-500"
                />
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}>{status}</span>
              </label>
            ))}
            <div className="mt-2 mb-2 text-xs font-semibold text-gray-500">Rental Statuses</div>
            {PROPERTY_STATUSES.RENTAL.map((status) => (
              <label key={status} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="accent-indigo-500"
                />
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}>{status}</span>
              </label>
            ))}
            <div className="mt-2 mb-2 text-xs font-semibold text-gray-500">Market Statuses</div>
            {PROPERTY_STATUSES.MARKET.map((status) => (
              <label key={status} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="accent-indigo-500"
                />
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}>{status}</span>
              </label>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}; 