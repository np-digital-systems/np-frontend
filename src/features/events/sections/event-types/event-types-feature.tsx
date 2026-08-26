import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';

import { getEventAccess } from '../../lib/event-access';
import { getActiveYear, getToday } from '../../lib/event-data';
import { getEventTypeRecords } from '../../lib/event-service';

import { EventTypesScreen } from './event-types-screen';

export async function EventTypesFeature() {
  const { permissions } = await requireSession();
  const access = getEventAccess(permissions);

  if (!access.canManageTypes) {
    return (
      <PageShell>
        <AccessDenied description="Managing event types is limited to temple administrators. Ask an administrator to add or change a recurring pooja or festival." />
      </PageShell>
    );
  }

  const year = getActiveYear(getToday());

  // The sponsor and occurrence counts come back with the row; counting them
  // here would be a second, slower answer to a question the API has answered.
  const types = await getEventTypeRecords(year);

  return (
    <PageShell>
      <EventTypesScreen initialTypes={[...types]} year={year} />
    </PageShell>
  );
}
