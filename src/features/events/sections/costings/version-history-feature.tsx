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
        <AccessDenied description="Pooja costings are visible to the accountant and the cashier." />
      </PageShell>
    );
  }

  const costing = await getCosting(costingId).catch((error: unknown) => {
    if (isApiError(error) && error.status === 404) notFound();

    throw error;
  });

  const history = await getCostingHistory(costingId);

  /*
   * A draft is left out. It has never priced a day, so it is not part of what
   * this pooja has cost — it belongs on the editor, where it can still be
   * changed, rather than in the record of what was decided.
   */
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
