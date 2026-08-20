import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';

import { getEventAccess } from '../../lib/event-access';
import { getActiveYear, getToday } from '../../lib/event-data';
import {
  getEventTypes,
  getEvents,
  getSponsorAssignments,
  getSponsorUsers,
} from '../../lib/event-service';
import { redactAssignments, redactSponsors } from '../../lib/event-privacy';

import { SponsorsScreen } from './sponsors-screen';

/**
 * Sponsors boundary.
 *
 * Gated on `event-sponsor:view`, which admin, accountant and cashier all
 * hold — knowing who sponsors a pooja is part of taking a receipt for it.
 * Writing, and seeing a sponsor's phone and email, needs
 * `event-sponsor:manage`, which only the admin has.
 */
export async function SponsorsFeature() {
  const user = await getCurrentUser();
  const access = getEventAccess(user.role);

  if (!access.canViewSponsors) {
    return (
      <PageShell>
        <AccessDenied description="The sponsor directory is available to temple staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const today = getToday();

  const unsponsoredEvents = getEvents(today).filter(
    (event) => event.sponsorId === null,
  ).length;

  return (
    <PageShell>
      <SponsorsScreen
        initialAssignments={redactAssignments(
          getSponsorAssignments(today),
          access.canSeeSponsorContact,
        )}
        eventTypes={getEventTypes()}
        sponsors={redactSponsors(
          getSponsorUsers(),
          access.canSeeSponsorContact,
        )}
        access={access}
        unsponsoredEvents={unsponsoredEvents}
        year={getActiveYear(today)}
      />
    </PageShell>
  );
}
