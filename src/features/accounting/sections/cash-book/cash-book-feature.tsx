import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import { getCashBook } from '../../lib/accounting-service';

import { CashBookScreen } from './cash-book-screen';

export async function CashBookFeature() {
  const { permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewCashBook) {
    return (
      <PageShell>
        <AccessDenied description="The cash book is available to temple accounting staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const book = await getCashBook();

  return (
    <PageShell>
      <CashBookScreen
        rows={book.rows}
        summary={book.summary}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
