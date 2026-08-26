import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';

import { getEventAccess } from '../../lib/event-access';
import { getActiveYear, getToday } from '../../lib/event-data';
import {
  getEventTypes,
  getEventsSummary,
  getSponsorAssignments,
  getSponsorUsers,
} from '../../lib/event-service';
import { redactAssignments, redactSponsors } from '../../lib/event-privacy';

import { SponsorsScreen } from './sponsors-screen';

export async function SponsorsFeature() {
  const { permissions } = await requireSession();
  const access = getEventAccess(permissions);

  if (!access.canViewSponsors) {
    return (
      <PageShell>
        <AccessDenied description="The sponsor directory is available to temple staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const year = getActiveYear(getToday());

  const [assignments, eventTypes, sponsors, summary] = await Promise.all([
    getSponsorAssignments(year),
    getEventTypes(),
    getSponsorUsers(),
    getEventsSummary(year),
  ]);

  return (
    <PageShell>
      <SponsorsScreen
        initialAssignments={redactAssignments(assignments, access.canSeeSponsorContact)}
        eventTypes={eventTypes}
        sponsors={redactSponsors(sponsors, access.canSeeSponsorContact)}
        access={access}
        unsponsoredEvents={summary.unsponsored}
        year={year}
      />
    </PageShell>
  );
}
