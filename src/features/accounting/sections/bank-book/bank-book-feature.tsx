import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getBankAccountRecords,
  getBankBook,
} from '../../lib/accounting-service';

import { BankBookScreen, type BankBookEntry } from './bank-book-screen';

/**
 * Bank book boundary.
 *
 * `bank-book:view` stops at the accountant — a cashier handles the cash box,
 * not the temple's bank position, and the accounts screen would leak the
 * bank balances that the cash book deliberately does not show.
 */
export async function BankBookFeature() {
  const user = await getCurrentUser();
  const access = getAccountingAccess(user.role);

  if (!access.canViewBankBook) {
    return (
      <PageShell>
        <AccessDenied description="The bank book is limited to administrators and accountants. The cash book covers cash held at the temple." />
      </PageShell>
    );
  }

  const banks = getBankAccountRecords();

  // Every account's book is built here rather than on selection, so
  // switching accounts is instant and no client code needs the ledger.
  const books: BankBookEntry[] = banks
    .filter((bank) => bank.isActive)
    .map((bank) => ({ bankAccountId: bank.id, ...getBankBook(bank.id) }));

  return (
    <PageShell>
      <BankBookScreen
        banks={banks}
        books={books}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
