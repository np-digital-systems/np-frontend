import { notFound } from 'next/navigation';

import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getAccounts } from '@/features/accounting';
import { getPartyOptions } from '@/features/accounting/lib/accounting-service';
import { requireSession } from '@/features/auth/lib/session';
import { isApiError } from '@/lib/api';

import { getEventAccess } from '../../lib/event-access';
import { getCosting, getCostingHistory } from '../../lib/costing-service';

import { CostingEditorScreen } from './costing-editor-screen';

interface CostingEditorFeatureProps {
  costingId: number;
}

export async function CostingEditorFeature({ costingId }: CostingEditorFeatureProps) {
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

  const [accounts, parties, history] = await Promise.all([
    getAccounts(),
    getPartyOptions(),
    getCostingHistory(costingId),
  ]);

  // Only postable heads: grouping heads can't carry entries.
  const expenseAccounts = accounts
    .filter(
      (account) =>
        account.type === 'expense' && account.isPostable && account.isActive,
    )
    .map(({ id, code, name }) => ({ id, code, name }));

  return (
    <PageShell>
      <CostingEditorScreen
        costing={costing}
        expenseAccounts={expenseAccounts}
        parties={[...parties]}
        history={[...history]}
        canManage={access.canManageCostings}
      />
    </PageShell>
  );
}
