import type { PortalUser } from '@/features/auth/types/user';

export type { BadgeStatus } from '@/components/portal/ui';

export interface DashboardProps {
  readonly user: PortalUser;
  readonly financialYear: FinancialYear;
    readonly greeting: string;
  readonly today: string;
}

import type { FinancialYearStatus } from '@/lib/financial-year-display';

export interface FinancialYear {
  readonly label: string;
  readonly status: FinancialYearStatus;
}
