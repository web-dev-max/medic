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
  return (
    <nav className={cn('flex items-center gap-1.5 text-sm py-4', className)} aria-label="Breadcrumb">
      <a href="/" className="text-text-muted hover:text-primary transition-colors">
        Главная
      </a>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <span className="text-text-muted">/</span>
          {item.href ? (
            <a href={item.href} className="text-text-muted hover:text-primary transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
