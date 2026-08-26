import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getFinanceAccess } from '../../lib/finance-access';
import { getDepositRecords, getFundRecords } from '../../lib/finance-service';

import { DepositsScreen } from './deposits-screen';

export async function FixedDepositsFeature() {
  const { permissions } = await requireSession();
  const access = getFinanceAccess(permissions);

  if (!access.canViewDeposits) {
    return (
      <PageShell>
        <AccessDenied description="Fixed deposits are limited to administrators and accountants." />
      </PageShell>
    );
  }

  const today = getToday();

  const [
    initialDeposits,
    funds,
  ] = await Promise.all([
    getDepositRecords(),
    getFundRecords(),
  ]);

  return (
    <PageShell>
      <DepositsScreen
        initialDeposits={initialDeposits}
        funds={funds}
        access={access}
        today={today}
        year={getActiveYear(today)}
      />
    </PageShell>
  );
}
