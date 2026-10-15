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
        <AccessDenied description="Only administrators and accountants have access." />
      </PageShell>
    );
  }

  const banks = await getBankAccountRecords();

  // All accounts' books are fetched up front so switching is instant.
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
