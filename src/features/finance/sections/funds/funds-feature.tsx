import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getFinanceAccess } from '../../lib/finance-access';
import { getFundDetails } from '../../lib/finance-service';

import { FundsScreen } from './funds-screen';

export async function FundsFeature() {
  const { permissions } = await requireSession();
  const access = getFinanceAccess(permissions);

  if (!access.canViewFunds) {
    return (
      <PageShell>
        <AccessDenied description="Fund management is limited to administrators and accountants." />
      </PageShell>
    );
  }

  const [
    initialDetails,
  ] = await Promise.all([
    getFundDetails(),
  ]);

  return (
    <PageShell>
      <FundsScreen
        initialDetails={initialDetails}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
