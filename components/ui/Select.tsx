'use client';

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ label, error, helperText, options, value, onValueChange, onChange, name, placeholder, disabled, required }, ref) => {
    const handleValueChange = (newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue);
      }
      
      if (onChange && name) {
        const syntheticEvent = {
          target: { name, value: newValue },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <SelectPrimitive.Root value={value} onValueChange={handleValueChange} disabled={disabled}>
          <SelectPrimitive.Trigger
            ref={ref}
            className={`
              w-full px-3 py-2 border rounded-lg shadow-sm
              flex items-center justify-between
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-gray-300'}
              data-[placeholder]:text-gray-400
            `}
          >
            <SelectPrimitive.Value placeholder={placeholder || 'Selecione...'} />
            <SelectPrimitive.Icon>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className="overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className="relative flex items-center px-8 py-2 rounded cursor-pointer outline-none select-none hover:bg-blue-50 focus:bg-blue-50 data-[state=checked]:bg-blue-100 data-[state=checked]:font-medium"
                  >
                    <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </SelectPrimitive.ItemIndicator>
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
