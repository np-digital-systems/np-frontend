import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';

import { getEventAccess } from '../../lib/event-access';
import { getActiveYear, getToday } from '../../lib/event-data';
import {
  getEventTypes,
  getEvents,
  getScheduleGroups,
  getSponsorUsers,
} from '../../lib/event-service';
import {
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

  const [groups, events, eventTypes, sponsors] = await Promise.all([
    getScheduleGroups(year),
    getEvents(year),
    getEventTypes(),
    getSponsorUsers(),
  ]);

  return (
    <PageShell>
      <YearlyScheduleScreen
        groups={redactScheduleGroups(groups, access.canSeeSponsorContact)}
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
