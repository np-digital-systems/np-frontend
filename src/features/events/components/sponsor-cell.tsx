import { cn } from '@/lib/utils';

import type { SponsorUser } from '../types';

interface SponsorCellProps {
  sponsor: SponsorUser | null;
    showContact?: boolean;
  className?: string;
}

export function SponsorCell({
  sponsor,
  showContact = false,
  className,
}: SponsorCellProps) {
  if (!sponsor) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-text-disabled',
          className,
        )}
      >
        <span
          className="size-1.5 rounded-full border border-current"
          aria-hidden
        />
        Unassigned
      </span>
    );
  }

  return (
    <div className={cn('min-w-0', className)}>
      <p className="truncate text-[13px] text-text-primary">
        {sponsor.fullName}
      </p>

      {showContact && (
        <p className="mt-0.5 truncate text-xs text-text-muted tabular">
          {sponsor.phone}
        </p>
      )}
    </div>
  );
}
