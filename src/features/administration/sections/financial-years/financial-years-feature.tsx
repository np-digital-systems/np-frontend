import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getAdministrationAccess } from '../../lib/administration-access';
import { getFinancialYearRecords } from '../../lib/administration-service';

import { FinancialYearsScreen } from './financial-years-screen';

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
