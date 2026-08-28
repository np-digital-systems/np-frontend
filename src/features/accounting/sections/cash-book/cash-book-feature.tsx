import { Settings2 } from 'lucide-react';

import { AccessDenied, EmptyState, LinkButton, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { ApiError } from '@/lib/api/errors';
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

  /*
   * A cash book without a cash account is a configuration gap, not a fault.
   *
   * The API says exactly what is missing; letting that reach the error
   * boundary would turn a one-line fix into "Something went wrong", which
   * tells whoever is looking at it nothing they can act on.
   */
  const book = await getCashBook().catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 400) return null;

    throw error;
  });

  if (!book) {
    return (
      <PageShell>
        <EmptyState
          icon={Settings2}
          title="No cash account has been chosen yet"
          description="The cash book follows one asset head in the chart of accounts. Pick which one under Accounting settings, and this fills in."
        />

        <div className="flex justify-center">
          <LinkButton href="/administration/settings">Open settings</LinkButton>
        </div>
      </PageShell>
    );
  }

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
