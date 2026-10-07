import React from 'react';
import { cn } from '@/lib/utils';

interface InfoPageProps {
  title: string;
  introduction?: string;
  children: React.ReactNode;
  className?: string;
}

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

interface InfoCardProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'warning';
}

export function InfoPage({ title, introduction, children, className }: InfoPageProps) {
  return (
    <section className={cn('section', className)}>
      <div className="container max-w-5xl">
        <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
          {title}
        </h1>

        {introduction && (
          <p className="mb-10 max-w-3xl text-lg text-text-secondary">
            {introduction}
          </p>
        )}

        <div className="space-y-8">{children}</div>
      </div>
    </section>
  );
}

export function InfoSection({ title, children, className, icon }: InfoSectionProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-white p-6 shadow-sm md:p-8', className)}>
      <div className="mb-4 flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
            {icon}
          </div>
        )}
        <h2 className="text-xl font-bold text-text-primary md:text-2xl">
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export function InfoCard({ title, children, className, variant = 'default' }: InfoCardProps) {
  const variantClasses = {
    default: 'border-border bg-white',
    highlight: 'border-primary/30 bg-primary-light/30',
    warning: 'border-warning/30 bg-warning/10',
  };

  return (
    <div className={cn('rounded-xl border p-6 shadow-sm', variantClasses[variant], className)}>
      {title && (
        <h3 className="mb-3 text-lg font-semibold text-text-primary">
          {title}
        </h3>
      )}
      {children && (
        <div className="space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

export function InfoList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={cn('space-y-2 pl-5', className)}>
      {children}
    </ul>
  );
}

export function InfoListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-text-secondary">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span className="text-sm md:text-base">{children}</span>
    </li>
  );
}

export function InfoNumberedList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="space-y-3 pl-0">
      {React.Children.map(children, (child, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {index + 1}
          </span>
          <span className="text-sm text-text-secondary md:text-base">{child}</span>
        </li>
      ))}
    </ol>
  );
}

export function HighlightBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg bg-primary-light/50 p-4 text-sm text-text-primary md:text-base', className)}>
      {children}
    </div>
  );
}
