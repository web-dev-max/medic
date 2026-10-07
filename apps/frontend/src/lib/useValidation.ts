'use client';

import { useState, useCallback, useRef } from 'react';
import { ValidationErrors, validateField, ValidationRule } from '@/lib/validators';

interface UseValidationOptions {
  initialErrors?: ValidationErrors;
  onSubmit?: (values: Record<string, unknown>) => Promise<void> | void;
}

export function useValidation(options: UseValidationOptions = {}) {
  const [errors, setErrors] = useState<ValidationErrors>(options.initialErrors || {});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const submitAttempted = useRef(false);

  const validateFieldWithValue = useCallback(
    (fieldName: string, value: unknown, rules: ValidationRule[]) => {
      const error = validateField(value, rules);
      setErrors((prev) => {
        const newErrors: ValidationErrors = {
          ...prev,
        };
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
      return error;
    },
    []
  );

  const setFieldError = useCallback((fieldName: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: message,
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const markTouched = useCallback((fieldName: string) => {
    setTouched((prev) => new Set(prev).add(fieldName));
  }, []);

  const handleBlur = useCallback(
    (fieldName: string) => {
      markTouched(fieldName);
    },
    [markTouched]
  );

  const reset = useCallback(() => {
    setErrors({});
    setTouched(new Set());
    submitAttempted.current = false;
  }, []);

  const focusFirstError = useCallback(() => {
    setTimeout(() => {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField.toLowerCase().replace(/\s+/g, '-'));
        element?.focus();
      }
    }, 0);
  }, [errors]);

  return {
    errors,
    touched,
    setErrors,
    setFieldError,
    clearFieldError,
    validateFieldWithValue,
    markTouched,
    handleBlur,
    reset,
    focusFirstError,
    submitAttempted,
  };
}
