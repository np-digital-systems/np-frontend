import { cn } from '@/lib/utils';

import type { SponsorParty } from '../types';

interface SponsorCellProps {
  sponsor: SponsorParty | null;
    showContact?: boolean;
  /**
   * A general observance is funded by collection, so having no sponsor is
   * correct rather than a gap to chase. Saying "unassigned" there would send
   * somebody looking for a name that is never coming.
   */
  isGeneral?: boolean;
  className?: string;
}

export function SponsorCell({
  sponsor,
  showContact = false,
  isGeneral = false,
  className,
}: SponsorCellProps) {
  if (!sponsor && isGeneral) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-text-secondary',
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
        General collection
      </span>
    );
  }

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
        {sponsor.name}
      </p>

      {showContact && (
        <p className="mt-0.5 truncate text-xs text-text-muted tabular">
          {sponsor.phone}
        </p>
      )}
    </div>
  );
}
