import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getFundOptions,
  getLedger,
  getProjectOptions,
} from '../../lib/accounting-service';

import { TransactionsScreen } from './transactions-screen';

export async function TransactionsFeature() {
  const { permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewTransactions) {
    return (
      <PageShell>
        <AccessDenied description="The ledger is available to temple accounting staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const [
    entries,
    funds,
    projects,
  ] = await Promise.all([
    getLedger(),
    getFundOptions(),
    getProjectOptions(),
  ]);

  return (
    <PageShell>
      <TransactionsScreen
        entries={entries}
        funds={funds}
        projects={projects}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
