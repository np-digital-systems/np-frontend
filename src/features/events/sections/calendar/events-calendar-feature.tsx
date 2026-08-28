import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';

import { getEventAccess } from '../../lib/event-access';
import { getActiveYear, getToday } from '../../lib/event-data';
import {
  getEventTypes,
  getEvents,
  getSponsorAssignments,
  getSponsorUsers,
} from '../../lib/event-service';
import {
  redactAssignments,
  redactEvents,
  redactSponsors,
} from '../../lib/event-privacy';

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

  // Independent reads; waiting for them in sequence would show the page
  // several round trips late for no reason. The sponsor reads need their own
  // permission, so a plain calendar viewer simply gets an empty directory.
  const [events, eventTypes, sponsors, assignments] = await Promise.all([
    getEvents(year),
    getEventTypes(),
    access.canViewSponsors ? getSponsorUsers() : [],
    access.canViewSponsors ? getSponsorAssignments(year) : [],
  ]);

  return (
    <PageShell>
      <EventsCalendar
        initialEvents={redactEvents(events, access.canSeeSponsorContact)}
        eventTypes={eventTypes}
        sponsors={redactSponsors(sponsors, access.canSeeSponsorContact)}
        assignments={redactAssignments(assignments, access.canSeeSponsorContact)}
        access={access}
        today={today}
        year={year}
      />
    </PageShell>
  );
}
