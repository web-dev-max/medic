'use client';

import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import {
  setCookieConsent,
  resetCookieConsent,
  hasCookieConsent,
} from '@/lib/cookieConsent';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Show banner ONLY if no decision has been made
    if (!hasCookieConsent()) {
      setIsVisible(true);
      setIsAnimating(true);
    }
  }, []);

  const handleAccept = () => {
    // User accepts all cookies including optional/analytics
    setCookieConsent('accepted');
    closeBanner();
  };

  const handleReject = () => {
    // User rejects all optional cookies
    // Only technically necessary cookies are allowed
    setCookieConsent('rejected');
    closeBanner();
  };

  const closeBanner = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleChangeSettings = () => {
    // Reset consent to allow user to make a new choice
    resetCookieConsent();
    closeBanner();
    // After close, useEffect will detect null consent and show banner again
    setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
    }, 350);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="border-t border-border bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="container py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <svg
                  className="h-5 w-5 shrink-0 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <h3 className="text-sm font-semibold text-text-primary">
                  Мы используем файлы Cookie
                </h3>
              </div>
              <p className="text-sm text-text-secondary">
                Cookie необходимы для корректной работы сайта и могут использоваться для улучшения его работы.
                Подробнее — в{' '}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark underline"
                >
                  Политике обработки персональных данных
                </Link>
                .
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={handleChangeSettings}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Настроить</span>
              </button>
              <button
                onClick={handleReject}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary"
              >
                Отклонить
              </button>
              <button
                onClick={handleAccept}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Принять
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
