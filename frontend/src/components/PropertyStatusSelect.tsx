import * as React from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { PropertyStatus, PROPERTY_STATUSES, getStatusBadgeColor } from '../utils/propertyStatuses';

interface PropertyStatusSelectProps {
  value: PropertyStatus;
  onChange: (value: PropertyStatus) => void;
  className?: string;
}

export const PropertyStatusSelect: React.FC<PropertyStatusSelectProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <Select.Value placeholder="Select status" />
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-md">
          <Select.Viewport className="p-1">
            <Select.Group>
              <Select.Label className="py-1.5 pl-8 pr-2 text-sm font-semibold">Core Statuses</Select.Label>
              {PROPERTY_STATUSES.CORE.map((status) => (
                <Select.Item key={status} value={status} className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900">
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}>{status}</span>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
            <Select.Group>
              <Select.Label className="py-1.5 pl-8 pr-2 text-sm font-semibold">Development Statuses</Select.Label>
              {PROPERTY_STATUSES.DEVELOPMENT.map((status) => (
                <Select.Item key={status} value={status} className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900">
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}>{status}</span>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
            <Select.Group>
              <Select.Label className="py-1.5 pl-8 pr-2 text-sm font-semibold">Transactional Statuses</Select.Label>
              {PROPERTY_STATUSES.TRANSACTIONAL.map((status) => (
                <Select.Item key={status} value={status} className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900">
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}>{status}</span>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
            <Select.Group>
              <Select.Label className="py-1.5 pl-8 pr-2 text-sm font-semibold">Rental Statuses</Select.Label>
              {PROPERTY_STATUSES.RENTAL.map((status) => (
                <Select.Item key={status} value={status} className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900">
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}>{status}</span>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
            <Select.Group>
              <Select.Label className="py-1.5 pl-8 pr-2 text-sm font-semibold">Market Statuses</Select.Label>
              {PROPERTY_STATUSES.MARKET.map((status) => (
                <Select.Item key={status} value={status} className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900">
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(status))}>{status}</span>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}; 