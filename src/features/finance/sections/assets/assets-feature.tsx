import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getFinanceAccess } from '../../lib/finance-access';
import {
  getAssetCategoryTotals,
  getAssetRecords,
  getFundRecords,
} from '../../lib/finance-service';

import { AssetsScreen } from './assets-screen';

/**
 * Assets boundary.
 *
 * Capitalising and depreciating an asset is bookkeeping, so an accountant
 * holds `asset:manage`. Disposal is not — it parts the temple from something
 * it owns — so `asset:dispose` stays with the admin and the register hides
 * that one action rather than the whole screen.
 */
export async function AssetsFeature() {
  const user = await getCurrentUser();
  const access = getFinanceAccess(user.role);

  if (!access.canViewAssets) {
    return (
      <PageShell>
        <AccessDenied description="The asset register is limited to administrators and accountants." />
      </PageShell>
    );
  }

  const today = getToday();

  return (
    <PageShell>
      <AssetsScreen
        initialAssets={getAssetRecords(today)}
        categoryTotals={getAssetCategoryTotals(today)}
        funds={getFundRecords()}
        access={access}
        today={today}
        year={getActiveYear(today)}
      />
    </PageShell>
  );
}
