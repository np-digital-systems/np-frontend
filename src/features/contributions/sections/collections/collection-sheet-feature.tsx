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
        <AccessDenied description="Raising receipts is limited to cashiers and accountants." />
      </PageShell>
    );
  }

  const [event, contributors, activities] = await Promise.all([
    getCollectionEvent(eventId),
    getContributors(eventId),
    getActivityOptions(),
  ]);

  /*
   * The head comes from the observance's own activity, never a constant. A
   * village collection for a pooja is pooja income; posting it to the sanththa
   * head would file it as membership and quietly overstate the subscription
   * register by the whole collection.
   */
  const activity = activities.find((entry) => entry.id === event.activityId);
  const accountId = activity?.defaultAccountId ?? null;
  const fundId = activity?.defaultFundId ?? null;

  if (!event.isGeneral) {
    return (
      <PageShell>
        <EmptyState
          icon={HandCoins}
          title="This observance has a named sponsor"
          description={`${event.eventTypeName} is sponsored, so it is paid for by whoever holds the slot. A collection sheet is only for observances funded by the village.`}
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
              ? `Set a default head and fund on the “${activity.name}” activity, and the sheet will know where the collection posts.`
              : `Give ${event.eventTypeName} an activity, and give that activity a default head and fund, before collecting against it.`
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
