import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getAdministrationAccess } from '../../lib/administration-access';
import { getFinancialYearRecords } from '../../lib/administration-service';

import { FinancialYearsScreen } from './financial-years-screen';

/**
 * Financial years boundary.
 *
 * The one administration screen an accountant reaches: the year is the
 * boundary of the books they keep, so they need to see it. Opening or
 * closing one locks every voucher inside it, which stays with the admin.
 */
export async function FinancialYearsFeature() {
  const user = await getCurrentUser();
  const access = getAdministrationAccess(user.role);

  if (!access.canViewFinancialYears) {
    return (
      <PageShell>
        <AccessDenied description="Financial years are limited to administrators and accountants." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <FinancialYearsScreen
        initialYears={getFinancialYearRecords()}
        access={access}
        today={getToday()}
      />
    </PageShell>
  );
}
