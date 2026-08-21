import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getFundOptions,
  getLedger,
  getProjectOptions,
} from '../../lib/accounting-service';

import { TransactionsScreen } from './transactions-screen';

/**
 * Transactions boundary.
 *
 * `transaction:view` reaches every accounting role including the cashier —
 * seeing what has actually posted is how they reconcile their own day.
 */
export async function TransactionsFeature() {
  const user = await getCurrentUser();
  const access = getAccountingAccess(user.role);

  if (!access.canViewTransactions) {
    return (
      <PageShell>
        <AccessDenied description="The ledger is available to temple accounting staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <TransactionsScreen
        entries={getLedger()}
        funds={getFundOptions()}
        projects={getProjectOptions()}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
