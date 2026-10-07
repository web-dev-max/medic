import { cn } from '@/lib/utils';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({
  text = 'Загрузка...',
  size = 'md',
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-border border-t-primary',
          {
            'h-6 w-6': size === 'sm',
            'h-10 w-10': size === 'md',
            'h-14 w-14': size === 'lg',
          },
        )}
      />
      {text && <p className="text-sm text-text-muted">{text}</p>}
    </div>
  );
};

// Re-export ErrorState and EmptyState
export { ErrorState } from './ErrorState';
export { EmptyState } from './EmptyState';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-background-alt',
      className,
    )}
  />
);
