import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  showBackButton?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Не удалось загрузить данные. Попробуйте ещё раз.',
  onRetry,
  className,
  showBackButton = false,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      )}
    >
      <AlertCircle className="h-12 w-12 text-error" />
      <p className="text-text-secondary">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <Button variant="outline" onClick={onRetry} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Повторить
          </Button>
        )}
        {showBackButton && (
          <Link href="/catalog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              В каталог
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
