import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import { getBankAccountRecords } from '../../lib/accounting-service';

import { BankAccountsScreen } from './bank-accounts-screen';

/**
 * Bank accounts boundary.
 *
 * An accountant needs to see the accounts to reconcile against them; opening
 * or closing one is a decision about the temple's affairs, not bookkeeping,
 * so `bank-account:manage` stays with the admin.
 */
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
