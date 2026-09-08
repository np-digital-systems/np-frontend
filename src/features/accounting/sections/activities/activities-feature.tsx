import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getActivityRecords,
  getFundOptions,
  getPartyOptions,
  getPostableAccounts,
  getProjectOptions,
} from '../../lib/accounting-service';

import { ActivitiesScreen } from './activities-screen';

export async function ActivitiesFeature() {
  const { permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewActivities) {
    return (
      <PageShell>
        <AccessDenied description="Activities are limited to administrators and accountants." />
      </PageShell>
    );
  }

  const [initialActivities, funds, projects, parties, accounts] = await Promise.all([
    getActivityRecords(),
    getFundOptions(),
    getProjectOptions(),
    getPartyOptions(),
    getPostableAccounts(),
  ]);

  return (
    <PageShell>
      <ActivitiesScreen
        initialActivities={initialActivities}
        funds={funds}
        projects={projects}
        parties={parties}
        accounts={accounts}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
