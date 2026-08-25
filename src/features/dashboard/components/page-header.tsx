import type { DashboardProps } from '../types';

import { cn } from '@/lib/utils';

type PageHeaderProps = Pick<
  DashboardProps,
  'user' | 'greeting' | 'today' | 'financialYear'
> & {
  /** What this role's dashboard is for, in one line. */
  subtitle: string;
};

/**
 * Dashboard masthead.
 *
 * Greeting and date arrive pre-computed from the server so there is nothing
 * time-dependent to hydrate — a `new Date()` in render would disagree with
 * the server-rendered markup.
 */
export function PageHeader({
  user,
  greeting,
  today,
  financialYear,
  subtitle,
}: PageHeaderProps) {
  const isOpen = financialYear.status === 'Open';

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[13px] text-text-muted">{greeting},</p>

        <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-[-0.022em] text-text-primary">
          {user.name}
        </h1>

        <p className="mt-1 text-[13px] text-text-muted">{subtitle}</p>
      </div>

      <dl
        className={cn(
          'flex shrink-0 items-center gap-4 self-start',
          'rounded-xl border border-border bg-surface',
          'px-4 py-2.5 shadow-xs sm:self-auto',
        )}
      >
        <div>
          <dt className="text-[11px] text-text-muted">Financial Year</dt>
          <dd className="mt-0.5 flex items-center gap-2">
            <span className="text-[13px] font-semibold text-text-primary tabular">
              {financialYear.label}
            </span>
            <span
              className={
                isOpen
                  ? 'rounded-full bg-success-subtle px-1.5 py-0.5 text-[11px] font-medium text-success'
                  : 'rounded-full bg-neutral-subtle px-1.5 py-0.5 text-[11px] font-medium text-text-muted'
              }
            >
              {financialYear.status}
            </span>
          </dd>
        </div>

        <div className="h-7 w-px bg-border" aria-hidden />

        <div>
          <dt className="text-[11px] text-text-muted">Date</dt>
          <dd className="mt-0.5 text-[13px] font-medium text-text-primary tabular">
            {today}
          </dd>
        </div>
      </dl>
    </header>
  );
}
