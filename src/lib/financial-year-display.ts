/**
 * How a financial year's status is written and coloured.
 *
 * Deliberately separate from `financial-year.ts`, which is `server-only`: the
 * header menu and the dashboard caption are client components and need these
 * at runtime, not just as types. Keeping one table here is what stops the menu
 * saying "Open" while the caption beside it says "open".
 */

export type FinancialYearStatus = 'open' | 'closed' | 'upcoming';

export const FINANCIAL_YEAR_STATUS_LABELS: Record<FinancialYearStatus, string> = {
  open: 'Open',
  closed: 'Closed',
  upcoming: 'Upcoming',
};

export function financialYearStatusClass(status: FinancialYearStatus): string {
  switch (status) {
    case 'open':
      return 'bg-success-subtle text-success';
    case 'upcoming':
      return 'bg-info-subtle text-info';
    case 'closed':
      return 'bg-neutral-subtle text-text-muted';
  }
}
