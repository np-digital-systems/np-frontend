import type { PortalUser } from '@/features/auth/types/user';

export type { BadgeStatus } from '@/components/portal/ui';

export interface DashboardProps {
  readonly user: PortalUser;
  readonly financialYear: FinancialYear;
    readonly greeting: string;
  readonly today: string;
}

export interface FinancialYear {
  readonly label: string;
  readonly status: 'Open' | 'Closed';
}
