import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';

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

/**
 * Yearly schedule boundary.
 *
 * Gated on `event-schedule:view`: planning the year is temple-staff work.
 * A devotee holds `event:view` and stops at the calendar screen, so a typed
 * URL lands on the refusal below rather than on the planning board.
 */
export async function YearlyScheduleFeature() {
  const user = await getCurrentUser();
  const access = getEventAccess(user.role);

  if (!access.canViewSchedule) {
    return (
      <PageShell>
        <AccessDenied description="The yearly schedule is available to temple staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const today = getToday();

  return (
    <PageShell>
      <YearlyScheduleScreen
        groups={redactScheduleGroups(
          getScheduleGroups(today),
          access.canSeeSponsorContact,
        )}
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
