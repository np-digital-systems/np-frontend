import { notFound } from 'next/navigation';

import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getBankAccountOptions } from '@/features/accounting/lib/accounting-service';
import { requireSession } from '@/features/auth/lib/session';
import { isApiError } from '@/lib/api';

import { getEventAccess } from '../../lib/event-access';
import { getEvent, getEventBudget } from '../../lib/costing-service';

import { EventBudgetScreen } from './event-budget-screen';

interface EventBudgetFeatureProps {
  eventId: number;
}

export async function EventBudgetFeature({ eventId }: EventBudgetFeatureProps) {
  const { permissions } = await requireSession();
  const access = getEventAccess(permissions);

  if (!access.canViewCostings) {
    return (
      <PageShell>
        <AccessDenied description="What a pooja was quoted at, and what it cost, is visible to the accountant and the cashier." />
      </PageShell>
    );
  }

  const event = await getEvent(eventId).catch((error: unknown) => {
    if (isApiError(error) && error.status === 404) notFound();

    throw error;
  });

  /*
   * The bank accounts are loaded whether or not a voucher is raised today: the
   * mode is chosen on the form, and a cashier who picks "cheque" should not
   * have the page fetch its options at that moment.
   */
  const [budget, bankAccounts] = await Promise.all([
    getEventBudget(eventId),
    access.canRaiseEventVouchers ? getBankAccountOptions() : Promise.resolve([]),
  ]);

  return (
    <PageShell>
      <EventBudgetScreen
        event={event}
        budget={budget}
        bankAccounts={[...bankAccounts]}
        canRaiseVouchers={access.canRaiseEventVouchers}
      />
    </PageShell>
  );
}
