import { notFound } from 'next/navigation';

import { AccessDenied, PageShell } from '@/components/portal/ui';
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
   * No bank accounts and no voucher form. This page reads what the day was
   * quoted at against what the ledger says it cost; the vouchers themselves are
   * written on the Receipt and Payment Voucher pages.
   */
  const budget = await getEventBudget(eventId);

  return (
    <PageShell>
      <EventBudgetScreen event={event} budget={budget} />
    </PageShell>
  );
}
