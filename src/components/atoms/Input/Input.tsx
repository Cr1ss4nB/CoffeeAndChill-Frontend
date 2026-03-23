import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-4 py-2.5 rounded-xl text-sm
          bg-white/50 backdrop-blur-sm
          border transition-all duration-200
          placeholder:text-text-secondary/50
          focus:outline-none focus:ring-2 focus:ring-blush/50 focus:border-blush/60
          ${error ? 'border-red-300 focus:ring-red-200' : 'border-white/40'}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
