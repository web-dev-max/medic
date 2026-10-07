import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a debounced function that delays invoking the function until after wait milliseconds have elapsed.
 * 
 * @param func The function to debounce
 * @param wait The delay in milliseconds (default: 300)
 * @returns The debounced function
 */
export function debounce<T>(func: (...args: T[]) => void, wait: number = 300) {
  let timeout: NodeJS.Timeout;
  
  return (...args: T[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
