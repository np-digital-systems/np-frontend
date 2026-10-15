import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';

import { getEventAccess } from '../../lib/event-access';
import { getActiveYear, getToday } from '../../lib/event-data';
import { getCostings } from '../../lib/costing-service';
import { getEventTypeRecords } from '../../lib/event-service';

import { CostingsScreen } from './costings-screen';

export async function CostingsFeature() {
  const { permissions } = await requireSession();
  const access = getEventAccess(permissions);

  if (!access.canViewCostings) {
    return (
      <PageShell>
        <AccessDenied description="Only the accountant and cashier can view costings." />
      </PageShell>
    );
  }

  const [costings, types] = await Promise.all([
    getCostings(),
    getEventTypeRecords(getActiveYear(getToday())),
  ]);

  return (
    <PageShell>
      <CostingsScreen
        costings={[...costings]}
        eventTypes={[...types]}
        canManage={access.canManageCostings}
      />
    </PageShell>
  );
}
