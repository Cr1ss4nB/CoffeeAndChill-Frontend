import type { InputHTMLAttributes } from 'react';
import { Label } from '@/components/atoms/Label/Label';
import { Input } from '@/components/atoms/Input/Input';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  fieldId: string;
}

export function FormField({ label, error, fieldId, required, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={fieldId} required={required}>
        {label}
      </Label>
      <Input id={fieldId} error={!!error} aria-describedby={error ? `${fieldId}-error` : undefined} {...inputProps} />
      {error && (
        <p id={`${fieldId}-error`} className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
