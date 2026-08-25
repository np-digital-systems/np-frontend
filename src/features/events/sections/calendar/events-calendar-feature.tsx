import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';

import { getEventAccess } from '../../lib/event-access';
import { getActiveYear, getToday } from '../../lib/event-data';
import {
  getEventTypes,
  getEvents,
  getSponsorUsers,
} from '../../lib/event-service';
import { redactEvents, redactSponsors } from '../../lib/event-privacy';

import { EventsCalendar } from './events-calendar';

export async function EventsCalendarFeature() {
  const user = await getCurrentUser();
  const access = getEventAccess(user.role);

  if (!access.canView) {
    return (
      <PageShell>
        <AccessDenied description="The temple calendar is available to registered portal users. Contact a temple administrator if you need access." />
      </PageShell>
    );
  }

  const today = getToday();

  return (
    <PageShell>
      <EventsCalendar
        initialEvents={redactEvents(
          getEvents(today),
          access.canSeeSponsorContact,
        )}
        eventTypes={getEventTypes()}
        sponsors={redactSponsors(
          getSponsorUsers(),
          access.canSeeSponsorContact,
        )}
        access={access}
        today={today}
        year={getActiveYear(today)}
      />
    </PageShell>
  );
}
