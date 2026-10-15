import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import { getVouchers } from '../../lib/accounting-service';

import { ApprovalsScreen } from './approvals-screen';

export async function ApprovalsFeature() {
  const { user, permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canApprove) {
    return (
      <PageShell>
        <AccessDenied description="Only administrators and accountants have access." />
      </PageShell>
    );
  }

  // Cancelled entries never need a decision, so they're excluded.
  const vouchers = (await getVouchers()).filter(
    (voucher) => voucher.status !== 'Cancelled' && voucher.status !== 'Draft',
  );

  return (
    <PageShell>
      <ApprovalsScreen
        initialVouchers={vouchers}
        access={access}
        user={user}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
