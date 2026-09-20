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
        <AccessDenied description="Pooja costings are visible to the accountant and the cashier." />
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

  /*
   * Only postable expense heads. A grouping head totals its children and can
   * never carry an entry, so offering one here would move the refusal from the
   * form to the save — and the itemisation under a line is where the detail
   * belongs anyway, not in a deeper chart of accounts.
   */
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
