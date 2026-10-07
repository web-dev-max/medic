import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'wide' | 'narrow';
}

export function Container({ children, className, size = 'default' }: ContainerProps) {
  const sizeClasses = {
    default: 'max-w-container',
    wide: 'max-w-[1440px]',
    narrow: 'max-w-4xl',
  };

  return (
    <div className={cn('mx-auto px-6 md:px-8', sizeClasses[size], className)}>
      {children}
    </div>
  );
}
