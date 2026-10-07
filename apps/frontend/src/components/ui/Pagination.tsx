import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
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

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background-alt disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Назад
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-text-muted">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              'min-w-[40px] rounded-md px-3 py-2 text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary text-white'
                : 'border border-border text-text-secondary hover:bg-background-alt',
            )}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background-alt disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Вперёд
      </button>
    </nav>
  );
};
