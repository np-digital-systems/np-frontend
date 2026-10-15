import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import { getAccountRecords, getPartyOptions } from '../../lib/accounting-service';

import { ChartOfAccountsScreen } from './chart-of-accounts-screen';

export async function ChartOfAccountsFeature() {
  const { permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewAccounts) {
    return (
      <PageShell>
        <AccessDenied description="Only administrators and accountants have access." />
      </PageShell>
    );
  }

  const [initialAccounts, parties] = await Promise.all([
    getAccountRecords(),
    getPartyOptions(),
  ]);

  return (
    <PageShell>
      <ChartOfAccountsScreen
        initialAccounts={initialAccounts}
        parties={parties}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
