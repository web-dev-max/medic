/**
 * Cookie Consent Manager
 * 
 * Unified system for managing user consent for cookies and data processing.
 * All optional analytics/telemetry services MUST check consent before initialization.
 * 
 * States:
 *   'accepted' → optional cookies allowed, analytics can run
 *   'rejected' → optional cookies forbidden, analytics MUST NOT run
 *   null → no decision made, show cookie banner
 */

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_CONSENT_TIMESTAMP_KEY = 'cookie_consent_timestamp';

export type CookieConsentState = 'accepted' | 'rejected' | null;

/**
 * Get current cookie consent state from localStorage
 */
export function getCookieConsent(): CookieConsentState {
  // Must run on client-side only
  if (typeof window === 'undefined') return null;

  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (consent === 'accepted' || consent === 'rejected') {
    return consent;
  }
  return null;
}

/**
 * Set cookie consent state
 * @param state - 'accepted' or 'rejected'
 */
export function setCookieConsent(state: 'accepted' | 'rejected'): void {
  if (typeof window === 'undefined') return;

  const now = new Date().toISOString();
  localStorage.setItem(COOKIE_CONSENT_KEY, state);
  localStorage.setItem(COOKIE_CONSENT_TIMESTAMP_KEY, now);
}

/**
 * Reset cookie consent (for "Change settings" functionality)
 */
export function resetCookieConsent(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(COOKIE_CONSENT_KEY);
  localStorage.removeItem(COOKIE_CONSENT_TIMESTAMP_KEY);
}

/**
 * Check if user has made a decision about cookies
 */
export function hasCookieConsent(): boolean {
  return getCookieConsent() !== null;
}

/**
 * Check if optional cookies are allowed.
 * IMPORTANT: Call this BEFORE loading any analytics/telemetry scripts.
 * 
 * Returns:
 *   true  → optional cookies allowed, analytics can be initialized
 *   false → optional cookies forbidden, analytics MUST NOT run
 */
export function canUseOptionalCookies(): boolean {
  return getCookieConsent() === 'accepted';
}

/**
 * Check if analytics/telemetry is explicitly rejected
 */
export function isAnalyticsRejected(): boolean {
  return getCookieConsent() === 'rejected';
}

/**
 * Safe wrapper for analytics initialization.
 * Usage:
 *   initAnalyticsIfConsented(() => {
 *     loadGoogleAnalytics();
 *     loadMetrika();
 *   });
 * 
 * This ensures analytics scripts are NEVER loaded before consent.
 */
export function initAnalyticsIfConsented(callback: () => void): void {
  if (canUseOptionalCookies()) {
    callback();
  }
  // If rejected or null, do nothing — analytics stay unloaded
}
