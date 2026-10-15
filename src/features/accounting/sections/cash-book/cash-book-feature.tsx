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
        <AccessDenied description="Ask an administrator for access." />
      </PageShell>
    );
  }

  // A missing cash account is a setup gap: show the API's message instead of the generic error page.
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
          description="Set the cash account under Accounting settings."
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
