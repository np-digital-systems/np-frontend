import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import { getBankAccountRecords, getPostableAccounts } from '../../lib/accounting-service';

import { BankAccountsScreen } from './bank-accounts-screen';

export async function BankAccountsFeature() {
  const { permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewBankAccounts) {
    return (
      <PageShell>
        <AccessDenied description="Bank accounts are limited to administrators and accountants." />
      </PageShell>
    );
  }

  const [initialBanks, postable] = await Promise.all([
    getBankAccountRecords(),
    getPostableAccounts(),
  ]);

  // Only an asset head can carry bank money.
  const ledgerAccounts = postable
    .filter((account) => account.type === 'asset')
    .map(({ id, code, name }) => ({ id, code, name }));

  return (
    <PageShell>
      <BankAccountsScreen
        initialBanks={initialBanks}
        ledgerAccounts={ledgerAccounts}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
