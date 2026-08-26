import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';

import { getEventAccess } from '../../lib/event-access';
import { getActiveYear, getToday } from '../../lib/event-data';
import { getEventTypes, getEvents, getSponsorUsers } from '../../lib/event-service';
import { redactEvents, redactSponsors } from '../../lib/event-privacy';

import { EventsCalendar } from './events-calendar';

export async function EventsCalendarFeature() {
  const { permissions } = await requireSession();
  const access = getEventAccess(permissions);

  if (!access.canView) {
    return (
      <PageShell>
        <AccessDenied description="The temple calendar is available to registered portal users. Contact a temple administrator if you need access." />
      </PageShell>
    );
  }

  const today = getToday();
  const year = getActiveYear(today);

  // Three independent reads; waiting for them in sequence would show the page
  // three round trips late for no reason.
  const [events, eventTypes, sponsors] = await Promise.all([
    getEvents(year),
    getEventTypes(),
    getSponsorUsers(),
  ]);

  return (
    <PageShell>
      <EventsCalendar
        initialEvents={redactEvents(events, access.canSeeSponsorContact)}
        eventTypes={eventTypes}
        sponsors={redactSponsors(sponsors, access.canSeeSponsorContact)}
        access={access}
        today={today}
        year={year}
      />
    </PageShell>
  );
}
