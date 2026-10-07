/**
 * Validation utilities for form fields
 */

export type ValidationErrors = {
  [field: string]: string;
};

export type ValidationRule = {
  validate: (value: unknown) => string | null; // Returns error message or null if valid
  message: string;
};

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (supports Russian format)
 * Accepts: +7 (XXX) XXX-XX-XX, +7XXXXXXXXXX, 8XXXYYYYYY, etc.
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[\s()-]/g, '');
  // Check if it contains only digits and optionally + at start
  const phoneRegex = /^\+?[0-9]{10,11}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Check if value is empty (undefined, null, empty string, or only whitespace)
 */
export function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: string, options?: { min?: number; max?: number; integer?: boolean }): boolean {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (options?.integer && !Number.isInteger(num)) return false;
  if (options?.min !== undefined && num < options.min) return false;
  if (options?.max !== undefined && num > options.max) return false;
  return true;
}

/**
 * Check if string meets minimum length
 */
export function hasMinLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

/**
 * Check if string meets maximum length
 */
export function hasMaxLength(value: string, max: number): boolean {
  return value.trim().length <= max;
}

/**
 * Check if value is not empty
 */
export function isRequired(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Validate a single field against rules
 */
export function validateField(value: unknown, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    const error = rule.validate(value);
    if (error) return error;
  }
  return null;
}

/**
 * Create required string validator
 */
export function requiredField(): ValidationRule {
  const defaultMessage = 'Поле обязательно для заполнения';
  return {
    validate: (value) => {
      if (isEmpty(value)) {
        return defaultMessage;
      }
      return null;
    },
    message: defaultMessage,
  };
}

/**
 * Create email validator (checks format only, not required)
 */
export function emailValidator(message?: string): ValidationRule {
  const defaultMessage = 'Введите корректный адрес электронной почты';
  return {
    validate: (value) => {
      const str = typeof value === 'string' ? value : '';
      // Don't validate format if empty - use requiredField for that
      if (isEmpty(str)) return null;
      if (!isValidEmail(str)) {
        return message || defaultMessage;
      }
      return null;
    },
    message: message || defaultMessage,
  };
}

/**
 * Create phone validator (checks format only, not required)
 */
export function phoneValidator(message?: string): ValidationRule {
  const defaultMessage = 'Введите корректный номер телефона';
  return {
    validate: (value) => {
      const str = typeof value === 'string' ? value : '';
      // Don't validate format if empty - use requiredField for that
      if (isEmpty(str)) return null;
      if (!isValidPhone(str)) {
        return message || defaultMessage;
      }
      return null;
    },
    message: message || defaultMessage,
  };
}

/**
 * Create min length validator
 */
export function minLengthValidator(min: number, message?: string): ValidationRule {
  return {
    validate: (value) => {
      const str = typeof value === 'string' ? value : '';
      if (!str) return null; // Use required validator for empty fields
      if (str.trim().length < min) {
        return message || `Минимум ${min} символа`;
      }
      return null;
    },
    message: message || `Минимум ${min} символа`,
  };
}

/**
 * Create max length validator
 */
export function maxLengthValidator(max: number, message?: string): ValidationRule {
  return {
    validate: (value) => {
      const str = typeof value === 'string' ? value : '';
      if (!str) return null;
      if (str.trim().length > max) {
        return message || `Максимум ${max} символов`;
      }
      return null;
    },
    message: message || `Максимум ${max} символов`,
  };
}

/**
 * Create number validator
 */
export function numberValidator(options?: { min?: number; max?: number; integer?: boolean }): ValidationRule {
  const message = options?.integer 
    ? 'Введите целое число' 
    : 'Введите корректное число';
  
  return {
    validate: (value) => {
      const str = typeof value === 'string' ? value : '';
      if (!str) return null;
      if (!isValidNumber(str, options)) {
        return message;
      }
      return null;
    },
    message,
  };
}
