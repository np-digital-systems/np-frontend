import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getFinanceAccess } from '../../lib/finance-access';
import { getFundDetails } from '../../lib/finance-service';

import { FundsScreen } from './funds-screen';

/**
 * Funds boundary.
 *
 * `fund:view` is the capability that says a role is trusted with the
 * temple's overall position rather than just its own day's work — the same
 * gate the accounting overview uses, so the two screens agree on who may see
 * where the money sits.
 */
export async function FundsFeature() {
  const user = await getCurrentUser();
  const access = getFinanceAccess(user.role);

  if (!access.canViewFunds) {
    return (
      <PageShell>
        <AccessDenied description="Fund management is limited to administrators and accountants." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <FundsScreen
        initialDetails={getFundDetails()}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
