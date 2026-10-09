/**
 * Analytics Loader Utility
 * 
 * Wrapper for initializing third-party analytics services.
 * All analytics MUST go through this utility to ensure consent is checked first.
 * 
 * Usage example:
 *   import { loadAnalytics } from '@/lib/analyticsLoader';
 *   
 *   // In your app initialization:
 *   loadAnalytics(() => {
 *     // Google Analytics
 *     const script = document.createElement('script');
 *     script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
 *     document.head.appendChild(script);
 *     
 *     // Yandex Metrika
 *     // ...
 *   });
 * 
 * If consent is rejected, the callback is NEVER called.
 */

import { canUseOptionalCookies } from './cookieConsent';

/**
 * Load analytics only if user has given consent.
 * 
 * @param callback - Function that initializes analytics scripts
 * @returns true if callback was executed, false if consent is missing/rejected
 */
export function loadAnalytics(callback: () => void): boolean {
  if (canUseOptionalCookies()) {
    callback();
    return true;
  }
  return false;
}

/**
 * Check if analytics can be loaded (for conditional rendering/UI)
 */
export function isAnalyticsAvailable(): boolean {
  return canUseOptionalCookies();
}
