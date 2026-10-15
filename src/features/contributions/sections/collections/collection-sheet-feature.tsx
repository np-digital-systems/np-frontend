import { AccessDenied, EmptyState, PageShell } from '@/components/portal/ui';
import { HandCoins } from 'lucide-react';

import { getActivityOptions } from '@/features/accounting';
import { can } from '@/features/auth/lib/permissions';
import { requireSession } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getCollectionEvent, getContributors } from '../../lib/collection-service';

import { CollectionSheetScreen } from './collection-sheet-screen';

interface CollectionSheetFeatureProps {
  eventId: number;
}

export async function CollectionSheetFeature({ eventId }: CollectionSheetFeatureProps) {
  const { permissions } = await requireSession();

  if (!can(permissions, 'transaction:create')) {
    return (
      <PageShell>
        <AccessDenied description="Only cashiers and accountants have access." />
      </PageShell>
    );
  }

  const [event, contributors, activities] = await Promise.all([
    getCollectionEvent(eventId),
    getContributors(eventId),
    getActivityOptions(),
  ]);

  // Posted to the observance's own activity, never the sanththa head, so collections aren't counted as membership.
  const activity = activities.find((entry) => entry.id === event.activityId);
  const accountId = activity?.defaultAccountId ?? null;
  const fundId = activity?.defaultFundId ?? null;

  if (!event.isGeneral) {
    return (
      <PageShell>
        <EmptyState
          icon={HandCoins}
          title="This observance has a named sponsor"
          description={`Collection sheets are only for collection-funded observances.`}
        />
      </PageShell>
    );
  }

  if (accountId === null || fundId === null) {
    return (
      <PageShell>
        <EmptyState
          icon={HandCoins}
          title="This observance has no coding yet"
          description={
            activity
              ? `Set a default head and fund on the “${activity.name}” activity.`
              : `Give ${event.eventTypeName} an activity with a default head and fund.`
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <CollectionSheetScreen
        event={event}
        contributors={contributors}
        accountId={accountId}
        fundId={fundId}
        activityId={activity?.id ?? null}
        today={getToday()}
      />
    </PageShell>
  );
}
