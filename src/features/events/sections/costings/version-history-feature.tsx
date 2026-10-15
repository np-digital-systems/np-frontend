import { notFound } from 'next/navigation';

import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { isApiError } from '@/lib/api';

import { getEventAccess } from '../../lib/event-access';
import { getCosting, getCostingHistory } from '../../lib/costing-service';

import { VersionHistoryScreen } from './version-history-screen';

interface VersionHistoryFeatureProps {
  costingId: number;
}

export async function VersionHistoryFeature({ costingId }: VersionHistoryFeatureProps) {
  const { permissions } = await requireSession();
  const access = getEventAccess(permissions);

  if (!access.canViewCostings) {
    return (
      <PageShell>
        <AccessDenied description="Only the accountant and cashier can view costings." />
      </PageShell>
    );
  }

  const costing = await getCosting(costingId).catch((error: unknown) => {
    if (isApiError(error) && error.status === 404) notFound();

    throw error;
  });

  const history = await getCostingHistory(costingId);

  // Drafts are excluded: history shows only versions that were applied.
  const versions = history.filter((version) => !version.isDraft);

  return (
    <PageShell>
      <VersionHistoryScreen
        costing={costing}
        versions={versions}
        canManage={access.canManageCostings}
      />
    </PageShell>
  );
}
