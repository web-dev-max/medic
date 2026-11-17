'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
  className?: string;
  showBackButton?: boolean;
}

export function Breadcrumbs({
  items,
  className,
  showBackButton = false,
}: BreadcrumbsProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/catalog');
    }
  };

  // Если элементов нет и нужна только кнопка «Назад» — рисуем её одну
  if (items.length === 0) {
    if (!showBackButton) return null;

    return (
      <nav
        className={cn('flex items-center py-4', className)}
        aria-label="Breadcrumb"
      >
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-text-muted transition-colors hover:bg-background-alt hover:text-primary"
          aria-label="Назад"
          title="Назад"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Назад</span>
        </button>
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        'flex flex-nowrap items-center gap-1.5 text-sm py-4 min-w-0 overflow-hidden',
        className,
      )}
      aria-label="Breadcrumb"
    >
      {showBackButton && (
        <button
          type="button"
          onClick={handleBack}
          className="flex-shrink-0 mr-3 flex items-center gap-1 rounded-md px-2 py-1 text-text-muted transition-colors hover:bg-background-alt hover:text-primary"
          aria-label="Назад"
          title="Назад"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Назад</span>
        </button>
      )}

      <Link
        href="/"
        className="flex-shrink-0 text-text-muted hover:text-primary transition-colors"
        title="Главная"
      >
        Главная
      </Link>

      {items.map((item, index) => (
        <span key={index} className="flex flex-nowrap items-center gap-1.5 min-w-0">
          <span className="text-text-muted flex-shrink-0">/</span>
          {item.href ? (
            <Link
              href={item.href}
              className="text-text-muted hover:text-primary transition-colors min-w-0 truncate"
              title={item.label}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="text-text-primary font-medium min-w-0 truncate"
              title={item.label}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
