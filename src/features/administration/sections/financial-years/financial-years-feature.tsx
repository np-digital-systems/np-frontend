import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getAdministrationAccess } from '../../lib/administration-access';
import { getFinancialYearRecords } from '../../lib/administration-service';

import { FinancialYearsScreen } from './financial-years-screen';

export async function FinancialYearsFeature() {
  const { permissions } = await requireSession();
  const access = getAdministrationAccess(permissions);

  if (!access.canViewFinancialYears) {
    return (
      <PageShell>
        <AccessDenied description="Only administrators and accountants have access." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <FinancialYearsScreen
        initialYears={(await getFinancialYearRecords())}
        access={access}
        today={getToday()}
      />
    </PageShell>
  );
}
