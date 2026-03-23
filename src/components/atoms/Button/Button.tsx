import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';
import { Spinner } from '../Spinner/Spinner';

const variantClasses: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-blush to-lavender text-text-primary btn-shimmer hover:scale-[1.02] active:scale-[0.98]',
  ghost:
    'bg-transparent border border-white/40 backdrop-blur-sm text-text-primary hover:bg-white/20',
  danger:
    'bg-red-100/80 text-red-700 hover:bg-red-200/80',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, loading, icon, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 font-medium
          transition-all duration-200 cursor-pointer
          focus-ring disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
