'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormField = ({ label, error, required, id, ...props }: FormFieldProps) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  const ariaProps = error ? { 'aria-invalid': true as const, 'aria-describedby': `${fieldId}-error` } : {};

  return (
    <div className="w-full">
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-text-primary mb-1.5"
      >
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <Input
        id={fieldId}
        {...props}
        {...(ariaProps as Record<string, unknown>)}
        error={error}
      />
    </div>
  );
};

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormTextarea = ({ label, error, required, id, ...props }: FormTextareaProps) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  const ariaProps = error ? { 'aria-invalid': true as const, 'aria-describedby': `${fieldId}-error` } : {};

  return (
    <div className="w-full">
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-text-primary mb-1.5"
      >
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <Textarea
        id={fieldId}
        {...props}
        {...(ariaProps as Record<string, unknown>)}
        error={error}
      />
    </div>
  );
};

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string | number; label: string }[];
}

export const FormSelect = ({ 
  label, 
  error, 
  required, 
  id, 
  options,
  ...props 
}: FormSelectProps) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  const ariaProps = error ? { 'aria-invalid': true as const, 'aria-describedby': `${fieldId}-error` } : {};

  return (
    <div className="w-full">
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-text-primary mb-1.5"
      >
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <Select
        id={fieldId}
        {...props}
        {...(ariaProps as Record<string, unknown>)}
        error={error}
        options={options}
      />
    </div>
  );
};
