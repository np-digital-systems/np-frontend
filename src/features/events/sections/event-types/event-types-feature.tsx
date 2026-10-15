import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';

import {
  getActivityOptions,
} from '@/features/accounting/lib/accounting-service';

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
        <AccessDenied description="Only administrators can manage event types." />
      </PageShell>
    );
  }

  const year = getActiveYear(getToday());

  const [types, activities] = await Promise.all([
    getEventTypeRecords(year),
    getActivityOptions(),
  ]);

  return (
    <PageShell>
      <EventTypesScreen
        initialTypes={[...types]}
        activities={activities}
        year={year}
      />
    </PageShell>
  );
}
