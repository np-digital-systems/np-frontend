import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Surface primitive. Separation comes from the value step between
 * `--surface` and `--background` plus a hairline border — not from shadow.
 */
export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface shadow-xs',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-border px-5 py-3.5',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-[13px] font-semibold tracking-[-0.01em] text-text-primary">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-t border-border px-5 py-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
