import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  RESIDENTIAL_TYPES, 
  COMMERCIAL_TYPES, 
  PropertyType,
  getPropertyTypeCategory
} from '../utils/propertyTypes';

interface PropertyTypeSelectProps {
  value: PropertyType;
  onChange: (value: PropertyType) => void;
  className?: string;
  showCategoryLabels?: boolean;
}

export const PropertyTypeSelect: React.FC<PropertyTypeSelectProps> = ({
  value,
  onChange,
  className = '',
  showCategoryLabels = true
}) => {
  return (
    <SelectPrimitive.Root defaultValue={value} onValueChange={onChange}>
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
              <>
                <SelectPrimitive.Group>
                  <SelectPrimitive.Label className="py-1.5 pl-8 pr-2 text-sm font-semibold">
                    Residential
                  </SelectPrimitive.Label>
                  {RESIDENTIAL_TYPES.map((type) => (
                    <SelectPrimitive.Item
                      key={type}
                      value={type}
                      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <SelectPrimitive.ItemIndicator>
                          <Check className="h-4 w-4" />
                        </SelectPrimitive.ItemIndicator>
                      </span>
                      <SelectPrimitive.ItemText>{type}</SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Group>
                <SelectPrimitive.Group>
                  <SelectPrimitive.Label className="py-1.5 pl-8 pr-2 text-sm font-semibold">
                    Commercial
                  </SelectPrimitive.Label>
                  {COMMERCIAL_TYPES.map((type) => (
                    <SelectPrimitive.Item
                      key={type}
                      value={type}
                      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <SelectPrimitive.ItemIndicator>
                          <Check className="h-4 w-4" />
                        </SelectPrimitive.ItemIndicator>
                      </span>
                      <SelectPrimitive.ItemText>{type}</SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Group>
              </>
            ) : (
              <>
                {RESIDENTIAL_TYPES.map((type) => (
                  <SelectPrimitive.Item
                    key={type}
                    value={type}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{type}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
                {COMMERCIAL_TYPES.map((type) => (
                  <SelectPrimitive.Item
                    key={type}
                    value={type}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{type}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </>
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}; 