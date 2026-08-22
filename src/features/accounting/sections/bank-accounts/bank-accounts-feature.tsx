import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import { getBankAccountRecords } from '../../lib/accounting-service';

import { BankAccountsScreen } from './bank-accounts-screen';

export async function BankAccountsFeature() {
  const user = await getCurrentUser();
  const access = getAccountingAccess(user.role);

  if (!access.canViewBankAccounts) {
    return (
      <PageShell>
        <AccessDenied description="Bank accounts are limited to administrators and accountants." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <BankAccountsScreen
        initialBanks={getBankAccountRecords()}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
