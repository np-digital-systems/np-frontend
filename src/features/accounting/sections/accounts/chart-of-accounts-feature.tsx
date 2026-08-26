import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import { getAccountRecords } from '../../lib/accounting-service';

import { ChartOfAccountsScreen } from './chart-of-accounts-screen';

export async function ChartOfAccountsFeature() {
  const { permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewAccounts) {
    return (
      <PageShell>
        <AccessDenied description="The chart of accounts is limited to administrators and accountants." />
      </PageShell>
    );
  }

  const [
    initialAccounts,
  ] = await Promise.all([
    getAccountRecords(),
  ]);

  return (
    <PageShell>
      <ChartOfAccountsScreen
        initialAccounts={initialAccounts}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
