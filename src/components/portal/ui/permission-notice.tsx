import { Eye, Lock } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Card } from './card';

interface ReadOnlyNoticeProps {
    message: string;
  className?: string;
}

export function ReadOnlyNotice({ message, className }: ReadOnlyNoticeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-lg border border-border',
        'bg-surface-2 px-3.5 py-2.5',
        className,
      )}
    >
      <Eye className="size-3.5 shrink-0 text-text-muted" aria-hidden />
      <p className="text-xs text-text-secondary">{message}</p>
    </div>
  );
}

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

export function AccessDenied({
  title = 'You do not have access to this page',
  description = 'This screen is limited to roles with event administration permissions. Contact a temple administrator if you need access.',
}: AccessDeniedProps) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <div
          className="flex size-10 items-center justify-center rounded-full bg-neutral-subtle"
          aria-hidden
        >
          <Lock className="size-4 text-text-muted" />
        </div>

        <h1 className="mt-4 text-[15px] font-semibold text-text-primary">
          {title}
        </h1>

        <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
          {description}
        </p>
      </div>
    </Card>
  );
}
