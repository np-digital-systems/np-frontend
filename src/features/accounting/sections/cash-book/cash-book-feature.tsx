import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import { getCashBook } from '../../lib/accounting-service';

import { CashBookScreen } from './cash-book-screen';

export async function CashBookFeature() {
  const user = await getCurrentUser();
  const access = getAccountingAccess(user.role);

  if (!access.canViewCashBook) {
    return (
      <PageShell>
        <AccessDenied description="The cash book is available to temple accounting staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const book = getCashBook();

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
