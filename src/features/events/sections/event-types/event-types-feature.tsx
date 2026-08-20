import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';

import { getEventAccess } from '../../lib/event-access';
import { getActiveYear, getToday } from '../../lib/event-data';
import {
  countScheduledEvents,
  countSponsorSlots,
  getEventTypes,
} from '../../lib/event-service';
import type { EventTypeRecord } from '../../types';

import { EventTypesScreen } from './event-types-screen';

/**
 * Event types boundary.
 *
 * `event-type:manage` is an admin-only capability, and the check happens
 * here rather than only in the sidebar — hiding a link is presentation, not
 * access control, and a typed URL must hit the same wall.
 */
export async function EventTypesFeature() {
  const user = await getCurrentUser();
  const access = getEventAccess(user.role);

  if (!access.canManageTypes) {
    return (
      <PageShell>
        <AccessDenied description="Managing event types is limited to temple administrators. Ask an administrator to add or change a recurring pooja or festival." />
      </PageShell>
    );
  }

  const types: EventTypeRecord[] = getEventTypes().map((eventType) => ({
    ...eventType,
    sponsorSlots: countSponsorSlots(eventType.id),
    scheduledCount: countScheduledEvents(eventType.id),
  }));

  return (
    <PageShell>
      <EventTypesScreen initialTypes={types} year={getActiveYear(getToday())} />
    </PageShell>
  );
}
