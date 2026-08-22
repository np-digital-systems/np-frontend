import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getFinanceAccess } from '../../lib/finance-access';
import { getFundDetails } from '../../lib/finance-service';

import { FundsScreen } from './funds-screen';

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
