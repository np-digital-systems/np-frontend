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
        <AccessDenied description="Only the accountant and cashier can view costings." />
      </PageShell>
    );
  }

  const event = await getEvent(eventId).catch((error: unknown) => {
    if (isApiError(error) && error.status === 404) notFound();

    throw error;
  });

  const budget = await getEventBudget(eventId);

  return (
    <PageShell>
      <EventBudgetScreen event={event} budget={budget} />
    </PageShell>
  );
}
