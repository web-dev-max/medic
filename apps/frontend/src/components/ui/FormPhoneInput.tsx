'use client';

import { FormField } from './FormField';
import { formatPhoneValue, parsePhoneForApi, validatePhone } from '@/lib/phoneMask';

interface FormPhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
}

export function FormPhoneInput({
  label,
  value,
  onChange,
  error,
  id,
  required,
  placeholder = '+7 (___) ___-__-__',
}: FormPhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneValue(rawValue);
    onChange(formattedValue);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Allow paste, then format
    setTimeout(() => {
      const input = e.currentTarget;
      const formattedValue = formatPhoneValue(input.value);
      input.value = formattedValue;
      onChange(formattedValue);
    }, 0);
  };

  return (
    <FormField
      label={label}
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      error={error}
      id={id}
      required={required}
      placeholder={placeholder}
      type="tel"
      inputMode="tel"
      maxLength={18}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
  );
}

/**
 * Helper to get the raw phone value for API submission
 */
export function getPhoneForApi(value: string): string {
  return parsePhoneForApi(value);
}

/**
 * Helper to validate phone
 */
export function isPhoneValid(value: string): boolean {
  return validatePhone(value);
}
