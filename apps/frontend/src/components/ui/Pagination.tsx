'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const buildUrl = (page: number): string => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={currentPage > 1 ? buildUrl(currentPage - 1) : pathname}
        className={cn(
          'rounded-md border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background-alt',
          currentPage === 1 && 'opacity-50 cursor-not-allowed'
        )}
      >
        Назад
      </Link>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-text-muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page as number)}
            className={cn(
              'min-w-[40px] rounded-md px-3 py-2 text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary text-white'
                : 'border border-border text-text-secondary hover:bg-background-alt',
            )}
          >
            {page}
          </Link>
        ),
      )}

      <Link
        href={currentPage < totalPages ? buildUrl(currentPage + 1) : pathname}
        className={cn(
          'rounded-md border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background-alt',
          currentPage === totalPages && 'opacity-50 cursor-not-allowed'
        )}
      >
        Вперёд
      </Link>
    </nav>
  );
};
