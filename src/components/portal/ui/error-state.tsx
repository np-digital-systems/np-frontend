'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Card } from './card';
import { PageShell } from './page-shell';

interface ErrorStateProps {
  title?: string;
  description?: string;
    digest?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'This screen could not be loaded. Trying again usually clears it; if it keeps happening, tell an administrator.',
  digest,
  onRetry,
}: ErrorStateProps) {
  return (
    <PageShell>
      <Card className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <div
            className="flex size-10 items-center justify-center rounded-full bg-danger-subtle"
            aria-hidden
          >
            <AlertTriangle className="size-4 text-danger" />
          </div>

          <h1 className="mt-4 text-[15px] font-semibold text-text-primary">
            {title}
          </h1>

          <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
            {description}
          </p>

          {digest && (
            <p className="ref mt-3 rounded bg-surface-2 px-2 py-1 text-[11px] text-text-muted">
              Reference: {digest}
            </p>
          )}

          {onRetry && (
            <Button className="mt-5" onClick={onRetry}>
              <RotateCcw />
              Try again
            </Button>
          )}
        </div>
      </Card>
    </PageShell>
  );
}
