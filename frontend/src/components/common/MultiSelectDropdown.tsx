import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MultiSelectDropdownProps {
  options: { label: string; value: string | number }[];
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = ''
}) => {
  const toggleOption = (optionValue: string | number) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

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
              <span className="text-gray-400">{placeholder}</span>
            ) : (
              value.map((val) => {
                const opt = options.find(o => o.value === val);
                return (
                  <span
                    key={val}
                    className="inline-block mr-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                  >
                    {opt ? opt.label : val}
                  </span>
                );
              })
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 min-w-[16rem] rounded-md border border-gray-200 bg-white p-2 shadow-md">
          <div className="max-h-64 overflow-y-auto">
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                  className="accent-indigo-500"
                />
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}; 