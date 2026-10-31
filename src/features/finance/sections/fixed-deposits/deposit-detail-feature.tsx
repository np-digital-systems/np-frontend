import { PiggyBank } from 'lucide-react';

import { AccessDenied, EmptyState, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';

import { getFinanceAccess } from '../../lib/finance-access';
import {
  getDepositInterestByYear,
  getDepositRecord,
  getDepositVouchers,
} from '../../lib/finance-service';

import { DepositDetailScreen } from './deposit-detail-screen';

interface DepositDetailFeatureProps {
  depositId: number;
}

export async function DepositDetailFeature({ depositId }: DepositDetailFeatureProps) {
  const { permissions } = await requireSession();
  const access = getFinanceAccess(permissions);

  if (!access.canViewDeposits) {
    return (
      <PageShell>
        <AccessDenied description="Only administrators and accountants have access." />
      </PageShell>
    );
  }

  const deposit = Number.isInteger(depositId) ? await getDepositRecord(depositId) : null;

  if (!deposit) {
    return (
      <PageShell>
        <EmptyState icon={PiggyBank} title="This fixed deposit was not found" />
      </PageShell>
    );
  }

  const [vouchers, interest] = await Promise.all([
    getDepositVouchers(deposit.id),
    getDepositInterestByYear(deposit.id),
  ]);

  return (
    <PageShell>
      <DepositDetailScreen deposit={deposit} vouchers={vouchers} interest={interest} />
    </PageShell>
  );
}
