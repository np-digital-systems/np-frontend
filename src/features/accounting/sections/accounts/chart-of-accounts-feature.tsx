import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import { getAccountRecords } from '../../lib/accounting-service';

import { ChartOfAccountsScreen } from './chart-of-accounts-screen';

/**
 * Chart of accounts boundary.
 *
 * `account:view` stops at the accountant: a cashier picks an account when
 * raising a voucher but has no business restructuring the chart, and the
 * balances on this screen are the temple's whole financial position.
 */
export async function ChartOfAccountsFeature() {
  const user = await getCurrentUser();
  const access = getAccountingAccess(user.role);

  if (!access.canViewAccounts) {
    return (
      <PageShell>
        <AccessDenied description="The chart of accounts is limited to administrators and accountants." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ChartOfAccountsScreen
        initialAccounts={getAccountRecords()}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
