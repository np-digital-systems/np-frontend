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
        <AccessDenied description="Pooja costings are visible to the accountant and the cashier. Ask an administrator if you need to see what each pooja is expected to cost." />
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
