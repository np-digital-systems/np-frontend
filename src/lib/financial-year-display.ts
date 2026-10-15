// Separate from the server-only financial-year.ts so client components can use it.

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
