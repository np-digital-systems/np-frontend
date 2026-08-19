import type { PortalUser } from '@/features/auth/types/user';

export type BadgeStatus =
  | 'Draft'
  | 'Submitted'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Posted'
  | 'Cancelled'
  | 'Scheduled'
  | 'Active';

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
