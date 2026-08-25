import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PortalPageHeaderProps {
  title: string;
  /** One line on what this screen is for. */
  description?: string;
  /** Small meta chips under the title — record counts, the active year. */
  meta?: readonly ReactNode[];
  /** Primary and secondary actions, already filtered by capability. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Masthead for a portal working screen.
 *
 * The dashboard has its own greeting header; every other page uses this one,
 * so a record screen never has to invent its own title rhythm. Actions are
 * passed in already gated — this component never asks who is looking.
 */
export function PortalPageHeader({
  title,
  description,
  meta,
  actions,
  className,
}: PortalPageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.019em] text-text-primary">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-[13px] text-text-muted">{description}</p>
        )}

        {meta && meta.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {meta.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-xs text-text-muted"
              >
                {index > 0 && (
                  <span className="h-3 w-px bg-border" aria-hidden />
                )}
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
