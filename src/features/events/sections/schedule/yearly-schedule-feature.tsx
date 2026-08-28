import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';

import { getEventAccess } from '../../lib/event-access';
import { getActiveYear, getToday } from '../../lib/event-data';
import {
  getEventTypes,
  getEvents,
  getScheduleGroups,
  getSponsorAssignments,
  getSponsorUsers,
} from '../../lib/event-service';
import {
  redactAssignments,
  redactEvents,
  redactScheduleGroups,
  redactSponsors,
} from '../../lib/event-privacy';

import { YearlyScheduleScreen } from './yearly-schedule-screen';

export async function YearlyScheduleFeature() {
  const { permissions } = await requireSession();
  const access = getEventAccess(permissions);

  if (!access.canViewSchedule) {
    return (
      <PageShell>
        <AccessDenied description="The yearly schedule is available to temple staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const today = getToday();
  const year = getActiveYear(today);

  // The sponsor reads need their own permission; without it the schedule
  // still lists every slot, just with no sponsor to offer.
  const [groups, events, eventTypes, sponsors, assignments] = await Promise.all([
    getScheduleGroups(year),
    getEvents(year),
    getEventTypes(),
    access.canViewSponsors ? getSponsorUsers() : [],
    access.canViewSponsors ? getSponsorAssignments(year) : [],
  ]);

  return (
    <PageShell>
      <YearlyScheduleScreen
        groups={redactScheduleGroups(groups, access.canSeeSponsorContact)}
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
