import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getBankAccountRecords,
  getBankBook,
} from '../../lib/accounting-service';

import { BankBookScreen, type BankBookEntry } from './bank-book-screen';

export async function BankBookFeature() {
  const { permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewBankBook) {
    return (
      <PageShell>
        <AccessDenied description="The bank book is limited to administrators and accountants. The cash book covers cash held at the temple." />
      </PageShell>
    );
  }

  const banks = await getBankAccountRecords();

  // Every account's book is fetched here rather than on selection, so
  // switching accounts is instant and no client code needs the ledger.
  const books: BankBookEntry[] = await Promise.all(
    banks
      .filter((bank) => bank.isActive)
      .map(async (bank) => ({ bankAccountId: bank.id, ...(await getBankBook(bank.id)) })),
  );

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
