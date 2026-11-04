import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  console.log(items)
  return (
    <nav 
      className={cn('flex flex-nowrap items-center gap-1.5 text-sm py-4 min-w-0 overflow-hidden', className)} 
      aria-label="Breadcrumb"
    >
      <a 
        href="/" 
        className="flex-shrink-0 text-text-muted hover:text-primary transition-colors"
        title="Главная"
      >
        Главная
      </a>
      {items.map((item, index) => (
        <span key={index} className="flex flex-nowrap items-center gap-1.5 min-w-0">
          <span className="text-text-muted flex-shrink-0">/</span>
          {item.href ? (
            <a 
              href={item.href} 
              className="text-text-muted hover:text-primary transition-colors min-w-0 truncate"
              title={item.label}
            >
              {item.label}
            </a>
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
