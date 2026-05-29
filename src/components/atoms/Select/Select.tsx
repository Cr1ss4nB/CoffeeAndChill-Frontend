import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          w-full px-4 py-2.5 rounded-xl text-sm
          bg-white/50 backdrop-blur-sm border
          focus:outline-none focus:ring-2
          ${error
            ? 'border-red-300 focus:ring-red-200/50'
            : 'border-white/40 focus:ring-blush/50'
          }
          text-text-primary
          ${className}
        `}
        {...props}
      />
    );
  }
);

Select.displayName = 'Select';
