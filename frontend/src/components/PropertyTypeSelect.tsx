import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  getPropertyTypesByLocation,
  getPropertyTypesGroupedByLocation,
  PropertyTypeOption
} from '../utils/propertyTypesByLocation';
import { useTenantLocation } from '../hooks/useTenantLocation';

interface PropertyTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  showCategoryLabels?: boolean;
}

export const PropertyTypeSelect: React.FC<PropertyTypeSelectProps> = ({
  value,
  onChange,
  className = '',
  showCategoryLabels = true
}) => {
  const { primaryLocation, loading } = useTenantLocation();
  
  // Get property types based on tenant location
  const propertyTypes = getPropertyTypesByLocation(primaryLocation);
  const groupedTypes = getPropertyTypesGroupedByLocation(primaryLocation);

  if (loading) {
    return (
      <div className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm",
        className
      )}>
        <span className="text-gray-500">Loading property types...</span>
      </div>
    );
  }

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <SelectPrimitive.Value placeholder="Select property type" />
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <SelectPrimitive.Viewport className="p-1">
            {showCategoryLabels ? (
              // Show grouped by categories
              Object.entries(groupedTypes).map(([category, types]) => (
                <SelectPrimitive.Group key={category}>
                  <SelectPrimitive.Label className="py-1.5 pl-8 pr-2 text-sm font-semibold">
                    {category}
                  </SelectPrimitive.Label>
                  {types.map((type) => (
                    <SelectPrimitive.Item
                      key={type.value}
                      value={type.value}
                      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <SelectPrimitive.ItemIndicator>
                          <Check className="h-4 w-4" />
                        </SelectPrimitive.ItemIndicator>
                      </span>
                      <SelectPrimitive.ItemText>{type.label}</SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Group>
              ))
            ) : (
              // Show flat list
              propertyTypes.map((type) => (
                <SelectPrimitive.Item
                  key={type.value}
                  value={type.value}
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{type.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}; 