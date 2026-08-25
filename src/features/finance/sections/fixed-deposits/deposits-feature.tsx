import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getFinanceAccess } from '../../lib/finance-access';
import { getDepositRecords, getFundRecords } from '../../lib/finance-service';

import { DepositsScreen } from './deposits-screen';

export async function FixedDepositsFeature() {
  const user = await getCurrentUser();
  const access = getFinanceAccess(user.role);

  if (!access.canViewDeposits) {
    return (
      <PageShell>
        <AccessDenied description="Fixed deposits are limited to administrators and accountants." />
      </PageShell>
    );
  }

  const today = getToday();

  return (
    <PageShell>
      <DepositsScreen
        initialDeposits={getDepositRecords(today)}
        funds={getFundRecords()}
        access={access}
        today={today}
        year={getActiveYear(today)}
      />
    </PageShell>
  );
}
