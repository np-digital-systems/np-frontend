import type { PortalUser } from '@/features/auth/types/user';

/** Re-exported from the shared portal vocabulary — see `@/components/portal/ui`. */
export type { BadgeStatus } from '@/components/portal/ui';

/** Every role dashboard receives the same contract. */
export interface DashboardProps {
  readonly user: PortalUser;
  readonly financialYear: FinancialYear;
  /** Rendered on the server so the greeting never mismatches on hydration. */
  readonly greeting: string;
  readonly today: string;
}

export interface FinancialYear {
  readonly label: string;
  readonly status: 'Open' | 'Closed';
}
