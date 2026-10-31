import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getBankAccountOptions } from '@/features/accounting';
import { getActiveYear, getToday } from '@/lib/format';

import { getFinanceAccess } from '../../lib/finance-access';
import {
  getDepositRecords,
  getFundRecords,
  getSlotOptions,
} from '../../lib/finance-service';

import { DepositsScreen } from './deposits-screen';

export async function FixedDepositsFeature() {
  const { permissions } = await requireSession();
  const access = getFinanceAccess(permissions);

  if (!access.canViewDeposits) {
    return (
      <PageShell>
        <AccessDenied description="Only administrators and accountants have access." />
      </PageShell>
    );
  }

  const today = getToday();

  const [
    initialDeposits,
    funds,
    slots,
    bankAccounts,
  ] = await Promise.all([
    getDepositRecords(),
    getFundRecords(),
    access.canManageDeposits ? getSlotOptions() : [],
    access.canManageDeposits ? getBankAccountOptions().catch(() => []) : [],
  ]);

  return (
    <PageShell>
      <DepositsScreen
        initialDeposits={initialDeposits}
        funds={funds}
        slots={slots}
        bankAccounts={bankAccounts}
        access={access}
        today={today}
        year={getActiveYear(today)}
      />
    </PageShell>
  );
}
