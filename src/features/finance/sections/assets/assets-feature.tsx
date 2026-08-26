import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getFinanceAccess } from '../../lib/finance-access';
import {
  getAssetCategoryTotals,
  getAssetRecords,
  getFundRecords,
} from '../../lib/finance-service';

import { AssetsScreen } from './assets-screen';

export async function AssetsFeature() {
  const { permissions } = await requireSession();
  const access = getFinanceAccess(permissions);

  if (!access.canViewAssets) {
    return (
      <PageShell>
        <AccessDenied description="The asset register is limited to administrators and accountants." />
      </PageShell>
    );
  }

  const today = getToday();

  const [
    initialAssets,
    categoryTotals,
    funds,
  ] = await Promise.all([
    getAssetRecords(),
    getAssetCategoryTotals(),
    getFundRecords(),
  ]);

  return (
    <PageShell>
      <AssetsScreen
        initialAssets={initialAssets}
        categoryTotals={categoryTotals}
        funds={funds}
        access={access}
        today={today}
        year={getActiveYear(today)}
      />
    </PageShell>
  );
}
